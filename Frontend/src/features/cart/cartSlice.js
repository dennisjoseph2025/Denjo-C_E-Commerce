import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getCart, addToCartAPI, removeFromCartAPI, updateCartItemAPI } from './cartService'

export const fetchCartItems = createAsyncThunk('cart/fetchCartItems', async (_, thunkAPI) => {
    try {
        const { data } = await getCart()
        return data
    } catch (err) {
        const msg = err.response?.data?.detail || err.response?.data || err.message || 'Failed to fetch cart'
        return thunkAPI.rejectWithValue(msg)
    }
})

export const addItemToCart = createAsyncThunk('cart/addItemToCart', async ({ productName, size, quantity }, thunkAPI) => {
    try {
        const { data } = await addToCartAPI(productName, size, quantity)
        return data
    } catch (err) {
        const msg = err.response?.data?.detail || err.message || 'Failed to add item to cart'
        return thunkAPI.rejectWithValue(msg)
    }
})

export const removeItemFromCart = createAsyncThunk('cart/removeItemFromCart', async (id, thunkAPI) => {
    try {
        await removeFromCartAPI(id)
        return id
    } catch (err) {
        const msg = err.response?.data?.detail || err.response?.data || err.message || 'Failed to remove item'
        return thunkAPI.rejectWithValue(msg)
    }
})

export const updateCartItemQty = createAsyncThunk('cart/updateCartItemQty', async ({ id, quantity }, thunkAPI) => {
    try {
        const { data } = await updateCartItemAPI(id, quantity)
        return data
    } catch (err) {
        const msg = err.response?.data?.detail || err.response?.data || err.message || 'Failed to update quantity'
        return thunkAPI.rejectWithValue(msg)
    }
})

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        cartItems: [],
        loading: false,
        error: null,
        addSuccess: false,
    },
    reducers: {
        clearCartError: (state) => { state.error = null },
        resetAddSuccess: (state) => { state.addSuccess = false },
    },
    extraReducers: (builder) => {
        // Fetch Cart
        builder
            .addCase(fetchCartItems.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchCartItems.fulfilled, (state, action) => {
                state.loading = false
                state.cartItems = Array.isArray(action.payload) ? action.payload : action.payload.items || [] // Backwards compat with just array or { items, total }
                // Assuming we can calculate total locally if API returns items.
            })
            .addCase(fetchCartItems.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
        // Add Item
        builder
            .addCase(addItemToCart.pending, (state) => {
                state.loading = true
                state.addSuccess = false
            })
            .addCase(addItemToCart.fulfilled, (state) => {
                state.loading = false
                state.addSuccess = true
            })
            .addCase(addItemToCart.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
        // Remove Item
        builder
            .addCase(removeItemFromCart.fulfilled, (state, action) => {
                state.cartItems = state.cartItems.filter(item => item.id !== action.payload)
            })
        // Update Item
        builder
            .addCase(updateCartItemQty.fulfilled, (state, action) => {
                const index = state.cartItems.findIndex(item => item.id === action.payload.id)
                if (index !== -1) {
                    state.cartItems[index] = action.payload
                }
            })
    },
})

export const { clearCartError, resetAddSuccess } = cartSlice.actions
export default cartSlice.reducer
