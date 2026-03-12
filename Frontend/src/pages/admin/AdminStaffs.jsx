import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllStaffs, toggleBlockStaff, setStaffFilters, deleteAdminStaff, demoteToUser } from '../../features/admin/adminSlice'
import ConfirmationModal from '../../components/common/ConfirmationModal'

const AdminStaffs = () => {
    const dispatch = useDispatch()
    const { staffs, staffsCount, staffsNext, staffsPrevious, staffFilters, loading, error } = useSelector((s) => s.admin)
    const { user: currentUser } = useSelector((s) => s.auth)

    useEffect(() => {
        dispatch(fetchAllStaffs(staffFilters))
    }, [dispatch, staffFilters])

    const handleSearch = (e) => {
        dispatch(setStaffFilters({ search: e.target.value }))
    }

    const [modal, setModal] = React.useState({ isOpen: false, type: '', staffId: null, title: '', message: '', action: null })

    const handleToggleBlock = (staffId) => {
        const staffMember = staffs.find(s => s.id === staffId)
        const isActive = staffMember?.is_active !== false
        setModal({
            isOpen: true,
            type: 'warning',
            staffId,
            title: isActive ? 'Block Staff Member?' : 'Unblock Staff Member?',
            message: isActive ? 'Are you sure you want to restrict this staff member\'s access?' : 'Restore this staff member\'s access to the system?',
            action: () => dispatch(toggleBlockStaff(staffId))
        })
    }

    const handleDelete = (staffId) => {
        setModal({
            isOpen: true,
            type: 'danger',
            staffId,
            title: 'Delete Staff Member?',
            message: 'Permanently remove this staff member from the system? This action cannot be reversed.',
            action: () => dispatch(deleteAdminStaff(staffId))
        })
    }

    const handleDemote = (staffId) => {
        setModal({
            isOpen: true,
            type: 'warning',
            staffId,
            title: 'Regress to User?',
            message: 'Are you sure you want to demote this Admin? They will lose all administrative privileges.',
            action: () => dispatch(demoteToUser(staffId))
        })
    }

    const isSuperAdmin = currentUser?.role?.toLowerCase() === 'superadmin' || currentUser?.is_superuser;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white">Staff Administration</h2>
                <p className="text-slate-400 text-sm mt-1">Manage staff members and their system access.</p>
            </div>

            {/* Role filtering */}
            <div className="flex flex-wrap items-center gap-2">
                {[
                    { label: 'All', value: '' },
                    { label: 'Admin', value: 'admin' },
                    { label: 'Super Admin', value: 'superadmin' },
                ].map((tab) => (
                    <button
                        key={tab.label}
                        onClick={() => dispatch(setStaffFilters({ role: tab.value }))}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${staffFilters.role === tab.value
                            ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                {/* Staff search */}
                <div className="p-6 border-b border-slate-700">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={staffFilters.search}
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
                                <th className="px-6 py-3 font-semibold">Staff Member</th>
                                <th className="px-6 py-3 font-semibold">Email</th>
                                <th className="px-6 py-3 font-semibold">Role</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading && staffs.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4 bg-slate-800 text-transparent">Loading</td>
                                    </tr>
                                ))
                            ) : staffs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No staff members found
                                    </td>
                                </tr>
                            ) : (
                                staffs.map((staff) => {
                                    // Status check
                                    const isActive = staff.is_active !== false;
                                    return (
                                        <tr key={staff.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                                                        {(staff.name || staff.username || staff.email || 'S')[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white truncate max-w-[200px]">{staff.name || staff.username || '—'}</p>
                                                        {staff.created_at && (
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Since {new Date(staff.created_at).toLocaleDateString()}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-300">{staff.email}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400 capitalize">
                                                    {staff.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                    {isActive ? 'Active' : 'Blocked'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {isSuperAdmin ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        {staff.id !== (currentUser?.id || currentUser?.user_id) ? (
                                                            <>
                                                                {staff.role === 'admin' && (
                                                                    <button
                                                                        onClick={() => handleDemote(staff.id)}
                                                                        className="px-3 py-1.5 rounded text-xs font-medium bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                                                                        title="Demote to User"
                                                                    >
                                                                        Demote
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleToggleBlock(staff.id)}
                                                                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${isActive
                                                                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
                                                                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                                                                        }`}
                                                                >
                                                                    {isActive ? 'Block' : 'Unblock'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(staff.id)}
                                                                    className="p-1.5 rounded text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                                                    title="Delete Staff"
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
                                                ) : (
                                                    <span className="text-xs text-slate-500 italic">No actions available</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table navigation */}
                <div className="p-4 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/50">
                    <span className="text-sm text-slate-400">
                        Page <span className="font-semibold text-white">{staffFilters.page}</span> · <span className="font-semibold text-white">{staffsCount}</span> total staff
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => staffsPrevious && dispatch(setStaffFilters({ page: staffFilters.page - 1 }))}
                            disabled={!staffsPrevious}
                            className="px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-slate-900/50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => staffsNext && dispatch(setStaffFilters({ page: staffFilters.page + 1 }))}
                            disabled={!staffsNext}
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
                confirmText="Confirm Action"
            />
        </div>
    )
}

export default AdminStaffs
