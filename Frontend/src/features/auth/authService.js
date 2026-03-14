import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { API_BASE } from '../../config/apiConfig'

// Axios configuration
const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb)
}

const onTokenRefreshed = (accessToken) => {
    refreshSubscribers.map((cb) => cb(accessToken))
    refreshSubscribers = []
}

// Decode JWT tokens for client-side role and session handling
const parseJwt = (token) => {
    try {
        if (!token || typeof token !== 'string') return null
        return jwtDecode(token)
    } catch (e) {
        console.warn('JWT parse failed:', e.message)
        return null
    }
}

// Proactively refreshes the access token if it is near expiry
const checkAndRefreshToken = async () => {
    const accessToken = localStorage.getItem('access_token')
    const refreshTokenStr = localStorage.getItem('refresh_token')

    if (!accessToken || !refreshTokenStr) return null

    const payload = parseJwt(accessToken)
    if (!payload) return accessToken

    const exp = payload.exp * 1000
    const now = Date.now()

    // Refresh if the token expires within the next 5 minutes
    if (now < exp - 300000) return accessToken

    if (isRefreshing) {
        return new Promise((resolve) => {
            subscribeTokenRefresh((newToken) => resolve(newToken))
        })
    }

    try {
        isRefreshing = true
        const { data } = await axios.post(
            `${API_BASE}/auth/token/refresh/`,
            { refresh: refreshTokenStr },
            { headers: { 'Content-Type': 'application/json' } }
        )

        const newToken = data.access
        localStorage.setItem('access_token', newToken)
        onTokenRefreshed(newToken)
        return newToken
    } catch (err) {
        const status = err.response?.status
        if (status === 401 || status === 400 || status === 403) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }
        return null
    } finally {
        isRefreshing = false
    }
}

// Periodic check for token validity
setInterval(() => {
    checkAndRefreshToken()
}, 5 * 60 * 1000) // Changed to 5 minutes for more proactive management

// Interceptors for token management
api.interceptors.request.use(async (config) => {
    if (config.url.includes('/auth/token/refresh/')) return config

    const token = await checkAndRefreshToken() || localStorage.getItem('access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        // Handle 401 errors by attempting a token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            const newToken = await checkAndRefreshToken()
            if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return api(originalRequest)
            }
        }
        return Promise.reject(error)
    }
)

// Authentication API methods
export const registerUser = (userData) => api.post('/auth/register/', userData)
export const loginUser = (credentials) => api.post('/auth/login/', credentials)
export const getProfileUser = () => api.get('/auth/profile/')
export const refreshToken = (refresh) => api.post('/auth/token/refresh/', { refresh })
export const logoutUser = (refresh) => api.post('/auth/logout/', { refresh })
export const updateProfileUser = (userData) => api.patch('/auth/profile/', userData)
export { parseJwt }

export default api