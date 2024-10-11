import React from 'react';
import { Dialog, DialogContent, DialogActions, Button, TextField, Typography, Box, MenuItem, FormControl, Select, InputLabel } from '@mui/material';
import { styled } from '@mui/material/styles';

const commonTextFieldSx = {
  '& label': {
    transform: 'translate(10px, 10px)',
  },
  '& label.MuiInputLabel-shrink': {
    transform: 'translate(0, -26px)',
  },
};

const UploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[500]}`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius,
  height: 240,
  width: 240,
  margin: '0 auto',
  overflow: 'hidden',
}));

const AddNewProductDialog = ({
  open,
  handleClose,
  newProduct,
  handleNewProductChange,
  handleCategoryChange,
  handleFileSelect,
  imagePreview,
  handleAddNewProduct,
  categoryOptions,
}) => {
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Image Preview and Upload */}
          <UploadArea onClick={() => document.getElementById('newProductImageInput').click()}>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Typography>Upload Image</Typography>
            )}
          </UploadArea>

          <input
            type="file"
            id="newProductImageInput"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          {/* Product Name */}
          <TextField
            label="Name"
            name="Name"
            value={newProduct.Name}
            onChange={handleNewProductChange}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
          />

          {/* Category Selection */}
          <FormControl fullWidth margin="normal">
            <InputLabel></InputLabel>
            <Select
              name="Category"
              value={newProduct.Category}
              onChange={handleCategoryChange}
              displayEmpty
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <Typography color="textSecondary">Category</Typography>;
                }
                return selected;
              }}
            >
              {categoryOptions.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Cost */}
          <TextField
            label="Cost"
            name="Cost"
            value={newProduct.Cost}
            onChange={handleNewProductChange}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
          />

          {/* Price */}
          <TextField
            label="Price"
            name="Price"
            value={newProduct.Price}
            onChange={handleNewProductChange}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
          />

          {/* Dynamic Price */}
          <TextField
            label="Dynamic Price"
            name="DynamicPrice"
            value={newProduct.DynamicPrice}
            onChange={handleNewProductChange}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
          />

          {/* Ranking */}
          <TextField
            label="Ranking"
            name="Ranking"
            value={newProduct.Ranking}
            onChange={handleNewProductChange}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
          />

          {/* Stock Level */}
          <TextField
            label="Stock Level"
            name="StockLevel"
            value={newProduct.StockLevel}
            onChange={handleNewProductChange}
            fullWidth
            margin="normal"
            sx={commonTextFieldSx}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleAddNewProduct} color="primary" variant="contained">
          Add Product
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddNewProductDialog;
