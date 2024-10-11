import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";

const MobileCard = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  position: "relative",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    fontSize: "1rem",
  },
  "& .MuiInputBase-input": {
    padding: theme.spacing(1.5),
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  fontSize: "1rem",
  "& .MuiSelect-select": {
    minHeight: '20px',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '0',
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "& .MuiSelect-icon": {
    top: 'calc(50% - 0.5em)',
  },
  marginLeft: '-4px',
}));


const FieldContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  marginBottom: theme.spacing(2),
}));

const FieldLabel = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  minWidth: "120px",
  marginRight: theme.spacing(2),
  paddingTop: theme.spacing(1),
}));

const FieldValue = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  alignItems: "center",
}));

const StyledTypography = styled(Typography)(({ theme, color, fontWeight }) => ({
  fontSize: "1rem",
  color: color || "inherit",
  fontWeight: fontWeight || "normal",
  wordBreak: "break-word",
}));

const EditButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  width: "100%",
  color: theme.palette.common.white,
  backgroundColor: theme.palette.primary.main,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  marginTop: theme.spacing(2),
  gap: theme.spacing(2),
}));

const MobileOrderCards = ({
  rows = [],
  handleImageClick,
  formatCurrency,
  isMobile,
  handleItemSelect,
  selectedItems = [],
  currentTab = "",
  formatTime,
  handleMobileEdit,
  getRowId,
  orderStatusOptions = [],
  loading,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

  const getEditableFields = (tab) => {
    const editableFieldsMap = {
      products: [
        "Name",
        "Category",
        "Cost",
        "Price",
        "DynamicPrice",
        "Ranking",
        "StockLevel",
      ],
      orders: ["OrderStatus"],
      customers: ["Name", "Email", "Address", "Phone"],
    };
    return editableFieldsMap[tab] || [];
  };

  const editableFields = getEditableFields(currentTab);

  const getProfitColor = (profit) => {
    if (profit < 0) return "red";
    if (profit > 0) return "green";
    return "black";
  };

  const formatTimeWithoutSeconds = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const isNumericField = (tab, field) => {
    const numericFields = {
      products: ["Cost", "Price", "DynamicPrice", "Ranking", "StockLevel"],
      orders: ["CustomerID"],
      customers: ["Phone"],
    };
    return numericFields[tab] && numericFields[tab].includes(field);
  };

  const handleEditClick = (id, rowData) => {
    setEditingId(id);
    setEditedData(rowData);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleSaveEdit = (row) => {
    Object.keys(editedData).forEach((field) => {
      if (editedData[field] !== row[field]) {
        handleMobileEdit(row, field, editedData[field]);
      }
    });
    setEditingId(null);
    setEditedData({});
  };

  const handleFieldChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  if (!Array.isArray(rows) || rows.length === 0) {
    return <Typography>No data available</Typography>;
  }

  return (
    <Box>
      {rows.map((row) => {
        const id = typeof getRowId === "function" ? getRowId(row) : row.id;
        const isSelected =
          Array.isArray(selectedItems) && selectedItems.includes(id);
        const isEditing = editingId === id;
        return (
          <MobileCard
            key={id}
            onClick={() =>
              typeof handleItemSelect === "function" && handleItemSelect(row)
            }
            sx={{
              backgroundColor: (theme) =>
                isSelected
                  ? theme.palette.mode === "dark"
                    ? theme.palette.grey[800]
                    : theme.palette.grey[200]
                  : "inherit",
              color: (theme) => theme.palette.text.primary,
            }}
          >
            <FieldContainer>
              <FieldLabel variant="body1">Select:</FieldLabel>
              <FieldValue>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() =>
                    typeof handleItemSelect === "function" &&
                    handleItemSelect(row)
                  }
                  onClick={(e) => e.stopPropagation()}
                />
              </FieldValue>
            </FieldContainer>

            {Object.keys(row).map((field) => {
              if (
                field === "imagePath" ||
                field === "ProductImages" ||
                (currentTab === "customers" && field === "Password")
              )
                return null;

              const isEditable = editableFields.includes(field);
              const isIdField = field.toLowerCase().includes("id");
              const isProfitOrTotal = field === "Profit" || field === "Total";
              const isTimeField = field === "OrderTime";
              const isNumeric = isNumericField(currentTab, field);

              return (
                <FieldContainer key={field}>
                  <FieldLabel variant="body1">{field}:</FieldLabel>
                  <FieldValue>
                    {currentTab === "orders" && field === "OrderStatus" ? (
                      <StyledSelect
                        value={row[field] || ""}
                        onChange={(e) =>
                          handleMobileEdit(row, field, e.target.value)
                        }
                        fullWidth
                      >
                        {Array.isArray(orderStatusOptions) &&
                          orderStatusOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                      </StyledSelect>
                    ) : isEditable && isEditing ? (
                      <StyledTextField
                        value={
                          editedData[field] !== undefined
                            ? editedData[field]
                            : row[field] !== null
                              ? row[field]
                              : ""
                        }
                        onChange={(e) =>
                          handleFieldChange(field, e.target.value)
                        }
                        fullWidth
                        variant="outlined"
                        type={isNumeric ? "number" : "text"}
                        inputProps={
                          isNumeric
                            ? { inputMode: "numeric", pattern: "[0-9]*" }
                            : {}
                        }
                      />
                    ) : (
                      <StyledTypography
                        variant="body1"
                        color={
                          currentTab === "products" && field === "Profit"
                            ? getProfitColor(parseFloat(row[field]))
                            : currentTab === "orders" && field === "Total"
                              ? "green"
                              : undefined
                        }
                        fontWeight={
                          isIdField || isProfitOrTotal ? "bold" : "normal"
                        }
                      >
                        {isProfitOrTotal
                          ? typeof formatCurrency === "function"
                            ? formatCurrency(row[field])
                            : row[field]
                          : isTimeField
                            ? formatTimeWithoutSeconds(row[field])
                            : field === "StockLevel" && row[field] === 0
                              ? "0"
                              : row[field] !== null && row[field] !== undefined
                                ? row[field]
                                : ""}
                      </StyledTypography>
                    )}
                  </FieldValue>
                </FieldContainer>
              );
            })}

            {currentTab === "products" && row.imagePath && (
              <Box display="flex" justifyContent="center" mt={3}>
                <img
                  src={`${row.imagePath}?${new Date().getTime()}`}
                  alt={row.Name || "Product"}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    typeof handleImageClick === "function" &&
                      handleImageClick(
                        `${row.imagePath}?${new Date().getTime()}`
                      );
                  }}
                />
              </Box>
            )}

            {currentTab === "orders" && row.ProductImages && (
              <Box display="flex" mt={3} sx={{ overflowX: "auto" }}>
                {row.ProductImages.map((image, index) => (
                  <Box key={index} sx={{ flexShrink: 0, mr: 2 }}>
                    <img
                      src={`${image}?${new Date().getTime()}`}
                      alt="Product"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        typeof handleImageClick === "function" &&
                          handleImageClick(image);
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}

            {currentTab !== "orders" &&
              (isEditing ? (
                <ActionButtons>
                  <Button
                    onClick={() => handleSaveEdit(row)}
                    color="primary"
                    variant="contained"
                    fullWidth
                  >
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    color="secondary"
                    variant="contained"
                    fullWidth
                  >
                    Cancel
                  </Button>
                </ActionButtons>
              ) : (
                <EditButton
                  startIcon={<EditIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(id, row);
                  }}
                  fullWidth
                >
                  Edit
                </EditButton>
              ))}
          </MobileCard>
        );
      })}
    </Box>
  );
};

export default MobileOrderCards;
