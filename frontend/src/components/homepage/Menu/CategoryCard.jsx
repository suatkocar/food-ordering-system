import React from "react";
import { Box } from "@mui/material";
import {
  CategoryCardContainer,
  CategoryImage,
  CategoryTitle,
} from "./StyledComponents";

const CategoryCard = React.memo(function CategoryCard({ category, onClick, onMouseEnter, onMouseLeave }) {
  return (
    <CategoryCardContainer
      className="category-card-container"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CategoryImage src={category.ImagePath} alt={category.Category} />
      <Box
        sx={{
          position: "absolute",
          right: "0px",
          bottom: "15px",
          width: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          color: "#fff",
          textAlign: "center",
          padding: "2px 0",
        }}
      >
        <CategoryTitle variant="subtitle2">{category.Category}</CategoryTitle>
      </Box>
    </CategoryCardContainer>
  );
});

export default CategoryCard;
