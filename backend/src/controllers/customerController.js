import db from "../models/db.js";

export const getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const search = req.query.search || "";
    const offset = (page - 1) * pageSize;

    let query = "SELECT COUNT(*) as total FROM Customers";
    let params = [];

    if (search) {
      query += " WHERE Name LIKE ? OR Email LIKE ? OR Phone LIKE ?";
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    const [countResult] = await db.query(query, params);
    const total = countResult[0].total;

    query = `
      SELECT CustomerID, Name, Email, Address, Phone 
      FROM Customers
    `;

    if (search) {
      query += " WHERE Name LIKE ? OR Email LIKE ? OR Phone LIKE ?";
    }

    query += " ORDER BY CustomerID LIMIT ? OFFSET ?";
    params = search ? [...params, pageSize, offset] : [pageSize, offset];

    const [results] = await db.query(query, params);

    res.status(200).json({
      items: results,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query(
      "SELECT * FROM Customers WHERE CustomerID = ?",
      [id]
    );
    if (results.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { Name, Email, Address, Phone } = req.body;
  console.log("Received data:", { id, Name, Email, Address, Phone });

  if (id) {
    try {
      const updates = {};
      if (Name !== undefined && Name !== null) updates.Name = Name;
      if (Email !== undefined && Email !== null) updates.Email = Email;
      if (Address !== undefined && Address !== null) updates.Address = Address;
      if (Phone !== undefined && Phone !== null) updates.Phone = Phone;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const setQuery = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = [...Object.values(updates), id];

      const [results] = await db.query(
        `UPDATE Customers SET ${setQuery} WHERE CustomerID = ?`,
        values
      );

      if (results.affectedRows === 0) {
        console.warn(`No customer found with ID: ${id}`);
        return res.status(404).json({ message: "Customer not found" });
      }

      const [updatedCustomer] = await db.query(
        "SELECT CustomerID, Name, Email, Address, Phone FROM Customers WHERE CustomerID = ?",
        [id]
      );

      console.log(`Customer with ID: ${id} updated successfully.`);
      res.status(200).json(updatedCustomer[0]);
    } catch (err) {
      console.error("Error updating customer:", err.message);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(400).json({ error: "CustomerID is required for updates" });
  }
};


export const createCustomer = async (req, res) => {
  const { Name, Email, Address, Phone } = req.body;

  try {
    const [results] = await db.query(
      "INSERT INTO Customers (Name, Email, Address, Phone) VALUES (?, ?, ?, ?)",
      [Name, Email, Address, Phone]
    );

    const [newCustomer] = await db.query(
      "SELECT * FROM Customers WHERE CustomerID = ?",
      [results.insertId]
    );

    res.status(201).json(newCustomer[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(
      "DELETE FROM CartItem WHERE SessionID IN (SELECT SessionID FROM ShoppingSession WHERE UserID = ?)",
      [id]
    );
    await conn.query("DELETE FROM ShoppingSession WHERE UserID = ?", [id]);

    await conn.query(
      "UPDATE Orders SET CustomerID = NULL WHERE CustomerID = ?",
      [id]
    );

    const [result] = await conn.query(
      "DELETE FROM Customers WHERE CustomerID = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Customer not found" });
    }

    await conn.commit();
    res
      .status(200)
      .json({ message: "Customer and related data deleted successfully" });
  } catch (err) {
    await conn.rollback();
    console.error("Error deleting customer:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  } finally {
    conn.release();
  }
};
