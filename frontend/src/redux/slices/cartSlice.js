import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/cart", {
        withCredentials: true,
      });
      const formattedCart = formatCartData(response.data);

      return formattedCart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const formatCartData = (cartArray) => {
  if (!Array.isArray(cartArray)) {
    console.warn("Warning: cartArray is not an array. Returning empty object.");
    return {};
  }
  const cartObject = {};
  cartArray.forEach((item) => {
    if (!item.ProductID) {
      console.error("ProductID is missing for item:", item);
    }
    cartObject[item.ProductID] = {
      ...item,
      quantity: item.Quantity,
      image: item.imagePath,
      StockLevel: item.StockLevel,
    };
  });
  return cartObject;
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: {},
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    addItem(state, action) {
      const { productId, product } = action.payload;
      if (state.items[productId]) {
        state.items[productId].quantity += 1;
      } else {
        state.items[productId] = { ...product, quantity: 1 };
      }
    },
    removeItem(state, action) {
      const { productId } = action.payload;
      if (state.items[productId] && state.items[productId].quantity > 1) {
        state.items[productId].quantity -= 1;
      } else {
        delete state.items[productId];
      }
    },
    resetCart(state) {
      state.items = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        console.error(
          "Failed to fetch cart data [Rejected]:",
          action.error.message
        );
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { addItem, removeItem, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
