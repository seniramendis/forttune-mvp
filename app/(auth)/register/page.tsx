'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setSuccess('Account created successfully. You can now sign in.');
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F5F6FA]">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-[#0D1B3E] flex-col justify-between p-12 relative overflow-hidden">
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
            Join Sri Lanka's<br />
            leading <span className="text-[#E85D26]">IT channel</span><br />
            network.
          </h1>
          <p className="text-[#6B7A99] text-sm leading-relaxed max-w-sm">
            Get access to real-time inventory, competitive pricing, and dedicated B2B support — all in one place.
          </p>
          <ul className="space-y-3 pt-2">
            {[
              'Live inventory with instant availability',
              'Official warranty on all products',
              'Dedicated account management',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-[#6B7A99]">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-[#E85D26]/20 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-[#E85D26]" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-[#6B7A99] text-xs">
          © {new Date().getFullYear()} Forttune Channels (Pvt) Ltd. All rights reserved.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <img
              src="https://res.cloudinary.com/dukv2otyn/image/upload/v1781957501/874b574032c781f9eb100c851006a78d_crop1681211041_sxrilv.png"
              alt="Forttune Channels"
              className="h-9 object-contain"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#0D1B3E]/8 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#0D1B3E]">Create an account</h2>
              <p className="mt-1.5 text-sm text-[#6B7A99]">Fill in your details to get started.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-start gap-2">
                <svg viewBox="0 0 20 20" className="w-4 h-4 shrink-0 mt-0.5 text-green-500" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-[#0D1B3E] mb-1.5 uppercase tracking-wider">Full name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-[#0D1B3E]/15 rounded-xl text-sm text-[#0D1B3E] bg-[#F5F6FA] outline-none focus:border-[#E85D26] focus:bg-white transition-colors"
                  placeholder="Your full name"
                />
              </div>

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
                <label className="block text-xs font-semibold text-[#0D1B3E] mb-1.5 uppercase tracking-wider">Password</label>
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
                className="w-full bg-[#E85D26] hover:bg-[#F47A4A] text-white font-semibold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50 shadow-md mt-2"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#0D1B3E]/8 text-center text-sm text-[#6B7A99]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#E85D26] font-semibold hover:underline">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
