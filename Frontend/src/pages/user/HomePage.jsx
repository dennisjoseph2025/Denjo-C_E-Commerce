import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFeaturedProducts, fetchBestSellerProducts, fetchFilterData } from '../../features/products/productSlice'
import ProductCard from '../../components/ProductCard'
import ProductCarousel from '../../components/ProductCarousel'

const HomePage = () => {
    const dispatch = useDispatch()
    const { items, featuredItems, bestSellerItems, loading, error } = useSelector((s) => s.products)

    useEffect(() => {
        dispatch(fetchFeaturedProducts())
        dispatch(fetchBestSellerProducts())
        dispatch(fetchFilterData())
    }, [dispatch])

    return (
        <div className="min-h-screen bg-violet relative overflow-x-hidden">
            {/* Background decorative blobs */}
            <div className="absolute top-24 -left-24 w-96 h-96 rounded-full bg-chiffon/8 blur-3xl pointer-events-none" />
            <div className="absolute bottom-24 -right-16 w-80 h-80 rounded-full bg-chiffon/6 blur-3xl pointer-events-none" />

            {/* Featured Carousel - top center, wider than content */}
            <section className="pt-28 pb-8 relative z-10 flex justify-center">
                <div className="w-full max-w-[1600px] mx-auto px-4">
                    {loading && items.length === 0 ? (
                        <div className="w-full h-[340px] md:h-[440px] rounded-[2.5rem] bg-chiffon/5 animate-pulse flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-chiffon/20 border-t-chiffon rounded-full animate-spin" />
                        </div>
                    ) : (
                        <ProductCarousel
                            products={featuredItems?.length ? featuredItems : items?.slice(0, 5)}
                            variant="hero"
                        />
                    )}
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 pb-20 relative z-10">
                {/* Best Sellers Section - Static 4-column grid with compact cards */}
                <section>
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <span className="text-chiffon/40 text-xs font-black uppercase tracking-[0.3em] mb-3 block">
                                Most Coveted
                            </span>
                            <h2 className="text-5xl md:text-7xl font-black text-chiffon tracking-tighter leading-none">
                                Bestsellers
                            </h2>
                        </div>
                        <Link
                            to="/search"
                            className="text-chiffon font-black text-sm uppercase tracking-widest hover:text-chiffon/70 transition-colors flex items-center gap-2 mb-2"
                        >
                            Shop Now <span className="text-xl">→</span>
                        </Link>
                    </div>

                    {loading && bestSellerItems.length === 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="aspect-[4/5] rounded-[2rem] bg-chiffon/5 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                            {bestSellerItems.map((product) => (
                                <div key={product.id}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default HomePage
