import axios from 'axios'
import { API_BASE } from '../../config/apiConfig'

const USER_ADMIN_URL = `${API_BASE}/api/admin/users/`
const STAFF_ADMIN_URL = `${API_BASE}/api/admin/staff/`
const STATS_URL = `${API_BASE}/api/admin/stats/`
const ORDER_ADMIN_URL = `${API_BASE}/api/order/admin/`

// Helper to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('access_token')
    return { headers: { Authorization: `Bearer ${token}` } }
}

// User-related admin API calls
const fetchUsers = async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.is_active !== undefined && filters.is_active !== '') params.append('is_active', filters.is_active)
    if (filters.page) params.append('page', filters.page)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return await axios.get(`${USER_ADMIN_URL}${qs}`, getAuthHeader())
}

const deleteUser = async (userId) => {
    return await axios.delete(`${USER_ADMIN_URL}${userId}/`, getAuthHeader())
}

const toggleBlockUser = async (userId) => {
    return await axios.post(`${USER_ADMIN_URL}${userId}/block/`, {}, getAuthHeader())
}

const promoteUser = async (userId) => {
    return await axios.post(`${USER_ADMIN_URL}${userId}/promote/`, {}, getAuthHeader())
}

// Staff-related admin API calls
const fetchStaffs = async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.role) params.append('role', filters.role)
    if (filters.page) params.append('page', filters.page)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return await axios.get(`${STAFF_ADMIN_URL}${qs}`, getAuthHeader())
}

const deleteStaff = async (staffId) => {
    return await axios.delete(`${STAFF_ADMIN_URL}${staffId}/`, getAuthHeader())
}

const demoteStaff = async (staffId) => {
    return await axios.post(`${STAFF_ADMIN_URL}${staffId}/demote/`, {}, getAuthHeader())
}

const toggleBlockStaff = async (staffId) => {
    return await axios.post(`${STAFF_ADMIN_URL}${staffId}/block/`, {}, getAuthHeader())
}

// Company statistics API call
const fetchCompanyStats = async () => {
    return await axios.get(STATS_URL, getAuthHeader())
}

// Order management API calls
const fetchOrders = async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', filters.page)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return await axios.get(`${ORDER_ADMIN_URL}${qs}`, getAuthHeader())
}

const fetchOrderDetail = async (orderId) => {
    return await axios.get(`${ORDER_ADMIN_URL}${orderId}/`, getAuthHeader())
}

const updateOrderStatus = async (orderId, status) => {
    return await axios.patch(`${ORDER_ADMIN_URL}${orderId}/`, { status }, getAuthHeader())
}

const adminService = {
    fetchUsers,
    deleteUser,
    toggleBlockUser,
    promoteUser,
    fetchStaffs,
    deleteStaff,
    demoteStaff,
    toggleBlockStaff,
    fetchCompanyStats,
    fetchOrders,
    fetchOrderDetail,
    updateOrderStatus
}

export default adminService
