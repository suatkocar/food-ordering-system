import db from "../models/db.js";

export const getDailyProfitStats = async (req, res) => {
  try {
    const currentQuery = `
      WITH RECURSIVE DateSeries AS (
        SELECT CURDATE() AS date
        UNION
        SELECT date - INTERVAL 1 DAY
        FROM DateSeries
        WHERE date > CURDATE() - INTERVAL 29 DAY
      )
      SELECT ds.date, IFNULL(SUM(od.Quantity * (p.DynamicPrice - p.Cost)), 0) AS total_profit
      FROM DateSeries ds
      LEFT JOIN Orders o ON DATE(o.OrderDate) = ds.date
      LEFT JOIN OrderDetails od ON od.OrderID = o.OrderID
      LEFT JOIN Products p ON p.ProductID = od.ProductID
      GROUP BY ds.date
      ORDER BY ds.date;
    `;
    const [currentRows] = await db.query(currentQuery);
    res.status(200).json(currentRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWeeklyProfitStats = async (req, res) => {
  try {
    const currentQuery = `
      WITH RECURSIVE WeekNumbers AS (
        SELECT 1 AS week_number
        UNION ALL
        SELECT week_number + 1
        FROM WeekNumbers
        WHERE week_number < 52
      )
      SELECT 
        wn.week_number, 
        IFNULL(SUM(od.Quantity * (p.DynamicPrice - p.Cost)), 0) AS total_profit
      FROM WeekNumbers wn
      LEFT JOIN Orders o ON WEEK(o.OrderDate, 1) = wn.week_number AND YEAR(o.OrderDate) = YEAR(CURDATE())
      LEFT JOIN OrderDetails od ON od.OrderID = o.OrderID
      LEFT JOIN Products p ON p.ProductID = od.ProductID
      GROUP BY wn.week_number
      ORDER BY wn.week_number;
    `;
    const [currentRows] = await db.query(currentQuery);
    res.status(200).json(currentRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMonthlyProfitStats = async (req, res) => {
  try {
    const currentQuery = `
      WITH RECURSIVE MonthNumbers AS (
        SELECT 1 AS month_number
        UNION ALL
        SELECT month_number + 1
        FROM MonthNumbers
        WHERE month_number < 12
      )
      SELECT 
        mn.month_number, 
        IFNULL(SUM(od.Quantity * (p.DynamicPrice - p.Cost)), 0) AS total_profit
      FROM MonthNumbers mn
      LEFT JOIN Orders o ON MONTH(o.OrderDate) = mn.month_number AND YEAR(o.OrderDate) = YEAR(CURDATE())
      LEFT JOIN OrderDetails od ON od.OrderID = o.OrderID
      LEFT JOIN Products p ON p.ProductID = od.ProductID
      GROUP BY mn.month_number
      ORDER BY mn.month_number;
    `;
    const [currentRows] = await db.query(currentQuery);
    res.status(200).json(currentRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getYearlyProfitStats = async (req, res) => {
  try {
    const currentQuery = `
      WITH RECURSIVE YearNumbers AS (
        SELECT 1 AS year_number
        UNION
        SELECT year_number + 1 FROM YearNumbers WHERE year_number < 5
      )
      SELECT 
        yn.year_number, 
        IFNULL(SUM(od.Quantity * (p.DynamicPrice - p.Cost)), 0) AS total_profit
      FROM YearNumbers yn
      LEFT JOIN Orders o ON YEAR(o.OrderDate) - (YEAR(CURDATE()) - 5) = yn.year_number
      LEFT JOIN OrderDetails od ON od.OrderID = o.OrderID
      LEFT JOIN Products p ON p.ProductID = od.ProductID
      GROUP BY yn.year_number
      ORDER BY yn.year_number;
    `;
    const [currentRows] = await db.query(currentQuery);
    res.status(200).json(currentRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
