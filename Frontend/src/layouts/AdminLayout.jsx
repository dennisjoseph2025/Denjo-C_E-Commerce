import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../components/Sidebar'

const AdminLayout = () => {
    const { user, isAuthenticated } = useSelector((s) => s.auth)

    // Basic admin check - adjust based on your actual role field
    const role = user?.role?.toLowerCase()
    const isAdmin = role === 'admin' || role === 'superadmin' || user?.is_staff || user?.is_superuser

    if (!isAuthenticated || !isAdmin) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="min-h-screen bg-slate-900 flex relative font-sans antialiased text-slate-100">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 px-8 py-4 flex items-center justify-between shadow-sm">
                    <h1 className="text-lg font-bold text-white tracking-tight">Admin Console</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-white">{user.name}</p>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{user.role || 'Administrator'}</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 text-xs font-bold ring-2 ring-slate-800">
                            {user.name?.charAt(0)}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
