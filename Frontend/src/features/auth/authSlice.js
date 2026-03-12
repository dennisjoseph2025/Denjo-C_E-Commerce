import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { registerUser, loginUser, getProfileUser, logoutUser, updateProfileUser, parseJwt } from './authService'

// Load initial authentication state from local storage
const access_token = localStorage.getItem('access_token')
const refresh_token = localStorage.getItem('refresh_token')

let initialUser = null
if (access_token) {
    try {
        const decoded = parseJwt(access_token)
        initialUser = { ...decoded } // Extract user identity and roles from existing token
    } catch (e) {
        // Token invalid or expired
    }
}

// Authentication thunks
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
    try {
        const { data } = await registerUser(userData)
        return data
    } catch (err) {
        const msg = err.response?.data?.detail || err.response?.data || err.message || 'Registration failed'
        return thunkAPI.rejectWithValue(msg)
    }
})

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
    try {
        const { data } = await loginUser(credentials)
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)

        let decoded = {}
        try {
            decoded = parseJwt(data.access)
        } catch (e) { }

        // Fetch user profile immediately after login to verify account status (active/blocked)
        let profile = {}
        try {
            const profileResponse = await getProfileUser()
            profile = profileResponse.data

            if (profile.is_active === false) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                return thunkAPI.rejectWithValue('Your account has been blocked. Please contact support.')
            }
        } catch (e) {
            // Profile fetch failure usually handled by interceptors if token is invalid
        }

        return { ...data, user: { ...decoded, ...profile } }
    } catch (err) {
        let msg = err.response?.data?.detail || err.response?.data || err.message || 'Login failed'
        
        // Handle specific error message from backend for blocked accounts
        if (msg === 'No active account found with the given credentials') {
            msg = 'Your account has been blocked.'
        }
        
        return thunkAPI.rejectWithValue(msg)
    }
})

export const getProfile = createAsyncThunk('auth/getProfile', async (_, thunkAPI) => {
    try {
        const { data } = await getProfileUser()
        return data
    } catch (err) {
        const msg = err.response?.data?.detail || err.message || 'Failed to fetch profile'
        return thunkAPI.rejectWithValue(msg)
    }
})

export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, thunkAPI) => {
    try {
        const { data } = await updateProfileUser(userData)
        return data
    } catch (err) {
        const msg = err.response?.data || err.message || 'Failed to update profile'
        return thunkAPI.rejectWithValue(msg)
    }
})

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
    try {
        const refresh_token = thunkAPI.getState().auth.refresh_token
        if (refresh_token) {
            await logoutUser(refresh_token)
        }
    } catch (err) {
        console.error('Logout failed on server:', err.message)
    } finally {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
    }
})

// Authentication slice definition
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: initialUser,
        access_token: access_token || null,
        refresh_token: refresh_token || null,
        isAuthenticated: !!access_token,
        loading: false,
        error: null,
        success: false,
    },
    reducers: {
        clearError: (state) => { state.error = null },
        clearSuccess: (state) => { state.success = false },
    },
    extraReducers: (builder) => {
        builder
            // Registration lifecycle
            .addCase(register.pending, (state) => {
                state.loading = true; state.error = null; state.success = false
            })
            .addCase(register.fulfilled, (state) => {
                state.loading = false; state.success = true
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false; state.error = action.payload
            })

            // Login lifecycle
            .addCase(login.pending, (state) => {
                state.loading = true; state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false
                state.isAuthenticated = true
                state.access_token = action.payload.access
                state.refresh_token = action.payload.refresh
                state.user = action.payload.user
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false; state.error = action.payload
            })

            // Logout lifecycle
            .addCase(logout.fulfilled, (state) => {
                state.user = null
                state.access_token = null
                state.refresh_token = null
                state.isAuthenticated = false
            })

            // Fetch Profile lifecycle
            .addCase(getProfile.pending, (state) => {
                state.loading = true; state.error = null
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.loading = false
                const profile = action.payload

                // Force logout if account is found to be inactive during profile refresh
                if (profile.is_active === false) {
                    state.user = null
                    state.access_token = null
                    state.refresh_token = null
                    state.isAuthenticated = false
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    state.error = 'Your account has been blocked.'
                    window.location.href = '/login'
                    return
                }

                state.user = { ...state.user, ...profile }
            })
            .addCase(getProfile.rejected, (state, action) => {
                state.loading = false; state.error = action.payload
            })

            // Update Profile lifecycle
            .addCase(updateProfile.pending, (state) => {
                state.loading = true; state.error = null; state.success = false
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload
                state.success = true
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false; state.error = action.payload
            })
    },
})

export const { clearError, clearSuccess } = authSlice.actions
export default authSlice.reducer
