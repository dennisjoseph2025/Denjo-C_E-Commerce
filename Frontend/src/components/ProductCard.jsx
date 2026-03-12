import React from 'react'
import { Link } from 'react-router-dom'

const ProductCard = ({ product }) => {
    return (
        <Link to={`/product/${product.id}`} className="group w-full h-full flex flex-col max-w-[320px] mx-auto">
            <div className="aspect-[4/5] rounded-xl overflow-hidden relative mb-2 shadow-lg transition-all duration-500 group-hover:shadow-violet/20 flex-shrink-0">
                <img
                    src={(product.images && product.images.length > 0) ? product.images[0].url : 'https://placehold.co/600x800?text=No+Image'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay Button */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="w-full py-1.5 bg-chiffon text-violet font-black rounded-md text-[8px] uppercase tracking-wider text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-md">
                        View Details
                    </span>
                </div>
            </div>

            <div className="space-y-0.5 px-0 flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-baseline gap-1">
                    <h3 className="text-chiffon font-black text-xs tracking-tight leading-tight line-clamp-1 flex-1">
                        {product.name}
                    </h3>
                    <span className="text-chiffon/90 font-black text-xs whitespace-nowrap">
                        ₹{product.price?.toLocaleString()}
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default ProductCard
