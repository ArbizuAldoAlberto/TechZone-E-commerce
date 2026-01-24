import { configureStore } from '@reduxjs/toolkit';
import { shopApi } from '../services/shopService';
import { userApi } from '../services/userService';
import shopReducer from './shopSlice';
import cartReducer from './cartSlice';
import authReducer from './authSlice';
import favoritesReducer from './favoritesSlice';
import themeReducer from './themeSlice';
import reviewsReducer from './reviewsSlice';
import { setupListeners } from '@reduxjs/toolkit/query';

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
