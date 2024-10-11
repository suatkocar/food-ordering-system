import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import productsReducer from './slices/productsSlice';
import categoriesReducer from './slices/categoriesSlice';
import paymentReducer from './slices/paymentSlice';
import alertReducer from './slices/alertSlice';
import orderStatsReducer from './slices/orderStatsSlice';
import revenueStatsReducer from './slices/revenueStatsSlice';
import insightsReducer from './slices/insightsSlice';
import profitReducer from './slices/profitStatsSlice';
import customerReducer from './slices/customerSlice';
import orderReducer from './slices/orderSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'cart'],
};

const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
  products: productsReducer,
  categories: categoriesReducer,
  payment: paymentReducer,
  alert: alertReducer,
  orderStats: orderStatsReducer,
  revenueStats: revenueStatsReducer,
  insights: insightsReducer,
  profitStats: profitReducer,
  customers: customerReducer,
  orders: orderReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['register'],
      },
    }),
});

export const persistor = persistStore(store);
