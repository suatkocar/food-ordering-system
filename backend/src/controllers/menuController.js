import db from "../models/db.js";
import config from "../config/index.js";
import path from "path";
import fs from "fs";

export const updateMenuRankings = async () => {
  try {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();
    const currentMonth = new Date().getMonth() + 1;
    const season =
      currentMonth <= 2 || currentMonth === 12
        ? "Winter"
        : currentMonth <= 5
          ? "Spring"
          : currentMonth <= 8
            ? "Summer"
            : "Fall";

    console.log(`\n--- Calculating Menu Rankings ---`);
    console.log(`Hour: ${currentHour}, Day: ${currentDay}, Season: ${season}`);

    const [hourlyPopularity] = await db.query(
      `
        SELECT ProductID, SUM(OrderCount) AS TotalOrders
        FROM ProductOrders
        WHERE OrderHour = ? AND OrderDayOfWeek = ? AND Season = ?
        GROUP BY ProductID
        ORDER BY TotalOrders DESC
      `,
      [currentHour, currentDay, season]
    );

    const [generalPopularity] = await db.query(`
        SELECT ProductID, PopularityScore
        FROM PopularProducts
        ORDER BY PopularityScore DESC
    `);

    const [Promotions] = await db.query(`
        SELECT ProductID
        FROM Promotions
        WHERE StartDate <= CURDATE() AND EndDate >= CURDATE()
    `);

    const [lowInventory] = await db.query(`
        SELECT ProductID
        FROM InventoryStatus
        WHERE StockLevel <= 20
    `);

    const combinedPopularity = [
      ...hourlyPopularity,
      ...generalPopularity,
      ...Promotions,
    ].reduce((acc, product) => {
      if (!acc[product.ProductID]) {
        acc[product.ProductID] = {
          ProductID: product.ProductID,
          Score: 0,
          isHourlyPopular: false,
          isGenerallyPopular: false,
          isPromotion: false,
        };
      }
      acc[product.ProductID].Score +=
        parseFloat(product.TotalOrders || 0) +
        parseFloat(product.PopularityScore || 0);
      if (product.TotalOrders) acc[product.ProductID].isHourlyPopular = true;
      if (product.PopularityScore)
        acc[product.ProductID].isGenerallyPopular = true;
      if (Promotions.some((promo) => promo.ProductID === product.ProductID))
        acc[product.ProductID].isPromotion = true;

      return acc;
    }, {});

    const sortedProducts = Object.values(combinedPopularity).sort(
      (a, b) => b.Score - a.Score
    );

    const totalProducts = sortedProducts.length;
    const hourlyPopularCount = sortedProducts.filter(
      (p) => p.isHourlyPopular
    ).length;
    const generallyPopularCount = sortedProducts.filter(
      (p) => p.isGenerallyPopular
    ).length;
    const promotionCount = sortedProducts.filter((p) => p.isPromotion).length;
    const lowInventoryCount = lowInventory.length;
    const penaltyFactor = 0.05;

    let ranking = 1;
    for (let product of sortedProducts) {
      await db.query(
        `
          UPDATE Products 
          SET Ranking = ?
          WHERE ProductID = ?
        `,
        [ranking++, product.ProductID]
      );
    }

    for (let product of lowInventory) {
      const penalty = 1 - penaltyFactor;
      const [currentRanking] = await db.query(
        `
          SELECT Ranking FROM Products WHERE ProductID = ?
        `,
        [product.ProductID]
      );

      if (currentRanking.length > 0) {
        const newRanking = currentRanking[0].Ranking * penalty;
        await db.query(
          `
            UPDATE Products 
            SET Ranking = ?
            WHERE ProductID = ?
          `,
          [newRanking, product.ProductID]
        );
      }
    }

    console.log(`\n--- Menu Rankings Updated ---`);
    console.log(`Total Products Ranked: ${totalProducts}`);
    console.log(
      `Products affected by Hourly Popularity: ${hourlyPopularCount}`
    );
    console.log(
      `Products affected by General Popularity: ${generallyPopularCount}`
    );
    console.log(`Products affected by Promotions: ${promotionCount}`);
    console.log(`Products affected by Low Inventory: ${lowInventoryCount}`);
    console.log("---------------------------------");

    const [updatedProducts] = await db.query(`
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

    const processedProducts = updatedProducts.map((product, index) => {
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

    return processedProducts.sort((a, b) => a.Ranking - b.Ranking);
  } catch (err) {
    console.error("Error updating menu rankings:", err);
    throw err;
  }
};

export const getProductsByRanking = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT *
      FROM Products
      ORDER BY Ranking ASC;
    `);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductsWithPopularity = async (req, res) => {
  try {
    const [productsWithPopularity] = await db.query(`
      SELECT p.ProductID, p.Name, p.Price, pp.PopularityScore
      FROM Products p
      JOIN PopularProducts pp ON p.ProductID = pp.ProductID
      ORDER BY pp.PopularityScore DESC;
    `);

    res.status(200).json(productsWithPopularity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllPopularProducts = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM PopularProducts");
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query(`
      SELECT DISTINCT Category 
      FROM Products 
      ORDER BY FIELD(Category, 'Main Course', 'Side Dish', 'Appetizer', 'Dessert', 'Beverage');
    `);

    const allCategory = {
      Category: "All",
      ImagePath: `${config.baseUrl}/assets/images/categories/Category_All.webp`,
    };

    const categoriesWithImages = categories.map((category) => {
      const formattedCategoryName = category.Category.replace(/ /g, "_");
      const pngImagePath = path.join(
        config.paths.images,
        "categories",
        `Category_${formattedCategoryName}.png`
      );
      const webpImagePath = path.join(
        config.paths.images,
        "categories",
        `Category_${formattedCategoryName}.webp`
      );

      let imagePath;
      if (fs.existsSync(webpImagePath)) {
        imagePath = webpImagePath;
      } else if (fs.existsSync(pngImagePath)) {
        imagePath = pngImagePath;
      }

      const fullUrl = imagePath
        ? `${config.baseUrl}/assets/images/categories/${path.basename(imagePath)}`
        : null;

      return {
        Category: category.Category,
        ImagePath: fullUrl,
      };
    });

    res.status(200).json([allCategory, ...categoriesWithImages]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPopularProduct = async (req, res) => {
  const { productId, popularityScore } = req.body;
  try {
    const [results] = await db.query(
      "INSERT INTO PopularProducts (ProductID, PopularityScore) VALUES (?, ?) ON DUPLICATE KEY UPDATE PopularityScore = PopularityScore + ?",
      [productId, popularityScore, popularityScore]
    );

    if (results.affectedRows > 1) {
      return res
        .status(200)
        .json({ message: "Popular product updated successfully", productId });
    } else {
      return res.status(201).json({
        message: "Popular product created successfully",
        productId: results.insertId || productId,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePopularProduct = async (req, res) => {
  const { id } = req.params;
  const { popularityScore } = req.body;
  try {
    await db.query(
      "UPDATE PopularProducts SET PopularityScore = ? WHERE ProductID = ?",
      [popularityScore, id]
    );
    res.status(200).json({ message: "Popular product updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePopularProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM PopularProducts WHERE ProductID = ?", [id]);
    res.status(200).json({ message: "Popular product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
