import db from "../models/db.js";

export const getAllPromotions = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM Promotions");
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPromotion = async (req, res) => {
  const { productId, startDate, endDate, discountPercentage } = req.body;
  try {
    await db.query(
      "INSERT INTO Promotions (ProductID, StartDate, EndDate, DiscountPercentage) VALUES (?, ?, ?, ?)",
      [productId, startDate, endDate, discountPercentage],
    );
    res.status(201).json({ message: "Promotion created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
