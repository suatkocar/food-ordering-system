import db from "../models/db.js";

export const getTotalProfitLast30Days = async (req, res) => {
  try {
    const query = `
        SELECT DATE(o.OrderDate) AS date, SUM((p.DynamicPrice - p.Cost) * od.Quantity) AS total_profit
        FROM Orders o
        JOIN OrderDetails od ON o.OrderID = od.OrderID
        JOIN Products p ON p.ProductID = od.ProductID
        WHERE o.OrderDate >= CURDATE() - INTERVAL 30 DAY
        GROUP BY DATE(o.OrderDate)
        ORDER BY DATE(o.OrderDate);
      `;
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTotalProfitLast52Weeks = async (req, res) => {
  try {
    const query = `
        SELECT WEEK(o.OrderDate, 1) AS week, SUM((p.DynamicPrice - p.Cost) * od.Quantity) AS total_profit
        FROM Orders o
        JOIN OrderDetails od ON o.OrderID = od.OrderID
        JOIN Products p ON p.ProductID = od.ProductID
        WHERE o.OrderDate >= CURDATE() - INTERVAL 52 WEEK
        GROUP BY WEEK(o.OrderDate, 1)
        ORDER BY WEEK(o.OrderDate, 1);
      `;
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTotalProfitLast12Months = async (req, res) => {
  try {
    const query = `
        SELECT MONTH(o.OrderDate) AS month, SUM((p.DynamicPrice - p.Cost) * od.Quantity) AS total_profit
        FROM Orders o
        JOIN OrderDetails od ON o.OrderID = od.OrderID
        JOIN Products p ON p.ProductID = od.ProductID
        WHERE o.OrderDate >= CURDATE() - INTERVAL 12 MONTH
        GROUP BY MONTH(o.OrderDate)
        ORDER BY MONTH(o.OrderDate);
      `;
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTotalProfitLast5Years = async (req, res) => {
  try {
    const query = `
        SELECT YEAR(o.OrderDate) AS year, SUM((p.DynamicPrice - p.Cost) * od.Quantity) AS total_profit
        FROM Orders o
        JOIN OrderDetails od ON o.OrderID = od.OrderID
        JOIN Products p ON p.ProductID = od.ProductID
        WHERE o.OrderDate >= CURDATE() - INTERVAL 5 YEAR
        GROUP BY YEAR(o.OrderDate)
        ORDER BY YEAR(o.OrderDate);
      `;
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTotalProfit = async (req, res) => {
  try {
    const query = `
        SELECT SUM((p.DynamicPrice - p.Cost) * od.Quantity) AS total_profit
        FROM Orders o
        JOIN OrderDetails od ON o.OrderID = od.OrderID
        JOIN Products p ON p.ProductID = od.ProductID;
      `;
    const [result] = await db.query(query);
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTopProductsByProfit = async (req, res) => {
  try {
    const query = `
        SELECT p.Name, SUM((p.DynamicPrice - p.Cost) * od.Quantity) AS product_profit
        FROM OrderDetails od
        JOIN Products p ON p.ProductID = od.ProductID
        GROUP BY p.ProductID
        ORDER BY product_profit DESC
        LIMIT 10;
      `;
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTopProductsDailySalesLast30Days = async (req, res) => {
  try {
    const query = `
      WITH TopProducts AS (
        SELECT
          p.ProductID,
          p.Name
        FROM OrderDetails od
        JOIN Products p ON p.ProductID = od.ProductID
        JOIN Orders o ON od.OrderID = o.OrderID
        WHERE o.OrderDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY p.ProductID
        ORDER BY SUM(od.Quantity) DESC
        LIMIT 10
      )
      SELECT
        p.Name AS product_name,
        DATE(o.OrderDate) AS order_date,
        IFNULL(SUM(od.Quantity), 0) AS daily_sales
      FROM Orders o
      JOIN OrderDetails od ON o.OrderID = od.OrderID
      JOIN Products p ON p.ProductID = od.ProductID
      JOIN TopProducts tp ON p.ProductID = tp.ProductID
      WHERE o.OrderDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY p.ProductID, DATE(o.OrderDate)
      ORDER BY p.Name, DATE(o.OrderDate);
    `;
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTopProductsDailySalesLast60Days = async (req, res) => {
  try {
    const query = `
      WITH TopProducts AS (
        SELECT
          p.ProductID,
          p.Name
        FROM OrderDetails od
        JOIN Products p ON p.ProductID = od.ProductID
        JOIN Orders o ON od.OrderID = o.OrderID
        WHERE o.OrderDate >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
        GROUP BY p.ProductID
        ORDER BY SUM(od.Quantity) DESC
        LIMIT 10
      )
      SELECT
        p.Name AS product_name,
        DATE(o.OrderDate) AS order_date,
        IFNULL(SUM(od.Quantity), 0) AS daily_sales
      FROM Orders o
      JOIN OrderDetails od ON o.OrderID = od.OrderID
      JOIN Products p ON p.ProductID = od.ProductID
      JOIN TopProducts tp ON p.ProductID = tp.ProductID
      WHERE o.OrderDate >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
      GROUP BY p.ProductID, DATE(o.OrderDate)
      ORDER BY p.Name, DATE(o.OrderDate);
    `;
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPeakOrderHours = async (req, res) => {
  try {
    const query = `
        SELECT HOUR(o.OrderDate) AS hour, COUNT(*) AS order_count
        FROM Orders o
        GROUP BY HOUR(o.OrderDate)
        ORDER BY order_count DESC
        LIMIT 3;
      `;
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getActivePromotionsLast30Days = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.Name AS product_name, 
        SUM(od.Quantity) AS total_sales, 
        pr.DiscountPercentage AS discount_percentage, 
        pr.StartDate, 
        pr.EndDate
      FROM Promotions pr
      JOIN Products p ON pr.ProductID = p.ProductID
      JOIN OrderDetails od ON od.ProductID = p.ProductID
      JOIN Orders o ON od.OrderID = o.OrderID
      WHERE o.OrderDate >= CURDATE() - INTERVAL 30 DAY 
      AND pr.StartDate <= CURDATE() 
      AND pr.EndDate >= CURDATE()
      GROUP BY p.ProductID, pr.DiscountPercentage, pr.StartDate, pr.EndDate
      ORDER BY total_sales DESC;
    `;
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomerLoyaltyStatus = async (req, res) => {
  try {
    const query = `
      SELECT loyalty_status, COUNT(*) AS customer_count
      FROM (
        SELECT
          c.CustomerID,
          CASE 
            WHEN COUNT(o.OrderID) = 1 THEN 'New Customer'
            WHEN COUNT(o.OrderID) BETWEEN 2 AND 5 THEN 'Occasional Customer'
            WHEN COUNT(o.OrderID) BETWEEN 6 AND 10 THEN 'Loyal Customer'
            WHEN COUNT(o.OrderID) BETWEEN 11 AND 15 THEN 'Very Loyal Customer'
            WHEN COUNT(o.OrderID) BETWEEN 16 AND 20 THEN 'Elite Customer'
            WHEN COUNT(o.OrderID) > 20 THEN 'Super Elite Customer'
            ELSE 'Undefined'
          END AS loyalty_status
        FROM Customers c
        JOIN Orders o ON c.CustomerID = o.CustomerID
        GROUP BY c.CustomerID
      ) AS loyalty_summary
      GROUP BY loyalty_status;
    `;
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInventoryStatus = async (req, res) => {
  try {
    const query = `
        SELECT p.Name, i.StockLevel, i.LastUpdated
        FROM Products p
        JOIN InventoryStatus i ON p.ProductID = i.ProductID
        ORDER BY i.StockLevel ASC;
      `;
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductProfitMargin = async (req, res) => {
  try {
    const query = `
        SELECT p.Name, (p.DynamicPrice - p.Cost) AS profit_margin
        FROM Products p
        ORDER BY profit_margin DESC;
      `;
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSalesBySeason = async (req, res) => {
  try {
    const query = `
        SELECT 
          CASE
            WHEN MONTH(o.OrderDate) IN (12, 1, 2) THEN 'Winter'
            WHEN MONTH(o.OrderDate) IN (3, 4, 5) THEN 'Spring'
            WHEN MONTH(o.OrderDate) IN (6, 7, 8) THEN 'Summer'
            WHEN MONTH(o.OrderDate) IN (9, 10, 11) THEN 'Autumn'
          END AS season,
          COUNT(*) AS total_orders
        FROM Orders o
        GROUP BY season;

      `;
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMonthlyPeakAndLeastOrderHours = async (req, res) => {
  try {
    const query = `
      WITH HourlyOrders AS (
        SELECT
          MONTH(o.OrderDate) AS month,
          HOUR(o.OrderDate) AS hour,
          COUNT(*) AS order_count
        FROM Orders o
        WHERE YEAR(o.OrderDate) = YEAR(CURDATE())
        GROUP BY MONTH(o.OrderDate), HOUR(o.OrderDate)
      ),
      RankedPeakHours AS (
        SELECT 
          month, 
          hour, 
          order_count, 
          ROW_NUMBER() OVER (PARTITION BY month ORDER BY order_count DESC) AS rn, 
          'Peak' AS type
        FROM HourlyOrders
      ),
      RankedLeastHours AS (
        SELECT 
          month, 
          hour, 
          order_count, 
          ROW_NUMBER() OVER (PARTITION BY month ORDER BY order_count ASC) AS rn, 
          'Least' AS type
        FROM HourlyOrders
      )
      SELECT month, hour, order_count, type 
      FROM RankedPeakHours 
      WHERE rn <= 3
      UNION ALL
      SELECT month, hour, order_count, type 
      FROM RankedLeastHours 
      WHERE rn <= 3
      ORDER BY month, order_count DESC;
    `;

    const [results] = await db.query(query);

    const formattedResults = results.reduce(
      (acc, { month, hour, order_count, type }) => {
        const monthName = new Date(2023, month - 1).toLocaleString("en", {
          month: "long",
        });

        if (!acc[monthName]) {
          acc[monthName] = { peak_hours: [], least_hours: [] };
        }

        if (type === "Peak") {
          acc[monthName].peak_hours.push({ hour, order_count });
        } else {
          acc[monthName].least_hours.push({ hour, order_count });
        }

        return acc;
      },
      {}
    );

    res.status(200).json(formattedResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMonthlyOrderDistributionByTime = async (req, res) => {
  try {
    const query = `
      SELECT 
        MONTH(o.OrderDate) AS month,
        SUM(CASE WHEN HOUR(o.OrderDate) BETWEEN 0 AND 5 THEN 1 ELSE 0 END) AS orders_00_06,
        SUM(CASE WHEN HOUR(o.OrderDate) BETWEEN 6 AND 11 THEN 1 ELSE 0 END) AS orders_06_12,
        SUM(CASE WHEN HOUR(o.OrderDate) BETWEEN 12 AND 17 THEN 1 ELSE 0 END) AS orders_12_18,
        SUM(CASE WHEN HOUR(o.OrderDate) BETWEEN 18 AND 23 THEN 1 ELSE 0 END) AS orders_18_24
      FROM Orders o
      WHERE YEAR(o.OrderDate) = YEAR(CURDATE())
      GROUP BY MONTH(o.OrderDate)
      ORDER BY month;
    `;
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
