'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed.')
        return
      }

      // Store user in localStorage for client-side use
      localStorage.setItem('forttune_user', JSON.stringify(data.user))

      // Redirect based on role
      if (data.user.role === 'ADMIN') {
        router.push('/admin')
      } else if (data.user.role === 'CASHIER') {
        router.push('/pos')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#E85D26] rounded-lg flex items-center justify-center font-bold text-white text-lg">F</div>
          <span className="font-semibold text-[#0D1B3E] text-xl tracking-wide">Forttune</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#0D1B3E]/10 p-8">
          <h1 className="text-2xl font-bold text-[#0D1B3E] mb-1">Welcome back</h1>
          <p className="text-[#6B7A99] text-sm mb-6">Sign in to your Forttune account</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B7A99] uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full border border-[#0D1B3E]/20 rounded-lg px-4 py-2.5 text-sm text-[#0D1B3E] placeholder-[#6B7A99]/60 focus:outline-none focus:border-[#E85D26] focus:ring-1 focus:ring-[#E85D26]/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7A99] uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full border border-[#0D1B3E]/20 rounded-lg px-4 py-2.5 text-sm text-[#0D1B3E] placeholder-[#6B7A99]/60 focus:outline-none focus:border-[#E85D26] focus:ring-1 focus:ring-[#E85D26]/20 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E85D26] text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-[#F47A4A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B7A99] mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#E85D26] font-semibold hover:underline">
              Create one
            </Link>
          </p>


        </div>
      </div>
    </div>
  )
}
