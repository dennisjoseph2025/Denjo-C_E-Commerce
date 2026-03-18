import React, { useEffect, useState } from 'react'
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

const statusDotColors = {
    pending: 'bg-yellow-400',
    confirmed: 'bg-blue-400',
    shipped: 'bg-purple-400',
    delivered: 'bg-emerald-400',
    cancelled: 'bg-red-400',
}

/* ─── Order Detail Modal ─── */
const OrderDetailModal = ({ order, onClose, onStatusChange, updating }) => {
    const [selectedStatus, setSelectedStatus] = useState(order.status || 'pending')

    const items = order.items || order.order_items || []

    const handleSave = () => {
        if (selectedStatus !== order.status) {
            onStatusChange(order.id, selectedStatus)
        }
    }

    // Close on backdrop click
    const handleBackdrop = (e) => {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={handleBackdrop}
        >
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/60">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-0.5">Order Details</p>
                        <h2 className="text-lg font-bold text-white font-mono">#{order.id}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

                    {/* Customer & Meta */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Customer</p>
                            <p className="text-sm font-semibold text-white">{order.user_name || order.user_email || order.user || '—'}</p>
                        </div>
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Order Total</p>
                            <p className="text-sm font-bold text-emerald-400">₹{Number(order.total_price || order.total || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Date Placed</p>
                            <p className="text-sm font-semibold text-white">
                                {order.created_at
                                    ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : '—'}
                            </p>
                        </div>
                    </div>

                    {/* Address */}
                    {(order.address || order.phone) && (
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2">Delivery Info</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-300">
                                {order.address && (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {order.address}
                                    </span>
                                )}
                                {order.phone && (
                                    <span className="flex items-center gap-2 sm:ml-4">
                                        <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {order.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Products */}
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-3">
                            Ordered Items ({items.length})
                        </p>
                        {items.length === 0 ? (
                            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center text-slate-500 text-sm">
                                No item details available.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item, idx) => {
                                    const img = item.product_image
                                    const name = item.product_name || item.name || 'Product'
                                    const category = item.product_category || item.category || null
                                    const size = item.size?.size || item.size_name || item.size || '—'
                                    const qty = item.quantity ?? 1
                                    const price = item.price ?? item.unit_price ?? 0
                                    return (
                                        <div
                                            key={item.id ?? idx}
                                            className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors"
                                        >
                                            {/* Product image */}
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0 border border-slate-600">
                                                {img ? (
                                                    <img src={img} alt={name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase">N/A</div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{name}</p>
                                                {category && (
                                                    <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-semibold mt-0.5">{category}</p>
                                                )}
                                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-700 border border-slate-600 rounded-md px-2 py-0.5">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                        </svg>
                                                        Size: <span className="text-white font-bold">{size}</span>
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-700 border border-slate-600 rounded-md px-2 py-0.5">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                        </svg>
                                                        Qty: <span className="text-white font-bold">{qty}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm font-bold text-white">₹{Number(price).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer – status changer */}
                <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/60">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1.5">Update Order Status</p>
                            <div className="flex flex-wrap gap-2">
                                {STATUS_OPTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSelectedStatus(s)}
                                        disabled={order.status === 'cancelled'}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${selectedStatus === s
                                            ? (statusColors[s] || 'bg-slate-700 text-white border-slate-600') + ' ring-1 ring-offset-1 ring-offset-slate-800 ring-current'
                                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                                    >
                                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 mb-[1px] ${statusDotColors[s] || 'bg-slate-400'}`} />
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 self-end sm:self-auto sm:mt-5">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-semibold text-slate-400 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-all"
                            >
                                Close
                            </button>
                            {order.status !== 'cancelled' && (
                                <button
                                    onClick={handleSave}
                                    disabled={selectedStatus === order.status || updating}
                                    className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
                                >
                                    {updating ? (
                                        <>
                                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Saving…
                                        </>
                                    ) : 'Save Status'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ─── Main Admin Orders Page ─── */
const AdminOrders = () => {
    const dispatch = useDispatch()
    const { orders, ordersCount, ordersNext, ordersPrevious, orderFilters, loading, error } = useSelector((s) => s.admin)

    const [selectedOrder, setSelectedOrder] = useState(null)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        dispatch(fetchAdminOrders(orderFilters))
    }, [dispatch, orderFilters])

    const handleSearch = (e) => {
        dispatch(setOrderFilters({ search: e.target.value }))
    }

    const handleStatusFilter = (status) => {
        dispatch(setOrderFilters({ status: orderFilters.status === status ? '' : status }))
    }

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdating(true)
        await dispatch(updateOrderStatus({ orderId, status: newStatus }))
        setUpdating(false)
        // Update selected order locally so the modal reflects the change
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : prev)
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
                            placeholder="Search by customer name..."
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
                                <th className="px-6 py-3 font-semibold">Items</th>
                                <th className="px-6 py-3 font-semibold">Total</th>
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading && orders.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="px-6 py-4 bg-slate-800 text-transparent">Loading</td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const items = order.items || order.order_items || []
                                    return (
                                        <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-semibold text-white">#{order.id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-600">
                                                        {(order.user_name || order.user_email || order.user || 'U')[0]?.toUpperCase()}
                                                    </div>
                                                    <p className="text-sm font-medium text-white">{order.user_name || order.user_email || order.user || '—'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {items.length > 0 ? (
                                                    <div className="flex items-center gap-1.5">
                                                        {/* Mini stacked thumbnails */}
                                                        <div className="flex -space-x-2">
                                                            {items.slice(0, 3).map((item, idx) =>
                                                                item.product_image ? (
                                                                    <img
                                                                        key={idx}
                                                                        src={item.product_image}
                                                                        alt=""
                                                                        className="w-6 h-6 rounded-full border border-slate-700 object-cover"
                                                                    />
                                                                ) : (
                                                                    <div key={idx} className="w-6 h-6 rounded-full border border-slate-700 bg-slate-700 flex items-center justify-center text-[8px] text-slate-400">?</div>
                                                                )
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-slate-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-600">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-200">
                                                ₹{Number(order.total_price || order.total || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-xs">
                                                {order.created_at
                                                    ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                    : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold capitalize border ${statusColors[order.status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusDotColors[order.status] || 'bg-slate-400'}`} />
                                                    {order.status || '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
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

            {/* Order Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusChange={handleStatusChange}
                    updating={updating}
                />
            )}
        </div>
    )
}

export default AdminOrders
