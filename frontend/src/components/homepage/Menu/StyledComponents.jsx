import { styled, keyframes, alpha } from "@mui/material/styles";
import { Box, Card, Typography, Switch } from "@mui/material";

const fadeInOut = keyframes`
  0%, 100% { opacity: 0; transform: scale(0.8); }
  20%, 80% { opacity: 1; transform: scale(1); }
`;

export const CartOverlay = styled(Box)(({ theme }) => ({
  opacity: 0,
  visibility: "hidden",
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
  transition: "opacity 0.3s, visibility 0.3s",
}));

export const ProductCardContainer = styled(Card)(({ theme }) => ({
  cursor: "pointer",
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0),
  paddingBottom: theme.spacing(2),
  textAlign: "center",
  position: "relative",
  overflow: "visible",
  width: "100%",
  height: "100%",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: theme.shadows[5],
  },
}));

export const ProductImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  transition: "transform 0.3s ease-in-out",
});

export const borderAnimation = keyframes`
  0% {
    border-color: transparent;
    border-top-color: #047AF2;
  }
  25% {
    border-color: transparent;
    border-right-color: #047AF2;
  }
  50% {
    border-color: transparent;
    border-bottom-color: #047AF2;
  }
  75% {
    border-color: transparent;
    border-left-color: #047AF2;
  }
  100% {
    border-color: transparent;
    border-top-color: #047AF2;
  }
`;

export const magicTouchAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(66, 165, 245, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(66, 165, 245, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(66, 165, 245, 0);
  }
`;

export const AnimatedSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: alpha(
        theme.palette.primary.main,
        theme.palette.action.hoverOpacity
      ),
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: theme.palette.primary.main,
  },
  "&.animate": {
    animation: `${magicTouchAnimation} 0.8s ease-in-out`,
  },
}));

const confettiAnimation = keyframes`
  0% { transform: translateY(0) rotateZ(0deg); opacity: 1; }
  100% { transform: translateY(1000%) rotateZ(720deg); opacity: 0; }
`;

export const ConfettiPiece = styled("div")(({ theme, color }) => ({
  position: "absolute",
  width: "10px",
  height: "10px",
  background: color,
  borderRadius: "50%",
  animation: `${confettiAnimation} 5s ease-in-out forwards`,
}));

export const CategoryCardContainer = styled(Card)(({ theme }) => ({
  cursor: "pointer",
  backgroundColor: theme.palette.background.paper,
  textAlign: "center",
  position: "relative",
  width: "100%",
  paddingTop: "90%",
  borderRadius: "100%",
  overflow: "hidden",
  transition: "transform 0.3s ease",
  "&:hover img": {
    transform: "scale(1.30)",
  },
}));

export const CategoryImage = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  position: "absolute",
  top: 0,
  left: 0,
  borderRadius: "100%",
  transition: "transform 0.3s ease-in-out",
});

export const CategoryTitle = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.common.white,
  textAlign: "center",
  overflow: "hidden",
  whiteSpace: "normal",
  width: "100%",
  fontSize: "0.7rem",
  lineHeight: 1.2,
  [theme.breakpoints.up("sm")]: {
    fontSize: "0.8rem",
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "0.9rem",
  },
  [theme.breakpoints.up("lg")]: {
    fontSize: "1rem",
  },
}));

export const OutOfStockBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%) rotate(-45deg)",
  width: "140%",
  height: "50px",
  borderRadius: "100px",
  overflow: "hidden",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  color: "#ced4da",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1rem",
  fontWeight: "bold",
  textTransform: "uppercase",
  zIndex: 0,

  "& > span": {
    display: "block",
    lineHeight: 1.2,
  },

  "& > span:first-of-type": {
    fontSize: "1rem",
  },

  "& > span:last-child": {
    fontSize: "0.8rem",
  },
}));

export const LowStockBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isVisible'
})(({ theme, isVisible }) => ({
  position: "absolute",
  top: theme.spacing(-2),
  left: theme.spacing(-2),
  backgroundColor: "orange",
  color: theme.palette.common.white,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  fontSize: "0.75rem",
  fontWeight: "bold",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? "scale(1)" : "scale(0.8)",
  transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",

  "& > span": {
    display: "block",
    lineHeight: 1.2,
    fontSize: "0.75rem",
    marginBottom: theme.spacing(0.25),
  },

  "& > span:last-child": {
    marginBottom: 0,
  },
}));

export const PopularBadge = styled(Box)(({ theme, color }) => ({
  position: "absolute",
  top: theme.spacing(-1),
  right: theme.spacing(-2),
  backgroundColor: color,
  color: theme.palette.common.white,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  fontSize: "0.75rem",
  fontWeight: "bold",
  zIndex: 1,
}));

export const DiscountBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isVisible'
})(({ theme, isVisible }) => ({
  width: 100,
  aspectRatio: 1,
  position: "absolute",
  top: -35,
  left: -35,
  backgroundColor: "gold",
  color: "darkred",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.65rem",
  fontWeight: "bold",
  zIndex: 2,
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? "scale(1)" : "scale(0.8)",
  transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",

  clipPath:
    "polygon(98.3% 62.94%,75.98% 65%,85.36% 85.36%,65%  75.98%,62.94% 98.3%,50% 80%,37.06% 98.3%,35% 75.98%,14.64% 85.36%,24.02% 65%,1.7% 62.94%,20% 50%,1.7% 37.06%,24.02% 35%,14.64% 14.64%,35% 24.02%,37.06% 1.7%,50% 20%,62.94% 1.7%,65% 24.02%,85.36% 14.64%,75.98% 35%,98.3% 37.06%,80% 50%)",
  background: `
    linear-gradient(to bottom right, #0000 calc(50% - 40px), #fff 50%, #0000 calc(50% + 40px))
    bottom right / calc(200% + 80px) calc(200% + 80px)
    gold`,
  animationName: "l8",
  animationDuration: "2.5s",
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",

  "@keyframes l8": {
    "100%": {
      backgroundPosition: "top left",
    },
  },
}));
