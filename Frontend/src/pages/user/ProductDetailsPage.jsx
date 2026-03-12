import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductById, clearSelectedProduct } from '../../features/products/productSlice'
import { addItemToCart, resetAddSuccess } from '../../features/cart/cartSlice'


const ProductDetailsPage = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [activeImage, setActiveImage] = useState(0)
    const [qty, setQty] = useState(1)
    const [selectedSize, setSelectedSize] = useState(null)
    const { selectedProduct: product, loading, error } = useSelector((s) => s.products)
    const availableSizes = (product?.sizes && product.sizes.length > 0) ? product.sizes : (product?.available_sizes && product.available_sizes.length > 0) ? product.available_sizes : ['S', 'M', 'L', 'XL']
    const getSizeLabel = (s) => (s == null ? '' : typeof s === 'object' ? (s.size ?? s.name ?? s.label ?? String(s)) : String(s))
    const getSizeKey = (s, i) => (typeof s === 'object' && s.id != null) ? s.id : (typeof s === 'object' ? getSizeLabel(s) : s) || i
    const { loading: cartLoading, addSuccess } = useSelector((s) => s.cart)
    const { isAuthenticated } = useSelector((s) => s.auth)
    const [showAuthWarning, setShowAuthWarning] = useState(false)

    useEffect(() => {
        dispatch(fetchProductById(id))
        dispatch(resetAddSuccess())
        return () => dispatch(clearSelectedProduct())
    }, [dispatch, id])

    useEffect(() => {
        if (addSuccess) {
            setShowAuthWarning(false)
        }
    }, [addSuccess])

    useEffect(() => {
        if (product) {
            const sizes = (product.sizes && product.sizes.length > 0) ? product.sizes : (product.available_sizes && product.available_sizes.length > 0) ? product.available_sizes : ['S', 'M', 'L', 'XL']
            const firstLabel = sizes[0] == null ? null : (typeof sizes[0] === 'object' ? (sizes[0].size ?? sizes[0].name ?? sizes[0].label) : sizes[0])
            setSelectedSize((prev) => {
                const labels = sizes.map((s) => typeof s === 'object' ? (s.size ?? s.name ?? s.label) : s)
                return (prev && labels.includes(prev)) ? prev : firstLabel
            })
        }
    }, [product])

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            setShowAuthWarning(true)
            return
        }
        if (product) {
            dispatch(addItemToCart({
                productName: product.name,
                quantity: qty,
                size: selectedSize || getSizeLabel(availableSizes[0])
            }))
        }
    }

    if (loading) {
        return (
            <div className="h-screen overflow-hidden bg-violet flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-chiffon/20 border-t-chiffon rounded-full animate-spin shadow-2xl" />
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="h-screen overflow-hidden bg-violet flex items-center justify-center p-4">
                <div className="bg-chiffon/10 backdrop-blur-3xl border border-chiffon/20 rounded-3xl p-12 max-w-lg w-full text-center">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-chiffon mb-2">Piece Not Found</h2>
                    <p className="text-chiffon/40 mb-8 leading-relaxed">The Product you are looking for might have been acquired or moved to a different gallery.</p>
                    <Link to="/home" className="inline-block px-8 py-3 bg-chiffon text-violet font-black rounded-xl shadow-xl hover:bg-chiffon-dark transition-all">
                        Return to Gallery
                    </Link>
                </div>
            </div>
        )
    }

    const images = product.images && product.images.length > 0
        ? product.images
        : [{ url: 'https://placehold.co/1200x1200?text=Premium+Piece' }]

    return (
        <div className="h-screen overflow-hidden bg-violet">


            {/* mt-[60px] clears the fixed navbar (py-3 + h-9 = ~60px) */}
            <div className="h-[calc(100vh-60px)] mt-[60px] max-w-6xl w-full mx-auto px-6 flex flex-col py-5">

                {/* Breadcrumb */}
                <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.25em] mb-5 flex-shrink-0">
                    <Link to="/" className="text-white/60 hover:text-white transition-colors">Gallery</Link>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                    <span className="text-white/70">{product.category || 'Collection'}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                    <span className="text-white font-extrabold">{product.name}</span>
                </div>

                {/* Two-column layout — fills all remaining space */}
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* ── Left: Main image — capped height so it fits below navbar ── */}
                    <div className="lg:col-span-7 min-h-0 max-h-[100vh] max-w-[65vh] rounded-3xl overflow-hidden bg-chiffon/5 border border-chiffon/10">
                        <img
                            src={images[activeImage].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* ── Right: Product info ── */}
                    <div className="lg:col-span-5 min-h-0 flex flex-col justify-center gap-5">

                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="px-2.5 py-0.5 rounded-full bg-chiffon/20 text-chiffon text-[9px] font-bold uppercase tracking-widest border border-chiffon/30">
                                {product.category || 'Premium Selection'}
                            </span>
                            {product.is_featured && (
                                <span className="text-chiffon/60 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-chiffon animate-pulse" />Featured
                                </span>
                            )}
                            {product.is_bestseller && (
                                <span className="text-chiffon/60 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-chiffon animate-pulse" />Bestseller
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold text-chiffon tracking-tighter leading-none flex-shrink-0">
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 flex-shrink-0">
                            <span className="text-3xl font-bold text-chiffon tracking-tighter">₹{product.price}</span>                        </div>

                        <div className="h-px bg-chiffon/10 w-full flex-shrink-0" />

                        {/* Thumbnail strip */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeImage === idx ? 'border-chiffon' : 'border-transparent opacity-50 hover:opacity-80'}`}
                                    >
                                        <img src={img.url} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <p className="text-chiffon/70 text-sm leading-relaxed font-medium flex-shrink-0">
                            {product.description || 'A masterpiece of contemporary design, crafted for those who demand excellence. Every detail reflects a commitment to quality and aesthetic perfection.'}
                        </p>

                        {/* Size selection */}
                        <div className="flex-shrink-0">
                            <span className="text-chiffon/40 text-[9px] font-bold uppercase tracking-widest block mb-2">Select Size</span>
                            <div className="flex flex-wrap gap-2">
                                {availableSizes.map((size, i) => {
                                    const sizeLabel = getSizeLabel(size)
                                    const isSelected = (selectedSize || getSizeLabel(availableSizes[0])) === sizeLabel
                                    return (
                                        <button
                                            key={getSizeKey(size, i)}
                                            onClick={() => setSelectedSize(sizeLabel)}
                                            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200 ${isSelected
                                                ? 'bg-chiffon text-violet'
                                                : 'bg-chiffon/5 text-chiffon border border-chiffon/10 hover:bg-chiffon/10'
                                                }`}
                                        >
                                            {sizeLabel}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Qty + Add to Cart */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="flex items-center bg-chiffon/5 border border-chiffon/10 rounded-2xl p-1.5">
                                <button
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-chiffon/60 hover:bg-chiffon/10 hover:text-chiffon transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                </button>
                                <span className="w-8 text-center text-chiffon font-bold text-sm">{qty}</span>
                                <button
                                    onClick={() => setQty(qty + 1)}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-chiffon/60 hover:bg-chiffon/10 hover:text-chiffon transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={cartLoading || addSuccess}
                                className={`flex-1 py-4 font-bold text-base rounded-2xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 ${addSuccess
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-chiffon text-violet hover:bg-chiffon-dark'
                                    }`}
                            >
                                {cartLoading ? (
                                    <div className="w-6 h-6 border-2 border-violet/20 border-t-violet rounded-full animate-spin" />
                                ) : addSuccess ? (
                                    <>
                                        Added to Cart
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </>
                                ) : (
                                    <>
                                        Add to Cart
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>

                        {showAuthWarning && (
                            <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-in fade-in slide-in-from-top-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-300">Login is required to add items to bag</p>
                                <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-chiffon underline underline-offset-2 hover:text-white transition-colors">Sign In</Link>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetailsPage
