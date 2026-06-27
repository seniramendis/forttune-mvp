'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingBag, MapPin, User, LogOut, ChevronRight,
  Package, Clock, CheckCircle, Truck, Star, Bell,
  Shield, Gift, HeadphonesIcon, Download, Heart,
  TrendingUp, Zap, Award
} from 'lucide-react'

const NAV = [
  { key: 'overview',   label: 'Dashboard',      icon: TrendingUp },
  { key: 'orders',     label: 'My Orders',       icon: ShoppingBag },
  { key: 'wishlist',   label: 'Saved Items',     icon: Heart },
  { key: 'downloads',  label: 'Downloads',       icon: Download },
  { key: 'addresses',  label: 'Addresses',       icon: MapPin },
  { key: 'profile',    label: 'Account Details', icon: User },
  { key: 'support',    label: 'Support',         icon: HeadphonesIcon },
]

const ORDER_STATUSES: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:    { label: 'Pending',    color: 'text-amber-600 bg-amber-50 border-amber-200',   icon: Clock },
  PROCESSING: { label: 'Processing', color: 'text-blue-600 bg-blue-50 border-blue-200',      icon: Package },
  SHIPPED:    { label: 'Shipped',    color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Truck },
  DELIVERED:  { label: 'Delivered',  color: 'text-green-600 bg-green-50 border-green-200',   icon: CheckCircle },
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tab, setTab] = useState('overview')
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('forttune_user')
      if (!stored) { router.push('/login'); return }
      setUser(JSON.parse(stored))
    } catch {
      router.push('/login')
    }
  }, [])

  useEffect(() => {
    if (tab === 'orders' && user) fetchOrders()
  }, [tab, user])

  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      const res = await fetch(`/api/orders?userId=${user.id}`)
      if (res.ok) setOrders(await res.json())
    } catch {}
    finally { setOrdersLoading(false) }
  }

  const logout = () => {
    localStorage.removeItem('forttune_user')
    localStorage.removeItem('forttune_session')
    router.push('/')
  }

  if (!user) return (
    <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E85D26] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const initials = (user.name || user.email || '?').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* TOP NAV */}
      <nav className="bg-white border-b border-[#0D1B3E]/10 h-[60px] flex items-center justify-between px-5 md:px-10 sticky top-0 z-40 shadow-sm">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#E85D26] rounded-lg flex items-center justify-center font-bold text-white text-sm">F</div>
          <span className="font-semibold text-[#0D1B3E] text-base tracking-wide">Forttune</span>
        </Link>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell size={18} className="text-[#6B7A99]" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#E85D26] rounded-full" />
          </button>
          <Link href="/" className="text-sm text-[#6B7A99] hover:text-[#0D1B3E] transition-colors">← Back to Store</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6 items-start">

        {/* SIDEBAR */}
        <aside className="w-64 shrink-0 sticky top-[76px]">
          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-[#0D1B3E]/10 overflow-hidden mb-3 shadow-sm">
            {/* Orange banner */}
            <div className="h-16 bg-gradient-to-r from-[#0D1B3E] to-[#1A3060] relative">
              <div className="absolute -bottom-6 left-5">
                <div className="w-12 h-12 rounded-xl bg-[#E85D26] text-white flex items-center justify-center text-lg font-bold shadow-lg border-2 border-white">
                  {initials}
                </div>
              </div>
              <div className="absolute top-2 right-3">
                <span className="bg-[#E85D26]/20 text-[#E85D26] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#E85D26]/30 flex items-center gap-1">
                  <Award size={9} /> Member
                </span>
              </div>
            </div>
            <div className="pt-8 px-5 pb-4">
              <p className="font-semibold text-[#0D1B3E] text-sm truncate">{user.name || 'Customer'}</p>
              <p className="text-xs text-[#6B7A99] truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Nav items */}
          <div className="bg-white rounded-2xl border border-[#0D1B3E]/10 overflow-hidden shadow-sm">
            {NAV.map((item, i) => {
              const Icon = item.icon
              const active = tab === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${i < NAV.length - 1 ? 'border-b border-[#0D1B3E]/5' : ''} ${active ? 'bg-[#E85D26]/8 text-[#E85D26]' : 'text-[#6B7A99] hover:text-[#0D1B3E] hover:bg-gray-50'}`}
                >
                  <Icon size={16} className={active ? 'text-[#E85D26]' : ''} />
                  {item.label}
                  {active && <ChevronRight size={14} className="ml-auto" />}
                </button>
              )
            })}
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors border-t border-[#0D1B3E]/5"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0">

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="space-y-5">
              {/* Welcome banner */}
              <div className="bg-gradient-to-r from-[#0D1B3E] to-[#1A3060] rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute right-12 bottom-0 w-32 h-32 bg-[#E85D26]/20 rounded-full translate-y-1/2" />
                <div className="relative">
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Welcome back</p>
                  <h1 className="text-2xl font-bold mb-1">{user.name?.split(' ')[0] || 'There'} 👋</h1>
                  <p className="text-white/60 text-sm">Manage your orders, saved items & account from here.</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Orders', value: '0', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Saved Items', value: '0', icon: Heart, color: 'bg-rose-50 text-rose-500' },
                  { label: 'Reward Points', value: '0 pts', icon: Gift, color: 'bg-amber-50 text-amber-500' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl border border-[#0D1B3E]/10 p-4 shadow-sm">
                    <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                      <s.icon size={17} />
                    </div>
                    <p className="text-xl font-bold text-[#0D1B3E]">{s.value}</p>
                    <p className="text-xs text-[#6B7A99] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-[#0D1B3E]/10 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-[#0D1B3E]/5">
                  <h2 className="font-semibold text-[#0D1B3E] text-sm">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-2 divide-x divide-y divide-[#0D1B3E]/5">
                  {[
                    { label: 'Track My Order',     icon: Truck,           action: () => setTab('orders'),    desc: 'See live delivery status' },
                    { label: 'Browse Products',    icon: Zap,             action: () => router.push('/'),    desc: 'Explore our full catalog' },
                    { label: 'Saved Items',        icon: Heart,           action: () => setTab('wishlist'),  desc: 'Items you\'ve bookmarked' },
                    { label: 'Get Support',        icon: HeadphonesIcon,  action: () => setTab('support'),   desc: 'We\'re here to help' },
                  ].map(a => (
                    <button key={a.label} onClick={a.action} className="flex items-center gap-3 px-5 py-4 hover:bg-[#F5F6FA] transition-colors text-left group">
                      <div className="w-9 h-9 rounded-lg bg-[#0D1B3E]/5 flex items-center justify-center group-hover:bg-[#E85D26]/10 transition-colors shrink-0">
                        <a.icon size={16} className="text-[#6B7A99] group-hover:text-[#E85D26] transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0D1B3E]">{a.label}</p>
                        <p className="text-xs text-[#6B7A99]">{a.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Perks */}
              <div className="bg-white rounded-2xl border border-[#0D1B3E]/10 shadow-sm p-5">
                <h2 className="font-semibold text-[#0D1B3E] text-sm mb-4">Your Member Perks</h2>
                <div className="space-y-3">
                  {[
                    { icon: Shield,    color: 'text-blue-500 bg-blue-50',   title: 'Official Warranty',   desc: 'All products come with manufacturer warranty' },
                    { icon: Truck,     color: 'text-green-500 bg-green-50', title: 'Island-wide Delivery', desc: 'We deliver anywhere in Sri Lanka' },
                    { icon: Star,      color: 'text-amber-500 bg-amber-50', title: 'Priority Support',     desc: 'Registered members get faster response times' },
                    { icon: Gift,      color: 'text-rose-500 bg-rose-50',   title: 'Loyalty Rewards',     desc: 'Earn points on every purchase' },
                  ].map(p => (
                    <div key={p.title} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${p.color} flex items-center justify-center shrink-0`}>
                        <p.icon size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0D1B3E]">{p.title}</p>
                        <p className="text-xs text-[#6B7A99]">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {tab === 'orders' && (
            <div className="bg-white rounded-2xl border border-[#0D1B3E]/10 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#0D1B3E]/5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-[#0D1B3E]">My Orders</h2>
                  <p className="text-xs text-[#6B7A99] mt-0.5">Track and manage your purchases</p>
                </div>
                <button onClick={() => router.push('/')} className="text-xs font-semibold text-[#E85D26] hover:underline">+ Shop Now</button>
              </div>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 border-2 border-[#E85D26] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-16 h-16 bg-[#F5F6FA] rounded-2xl flex items-center justify-center mb-4">
                    <ShoppingBag size={28} className="text-[#6B7A99]/40" />
                  </div>
                  <p className="font-semibold text-[#0D1B3E]">No orders yet</p>
                  <p className="text-sm text-[#6B7A99] mt-1 mb-4">Your purchases will appear here once you place your first order.</p>
                  <button onClick={() => router.push('/')} className="bg-[#E85D26] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#F47A4A] transition-colors">
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#0D1B3E]/5">
                  {orders.map((o: any) => {
                    const s = ORDER_STATUSES[o.status] || ORDER_STATUSES.PENDING
                    const Icon = s.icon
                    return (
                      <div key={o.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50">
                        <div className="w-10 h-10 bg-[#F5F6FA] rounded-xl flex items-center justify-center shrink-0">
                          <Package size={18} className="text-[#6B7A99]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0D1B3E]">Order #{o.id.slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-[#6B7A99] mt-0.5">{new Date(o.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#0D1B3E]">Rs {o.total?.toLocaleString('en-LK')}</p>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 ${s.color}`}>
                            <Icon size={10} /> {s.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── WISHLIST ── */}
          {tab === 'wishlist' && (
            <div className="bg-white rounded-2xl border border-[#0D1B3E]/10 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#0D1B3E]/5">
                <h2 className="font-semibold text-[#0D1B3E]">Saved Items</h2>
                <p className="text-xs text-[#6B7A99] mt-0.5">Products you've bookmarked</p>
              </div>
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
                  <Heart size={28} className="text-rose-300" />
                </div>
                <p className="font-semibold text-[#0D1B3E]">Nothing saved yet</p>
                <p className="text-sm text-[#6B7A99] mt-1 mb-4">Tap the heart icon on any product to save it here.</p>
                <button onClick={() => router.push('/')} className="bg-[#E85D26] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#F47A4A] transition-colors">
                  Explore Products
                </button>
              </div>
            </div>
          )}

          {/* ── DOWNLOADS ── */}
          {tab === 'downloads' && (
            <div className="bg-white rounded-2xl border border-[#0D1B3E]/10 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#0D1B3E]/5">
                <h2 className="font-semibold text-[#0D1B3E]">Downloads</h2>
                <p className="text-xs text-[#6B7A99] mt-0.5">Invoices, warranty cards & product manuals</p>
              </div>
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <Download size={28} className="text-blue-300" />
                </div>
                <p className="font-semibold text-[#0D1B3E]">No downloads yet</p>
                <p className="text-sm text-[#6B7A99] mt-1">Invoices and documents from your orders will appear here.</p>
              </div>
            </div>
          )}

          {/* ── ADDRESSES ── */}
          {tab === 'addresses' && (
            <div className="bg-white rounded-2xl border border-[#0D1B3E]/10 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#0D1B3E]/5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-[#0D1B3E]">Saved Addresses</h2>
                  <p className="text-xs text-[#6B7A99] mt-0.5">Manage your delivery addresses</p>
                </div>
                <button className="text-xs font-semibold bg-[#0D1B3E] text-white px-3 py-1.5 rounded-lg hover:bg-[#1A3060] transition-colors">+ Add Address</button>
              </div>
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                  <MapPin size={28} className="text-green-300" />
                </div>
                <p className="font-semibold text-[#0D1B3E]">No addresses saved</p>
                <p className="text-sm text-[#6B7A99] mt-1 mb-4">Add a delivery address to speed up checkout.</p>
                <button className="bg-[#E85D26] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#F47A4A] transition-colors">
                  Add New Address
                </button>
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <div className="bg-white rounded-2xl border border-[#0D1B3E]/10 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#0D1B3E]/5">
                <h2 className="font-semibold text-[#0D1B3E]">Account Details</h2>
                <p className="text-xs text-[#6B7A99] mt-0.5">Your personal information</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Full Name', value: user.name || '—' },
                  { label: 'Email Address', value: user.email },
                  { label: 'Account Role', value: user.role || 'Customer' },
                  { label: 'Member Since', value: 'June 2026' },
                ].map(f => (
                  <div key={f.label} className="flex items-center justify-between py-3 border-b border-[#0D1B3E]/5 last:border-0">
                    <p className="text-xs font-semibold text-[#6B7A99] uppercase tracking-wide">{f.label}</p>
                    <p className="text-sm font-medium text-[#0D1B3E]">{f.value}</p>
                  </div>
                ))}
                <button className="mt-2 w-full bg-[#0D1B3E] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#1A3060] transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>
          )}

          {/* ── SUPPORT ── */}
          {tab === 'support' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#E85D26] to-[#F47A4A] rounded-2xl p-6 text-white">
                <HeadphonesIcon size={28} className="mb-3 opacity-80" />
                <h2 className="text-lg font-bold mb-1">We're here to help</h2>
                <p className="text-white/80 text-sm">Reach out through any channel below — our team typically responds within 2 hours on business days.</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { icon: '📞', title: 'Call Us',        desc: '+94 11 234 5678',               sub: 'Mon–Sat, 9AM–6PM',       action: 'tel:+94112345678' },
                  { icon: '💬', title: 'WhatsApp',       desc: 'Chat with our team',            sub: 'Usually replies in 1hr',  action: 'https://wa.me/94112345678' },
                  { icon: '📧', title: 'Email Support',  desc: 'support@forttune.lk',           sub: 'Within 24 hours',         action: 'mailto:support@forttune.lk' },
                  { icon: '📍', title: 'Visit Us',       desc: 'Mt. Lavinia, Colombo',          sub: 'Showroom open daily',     action: '#' },
                ].map(c => (
                  <a key={c.title} href={c.action} className="bg-white rounded-xl border border-[#0D1B3E]/10 p-4 flex items-center gap-4 hover:shadow-md transition-shadow shadow-sm">
                    <div className="w-11 h-11 bg-[#F5F6FA] rounded-xl flex items-center justify-center text-xl shrink-0">{c.icon}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#0D1B3E] text-sm">{c.title}</p>
                      <p className="text-sm text-[#E85D26] font-medium">{c.desc}</p>
                      <p className="text-xs text-[#6B7A99]">{c.sub}</p>
                    </div>
                    <ChevronRight size={16} className="text-[#6B7A99]" />
                  </a>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
