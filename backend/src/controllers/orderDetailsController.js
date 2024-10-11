import db from "../models/db.js";

export const getAllOrderDetails = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM OrderDetails");
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createOrderDetail = async (req, res) => {
  const { orderId, productId, quantity, totalPrice } = req.body;
  try {
    const [orderExists] = await db.query(
      "SELECT * FROM Orders WHERE OrderID = ?",
      [orderId],
    );
    if (orderExists.length === 0) {
      return res.status(400).json({ error: "Invalid OrderID" });
    }

    const [productExists] = await db.query(
      "SELECT * FROM Products WHERE ProductID = ?",
      [productId],
    );
    if (productExists.length === 0) {
      return res.status(400).json({ error: "Invalid ProductID" });
    }

    const [results] = await db.query(
      "INSERT INTO OrderDetails (OrderID, ProductID, Quantity, TotalPrice) VALUES (?, ?, ?, ?)",
      [orderId, productId, quantity, totalPrice],
    );
    res.status(201).json({
      message: "Order detail created successfully",
      orderDetailId: results.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateOrderDetail = async (req, res) => {
  const { id } = req.params;
  const { orderId, productId, quantity, totalPrice } = req.body;
  try {
    await db.query(
      "UPDATE OrderDetails SET OrderID = ?, ProductID = ?, Quantity = ?, TotalPrice = ? WHERE OrderDetailID = ?",
      [orderId, productId, quantity, totalPrice, id],
    );
    res.status(200).json({ message: "Order detail updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteOrderDetail = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM OrderDetails WHERE OrderDetailID = ?", [id]);
    res.status(200).json({ message: "Order detail deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
