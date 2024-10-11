import db from "../models/db.js";

export const getAllOrderPatterns = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM OrderPatterns");
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrderPatternByProductId = async (req, res) => {
  const { productId } = req.params;
  try {
    const [results] = await db.query(
      "SELECT * FROM OrderPatterns WHERE ProductID = ?",
      [productId],
    );
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Order pattern not found for the given product." });
    }
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDailyOrderStats = async (req, res) => {
  try {
    const currentQuery = `
      WITH RECURSIVE DateSeries AS (
        SELECT CURDATE() AS date
        UNION
        SELECT date - INTERVAL 1 DAY
        FROM DateSeries
        WHERE date > CURDATE() - INTERVAL 29 DAY
      )
      SELECT ds.date, IFNULL(SUM(o.total_orders), 0) AS total_orders
      FROM DateSeries ds
      LEFT JOIN (
        SELECT DATE(OrderDate) AS date, COUNT(*) AS total_orders
        FROM Orders
        WHERE OrderDate >= CURDATE() - INTERVAL 30 DAY
        GROUP BY DATE(OrderDate)
      ) o ON ds.date = o.date
      GROUP BY ds.date
      ORDER BY ds.date;
    `;
    const [currentRows] = await db.query(currentQuery);
    res.status(200).json(currentRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWeeklyOrderStats = async (req, res) => {
  try {
    console.log("Fetching weekly order stats...");
    const currentQuery = `
      WITH RECURSIVE WeekNumbers AS (
        SELECT 1 AS week
        UNION
        SELECT week + 1 FROM WeekNumbers WHERE week < 52
      )
      SELECT 
        wn.week AS week_number, 
        IFNULL(SUM(o.total_orders), 0) AS total_orders
      FROM WeekNumbers wn
      LEFT JOIN (
        SELECT WEEK(OrderDate, 1) AS week_number, COUNT(*) AS total_orders
        FROM Orders
        WHERE YEAR(OrderDate) = YEAR(CURDATE())
        GROUP BY WEEK(OrderDate, 1)
      ) o ON wn.week = o.week_number
      GROUP BY wn.week
      ORDER BY week_number;
    `;
    const [currentRows] = await db.query(currentQuery);
    console.log("Weekly Order Stats:", currentRows);
    res.status(200).json(currentRows);
  } catch (error) {
    console.log("Error fetching weekly stats:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getMonthlyOrderStats = async (req, res) => {
  try {
    const currentQuery = `
      WITH RECURSIVE MonthNumbers AS (
        SELECT 1 AS month
        UNION
        SELECT month + 1 FROM MonthNumbers WHERE month < 12
      )
      SELECT 
        mn.month AS month_number, 
        IFNULL(SUM(o.total_orders), 0) AS total_orders
      FROM MonthNumbers mn
      LEFT JOIN (
        SELECT MONTH(OrderDate) AS month_number, COUNT(*) AS total_orders
        FROM Orders
        WHERE YEAR(OrderDate) = YEAR(CURDATE())
        GROUP BY MONTH(OrderDate)
      ) o ON mn.month = o.month_number
      GROUP BY mn.month
      ORDER BY month_number;
    `;
    const [currentRows] = await db.query(currentQuery);
    res.status(200).json(currentRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getYearlyOrderStats = async (req, res) => {
  try {
    const currentQuery = `
      WITH RECURSIVE YearNumbers AS (
        SELECT 1 AS year_number
        UNION
        SELECT year_number + 1 FROM YearNumbers WHERE year_number < 5
      )
      SELECT 
        yn.year_number, 
        IFNULL(SUM(o.total_orders), 0) AS total_orders
      FROM YearNumbers yn
      LEFT JOIN (
        SELECT YEAR(OrderDate) - (YEAR(CURDATE()) - 5) AS year_number, COUNT(*) AS total_orders
        FROM Orders
        WHERE YEAR(OrderDate) BETWEEN YEAR(CURDATE()) - 4 AND YEAR(CURDATE())
        GROUP BY year_number
      ) o ON yn.year_number = o.year_number
      GROUP BY yn.year_number
      ORDER BY yn.year_number;
    `;
    const [currentRows] = await db.query(currentQuery);
    res.status(200).json(currentRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
