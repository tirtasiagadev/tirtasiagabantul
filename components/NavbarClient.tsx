'use client'
import Link from 'next/link'
import { ShieldUser, Menu, X, LayoutDashboard } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export default function NavbarClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white shadow-sm z-50 sticky top-0 border-b border-slate-100">
      <Link href="/" className="flex items-center gap-2 text-blue-950 font-bold hover:opacity-90 transition">
        <Image src="/logo.png" alt="Logo" width={36} height={36} className="w-8 h-8 sm:w-9 sm:h-9 pointer-events-none" />
        <span className="hidden sm:inline text-xl tracking-tight">Tirta Siaga Bantul</span>
        <span className="inline sm:hidden text-lg tracking-tight">Tirta Siaga</span>
      </Link>

      <div className="hidden sm:flex items-center gap-4">
        {isLoggedIn ? (
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 px-3 py-2 rounded-lg hover:text-blue-600 transition"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        ) : (
          <Link
            href="/admin/login"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 px-3 py-2 rounded-lg hover:text-blue-600 transition"
          >
            <ShieldUser className="w-4 h-4" />
            Admin
          </Link>
        )}
      </div>

      <button 
        className="sm:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg border-b border-slate-100 sm:hidden z-[99]">
          <div className="flex flex-col p-4 space-y-2">
            {isLoggedIn ? (
              <Link
                href="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-sm font-semibold text-slate-700 bg-slate-50 p-4 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition"
              >
                <LayoutDashboard className="w-5 h-5 text-blue-600" />
                Masuk Dashboard
              </Link>
            ) : (
              <Link
                href="/admin/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-sm font-semibold text-slate-700 bg-slate-50 p-4 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition"
              >
                <ShieldUser className="w-5 h-5 text-blue-600" />
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
