import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getProfile, logout } from '../../features/auth/authSlice'


const ProfilePage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user, loading, error } = useSelector((s) => s.auth)

    useEffect(() => {
        dispatch(getProfile())
    }, [dispatch])

    return (
        <div className="min-h-screen bg-violet relative overflow-hidden text-chiffon">


            {/* Background Decorative Blobs */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-chiffon/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-chiffon/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 pt-32 pb-20 relative z-10">

                {/* Profile Header */}
                <div className="mb-12 text-center">
                    <div className="w-32 h-32 rounded-full bg-chiffon/10 border-4 border-chiffon/20 flex items-center justify-center mx-auto mb-6 shadow-2xl relative group">
                        <span className="text-4xl font-black text-chiffon">
                            {user?.name?.[0]?.toUpperCase()}
                        </span>

                    </div>
                    <h1 className="text-5xl font-black tracking-tighter mb-2">{user?.role} {user?.last_name}</h1>
                    <p className="text-chiffon/40 font-bold uppercase tracking-[0.2em] text-sm">DENJO-C</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-chiffon/20 border-t-chiffon rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 text-center backdrop-blur-xl">
                        <p className="text-red-400 font-bold mb-4">{error}</p>
                        <button onClick={() => dispatch(getProfile())} className="text-chiffon underline font-black uppercase text-xs tracking-widest">Retry Connection</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Account Details Card */}
                        <div className="bg-chiffon/5 backdrop-blur-2xl border border-chiffon/10 rounded-[32px] p-8 shadow-2xl hover:bg-chiffon/10 transition-colors duration-500">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-chiffon/40 mb-8">Personal Information</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] uppercase font-black text-chiffon/30 mb-1 block">Name</label>
                                    <p className="text-lg font-bold">{user?.name}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-black text-chiffon/30 mb-1 block">Email Address</label>
                                    <p className="text-lg font-bold">{user?.email}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-black text-chiffon/30 mb-1 block">Member Since</label>
                                    {/* <p className="text-lg font-bold">{user?.created_at.slice(0, 10).split('-').reverse().join('-')}</p> */}
                                </div>
                            </div>
                        </div>

                        {/* Activity Summary / Quick Actions */}
                        <div className="bg-chiffon/5 backdrop-blur-2xl border border-chiffon/10 rounded-[32px] p-8 shadow-2xl flex flex-col justify-between">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-chiffon/40 mb-8">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="p-4 rounded-2xl bg-chiffon/5 border border-chiffon/10 text-center hover:bg-chiffon/10 transition-all group"
                                >
                                    <p className="text-2xl font-black mb-1 group-hover:scale-110 transition-transform">VIEW CART</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-chiffon/30">Checkout Pending</p>
                                </button>
                                <button
                                    onClick={() => navigate('/orders')}
                                    className="p-4 rounded-2xl bg-chiffon text-violet text-center hover:bg-chiffon-dark transition-all group"
                                >
                                    <p className="text-2xl font-black mb-1 group-hover:scale-110 transition-transform">VIEW ORDERS</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-violet/60">Acquisitions</p>
                                </button>
                            </div>
                        </div>

                        {/* Destination & Contact Section */}
                        {user?.address && (
                            <div className="md:col-span-2 bg-chiffon/5 backdrop-blur-2xl border border-chiffon/10 rounded-[32px] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-chiffon/40 mb-8">Address & Contact</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-chiffon/5 flex items-center justify-center flex-shrink-0 group">
                                            <svg className="w-6 h-6 text-chiffon/40 group-hover:text-chiffon transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-black text-chiffon/30 mb-1 block">Shipping Address</label>
                                            <p className="text-lg font-bold leading-relaxed">{user.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-chiffon/5 flex items-center justify-center flex-shrink-0 group">
                                            <svg className="w-6 h-6 text-chiffon/40 group-hover:text-chiffon transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-black text-chiffon/30 mb-1 block">Contact Number</label>
                                            <p className="text-lg font-bold">{user.phone || 'No contact provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfilePage
