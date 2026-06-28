"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, TrendingUp, AlertCircle,
  Users, X, Edit2, Trash2, Upload, Mail, Calendar, ShoppingBag,
  ArrowUpRight, ArrowDownRight, Cpu, DollarSign, Activity, MessageCircle, CheckCheck, Trash, Menu
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  RadialBarChart, RadialBar, LineChart, Line
} from 'recharts';

/* ─────────────────────────────────────────────────────────────────── */
/*  Colour tokens (brand palette)                                      */
/* ─────────────────────────────────────────────────────────────────── */
const BRAND   = '#E85D26';
const NAVY    = '#0D1B3E';
const MUTED   = '#6B7A99';
const BG      = '#F5F6FA';
const WHITE   = '#ffffff';

const CATEGORY_COLORS = ['#E85D26','#0D1B3E','#3B82F6','#10B981','#F59E0B','#8B5CF6','#EC4899'];

/* ─────────────────────────────────────────────────────────────────── */
/*  Custom tooltip shared by multiple charts                           */
/* ─────────────────────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, prefix = 'Rs ', suffix = '' }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: WHITE, borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(13,27,62,0.12)', border: 'none',
      fontSize: 13, color: NAVY
    }}>
      {label && <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color || BRAND }}>
          {p.name}: <strong>{prefix}{typeof p.value === 'number' ? p.value.toLocaleString('en-LK') : p.value}{suffix}</strong>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────── */
/*  Stat card                                                          */
/* ─────────────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, trend, trendUp, color }: any) {
  const Icon = icon;
  return (
    <div style={{
      background: WHITE, borderRadius: 16, padding: '16px',
      border: `1px solid ${NAVY}1A`, boxShadow: '0 2px 8px rgba(13,27,62,0.05)',
      display: 'flex', flexDirection: 'column', gap: 10
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={20} color={color} />
        </div>
        {trend !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3, fontSize: 12,
            fontWeight: 600, color: trendUp ? '#10B981' : '#EF4444',
            background: trendUp ? '#10B98118' : '#EF444418',
            borderRadius: 20, padding: '3px 8px'
          }}>
            {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 13, color: MUTED, fontWeight: 500, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: NAVY, letterSpacing: '-0.5px' }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Section header                                                     */
/* ─────────────────────────────────────────────────────────────────── */
function ChartCard({ title, subtitle, children, style = {} }: any) {
  return (
    <div style={{
      background: WHITE, borderRadius: 16, padding: '24px',
      border: `1px solid ${NAVY}1A`, boxShadow: '0 2px 8px rgba(13,27,62,0.05)',
      ...style
    }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Main component                                                     */
/* ─────────────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser]   = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [products, setProducts]     = useState<any[]>([]);
  const [customers, setCustomers]   = useState<any[]>([]);
  const [allOrders, setAllOrders]   = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [messages, setMessages]     = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [apiError, setApiError]     = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  const [formData, setFormData] = useState({
    name: '', brand: '', category: 'Laptops', price: '', stock: '',
    sku: '', spec: '', badge: '', image: ''
  });

  /* auth guard */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('forttune_user');
      if (!stored) { router.replace('/login'); return; }
      const user = JSON.parse(stored);
      if (user.role !== 'ADMIN') { router.replace('/'); return; }
      setAdminUser(user);
    } catch { router.replace('/login'); }
    finally { setAuthChecked(true); }
  }, []);

  const fetchInventory = async () => {
    try {
      const res  = await fetch('/api/products?admin=1');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) { setProducts(data); setApiError(null); }
      else { setApiError(data.error || 'Failed to parse product array.'); setProducts([]); }
    } catch { setApiError('Could not reach backend.'); setProducts([]); }
  };

  const fetchCustomers = async () => {
    setCustomersLoading(true); setCustomersError(null);
    try {
      const res  = await fetch('/api/customers');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setCustomers(data);
      else { setCustomersError(data.error || 'Failed to load customers.'); setCustomers([]); }
    } catch { setCustomersError('Could not reach the server.'); setCustomers([]); }
    finally { setCustomersLoading(false); }
  };

  const fetchAllOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res  = await fetch('/api/orders/all');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setAllOrders(data);
    } catch {}
    finally { setOrdersLoading(false); }
  }, []);

  const fetchMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const res  = await fetch('/api/contact');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setMessages(data);
    } catch {}
    finally { setMessagesLoading(false); }
  }, []);

  const markRead = async (id: string, read: boolean) => {
    await fetch(`/api/contact?id=${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read }),
    });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read } : m));
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  useEffect(() => { fetchInventory(); }, []);
  useEffect(() => {
    if (activeTab === 'customers') fetchCustomers();
    if (activeTab === 'orders' || activeTab === 'overview') fetchAllOrders();
    if (activeTab === 'messages') fetchMessages();
  }, [activeTab]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name:'', brand:'', category:'Laptops', price:'', stock:'', sku:'', spec:'', badge:'', image:'' });
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, brand: product.brand || '', category: product.category || 'Laptops',
      price: product.price.toString(), stock: product.stock.toString(),
      sku: product.sku || '', spec: product.spec || '', badge: product.badge || '', image: product.image || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    const url    = editingProduct ? `/api/products?id=${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) { setIsModalOpen(false); fetchInventory(); alert(editingProduct ? 'Updated!' : 'Added!'); }
      else alert('Action failed.');
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) { fetchInventory(); alert('Removed!'); }
      else alert('Failed.');
    } catch (err) { console.error(err); }
  };

  /* ─── derived analytics ──────────────────────────────────────────── */
  const now = new Date();
  const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // 7-day revenue area chart
  const salesData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const dayStr   = DAY_NAMES[d.getDay()];
    const dayOrders = allOrders.filter(o => {
      const od = new Date(o.createdAt);
      return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth() && od.getDate() === d.getDate();
    });
    const revenue  = dayOrders.reduce((s, o) => s + (o.total || 0), 0);
    const webRev   = dayOrders.filter(o => !o.isPosOrder).reduce((s, o) => s + (o.total || 0), 0);
    const posRev   = dayOrders.filter(o =>  o.isPosOrder).reduce((s, o) => s + (o.total || 0), 0);
    return { name: dayStr, revenue, web: webRev, pos: posRev };
  });

  // Give the chart's Y-axis ~20% headroom above the highest point so the
  // line/area never touches the top edge of the card.
  const salesPeak = Math.max(1, ...salesData.map(d => Math.max(d.web, d.pos)));
  const salesYMax = Math.ceil((salesPeak * 1.2) / 5000) * 5000;

  // KPIs
  const weekOrders    = allOrders.filter(o => (now.getTime() - new Date(o.createdAt).getTime()) < 7*86400*1000);
  const totalRevenue  = weekOrders.reduce((s, o) => s + (o.total || 0), 0);
  const weekOrderCount = weekOrders.length;
  const avgOrderValue  = weekOrderCount ? totalRevenue / weekOrderCount : 0;

  const validProductList = Array.isArray(products) ? products : [];
  const activeProducts   = validProductList.filter(p => p && p.badge !== 'archived_hidden');
  const lowStockItems    = activeProducts.filter(p => typeof p.stock === 'number' && p.stock < 5).length;

  // Category breakdown pie
  const categoryMap: Record<string, number> = {};
  activeProducts.forEach(p => { categoryMap[p.category] = (categoryMap[p.category] || 0) + 1; });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Sales channel split
  const webOrders  = allOrders.filter(o => !o.isPosOrder).length;
  const posOrders  = allOrders.filter(o =>  o.isPosOrder).length;
  const channelData = [
    { name: 'Web', value: webOrders  || 1 },
    { name: 'POS', value: posOrders || 1 },
  ];

  // Payment method breakdown (30-day)
  const pmMap: Record<string, number> = {};
  allOrders.forEach(o => { pmMap[o.paymentMethod] = (pmMap[o.paymentMethod] || 0) + (o.total || 0); });
  const paymentData = Object.entries(pmMap).map(([name, value], i) => ({
    name, value, fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
  }));

  // Top 5 products by revenue
  const productRevMap: Record<string, { name: string; rev: number }> = {};
  allOrders.forEach(o => {
    (o.items || []).forEach((item: any) => {
      const pid  = item.productId;
      const name = item.product?.name || 'Unknown';
      if (!productRevMap[pid]) productRevMap[pid] = { name, rev: 0 };
      productRevMap[pid].rev += (item.price || 0) * (item.quantity || 1);
    });
  });
  const topProducts = Object.values(productRevMap).sort((a, b) => b.rev - a.rev).slice(0, 5);

  // 30-day customer signups (simple weekly bucketed)
  const signupData = Array.from({ length: 4 }, (_, i) => {
    const label = `W${4 - i}`;
    const start = new Date(now); start.setDate(now.getDate() - (i + 1) * 7);
    const end   = new Date(now); end.setDate(now.getDate() - i * 7);
    const count = customers.filter(c => {
      const d = new Date(c.createdAt);
      return d >= start && d < end;
    }).length;
    return { name: label, signups: count };
  }).reverse();

  // Order status distribution
  const statusMap: Record<string, number> = { COMPLETED: 0, PENDING: 0, CANCELLED: 0 };
  allOrders.forEach(o => { if (statusMap[o.status] !== undefined) statusMap[o.status]++; });
  const completionRate = allOrders.length
    ? Math.round((statusMap.COMPLETED / allOrders.length) * 100) : 0;
  const radialData = [{ name: 'Completed', value: completionRate, fill: '#10B981' }];

  /* ─── auth gate ──────────────────────────────────────────────────── */
  if (!authChecked) return (
    <div className="flex h-screen items-center justify-center" style={{ background: BG }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
    </div>
  );
  if (!adminUser) return null;

  const adminName     = adminUser.name || adminUser.email || 'Admin';
  const adminInitials = adminName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  /* ─── nav items ──────────────────────────────────────────────────── */
  const unreadCount = messages.filter(m => !m.read).length;

  const navItems = [
    { key: 'overview',   Icon: LayoutDashboard, label: 'Overview' },
    { key: 'inventory',  Icon: Package,          label: 'Inventory', badge: lowStockItems > 0 ? String(lowStockItems) : null, badgeColor: '#EF4444' },
    { key: 'orders',     Icon: ShoppingCart,     label: 'Orders' },
    { key: 'customers',  Icon: Users,            label: 'Customers', badge: customers.length > 0 ? String(customers.length) : null, badgeColor: NAVY },
    { key: 'messages',   Icon: MessageCircle,    label: 'Messages', badge: unreadCount > 0 ? String(unreadCount) : null, badgeColor: BRAND },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', background: BG, fontFamily: 'Inter, system-ui, sans-serif', color: NAVY }} className="relative">

      {/* ── MOBILE SIDEBAR BACKDROP ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
      <div className={`${mobileSidebarOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden'} lg:flex lg:relative lg:z-auto`} style={{ width: 260, background: WHITE, borderRight: `1px solid ${NAVY}1A`, display: mobileSidebarOpen ? 'flex' : undefined, flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ height: 70, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: `1px solid ${NAVY}1A` }}>
          <img src="https://res.cloudinary.com/dukv2otyn/image/upload/v1782676866/Forttune-3.1_sj71vp.webp" alt="Forttune" style={{ height: 32, objectFit: 'contain' }} />
        </div>
        <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ key, Icon, label, badge, badgeColor }) => {
            const active = activeTab === key;
            return (
              <button key={key} onClick={() => setActiveTab(key)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
                background: active ? `${BRAND}15` : 'transparent',
                color: active ? BRAND : MUTED,
              }}>
                <Icon size={18} />
                <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
                {badge && (
                  <span style={{
                    background: `${badgeColor}18`, color: badgeColor,
                    borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600
                  }}>{badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* header */}
        <header style={{ height: 70, background: WHITE, borderBottom: `1px solid ${NAVY}1A`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setMobileSidebarOpen(true)}><Menu size={20} color={MUTED} /></button>
            <h1 style={{ fontSize: 18, fontWeight: 600, textTransform: 'capitalize', margin: 0 }}>{activeTab}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>Welcome, {adminName.split(' ')[0]}</span>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: NAVY, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{adminInitials}</div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }} className="sm:!p-6 lg:!p-8">

          {apiError && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} /> <strong>Database Error:</strong> {apiError}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* OVERVIEW TAB                                              */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200 }}>

              {/* KPI row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
                <StatCard icon={DollarSign}   label="7-Day Revenue"      value={`Rs ${totalRevenue.toLocaleString('en-LK')}`}  color="#10B981" trend="+12.5%" trendUp={true} />
                <StatCard icon={ShoppingCart} label="Orders This Week"   value={weekOrderCount}                                 color="#3B82F6" />
                <StatCard icon={Activity}     label="Avg. Order Value"   value={`Rs ${Math.round(avgOrderValue).toLocaleString('en-LK')}`} color={BRAND} />
                <StatCard icon={AlertCircle}  label="Low Stock Alerts"   value={`${lowStockItems} Items`}                      color="#EF4444" sub="Items below 5 units" />
                <StatCard icon={MessageCircle} label="Unread Messages"   value={unreadCount}                                       color="#E85D26" sub="From contact form" />
              </div>

              {/* Revenue area chart + Order completion radial */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                <ChartCard title="Revenue Trend" subtitle="Web vs POS — last 7 days">
                  <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                        <defs>
                          <linearGradient id="webGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={BRAND} stopOpacity={0.18} />
                            <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={NAVY} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={NAVY} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={`${NAVY}12`} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 12 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} domain={[0, salesYMax]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="web" name="Web" stroke={BRAND}  strokeWidth={2.5} fill="url(#webGrad)" dot={false} activeDot={{ r: 5, fill: BRAND }} />
                        <Area type="monotone" dataKey="pos" name="POS" stroke={NAVY}   strokeWidth={2}   fill="url(#posGrad)" dot={false} activeDot={{ r: 5, fill: NAVY }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
                </div>

                <ChartCard title="Order Completion" subtitle="All-time completion rate">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <div style={{ height: 180, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
                          <RadialBar dataKey="value" cornerRadius={8} background={{ fill: `${NAVY}0A` }} />
                          <text x="50%" y="48%" textAnchor="middle" style={{ fontSize: 28, fontWeight: 700, fill: NAVY }}>{completionRate}%</text>
                          <text x="50%" y="62%" textAnchor="middle" style={{ fontSize: 12, fill: MUTED }}>Completed</text>
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: '100%' }} className="!grid-cols-2 sm:!grid-cols-3">
                      {Object.entries(statusMap).map(([status, count]) => (
                        <div key={status} style={{ textAlign: 'center', padding: '8px 4px', background: BG, borderRadius: 8 }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: status === 'COMPLETED' ? '#10B981' : status === 'CANCELLED' ? '#EF4444' : '#F59E0B' }}>{count}</div>
                          <div style={{ fontSize: 10, color: MUTED, fontWeight: 500 }}>{status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ChartCard>
              </div>

              {/* Category pie + Channel donut + Payment radial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                <ChartCard title="Inventory by Category" subtitle="Active SKUs per category">
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                          {categoryData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip prefix="" suffix=" SKUs" />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="Sales Channel Split" subtitle="Web vs POS — all orders">
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={channelData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                          <Cell fill={BRAND} />
                          <Cell fill={NAVY} />
                        </Pie>
                        <Tooltip content={<CustomTooltip prefix="" suffix=" orders" />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="Revenue by Payment" subtitle="Lifetime across all methods">
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="95%" data={paymentData.length ? paymentData : [{ name:'–', value:1, fill:'#E2E8F0' }]} startAngle={90} endAngle={-270}>
                        <RadialBar dataKey="value" cornerRadius={4} background={{ fill: `${NAVY}06` }} label={{ position:'insideStart', fill: WHITE, fontSize: 10, fontWeight: 600 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>

              {/* Top products + customer signups line chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard title="Top 5 Products by Revenue" subtitle="Based on all-time sales">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {topProducts.length === 0 ? (
                      <div style={{ color: MUTED, fontSize: 13, textAlign: 'center', padding: '32px 0' }}>No order data yet</div>
                    ) : topProducts.map((p, i) => {
                      const maxRev = topProducts[0].rev || 1;
                      const pct    = (p.rev / maxRev) * 100;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, background: `${CATEGORY_COLORS[i]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: CATEGORY_COLORS[i], flexShrink: 0 }}>{i+1}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: NAVY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                            <div style={{ height: 5, background: `${NAVY}0D`, borderRadius: 99, marginTop: 4, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: CATEGORY_COLORS[i], borderRadius: 99 }} />
                            </div>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: NAVY, flexShrink: 0 }}>Rs {p.rev.toLocaleString('en-LK')}</div>
                        </div>
                      );
                    })}
                  </div>
                </ChartCard>

                <ChartCard title="New Customer Signups" subtitle="Last 4 weeks">
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={signupData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={`${NAVY}10`} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 12 }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip prefix="" suffix=" signups" />} />
                        <Line type="monotone" dataKey="signups" name="Signups" stroke={BRAND} strokeWidth={2.5} dot={{ fill: BRAND, r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, padding: '10px 14px', background: BG, borderRadius: 10 }}>
                    <div style={{ fontSize: 12, color: MUTED }}>Total customers</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{customers.length}</div>
                  </div>
                </ChartCard>
              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* INVENTORY TAB                                             */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'inventory' && (
            <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${NAVY}1A`, overflow: 'hidden', maxWidth: 1200 }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${NAVY}0F`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: BG }}>
                <h3 style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>Product Database</h3>
                <button onClick={openAddModal} style={{ background: NAVY, color: WHITE, padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>+ Add Product</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${NAVY}0F`, background: WHITE }}>
                      {['SKU','Product Name','Category','Price (LKR)','Stock','Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Actions' ? 'right' : 'left', color: MUTED, fontWeight: 600, fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeProducts.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: MUTED }}>No products found.</td></tr>
                    ) : activeProducts.map(product => product && (
                      <tr key={product.id} style={{ borderBottom: `1px solid ${NAVY}08` }}>
                        <td style={{ padding: '12px 16px', color: MUTED, fontFamily: 'monospace', fontSize: 11 }}>{product.sku || 'N/A'}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>{product.name}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: `${NAVY}0D`, color: NAVY, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{product.category}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>Rs {(product.price || 0).toLocaleString('en-LK')}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            background: (product.stock || 0) < 5 ? '#FEF2F2' : '#F0FDF4',
                            color: (product.stock || 0) < 5 ? '#DC2626' : '#16A34A'
                          }}>{product.stock || 0} units</span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button onClick={() => openEditModal(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, padding: '4px 6px', marginRight: 4 }}><Edit2 size={15} /></button>
                          <button onClick={() => handleDeleteProduct(product.id, product.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, padding: '4px 6px' }}><Trash2 size={15} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* CUSTOMERS TAB                                             */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'customers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Registered Customers</h2>
                  <p style={{ fontSize: 13, color: MUTED, margin: '4px 0 0' }}>All accounts created via the website</p>
                </div>
                <a href="/register" target="_blank" style={{ fontSize: 13, color: BRAND, fontWeight: 500, textDecoration: 'none' }}>+ Register page</a>
              </div>

              {customersError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                  <AlertCircle size={15} /> {customersError}
                </div>
              )}

              {customersLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: MUTED }}>
                  <div style={{ width: 24, height: 24, border: `2px solid ${BRAND}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: 10 }} />
                  Loading customers…
                </div>
              ) : customers.length === 0 && !customersError ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
                  <Users size={36} color={`${MUTED}66`} />
                  <p style={{ fontWeight: 600, marginTop: 12 }}>No customers yet</p>
                  <p style={{ fontSize: 13, color: MUTED }}>Customers appear here once they register.</p>
                </div>
              ) : (
                <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${NAVY}1A`, overflow: 'hidden' }}>
                  <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${NAVY}0F`, background: BG }}>
                        {['Customer','Email','Orders','Total Spent','Last Order','Joined'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(c => (
                        <tr key={c.id} style={{ borderBottom: `1px solid ${NAVY}08` }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: NAVY, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                {(c.name || c.email || '?').charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 500 }}>{c.name || <em style={{ color: MUTED }}>No name</em>}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', color: MUTED }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Mail size={12} /> {c.email || 'N/A'}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <ShoppingBag size={12} color={MUTED} /> {c.totalOrders}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                            {c.totalSpent > 0 ? `Rs ${c.totalSpent.toLocaleString('en-LK')}` : <span style={{ color: MUTED }}>—</span>}
                          </td>
                          <td style={{ padding: '12px 16px', color: MUTED }}>
                            {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('en-LK', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: MUTED }}>
                              <Calendar size={12} />
                              {new Date(c.createdAt).toLocaleDateString('en-LK', { day:'numeric', month:'short', year:'numeric' })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* ORDERS TAB                                                */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <div style={{ maxWidth: 1200 }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>All Orders</h2>
                <p style={{ fontSize: 13, color: MUTED, margin: '4px 0 0' }}>Web and POS orders across all customers</p>
              </div>
              {ordersLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: MUTED }}>
                  <div style={{ width: 24, height: 24, border: `2px solid ${BRAND}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: 10 }} />
                  Loading orders…
                </div>
              ) : allOrders.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
                  <ShoppingCart size={36} color={`${MUTED}66`} />
                  <p style={{ fontWeight: 600, marginTop: 12 }}>No orders yet</p>
                  <p style={{ fontSize: 13, color: MUTED }}>Orders placed via web or POS will appear here.</p>
                </div>
              ) : (
                <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${NAVY}1A`, overflow: 'hidden' }}>
                  <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${NAVY}0F`, background: BG }}>
                        {['Order ID','Customer','Channel','Payment','Status','Total','Date'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allOrders.map((o: any) => (
                        <tr key={o.id} style={{ borderBottom: `1px solid ${NAVY}08` }}>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, color: MUTED }}>#{o.id.slice(-8).toUpperCase()}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 500 }}>{o.user?.name || o.user?.email || <em style={{ color: MUTED }}>Walk-in</em>}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: o.isPosOrder ? '#EFF6FF' : '#F5F3FF', color: o.isPosOrder ? '#1D4ED8' : '#7C3AED' }}>{o.isPosOrder ? 'POS' : 'Web'}</span>
                          </td>
                          <td style={{ padding: '12px 16px', color: MUTED, fontSize: 12 }}>{o.paymentMethod}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                              background: o.status === 'COMPLETED' ? '#F0FDF4' : o.status === 'CANCELLED' ? '#FEF2F2' : '#FFFBEB',
                              color:      o.status === 'COMPLETED' ? '#16A34A' : o.status === 'CANCELLED' ? '#DC2626' : '#D97706'
                            }}>{o.status}</span>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>Rs {o.total?.toLocaleString('en-LK')}</td>
                          <td style={{ padding: '12px 16px', color: MUTED, fontSize: 12 }}>
                            {new Date(o.createdAt).toLocaleDateString('en-LK', { day:'numeric', month:'short', year:'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </div>
              )}
            </div>
          )}


          {/* ══════════════════════════════════════════════════════════ */}
          {/* MESSAGES TAB                                              */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === 'messages' && (
            <div style={{ maxWidth: 860 }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Customer Messages</h2>
                <p style={{ fontSize: 13, color: '#6B7A99', margin: '4px 0 0' }}>Contact form submissions from your website</p>
              </div>

              {messagesLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: '#6B7A99' }}>
                  <div style={{ width: 24, height: 24, border: '2px solid #E85D26', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: 10 }} />
                  Loading messages…
                </div>
              ) : messages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
                  <MessageCircle size={36} color="#6B7A9966" />
                  <p style={{ fontWeight: 600, marginTop: 12, color: '#0D1B3E' }}>No messages yet</p>
                  <p style={{ fontSize: 13, color: '#6B7A99' }}>Messages submitted via the contact form will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {messages.map((msg: any) => {
                    const isExpanded = expandedMsg === msg.id;
                    return (
                      <div key={msg.id} style={{
                        background: msg.read ? '#ffffff' : '#FFF7F4',
                        border: `1px solid ${msg.read ? '#0D1B3E1A' : '#E85D2640'}`,
                        borderRadius: 14, overflow: 'hidden',
                        boxShadow: msg.read ? 'none' : '0 2px 8px rgba(232,93,38,0.07)',
                        transition: 'all 0.2s',
                      }}>
                        {/* Header row */}
                        <div
                          onClick={() => {
                            setExpandedMsg(isExpanded ? null : msg.id);
                            if (!msg.read) markRead(msg.id, true);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}
                        >
                          {/* Avatar */}
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: msg.read ? '#0D1B3E' : '#E85D26',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 15, fontWeight: 700, flexShrink: 0
                          }}>{msg.name.charAt(0).toUpperCase()}</div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 600, fontSize: 14, color: '#0D1B3E' }}>{msg.name}</span>
                              {!msg.read && (
                                <span style={{ background: '#E85D26', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, letterSpacing: '0.05em' }}>NEW</span>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: '#6B7A99', marginTop: 1 }}>{msg.email}</div>
                          </div>

                          <div style={{ fontSize: 11, color: '#6B7A99', textAlign: 'right', flexShrink: 0 }}>
                            {new Date(msg.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                            <br />
                            {new Date(msg.createdAt).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}
                          </div>

                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button
                              onClick={e => { e.stopPropagation(); markRead(msg.id, !msg.read); }}
                              title={msg.read ? 'Mark unread' : 'Mark read'}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: msg.read ? '#6B7A99' : '#10B981', borderRadius: 6 }}
                            >
                              <CheckCheck size={16} />
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); deleteMessage(msg.id); }}
                              title="Delete"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: '#6B7A99', borderRadius: 6 }}
                            >
                              <Trash size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Expanded message body */}
                        {isExpanded && (
                          <div style={{ padding: '0 18px 18px 72px', borderTop: '1px solid #0D1B3E0D' }}>
                            <div style={{ background: '#F5F6FA', borderRadius: 10, padding: '14px 16px', marginTop: 12, fontSize: 14, color: '#0D1B3E', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                              {msg.message}
                            </div>
                            <a
                              href={`mailto:${msg.email}?subject=Re: Your enquiry to Forttune`}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12, fontWeight: 600, color: '#E85D26', textDecoration: 'none' }}
                            >
                              <Mail size={13} /> Reply via email
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── PRODUCT MODAL ────────────────────────────────────────────── */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,27,62,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: WHITE, borderRadius: 16, boxShadow: '0 24px 48px rgba(13,27,62,0.2)', width: '100%', maxWidth: 640, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${NAVY}1A`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}><X size={20} /></button>
            </div>
            <form onSubmit={handleFormSubmit} style={{ padding: 24 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  { label: 'Product Name', key: 'name', colSpan: 2, type: 'text', required: true },
                  { label: 'Brand', key: 'brand', type: 'text', required: true },
                  { label: 'Price (LKR)', key: 'price', type: 'number', required: true },
                  { label: 'Stock Quantity', key: 'stock', type: 'number', required: true },
                  { label: 'SKU (Barcode)', key: 'sku', type: 'text' },
                  { label: 'Short Specs', key: 'spec', type: 'text' },
                ].map(({ label, key, type, required, colSpan }) => (
                  <div key={key} style={{ gridColumn: colSpan === 2 ? '1 / -1' : undefined }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</label>
                    <input required={required} type={type} value={(formData as any)[key]}
                      onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                      style={{ width: '100%', border: `1px solid ${NAVY}1F`, borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', border: `1px solid ${NAVY}1F`, borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none' }}>
                    {['Laptops','Desktops','Monitors','Networking','Printers','Storage','Accessories'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Badge</label>
                  <select value={formData.badge} onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    style={{ width: '100%', border: `1px solid ${NAVY}1F`, borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none' }}>
                    <option value="">None</option>
                    <option value="new">Force New</option>
                    <option value="hot">Force Hot</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Product Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1px dashed ${NAVY}30`, borderRadius: 10, padding: 14, background: BG }}>
                    <label style={{ background: NAVY, color: WHITE, padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <Upload size={13} /> Choose File
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                    <span style={{ fontSize: 12, color: MUTED, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formData.image ? 'Image attached!' : 'No file selected'}
                    </span>
                    {formData.image && <img src={formData.image} alt="Preview" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: `1px solid ${NAVY}1A` }} />}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '9px 18px', fontSize: 13, fontWeight: 500, color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '9px 20px', fontSize: 13, fontWeight: 600, color: WHITE, background: BRAND, borderRadius: 8, border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.6 : 1 }}>
                  {isSubmitting ? 'Saving…' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
