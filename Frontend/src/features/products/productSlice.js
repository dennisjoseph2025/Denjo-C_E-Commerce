import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_BASE } from '../../config/apiConfig'

const API_URL = `${API_BASE}/api/products/`
const CAT_URL = `${API_BASE}/api/products/categories/`
const SUB_CAT_URL = `${API_BASE}/api/products/subcategories/`
const SIZES_URL = `${API_BASE}/api/products/sizes/`

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (filters = {}, thunkAPI) => {
    try {
        const params = new URLSearchParams()
        if (filters.category) params.append('category', filters.category)
        if (filters.subcategory) params.append('subcategory', filters.subcategory)
        if (filters.size) params.append('size', filters.size)
        if (filters.search) params.append('search', filters.search)
        if (filters.min_price !== '' && filters.min_price !== undefined) params.append('min_price', filters.min_price)
        if (filters.max_price !== '' && filters.max_price !== undefined) params.append('max_price', filters.max_price)
        if (filters.page) params.append('page', filters.page)

        const queryString = params.toString() ? `?${params.toString()}` : ''
        const response = await axios.get(`${API_URL}${queryString}`)
        return response.data
    } catch (err) {
        const msg = err.response?.data?.detail || err.message || 'Failed to fetch products'
        return thunkAPI.rejectWithValue(msg)
    }
})

export const fetchFilterData = createAsyncThunk('products/fetchFilterData', async (_, thunkAPI) => {
    try {
        const [cats, subcats, sizes] = await Promise.all([
            axios.get(CAT_URL),
            axios.get(SUB_CAT_URL),
            axios.get(SIZES_URL)
        ])
        return {
            categories: cats.data,
            subcategories: subcats.data,
            sizes: sizes.data
        }
    } catch (err) {
        return thunkAPI.rejectWithValue('Failed to fetch filter options')
    }
})

export const fetchFeaturedProducts = createAsyncThunk('products/fetchFeaturedProducts', async (_, thunkAPI) => {
    try {
        const response = await axios.get(`${API_URL}featured/`)
        // Backend returns paginated response
        return response.data.results || response.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message || 'Failed to fetch featured products')
    }
})

export const fetchBestSellerProducts = createAsyncThunk('products/fetchBestSellerProducts', async (_, thunkAPI) => {
    try {
        const response = await axios.get(`${API_URL}bestsellers/`)
        // Backend returns paginated response
        return response.data.results || response.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message || 'Failed to fetch bestseller products')
    }
})

export const fetchProductById = createAsyncThunk('products/fetchProductById', async (id, thunkAPI) => {
    try {
        const response = await axios.get(`${API_URL}${id}/`)
        return response.data
    } catch (err) {
        const msg = err.response?.data?.detail || err.message || 'Failed to fetch product details'
        return thunkAPI.rejectWithValue(msg)
    }
})

export const createProduct = createAsyncThunk('products/createProduct', async (productData, thunkAPI) => {
    try {
        const token = localStorage.getItem('access_token')
        const response = await axios.post(API_URL, productData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        })
        return response.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || 'Failed to create product')
    }
})

export const updateProduct = createAsyncThunk('products/updateProduct', async ({ id, productData }, thunkAPI) => {
    try {
        const token = localStorage.getItem('access_token')
        const response = await axios.patch(`${API_URL}${id}/`, productData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        })
        return response.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || 'Failed to update product')
    }
})

export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id, thunkAPI) => {
    try {
        const token = localStorage.getItem('access_token')
        await axios.delete(`${API_URL}${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return id
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || 'Failed to delete product')
    }
})

const productSlice = createSlice({
    name: 'products',
    initialState: {
        items: [],
        count: 0,
        next: null,
        previous: null,
        featuredItems: [],
        bestSellerItems: [],
        selectedProduct: null,
        categories: [],
        subcategories: [],
        sizes: [],
        filters: {
            category: '',
            subcategory: '',
            size: '',
            search: '',
            min_price: '',
            max_price: '',
            page: 1
        },
        loading: false,
        error: null,
    },
    reducers: {
        clearProductError: (state) => { state.error = null },
        clearSelectedProduct: (state) => { state.selectedProduct = null },
        setFilters: (state, action) => {
            const newFilters = { ...state.filters, ...action.payload }
            if (newFilters.page) newFilters.page = Number(newFilters.page)
            state.filters = newFilters

            // If any filter except 'page' changes, reset to page 1
            if (Object.keys(action.payload).some(key => key !== 'page')) {
                state.filters.page = 1
            }
        },
        resetFilters: (state) => {
            state.filters = {
                category: '',
                subcategory: '',
                size: '',
                search: '',
                min_price: '',
                max_price: '',
                page: 1
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Product fetching and management
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false
                // Handle paginated response
                const results = action.payload.results || action.payload
                state.items = results
                state.count = action.payload.count || results.length
                state.next = action.payload.next
                state.previous = action.payload.previous
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Featured products state handling
            .addCase(fetchFeaturedProducts.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
                state.loading = false
                state.featuredItems = action.payload
            })
            .addCase(fetchFeaturedProducts.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Bestseller products state handling
            .addCase(fetchBestSellerProducts.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchBestSellerProducts.fulfilled, (state, action) => {
                state.loading = false
                state.bestSellerItems = action.payload
            })
            .addCase(fetchBestSellerProducts.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Individual product fetching
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false
                state.selectedProduct = action.payload
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Fetch Filter Data
            .addCase(fetchFilterData.fulfilled, (state, action) => {
                state.categories = action.payload.categories
                state.subcategories = action.payload.subcategories
                state.sizes = action.payload.sizes
            })
            // Product modification state handling
            .addCase(createProduct.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false
                state.items.unshift(action.payload)
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Update Product
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id)
                if (index !== -1) {
                    state.items[index] = action.payload
                }
            })
            // Delete Product
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload)
            })
    },
})

export const { clearProductError, clearSelectedProduct, setFilters, resetFilters } = productSlice.actions
export default productSlice.reducer
