import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'

const AUTO_ADVANCE_MS = 5000

const ProductCarousel = ({ products, title = "Bestsellers", subtitle = "Most Coveted", showHead = true, variant = "default" }) => {
    const scrollRef = useRef(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)
    const [heroIndex, setHeroIndex] = useState(0)
    const totalHeroSlides = (variant === 'hero' && products?.length) ? products.length : 0

    useEffect(() => {
        if (totalHeroSlides <= 1) return
        const timer = setInterval(() => {
            setHeroIndex((i) => (i + 1) % totalHeroSlides)
        }, AUTO_ADVANCE_MS)
        return () => clearInterval(timer)
    }, [totalHeroSlides])

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current
            const scrollAmount = direction === 'left' ? -clientWidth : clientWidth
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
    }

    if (!products || products.length === 0) return null

    if (variant === "hero") {
        const slides = products
        const total = slides.length
        const goTo = (index) => setHeroIndex(index)

        return (
            <div className="relative w-full h-[340px] md:h-[440px] overflow-hidden rounded-[2.5rem] shadow-2xl border border-chiffon/10 bg-black group/hero">
                <div
                    className="flex h-full transition-transform duration-700 ease-in-out"
                    style={{ width: `${total * 100}%`, transform: `translateX(-${heroIndex * (100 / total)}%)` }}
                >
                    {slides.map((product) => {
                        const imgUrl = (product.images && product.images.length > 0)
                            ? product.images[0].url
                            : (product.image || 'https://placehold.co/1200x800?text=Featured+Collection')
                        const name = product.name || product.title || 'Featured'
                        const desc = product.description || 'Experience the pinnacle of design and luxury with our latest featured masterpiece.'
                        return (
                            <div key={product.id} className="flex-shrink-0 h-full relative" style={{ width: `${100 / total}%` }}>
                                <div className="w-full h-full absolute inset-0">
                                    <img
                                        src={imgUrl}
                                        alt={name}
                                        className="w-full h-full object-cover object-center"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-violet/80 via-violet/5 to-transparent flex flex-col justify-end p-6 md:p-12 lg:p-16">
                                        <div className="max-w-4xl">
                                            <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-chiffon mb-3 leading-none tracking-tighter">
                                                {name}
                                            </h2>
                                            <p className="text-chiffon/80 text-sm md:text-lg mb-6 line-clamp-2 max-w-2xl font-medium leading-relaxed">
                                                {desc}
                                            </p>
                                            <Link
                                                to={`/product/${product.id}`}
                                                className="inline-flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-chiffon text-violet font-bold rounded-xl hover:bg-chiffon-dark transition-all duration-300 shadow-2xl active:scale-[0.98] uppercase text-xs tracking-widest"
                                            >
                                                View Details
                                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                {/* Slide indicators */}
                {total > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                aria-label={`Go to slide ${i + 1}`}
                                onClick={() => goTo(i)}
                                className={`h-2 rounded-full transition-all duration-300 ${i === heroIndex ? 'w-8 bg-chiffon' : 'w-2 bg-chiffon/40 hover:bg-chiffon/60'}`}
                            />
                        ))}
                    </div>
                )}
                {/* Prev/Next */}
                {total > 1 && (
                    <>
                        <button
                            type="button"
                            aria-label="Previous slide"
                            onClick={() => setHeroIndex((i) => (i - 1 + total) % total)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-chiffon/20 text-chiffon hover:bg-chiffon hover:text-violet transition-all duration-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            aria-label="Next slide"
                            onClick={() => setHeroIndex((i) => (i + 1) % total)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-chiffon/20 text-chiffon hover:bg-chiffon hover:text-violet transition-all duration-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="relative group/carousel">
            {/* Header section matching mockup */}
            {showHead && (
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <span className="text-chiffon/40 text-xs font-black uppercase tracking-[0.3em] mb-3 block">
                            {subtitle}
                        </span>
                        <h2 className="text-5xl md:text-7xl font-black text-chiffon tracking-tighter leading-none">
                            {title}
                        </h2>
                    </div>
                    <Link
                        to="/search"
                        className="text-chiffon font-black text-sm uppercase tracking-widest hover:text-chiffon/70 transition-colors flex items-center gap-2 mb-2"
                    >
                        VIEW ALL <span className="text-xl">→</span>
                    </Link>
                </div>
            )}

            {/* Slider Container - 5 items per row density */}
            <div className="relative -mx-4 md:-mx-12 px-4 md:px-12">
                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="flex items-stretch gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-6"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {products.map((product) => (
                        <div key={product.id} className="min-w-[200px] md:min-w-[calc(20%-1rem)] snap-start flex-shrink-0 flex flex-col">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                {/* Custom Navigation Arrows */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-6 z-20 p-4 rounded-full bg-chiffon text-violet shadow-2xl transition-all duration-300 hover:scale-110 hidden md:flex"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-8 z-20 p-4 rounded-full bg-chiffon text-violet shadow-2xl transition-all duration-300 hover:scale-110 hidden md:flex"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    )
}

export default ProductCarousel
