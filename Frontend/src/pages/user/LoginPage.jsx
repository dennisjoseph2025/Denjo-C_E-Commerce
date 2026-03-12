import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { login, clearError } from '../../features/auth/authSlice'

const LoginPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user, loading, error, isAuthenticated } = useSelector((s) => s.auth)

    const [form, setForm] = useState({ email: '', password: '' })

    useEffect(() => {
        if (isAuthenticated && user) {
            const hasRoleInfo = user.role !== undefined || user.is_staff !== undefined || user.is_superuser !== undefined;
            if (hasRoleInfo) {
                const role = user.role?.toLowerCase()
                const isAdmin = role === 'admin' || role === 'superadmin' || user.is_staff || user.is_superuser
                navigate(isAdmin ? '/admin/dashboard' : '/home')
            }
        }
        return () => { dispatch(clearError()) }
    }, [isAuthenticated, user, navigate, dispatch])

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

    const handleSubmit = (e) => {
        e.preventDefault()
        dispatch(login(form))
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-violet px-4 py-10 relative overflow-hidden">

            {/* Background decorative blobs */}
            <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-chiffon/8 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-chiffon/6 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/3 w-60 h-60 rounded-full bg-violet-light/30 blur-2xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10">

                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-11 h-11 rounded-xl bg-chiffon flex items-center justify-center shadow-lg">
                        <span className="text-violet font-extrabold text-lg tracking-tight">D</span>
                    </div>
                    <span className="text-2xl font-extrabold text-chiffon tracking-tight">DENJO-C</span>
                </div>

                {/* Glass card */}
                <div className="rounded-2xl shadow-2xl p-8 sm:p-10
                        bg-chiffon/12 backdrop-blur-xl
                        border border-chiffon/20
                        ring-1 ring-chiffon/10">

                    <h2 className="text-2xl font-extrabold text-chiffon mb-1 text-center">
                        Sign In
                    </h2>
                    <p className="text-chiffon/50 text-sm text-center mb-6">
                        Enter your credentials to continue shopping
                    </p>

                    {/* Error banner */}
                    {error && (
                        <div className="mb-5 rounded-xl bg-red-500/15 border border-red-400/30 backdrop-blur-sm px-4 py-3 text-sm text-red-200 flex items-center gap-2">
                            <span>⚠</span>
                            <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-chiffon/70 uppercase tracking-widest mb-1.5">
                                Email
                            </label>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="example@gmail.com"
                                className="w-full px-4 py-3 rounded-xl
                                    bg-chiffon/10 backdrop-blur-sm
                                    border border-chiffon/20
                                    text-chiffon placeholder:text-chiffon/30
                                    outline-none
                                    focus:border-chiffon/50 focus:ring-2 focus:ring-chiffon/15
                                    transition-all text-sm"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-chiffon/70 uppercase tracking-widest mb-1.5">
                                Password
                            </label>
                            <input
                                id="login-password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl
                                    bg-chiffon/10 backdrop-blur-sm
                                    border border-chiffon/20
                                    text-chiffon placeholder:text-chiffon/30
                                    outline-none
                                    focus:border-chiffon/50 focus:ring-2 focus:ring-chiffon/15
                                    transition-all text-sm"
                            />
                        </div>

                        {/* Forgot password */}
                        <div className="flex justify-end">
                            <button type="button"
                                className="text-xs text-chiffon/40 hover:text-chiffon/70 transition-colors cursor-pointer">
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-6 rounded-xl
                                bg-chiffon text-violet font-bold
                                text-sm tracking-wide shadow-lg cursor-pointer
                                hover:bg-chiffon-dark hover:shadow-xl active:scale-[0.98]
                                disabled:opacity-60 disabled:cursor-not-allowed
                                transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-violet" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                    Signing in…
                                </>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-chiffon/10"></div>
                        <span className="text-xs text-chiffon/30 uppercase tracking-wider">or</span>
                        <div className="flex-1 h-px bg-chiffon/10"></div>
                    </div>

                    {/* Register link */}
                    <p className="text-center text-sm text-chiffon/50">
                        Don&apos;t have an account?{' '}
                        <Link to="/register"
                            className="text-chiffon font-semibold underline underline-offset-2 hover:text-chiffon-dark transition-colors">
                            Create one
                        </Link>
                    </p>

                    <div className="mt-8 pt-6 border-t border-chiffon/10 flex justify-center">
                        <Link to="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-chiffon/30 hover:text-chiffon transition-all group">
                            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7 7-7" />
                            </svg>
                            Back to Home
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-chiffon/20 mt-6">
                    © 2025 DENJO-C. All rights reserved.
                </p>
            </div>
        </div>
    )
}

export default LoginPage
