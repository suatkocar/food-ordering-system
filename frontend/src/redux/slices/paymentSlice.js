import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedPaymentType: null,
  paymentDetails: {
    cardNumber: '',
    cvv: '',
    expirationDate: '',
    cardName: '',
  },
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentType(state, action) {
      state.selectedPaymentType = action.payload;
    },
    setPaymentDetails(state, action) {
      state.paymentDetails = {
        ...state.paymentDetails,
        ...action.payload,
      };
    },
  },
});

export const { setPaymentType, setPaymentDetails } = paymentSlice.actions;
export default paymentSlice.reducer;
