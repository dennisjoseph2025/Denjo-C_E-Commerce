import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, fetchFilterData, setFilters, resetFilters } from '../../features/products/productSlice'
import ProductCard from '../../components/ProductCard'
// import ProductCard from '../../components/ProductCard'

const SearchPage = () => {
    const dispatch = useDispatch()
    const { items, categories, subcategories, filters, loading, count, next, previous } = useSelector((s) => s.products)

    // Set price range to max by default
    const [priceRange, setPriceRange] = useState(filters.max_price || 5000)

    useEffect(() => {
        dispatch(fetchProducts(filters))
        dispatch(fetchFilterData())
    }, [dispatch, filters])

    const handleCategoryClick = (catName) => {
        // Clear subcategory when category changes
        dispatch(setFilters({
            category: filters.category === catName ? '' : catName,
            subcategory: ''
        }))
    }

    const handleSubcategoryClick = (subcatName) => {
        // Find the category for this subcategory
        const subcat = subcategories.find(s => s.name === subcatName)
        const parentCat = subcat ? subcat.category : ''

        dispatch(setFilters({
            category: parentCat,
            subcategory: filters.subcategory === subcatName ? '' : subcatName
        }))
    }

    // Handle pagination
    const handleNextPage = () => {
        if (next) dispatch(setFilters({ page: Number(filters.page) + 1 }))
    }

    const handlePrevPage = () => {
        if (previous) dispatch(setFilters({ page: Number(filters.page) - 1 }))
    }

    const handlePriceChange = (value) => {
        setPriceRange(value)
        dispatch(setFilters({ max_price: value }))
    }

    const handleReset = () => {
        dispatch(resetFilters())
        setPriceRange(5000)
    }


    return (
        <div className="min-h-screen bg-violet relative">


            {/* Background decorative blobs - Isolated in a fixed wrapper to prevent horizontal scroll without breaking sticky */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-24 -left-24 w-96 h-96 rounded-full bg-chiffon/5 blur-3xl" />
                <div className="absolute bottom-24 -right-16 w-80 h-80 rounded-full bg-chiffon/5 blur-3xl" />
            </div>

            <div className="w-full max-w-[1920px] mx-auto pt-32 pb-20 relative z-10 lg:pl-4 lg:pr-12">
                <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 pl-4 lg:pl-0">

                    {/* Left Sidebar Filters - Docked on the extreme left, sticky */}
                    <aside className="w-full lg:w-[15rem] xl:w-72 flex-shrink-0 space-y-10 order-1 border-r border-chiffon/10 pr-6 lg:sticky lg:top-32 lg:max-h-[calc(100vh-8rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-chiffon font-black text-xl tracking-tight">Filters</h3>
                                <button
                                    onClick={handleReset}
                                    className="text-chiffon/40 text-[10px] font-black uppercase tracking-widest hover:text-chiffon transition-colors"
                                >
                                    Reset
                                </button>
                            </div>

                            {/* Categories & Subcategories Nested */}
                            <div className="space-y-6">
                                <span className="text-chiffon/40 text-[10px] font-black uppercase tracking-[0.2em] block mb-2">Categories</span>
                                <div className="space-y-4">
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="space-y-2">
                                            <button
                                                onClick={() => handleCategoryClick(cat.name)}
                                                className={`w-full px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 border text-left flex items-center justify-between group ${filters.category === cat.name
                                                    ? 'bg-chiffon text-violet border-chiffon shadow-lg shadow-chiffon/20'
                                                    : 'bg-chiffon/5 text-chiffon border-chiffon/10 hover:bg-chiffon/10'
                                                    }`}
                                            >
                                                <span>{cat.name}</span>
                                                {filters.category === cat.name && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse" />
                                                )}
                                            </button>

                                            {/* Nested Subcategories for this Category */}
                                            <div className="pl-4 space-y-1 overflow-hidden transition-all duration-500">
                                                {subcategories
                                                    .filter(subcat => subcat.category === cat.name)
                                                    .map((subcat) => (
                                                        <button
                                                            key={subcat.id}
                                                            onClick={() => handleSubcategoryClick(subcat.name)}
                                                            className={`w-full px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 text-left border ${filters.subcategory === subcat.name
                                                                ? 'bg-chiffon/20 text-chiffon border-chiffon/30'
                                                                : 'text-chiffon/50 border-transparent hover:text-chiffon hover:bg-chiffon/5'
                                                                }`}
                                                        >
                                                            {subcat.name}
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-chiffon/40 text-[10px] font-black uppercase tracking-[0.2em]">Max Price</span>
                                <span className="text-chiffon font-black text-sm">₹{priceRange}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="5000"
                                step="50"
                                value={priceRange}
                                onChange={(e) => handlePriceChange(Number(e.target.value))}
                                className="w-full h-1.5 bg-chiffon/10 rounded-lg appearance-none cursor-pointer accent-chiffon"
                            />
                            <div className="flex justify-between text-[10px] font-black text-chiffon/30 uppercase tracking-widest">
                                <span>₹0</span>
                                <span>₹5000+</span>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content: Results Grid */}
                    <main className="flex-1 order-2">
                        <div className="mb-10">
                            <h1 className="text-4xl md:text-5xl font-black text-chiffon tracking-tighter">
                                {filters.search ? `Results for "${filters.search}"` : 'All Products'}
                            </h1>
                            <p className="text-chiffon/40 text-sm mt-2 font-medium">
                                Total {count} products
                            </p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="aspect-[3/4] rounded-[1.5rem] bg-chiffon/5 animate-pulse" />
                                ))}
                            </div>
                        ) : items.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                                    {items.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Premium Pagination Controls */}
                                <div className="mt-20 flex flex-col items-center gap-8">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handlePrevPage}
                                            disabled={!previous}
                                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border ${previous
                                                ? 'bg-chiffon/5 text-chiffon border-chiffon/10 hover:bg-chiffon/20 hover:scale-105 active:scale-95'
                                                : 'opacity-20 cursor-not-allowed border-chiffon/5 text-chiffon'
                                                }`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>

                                        <div className="px-6 py-2 rounded-xl bg-chiffon/10 border border-chiffon/20 text-chiffon text-xs font-black">
                                            PAGE {filters.page}
                                        </div>

                                        <button
                                            onClick={handleNextPage}
                                            disabled={!next}
                                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border ${next
                                                ? 'bg-chiffon/5 text-chiffon border-chiffon/10 hover:bg-chiffon/20 hover:scale-105 active:scale-95'
                                                : 'opacity-20 cursor-not-allowed border-chiffon/5 text-chiffon'
                                                }`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="py-20 text-center">
                                <div className="w-20 h-20 bg-chiffon/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-8 h-8 text-chiffon/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-chiffon font-black text-xl mb-2">No products found</h3>
                                <p className="text-chiffon/40 text-sm max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}

export default SearchPage
