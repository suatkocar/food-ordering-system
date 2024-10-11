import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Pagination,
  Switch,
  Dialog,
  DialogContent,
  Button,
} from "@mui/material";
import { useTheme, styled, alpha } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../../api/axiosInstance";
import {
  addItem,
  removeItem,
  fetchCart,
} from "../../../redux/slices/cartSlice";
import {
  fetchProducts,
  updateProductsFromWebSocket,
} from "../../../redux/slices/productsSlice";
import { fetchCategories } from "../../../redux/slices/categoriesSlice";
import { useDebounce } from "use-debounce";
import { FixedSizeGrid as GridWindow } from "react-window";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedSwitch, magicTouchAnimation } from "./StyledComponents";
import CategoryCard from "./CategoryCard";
import ProductCard from "./ProductCard";
import { useSnackbar } from "notistack";
import SearchBox from "./SearchBox";
import { useMediaQuery } from "@mui/material";
import NoResultsFound from "./NoResultsFound";
import { setupWebSocket } from "../../../api/websocket";

function Menu({ searchQuery, setSearchQuery, searchBoxRef }) {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const { user, token } = useSelector((state) => state.user);
  const products = useSelector((state) => state.products.items);
  const productsStatus = useSelector((state) => state.products.status);
  const categories = useSelector((state) => state.categories.items);
  const categoriesStatus = useSelector((state) => state.categories.status);
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(18);
  const currentStepRef = useRef(0);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [animationsEnabled, setAnimationsEnabled] = useState(false);
  const [localProducts, setLocalProducts] = useState([]);
  const [menuQuery, setMenuQuery] = useState(searchQuery);
  const [manualQuantity, setManualQuantity] = useState({});
  const [isEditing, setIsEditing] = useState({});
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visibleProductsCount, setVisibleProductsCount] =
    useState(itemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [additionalItems, setAdditionalItems] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isQuickTransition, setIsQuickTransition] = useState(true);

  const imagesCache = useRef({});
  const stepTimeoutRef = useRef(null);

  const [debouncedMenuQuery] = useDebounce(menuQuery, 300);

  const areArraysEqual = useCallback((arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i].ProductID !== arr2[i].ProductID) return false;
    }
    return true;
  }, []);

  const resetToRanking = useCallback(() => {
    const sorted = [...localProducts].sort((a, b) => a.Ranking - b.Ranking);
    if (!areArraysEqual(sorted, localProducts)) {
      setLocalProducts(sorted);
    }
  }, [localProducts, areArraysEqual]);

  const filteredProducts = useMemo(() => {
    if (searchQuery) {
      return localProducts.filter((product) =>
        product.Name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return selectedCategory === "All"
      ? localProducts
      : localProducts.filter(
          (product) => product.Category === selectedCategory
        );
  }, [searchQuery, selectedCategory, localProducts]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage + additionalItems;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage, additionalItems]);

  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));

  const CATEGORY_SIZES = {
    xs: { width: 59, height: 59 },
    sm: { width: 70, height: 70 },
    md: { width: 120, height: 120 },
    lg: { width: 160, height: 160 },
  };

  const getCategorySize = () => {
    if (isXs) return CATEGORY_SIZES.xs;
    if (isSm) return CATEGORY_SIZES.sm;
    if (isMd) return CATEGORY_SIZES.md;
    if (isLg) return CATEGORY_SIZES.lg;
    return CATEGORY_SIZES.lg;
  };

  const CARD_SIZES = {
    xs: { width: 210, height: 320 },
    sm: { width: 300, height: 380 },
    md: { width: 300, height: 380 },
    lg: { width: 400, height: 480 },
  };

  const columnCountXs = 2;
  const columnCountSm = 2;
  const columnCountMd = 3;
  const columnCountLg = 3;

  const getCurrentCardSize = () => {
    if (isXs) return CARD_SIZES.xs;
    if (isSm) return CARD_SIZES.sm;
    if (isMd) return CARD_SIZES.md;
    return CARD_SIZES.lg;
  };

  const { width: cardWidth, height: cardHeight } = getCurrentCardSize();
  const columnCount = useMemo(() => {
    if (isXs) return 2;
    if (isSm) return 2;
    if (isMd) return 3;
    return 3;
  }, [isXs, isSm, isMd]);

  useEffect(() => {
    if (searchQuery && searchBoxRef.current) {
      searchBoxRef.current.focus();
    }
  }, [searchQuery, searchBoxRef]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (
        !event.target.closest(".product-card-container") &&
        !event.target.closest(".category-card-container") &&
        !event.target.closest(".MuiDialog-root")
      ) {
        setHoveredProductId(null);
        setHoveredCategoryId(null);
      }
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (products.length > 0) {
      setLocalProducts(products);
    }
  }, [products]);

  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] =
        `Bearer ${token}`;
      dispatch(fetchCart());
    } else {
      delete axiosInstance.defaults.headers.common["Authorization"];
    }
  }, [token, dispatch]);

  useEffect(() => {
    const updatedManualQuantity = {};
    Object.keys(cart).forEach((productId) => {
      updatedManualQuantity[productId] = cart[productId].quantity;
    });
    setManualQuantity(updatedManualQuantity);
  }, [cart]);

  const randomizePopularProducts = useCallback(() => {
    const popularProducts = localProducts
      .filter((product) => product.isPopular && !product.isMostPopular)
      .sort(() => Math.random() - 0.5);

    const otherProducts = localProducts
      .filter((product) => !product.isPopular || product.isMostPopular)
      .sort(() => Math.random() - 0.5);

    const newOrder = [...popularProducts, ...otherProducts];
    if (!areArraysEqual(newOrder, localProducts)) {
      setLocalProducts(newOrder);
    }
  }, [localProducts, areArraysEqual]);

  const randomizeMostPopular = useCallback(() => {
    const mostPopularProducts = localProducts
      .filter((product) => product.isMostPopular)
      .sort(() => Math.random() - 0.5);

    const otherProducts = localProducts
      .filter((product) => !product.isMostPopular)
      .sort(() => Math.random() - 0.5);

    const newOrder = [...mostPopularProducts, ...otherProducts];
    if (!areArraysEqual(newOrder, localProducts)) {
      setLocalProducts(newOrder);
    }
  }, [localProducts, areArraysEqual]);

  const randomizeLowStockProducts = useCallback(() => {
    const lowStockProducts = localProducts
      .filter((product) => product.StockLevel > 0 && product.StockLevel <= 20)
      .sort(() => Math.random() - 0.5);

    const otherProducts = localProducts
      .filter((product) => product.StockLevel > 20 || product.StockLevel === 0)
      .sort(() => Math.random() - 0.5);

    const newOrder = [...lowStockProducts, ...otherProducts];
    if (!areArraysEqual(newOrder, localProducts)) {
      setLocalProducts(newOrder);
    }
  }, [localProducts, areArraysEqual]);

  const randomizeOutOfStockProducts = useCallback(() => {
    const outOfStockProducts = localProducts
      .filter((product) => product.StockLevel === 0)
      .sort(() => Math.random() - 0.5);

    const inStockProducts = localProducts
      .filter((product) => product.StockLevel > 0)
      .sort(() => Math.random() - 0.5);

    const newOrder = [...outOfStockProducts, ...inStockProducts];
    if (!areArraysEqual(newOrder, localProducts)) {
      setLocalProducts(newOrder);
    }
  }, [localProducts, areArraysEqual]);

  const addPromotionProducts = useCallback(() => {
    const promotionProducts = localProducts
      .filter((product) => product.isPromotion)
      .sort(() => Math.random() - 0.5);

    const otherProducts = localProducts
      .filter((product) => !product.isPromotion)
      .sort(() => Math.random() - 0.5);

    const newOrder = [...promotionProducts, ...otherProducts];
    if (!areArraysEqual(newOrder, localProducts)) {
      setLocalProducts(newOrder);
    }
  }, [localProducts, areArraysEqual]);

  const steps = useMemo(
    () => [
      () => resetToRanking(),
      () => randomizePopularProducts(),
      () => randomizeMostPopular(),
      () => randomizeLowStockProducts(),
      () => randomizeOutOfStockProducts(),
      () => addPromotionProducts(),
    ],
    [
      resetToRanking,
      randomizePopularProducts,
      randomizeMostPopular,
      randomizeLowStockProducts,
      randomizeOutOfStockProducts,
      addPromotionProducts,
    ]
  );

  useEffect(() => {
    if (
      !animationsEnabled ||
      isSearchFocused ||
      hoveredProductId ||
      hoveredCategoryId
    ) {
      return;
    }

    const handleAnimationStep = () => {
      currentStepRef.current = (currentStepRef.current + 1) % steps.length;
      steps[currentStepRef.current]();
    };

    const intervalId = setInterval(handleAnimationStep, 5000);

    return () => clearInterval(intervalId);
  }, [
    animationsEnabled,
    isSearchFocused,
    hoveredProductId,
    hoveredCategoryId,
    steps,
  ]);

  useEffect(() => {
    setIsQuickTransition(true);
    const timer = setTimeout(() => setIsQuickTransition(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCategorySelect = useCallback((category) => {
    setIsQuickTransition(true);
    setSelectedCategory(category);
    setCurrentPage(1);
    setAdditionalItems(0);
    requestAnimationFrame(() => {
      setIsQuickTransition(false);
    });
  }, []);

  useEffect(() => {
    setMenuQuery(searchQuery);
    if (searchQuery && searchBoxRef.current) {
      setTimeout(() => {
        searchBoxRef.current.focus();
        const value = searchBoxRef.current.value;
        searchBoxRef.current.value = "";
        searchBoxRef.current.value = value;
      }, 1000);
    }
  }, [searchQuery, searchBoxRef]);

  useEffect(() => {
    if (debouncedMenuQuery !== searchQuery) {
      setIsQuickTransition(true);
      setSearchQuery(debouncedMenuQuery);
      setCurrentPage(1);
      setAdditionalItems(0);
      requestAnimationFrame(() => {
        setIsQuickTransition(false);
      });
    }
  }, [debouncedMenuQuery, setSearchQuery]);

  const handleClearSearch = useCallback(() => {
    setIsQuickTransition(true);
    setSearchQuery("");
    setMenuQuery("");
    setCurrentPage(1);
    setAdditionalItems(0);
    if (searchBoxRef.current) {
      searchBoxRef.current.value = "";
    }
    requestAnimationFrame(() => {
      setIsQuickTransition(false);
    });
  }, [setSearchQuery, setMenuQuery, searchBoxRef]);

  const updateCartQuantity = (productId, quantity) => {
    setManualQuantity((prev) => ({
      ...prev,
      [productId]: quantity,
    }));
  };

  const handleDoubleClick = useCallback((product) => {
    setIsEditing((prev) => ({
      ...prev,
      [product.ProductID]: true,
    }));
  }, []);

  const removeFromCart = useCallback(
    async (productID, productName, fromDecrease = false) => {
      try {
        const currentQuantity = cart[productID]?.quantity || 0;

        if (fromDecrease && currentQuantity > 1) {
          await axiosInstance.put(
            `/cart`,
            { productId: productID, quantity: currentQuantity - 1 },
            { withCredentials: true }
          );
          dispatch(fetchCart());
          enqueueSnackbar(
            `${productName} quantity decreased to ${currentQuantity - 1}.`,
            { variant: "success" }
          );
        } else {
          await axiosInstance.delete(`/cart`, {
            data: { productId: productID },
            withCredentials: true,
          });
          dispatch(fetchCart());

          const actionMessage = fromDecrease
            ? `${productName} removed from the cart.`
            : `${productName} successfully removed from the cart.`;

          enqueueSnackbar(actionMessage, { variant: "success" });
        }
      } catch (err) {
        console.error("Error removing the product from the cart:", err);
        enqueueSnackbar(`Error removing "${productName}" from the cart.`, {
          variant: "error",
        });
      }
    },
    [cart, enqueueSnackbar, dispatch]
  );

  const handleBlur = useCallback(
    async (product) => {
      setIsEditing((prev) => ({
        ...prev,
        [product.ProductID]: false,
      }));

      let updatedQuantity =
        manualQuantity[product.ProductID] === ""
          ? 1
          : Number(manualQuantity[product.ProductID]);

      if (updatedQuantity > product.StockLevel) {
        enqueueSnackbar(
          `Only ${product.StockLevel} of "${product.Name}" are in stock. Quantity set to maximum.`,
          { variant: "warning" }
        );
        updatedQuantity = product.StockLevel;
      } else if (updatedQuantity < 1) {
        enqueueSnackbar(
          `Quantity of "${product.Name}" cannot be less than 1. Removing from cart.`,
          { variant: "info" }
        );
        await removeFromCart(product.ProductID, product.Name);
        return;
      }
// 
      try {
        await axiosInstance.put(
          `/cart`,
          {
            productId: product.ProductID,
            quantity: updatedQuantity,
          },
          { withCredentials: true }
        );
        dispatch(fetchCart());
        enqueueSnackbar(
          `Quantity of "${product.Name}" updated to ${updatedQuantity}.`,
          { variant: "success" }
        );
      } catch (error) {
        console.error("Failed to update quantity:", error);
        enqueueSnackbar(`Failed to update quantity of "${product.Name}".`, {
          variant: "error",
        });
      }
    },
    [manualQuantity, enqueueSnackbar, dispatch, removeFromCart]
  );

  const handleKeyDown = useCallback(
    async (event, product) => {
      if (event.key === "Enter") {
        await handleBlur(product);
      }
    },
    [handleBlur]
  );

  const handleLoadMore = useCallback(() => {
    setIsQuickTransition(true);
    setAdditionalItems((prev) => prev + itemsPerPage);
    requestAnimationFrame(() => {
      setIsQuickTransition(false);
    });
  }, [itemsPerPage]);

  const handleChange = useCallback((e, product) => {
    const value = e.target.value;
    setManualQuantity((prev) => ({
      ...prev,
      [product.ProductID]: value === "" ? "" : Math.max(1, Number(value)),
    }));
  }, []);

  const addToCart = useCallback(
    async (product) => {
      try {
        const currentQuantity = cart[product.ProductID]?.quantity || 0;
        if (currentQuantity >= product.StockLevel) {
          enqueueSnackbar(
            `Cannot add more of "${product.Name}". Only ${product.StockLevel} in stock.`,
            { variant: "warning" }
          );
          return;
        }

        await axiosInstance.post(
          `/cart`,
          { productId: product.ProductID, quantity: 1 },
          { withCredentials: true }
        );

        dispatch(fetchCart());

        const actionMessage =
          currentQuantity === 0
            ? `${product.Name} added to the cart.`
            : `${product.Name} quantity increased to ${currentQuantity + 1}.`;

        enqueueSnackbar(actionMessage, { variant: "success" });
      } catch (err) {
        console.error("Error adding product to the cart:", err);
        enqueueSnackbar(`Error adding "${product.Name}" to the cart.`, {
          variant: "error",
        });
      }
    },
    [cart, enqueueSnackbar, dispatch]
  );

  const handleIncrease = useCallback(
    async (product) => {
      await addToCart(product);
    },
    [addToCart]
  );

  const handleDecrease = useCallback(
    async (product) => {
      await removeFromCart(product.ProductID, product.Name, true);
    },
    [removeFromCart]
  );

  const handleAnimationToggle = useCallback(
    (event) => {
      const isEnabled = event.target.checked;
      setAnimationsEnabled(isEnabled);

      if (isEnabled) {
        const switchElement = event.target.closest(".MuiSwitch-root");
        switchElement.classList.add("animate");

        const confetiContainer = document.createElement("div");
        confetiContainer.style.position = "fixed";
        confetiContainer.style.top = "0";
        confetiContainer.style.left = "0";
        confetiContainer.style.width = "100vw";
        confetiContainer.style.height = "100vh";
        confetiContainer.style.pointerEvents = "none";
        confetiContainer.style.zIndex = "9999";
        document.body.appendChild(confetiContainer);

        const colors = [
          "#ff0000",
          "#00ff00",
          "#0000ff",
          "#ffff00",
          "#ff00ff",
          "#00ffff",
        ];
        for (let i = 0; i < 100; i++) {
          const confetti = document.createElement("div");
          confetti.style.position = "absolute";
          confetti.style.width = "10px";
          confetti.style.height = "10px";
          confetti.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];
          confetti.style.borderRadius = "50%";
          confetti.style.left = `${Math.random() * 100}%`;
          confetti.style.top = "-10px";
          confetiContainer.appendChild(confetti);

          confetti.animate(
            [
              { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
              {
                transform: `translate(${Math.random() * 200 - 100}px, ${
                  window.innerHeight
                }px) rotate(${Math.random() * 720}deg)`,
                opacity: 0,
              },
            ],
            {
              duration: 3000 + Math.random() * 3000,
              easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              fill: "forwards",
            }
          ).onfinish = () => {
            confetti.remove();
            if (confetiContainer.childElementCount === 0) {
              confetiContainer.remove();
            }
          };
        }

        setTimeout(() => {
          switchElement.classList.remove("animate");
        }, 800);

        const nextStep = (currentStepRef.current + 1) % steps.length;
        steps[nextStep]();
        currentStepRef.current = nextStep;
      }

      if (!isEnabled) {
        setIsQuickTransition(true);
        resetToRanking();
        currentStepRef.current = 0;
        requestAnimationFrame(() => {
          setTimeout(() => {
            setIsQuickTransition(false);
          }, 50);
        });
      }
    },
    [resetToRanking]
  );

  const handlePageChange = useCallback((event, value) => {
    setIsQuickTransition(true);
    setCurrentPage(value);
    setAdditionalItems(0);
    requestAnimationFrame(() => {
      setIsQuickTransition(false);
    });
  }, []);

  const handleProductMouseOver = useCallback((productId) => {
    setHoveredProductId(productId);
    clearTimeout(stepTimeoutRef.current);
  }, []);

  const handleProductMouseLeave = useCallback(
    (product) => {
      if (isEditing[product.ProductID]) {
        handleBlur(product);
      }
      setHoveredProductId(null);
    },
    [isEditing, handleBlur]
  );

  const handleCategoryMouseOver = useCallback((categoryId) => {
    setHoveredCategoryId(categoryId);
    clearTimeout(stepTimeoutRef.current);
  }, []);

  const handleCategoryMouseLeave = useCallback(() => {
    setHoveredCategoryId(null);
  }, []);

  const preloadImages = useCallback((products) => {
    products.forEach((product) => {
      if (!imagesCache.current[product.imagePath]) {
        const img = new Image();
        img.src = product.imagePath;
        img.onload = () => {
          imagesCache.current[product.imagePath] = img;
        };
      }
    });
  }, []);

  const handleMenuSearch = useCallback(
    (event) => {
      event.preventDefault();
      setIsQuickTransition(true);
      setSearchQuery(menuQuery);
      setMenuQuery("");
      setCurrentPage(1);
      setAdditionalItems(0);
      const menuElement = document.getElementById("menu");
      if (menuElement) {
        menuElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      requestAnimationFrame(() => {
        setIsQuickTransition(false);
      });
    },
    [menuQuery, setSearchQuery]
  );

  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductImageClick = useCallback((product) => {
    setSelectedProduct(product);
  }, []);

  const handleProductImageModalClose = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const productIndex = rowIndex * columnCount + columnIndex;
    if (productIndex >= paginatedProducts.length) {
      return null;
    }
    const product = paginatedProducts[productIndex];

    const cellStyles = {
      xs: {
        padding: 30,
        paddingTop: 42,
      },
      sm: {
        padding: 30,
        paddingTop: 42,
      },
      md: {
        padding: 30,
        paddingTop: 42,
      },
      lg: {
        padding: 30,
        paddingTop: 44,
      },
    };

    const currentBreakpoint = isXs ? "xs" : isSm ? "sm" : isMd ? "md" : "lg";
    const currentStyle = cellStyles[currentBreakpoint];

    let cellStyle = {
      ...style,
      width: cardWidth,
      height: cardHeight,
      ...currentStyle,
    };

    if (paginatedProducts.length === 1) {
      cellStyle = {
        ...cellStyle,
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
      };
    }

    return (
      <div style={cellStyle}>
        <Flipped flipId={`product-${product.ProductID}`}>
          <div>
            <ProductCard
              id={`product-${product.ProductID}`}
              product={product}
              imagesCache={imagesCache}
              isHovered={hoveredProductId === product.ProductID}
              isAddedToCart={!!cart[product.ProductID]}
              manualQuantity={manualQuantity[product.ProductID]}
              isEditing={isEditing[product.ProductID]}
              handleMouseOver={() => handleProductMouseOver(product.ProductID)}
              handleMouseLeave={() => handleProductMouseLeave(product)}
              handleIncrease={() => handleIncrease(product)}
              handleDecrease={() => handleDecrease(product)}
              handleDoubleClick={() => handleDoubleClick(product)}
              handleChange={(e) => handleChange(e, product)}
              handleBlur={() => handleBlur(product)}
              handleKeyDown={(e) => handleKeyDown(e, product)}
              handleAddToCart={() => addToCart(product)}
              handleImageClick={() => handleProductImageClick(product)}
            />
          </div>
        </Flipped>
      </div>
    );
  };

  useEffect(() => {
    const socket = setupWebSocket((message) => {
      console.log("WebSocket message received:", message);
      switch (message.type) {
        case "new-order":
          dispatch(updateProductsFromWebSocket(message.data.updatedProducts));
          break;
        case "menu-update":
          dispatch(updateProductsFromWebSocket(message.data));
          enqueueSnackbar("Menu updated!", {
            variant: "info",
          });
          break;
        default:
          console.log("Unhandled WebSocket message type:", message.type);
      }
    });
  
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [dispatch, enqueueSnackbar]);

  return (
    <Box sx={{ overflowX: "hidden", width: "100%" }}>
      <Box id="menu" sx={{ pt: { xs: 4, sm: 12 }, pb: { xs: 8, sm: 16 } }}>
        <Container
          maxWidth="lg"
          sx={{
            width: "100%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: { xs: 2, sm: 2, md: 4, lg: 4 },
            minHeight: filteredProducts.length === 0 ? "auto" : "600px",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "800px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: { xs: 2, sm: 3 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 2, sm: 3 },
                width: "100%",
              }}
            >
              <Typography
                component="h2"
                variant="h4"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "nowrap",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                  fontSize: {
                    xs: "1.2rem",
                    sm: "1.5rem",
                    md: "2rem",
                    lg: "2.125rem",
                  },
                  textAlign: "center",
                }}
              >
                Explore our&nbsp;
                <Box
                  component="span"
                  sx={(theme) => ({
                    color: "primary.main",
                    fontWeight: "inherit",
                    ...theme.applyStyles("dark", {
                      color: "primary.light",
                    }),
                  })}
                >
                  Dynamic
                </Box>
                &nbsp;Menu
              </Typography>
              <AnimatedSwitch
                checked={animationsEnabled}
                onChange={handleAnimationToggle}
                inputProps={{ "aria-label": "toggle animations" }}
              />
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                textAlign: "center",
                fontSize: { xs: "0.9rem", sm: "1rem" },
                maxWidth: { xs: "100%", sm: "80%" },
              }}
            >
              Experience our ever-evolving menu, featuring a rotating selection
              of top-rated dishes. From sizzling appetizers to decadent
              desserts, our dynamic offerings ensure a fresh and exciting
              culinary adventure with every visit.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(3, 1fr)",
                sm: "repeat(6, 1fr)",
                md: "repeat(6, 1fr)",
                lg: "repeat(6, 1fr)",
              },
              gap: { xs: 1, sm: 2, md: 3, lg: 4 },
              width: "100%",
              mb: { xs: 2, sm: 3, md: 4, lg: 5 },
            }}
          >
            {categories.map((category) => (
              <CategoryCard
                key={category.Category}
                category={category}
                onClick={() => handleCategorySelect(category.Category)}
                onMouseEnter={() => handleCategoryMouseOver(category.Category)}
                onMouseLeave={handleCategoryMouseLeave}
              />
            ))}
          </Box>

          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              mb: 3,
            }}
          >
            <SearchBox
              ref={searchBoxRef}
              menuQuery={menuQuery}
              setMenuQuery={setMenuQuery}
              isSearchFocused={isSearchFocused}
              setIsSearchFocused={setIsSearchFocused}
              handleMenuSearch={handleMenuSearch}
              autoFocus={false}
            />
          </Box>

          <Box
            sx={{
              visibility: filteredProducts.length > 0 ? "visible" : "hidden",
              mt: 3,
              mb: 5,
            }}
          >
            <Pagination
              count={Math.ceil(filteredProducts.length / itemsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
            />
          </Box>

          <Box
            sx={{
              width: "100%",
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {productsStatus === "loading" || categoriesStatus === "loading" ? (
              <CircularProgress />
            ) : filteredProducts.length === 0 ? (
              <NoResultsFound
                searchQuery={searchQuery}
                onClearSearch={handleClearSearch}
              />
            ) : (
              <>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      paginatedProducts.length === 1
                        ? "1fr"
                        : {
                            xs: `repeat(${columnCountXs}, 1fr)`,
                            sm: `repeat(${columnCountSm}, 1fr)`,
                            md: `repeat(${columnCountMd}, 1fr)`,
                            lg: `repeat(${columnCountLg}, 1fr)`,
                          },
                    gap: {
                      xs: 5,
                      sm: 3,
                      md: 5,
                      lg: 7,
                    },
                    width: "100%",
                    px: {
                      xs: 1,
                      sm: 2,
                      md: 3,
                      lg: 4,
                    },
                    justifyItems:
                      paginatedProducts.length === 1 ? "center" : "stretch",
                  }}
                >
                  <AnimatePresence mode="popLayout">
                    {paginatedProducts.map((product, index) => (
                      <motion.div
                        variants={{
                          show: {
                            transition: {
                              staggerChildren: 0.1,
                            },
                          },
                        }}
                        initial="hidden"
                        animate="show"
                        key={product.ProductID}
                        layout
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={
                          isQuickTransition
                            ? {
                                opacity: { duration: 0.3, delay: 0.1 },
                                scale: { duration: 0.3, delay: 0.1 },
                                layout: { duration: 0.5, delay: 0.2 },
                              }
                            : {
                                opacity: { duration: 0.6, delay: 0.2 },
                                scale: { duration: 0.5, delay: 0.2 },
                                layout: { duration: 0.7, delay: 0.8 },
                                default: { delay: 0.6 },
                                ease: [0.43, 0.13, 0.23, 0.96],
                              }
                        }
                        style={{
                          width: "100%",
                          maxWidth:
                            paginatedProducts.length === 1
                              ? getCurrentCardSize().width
                              : "none",
                        }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={product.ProductID}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={
                              isQuickTransition
                                ? {
                                    opacity: { duration: 0.3, delay: 0.1 },
                                    scale: { duration: 0.3, delay: 0.1 },
                                  }
                                : {
                                    opacity: { duration: 0.4, delay: 0.8 },
                                    scale: { duration: 0.4, delay: 0.8 },
                                  }
                            }
                          >
                            <ProductCard
                              id={`product-${product.ProductID}`}
                              product={product}
                              imagesCache={imagesCache}
                              isHovered={hoveredProductId === product.ProductID}
                              isAddedToCart={!!cart[product.ProductID]}
                              manualQuantity={manualQuantity[product.ProductID]}
                              isEditing={isEditing[product.ProductID]}
                              handleMouseOver={() =>
                                handleProductMouseOver(product.ProductID)
                              }
                              handleMouseLeave={() =>
                                handleProductMouseLeave(product)
                              }
                              handleIncrease={() => handleIncrease(product)}
                              handleDecrease={() => handleDecrease(product)}
                              handleDoubleClick={() =>
                                handleDoubleClick(product)
                              }
                              handleChange={(e) => handleChange(e, product)}
                              handleBlur={() => handleBlur(product)}
                              handleKeyDown={(e) => handleKeyDown(e, product)}
                              handleAddToCart={() => addToCart(product)}
                              handleImageClick={() =>
                                handleProductImageClick(product)
                              }
                            />
                          </motion.div>
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Box>

                {}
                {(currentPage - 1) * itemsPerPage +
                  itemsPerPage +
                  additionalItems <
                  filteredProducts.length && (
                  <Box
                    sx={{
                      mt: { xs: 8, sm: 10, md: 12 },
                      mb: { xs: 4, sm: 6, md: 8 },
                      pt: { xs: 4, sm: 6, md: 8 },
                      pb: { xs: 4, sm: 6, md: 8 },
                      alignSelf: "center",
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Button variant="contained" onClick={handleLoadMore}>
                      Load More
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Container>
      </Box>

      {}
      {selectedProduct && (
        <Dialog
          open={Boolean(selectedProduct)}
          onClose={handleProductImageModalClose}
          maxWidth="lg"
        >
          <DialogContent style={{ position: "relative", padding: 0 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
              }}
            >
              <img
                src={selectedProduct.imagePath}
                alt={selectedProduct.Name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}

export default Menu;
