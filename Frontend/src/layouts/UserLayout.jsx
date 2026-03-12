import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

const UserLayout = () => {
    return (
        <div className="min-h-screen bg-violet">
            <Navbar />
            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default UserLayout
