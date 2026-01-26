/**
 * @fileoverview Redux Store Configuration
 * @description Centralizes all Redux slices and RTK Query APIs.
 * Enables cache invalidation and automatic refetching via setupListeners.
 */
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { shopApi } from '../services/shopService';
import { userApi } from '../services/userService';
import shopReducer from './shopSlice';
import cartReducer from './cartSlice';
import authReducer from './authSlice';
import favoritesReducer from './favoritesSlice';
import themeReducer from './themeSlice';
import reviewsReducer from './reviewsSlice';

export const store = configureStore({
    reducer: {
        shop: shopReducer,
        cart: cartReducer,
        auth: authReducer,
        favorites: favoritesReducer,
        theme: themeReducer,
        reviews: reviewsReducer,
        [shopApi.reducerPath]: shopApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(shopApi.middleware, userApi.middleware),
});

setupListeners(store.dispatch);
