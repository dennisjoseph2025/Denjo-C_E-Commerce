import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCartItems, removeItemFromCart, updateCartItemQty } from '../../features/cart/cartSlice'


const CartPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { cartItems, loading, error } = useSelector((s) => s.cart)

    useEffect(() => {
        dispatch(fetchCartItems())
    }, [dispatch])

    // Calculate total if API structure varies, otherwise sum subtotal
    const calculateTotal = () => {
        if (!cartItems || cartItems.length === 0) return 0
        return cartItems.reduce((total, item) => {
            return total + (item.subtotal || 0)
        }, 0)
    }

    const total = calculateTotal()

    return (
        <div className="min-h-screen bg-violet relative overflow-hidden">


            {/* Background elements */}
            <div className="absolute top-24 -left-24 w-[500px] h-[500px] rounded-full bg-chiffon/5 blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 pt-40 pb-20 relative z-10">
                <div className="mb-12">
                    <span className="text-chiffon/40 text-xs font-black uppercase tracking-[0.3em] mb-4 block">
                        Your Selection
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-chiffon tracking-tighter leading-none">
                        Private Cart
                    </h1>
                </div>

                {loading ? (
                    <div className="w-full h-[300px] rounded-[2rem] bg-chiffon/5 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-chiffon/20 border-t-chiffon rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-chiffon/5 rounded-[2rem] border border-chiffon/10">
                        <p className="text-red-400 font-bold mb-4">{error}</p>
                        <button onClick={() => dispatch(fetchCartItems())} className="text-chiffon underline font-black uppercase text-xs tracking-widest">
                            Try Again
                        </button>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="text-center py-32 bg-chiffon/5 border border-chiffon/10 rounded-[2.5rem] backdrop-blur-sm">
                        <div className="w-20 h-20 bg-chiffon/10 rounded-full flex flex-col items-center justify-center mx-auto mb-6 text-chiffon/40">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-chiffon mb-4">Your collection is empty</h2>
                        <Link to="/search" className="inline-block px-8 py-3 bg-chiffon text-violet font-black rounded-xl hover:bg-chiffon-dark transition-all">
                            Shop Some Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 space-y-6">
                            {cartItems.map((item, index) => {
                                const qty = item.quantity || 1

                                return (
                                    <div key={item.id || index} className="flex flex-col sm:flex-row gap-6 p-6 rounded-[2rem] bg-chiffon/5 border border-chiffon/10 backdrop-blur-sm items-center hover:bg-chiffon/10 transition-colors duration-300">
                                        <div className="w-full sm:w-32 h-40 rounded-2xl overflow-hidden flex-shrink-0 bg-chiffon/10">
                                            {item.product_image ? (
                                                <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-chiffon/20 p-4 text-center text-xs font-bold">No Image</div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2 w-full">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <span className="text-chiffon/40 text-[10px] font-black uppercase tracking-widest block mb-1">
                                                        {item.product_category || 'Premium Selection'}
                                                    </span>
                                                    <h3 className="text-xl font-black text-chiffon leading-tight">
                                                        {item.product_name}
                                                    </h3>
                                                    <p className="text-chiffon/50 font-bold text-sm mt-1">Size: {item.size}</p>
                                                </div>
                                                <button
                                                    onClick={() => dispatch(removeItemFromCart(item.id))}
                                                    className="text-chiffon/40 hover:text-red-400 transition-colors p-2 bg-chiffon/5 rounded-full hover:bg-red-500/10"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-end pt-4">
                                                <div className="flex items-center bg-chiffon/10 rounded-xl p-1 border border-chiffon/5">
                                                    <button
                                                        onClick={() => dispatch(updateCartItemQty({ id: item.id, quantity: Math.max(1, qty - 1) }))}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-chiffon/60 hover:bg-chiffon/10 hover:text-chiffon"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                                    </button>
                                                    <span className="w-8 text-center text-chiffon font-black">{qty}</span>
                                                    <button
                                                        onClick={() => dispatch(updateCartItemQty({ id: item.id, quantity: qty + 1 }))}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-chiffon/60 hover:bg-chiffon/10 hover:text-chiffon"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                    </button>
                                                </div>
                                                <span className="text-2xl font-black text-chiffon">
                                                    ₹{item.subtotal?.toLocaleString() || '0.00'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-4">
                            <div className="p-8 rounded-[2.5rem] bg-chiffon border-4 border-chiffon/20 sticky top-32 shadow-2xl">
                                <h3 className="text-2xl font-black text-violet mb-6">Summary</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-violet/70 font-medium">
                                        <span>Subtotal</span>
                                        <span>₹{total.toLocaleString()}</span>
                                    </div>

                                    <div className="h-px bg-violet/10 w-full my-4" />
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-violet font-black">Total</span>
                                        <span className="text-4xl font-black text-violet">₹{total.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/order')}
                                    className="w-full py-5 bg-violet text-chiffon font-black text-lg rounded-2xl shadow-xl hover:bg-violet/90 transition-all active:scale-[0.98]">
                                    Proceed to Checkout
                                </button>

                                <p className="text-center text-violet/40 text-[10px] font-black uppercase tracking-widest mt-6">
                                    Secure, encrypted transaction
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CartPage
