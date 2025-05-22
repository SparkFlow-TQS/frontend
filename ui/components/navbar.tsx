import Link from "next/link";
import { IoMdExit } from "react-icons/io";
import Image from "next/image";

export default function Navbar() {

    const navLinks = [
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
        {
            label: "Sign Out",
            icon: <IoMdExit />,
            href: "/signout",
        },
    ];

    return (
        <header className="sticky w-full bg-[#FCA311] text-[#14213D] px-4 py-4">
            <div className="flex items-center justify-between">
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
                            {link.icon}
                        </Link>
                    ))}
            </div>
        </div>
        </header >
    );
}
