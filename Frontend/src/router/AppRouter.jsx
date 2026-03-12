import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getProfile } from '../features/auth/authSlice'

// Layouts
import UserLayout from '../layouts/UserLayout'
import AdminLayout from '../layouts/AdminLayout'

// User Pages
import LoginPage from '../pages/user/LoginPage'
import RegisterPage from '../pages/user/RegisterPage'
import HomePage from '../pages/user/HomePage'
import ProductDetailsPage from '../pages/user/ProductDetailsPage'
import ProfilePage from '../pages/user/ProfilePage'
import SearchPage from '../pages/user/SearchPage'
import CartPage from '../pages/user/CartPage'
import OrderCheckoutPage from '../pages/user/OrderCheckoutPage'
import OrdersPage from '../pages/user/OrdersPage'

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminProducts from '../pages/admin/AdminProducts'
import AdminUsers from '../pages/admin/AdminUsers'
import AdminStaffs from '../pages/admin/AdminStaffs'
import AdminOrders from '../pages/admin/AdminOrders'
import AdminAddProduct from '../pages/admin/AdminAddProduct'
import AdminEditProduct from '../pages/admin/AdminEditProduct'

import LoginRequired from '../components/LoginRequired'

// Redirect authenticated users away from auth pages
const GuestRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useSelector((s) => s.auth)
    
    if (isAuthenticated) {
        const hasRoleInfo = user && (user.role !== undefined || user.is_staff !== undefined || user.is_superuser !== undefined)
        if (!hasRoleInfo || loading) return null // Wait for profile fetch
        
        const role = user.role?.toLowerCase()
        const isAdmin = role === 'admin' || role === 'superadmin' || user.is_staff || user.is_superuser
        return <Navigate to={isAdmin ? "/admin/dashboard" : "/home"} replace />
    }
    return children
}

// Ensure only admins can access
const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useSelector((s) => s.auth)

    if (!isAuthenticated) return <Navigate to="/login" replace />

    const hasRoleInfo = user && (user.role !== undefined || user.is_staff !== undefined || user.is_superuser !== undefined)
    
    if (loading || !hasRoleInfo) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-900"><div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div></div>;
    }

    if (user) {
        const role = user.role?.toLowerCase()
        const isAdmin = role === 'admin' || role === 'superadmin' || user.is_staff || user.is_superuser
        if (!isAdmin) {
            return <Navigate to="/home" replace /> // Non-admins should go home
        }
        return children
    }
    
    return null; // Safety fallback
}

// Show login prompt for unauthenticated users
const ProtectedRoute = ({ children, title }) => {
    const { isAuthenticated } = useSelector((s) => s.auth)
    return isAuthenticated ? children : <LoginRequired title={title} />
}

const AppRouter = () => {
    const dispatch = useDispatch()
    const { isAuthenticated, user } = useSelector((s) => s.auth)

    useEffect(() => {
        const hasRoleInfo = user && (user.role !== undefined || user.is_staff !== undefined || user.is_superuser !== undefined)
        if (isAuthenticated && !hasRoleInfo) {
            dispatch(getProfile())
        }
    }, [isAuthenticated, user, dispatch])

    return (
        <BrowserRouter>
            <Routes>
                {/* Guest Routes */}
                <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

                {/* User Routes (Wrapped in UserLayout) */}
                <Route element={<UserLayout />}>
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/product/:id" element={<ProductDetailsPage />} />

                    {/* Protected User Routes */}
                    <Route path="/profile" element={<ProtectedRoute title="Your Profile"><ProfilePage /></ProtectedRoute>} />
                    <Route path="/cart" element={<ProtectedRoute title="Your Shopping Bag"><CartPage /></ProtectedRoute>} />
                    <Route path="/order" element={<ProtectedRoute title="Finalize Acquisition"><OrderCheckoutPage /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute title="Collection Timeline"><OrdersPage /></ProtectedRoute>} />
                </Route>

                {/* Admin Routes (Wrapped in AdminLayout) */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="staffs" element={<AdminStaffs />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="products/add" element={<AdminAddProduct />} />
                    <Route path="products/edit/:id" element={<AdminEditProduct />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter
