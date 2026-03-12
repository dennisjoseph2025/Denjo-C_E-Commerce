import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllUsers, toggleBlockUser, setUserFilters, deleteAdminUser, promoteToAdmin } from '../../features/admin/adminSlice'
import ConfirmationModal from '../../components/common/ConfirmationModal'

const AdminUsers = () => {
    const dispatch = useDispatch()
    const { users, usersCount, usersNext, usersPrevious, userFilters, loading, error } = useSelector((s) => s.admin)
    const { user: currentUser } = useSelector((s) => s.auth)

    useEffect(() => {
        dispatch(fetchAllUsers(userFilters))
    }, [dispatch, userFilters])

    const handleSearch = (e) => {
        dispatch(setUserFilters({ search: e.target.value }))
    }

    const [modal, setModal] = React.useState({ isOpen: false, type: '', userId: null, title: '', message: '', action: null })

    const handleToggleBlock = (userId) => {
        const user = users.find(u => u.id === userId)
        const isActive = user?.is_active !== false
        setModal({
            isOpen: true,
            type: 'warning',
            userId,
            title: isActive ? 'Block User?' : 'Unblock User?',
            message: isActive ? 'Are you sure you want to restrict this user\'s access to the platform?' : 'Restore this user\'s access to the platform?',
            action: () => dispatch(toggleBlockUser(userId))
        })
    }

    const handleDelete = (userId) => {
        setModal({
            isOpen: true,
            type: 'danger',
            userId,
            title: 'Delete User?',
            message: 'Permanently remove this user and all associated data? This action is irreversible.',
            action: () => dispatch(deleteAdminUser(userId))
        })
    }

    const handlePromote = (userId) => {
        setModal({
            isOpen: true,
            type: 'warning',
            userId,
            title: 'Grant Admin Access?',
            message: 'Are you sure you want to promote this user to an Administrative role?',
            action: () => dispatch(promoteToAdmin(userId))
        })
    }

    const isSuperAdmin = currentUser?.role?.toLowerCase() === 'superadmin' || currentUser?.is_superuser;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white">User Administration</h2>
                <p className="text-slate-400 text-sm mt-1">Control access to the platform.</p>
            </div>

            {/* Status filtering */}
            <div className="flex flex-wrap items-center gap-2">
                {[
                    { label: 'All', value: '' },
                    { label: 'Active', value: 'true' },
                    { label: 'Blocked', value: 'false' },
                ].map((tab) => (
                    <button
                        key={tab.label}
                        onClick={() => dispatch(setUserFilters({ is_active: tab.value }))}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${userFilters.is_active === tab.value
                            ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                {/* User search */}
                <div className="p-6 border-b border-slate-700">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={userFilters.search}
                            onChange={handleSearch}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500 shadow-inner"
                        />
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-900/50 border-b border-slate-700 text-slate-400">
                            <tr>
                                <th className="px-6 py-3 font-semibold">User</th>
                                <th className="px-6 py-3 font-semibold">Email</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading && users.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="px-6 py-4 bg-slate-800 text-transparent">Loading</td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => {
                                    // Status check
                                    const isActive = user.is_active !== false;
                                    return (
                                        <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                                                        {(user.name || user.username || user.email || 'U')[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white truncate max-w-[200px]">{user.name || user.username || '—'}</p>
                                                        {user.created_at && (
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Since {new Date(user.created_at).toLocaleDateString()}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-300">{user.email}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                    {isActive ? 'Active' : 'Blocked'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {user.id !== (currentUser?.id || currentUser?.user_id) ? (
                                                        <>
                                                            {isSuperAdmin && (
                                                                <button
                                                                    onClick={() => handlePromote(user.id)}
                                                                    className="px-3 py-1.5 rounded text-xs font-medium bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors"
                                                                    title="Promote to Admin"
                                                                >
                                                                    Promote
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleToggleBlock(user.id)}
                                                                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${isActive
                                                                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
                                                                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                                                                    }`}
                                                            >
                                                                {isActive ? 'Block' : 'Unblock'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(user.id)}
                                                                className="p-1.5 rounded text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                                                title="Delete User"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-slate-500 italic px-3">Current User</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/50">
                    <span className="text-sm text-slate-400">
                        Page <span className="font-semibold text-white">{userFilters.page}</span> · <span className="font-semibold text-white">{usersCount}</span> total users
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => usersPrevious && dispatch(setUserFilters({ page: userFilters.page - 1 }))}
                            disabled={!usersPrevious}
                            className="px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-slate-900/50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => usersNext && dispatch(setUserFilters({ page: userFilters.page + 1 }))}
                            disabled={!usersNext}
                            className="px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-slate-900/50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
            <ConfirmationModal
                isOpen={modal.isOpen}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onConfirm={modal.action}
                onCancel={() => setModal({ ...modal, isOpen: false })}
                confirmText="Proceed"
            />
        </div>
    )
}

export default AdminUsers
