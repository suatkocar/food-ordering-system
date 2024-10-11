import db from "../models/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { migrateCart, generateSessionID } from "./cartController.js";

const jwtSecret = process.env.JWT_SECRET;

export const getAllUsers = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM Users");
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [results] = await db.query(
      "INSERT INTO Users (Name, Email, Password, Role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );
    res
      .status(201)
      .json({ message: "User created successfully", userId: results.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, oldPassword, newPassword, role } = req.body;

  try {
    if (newPassword) {
      const [user] = await db.query(
        "SELECT Password FROM Users WHERE UserID = ?",
        [id]
      );
      if (user.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user[0].Password);
      if (!isMatch) {
        return res.status(401).json({ message: "Old password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.query("UPDATE Users SET Password = ? WHERE UserID = ?", [
        hashedPassword,
        id,
      ]);
    }

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.Name = name;
    if (email) fieldsToUpdate.Email = email;
    if (role) fieldsToUpdate.Role = role;

    const setClause = Object.keys(fieldsToUpdate)
      .map((field) => `${field} = ?`)
      .join(", ");
    const values = Object.values(fieldsToUpdate);

    if (values.length > 0) {
      await db.query(`UPDATE Users SET ${setClause} WHERE UserID = ?`, [
        ...values,
        id,
      ]);
    }

    const [updatedUser] = await db.query(
      "SELECT * FROM Users WHERE UserID = ?",
      [id]
    );
    res.status(200).json(updatedUser[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM Users WHERE id = ?", [id]);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const registerUser = async (req, res) => {
  const { name, email, password, address, phone } = req.body;

  try {
    const [existingUser] = await db.query(
      "SELECT * FROM Customers WHERE Email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [results] = await db.query(
      "INSERT INTO Customers (Name, Email, Password, Address, Phone) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, address, phone]
    );

    const user = {
      id: results.insertId,
      name,
      email,
      address,
      phone,
    };

    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Incoming login request for email:", email);

    let [users] = await db.query("SELECT * FROM Users WHERE email = ?", [
      email,
    ]);
    console.log("Users query result:", users);
    let user = users[0];

    if (!user) {
      [users] = await db.query("SELECT * FROM Customers WHERE Email = ?", [
        email,
      ]);
      console.log("Customers query result:", users);
      user = users[0];

      if (!user) {
        return res.status(401).json({ message: "Invalid email" });
      }

      const isMatch = await bcrypt.compare(password, user.Password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const token = jwt.sign(
        { id: user.CustomerID, email: user.Email },
        jwtSecret,
        { expiresIn: "7d" }
      );

      req.user = { id: user.CustomerID, email: user.Email };

      if (req.session.tempSessionID) {
        console.log("Migrating cart for session:", req.session.tempSessionID);
        await migrateCart(req);
        console.log("Cart migration completed.");
      }

      const [existingSession] = await db.query(
        "SELECT * FROM ShoppingSession WHERE UserID = ? ORDER BY CreatedAt DESC LIMIT 1",
        [user.CustomerID]
      );

      if (existingSession.length === 0) {
        await db.query(
          "INSERT INTO ShoppingSession (SessionID, UserID, Total) VALUES (?, ?, 0)",
          [user.CustomerID, user.CustomerID]
        );
      } else {
        await db.query(
          "UPDATE ShoppingSession SET SessionID = ? WHERE SessionID = ?",
          [user.CustomerID, existingSession[0].SessionID]
        );
      }

      req.session.tempSessionID = user.CustomerID;

      res.status(200).json({
        token,
        user: {
          id: user.CustomerID,
          email: user.Email,
          name: user.Name,
          address: user.Address,
          phone: user.Phone,
        },
        role: null,
        message: "Login successful",
        redirectUrl: req.body.redirectUrl || "/",
      });
    } else {
      const isMatch = await bcrypt.compare(password, user.Password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const token = jwt.sign(
        { id: user.UserID, email: user.Email, role: user.Role },
        jwtSecret,
        { expiresIn: "7d" }
      );

      req.user = { id: user.UserID, email: user.Email, role: user.Role };

      if (req.session.tempSessionID) {
        console.log("Migrating cart for session:", req.session.tempSessionID);
        await migrateCart(req);
        console.log("Cart migration completed.");
      }

      if (user.Role !== "admin") {
        const [existingSession] = await db.query(
          "SELECT * FROM ShoppingSession WHERE UserID = ? ORDER BY CreatedAt DESC LIMIT 1",
          [user.UserID]
        );

        if (existingSession.length === 0) {
          await db.query(
            "INSERT INTO ShoppingSession (SessionID, UserID, Total) VALUES (?, ?, 0)",
            [user.UserID, user.UserID]
          );
        } else {
          await db.query(
            "UPDATE ShoppingSession SET SessionID = ? WHERE SessionID = ?",
            [user.UserID, existingSession[0].SessionID]
          );
        }

        req.session.tempSessionID = user.UserID;
      }

      res.status(200).json({
        token,
        user: {
          id: user.UserID,
          email: user.Email,
          name: user.Name,
          role: user.Role,
        },
        role: user.Role,
        message: "Login successful",
        redirectUrl: user.Role === "admin" ? "/admin-dashboard" : "/",
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const userID = req.user ? req.user.id : null;

    console.log("Attempting to destroy session for user:", userID);

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy failed:", err);
        return res
          .status(500)
          .json({ message: "Logout failed", error: err.message });
      }

      console.log("Session destroyed successfully");

      res.clearCookie("connect.sid");

      req.session = null;

      res.status(200).json({
        message: "Logout successful",
        resetCart: true,
        userID: userID,
      });
    });
  } catch (err) {
    console.error("Unexpected error during logout:", err);
    res.status(500).json({ error: err.message });
  }
};

export const refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(403).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id, name: decoded.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const getUserDetails = async (req, res) => {
  const userId = req.user.id;
  try {
    const [results] = await db.query("SELECT * FROM Users WHERE id = ?", [
      userId,
    ]);
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
