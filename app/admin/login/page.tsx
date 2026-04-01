'use client'

import { useState } from 'react'
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

import { loginAction } from '@/app/actions/authActions'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    
    try {
      const res = await loginAction(formData)
      if (res?.error) {
        setErrorMsg(res.error)
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
         setErrorMsg("Login gagal: " + err.message)
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 mb-8">
          <Image src="/logo.png" alt="Logo" width={96} height={96} className="w-24 h-24" />
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Login</h1>
          <p className="text-sm text-slate-500 font-medium">Tirta Siaga Bantul</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-slate-800 placeholder-slate-400"
                placeholder="Masukkan username"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-slate-800 placeholder-slate-400"
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? 'Memeriksa...' : 'Masuk Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
