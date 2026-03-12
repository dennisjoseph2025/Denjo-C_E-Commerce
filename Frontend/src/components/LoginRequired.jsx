import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'

const LoginRequired = ({ title = "Access Restricted" }) => {
    return (
        <div className="min-h-screen bg-violet relative overflow-hidden flex flex-col">
            <Navbar />

            {/* Background decorative blobs */}
            <div className="absolute top-24 -left-24 w-96 h-96 rounded-full bg-chiffon/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-24 -right-16 w-80 h-80 rounded-full bg-chiffon/5 blur-3xl pointer-events-none" />

            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="max-w-md w-full bg-chiffon/10 backdrop-blur-3xl border border-chiffon/20 rounded-[2.5rem] p-10 md:p-14 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-chiffon/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-chiffon/20">
                        <svg className="w-10 h-10 text-chiffon/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    <h2 className="text-3xl font-black text-chiffon mb-4 tracking-tighter">
                        {title}
                    </h2>

                    <p className="text-chiffon/50 text-sm leading-relaxed mb-10 font-medium">
                        To maintain the exclusivity of our collection and manage your acquisitions, please sign in to your account.
                    </p>

                    <div className="space-y-4">
                        <Link
                            to="/login"
                            className="block w-full py-4 bg-chiffon text-violet font-black rounded-2xl shadow-xl hover:bg-chiffon-dark transition-all active:scale-[0.98] text-sm uppercase tracking-widest"
                        >
                            Sign In to Proceed
                        </Link>

                        <Link
                            to="/"
                            className="block w-full py-4 bg-chiffon/5 border border-chiffon/10 text-chiffon font-black rounded-2xl hover:bg-chiffon/10 transition-all text-xs uppercase tracking-widest"
                        >
                            Return to Gallery
                        </Link>
                    </div>

                    <p className="mt-10 text-[10px] text-chiffon/20 font-bold uppercase tracking-[0.3em]">
                        Exquisite Quality • Secure Access
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginRequired
