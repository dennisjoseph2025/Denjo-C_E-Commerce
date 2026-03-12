import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { fetchProducts, setFilters, deleteProduct } from '../../features/products/productSlice'
import ConfirmationModal from '../../components/common/ConfirmationModal'

const AdminProducts = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { items, loading, error, count, filters, next, previous } = useSelector((s) => s.products)
    const { user: currentUser } = useSelector((s) => s.auth)

    useEffect(() => {
        dispatch(fetchProducts(filters))
    }, [dispatch, filters])

    const handleSearch = (e) => {
        dispatch(setFilters({ search: e.target.value }))
    }

    const [modalConfig, setModalConfig] = React.useState({ isOpen: false, productId: null })

    const handleDelete = (id) => {
        setModalConfig({ isOpen: true, productId: id })
    }

    const confirmDelete = () => {
        if (modalConfig.productId) {
            dispatch(deleteProduct(modalConfig.productId))
        }
    }

    const isSuperAdmin = currentUser?.role?.toLowerCase() === 'superadmin' || currentUser?.is_superuser;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
                    <p className="text-slate-400 text-sm mt-1">Manage your shop's offerings.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/products/add')}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Product
                </button>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search by name or category..."
                                value={filters.search}
                                onChange={handleSearch}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500 shadow-inner"
                            />
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-900/50 border-b border-slate-700 text-slate-400">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Product</th>
                                <th className="px-6 py-3 font-semibold">Category</th>
                                <th className="px-6 py-3 font-semibold">Price</th>
                                <th className="px-6 py-3 font-semibold">Stock</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading && items.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4 bg-slate-800 text-transparent">Loading</td>
                                    </tr>
                                ))
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No products found
                                    </td>
                                </tr>
                            ) : (
                                items.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-md bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                                                    {product.images?.[0]?.url ? (
                                                        <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] text-slate-500 font-medium">No Img</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white truncate max-w-[200px]">{product.name}</p>
                                                    <p className="text-xs text-slate-500">ID: {product.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-700 text-slate-300">
                                                {product.category || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-200">
                                            ₹{product.price?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${product.stock > 10 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {product.stock} units
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                                    className="p-1.5 rounded text-slate-400 hover:bg-slate-700 hover:text-indigo-400 transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                {isSuperAdmin && (
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-1.5 rounded text-slate-400 hover:bg-slate-700 hover:text-red-400 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table navigation */}
                <div className="p-4 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/50">
                    <span className="text-sm text-slate-400">
                        Showing page <span className="font-semibold text-white">{filters.page}</span> (Total <span className="font-semibold text-white">{count}</span> items)
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => previous && dispatch(setFilters({ page: filters.page - 1 }))}
                            disabled={!previous}
                            className="px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-slate-900/50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => next && dispatch(setFilters({ page: filters.page + 1 }))}
                            disabled={!next}
                            className="px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-slate-900/50"
                        >
                            Next
                        </button>
                    </div>
                </div>

            </div>
            <ConfirmationModal 
                isOpen={modalConfig.isOpen}
                title="Remove from Catalog?"
                message="Are you certain you wish to permanently remove this piece from your curated collection?"
                onConfirm={confirmDelete}
                onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
                confirmText="Remove"
                type="danger"
            />
        </div>
    )
}

export default AdminProducts
