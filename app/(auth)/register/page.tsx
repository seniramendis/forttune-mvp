'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed.')
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
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
          <h1 className="text-2xl font-bold text-[#0D1B3E] mb-1">Create an account</h1>
          <p className="text-[#6B7A99] text-sm mb-6">Join Forttune to start shopping</p>

          {success ? (
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm text-center">
              ✓ Account created! Redirecting to login…
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7A99] uppercase tracking-wide mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="John Silva"
                    className="w-full border border-[#0D1B3E]/20 rounded-lg px-4 py-2.5 text-sm text-[#0D1B3E] placeholder-[#6B7A99]/60 focus:outline-none focus:border-[#E85D26] focus:ring-1 focus:ring-[#E85D26]/20 transition-colors"
                  />
                </div>

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
                    minLength={6}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="w-full border border-[#0D1B3E]/20 rounded-lg px-4 py-2.5 text-sm text-[#0D1B3E] placeholder-[#6B7A99]/60 focus:outline-none focus:border-[#E85D26] focus:ring-1 focus:ring-[#E85D26]/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B7A99] uppercase tracking-wide mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                    placeholder="Repeat your password"
                    className="w-full border border-[#0D1B3E]/20 rounded-lg px-4 py-2.5 text-sm text-[#0D1B3E] placeholder-[#6B7A99]/60 focus:outline-none focus:border-[#E85D26] focus:ring-1 focus:ring-[#E85D26]/20 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#E85D26] text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-[#F47A4A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-[#6B7A99] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#E85D26] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
