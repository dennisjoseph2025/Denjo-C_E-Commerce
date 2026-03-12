import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { setFilters, fetchProducts } from '../features/products/productSlice'

const Navbar = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isAuthenticated } = useSelector((s) => s.auth)
    const { filters } = useSelector((s) => s.products)

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    const handleSearchChange = (e) => {
        const value = e.target.value
        dispatch(setFilters({ search: value }))
        // Redirect logic moved strictly to submit handler
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (filters.search && filters.search.trim() !== '') {
            dispatch(fetchProducts(filters))
            navigate('/search')
        }
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-violet/80 backdrop-blur-xl border-b border-chiffon/10 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

                {/* Left: Logo */}
                <div className="flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-lg bg-chiffon flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                            <span className="text-violet font-black text-sm">D</span>
                        </div>
                        <span className="text-xl font-black text-chiffon tracking-tight hidden sm:block">DENJO-C</span>
                    </Link>

                </div>

                {/* Center: Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative group hidden md:block">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={filters.search}
                        onChange={handleSearchChange}
                        className="w-full bg-chiffon/5 border border-chiffon/10 rounded-xl py-2 pl-4 pr-10 text-chiffon text-sm focus:outline-none focus:ring-2 focus:ring-chiffon/20 focus:bg-chiffon/10 transition-all placeholder:text-chiffon/30"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-chiffon/40 hover:text-chiffon transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </form>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">

                    <Link
                        to="/search"
                        className="ml-4 px-4 py-2 rounded-xl bg-chiffon/5 border border-chiffon/10 text-[10px] font-black uppercase tracking-[0.2em] text-chiffon/60 hover:text-chiffon hover:bg-chiffon/10 transition-all hidden lg:flex items-center gap-2 group"
                    >
                        Shop Now
                    </Link>

                    <Link to="/cart" className="p-2 rounded-lg text-chiffon/60 hover:text-chiffon hover:bg-chiffon/5 transition-all relative group">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-chiffon shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>

                    <Link
                        to="/orders"
                        className="p-2 rounded-lg text-chiffon/60 hover:text-chiffon hover:bg-chiffon/5 transition-all relative group"
                        title="Your Orders"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-chiffon shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>

                    {/* Profile Icon */}
                    <div className="flex items-center gap-2 pl-2 border-l border-chiffon/10">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="w-9 h-9 rounded-full bg-chiffon/10 border border-chiffon/20 flex items-center justify-center text-chiffon hover:bg-chiffon hover:text-violet transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-chiffon/40 hover:text-chiffon transition-colors"
                                >
                                    Log out
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="px-4 py-2 rounded-lg bg-chiffon text-violet font-black text-xs uppercase tracking-widest hover:bg-chiffon-dark transition-all">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
