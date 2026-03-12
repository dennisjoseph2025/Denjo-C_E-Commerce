import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStats } from '../../features/admin/adminSlice'

const AdminReports = () => {
    const dispatch = useDispatch()
    const { stats, loading, error } = useSelector((s) => s.admin)

    useEffect(() => {
        dispatch(fetchStats())
    }, [dispatch])

    if (loading && !stats.total_revenue) {
        return <div className="flex items-center justify-center py-20"><div className="w-12 h-12 border-4 border-chiffon/20 border-t-chiffon rounded-full animate-spin"></div></div>
    }

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-2xl font-bold text-white">Financial Insights</h2>
                <p className="text-slate-400 text-sm mt-1">Company performance overview.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm transition-hover hover:border-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Total Gross Revenue</p>
                    <p className="text-4xl font-bold tracking-tight text-emerald-400">₹{stats.total_revenue?.toLocaleString()}</p>
                </div>
                <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm transition-hover hover:border-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Acquisition Count</p>
                    <p className="text-4xl font-bold tracking-tight text-blue-400">{stats.total_orders}</p>
                </div>
                <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm transition-hover hover:border-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Constituent Base</p>
                    <p className="text-4xl font-bold tracking-tight text-indigo-400">{stats.total_users}</p>
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-white mb-6">Recent Sales Gallery</h3>
                {stats.recent_sales?.length > 0 ? (
                    <div className="space-y-3">
                        {stats.recent_sales.map((sale, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold border border-slate-600">
                                        {sale.user?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{sale.user || 'Secret Client'}</p>
                                        <p className="text-xs text-slate-500">{new Date(sale.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-emerald-400">₹{sale.total?.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
                        <p className="text-slate-400 text-sm font-medium">No recent movements in a vault</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminReports
