import api from '../auth/authService'

export const createOrderAPI = ({ address, phone }) =>
    api.post('/api/order/', { address, phone: String(phone) })

export const fetchOrdersAPI = () =>
    api.get('/api/order/')

export const cancelOrderAPI = (id) =>
    api.patch(`/api/order/${id}/`)

