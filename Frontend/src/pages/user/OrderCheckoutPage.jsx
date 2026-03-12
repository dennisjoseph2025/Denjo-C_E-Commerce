import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { createOrder } from '../../features/orders/orderSlice'
import { getProfile } from '../../features/auth/authSlice'
import { fetchCartItems } from '../../features/cart/cartSlice'

const OrderCheckoutPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((s) => s.auth)
    const { cartItems } = useSelector((s) => s.cart)
    const { creating, createError } = useSelector((s) => s.orders)
    const [address, setAddress] = useState('')
    const [phone, setPhone] = useState('')
    const [showConfirm, setShowConfirm] = useState(false)

    useEffect(() => {
        dispatch(getProfile())
        if (!cartItems || cartItems.length === 0) {
            dispatch(fetchCartItems())
        }
    }, [dispatch, cartItems.length])

    useEffect(() => {
        if (user) {
            if (user.address) setAddress(user.address)
            if (user.phone || user.phone_number) setPhone(user.phone || user.phone_number)
        }
    }, [user])

    useEffect(() => {
        if (cartItems && cartItems.length === 0) {
            // If, after fetch, cart is empty, send user back
            navigate('/cart')
        }
    }, [cartItems, navigate])

    const total = cartItems?.reduce((sum, item) => sum + (item.subtotal || 0), 0) || 0

    const handlePlaceOrder = async () => {
        if (!address.trim() || !phone.trim()) return
        setShowConfirm(false)
        const resultAction = await dispatch(createOrder({
            address: address.trim(),
            phone: phone.trim()
        }))
        if (createOrder.fulfilled.match(resultAction)) {
            navigate('/orders')
        }
    }

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/\D/g, '') // Only allow integers
        setPhone(val)
    }

    return (
        <div className="min-h-screen bg-violet relative overflow-hidden">

            {/* Confirmation Overlay */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-violet/80 backdrop-blur-md" onClick={() => setShowConfirm(false)} />
                    <div className="bg-chiffon rounded-[2.5rem] p-10 max-w-md w-full relative z-10 shadow-2xl border-4 border-chiffon/20 animate-in fade-in zoom-in duration-300">
                        <h3 className="text-3xl font-black text-violet mb-4 tracking-tighter">Confirm Your Order</h3>
                        <div className="space-y-4 mb-8">
                            <p className="text-violet/60 font-bold leading-relaxed">
                                Once confirmed, your order for <span className="text-violet font-black">₹{total.toLocaleString()}</span> will be processed and prepared for shipping.
                            </p>
                            <div className="p-4 rounded-2xl bg-violet/5 space-y-2 border border-violet/10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-violet/40">Destination</p>
                                <p className="text-sm font-bold text-violet">{address}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-violet/40 pt-2">Contact</p>
                                <p className="text-sm font-bold text-violet">{phone}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handlePlaceOrder}
                                className="w-full py-4 bg-violet text-chiffon font-black rounded-2xl hover:bg-violet/90 transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
                            >
                                Confirm & Place Order
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="w-full py-4 border-2 border-violet/10 text-violet font-black rounded-2xl hover:bg-violet/5 transition-all text-sm uppercase tracking-widest"
                            >
                                Not Ready Yet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-chiffon/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4 pt-32 pb-16 relative z-10">
                <div className="mb-10">
                    <span className="text-chiffon/40 text-xs font-black uppercase tracking-[0.3em] mb-3 block">
                        Identity & Destination
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-chiffon tracking-tighter leading-none">
                        Finalize Order
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Address + totals */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                        <div className="bg-chiffon/5 border border-chiffon/10 rounded-[2.5rem] p-8 backdrop-blur-xl">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-chiffon/50 mb-4">
                                        Shipping Destination <span className="text-red-400">*</span>
                                    </h2>
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        rows={3}
                                        className="w-full bg-chiffon/5 border border-chiffon/10 rounded-2xl p-4 text-sm text-chiffon placeholder:text-chiffon/20 focus:outline-none focus:ring-2 focus:ring-chiffon/30 transition-all"
                                        placeholder="Please provide your full shipping address..."
                                    />
                                </div>
                                <div>
                                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-chiffon/50 mb-4">
                                        Contact Number <span className="text-red-400">*</span>
                                    </h2>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        className="w-full bg-chiffon/5 border border-chiffon/10 rounded-2xl p-4 text-sm text-chiffon placeholder:text-chiffon/20 focus:outline-none focus:ring-2 focus:ring-chiffon/30 transition-all font-bold tracking-widest"
                                        placeholder="Enter 10-digit number..."
                                        maxLength={10}
                                    />
                                    {phone && phone.length !== 10 && (
                                        <p className="text-[10px] text-red-400/60 mt-2 font-black uppercase tracking-widest px-1">Must be exactly 10 digits</p>
                                    )}
                                </div>
                            </div>
                            {createError && (
                                <p className="mt-6 text-xs text-red-400 font-bold bg-red-400/5 p-3 rounded-xl border border-red-400/20">
                                    {createError}
                                </p>
                            )}
                        </div>

                        <div className="bg-chiffon rounded-[2.5rem] p-8 border-4 border-chiffon/20 shadow-2xl">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-violet/40 mb-6">Financial Summary</h2>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-violet/60 text-sm font-bold">
                                    <span>Subtotal</span>
                                    <span>₹{total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-violet/60 text-sm font-bold">
                                    <span>Delivery Service</span>
                                    <span className="text-violet/30 italic">Complimentary</span>
                                </div>
                                <div className="h-px bg-violet/5 w-full my-2" />
                                <div className="flex justify-between items-baseline pt-2">
                                    <span className="text-violet font-black text-sm uppercase tracking-widest">Total</span>
                                    <span className="text-4xl font-black text-violet">
                                        ₹{total.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowConfirm(true)}
                                disabled={creating || !address.trim() || phone.trim().length !== 10 || !cartItems || cartItems.length === 0}
                                className="w-full py-5 rounded-2xl bg-violet text-chiffon font-black text-sm uppercase tracking-[0.25em] hover:shadow-[0_0_30px_rgba(45,34,80,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed group"
                            >
                                {creating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-chiffon/30 border-t-chiffon rounded-full animate-spin" />
                                        Processing Order
                                    </>
                                ) : (
                                    <>
                                        Place Order
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Items list */}
                    <div className="lg:col-span-12 xl:col-span-7">
                        <div className="bg-chiffon/5 border border-chiffon/10 rounded-[2.5rem] p-8 space-y-6 backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-chiffon/50">
                                    Items to be Shipped
                                </h2>
                                <Link
                                    to="/cart"
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-chiffon/30 hover:text-chiffon transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Edit Selection
                                </Link>
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {(!cartItems || cartItems.length === 0) ? (
                                    <p className="text-chiffon/50 text-sm font-medium">Your selection is currently empty.</p>
                                ) : (
                                    cartItems.map((item) => {
                                        return (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-5 p-4 rounded-3xl bg-chiffon/5 border border-chiffon/5 group hover:bg-chiffon/10 transition-all duration-300"
                                            >
                                                <div className="w-20 h-24 rounded-2xl overflow-hidden bg-chiffon/10 flex-shrink-0 shadow-lg">
                                                    {item.product_image ? (
                                                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-chiffon/20 font-black text-center p-2 uppercase">No Image</div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-chiffon font-black text-lg tracking-tight mb-1">
                                                        {item.product}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <span className="px-2 py-0.5 rounded-lg bg-chiffon/10 text-[10px] font-black text-chiffon/60 uppercase tracking-widest border border-chiffon/10">
                                                            {item.size}
                                                        </span>
                                                        <span className="text-chiffon/40 text-[11px] font-bold">
                                                            Qty: {item.quantity}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-chiffon font-black text-lg">
                                                        ₹{item.subtotal?.toLocaleString() || '0.00'}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderCheckoutPage
