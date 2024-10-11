import db from "../models/db.js";
import config from "../config/index.js";
import fs from "fs";
import path from "path";

export const generateSessionID = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}${month}${year}${hours}${minutes}${seconds}`;
};

export const getUserID = (req) => {
  if (req.user && req.user.id) {
    console.log(`getUserID: User ID found: ${req.user.id}`);
    req.session.tempSessionID = req.user.id;
    return req.user.id;
  }

  if (!req.session.tempSessionID) {
    req.session.tempSessionID = generateSessionID();
    console.log(
      `getUserID: New tempSessionID created: ${req.session.tempSessionID}`
    );
  }

  console.log(
    `getUserID: Using tempSessionID: ${req.session.tempSessionID}`
  );
  return req.session.tempSessionID;
};

export const getCart = async (req, res) => {
  try {
    const userID = req.user ? req.user.id : getUserID(req);

    const [cartItems] = await db.query(
      `SELECT ci.*, p.Name, p.Price, p.DynamicPrice, i.StockLevel
       FROM CartItem ci
       JOIN Products p ON ci.ProductID = p.ProductID
       JOIN InventoryStatus i ON ci.ProductID = i.ProductID
       WHERE ci.SessionID = ?`,
      [userID]
    );

    if (cartItems.length === 0) {
      console.warn("No items found in the cart for session ID:", userID);
    }

    const processedCartItems = cartItems.map((item) => {
      if (!item.ProductID) {
        console.error("ProductID is missing in cart item:", item);
      }
      const baseFileName = `${item.ProductID}_${encodeURIComponent(
        item.Name.replace(/ /g, "_")
      )}`;

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
        ...item,
        imagePath,
      };
    });

    res.status(200).json(processedCartItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const userID = req.user ? req.user.id : null;
    const sessionID = getUserID(req);
    console.log(`addToCart: User ID: ${userID}, Session ID: ${sessionID}`);

    const [productStock] = await db.query(
      "SELECT StockLevel FROM InventoryStatus WHERE ProductID = ?",
      [productId]
    );

    if (productStock.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const stockLevel = productStock[0].StockLevel;

    const [sessionCheck] = await db.query(
      "SELECT * FROM ShoppingSession WHERE SessionID = ?",
      [sessionID]
    );

    if (sessionCheck.length === 0) {
      console.log(
        `addToCart: Creating new shopping session: ${sessionID}`
      );
      await db.query(
        "INSERT INTO ShoppingSession (SessionID, UserID, Total) VALUES (?, ?, 0)",
        [sessionID, userID]
      );
      console.log(`addToCart: Shopping session created: ${sessionID}`);
    } else if (userID && sessionCheck[0].UserID !== userID) {
      await db.query(
        "UPDATE ShoppingSession SET UserID = ? WHERE SessionID = ?",
        [userID, sessionID]
      );
      console.log(
        `addToCart: Shopping session updated: ${sessionID}, UserID: ${userID}`
      );
    }

    const [existingProduct] = await db.query(
      "SELECT * FROM CartItem WHERE SessionID = ? AND ProductID = ?",
      [sessionID, productId]
    );

    if (existingProduct.length > 0) {
      const newQuantity = existingProduct[0].Quantity + 1;
      if (newQuantity > stockLevel) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      await db.query(
        "UPDATE CartItem SET Quantity = ? WHERE SessionID = ? AND ProductID = ?",
        [newQuantity, sessionID, productId]
      );
      console.log(`addToCart: Existing product updated: ${productId}`);
    } else {
      const addQuantity = quantity > stockLevel ? stockLevel : quantity;
      await db.query(
        "INSERT INTO CartItem (SessionID, ProductID, Quantity) VALUES (?, ?, ?)",
        [sessionID, productId, addQuantity]
      );
      console.log(`addToCart: New product added to cart: ${productId}`);
    }

    res.status(200).json({ message: "Product added to cart" });
  } catch (err) {
    console.error("addToCart: An error occurred:", err.message);
    res
      .status(500)
      .json({ message: "Error adding product to cart", error: err.message });
  }
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  try {
    const userID = req.user ? req.user.id : getUserID(req);

    const [sessionCheck] = await db.query(
      "SELECT * FROM ShoppingSession WHERE SessionID = ?",
      [userID]
    );

    if (sessionCheck.length === 0) {
      return res.status(400).json({ message: "Session does not exist." });
    }

    const [existingProduct] = await db.query(
      "SELECT Quantity FROM CartItem WHERE SessionID = ? AND ProductID = ?",
      [userID, productId]
    );

    if (existingProduct.length > 0) {
      if (existingProduct[0].Quantity > 1) {
        await db.query(
          "UPDATE CartItem SET Quantity = Quantity - 1 WHERE SessionID = ? AND ProductID = ?",
          [userID, productId]
        );
      } else {
        await db.query(
          "DELETE FROM CartItem WHERE SessionID = ? AND ProductID = ?",
          [userID, productId]
        );
      }
      res
        .status(200)
        .json({ message: "Product quantity updated or removed from cart" });
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCartQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const userID = req.user ? req.user.id : getUserID(req);

    const [sessionCheck] = await db.query(
      "SELECT * FROM ShoppingSession WHERE SessionID = ?",
      [userID]
    );

    if (sessionCheck.length === 0) {
      return res.status(400).json({ message: "Session does not exist." });
    }

    const [existingProduct] = await db.query(
      "SELECT * FROM CartItem WHERE SessionID = ? AND ProductID = ?",
      [userID, productId]
    );

    if (existingProduct.length > 0) {
      if (quantity > 0) {
        await db.query(
          "UPDATE CartItem SET Quantity = ? WHERE SessionID = ? AND ProductID = ?",
          [quantity, userID, productId]
        );
        res.status(200).json({ message: "Cart updated successfully" });
      } else {
        await db.query(
          "DELETE FROM CartItem WHERE SessionID = ? AND ProductID = ?",
          [userID, productId]
        );
        res.status(200).json({ message: "Product removed from cart" });
      }
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userID = req.user ? req.user.id : getUserID(req);
    await db.query("DELETE FROM CartItem WHERE SessionID = ?", [userID]);
    res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const migrateCart = async (req) => {
  try {
    const { tempSessionID } = req.session;
    const userID = req.user.id;

    if (tempSessionID && tempSessionID !== String(userID)) {
      console.log(
        `migrateCart: Migration process started. tempSessionID: ${tempSessionID}, userID: ${userID}`
      );

      const [productsToMigrate] = await db.query(
        "SELECT * FROM CartItem WHERE SessionID = ?",
        [tempSessionID]
      );

      if (productsToMigrate.length > 0) {
        console.log(`migrateCart: Migrating ${productsToMigrate.length} products.`);

        const [existingSession] = await db.query(
          "SELECT * FROM ShoppingSession WHERE UserID = ?",
          [userID]
        );

        if (existingSession.length === 0) {
          await db.query(
            "INSERT INTO ShoppingSession (SessionID, UserID, Total) VALUES (?, ?, 0)",
            [userID, userID]
          );
          console.log(
            `migrateCart: New shopping session created. userID: ${userID}`
          );
        } else {
          await db.query(
            "UPDATE ShoppingSession SET SessionID = ? WHERE UserID = ?",
            [userID, userID]
          );
          console.log(
            `migrateCart: Existing shopping session updated. userID: ${userID}`
          );
        }

        for (let product of productsToMigrate) {
          const [existingProduct] = await db.query(
            "SELECT * FROM CartItem WHERE SessionID = ? AND ProductID = ?",
            [userID, product.ProductID]
          );

          if (existingProduct.length > 0) {
            const newQuantity = existingProduct[0].Quantity + product.Quantity;
            await db.query(
              "UPDATE CartItem SET Quantity = ? WHERE SessionID = ? AND ProductID = ?",
              [newQuantity, userID, product.ProductID]
            );
            console.log(
              `migrateCart: Product updated: ProductID: ${product.ProductID}, Quantity: ${newQuantity}`
            );
          } else {
            await db.query(
              "INSERT INTO CartItem (SessionID, ProductID, Quantity) VALUES (?, ?, ?)",
              [userID, product.ProductID, product.Quantity]
            );
            console.log(
              `migrateCart: Product added: ProductID: ${product.ProductID}, Quantity: ${product.Quantity}`
            );
          }
        }

        await db.query("DELETE FROM CartItem WHERE SessionID = ?", [
          tempSessionID,
        ]);
        console.log(
          `migrateCart: Products in temporary session deleted: ${tempSessionID}`
        );
      } else {
        console.log(`migrateCart: No products found to migrate: ${tempSessionID}`);
      }

      delete req.session.tempSessionID;
      req.session.tempSessionID = userID;
    } else {
      console.log(
        "migrateCart: No temporary session ID found to migrate or it is already the same as user ID."
      );
    }
  } catch (err) {
    console.error("migrateCart: An error occurred:", err.message);
    throw new Error(err.message);
  }
};
