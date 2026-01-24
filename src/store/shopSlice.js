import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    categories: [],
    products: [],
    filteredProducts: [],
    selectedCategory: null,
    selectedProduct: null,
};

export const shopSlice = createSlice({
    name: 'shop',
    initialState,
    reducers: {
        setCategorySelected: (state, action) => {
            state.selectedCategory = action.payload;
        },
        setProductIdSelected: (state, action) => {
            state.selectedProduct = action.payload;
        },
    },
});

export const { setCategorySelected, setProductIdSelected } = shopSlice.actions;

export default shopSlice.reducer;
