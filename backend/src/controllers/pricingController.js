// src/controllers/pricingController.js
import db from "../models/db.js";

export const applyPromotions = async (productsWithReasons) => {
  try {
    const [activePromotions] = await db.query(
      "SELECT ProductID, DiscountPercentage FROM Promotions WHERE StartDate <= CURDATE() AND EndDate >= CURDATE()"
    );

    if (activePromotions.length === 0) {
      console.log("No active promotions found.");
      return;
    }

    const productIds = activePromotions.map((promo) => promo.ProductID);
    const [products] = await db.query(
      "SELECT ProductID, Price, DynamicPrice FROM Products WHERE ProductID IN (?)",
      [productIds]
    );

    const updates = [];
    let promoAppliedCount = 0;

    for (let promo of activePromotions) {
      const { ProductID, DiscountPercentage } = promo;
      const product = products.find((p) => p.ProductID === ProductID);

      if (product) {
        const { Price, DynamicPrice } = product;
        let newDynamicPrice =
          parseFloat(Price) * (1 - DiscountPercentage / 100);
        newDynamicPrice = newDynamicPrice.toFixed(2);

        if (newDynamicPrice !== DynamicPrice) {
          updates.push([newDynamicPrice, ProductID]);
          if (!productsWithReasons[ProductID]) {
            productsWithReasons[ProductID] = [];
          }
          productsWithReasons[ProductID].push(
            `Promotion Discount (${DiscountPercentage}%)`
          );
          promoAppliedCount++;
        }
      } else {
        console.warn(`Product with ID ${ProductID} not found for promotion.`);
      }
    }

    if (updates.length > 0) {
      await db.query(
        "INSERT INTO Products (DynamicPrice, ProductID) VALUES ? ON DUPLICATE KEY UPDATE DynamicPrice = VALUES(DynamicPrice)",
        [updates]
      );
    }

    console.log(`${promoAppliedCount} products had promotions applied.`);
    console.log("---------------------------------");
  } catch (err) {
    console.error("Error in applyPromotions:", err);
  }
};

export const updateDynamicPrice = async () => {
  try {
    const [products] = await db.query(
      "SELECT ProductID, Price, DynamicPrice FROM Products"
    );
    const [popularProducts] = await db.query(
      "SELECT ProductID FROM PopularProducts ORDER BY PopularityScore DESC LIMIT 15"
    );
    const [nonPopularProducts] = await db.query(
      "SELECT ProductID FROM PopularProducts ORDER BY PopularityScore ASC LIMIT 20"
    );
    const [inventoryStatus] = await db.query(
      "SELECT ProductID, StockLevel FROM InventoryStatus"
    );
    const [activePromotions] = await db.query(
      "SELECT ProductID, DiscountPercentage FROM Promotions WHERE StartDate <= CURDATE() AND EndDate >= CURDATE()"
    );

    const popularProductIDs = popularProducts.map(
      (product) => product.ProductID
    );
    const nonPopularProductIDs = nonPopularProducts.map(
      (product) => product.ProductID
    );
    const lowStockThreshold = 20;
    const lowStockProductIDs = inventoryStatus
      .filter((item) => item.StockLevel < lowStockThreshold)
      .map((item) => item.ProductID);
    const promotionProductIDs = activePromotions.reduce((acc, promo) => {
      acc[promo.ProductID] = promo.DiscountPercentage;
      return acc;
    }, {});

    const currentHour = new Date().getHours();
    const peakHours = [12, 18];

    let updatedProductCount = 0;
    let productsWithReasons = {};

    products.forEach((product) => {
      productsWithReasons[product.ProductID] = [];
    });

    for (let product of products) {
      const { ProductID, Price, DynamicPrice } = product;
      let newDynamicPrice = parseFloat(Price);
      let reasons = productsWithReasons[ProductID];

      if (ProductID in promotionProductIDs) {
        const discountPercentage = promotionProductIDs[ProductID];
        newDynamicPrice *= 1 - discountPercentage / 100;
        reasons.push(`Promotion Discount (${discountPercentage}%)`);
      } else {
        if (popularProductIDs.includes(ProductID)) {
          newDynamicPrice *= 1.05;
          reasons.push("Popular Product Increase (5%)");
        } else if (nonPopularProductIDs.includes(ProductID)) {
          newDynamicPrice *= 0.95;
          reasons.push("Non-Popular Product Discount (5%)");
        }

        if (peakHours.includes(currentHour)) {
          newDynamicPrice *= 1.1;
          reasons.push("Peak Hour Increase (10%)");
        }

        if (lowStockProductIDs.includes(ProductID)) {
          newDynamicPrice *= 1.15;
          reasons.push("Low Stock Increase (15%)");
        }
      }

      if (ProductID in promotionProductIDs) {
        newDynamicPrice = Math.min(newDynamicPrice, Price);
      }

      newDynamicPrice = newDynamicPrice.toFixed(2);

      if (newDynamicPrice != DynamicPrice) {
        await db.query(
          "UPDATE Products SET DynamicPrice = ? WHERE ProductID = ?",
          [newDynamicPrice, ProductID]
        );
        updatedProductCount++;
      }
    }

    console.log("---------------------------------");
    console.log(
      `${updatedProductCount} products had their dynamic prices updated successfully.`
    );
    console.log("---------------------------------");

    for (const [ProductID, reasons] of Object.entries(productsWithReasons)) {
      if (reasons.length > 0) {
        console.log(
          `Product ${ProductID} Dynamic Price changed, Reason: ${reasons.join(", ")}`
        );
      }
    }
  } catch (err) {
    console.error("Error updating dynamic prices:", err);
  }
};

export const updatePopularProducts = async () => {
  try {
    const [popularProducts] = await db.query(
      "SELECT ProductID, SUM(Quantity) as TotalQuantity FROM OrderDetails GROUP BY ProductID ORDER BY TotalQuantity DESC"
    );
    const bulkUpdateQuery =
      "INSERT INTO PopularProducts (ProductID, PopularityScore) VALUES ? ON DUPLICATE KEY UPDATE PopularityScore = VALUES(PopularityScore)";

    const values = popularProducts.map((product) => [
      product.ProductID,
      product.TotalQuantity,
    ]);

    if (values.length > 0) {
      await db.query(bulkUpdateQuery, [values]);
      console.log("---------------------------------");
      console.log("Popular products updated successfully.");
      console.log("---------------------------------");
    }
  } catch (err) {
    console.error("Error updating popular products:", err);
  }
};
