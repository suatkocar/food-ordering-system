import db from "../models/db.js";
import {
  updateDynamicPrice,
  updatePopularProducts,
} from "./pricingController.js";
import { updateMenuRankings } from "./menuController.js";
import path from "path";
import fs from "fs";
import config from "../config/index.js";
import { getWebSocketServer, broadcast } from "../middleware/websocket.js";

const imageCache = new Map();
function cacheProductImages() {
  const productImagesDir = path.join(config.paths.images, "products");
  fs.readdirSync(productImagesDir).forEach((file) => {
    const [productId, name] = file.split("_");
    if (productId && name) {
      imageCache.set(
        productId,
        `${config.baseUrl}/assets/images/products/${file}`
      );
    }
  });
}

cacheProductImages();

function getProductImagePath(productId) {
  return (
    imageCache.get(productId) ||
    `${config.baseUrl}/assets/images/products/default.png`
  );
}

export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const search = req.query.search || "";
    const offset = (page - 1) * pageSize;

    let searchQuery = `
      SELECT DISTINCT o.OrderID
      FROM Orders o
      LEFT JOIN Customers c ON o.CustomerID = c.CustomerID
      WHERE o.OrderID LIKE ? 
         OR c.Name LIKE ? 
         OR o.OrderStatus LIKE ? 
         OR o.CustomerID LIKE ?
    `;
    let searchParams = [
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
    ];

    if (search) {
      const [productOrders] = await db.query(
        `
        SELECT DISTINCT od.OrderID 
        FROM OrderDetails od
        JOIN Products p ON od.ProductID = p.ProductID
        WHERE p.Name LIKE ?
      `,
        [`%${search}%`]
      );

      if (productOrders.length > 0) {
        const productOrderIds = productOrders.map((po) => po.OrderID);
        searchQuery += ` OR o.OrderID IN (?)`;
        searchParams.push(productOrderIds);
      }
    }

    const [searchResults] = await db.query(searchQuery, searchParams);
    const orderIds = searchResults.map((result) => result.OrderID);

    if (orderIds.length === 0) {
      return res.status(200).json({
        items: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      });
    }

    const total = orderIds.length;

    const [orders] = await db.query(
      `
      SELECT 
        o.OrderID, 
        o.CustomerID, 
        c.Name as CustomerName,
        DATE_FORMAT(o.OrderDate, '%d/%m/%Y') as OrderDate,
        TIME(o.OrderDate) as OrderTime,
        o.OrderStatus,
        COALESCE(SUM(od.TotalPrice), 0) AS Total
      FROM Orders o
      LEFT JOIN Customers c ON o.CustomerID = c.CustomerID
      LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
      WHERE o.OrderID IN (?)
      GROUP BY o.OrderID, o.CustomerID, c.Name, o.OrderDate, o.OrderStatus
      ORDER BY o.OrderDate DESC, TIME(o.OrderDate) DESC
      LIMIT ? OFFSET ?
    `,
      [orderIds, pageSize, offset]
    );

    const [orderDetails] = await db.query(
      `
      SELECT 
        od.OrderID,
        GROUP_CONCAT(CONCAT(p.Name, ' (', od.Quantity, ' x £', FORMAT(p.DynamicPrice, 2), ')') SEPARATOR ', ') AS OrderDetails,
        GROUP_CONCAT(p.ProductID) AS ProductIDs
      FROM OrderDetails od
      JOIN Products p ON od.ProductID = p.ProductID
      WHERE od.OrderID IN (?)
      GROUP BY od.OrderID
    `,
      [orders.map((o) => o.OrderID)]
    );

    const processedResults = orders.map((order) => {
      const details =
        orderDetails.find((od) => od.OrderID === order.OrderID) || {};
      const productIds = details.ProductIDs
        ? details.ProductIDs.split(",")
        : [];
      return {
        ...order,
        ...details,
        ProductImages: productIds.map(getProductImagePath),
      };
    });

    res.status(200).json({
      items: processedResults,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("Error in getAllOrders:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};

export const createOrder = async (req, res) => {
  let orderId;
  try {
    console.log("Create order request received");
    console.log("Request user:", req.user);

    if (!req.user || !req.user.id) {
      console.error("User ID is missing or invalid in request");
      return res
        .status(400)
        .json({ message: "User authentication failed. User ID is missing." });
    }

    const { orderItems, orderDate } = req.body;
    const dateToUse = orderDate || new Date();

    console.log("Starting order creation process");
    const userID = req.user.id;
    console.log("User ID:", userID);

    const [session] = await db.query(
      "SELECT * FROM ShoppingSession WHERE UserID = ? ORDER BY CreatedAt DESC LIMIT 1",
      [userID]
    );
    console.log("Session fetched:", session);

    if (session.length === 0) {
      console.error("No active shopping session found for user:", userID);
      return res
        .status(400)
        .json({ message: "No active shopping session found" });
    }

    const sessionID = session[0].SessionID;
    console.log("Session ID:", sessionID);

    for (const item of orderItems) {
      const { productId, quantity } = item;
      const [stockResult] = await db.query(
        "SELECT StockLevel FROM InventoryStatus WHERE ProductID = ?",
        [productId]
      );
      const stockLevel = stockResult[0]?.StockLevel || 0;

      if (stockLevel < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ID: ${productId}`,
        });
      }
    }

    const [orderResult] = await db.query(
      "INSERT INTO Orders (CustomerID, OrderDate, OrderStatus) VALUES (?, ?, 'Pending')",
      [userID, dateToUse]
    );
    orderId = orderResult.insertId;
    console.log("Order created with ID:", orderId);

    for (const item of orderItems) {
      const { productId, quantity } = item;
      console.log(
        `Processing item: productId=${productId}, quantity=${quantity}`
      );

      const [productResult] = await db.query(
        "SELECT DynamicPrice, Name FROM Products WHERE ProductID = ?",
        [productId]
      );
      const productPrice = productResult[0].DynamicPrice;
      const productName = productResult[0].Name;
      const totalPrice = productPrice * quantity;

      await db.query(
        "INSERT INTO OrderDetails (OrderID, ProductID, Quantity, TotalPrice) VALUES (?, ?, ?, ?)",
        [orderId, productId, quantity, totalPrice]
      );
      console.log(
        `OrderDetail inserted: productId=${productId}, totalPrice=${totalPrice}`
      );

      await db.query(
        "UPDATE InventoryStatus SET StockLevel = StockLevel - ? WHERE ProductID = ?",
        [quantity, productId]
      );
      console.log(
        `InventoryStatus updated: productId=${productId}, reduced by ${quantity}`
      );

      const currentHour = new Date().getHours();
      await db.query(
        "INSERT INTO OrderPatterns (ProductID, OrderHour, OrderCount) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE OrderCount = OrderCount + ?",
        [productId, currentHour, quantity, quantity]
      );
      console.log(
        `OrderPattern inserted/updated: productId=${productId}, quantity=${quantity}`
      );

      await db.query(
        "INSERT INTO PopularProducts (ProductID, PopularityScore) VALUES (?, ?) ON DUPLICATE KEY UPDATE PopularityScore = PopularityScore + ?",
        [productId, quantity, quantity]
      );
      console.log(
        `Popularity score updated: productId=${productId}, increment=${quantity}`
      );
    }

    await db.query(
      "UPDATE ShoppingSession SET Total = (SELECT SUM(TotalPrice) FROM OrderDetails WHERE OrderID = ?), ModifiedAt = CURRENT_TIMESTAMP WHERE SessionID = ?",
      [orderId, sessionID]
    );
    console.log("Shopping session updated for session ID:", sessionID);

    await updatePopularProducts();
    console.log("Popular products updated");

    await updateDynamicPrice();
    console.log("Dynamic prices updated");

    const updatedProducts = await updateMenuRankings();
    console.log("Menu rankings updated");

    await db.query("DELETE FROM CartItem WHERE SessionID = ?", [sessionID]);
    console.log(`Cart items removed for sessionId=${sessionID}`);

    const [createdOrder] = await db.query(
      `
      SELECT 
        o.OrderID, 
        o.CustomerID, 
        c.Name as CustomerName,
        DATE_FORMAT(o.OrderDate, '%d/%m/%Y') as OrderDate,
        TIME(o.OrderDate) as OrderTime,
        o.OrderStatus,
        COALESCE(SUM(od.TotalPrice), 0) AS Total,
        GROUP_CONCAT(CONCAT(p.Name, ' (', od.Quantity, ' x £', FORMAT(p.DynamicPrice, 2), ')') SEPARATOR ', ') AS OrderDetails,
        GROUP_CONCAT(p.ProductID) AS ProductIDs
      FROM Orders o
      LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
      LEFT JOIN Products p ON od.ProductID = p.ProductID
      LEFT JOIN Customers c ON o.CustomerID = c.CustomerID
      WHERE o.OrderID = ?
      GROUP BY o.OrderID, o.CustomerID, c.Name, o.OrderDate, o.OrderStatus
    `,
      [orderId]
    );

    const productIds = createdOrder[0].ProductIDs.split(",");

    const [productImages] = await db.query(
      `
      SELECT 
        p.ProductID,
        p.Name
      FROM Products p
      WHERE p.ProductID IN (?)
    `,
      [productIds]
    );

    const imageMap = {};

    productImages.forEach((product) => {
      const baseFileName = `${product.ProductID}_${encodeURIComponent(product.Name.replace(/ /g, "_"))}`;
      const webpFileName = `${baseFileName}.webp`;
      const pngFileName = `${baseFileName}.png`;

      const webpFilePath = path.join(
        config.paths.images,
        "products",
        webpFileName
      );
      const pngFilePath = path.join(
        config.paths.images,
        "products",
        pngFileName
      );

      let imagePath = `${config.baseUrl}/assets/images/products/default.png`;

      if (fs.existsSync(webpFilePath)) {
        imagePath = `${config.baseUrl}/assets/images/products/${webpFileName}`;
      } else if (fs.existsSync(pngFilePath)) {
        imagePath = `${config.baseUrl}/assets/images/products/${pngFileName}`;
      }

      imageMap[product.ProductID] = imagePath;
    });

    const processedOrder = {
      ...createdOrder[0],
      ProductImages: createdOrder[0].ProductIDs.split(",").map(
        (id) =>
          imageMap[id] || `${config.baseUrl}/assets/images/products/default.png`
      ),
    };

    const wss = getWebSocketServer();
    broadcast(wss, {
      type: "new-order",
      data: {
        order: processedOrder,
        updatedProducts,
      },
    });

    res.status(201).json({
      ...processedOrder,
      OrderID: orderId,
    });
  } catch (err) {
    console.error("Error during order creation:", err.message);
    if (orderId) {
      await db.query("DELETE FROM Orders WHERE OrderID = ?", [orderId]);
      await db.query("DELETE FROM OrderDetails WHERE OrderID = ?", [orderId]);
    }
    res.status(500).json({ error: err.message });
  }
};

export const updateOrder = async (req, res, id, wss) => {
  const { CustomerID, OrderDate, OrderTime, OrderStatus } = req.body;

  try {
    const [existingOrder] = await db.query(
      "SELECT * FROM Orders WHERE OrderID = ?",
      [id]
    );

    if (existingOrder.length === 0) {
      return null;
    }

    const currentOrder = existingOrder[0];

    const updates = {};
    if (CustomerID !== undefined) updates.CustomerID = CustomerID;
    if (OrderStatus !== undefined) updates.OrderStatus = OrderStatus;

    if (OrderDate !== undefined || OrderTime !== undefined) {
      const currentDate = new Date(currentOrder.OrderDate);
      const newDate = OrderDate ? new Date(OrderDate) : currentDate;
      const newTime = OrderTime
        ? OrderTime.split(":")
        : [
            currentDate.getHours(),
            currentDate.getMinutes(),
            currentDate.getSeconds(),
          ];

      newDate.setHours(newTime[0], newTime[1], newTime[2] || 0);
      updates.OrderDate = newDate;
    }

    if (Object.keys(updates).length === 0) {
      return currentOrder;
    }

    const setQuery = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(updates), id];

    const [results] = await db.query(
      `UPDATE Orders SET ${setQuery} WHERE OrderID = ?`,
      values
    );

    if (results.affectedRows === 0) {
      return null;
    }

    const [updatedOrder] = await db.query(
      `
      SELECT 
        o.OrderID, 
        o.CustomerID, 
        c.Name as CustomerName,
        DATE_FORMAT(o.OrderDate, '%Y-%m-%d') as OrderDate,
        TIME_FORMAT(o.OrderDate, '%H:%i') as OrderTime,
        o.OrderStatus,
        COALESCE(SUM(od.TotalPrice), 0) AS Total,
        GROUP_CONCAT(CONCAT(p.Name, ' (', od.Quantity, ' x £', FORMAT(p.DynamicPrice, 2), ')') SEPARATOR ', ') AS OrderDetails
      FROM Orders o
      LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
      LEFT JOIN Products p ON od.ProductID = p.ProductID
      LEFT JOIN Customers c ON o.CustomerID = c.CustomerID
      WHERE o.OrderID = ?
      GROUP BY o.OrderID, o.CustomerID, c.Name, o.OrderDate, o.OrderStatus
    `,
      [id]
    );

    const wss = getWebSocketServer();
    broadcast(wss, {
      type: "order-update",
      data: updatedOrder[0],
    });

    return updatedOrder[0];
  } catch (err) {
    console.error("Error in updateOrder:", err);
    throw err;
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const [orderDetails] = await db.query(
      "SELECT * FROM OrderDetails WHERE OrderID = ?",
      [id]
    );
    console.log(`Order details fetched for order ID: ${id}`);

    for (const item of orderDetails) {
      await db.query(
        "UPDATE InventoryStatus SET StockLevel = StockLevel + ? WHERE ProductID = ?",
        [item.Quantity, item.ProductID]
      );
      console.log(
        `InventoryStatus updated: productId=${item.ProductID}, restored by ${item.Quantity}`
      );
    }

    await db.query(
      "DELETE FROM OrderPatterns WHERE ProductID IN (SELECT ProductID FROM OrderDetails WHERE OrderID = ?)",
      [id]
    );
    console.log(`OrderPatterns records deleted for order ID: ${id}`);

    await db.query("DELETE FROM OrderDetails WHERE OrderID = ?", [id]);
    console.log(`OrderDetails records deleted for order ID: ${id}`);

    await db.query("DELETE FROM Orders WHERE OrderID = ?", [id]);
    console.log(`Order deleted from Orders table with order ID: ${id}`);

    await updatePopularProducts();
    console.log("Popular products updated");

    await updateDynamicPrice();
    console.log("Dynamic prices updated");

    await updateMenuRankings();
    console.log("Menu rankings updated");

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error during order deletion:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentID, status } = req.body;

    const validStatuses = ["Pending", "Completed", "Failed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    await db.query(
      "UPDATE PaymentDetails SET PaymentStatus = ? WHERE PaymentID = ?",
      [status, paymentID]
    );

    res.status(200).json({ message: "Payment status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const { id: userID } = req.user;

    const [orders] = await db.query(
      "SELECT * FROM Orders WHERE CustomerID = ? ORDER BY OrderDate DESC",
      [userID]
    );

    const orderHistory = await Promise.all(
      orders.map(async (order) => {
        const [details] = await db.query(
          "SELECT * FROM OrderDetails WHERE OrderID = ?",
          [order.OrderID]
        );
        return {
          ...order,
          items: details,
        };
      })
    );

    res.status(200).json(orderHistory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCustomerOrders = async (req, res) => {
  const { id: customerId } = req.user;
  try {
    const query = `
      SELECT 
        o.OrderID, 
        o.CustomerID, 
        c.Name as CustomerName,
        DATE_FORMAT(o.OrderDate, '%d/%m/%Y') as OrderDate,
        TIME(o.OrderDate) as OrderTime,
        o.OrderStatus,
        COALESCE(CAST(SUM(od.TotalPrice) AS DECIMAL(10,2)), 0) AS Total,
        GROUP_CONCAT(CONCAT(p.Name, ' (', od.Quantity, ' x £', FORMAT(p.DynamicPrice, 2), ')') SEPARATOR ', ') AS OrderDetails,
        GROUP_CONCAT(p.ProductID) AS ProductIDs
      FROM Orders o
      LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
      LEFT JOIN Products p ON od.ProductID = p.ProductID
      LEFT JOIN Customers c ON o.CustomerID = c.CustomerID
      WHERE o.CustomerID = ?
      GROUP BY o.OrderID
      ORDER BY o.OrderDate DESC, TIME(o.OrderDate) DESC
    `;

    const [results] = await db.query(query, [customerId]);

    const productIds = results
      .map((order) => order.ProductIDs.split(","))
      .flat();

    const [productImages] = await db.query(
      `
      SELECT 
        p.ProductID,
        p.Name
      FROM Products p
      WHERE p.ProductID IN (?)
    `,
      [productIds]
    );

    const imageMap = {};

    productImages.forEach((product) => {
      const baseFileName = `${product.ProductID}_${encodeURIComponent(product.Name.replace(/ /g, "_"))}`;
      const webpFileName = `${baseFileName}.webp`;
      const pngFileName = `${baseFileName}.png`;

      const webpFilePath = path.join(
        config.paths.images,
        "products",
        webpFileName
      );
      const pngFilePath = path.join(
        config.paths.images,
        "products",
        pngFileName
      );

      let imagePath = `${config.baseUrl}/assets/images/products/default.png`;

      if (fs.existsSync(webpFilePath)) {
        imagePath = `${config.baseUrl}/assets/images/products/${webpFileName}`;
      } else if (fs.existsSync(pngFilePath)) {
        imagePath = `${config.baseUrl}/assets/images/products/${pngFileName}`;
      }

      imageMap[product.ProductID] = imagePath;
    });

    const processedResults = results.map((order) => ({
      ...order,
      ProductImages: order.ProductIDs.split(",").map(
        (id) =>
          imageMap[id] || `${config.baseUrl}/assets/images/products/default.png`
      ),
    }));

    res.status(200).json(processedResults);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
