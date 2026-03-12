import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdminOrders, updateOrderStatus, setOrderFilters } from '../../features/admin/adminSlice'

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const AdminOrders = () => {
    const dispatch = useDispatch()
    const { orders, ordersCount, ordersNext, ordersPrevious, orderFilters, loading, error } = useSelector((s) => s.admin)

    useEffect(() => {
        dispatch(fetchAdminOrders(orderFilters))
    }, [dispatch, orderFilters])

    const handleSearch = (e) => {
        dispatch(setOrderFilters({ search: e.target.value }))
    }

    const handleStatusFilter = (status) => {
        dispatch(setOrderFilters({ status: orderFilters.status === status ? '' : status }))
    }

    const handleStatusChange = (orderId, newStatus) => {
        dispatch(updateOrderStatus({ orderId, status: newStatus }))
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white">Order Management</h2>
                <p className="text-slate-400 text-sm mt-1">View and manage all customer orders.</p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={() => dispatch(setOrderFilters({ status: '' }))}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${!orderFilters.status
                            ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                        }`}
                >
                    All
                </button>
                {STATUS_OPTIONS.map((s) => (
                    <button
                        key={s}
                        onClick={() => handleStatusFilter(s)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all border ${orderFilters.status === s
                                ? (statusColors[s] || 'bg-slate-700 text-white border-slate-600')
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                {/* Search */}
                <div className="p-6 border-b border-slate-700">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search by order ID or customer..."
                            value={orderFilters.search}
                            onChange={handleSearch}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500 shadow-inner"
                        />
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {error && (
                    <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/20 text-sm text-red-400">
                        {typeof error === 'string' ? error : JSON.stringify(error)}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-900/50 border-b border-slate-700 text-slate-400">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Order ID</th>
                                <th className="px-6 py-3 font-semibold">Customer</th>
                                <th className="px-6 py-3 font-semibold">Total</th>
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading && orders.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-4 bg-slate-800 text-transparent">Loading</td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-semibold text-white">#{order.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-600">
                                                    {(order.user_name || order.user_email || order.user || 'U')[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{order.user_name || order.user_email || order.user || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-200">
                                            ₹{Number(order.total_price || order.total || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-xs">
                                            {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold capitalize border ${statusColors[order.status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                                                {order.status || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {order.status === 'cancelled' ? (
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                                                    Cancelled
                                                </span>
                                            ) : (
                                                <select
                                                    value={order.status || ''}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer capitalize"
                                                >
                                                    {STATUS_OPTIONS.filter(s => s !== 'cancelled').map((s) => (
                                                        <option key={s} value={s} className="capitalize">{s}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="p-4 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/50">
                    <span className="text-sm text-slate-400">
                        Page <span className="font-semibold text-white">{orderFilters.page}</span> · <span className="font-semibold text-white">{ordersCount}</span> total orders
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => ordersPrevious && dispatch(setOrderFilters({ page: orderFilters.page - 1 }))}
                            disabled={!ordersPrevious}
                            className="px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-slate-900/50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => ordersNext && dispatch(setOrderFilters({ page: orderFilters.page + 1 }))}
                            disabled={!ordersNext}
                            className="px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-slate-900/50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminOrders
