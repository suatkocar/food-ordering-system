import path from "path";
import fs from "fs";
import db from "../models/db.js";
import config from "../config/index.js";

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const search = req.query.search || "";
    const offset = (page - 1) * pageSize;

    let countQuery = "SELECT COUNT(*) as total FROM Products";
    let params = [];

    if (search) {
      countQuery += " WHERE ProductID LIKE ? OR Name LIKE ? OR Category LIKE ?";
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    let query = `
      SELECT 
        p.ProductID,
        p.Name, 
        p.Category, 
        p.Cost, 
        p.Price, 
        p.DynamicPrice,
        (p.DynamicPrice - p.Cost) AS Profit, 
        p.Ranking, 
        DATE_FORMAT(p.LastUpdated, '%d/%m/%Y') AS LastUpdated,
        i.StockLevel
      FROM Products p
      LEFT JOIN InventoryStatus i ON p.ProductID = i.ProductID
    `;

    if (search) {
      query +=
        " WHERE p.ProductID LIKE ? OR p.Name LIKE ? OR p.Category LIKE ?";
    }

    query += " ORDER BY p.ProductID LIMIT ? OFFSET ?";
    params = search ? [...params, pageSize, offset] : [pageSize, offset];

    const [results] = await db.query(query, params);

    const processedProducts = results.map((product) => {
      const baseFileName = `${product.ProductID}_${encodeURIComponent(product.Name.replace(/ /g, "_"))}`;

      const webpFilePath = path.join(
        config.paths.images,
        "products",
        `${baseFileName}.webp`
      );
      const pngFilePath = path.join(
        config.paths.images,
        "products",
        `${baseFileName}.png`
      );

      let imagePath = `${config.baseUrl}/assets/images/products/default.png`;

      if (fs.existsSync(webpFilePath)) {
        imagePath = `${config.baseUrl}/assets/images/products/${baseFileName}.webp`;
      } else if (fs.existsSync(pngFilePath)) {
        imagePath = `${config.baseUrl}/assets/images/products/${baseFileName}.png`;
      }

      return {
        ...product,
        imagePath,
      };
    });

    res.status(200).json({
      items: processedProducts,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  const {
    ProductID,
    Name,
    Category,
    Cost,
    Price,
    DynamicPrice,
    Ranking,
    StockLevel,
  } = req.body;
  console.log("Received data:", {
    ProductID,
    Name,
    Category,
    Cost,
    Price,
    DynamicPrice,
    Ranking,
    StockLevel,
  });

  if (ProductID) {
    try {
      const updates = {};
      if (Name !== undefined) updates.Name = Name;
      if (Category !== undefined) updates.Category = Category;
      if (Cost !== undefined) updates.Cost = Cost;
      if (Price !== undefined) updates.Price = Price;
      if (DynamicPrice !== undefined) updates.DynamicPrice = DynamicPrice;
      if (Ranking !== undefined) updates.Ranking = Ranking;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      const setQuery = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = [...Object.values(updates), ProductID];

      const [results] = await db.query(
        `UPDATE Products SET ${setQuery}, LastUpdated = NOW() WHERE ProductID = ?`,
        values
      );

      if (results.affectedRows === 0) {
        console.warn(`No product found with ID: ${ProductID}`);
        return res.status(404).json({ message: "Product not found" });
      }

      if (StockLevel !== undefined) {
        await db.query(
          "UPDATE InventoryStatus SET StockLevel = ? WHERE ProductID = ?",
          [StockLevel, ProductID]
        );
      }

      const [updatedProduct] = await db.query(
        `SELECT 
          p.ProductID,
          p.Name, 
          p.Category, 
          p.Cost, 
          p.Price, 
          p.DynamicPrice,
          (p.DynamicPrice - p.Cost) AS Profit, 
          p.Ranking, 
          DATE_FORMAT(p.LastUpdated, '%d/%m/%Y') AS LastUpdated,
          i.StockLevel
        FROM Products p
        LEFT JOIN InventoryStatus i ON p.ProductID = i.ProductID
        WHERE p.ProductID = ?`,
        [ProductID]
      );

      console.log(`Product with ID: ${ProductID} updated successfully.`);

      res.status(200).json(updatedProduct[0]);
    } catch (err) {
      console.error("Error updating product:", err.message);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(400).json({ error: "ProductID is required for updates" });
  }
};

export const uploadProductImage = (req, res) => {
  const { ProductID, Name } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  const baseFileName = `${ProductID}_${encodeURIComponent(Name.replace(/ /g, "_"))}`;
  const newFileName = `${baseFileName}${fileExtension}`;
  const newFilePath = path.join(config.paths.images, "products", newFileName);

  fs.rename(req.file.path, newFilePath, (err) => {
    if (err) {
      console.error("Error renaming file:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res
      .status(200)
      .json({ message: "File uploaded successfully", filePath: newFilePath });
  });
};

export const createProduct = async (req, res) => {
  const { Name, Category, Cost, Price, DynamicPrice, Ranking, StockLevel } =
    req.body;
  console.log("Received data:", {
    Name,
    Category,
    Cost,
    Price,
    DynamicPrice,
    Ranking,
    StockLevel,
  });

  try {
    const [results] = await db.query(
      "INSERT INTO Products (Name, Category, Cost, Price, DynamicPrice, Ranking) VALUES (?, ?, ?, ?, ?, ?)",
      [Name, Category, Cost, Price, DynamicPrice, Ranking]
    );

    const newProductId = results.insertId;

    if (StockLevel !== undefined) {
      await db.query(
        "INSERT INTO InventoryStatus (ProductID, StockLevel) VALUES (?, ?)",
        [newProductId, StockLevel]
      );
    }

    if (DynamicPrice !== undefined) {
      await db.query(
        "INSERT INTO DynamicPricing (ProductID, CurrentPrice, LastUpdated) VALUES (?, ?, NOW())",
        [newProductId, DynamicPrice]
      );
    }

    await db.query(
      "INSERT INTO PopularProducts (ProductID, PopularityScore) VALUES (?, 0)",
      [newProductId]
    );

    await db.query(
      "INSERT INTO OrderPatterns (ProductID, OrderHour, OrderCount) VALUES (?, 0, 0)",
      [newProductId]
    );

    await db.query(
      "INSERT INTO ProductOrders (ProductID, OrderHour, OrderDayOfWeek, Season, OrderCount) VALUES (?, 0, 0, 'Unknown', 0)",
      [newProductId]
    );

    const [newProduct] = await db.query(
      `SELECT 
         p.ProductID,
         p.Name, 
         p.Category, 
         p.Cost, 
         p.Price, 
         p.DynamicPrice,
         (p.DynamicPrice - p.Cost) AS Profit, 
         p.Ranking, 
         DATE_FORMAT(p.LastUpdated, '%d/%m/%Y') AS LastUpdated,
         i.StockLevel
       FROM Products p
       LEFT JOIN InventoryStatus i ON p.ProductID = i.ProductID
       WHERE p.ProductID = ?`,
      [newProductId]
    );

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM DynamicPricing WHERE ProductID = ?", [id]);
    await db.query("DELETE FROM InventoryStatus WHERE ProductID = ?", [id]);
    await db.query("DELETE FROM PopularProducts WHERE ProductID = ?", [id]);
    await db.query("DELETE FROM Promotions WHERE ProductID = ?", [id]);
    await db.query("DELETE FROM OrderDetails WHERE ProductID = ?", [id]);
    await db.query("DELETE FROM OrderPatterns WHERE ProductID = ?", [id]);
    await db.query("DELETE FROM ProductOrders WHERE ProductID = ?", [id]);

    await db.query("DELETE FROM Products WHERE ProductID = ?", [id]);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getProductsByRankingAndPromotion = async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT 
        p.ProductID, 
        p.Name, 
        p.Price, 
        p.DynamicPrice,
        p.Category,
        p.Ranking,
        p.Cost,
        p.LastUpdated,
        COALESCE(pp.PopularityScore, 0) AS PopularityScore,
        sp.PromotionID IS NOT NULL AS isPromotion,
        sp.DiscountPercentage,
        i.StockLevel
      FROM 
        Products p
      LEFT JOIN 
        PopularProducts pp ON p.ProductID = pp.ProductID
      LEFT JOIN 
        Promotions sp ON p.ProductID = sp.ProductID
      LEFT JOIN 
        InventoryStatus i ON p.ProductID = i.ProductID
      ORDER BY 
        p.Ranking ASC;
    `);

    const mostPopularLimit = 6;
    const popularLimit = 15;

    const processedProducts = products.map((product, index) => {
      const isMostPopular = index < mostPopularLimit;
      const isPopular = index >= mostPopularLimit && index < popularLimit;

      const baseFileName = `${product.ProductID}_${encodeURIComponent(product.Name.replace(/ /g, "_"))}`;

      const webpFilePath = path.join(
        config.paths.images,
        "products",
        `${baseFileName}.webp`
      );
      const pngFilePath = path.join(
        config.paths.images,
        "products",
        `${baseFileName}.png`
      );

      let imagePath = `${config.baseUrl}/assets/images/products/default.png`;

      if (fs.existsSync(webpFilePath)) {
        imagePath = `${config.baseUrl}/assets/images/products/${baseFileName}.webp`;
      } else if (fs.existsSync(pngFilePath)) {
        imagePath = `${config.baseUrl}/assets/images/products/${baseFileName}.png`;
      } else {
        console.log(
          `Neither WEBP nor PNG file found for ${baseFileName}. Using default image.`
        );
      }

      return {
        ...product,
        imagePath,
        isMostPopular,
        isPopular,
        isPromotion: !!product.isPromotion,
        StockLevel: product.StockLevel,
      };
    });

    res
      .status(200)
      .json(processedProducts.sort((a, b) => a.Ranking - b.Ranking));
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
