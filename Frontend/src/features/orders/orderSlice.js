import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createOrderAPI, fetchOrdersAPI, cancelOrderAPI } from './orderService'

export const createOrder = createAsyncThunk(
    'orders/createOrder',
    async ({ address, phone }, thunkAPI) => {
        try {
            const { data } = await createOrderAPI({ address, phone })
            return data
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.detail || err.message || 'Failed to place order'
            return thunkAPI.rejectWithValue(msg)
        }
    }
)

export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (_, thunkAPI) => {
        try {
            const { data } = await fetchOrdersAPI()
            return data
        } catch (err) {
            const msg = err.response?.data?.detail || err.message || 'Failed to fetch orders'
            return thunkAPI.rejectWithValue(msg)
        }
    }
)

export const cancelOrder = createAsyncThunk(
    'orders/cancelOrder',
    async (id, thunkAPI) => {
        try {
            const { data } = await cancelOrderAPI(id)
            return data
        } catch (err) {
            const msg = err.response?.data?.detail || err.message || 'Failed to cancel order'
            return thunkAPI.rejectWithValue(msg)
        }
    }
)

const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        orders: [],
        loading: false,
        error: null,
        creating: false,
        createError: null,
    },
    reducers: {
        clearOrderError: (state) => {
            state.error = null
            state.createError = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Create order
            .addCase(createOrder.pending, (state) => {
                state.creating = true
                state.createError = null
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.creating = false
                state.orders = [action.payload, ...state.orders]
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.creating = false
                state.createError = action.payload
            })

            // Fetch orders
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false
                state.orders = Array.isArray(action.payload) ? action.payload : []
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Cancel order
            .addCase(cancelOrder.fulfilled, (state, action) => {
                const updated = action.payload
                const idx = state.orders.findIndex((o) => o.id === updated.id)
                if (idx !== -1) state.orders[idx] = updated
            })
    },
})

export const { clearOrderError } = orderSlice.actions

export default orderSlice.reducer

