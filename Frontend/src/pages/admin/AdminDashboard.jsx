import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStats } from '../../features/admin/adminSlice'
import { Link } from 'react-router-dom'

const StatCard = ({ label, value, color, icon }) => (
    <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm transition-all hover:border-slate-600">
        <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-700">
                {icon}
            </div>
        </div>
        <p className={`text-3xl font-bold tracking-tight ${color}`}>{value}</p>
    </div>
)

const MiniStat = ({ label, value, color }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
        <span className="text-sm text-slate-400">{label}</span>
        <span className={`text-sm font-semibold ${color || 'text-white'}`}>{value}</span>
    </div>
)

const AdminDashboard = () => {
    const dispatch = useDispatch()
    const { stats, loading } = useSelector((s) => s.admin)

    useEffect(() => {
        dispatch(fetchStats())
    }, [dispatch])

    const orders = stats?.orders || {}
    const revenue = stats?.revenue || {}
    const products = stats?.products || {}
    const users = stats?.users || {}

    if (loading && !stats?.orders) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
                <p className="text-slate-400 text-sm mt-1">Real-time insights into your business performance.</p>
            </div>

            {/* Top-level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Revenue"
                    value={`₹${Number(revenue.total || 0).toLocaleString()}`}
                    color="text-emerald-400"
                    icon={<svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard
                    label="Total Orders"
                    value={orders.total || 0}
                    color="text-indigo-400"
                    icon={<svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                />
                <StatCard
                    label="Total Products"
                    value={products.total || 0}
                    color="text-purple-400"
                    icon={<svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
                />
                <StatCard
                    label="Total Users"
                    value={users.total || 0}
                    color="text-blue-400"
                    icon={<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                />
            </div>

            {/* Detailed Breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Orders Breakdown */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold text-white">Orders Breakdown</h3>
                        <Link to="/admin/orders" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">View All</Link>
                    </div>
                    <div className="space-y-0">
                        <MiniStat label="Pending" value={orders.pending || 0} color="text-yellow-400" />
                        <MiniStat label="Confirmed" value={orders.confirmed || 0} color="text-blue-400" />
                        <MiniStat label="Shipped" value={orders.shipped || 0} color="text-purple-400" />
                        <MiniStat label="Delivered" value={orders.delivered || 0} color="text-emerald-400" />
                        <MiniStat label="Cancelled" value={orders.cancelled || 0} color="text-red-400" />
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold text-white">Revenue Breakdown</h3>
                    </div>
                    <div className="space-y-0">
                        <MiniStat label="Total" value={`₹${Number(revenue.total || 0).toLocaleString()}`} color="text-emerald-400" />
                        <MiniStat label="Confirmed" value={`₹${Number(revenue.confirmed || 0).toLocaleString()}`} color="text-blue-400" />
                        <MiniStat label="Shipped" value={`₹${Number(revenue.shipped || 0).toLocaleString()}`} color="text-purple-400" />
                        <MiniStat label="Delivered" value={`₹${Number(revenue.delivered || 0).toLocaleString()}`} color="text-emerald-400" />
                    </div>
                </div>

                {/* Products & Users */}
                <div className="space-y-6">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-bold text-white">Products</h3>
                            <Link to="/admin/products" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Manage</Link>
                        </div>
                        <div className="space-y-0">
                            <MiniStat label="Active" value={products.active || 0} color="text-emerald-400" />
                            <MiniStat label="Out of Stock" value={products.out_of_stock || 0} color="text-red-400" />
                            <MiniStat label="Featured" value={products.featured || 0} color="text-yellow-400" />
                            <MiniStat label="Bestsellers" value={products.bestsellers || 0} color="text-purple-400" />
                        </div>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-bold text-white">Users</h3>
                            <Link to="/admin/users" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Manage</Link>
                        </div>
                        <div className="space-y-0">
                            <MiniStat label="Active" value={users.active || 0} color="text-emerald-400" />
                            <MiniStat label="Blocked" value={users.blocked || 0} color="text-red-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
