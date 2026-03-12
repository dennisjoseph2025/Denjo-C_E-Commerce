import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import adminService from './adminService'

export const fetchAllUsers = createAsyncThunk('admin/fetchAllUsers', async (filters = {}, thunkAPI) => {
    try {
        const response = await adminService.fetchUsers(filters)
        return response.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || 'Failed to fetch users')
    }
})

export const fetchAllStaffs = createAsyncThunk('admin/fetchAllStaffs', async (filters = {}, thunkAPI) => {
    try {
        const response = await adminService.fetchStaffs(filters)
        return response.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || 'Failed to fetch staffs')
    }
})

export const deleteAdminUser = createAsyncThunk('admin/deleteUser', async (userId, thunkAPI) => {
    try {
        await adminService.deleteUser(userId)
        return userId
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || 'Failed to delete user')
    }
})

export const deleteAdminStaff = createAsyncThunk('admin/deleteStaff', async (staffId, thunkAPI) => {
    try {
        await adminService.deleteStaff(staffId)
        return staffId
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || 'Failed to delete staff member')
    }
})

export const toggleBlockUser = createAsyncThunk('admin/toggleBlockUser', async (userId, thunkAPI) => {
    try {
        const response = await adminService.toggleBlockUser(userId)
        return { userId, ...response.data }
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || 'Failed to update user status')
    }
})

export const toggleBlockStaff = createAsyncThunk('admin/toggleBlockStaff', async (staffId, thunkAPI) => {
    try {
        const response = await adminService.toggleBlockStaff(staffId)
        return { staffId, ...response.data }
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || 'Failed to update staff status')
    }
})

export const promoteToAdmin = createAsyncThunk('admin/promote', async (userId, thunkAPI) => {
    try {
        const response = await adminService.promoteUser(userId)
        return { userId, ...response.data }
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || 'Failed to promote user')
    }
})

export const demoteToUser = createAsyncThunk('admin/demote', async (staffId, thunkAPI) => {
    try {
        const response = await adminService.demoteStaff(staffId)
        return { staffId, ...response.data }
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || 'Failed to demote staff')
    }
})

export const fetchStats = createAsyncThunk('admin/fetchStats', async (_, thunkAPI) => {
    try {
        const response = await adminService.fetchCompanyStats()
        return response.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || 'Failed to fetch stats')
    }
})

// Order management thunks
export const fetchAdminOrders = createAsyncThunk('admin/fetchAdminOrders', async (filters = {}, thunkAPI) => {
    try {
        const response = await adminService.fetchOrders(filters)
        return response.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || 'Failed to fetch orders')
    }
})

export const updateOrderStatus = createAsyncThunk('admin/updateOrderStatus', async ({ orderId, status }, thunkAPI) => {
    try {
        const response = await adminService.updateOrderStatus(orderId, status)
        return response.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || 'Failed to update order status')
    }
})

const adminSlice = createSlice({
    name: 'admin',
    initialState: {
        // Users
        users: [],
        usersCount: 0,
        usersNext: null,
        usersPrevious: null,
        userFilters: { search: '', is_active: '', page: 1 },

        // Staff
        staffs: [],
        staffsCount: 0,
        staffsNext: null,
        staffsPrevious: null,
        staffFilters: { search: '', role: '', page: 1 },

        // Stats
        stats: {},

        // Orders
        orders: [],
        ordersCount: 0,
        ordersNext: null,
        ordersPrevious: null,
        orderFilters: { status: '', search: '', page: 1 },

        loading: false,
        error: null,
    },
    reducers: {
        clearAdminError: (state) => { state.error = null },

        setUserFilters: (state, action) => {
            state.userFilters = { ...state.userFilters, ...action.payload }
            if (Object.keys(action.payload).some(key => key !== 'page')) {
                state.userFilters.page = 1
            }
        },
        resetUserFilters: (state) => {
            state.userFilters = { search: '', is_active: '', page: 1 }
        },

        setStaffFilters: (state, action) => {
            state.staffFilters = { ...state.staffFilters, ...action.payload }
            if (Object.keys(action.payload).some(key => key !== 'page')) {
                state.staffFilters.page = 1
            }
        },
        resetStaffFilters: (state) => {
            state.staffFilters = { search: '', role: '', page: 1 }
        },

        setOrderFilters: (state, action) => {
            state.orderFilters = { ...state.orderFilters, ...action.payload }
            if (Object.keys(action.payload).some(key => key !== 'page')) {
                state.orderFilters.page = 1
            }
        },
        resetOrderFilters: (state) => {
            state.orderFilters = { status: '', search: '', page: 1 }
        }
    },
    extraReducers: (builder) => {
        builder
            // User fetching and management
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false
                const data = action.payload
                state.users = data.results || data
                state.usersCount = data.count || (data.results ? data.results.length : data.length)
                state.usersNext = data.next || null
                state.usersPrevious = data.previous || null
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // User and Staff deletion
            .addCase(deleteAdminUser.fulfilled, (state, action) => {
                state.users = state.users.filter(u => u.id !== action.payload)
            })
            .addCase(deleteAdminStaff.fulfilled, (state, action) => {
                state.staffs = state.staffs.filter(s => s.id !== action.payload)
            })

            // Role transitions
            .addCase(promoteToAdmin.fulfilled, (state, action) => {
                const { userId } = action.payload
                state.users = state.users.filter(u => u.id !== userId)
            })
            .addCase(demoteToUser.fulfilled, (state, action) => {
                const { staffId } = action.payload
                state.staffs = state.staffs.filter(s => s.id !== staffId)
            })

            // Fetch Staffs
            .addCase(fetchAllStaffs.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAllStaffs.fulfilled, (state, action) => {
                state.loading = false
                const data = action.payload
                state.staffs = data.results || data
                state.staffsCount = data.count || (data.results ? data.results.length : data.length)
                state.staffsNext = data.next || null
                state.staffsPrevious = data.previous || null
            })
            .addCase(fetchAllStaffs.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Status toggling
            .addCase(toggleBlockUser.fulfilled, (state, action) => {
                const { userId, is_active } = action.payload
                const user = state.users.find(u => u.id === userId)
                if (user) user.is_active = is_active
            })
            .addCase(toggleBlockStaff.fulfilled, (state, action) => {
                const { staffId, is_active } = action.payload
                const staff = state.staffs.find(s => s.id === staffId)
                if (staff) staff.is_active = is_active
            })

            // Fetch Stats
            .addCase(fetchStats.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchStats.fulfilled, (state, action) => {
                state.loading = false
                state.stats = action.payload
            })

            // Fetch Admin Orders
            .addCase(fetchAdminOrders.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAdminOrders.fulfilled, (state, action) => {
                state.loading = false
                const data = action.payload
                state.orders = data.results || data
                state.ordersCount = data.count || (data.results ? data.results.length : data.length)
                state.ordersNext = data.next || null
                state.ordersPrevious = data.previous || null
            })
            .addCase(fetchAdminOrders.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Update Order Status
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const updated = action.payload
                const index = state.orders.findIndex(o => o.id === updated.id)
                if (index !== -1) {
                    state.orders[index] = updated
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.error = action.payload
            })
    }
})

export const {
    clearAdminError,
    setUserFilters, resetUserFilters,
    setStaffFilters, resetStaffFilters,
    setOrderFilters, resetOrderFilters
} = adminSlice.actions
export default adminSlice.reducer
