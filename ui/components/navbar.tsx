'use client'

import * as React from 'react'
import Link from "next/link";
import { IoMdExit, IoMdPerson, IoMdSettings } from "react-icons/io";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export default function Navbar() {
    const { user, isAuthenticated, logout, isOperator } = useAuth()

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
    ];

    // Add operator-only links
    if (isOperator()) {
        authenticatedNavLinks.push({
            label: "Admin",
            href: "/admin",
        });
    }

    const unauthenticatedNavLinks = [
        {
            label: "Map",
            href: "/map",
        },
        {
            label: "Login",
            href: "/auth/login",
        },
        {
            label: "Register",
            href: "/auth/register",
        },
    ];

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
            
            <div className="flex items-center space-x-6">
                {/* Navigation Links */}
                <div className="flex items-center space-x-4">
                    {navLinks.map((link, index) => (
                        <Link key={index}
                            className="text-lg pointer-events-auto font-semibold hover:text-[#14213d]/90 hover:scale-105 transition-transform duration-150 flex items-center gap-1"
                            href={link.href}>
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* User Info and Logout */}
                {isAuthenticated && user && (
                    <div className="flex items-center space-x-4 border-l border-[#14213D]/20 pl-4">
                        <div className="flex items-center space-x-2">
                            <IoMdPerson className="text-lg" />
                            <span className="font-medium">
                                {user.username}
                                {isOperator() && (
                                    <span className="ml-1 text-xs bg-[#14213D] text-[#FCA311] px-2 py-1 rounded">
                                        OP
                                    </span>
                                )}
                            </span>
                        </div>
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            size="sm"
                            className="text-[#14213D] hover:bg-[#14213D]/10 flex items-center gap-1"
                        >
                            <IoMdExit />
                            Sign Out
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
