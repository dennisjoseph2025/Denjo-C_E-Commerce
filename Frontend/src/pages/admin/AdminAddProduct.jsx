import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createProduct, fetchFilterData } from '../../features/products/productSlice'

const AdminAddProduct = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { categories, subcategories, sizes: availableSizes, loading, error } = useSelector((s) => s.products)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        subcategory: '',
    })

    const [sizeEntries, setSizeEntries] = useState([{ size: '', stock: '' }])
    const [imageEntries, setImageEntries] = useState([{ url: '', is_primary: true }])

    useEffect(() => {
        dispatch(fetchFilterData())
    }, [dispatch])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            const updated = { ...prev, [name]: value }
            // Reset subcategory when category changes
            if (name === 'category') updated.subcategory = ''
            return updated
        })
    }

    // Resolves size labels dynamically from backend size objects (handles 'size', 'name', or 'label')
    const getSizeLabel = (s) => (s == null ? '' : typeof s === 'object' ? (s.size ?? s.name ?? s.label ?? String(s)) : String(s))

    // --- Size Management Handlers ---
    const handleSizeChange = (index, field, value) => {
        setSizeEntries(prev => prev.map((entry, i) => i === index ? { ...entry, [field]: value } : entry))
    }
    const addSizeEntry = () => setSizeEntries(prev => [...prev, { size: '', stock: '' }])
    const removeSizeEntry = (index) => setSizeEntries(prev => prev.filter((_, i) => i !== index))

    // --- Image Management Handlers ---
    const handleImageChange = (index, field, value) => {
        setImageEntries(prev => prev.map((entry, i) => {
            if (field === 'is_primary' && value === true) {
                return i === index ? { ...entry, is_primary: true } : { ...entry, is_primary: false }
            }
            return i === index ? { ...entry, [field]: value } : entry
        }))
    }
    const addImageEntry = () => setImageEntries(prev => [...prev, { url: '', is_primary: false }])
    const removeImageEntry = (index) => setImageEntries(prev => prev.filter((_, i) => i !== index))

    const handleSubmit = async (e) => {
        e.preventDefault()

        const payload = {
            name: formData.name,
            description: formData.description,
            price: formData.price,
            category: formData.category,
            subcategory: formData.subcategory,
            images: imageEntries.filter(img => img.url.trim() !== ''),
            sizes: sizeEntries
                .filter(s => s.size && s.stock !== '')
                .map(s => ({ size: s.size, stock: Number(s.stock) })),
        }

        const resultAction = await dispatch(createProduct(payload))
        if (createProduct.fulfilled.match(resultAction)) {
            navigate('/admin/products')
        }
    }

    const inputBase = "bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-white tracking-tight">Add New Product</h2>
                <p className="text-slate-400 text-sm mt-2">Introduce a new masterpiece to your curated collection.</p>
            </div>

            {error && (
                <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 animate-in fade-in slide-in-from-top-2">
                    {typeof error === 'string' ? error : JSON.stringify(error)}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl space-y-10">

                {/* Core Product Details */}
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Product Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className={`${inputBase} w-full`} placeholder="e.g., Midnight Velvet Blazer" />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={`${inputBase} w-full leading-relaxed`} placeholder="Detail the craftsmanship, material, and unique story of this piece..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Price (₹)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required className={`${inputBase} w-full font-semibold`} placeholder="0.00" step="0.01" />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} required className={`${inputBase} w-full cursor-pointer pr-10`}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Sub-Category</label>
                            <select name="subcategory" value={formData.subcategory} onChange={handleChange} required className={`${inputBase} w-full cursor-pointer pr-10`} disabled={!formData.category}>
                                <option value="">{formData.category ? 'Select Sub-Category' : 'Select category first'}</option>
                                {subcategories.filter(s => s.category === formData.category).map(s => (
                                    <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-700/50 w-full" />

                {/* Product Inventory Configuration */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold text-white">Sizes & Stock</h3>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Define availability across variants.</p>
                        </div>
                        <button type="button" onClick={addSizeEntry} className="text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 group">
                            <span className="p-1 rounded-md bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            </span>
                            Add Size
                        </button>
                    </div>
                    <div className="space-y-4">
                        {sizeEntries.map((entry, index) => (
                            <div key={index} className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 transition-all">
                                <div className="w-48 shrink-0">
                                    <select
                                        value={entry.size}
                                        onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                                        className={`${inputBase} w-full cursor-pointer pr-10`}
                                        required
                                    >
                                        <option value="">Select Size</option>
                                        {availableSizes.map(s => {
                                            const label = getSizeLabel(s)
                                            return (
                                                <option key={s.id || label} value={label} disabled={sizeEntries.some((se, si) => si !== index && se.size === label)}>
                                                    {label}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        value={entry.stock}
                                        onChange={(e) => handleSizeChange(index, 'stock', e.target.value)}
                                        placeholder="Stock quantity"
                                        min="0"
                                        required
                                        className={`${inputBase} w-full font-medium`}
                                    />
                                </div>
                                {sizeEntries.length > 1 && (
                                    <button type="button" onClick={() => removeSizeEntry(index)} className="p-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-slate-700/50 w-full" />

                {/* Multimedia Assets */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-bold text-white">Visual Assets</h3>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Showcase your product from every angle.</p>
                        </div>
                        <button type="button" onClick={addImageEntry} className="text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 group">
                            <span className="p-1 rounded-md bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            </span>
                            Add Image
                        </button>
                    </div>
                    <div className="space-y-4">
                        {imageEntries.map((entry, index) => (
                            <div key={index} className="flex flex-col md:flex-row md:items-center gap-4 animate-in fade-in slide-in-from-left-2">
                                <div className="flex-1 relative group">
                                    <input
                                        type="url"
                                        value={entry.url}
                                        onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                                        placeholder="https://images.luxury.com/item-angle-1.jpg"
                                        required
                                        className={`${inputBase} w-full pr-12`}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/50 cursor-pointer whitespace-nowrap select-none hover:border-indigo-500/50 transition-all group">
                                        <input
                                            type="radio"
                                            name="primary_image"
                                            checked={entry.is_primary}
                                            onChange={() => handleImageChange(index, 'is_primary', true)}
                                            className="accent-indigo-500 w-4 h-4"
                                        />
                                        <span className={`text-xs font-bold uppercase tracking-widest ${entry.is_primary ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>Primary</span>
                                    </label>
                                    {imageEntries.length > 1 && (
                                        <button type="button" onClick={() => removeImageEntry(index)} className="p-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Visual Preview Matrix */}
                    {imageEntries.some(img => img.url) && (
                        <div className="mt-8 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 p-4 rounded-2xl bg-slate-900/30 border border-slate-700/50">
                            {imageEntries.filter(img => img.url).map((img, i) => (
                                <div key={i} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${img.is_primary ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-700 hover:border-slate-500'}`}>
                                    <img src={img.url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Form Actions */}
                <div className="pt-8 flex items-center justify-end gap-6 border-t border-slate-700/50">
                    <button type="button" onClick={() => navigate('/admin/products')} className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                        Discard Changes
                    </button>
                    <button type="submit" disabled={loading} className="px-10 py-4 bg-indigo-600 text-white font-bold text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Processing...' : 'Catalog Product'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AdminAddProduct
