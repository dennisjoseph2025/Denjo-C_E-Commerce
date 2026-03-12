import api from '../auth/authService'

export const getCart = () => api.get('/api/cart/')
export const addToCartAPI = (productName, size, quantity) => api.post('/api/cart/', {
    product: productName,
    size: size,
    quantity: quantity
})
export const removeFromCartAPI = (id) => api.delete(`/api/cart/${id}/`)
export const updateCartItemAPI = (id, quantity) => api.patch(`/api/cart/${id}/`, { quantity })
export const clearCartAPI = () => api.delete('/api/cart/')
