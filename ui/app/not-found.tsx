"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FaBolt, FaHome, FaArrowLeft } from 'react-icons/fa'
import Navbar from '@/components/navbar'

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col w-screen overflow-hidden">
      <header>
        <Navbar />
      </header>
      <main className="flex-1 bg-[#14213d] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          {/* Large 404 with SparkFlow theming */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-[#FFA500] mb-4">404</div>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <FaBolt className="h-16 w-16 text-[#FFA500] animate-pulse" />
                <div className="absolute inset-0 h-16 w-16 bg-[#FFA500] opacity-20 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>

          {/* Error message */}
          <h1 className="text-2xl font-bold text-white mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            The charging station page you&apos;re looking for seems to have lost power. 
            Don&apos;t worry, we&apos;ll help you get back on track!
          </p>

          {/* Action buttons */}
          <div className="space-y-4">
            <Link href="/">
              <Button className="w-full bg-[#FFA500] text-black hover:bg-[#FFA500]/90">
                <FaHome className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
            
            <div className="grid grid-cols-2 gap-3">
              <Link href="/map">
                <Button variant="outline" className="w-full text-white border-white hover:bg-white/10">
                  Find Stations
                </Button>
              </Link>
              <Link href="/schedule">
                <Button variant="outline" className="w-full text-white border-white hover:bg-white/10">
                  Book Session
                </Button>
              </Link>
            </div>

            <Link href="javascript:history.back()">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </Link>
          </div>

          {/* Helpful links */}
          <div className="mt-12 text-sm text-gray-400">
            <p className="mb-2">Looking for something specific?</p>
            <div className="flex justify-center space-x-4">
              <Link href="/help" className="hover:text-[#FFA500] transition-colors">
                Help Center
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-[#FFA500] transition-colors">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}