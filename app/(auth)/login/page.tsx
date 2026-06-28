'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      
      localStorage.setItem('forttune_user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
      }));
      
      window.location.href = data.redirectTo ?? '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F5F6FA]">
      {/* Left panel — brand */}
      <div className="hidden lg:flex w-1/2 bg-[#0D1B3E] flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle geometric accent */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#E85D26]/10 pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-[#1A2F5E] pointer-events-none" />

        <div className="relative z-10">
          <img
            src="https://res.cloudinary.com/dukv2otyn/image/upload/v1781957501/874b574032c781f9eb100c851006a78d_crop1681211041_sxrilv.png"
            alt="Forttune Channels"
            className="h-10 object-contain"
          />
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Sri Lanka's trusted<br />
            <span className="text-[#E85D26]">IT hardware</span><br />
            distributor.
          </h1>
          <p className="text-[#6B7A99] text-sm leading-relaxed max-w-sm">
            Serving 500+ channel partners across the island with genuine products, official warranty, and island-wide delivery.
          </p>
          <div className="flex gap-6 pt-2">
            {[['15+', 'Global Brands'], ['500+', 'Channel Partners'], ['24h', 'Support']].map(([num, label]) => (
              <div key={label}>
                <div className="text-white font-bold text-xl">{num}</div>
                <div className="text-[#6B7A99] text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[#6B7A99] text-xs">
          © {new Date().getFullYear()} Forttune Channels (Pvt) Ltd. All rights reserved.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <img
              src="https://res.cloudinary.com/dukv2otyn/image/upload/v1781957501/874b574032c781f9eb100c851006a78d_crop1681211041_sxrilv.png"
              alt="Forttune Channels"
              className="h-9 object-contain"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#0D1B3E]/8 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#0D1B3E]">Sign in</h2>
              <p className="mt-1.5 text-sm text-[#6B7A99]">Welcome back — enter your credentials to continue.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-[#0D1B3E] mb-1.5 uppercase tracking-wider">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-[#0D1B3E]/15 rounded-xl text-sm text-[#0D1B3E] bg-[#F5F6FA] outline-none focus:border-[#E85D26] focus:bg-white transition-colors"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#0D1B3E] uppercase tracking-wider">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-[#0D1B3E]/15 rounded-xl text-sm text-[#0D1B3E] bg-[#F5F6FA] outline-none focus:border-[#E85D26] focus:bg-white transition-colors pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#6B7A99] hover:text-[#0D1B3E] transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0D1B3E] hover:bg-[#1A2F5E] text-white font-semibold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50 shadow-md mt-2"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#0D1B3E]/8 text-center text-sm text-[#6B7A99]">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#E85D26] font-semibold hover:underline">Create one</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
