import React, { memo, useState, useEffect } from "react";
import { Box, Typography, IconButton, TextField } from "@mui/material";
import {
  ProductCardContainer,
  PopularBadge,
  DiscountBadge,
  CartOverlay,
  OutOfStockBadge,
  LowStockBadge,
  ProductImage,
} from "./StyledComponents";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

const ProductCard = memo(function ProductCard(props) {
  const {
    product,
    imagesCache,
    isHovered,
    isAddedToCart,
    manualQuantity,
    isEditing,
    handleMouseOver,
    handleMouseLeave,
    handleIncrease,
    handleDecrease,
    handleDoubleClick,
    handleChange,
    handleBlur,
    handleKeyDown,
    handleAddToCart,
    handleImageClick,
  } = props;

  const theme = useTheme();
  const [isOutOfStock, setIsOutOfStock] = useState(product.StockLevel <= 0);
  const [isLowStock, setIsLowStock] = useState(product.StockLevel > 0 && product.StockLevel <= 20);
  const [currentBadge, setCurrentBadge] = useState("promotion");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isOutOfStock) {
      setCurrentBadge(null);
      setIsVisible(false);
    } else if (product.isPromotion && isLowStock) {
      const interval = setInterval(() => {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentBadge((prev) =>
            prev === "promotion" ? "lowStock" : "promotion"
          );
          setIsVisible(true);
        }, 500);
      }, 3000);

      return () => clearInterval(interval);
    } else if (product.isPromotion) {
      setCurrentBadge("promotion");
      setIsVisible(true);
    } else if (isLowStock) {
      setCurrentBadge("lowStock");
      setIsVisible(true);
    } else {
      setCurrentBadge(null);
      setIsVisible(false);
    }
  }, [product.isPromotion, isLowStock, isOutOfStock]);

  useEffect(() => {
    setIsOutOfStock(product.StockLevel <= 0);
    setIsLowStock(product.StockLevel > 0 && product.StockLevel <= 20);
  }, [product.StockLevel]);

  return (
    <motion.div
      layout
      className="product-card-container"
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 1, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{
        type: "tween",
        duration: 0.5,
        ease: "easeOut",
      }}
    >
      <ProductCardContainer>
        {product.isMostPopular && (
          <PopularBadge color="red">Most Popular</PopularBadge>
        )}
        {product.isPopular && !product.isMostPopular && (
          <PopularBadge color="darkred">Popular</PopularBadge>
        )}
        {!isOutOfStock && (
          <>
            {product.isPromotion && (
              <DiscountBadge
                isVisible={currentBadge === "promotion" && isVisible}
              >
                %{Math.floor(product.DiscountPercentage)} <br />
                Promotion
                <br />
                Discount
              </DiscountBadge>
            )}
            {isLowStock && (
              <LowStockBadge
                isVisible={currentBadge === "lowStock" && isVisible}
              >
                <span>Only {product.StockLevel} Left!</span>
                <span>Don't Miss</span>
                <span>This Taste!</span>
              </LowStockBadge>
            )}
          </>
        )}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            paddingTop: "100%",
            overflow: "hidden",
            cursor: "default",
          }}
        >
          <ProductImage
            className="product-image"
            key={product.imagePath}
            src={
              imagesCache.current[product.imagePath]?.src || product.imagePath
            }
            alt={product.Name}
            style={{
              filter: isOutOfStock ? "grayscale(100%)" : "none",
            }}
            loading="lazy"
            decoding="async"
          />
          {isOutOfStock && (
            <OutOfStockBadge className="out-of-stock-badge">
              <span>Out of Stock</span>
              <span>Coming Soon!</span>
            </OutOfStockBadge>
          )}
          {!isOutOfStock && (
            <CartOverlay
              className="cart-overlay"
              style={{
                opacity: isHovered || isAddedToCart ? 1 : 0,
                visibility: isHovered || isAddedToCart ? "visible" : "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  pointerEvents: "auto",
                }}
              >
                {isAddedToCart ? (
                  <>
                    <IconButton onClick={handleDecrease}>
                      <RemoveIcon />
                    </IconButton>
                    {isEditing ? (
                      <TextField
                        value={manualQuantity || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        size="small"
                        inputProps={{
                          min: 1,
                          max: product.StockLevel,
                          inputMode: "numeric",
                          type: "tel",
                          style: {
                            textAlign: "center",
                            width: "40px",
                          },
                        }}
                        sx={{
                          mx: 2,
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(0, 0, 0, 0.7)"
                              : "rgba(255, 255, 255, 0.7)",
                          color:
                            theme.palette.mode === "dark"
                              ? theme.palette.common.white
                              : theme.palette.common.black,
                          borderRadius: "100px",
                          padding: "0 8px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1.2,
                          border: "2px solid",
                          borderColor:
                            theme.palette.mode === "dark"
                              ? theme.palette.common.black
                              : theme.palette.common.white,
                        }}
                      />
                    ) : (
                      <Typography
                        onClick={handleDoubleClick}
                        sx={{
                          mx: 2,
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? "rgba(0, 0, 0, 0.7)"
                              : "rgba(255, 255, 255, 0.7)",
                          color:
                            theme.palette.mode === "dark"
                              ? theme.palette.common.white
                              : theme.palette.common.black,
                          borderRadius: "100px",
                          padding: "0 8px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          minWidth: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1.2,
                          border: "2px solid",
                          borderColor:
                            theme.palette.mode === "dark"
                              ? theme.palette.common.black
                              : theme.palette.common.white,
                        }}
                      >
                        {manualQuantity}
                      </Typography>
                    )}
                    <IconButton onClick={handleIncrease}>
                      <AddIcon />
                    </IconButton>
                  </>
                ) : (
                  <IconButton
                    size="large"
                    onClick={handleAddToCart}
                    sx={{
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(0, 0, 0, 0.7)"
                          : "rgba(255, 255, 255, 0.7)",
                      color:
                        theme.palette.mode === "dark"
                          ? theme.palette.common.white
                          : theme.palette.common.black,
                    }}
                  >
                    <ShoppingCartIcon sx={{ fontSize: 30 }} />
                  </IconButton>
                )}
              </Box>
            </CartOverlay>
          )}
        </Box>
        <Box
          onClick={handleImageClick}
          sx={{
            cursor: "pointer",
            mt: 1,
          }}
        >
          <Typography variant="h6">{product.Name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Category: {product.Category}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mt: 1,
            }}
          >
            {product.isPromotion ? (
              <>
                <Typography
                  variant="body1"
                  color="#F6475D"
                  sx={{
                    textDecoration: "line-through",
                    fontWeight: "bold",
                  }}
                >
                  £{parseFloat(product.Price).toFixed(2)}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#0DCB81", fontWeight: "bold" }}
                >
                  £{parseFloat(product.DynamicPrice).toFixed(2)}
                </Typography>
              </>
            ) : parseFloat(product.DynamicPrice) < parseFloat(product.Price) ? (
              <>
                <Typography
                  variant="body1"
                  color="#F6475D"
                  sx={{
                    textDecoration: "line-through",
                    fontWeight: "bold",
                  }}
                >
                  £{parseFloat(product.Price).toFixed(2)}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#0DCB81", fontWeight: "bold" }}
                >
                  £{parseFloat(product.DynamicPrice).toFixed(2)}
                </Typography>
              </>
            ) : parseFloat(product.DynamicPrice) > parseFloat(product.Price) ? (
              <Typography
                variant="body1"
                sx={{ color: "#DA9100", fontWeight: "bold" }}
              >
                £{parseFloat(product.DynamicPrice).toFixed(2)}
              </Typography>
            ) : (
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", color: "text.primary" }}
              >
                £{parseFloat(product.DynamicPrice).toFixed(2)}
              </Typography>
            )}
          </Box>
        </Box>
      </ProductCardContainer>
    </motion.div>
  );
});

export default ProductCard;
