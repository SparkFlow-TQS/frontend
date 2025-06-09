"use client"

import * as React from 'react'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoMdExit } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth()
    const router = useRouter()

    const handleSignOut = () => {
        logout()
        router.push('/')
    }

    const authenticatedNavLinks = [
        {
            label: "Schedule",
            href: "/schedule",
        },
        {
            label: "Map",
            href: "/map",
        },
        {
            label: "Dashboard",
            href: "/dashboard",
        },
    ]

    const unauthenticatedNavLinks = [
        {
            label: "Map",
            href: "/map",
        },
        {
            label: "Login",
            href: "/login",
        },
        {
            label: "Register",
            href: "/register",
        },
    ]

    const navLinks = isAuthenticated ? authenticatedNavLinks : unauthenticatedNavLinks;

    const navLinks = isAuthenticated ? authenticatedNavLinks : unauthenticatedNavLinks;

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="sticky w-full bg-[#FCA311] text-[#14213D] px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Image className="shadow-3xl shadow-black" src="/logo.png" alt="SparkFlow" width={32} height={32} />
                <Link href="/" className="text-2xl font-bold text-[#14213d]">
                    SparkFlow
                </Link>
            </div>
            <div className="flex items-center justify-between space-x-6">
                {navLinks.map((link, index) => (
                    <Link key={index}
                        className="text-xl pointer-events-auto font-semibold hover:text-[#14213d]/90 hover:scale-105 transition-transform duration-150 flex items-center gap-1"
                        href={link.href}>
                        {link.label}
                    </Link>
                ))}
                
                {isAuthenticated && user && (
                    <>
                        <div className="flex items-center gap-2 text-lg">
                            <FaUser className="h-4 w-4" />
                            <span>{user.username}</span>
                            {user.isOperator && (
                                <span className="bg-[#14213d] text-[#FCA311] px-2 py-1 rounded text-xs font-bold">
                                    OPERATOR
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="text-xl pointer-events-auto font-semibold hover:text-[#14213d]/90 hover:scale-105 transition-transform duration-150 flex items-center gap-1"
                        >
                            Sign Out
                            <IoMdExit />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
