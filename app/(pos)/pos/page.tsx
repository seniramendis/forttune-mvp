"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, ScanBarcode, Trash2, CreditCard, Banknote, LogOut, Plus, Minus,
  CheckCircle, ShoppingCart, Package, Clock, X, Tag, Percent, RefreshCw,
  Grid3X3, List, AlertCircle, Smartphone, Printer, RotateCcw, ZapIcon,
  TrendingUp, BarChart2, Users, Activity, ChevronRight, Star, ArrowUpRight, Menu
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: string; name: string; brand: string; category: string;
  price: number; stock: number; sku?: string; spec?: string; badge?: string; image?: string;
}
interface CartItem extends Product { qty: number; discount: number; }
type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE';
type ViewMode = 'grid' | 'list';
type SidePanel = 'cart' | 'analytics';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => `Rs ${n.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtShort = (n: number) => n >= 1000 ? `Rs ${(n / 1000).toFixed(1)}k` : `Rs ${n.toFixed(0)}`;
const nowTime = () => new Date().toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', hour12: true });
const todayStr = () => new Date().toLocaleDateString('en-LK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const VAT_RATE = 0.18;

export default function PosTerminal() {
  // ─── State ─────────────────────────────────────────────────────────────────
  const [inventory, setInventory] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [barcode, setBarcode] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sidePanel, setSidePanel] = useState<SidePanel>('cart');
  const [cashierName, setCashierName] = useState('Cashier');
  const [currentTime, setCurrentTime] = useState(nowTime());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [lastTotal, setLastTotal] = useState(0);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [cashReceived, setCashReceived] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHoldOrders, setShowHoldOrders] = useState(false);
  const [heldOrders, setHeldOrders] = useState<{ id: string; cart: CartItem[]; note: string; time: string }[]>([]);
  const [orderCount, setOrderCount] = useState(1);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  // Analytics state
  const [todaySales, setTodaySales] = useState<{ total: number; count: number; items: number; topProduct: string }>({ total: 0, count: 0, items: 0, topProduct: '—' });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  // ─── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('forttune_user');
      if (stored) { const u = JSON.parse(stored); setCashierName(u.name || u.email || 'Cashier'); }
    } catch {}
    fetchProducts();
    const timer = setInterval(() => setCurrentTime(nowTime()), 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error();
      setInventory(await res.json());
    } catch { setInventory([]); }
    finally { setIsLoading(false); }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch('/api/orders/all');
      if (!res.ok) throw new Error();
      const orders: any[] = await res.json();
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const posOrders = orders.filter(o => o.isPosOrder);
      const todayOrders = posOrders.filter(o => new Date(o.createdAt) >= todayStart);
      const productCounts: Record<string, { name: string; qty: number }> = {};
      todayOrders.forEach(o => o.items?.forEach((i: any) => {
        if (!productCounts[i.productId]) productCounts[i.productId] = { name: i.product?.name || 'Unknown', qty: 0 };
        productCounts[i.productId].qty += i.quantity;
      }));
      const topProduct = Object.values(productCounts).sort((a, b) => b.qty - a.qty)[0]?.name || '—';
      setTodaySales({
        total: todayOrders.reduce((s, o) => s + o.total, 0),
        count: todayOrders.length,
        items: todayOrders.reduce((s, o) => s + (o.items?.reduce((x: number, i: any) => x + i.quantity, 0) || 0), 0),
        topProduct,
      });
      setRecentOrders(posOrders.slice(0, 8));
    } catch {}
    finally { setAnalyticsLoading(false); }
  };

  useEffect(() => { if (sidePanel === 'analytics') fetchAnalytics(); }, [sidePanel]);

  // ─── Notification ──────────────────────────────────────────────────────────
  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 2600);
  };

  // ─── Cart helpers ──────────────────────────────────────────────────────────
  const addToCart = useCallback((product: Product) => {
    const existing = cart.find(i => i.id === product.id);
    if ((existing?.qty ?? 0) >= product.stock) { notify(`Only ${product.stock} in stock!`, 'error'); return; }
    setCart(prev => existing
      ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      : [...prev, { ...product, qty: 1, discount: 0 }]
    );
  }, [cart]);

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.flatMap(item => {
      if (item.id !== id) return [item];
      const newQty = item.qty + delta;
      if (newQty <= 0) return [];
      const prod = inventory.find(p => p.id === id);
      if (prod && newQty > prod.stock) { notify('Max stock reached!', 'error'); return [item]; }
      return [{ ...item, qty: newQty }];
    }));
  };

  const setItemDiscount = (id: string, pct: number) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, discount: Math.min(100, Math.max(0, pct)) } : i));

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => { setCart([]); setGlobalDiscount(0); setCashReceived(''); setCustomerNote(''); };

  // ─── Barcode ───────────────────────────────────────────────────────────────
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = inventory.find(p => p.sku === barcode.trim());
    if (product) { addToCart(product); setBarcode(''); notify(`Added: ${product.name}`, 'success'); }
    else { setBarcode(''); notify('No product found for this barcode', 'error'); }
  };

  // ─── Hold / Recall ─────────────────────────────────────────────────────────
  const holdOrder = () => {
    if (cart.length === 0) return;
    setHeldOrders(prev => [...prev, { id: `HOLD-${Date.now()}`, cart, note: customerNote || `Order #${orderCount}`, time: nowTime() }]);
    clearCart(); notify('Order held — tap recall to resume', 'info');
  };
  const recallOrder = (id: string) => {
    const order = heldOrders.find(o => o.id === id);
    if (!order) return;
    setCart(order.cart); setCustomerNote(order.note);
    setHeldOrders(prev => prev.filter(o => o.id !== id));
    setShowHoldOrders(false); notify('Order recalled', 'success');
  };

  // ─── Totals ────────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty * (1 - i.discount / 100), 0);
  const discountAmount = subtotal * (globalDiscount / 100);
  const afterDiscount = subtotal - discountAmount;
  const tax = afterDiscount * VAT_RATE;
  const grandTotal = afterDiscount + tax;
  const change = parseFloat(cashReceived || '0') - grandTotal;
  const cartQty = cart.reduce((s, i) => s + i.qty, 0);

  // ─── Categories ────────────────────────────────────────────────────────────
  const categories = ['All', ...Array.from(new Set(inventory.map(p => p.category))).sort()];
  const filteredInventory = inventory.filter(p => {
    const q = search.toLowerCase();
    return (p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
      && (activeCategory === 'All' || p.category === activeCategory);
  });

  // ─── Checkout ──────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true); setShowPaymentModal(false);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cart.map(i => ({ ...i, price: i.price * (1 - i.discount / 100) })), paymentMethod, isPosOrder: true, total: grandTotal })
      });
      const data = await res.json();
      if (res.ok) {
        setLastOrderId(data.order?.id ?? null); setLastTotal(grandTotal);
        setCheckoutSuccess(true); setOrderCount(c => c + 1); clearCart(); fetchProducts();
        setTimeout(() => setCheckoutSuccess(false), 5000);
      } else notify(data.error || 'Checkout failed', 'error');
    } catch { notify('Network error. Please try again.', 'error'); }
    finally { setIsCheckingOut(false); }
  };

  const handleLogout = () => {
    document.cookie = 'admin_session=; Max-Age=0; path=/';
    localStorage.removeItem('forttune_user');
    window.location.href = '/login';
  };

  // Quick cash amounts
  const quickAmounts = Array.from(new Set([
    Math.ceil(grandTotal / 100) * 100,
    Math.ceil(grandTotal / 500) * 500,
    Math.ceil(grandTotal / 1000) * 1000,
  ])).filter(v => v > 0).slice(0, 3);

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-100 font-sans overflow-hidden select-none relative">

      {/* ── TOAST ──────────────────────────────────────────────────────────── */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all
          ${notification.type === 'success' ? 'bg-emerald-500 text-white' : notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-700 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle size={15} /> : notification.type === 'error' ? <AlertCircle size={15} /> : <ZapIcon size={15} />}
          {notification.msg}
        </div>
      )}

      {/* ── SUCCESS OVERLAY ─────────────────────────────────────────────────── */}
      {checkoutSuccess && (
        <div className="fixed inset-0 bg-white/85 backdrop-blur-sm z-40 flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center max-w-sm mx-4 border border-slate-100">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5 border-4 border-emerald-100">
              <CheckCircle size={40} className="text-emerald-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-1">Payment Complete!</h2>
            {lastOrderId && <p className="text-xs text-slate-400 mb-1 font-mono">#{lastOrderId.slice(-8).toUpperCase()}</p>}
            <p className="text-3xl font-black text-orange-500 my-3">{fmt(lastTotal)}</p>
            <p className="text-slate-500 text-sm mb-6">Stock has been updated automatically.</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setCheckoutSuccess(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors">
                Close
              </button>
              <button className="flex-1 py-3 bg-slate-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
                <Printer size={14} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAYMENT MODAL ───────────────────────────────────────────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">Complete Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span className="font-medium text-slate-800">{fmt(subtotal)}</span></div>
                {globalDiscount > 0 && <div className="flex justify-between text-sm text-emerald-600 font-medium"><span>Discount ({globalDiscount}%)</span><span>-{fmt(discountAmount)}</span></div>}
                <div className="flex justify-between text-sm text-slate-600"><span>VAT (18%)</span><span className="font-medium text-slate-800">{fmt(tax)}</span></div>
                <div className="flex justify-between font-extrabold text-slate-800 text-xl pt-2 border-t border-slate-200 mt-1">
                  <span>Total</span><span className="text-orange-600">{fmt(grandTotal)}</span>
                </div>
              </div>
              {/* Method */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['CASH', 'CARD', 'ONLINE'] as PaymentMethod[]).map(m => (
                    <button key={m} onClick={() => setPaymentMethod(m)}
                      className={`py-3.5 rounded-xl flex flex-col items-center gap-1.5 text-xs font-bold border-2 transition-all
                        ${paymentMethod === m ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                      {m === 'CASH' ? <Banknote size={22} /> : m === 'CARD' ? <CreditCard size={22} /> : <Smartphone size={22} />}
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              {/* Cash input */}
              {paymentMethod === 'CASH' && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cash Received</p>
                  <input type="number" placeholder={`Min ${fmt(grandTotal)}`}
                    value={cashReceived} onChange={e => setCashReceived(e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-normal placeholder:text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" autoFocus />
                  {cashReceived && parseFloat(cashReceived) >= grandTotal && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex justify-between text-sm font-bold text-emerald-700">
                      <span>Change due</span><span>{fmt(change)}</span>
                    </div>
                  )}
                  {cashReceived && parseFloat(cashReceived) < grandTotal && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-semibold flex items-center gap-2">
                      <AlertCircle size={13} /> Short by {fmt(grandTotal - parseFloat(cashReceived))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    {quickAmounts.map(amt => (
                      <button key={amt} onClick={() => setCashReceived(String(amt))}
                        className="flex-1 py-2 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-transparent rounded-lg text-xs font-bold text-slate-600 transition-all">
                        Rs {amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Note */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Order Note <span className="font-normal normal-case text-slate-400">(optional)</span></p>
                <input type="text" placeholder="e.g. customer name, table number…"
                  value={customerNote} onChange={e => setCustomerNote(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
              </div>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || (paymentMethod === 'CASH' && cashReceived !== '' && parseFloat(cashReceived) < grandTotal)}
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-xl font-extrabold text-base tracking-wide transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
                {isCheckingOut ? <><RefreshCw size={16} className="animate-spin" /> Processing…</> : `Charge ${fmt(grandTotal)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HELD ORDERS MODAL ───────────────────────────────────────────────── */}
      {showHoldOrders && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">Held Orders</h3>
              <button onClick={() => setShowHoldOrders(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {heldOrders.length === 0
                ? <div className="py-12 text-center text-slate-400 text-sm font-medium">No held orders right now</div>
                : heldOrders.map(o => (
                  <div key={o.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{o.note}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">{o.cart.length} item{o.cart.length !== 1 ? 's' : ''} · held at {o.time}</p>
                    </div>
                    <button onClick={() => recallOrder(o.id)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors">
                      Recall
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          LEFT PANEL — Product Browser
      ═════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-5 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <img src="https://res.cloudinary.com/dukv2otyn/image/upload/v1782676866/Forttune-3.1_sj71vp.webp" alt="Forttune" className="h-7 object-contain" />
            <div>
              <span className="font-bold text-slate-800 text-sm leading-none block">Forttune POS</span>
              <span className="text-[11px] text-slate-500 font-medium">Terminal 01 · {cashierName.split(' ')[0]}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <Clock size={12} className="text-slate-400" />
            <span>{todayStr()}</span>
            <span className="text-slate-300 mx-0.5">·</span>
            <span className="text-slate-800 font-bold">{currentTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={fetchProducts} title="Refresh inventory"
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" aria-label="Refresh">
              <RefreshCw size={15} />
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </header>

        {/* Search + Barcode */}
        <div className="px-4 pt-3 pb-2 bg-white border-b border-slate-100 shrink-0 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
            <input ref={searchRef} type="text"
              placeholder="Search by name, brand or SKU…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14} /></button>}
          </div>
          <form onSubmit={handleBarcodeSubmit} className="relative w-48">
            <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
            <input type="text" placeholder="Scan barcode…"
              value={barcode} onChange={e => setBarcode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
          </form>
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-orange-500' : 'text-slate-500 hover:text-slate-700'}`}><Grid3X3 size={14} /></button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow text-orange-500' : 'text-slate-500 hover:text-slate-700'}`}><List size={14} /></button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex gap-2 overflow-x-auto shrink-0 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all
                ${activeCategory === cat ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid / List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw size={28} className="animate-spin opacity-40" />
              <p className="text-sm font-medium text-slate-500">Loading inventory…</p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Package size={40} className="text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">No products found</p>
              {search && <button onClick={() => setSearch('')} className="text-xs text-orange-500 underline font-medium">Clear search</button>}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredInventory.map(product => {
                const inCart = cart.find(i => i.id === product.id);
                const isOos = product.stock === 0;
                const isLow = !isOos && product.stock <= 5;
                return (
                  <button key={product.id} onClick={() => !isOos && addToCart(product)} disabled={isOos}
                    className={`group relative bg-white rounded-2xl p-3.5 text-left transition-all border-2 shadow-sm active:scale-[0.97]
                      ${isOos ? 'opacity-50 cursor-not-allowed border-slate-100' :
                        inCart ? 'border-orange-400 shadow-md shadow-orange-100' :
                        'border-transparent hover:border-orange-200 hover:shadow-md cursor-pointer'}`}>
                    {inCart && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center font-bold shadow z-10">
                        {inCart.qty}
                      </div>
                    )}
                    {isLow && (
                      <div className="absolute top-2 left-2 text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md font-bold">
                        Low stock
                      </div>
                    )}
                    <div className="w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                      {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <Package size={28} className="text-slate-300" />}
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold truncate uppercase tracking-wide">{product.brand}</p>
                    <p className="text-xs font-bold text-slate-800 leading-snug mt-0.5 line-clamp-2 min-h-[2rem]">{product.name}</p>
                    <div className="flex items-end justify-between mt-2">
                      <p className="text-sm font-extrabold text-orange-600">{fmt(product.price)}</p>
                      <p className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isOos ? 'bg-red-50 text-red-600 border border-red-100' : isLow ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {isOos ? 'Out' : `${product.stock} left`}
                      </p>
                    </div>
                    {product.sku && <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">SKU: {product.sku}</p>}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredInventory.map(product => {
                const inCart = cart.find(i => i.id === product.id);
                const isOos = product.stock === 0;
                return (
                  <button key={product.id} onClick={() => !isOos && addToCart(product)} disabled={isOos}
                    className={`w-full flex items-center gap-4 bg-white rounded-xl px-4 py-3 text-left transition-all border shadow-sm active:scale-[0.99]
                      ${isOos ? 'opacity-50 cursor-not-allowed border-slate-100' :
                        inCart ? 'border-orange-300 shadow-orange-50' : 'border-transparent hover:border-orange-200 cursor-pointer'}`}>
                    <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                      {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : <Package size={18} className="text-slate-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{product.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{product.brand}{product.sku ? ` · SKU: ${product.sku}` : ''}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-orange-600">{fmt(product.price)}</p>
                      <p className={`text-[11px] font-semibold ${isOos ? 'text-red-500' : 'text-slate-500'}`}>{isOos ? 'Out of stock' : `${product.stock} left`}</p>
                    </div>
                    {inCart && <div className="w-6 h-6 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center font-bold shrink-0">{inCart.qty}</div>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="h-8 bg-white border-t border-slate-100 px-5 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">{filteredInventory.length} of {inventory.length} products shown</span>
          <span className="text-[11px] text-slate-500 font-medium">Order #{String(orderCount).padStart(4, '0')} · Terminal 01</span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          RIGHT PANEL — Cart / Analytics
      ═════════════════════════════════════════════════════════════════════ */}
      {/* Mobile cart overlay backdrop */}
      {mobileCartOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setMobileCartOpen(false)} />
      )}
      <div className={`${mobileCartOpen ? "fixed right-0 top-0 bottom-0 z-40 flex w-[340px] max-w-[90vw]" : "hidden"} md:relative md:flex md:w-[390px] bg-white flex-col md:h-full shrink-0 border-l border-slate-200 shadow-xl`}>

        {/* Mobile close button */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
          <span className="text-sm font-bold text-slate-700">Order / Analytics</span>
          <button onClick={() => setMobileCartOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><X size={18} /></button>
        </div>
        {/* Tab bar */}
        <div className="flex border-b border-slate-100 shrink-0">
          {(['cart', 'analytics'] as SidePanel[]).map(tab => (
            <button key={tab} onClick={() => setSidePanel(tab)}
              className={`flex-1 py-3.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-b-2 -mb-px
                ${sidePanel === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {tab === 'cart' ? <><ShoppingCart size={13} /> Order {cartQty > 0 && <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{cartQty}</span>}</> : <><BarChart2 size={13} /> Today's Sales</>}
            </button>
          ))}
        </div>

        {/* ── CART TAB ──────────────────────────────────────────────────────── */}
        {sidePanel === 'cart' && (
          <>
            {/* Cart header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Current Order</span>
              <div className="flex items-center gap-1">
                {heldOrders.length > 0 && (
                  <button onClick={() => setShowHoldOrders(true)}
                    className="relative p-1.5 hover:bg-amber-50 rounded-lg text-slate-500 hover:text-amber-600 transition-colors">
                    <Clock size={14} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{heldOrders.length}</span>
                  </button>
                )}
                {cart.length > 0 && (
                  <button onClick={clearCart} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-300 py-16">
                  <ShoppingCart size={48} strokeWidth={1} />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-500">Cart is empty</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Tap a product or scan a barcode to start</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {cart.map(item => (
                    <div key={item.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-tight">{item.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{item.brand} · {fmt(item.price)} each</p>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="p-1 hover:text-red-500 text-slate-400 transition-colors shrink-0">
                          <X size={13} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2.5 gap-2">
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                          <button onClick={() => updateQty(item.id, -1)} className="px-2.5 py-1.5 hover:bg-slate-100 text-slate-600 transition-colors"><Minus size={12} /></button>
                          <span className="w-8 text-center text-xs font-extrabold text-slate-800">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="px-2.5 py-1.5 hover:bg-slate-100 text-slate-600 transition-colors"><Plus size={12} /></button>
                        </div>
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5">
                          <Percent size={10} className="text-slate-500" />
                          <input type="number" min={0} max={100} placeholder="0"
                            value={item.discount || ''}
                            onChange={e => setItemDiscount(item.id, parseFloat(e.target.value) || 0)}
                            className="w-10 text-center text-xs font-bold text-slate-700 focus:outline-none bg-transparent placeholder:text-slate-400" />
                          <span className="text-[10px] text-slate-500 font-semibold">disc</span>
                        </div>
                        <span className="text-sm font-extrabold text-slate-800 ml-auto">
                          {fmt(item.price * item.qty * (1 - item.discount / 100))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals & Checkout */}
            <div className="border-t border-slate-100 p-4 shrink-0 space-y-3">
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                <Tag size={13} className="text-slate-500 shrink-0" />
                <span className="text-xs text-slate-600 font-semibold flex-1">Order Discount</span>
                <div className="flex items-center gap-1">
                  <input type="number" min={0} max={100} placeholder="0"
                    value={globalDiscount || ''}
                    onChange={e => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                    className="w-12 text-center text-xs font-bold text-slate-700 border border-slate-200 rounded-lg py-1.5 focus:outline-none focus:border-orange-400 bg-white placeholder:text-slate-400" />
                  <span className="text-xs text-slate-600 font-bold">%</span>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600"><span className="font-medium">Subtotal ({cartQty} item{cartQty !== 1 ? 's' : ''})</span><span className="font-semibold text-slate-800">{fmt(subtotal)}</span></div>
                {globalDiscount > 0 && <div className="flex justify-between text-emerald-600 font-semibold"><span>Discount ({globalDiscount}%)</span><span>-{fmt(discountAmount)}</span></div>}
                <div className="flex justify-between text-slate-600"><span className="font-medium">VAT (18%)</span><span className="font-semibold text-slate-800">{fmt(tax)}</span></div>
              </div>

              <div className="flex justify-between items-center py-3 border-t border-slate-100">
                <span className="font-extrabold text-slate-800 text-base">Total</span>
                <span className="font-black text-orange-600 text-2xl">{fmt(grandTotal)}</span>
              </div>

              <button onClick={() => cart.length > 0 && setShowPaymentModal(true)}
                disabled={cart.length === 0 || isCheckingOut}
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-xl font-extrabold text-sm tracking-wide transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
                {isCheckingOut ? <><RefreshCw size={16} className="animate-spin" /> Processing…</> : <><CreditCard size={16} /> Charge {fmt(grandTotal)}</>}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={holdOrder} disabled={cart.length === 0}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                  <Clock size={12} /> Hold Order
                </button>
                <button onClick={clearCart} disabled={cart.length === 0}
                  className="py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                  <RotateCcw size={12} /> New Order
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── ANALYTICS TAB ─────────────────────────────────────────────────── */}
        {sidePanel === 'analytics' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {analyticsLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <RefreshCw size={24} className="animate-spin" />
              </div>
            ) : (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Today's Revenue", value: fmtShort(todaySales.total), icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                    { label: 'Orders Today', value: String(todaySales.count), icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                    { label: 'Items Sold', value: String(todaySales.items), icon: Package, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
                    { label: 'Avg Order', value: todaySales.count > 0 ? fmtShort(todaySales.total / todaySales.count) : 'Rs 0', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                  ].map(s => (
                    <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4`}>
                      <div className={`w-8 h-8 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center mb-3`}>
                        <s.icon size={16} className={s.color} />
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold leading-tight">{s.label}</p>
                      <p className={`text-xl font-black ${s.color} mt-1`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Top product */}
                {todaySales.topProduct !== '—' && (
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Star size={13} className="text-orange-200" />
                      <span className="text-xs font-bold text-orange-100 uppercase tracking-widest">Best Seller Today</span>
                    </div>
                    <p className="text-base font-extrabold leading-snug">{todaySales.topProduct}</p>
                  </div>
                )}

                {/* Low stock alerts */}
                {inventory.filter(p => p.stock > 0 && p.stock <= 5).length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <AlertCircle size={11} className="text-amber-500" /> Low Stock Alerts
                    </p>
                    <div className="space-y-2">
                      {inventory.filter(p => p.stock > 0 && p.stock <= 5).slice(0, 4).map(p => (
                        <div key={p.id} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-2.5">
                          <div>
                            <p className="text-xs font-bold text-slate-800 leading-tight">{p.name}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{p.brand}</p>
                          </div>
                          <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
                            {p.stock} left
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent POS orders */}
                {recentOrders.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Recent Orders</p>
                    <div className="space-y-2">
                      {recentOrders.map(o => (
                        <div key={o.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
                          <div>
                            <p className="text-xs font-bold text-slate-800 font-mono">#{o.id.slice(-6).toUpperCase()}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{o.paymentMethod} · {new Date(o.createdAt).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                          </div>
                          <span className="text-sm font-extrabold text-slate-800">{fmt(o.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recentOrders.length === 0 && todaySales.count === 0 && (
                  <div className="py-12 text-center text-slate-400">
                    <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-semibold text-slate-500">No sales recorded yet today</p>
                    <p className="text-xs text-slate-400 mt-1">Complete a transaction to see analytics</p>
                  </div>
                )}

                <button onClick={fetchAnalytics} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                  <RefreshCw size={12} /> Refresh Analytics
                </button>
              </>
            )}
          </div>
        )}

      </div>
      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 flex items-center justify-between px-4 py-2.5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-600">
            <ShoppingCart size={16} />
            <span className="text-sm font-bold text-slate-800">{cartQty > 0 ? `${cartQty} item${cartQty !== 1 ? 's' : ''}` : 'Empty cart'}</span>
          </div>
          {grandTotal > 0 && <span className="text-sm font-extrabold text-orange-600">{fmt(grandTotal)}</span>}
        </div>
        <button
          onClick={() => setMobileCartOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <ShoppingCart size={15} /> View Cart
          {cartQty > 0 && <span className="bg-white text-orange-600 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">{cartQty}</span>}
        </button>
      </div>
      {/* Mobile bottom padding */}
      <div className="md:hidden h-16" />
    </div>
  );
}
