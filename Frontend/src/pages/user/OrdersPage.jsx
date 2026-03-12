import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { fetchOrders, cancelOrder } from '../../features/orders/orderSlice'

const OrdersPage = () => {
    const dispatch = useDispatch()
    const { orders, loading, error } = useSelector((s) => s.orders)

    useEffect(() => {
        dispatch(fetchOrders())
    }, [dispatch])

    const handleCancel = (id, status) => {
        if (status !== 'pending') return
        dispatch(cancelOrder(id))
    }

    const getItems = (order) =>
        order.items || order.order_items || []

    return (
        <div className="min-h-screen bg-violet relative overflow-hidden">


            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-chiffon/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 pt-32 pb-16 relative z-10 text-chiffon">
                <div className="mb-12 flex items-baseline justify-between gap-4">
                    <div>
                        <span className="text-chiffon/40 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">
                            Order History
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                            Your Collection
                        </h1>
                    </div>
                    <Link
                        to="/"
                        className="text-[11px] font-black uppercase tracking-[0.2em] text-chiffon/30 hover:text-chiffon transition-colors flex items-center gap-2"
                    >
                        Return to Home
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-32">
                        <div className="w-16 h-16 border-4 border-chiffon/10 border-t-chiffon rounded-full animate-spin shadow-2xl" />
                    </div>
                ) : error ? (
                    <div className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-12 text-center backdrop-blur-xl">
                        <p className="text-red-400 font-bold text-lg mb-6">{error}</p>
                        <button
                            onClick={() => dispatch(fetchOrders())}
                            className="px-8 py-3 bg-red-500 text-chiffon font-black uppercase text-xs tracking-[0.25em] rounded-xl hover:bg-red-600 transition-all"
                        >
                            Retry Connection
                        </button>
                    </div>
                ) : !orders || orders.length === 0 ? (
                    <div className="bg-chiffon/5 border border-chiffon/10 rounded-[3rem] p-20 text-center backdrop-blur-xl">
                        <div className="w-24 h-24 bg-chiffon/10 rounded-full flex items-center justify-center mx-auto mb-8">
                            <svg className="w-10 h-10 text-chiffon/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black mb-4">No acquisitions found.</h2>
                        <p className="text-chiffon/40 font-bold mb-10 max-w-md mx-auto">
                            Start your journey by exploring our curated selection of premium pieces.
                        </p>
                        <Link
                            to="/search"
                            className="inline-block px-12 py-4 bg-chiffon text-violet font-black rounded-2xl hover:bg-chiffon-dark transition-all shadow-2xl uppercase tracking-widest text-sm"
                        >
                            Shop Now
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order) => {
                            const items = getItems(order)
                            return (
                                <div
                                    key={order.id}
                                    className="bg-chiffon/5 border border-chiffon/10 rounded-[2.5rem] p-8 backdrop-blur-xl hover:bg-chiffon/10 transition-all duration-500 group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                                        <div className="flex items-center gap-6">
                                            {/* Grouped Images */}
                                            <div className="flex -space-x-8 group-hover:-space-x-4 transition-all duration-500">
                                                {items.slice(0, 3).map((item, idx) => {
                                                    const img = item.product_image
                                                    return (
                                                        <div key={item.id} className="w-16 h-20 rounded-xl overflow-hidden bg-chiffon/10 border-2 border-violet shadow-2xl relative z-[idx]">
                                                            {img ? (
                                                                <img src={img} alt="Product" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-center p-1 bg-chiffon/10 uppercase">N/A</div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                                {items.length > 3 && (
                                                    <div className="w-16 h-20 rounded-xl bg-chiffon text-violet flex items-center justify-center font-black text-sm border-2 border-violet shadow-2xl relative z-10">
                                                        +{items.length - 3}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-chiffon/30 mb-1">
                                                    Order Ident: #{order.id}
                                                </p>
                                                <p className="text-chiffon font-black text-xl tracking-tight leading-none">
                                                    {order.created_at
                                                        ? new Date(order.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
                                                        : 'Recent Acquisition'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 self-end md:self-auto">
                                            <div className="text-right">
                                                <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.25em] mb-2 ${order.status === 'pending'
                                                    ? 'bg-amber-400/20 text-amber-300 border border-amber-300/30'
                                                    : order.status === 'cancelled'
                                                        ? 'bg-red-500/20 text-red-300 border border-red-300/30'
                                                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-300/30'
                                                    }`}>
                                                    {order.status || 'pending'}
                                                </span>
                                                <p className="text-3xl font-black text-chiffon tracking-tighter">
                                                    ₹{order.total_price?.toLocaleString() || '0.00'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-chiffon/5 pt-8 space-y-4">
                                        {items.map((item) => {
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between text-sm group/item"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-chiffon/5 overflow-hidden flex-shrink-0 border border-chiffon/10">
                                                            {item.product_image ? (
                                                                <img src={item.product_image} alt="" className="w-full h-full object-cover opacity-50 group-hover/item:opacity-100 transition-opacity" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[8px] text-chiffon/20 uppercase font-black">?</div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-chiffon group-hover/item:text-white transition-colors">
                                                                {item.product_name || 'Premium Piece'}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-chiffon/40 uppercase tracking-widest">
                                                                {item.product_category && <span className="mr-2">{item.product_category} •</span>}
                                                                Size:{' '}
                                                                <span className="text-chiffon/60">
                                                                    {item.size?.size || item.size_name || item.size || '—'}
                                                                </span>{' '}
                                                                • Qty:{' '}
                                                                <span className="text-chiffon/60">{item.quantity}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="font-black text-chiffon/80">
                                                        ₹{item.price?.toLocaleString() || '0.00'}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {order.status === 'pending' && (
                                        <div className="pt-8 flex justify-end">
                                            <button
                                                onClick={() => handleCancel(order.id, order.status)}
                                                className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-red-500/10 text-red-300 border border-red-300/40 hover:bg-red-500/20 transition-all active:scale-[0.98]"
                                            >
                                                Cancel Order
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrdersPage
