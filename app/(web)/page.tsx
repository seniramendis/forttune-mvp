"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Truck, Award, HeadphonesIcon, ShieldCheck, Store, Heart,
  Laptop, Monitor, Wifi, Printer, Server, Database, Mouse, 
  Search, MapPin, Phone, MessageCircle, Mail, Clock, Package, X, ChevronLeft, Minus, Plus, Trash2, CheckCircle,
  User, LogOut, ChevronDown
} from 'lucide-react';

const CATEGORIES = ['All', 'Laptops', 'Desktops', 'Monitors', 'Networking', 'Printers', 'Servers', 'Storage', 'Accessories'];

const getCatIcon = (cat: string, className: string = "") => {
  switch (cat) {
    case 'Laptops': return <Laptop className={className} strokeWidth={1.5} />;
    case 'Desktops': return <Monitor className={className} strokeWidth={1.5} />;
    case 'Monitors': return <Monitor className={className} strokeWidth={1.5} />;
    case 'Networking': return <Wifi className={className} strokeWidth={1.5} />;
    case 'Printers': return <Printer className={className} strokeWidth={1.5} />;
    case 'Servers': return <Server className={className} strokeWidth={1.5} />;
    case 'Storage': return <Database className={className} strokeWidth={1.5} />;
    case 'Accessories': return <Mouse className={className} strokeWidth={1.5} />;
    default: return <Package className={className} strokeWidth={1.5} />;
  }
};

const formatLKR = (num: number) => `Rs ${num.toLocaleString('en-LK')}`;

export default function ForttuneApp() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [pdpQty, setPdpQty] = useState(1);

  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('forttune_user');
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('forttune_user');
    localStorage.removeItem('forttune_session');
    setCurrentUser(null);
    setUserMenuOpen(false);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setInventory(data);
      } catch (err) {
        console.error("Failed to load inventory", err);
        setInventory([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const eventSource = new EventSource('/api/products/stream');
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'RELOAD') {
          fetch('/api/products')
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setInventory(data); })
            .catch(() => {});
        }
      } catch (err) {
        console.error("Stream parse error:", err);
      }
    };
    return () => { eventSource.close(); };
  }, []);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 2600);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('forttune_wishlist') || '[]');
      setWishlisted(new Set(stored.map((x: any) => x.id)));
    } catch {}
  }, []);

  const toggleWishlist = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const stored: any[] = (() => { try { return JSON.parse(localStorage.getItem('forttune_wishlist') || '[]'); } catch { return []; } })();
    const exists = stored.some((x: any) => x.id === product.id);
    const updated = exists ? stored.filter((x: any) => x.id !== product.id) : [...stored, product];
    localStorage.setItem('forttune_wishlist', JSON.stringify(updated));
    setWishlisted(new Set(updated.map((x: any) => x.id)));
    showToast(exists ? `Removed from saved items` : `${product.name} saved`);
  };

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSending, setContactSending] = useState(false);

  const handleContactSubmit = async () => {
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      showToast('Please fill in all fields.');
      return;
    }
    setContactSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        setContactForm({ name: '', email: '', message: '' });
        showToast("Message sent. We'll respond within 24 hours.");
      } else {
        const data = await res.json();
        showToast(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      showToast('Could not send message. Please check your connection.');
    } finally {
      setContactSending(false);
    }
  };

  const showToast = (msg: string) => setToastMsg(msg);

  const addToCart = (product: any, quantity: number = 1) => {
    setCart(prev => {
      const ex = prev.find(x => x.id === product.id);
      if (ex) return prev.map(x => x.id === product.id ? { ...x, qty: x.qty + quantity } : x);
      return [...prev, { ...product, qty: quantity }];
    });
    showToast(`${product.name} added to cart`);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(x => x.id !== id));
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCat(cat);
    setPage('products');
    window.scrollTo(0, 0);
  };

  const openProductDetail = (product: any) => {
    setSelectedProduct(product);
    setPdpQty(1);
    setPage('product-detail');
    window.scrollTo(0, 0);
  };

  const filteredProducts = inventory.filter(p => {
    if (!p || p.badge === 'archived_hidden') return false; 
    const catOk = activeCat === 'All' || p.category === activeCat;
    const sOk = !search || p.name.toLowerCase().includes(search.toLowerCase()) || 
                (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) || 
                (p.spec && p.spec.toLowerCase().includes(search.toLowerCase()));
    return catOk && sOk;
  });

  const cartTotal = cart.reduce((s, x) => s + (x.price * x.qty), 0);
  const cartCount = cart.reduce((s, x) => s + x.qty, 0);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment' | 'success'>('cart');
  const [webPaymentMethod, setWebPaymentMethod] = useState<'CARD' | 'ONLINE'>('CARD');

  const handleWebCheckout = async () => {
    if (!currentUser?.id) {
      showToast('Please sign in to place an order.');
      setIsCartOpen(false);
      window.location.href = '/login';
      return;
    }
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          userId: currentUser.id,
          paymentMethod: webPaymentMethod,
          isPosOrder: false,
          total: cartTotal,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Checkout failed');
      }
      setCart([]);
      setCheckoutStep('success');
      fetch('/api/products').then(r => r.json()).then(data => { if (Array.isArray(data)) setInventory(data); });
      setTimeout(() => { setCheckoutStep('cart'); setIsCartOpen(false); }, 3200);
    } catch (err: any) {
      showToast(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const ProductCard = ({ p }: { p: any }) => {
    const isRecentlyAdded = p.createdAt ? (new Date().getTime() - new Date(p.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000 : false;
    const showNewBadge = p.stock > 0 && (p.badge === 'new' || isRecentlyAdded);

    return (
      <div
        onClick={() => openProductDetail(p)}
        className="bg-white border border-[#0D1B3E]/8 rounded-xl overflow-hidden cursor-pointer hover:border-[#E85D26] hover:shadow-[0_8px_28px_rgba(232,93,38,0.13)] transition-all duration-200 flex flex-col h-full group"
      >
        {/* IMAGE AREA */}
        <div className="relative bg-[#F5F6FA] h-[160px] w-full overflow-hidden shrink-0 flex items-center justify-center">
          {p.image ? (
            <img
              src={p.image}
              alt={p.name}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] mix-blend-multiply"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          ) : (
            <div className="transition-transform duration-500 ease-out group-hover:scale-[1.06]">
              {getCatIcon(p.category, "w-14 h-14 text-[#1A2F5E]/15")}
            </div>
          )}

          {/* BADGES */}
          {p.stock > 0 && p.badge === 'hot' && (
            <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-[3px] rounded-[5px] text-white bg-[#E85D26] uppercase tracking-wide">Trending</span>
          )}
          {showNewBadge && p.badge !== 'hot' && (
            <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-[3px] rounded-[5px] text-white bg-[#1D9E75] uppercase tracking-wide">New</span>
          )}
          {p.stock === 0 && (
            <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-[3px] rounded-[5px] text-white bg-black/50 uppercase tracking-wide">Out of Stock</span>
          )}

          {/* HOVER OVERLAY — slides up from bottom */}
          {p.stock > 0 && (
            <div className="absolute bottom-0 left-0 right-0 flex gap-2 px-3 pb-3 pt-8 bg-gradient-to-t from-[#0D1B3E]/75 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
              <button
                onClick={(e) => { e.stopPropagation(); addToCart(p, 1); }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#E85D26] hover:bg-[#f47a4a] text-white text-[11px] font-semibold py-2 rounded-lg transition-colors"
              >
                <ShoppingCart size={13} /> Add to cart
              </button>
              <button
                onClick={(e) => toggleWishlist(p, e)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${wishlisted.has(p.id) ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white/15 border-white/30 text-white hover:bg-white/28'}`}
              >
                <Heart size={13} fill={wishlisted.has(p.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="p-3 flex flex-col flex-1">
          <div className="text-[9px] font-bold text-[#E85D26] uppercase tracking-[0.6px] mb-[3px]">{p.brand}</div>
          <div className="text-[12px] font-semibold text-[#0D1B3E] leading-[1.35] mb-[3px] line-clamp-2">{p.name}</div>
          <div className="text-[10px] text-[#6B7A99] mb-3 leading-[1.4] flex-1 truncate">{p.spec}</div>
          <div className="flex items-end justify-between mt-auto">
            <div>
              <div className="text-[13px] font-bold text-[#0D1B3E]">{formatLKR(p.price)}</div>
              <div className="text-[9px] text-[#6B7A99]">VAT incl.</div>
            </div>
            <div className={`w-[6px] h-[6px] rounded-full mb-1 ${p.stock > 0 ? 'bg-[#1D9E75]' : 'bg-red-400'}`} title={p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#F5F6FA] font-sans text-[14px] text-[#0D1B3E] min-h-screen relative">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b border-[#0D1B3E]/8 h-[60px] flex items-center justify-between px-5 md:px-10 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center cursor-pointer gap-3" onClick={() => setPage('home')}>
          <img
            src="https://res.cloudinary.com/dukv2otyn/image/upload/v1781957501/874b574032c781f9eb100c851006a78d_crop1681211041_sxrilv.png"
            alt="Forttune Channels"
            className="h-8 object-contain"
          />
        </div>

        <div className="hidden sm:flex gap-7">
          {['home', 'products', 'contact'].map(p => (
            <button key={p} onClick={() => { setPage(p); window.scrollTo(0,0); }} className={`text-[13px] font-semibold capitalize transition-colors ${page === p || (page === 'product-detail' && p === 'products') ? 'text-[#E85D26]' : 'text-[#6B7A99] hover:text-[#0D1B3E]'}`}>
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#0D1B3E]/12 hover:bg-[#F5F6FA] transition-colors text-[13px] font-medium text-[#0D1B3E]"
              >
                <div className="w-6 h-6 rounded-full bg-[#E85D26] text-white flex items-center justify-center text-[11px] font-bold">
                  {(currentUser.name || currentUser.email || '?').charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block max-w-[120px] truncate">{currentUser.name || currentUser.email}</span>
                <ChevronDown size={13} className="text-[#6B7A99]" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#0D1B3E]/10 py-1 z-50">
                  <div className="px-4 py-2.5 border-b border-[#0D1B3E]/8">
                    <p className="text-xs font-semibold text-[#0D1B3E] truncate">{currentUser.name || 'Customer'}</p>
                    <p className="text-xs text-[#6B7A99] truncate mt-0.5">{currentUser.email}</p>
                  </div>
                  <a href={currentUser.role === 'ADMIN' ? '/admin' : '/dashboard'} className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-[#0D1B3E] hover:bg-gray-50 transition-colors">
                    <User size={14} /> My Dashboard
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors border-t border-[#0D1B3E]/5"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a href="/login" className="px-3 py-1.5 text-[13px] font-semibold text-[#0D1B3E] hover:text-[#E85D26] transition-colors hidden sm:block">
                Sign In
              </a>
              <a href="/register" className="px-3 py-1.5 rounded-lg bg-[#E85D26] text-white text-[13px] font-semibold hover:bg-[#F47A4A] transition-colors hidden sm:block">
                Register
              </a>
            </div>
          )}

          <button onClick={() => setIsCartOpen(true)} className="bg-[#0D1B3E] hover:bg-[#1A2F5E] transition-colors text-white px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer flex items-center gap-2">
            <ShoppingCart size={15} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="bg-[#E85D26] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
            )}
          </button>
        </div>
      </nav>

      {/* MOBILE NAV */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#0D1B3E]/8 flex justify-around py-2 px-4 z-30 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        {['home', 'products', 'contact'].map(p => (
          <button key={p} onClick={() => { setPage(p); window.scrollTo(0,0); }} className={`text-[10px] font-semibold capitalize flex flex-col items-center gap-1 py-1 ${page === p || (page === 'product-detail' && p === 'products') ? 'text-[#E85D26]' : 'text-[#6B7A99]'}`}>
            {p === 'home' ? <Store size={18}/> : p === 'products' ? <Package size={18}/> : <Phone size={18}/>}
            {p}
          </button>
        ))}
        {currentUser ? (
          <button onClick={handleLogout} className="text-[10px] font-semibold flex flex-col items-center gap-1 py-1 text-red-400">
            <LogOut size={18} /> Sign Out
          </button>
        ) : (
          <a href="/login" className="text-[10px] font-semibold flex flex-col items-center gap-1 py-1 text-[#6B7A99]">
            <User size={18} /> Sign In
          </a>
        )}
      </div>

      <div className="pb-20 sm:pb-10">
        
        {/* PRODUCT DETAIL PAGE */}
        {page === 'product-detail' && selectedProduct && (
          <div className="max-w-5xl mx-auto px-5 pt-8">
            <button 
              onClick={() => setPage('products')} 
              className="text-[#6B7A99] hover:text-[#E85D26] flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors"
            >
              <ChevronLeft size={16} /> Back to Products
            </button>

            <div className="bg-white rounded-2xl border border-[#0D1B3E]/8 shadow-sm overflow-hidden flex flex-col md:flex-row">
              
              <div className="w-full md:w-1/2 bg-[#F5F6FA] p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#0D1B3E]/8 relative min-h-[280px]">
                {selectedProduct.image ? (
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="max-h-[220px] w-full object-contain mix-blend-multiply"
                  />
                ) : (
                  getCatIcon(selectedProduct.category, "w-32 h-32 text-[#1A2F5E]/10")
                )}
                <div className="absolute top-5 left-5 flex gap-2">
                  {selectedProduct.stock > 0 && selectedProduct.badge === 'hot' && (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md text-white bg-[#E85D26]">Trending</span>
                  )}
                  {selectedProduct.stock > 0 && (selectedProduct.badge === 'new' || (selectedProduct.createdAt && (new Date().getTime() - new Date(selectedProduct.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000)) && selectedProduct.badge !== 'hot' && (
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md text-white bg-[#1D9E75]">New Arrival</span>
                  )}
                </div>
              </div>

              <div className="w-full md:w-1/2 p-8 lg:p-10 flex flex-col">
                <div className="text-[11px] font-bold text-[#E85D26] uppercase tracking-wider mb-2">{selectedProduct.brand}</div>
                <h1 className="text-2xl lg:text-[28px] font-bold text-[#0D1B3E] leading-tight mb-4">{selectedProduct.name}</h1>
                
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#0D1B3E]/8">
                  <div className="text-3xl font-bold text-[#0D1B3E]">{formatLKR(selectedProduct.price)}</div>
                  <div className="text-xs text-[#6B7A99] bg-slate-100 px-3 py-1.5 rounded-lg">VAT Included</div>
                </div>

                <div className="space-y-3.5 mb-8 flex-1">
                  {[
                    ['Category', selectedProduct.category],
                    ['SKU', selectedProduct.sku || 'N/A'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-[#6B7A99] text-sm">{label}</span>
                      <span className="font-medium text-[#0D1B3E] text-sm">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span className="text-[#6B7A99] text-sm">Availability</span>
                    <span className={`font-semibold text-sm ${selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of Stock'}
                    </span>
                  </div>
                  {selectedProduct.spec && (
                    <div className="mt-4 pt-4 border-t border-[#0D1B3E]/8">
                      <span className="block text-[#6B7A99] text-sm mb-1.5">Key Specifications</span>
                      <p className="font-medium text-[#0D1B3E] text-sm leading-relaxed">{selectedProduct.spec}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-3 h-[48px]">
                    <div className="flex items-center justify-between border border-[#0D1B3E]/15 rounded-xl px-4 w-[120px] bg-white">
                      <button onClick={() => setPdpQty(Math.max(1, pdpQty - 1))} className="text-[#6B7A99] hover:text-[#E85D26]"><Minus size={16} /></button>
                      <span className="font-bold text-[15px]">{pdpQty}</span>
                      <button onClick={() => setPdpQty(Math.min(selectedProduct.stock, pdpQty + 1))} className="text-[#6B7A99] hover:text-[#E85D26]"><Plus size={16} /></button>
                    </div>
                    <button 
                      disabled={selectedProduct.stock === 0}
                      onClick={() => addToCart(selectedProduct, pdpQty)} 
                      className="flex-1 bg-[#E85D26] disabled:opacity-50 text-white rounded-xl font-semibold text-sm hover:bg-[#F47A4A] transition-colors shadow-md shadow-[#E85D26]/20 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={16} /> {selectedProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                  
                  <a 
                    href={`https://wa.me/94725516516?text=Hi, I'm interested in the ${selectedProduct.name} (SKU: ${selectedProduct.sku}). Please advise on availability and pricing.`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 border border-[#0D1B3E]/15 text-[#0D1B3E] font-medium text-sm h-[48px] rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <MessageCircle size={16} className="text-green-500" />
                    Inquire via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE: HOME */}
        {page === 'home' && (
          <div>
            {/* HERO */}
            <div className="bg-white border-b border-[#0D1B3E]/8 pt-12 pb-12 px-5 md:pt-20 md:pb-16 md:px-10 relative overflow-hidden">
              {/* Background accent */}
              <div className="absolute right-0 top-0 w-[480px] h-full bg-gradient-to-l from-[#F5F6FA] to-transparent pointer-events-none hidden md:block" />
              <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full border-[40px] border-[#E85D26]/6 pointer-events-none hidden md:block" />
              
              <div className="max-w-7xl mx-auto relative z-10">
                <div className="max-w-[560px]">
                  <div className="inline-block bg-[#0D1B3E] text-white text-[10px] font-bold tracking-[1.2px] uppercase px-3 py-1.5 rounded-full mb-5">
                    Sri Lanka's IT Hardware Distributor
                  </div>
                  <h1 className="text-[#0D1B3E] text-[34px] md:text-[52px] font-extrabold leading-[1.15] mb-5">
                    Premium tech,<br/>
                    delivered to your <span className="text-[#E85D26]">door.</span>
                  </h1>
                  <p className="text-[#6B7A99] text-[15px] max-w-[420px] leading-[1.7] mb-8">
                    Laptops, servers, networking and peripherals from 15+ global brands. Trusted by 500+ channel partners across the island.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <button onClick={() => setPage('products')} className="bg-[#0D1B3E] text-white px-6 py-3.5 rounded-xl text-[14px] font-semibold hover:bg-[#1A2F5E] transition-colors shadow-lg">
                      Browse Inventory
                    </button>
                    <button onClick={() => setPage('contact')} className="bg-white text-[#0D1B3E] border border-[#0D1B3E]/15 px-6 py-3.5 rounded-xl text-[14px] font-semibold hover:border-[#E85D26] hover:text-[#E85D26] transition-colors">
                      Request a Quote
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* TRUST BAR */}
            <div className="bg-white border-b border-[#0D1B3E]/8">
              <div className="max-w-7xl mx-auto px-5 md:px-10 py-4 flex gap-6 md:gap-10 overflow-x-auto">
                {[
                  [Truck, 'Island-wide delivery'],
                  [Award, 'Official warranty'],
                  [HeadphonesIcon, 'B2B support'],
                  [Store, 'Mt. Lavinia pickup'],
                ].map(([Icon, label]: any) => (
                  <div key={label} className="flex items-center gap-2.5 whitespace-nowrap">
                    <Icon size={16} className="text-[#E85D26] shrink-0" />
                    <span className="text-[12px] text-[#0D1B3E] font-semibold">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CATEGORIES + LATEST */}
            <div className="max-w-7xl mx-auto px-5 md:px-10 py-10">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-[#0D1B3E]">Shop by Category</h2>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <div key={cat} onClick={() => handleCategoryClick(cat)} className="bg-white border border-[#0D1B3E]/8 rounded-xl py-4 px-2 text-center cursor-pointer hover:border-[#E85D26] hover:shadow-md transition-all flex flex-col items-center gap-2">
                      {getCatIcon(cat, "text-[#1A2F5E]/50 w-5 h-5")}
                      <span className="text-[10px] font-bold text-[#0D1B3E] leading-tight">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-[#0D1B3E]">Latest Arrivals</h2>
                  <button onClick={() => setPage('products')} className="text-sm font-semibold text-[#E85D26] hover:underline">
                    View all →
                  </button>
                </div>
                
                {isLoading ? (
                  <div className="py-16 text-center text-[#6B7A99] text-sm">Loading inventory…</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {inventory.filter(p => p && p.badge !== 'archived_hidden').slice(0, 6).map(p => <ProductCard key={p.id} p={p} />)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PAGE: PRODUCTS */}
        {page === 'products' && (
          <div className="max-w-7xl mx-auto px-5 md:px-10 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-7">
              <h1 className="text-2xl font-bold text-[#0D1B3E]">Our Inventory</h1>
              <div className="flex items-center gap-2 bg-white border border-[#0D1B3E]/10 rounded-xl py-2.5 px-4 w-full md:w-[300px] shadow-sm">
                <Search size={16} className="text-[#6B7A99] shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search by name, brand or spec…" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-none outline-none text-sm bg-transparent w-full text-[#0D1B3E] placeholder:text-[#6B7A99]"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap mb-7">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCat(cat)}
                  className={`text-[12px] font-semibold px-4 py-2 rounded-full cursor-pointer transition-colors border ${activeCat === cat ? 'bg-[#0D1B3E] text-white border-[#0D1B3E]' : 'bg-white text-[#6B7A99] border-[#0D1B3E]/10 hover:border-[#E85D26] hover:text-[#E85D26]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {isLoading ? (
              <div className="py-16 text-center text-[#6B7A99] text-sm">Loading catalog…</div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredProducts.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#0D1B3E]/8">
                <Package size={28} className="mx-auto text-[#6B7A99]/40 mb-3" />
                <div className="text-[#0D1B3E] font-semibold">No products found</div>
                <div className="text-[#6B7A99] text-sm mt-1">Try a different search term or category.</div>
              </div>
            )}
          </div>
        )}

        {/* PAGE: CONTACT */}
        {page === 'contact' && (
          <div className="max-w-7xl mx-auto px-5 md:px-10 py-10">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-[#0D1B3E] mb-3">Partner with Forttune</h1>
              <p className="text-[#6B7A99] max-w-xl mx-auto text-sm leading-relaxed">
                Whether you're placing a bulk order or need support for a recent purchase, our team in Mount Lavinia is ready to assist.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-white border border-[#0D1B3E]/8 rounded-2xl p-8 shadow-sm">
                <h3 className="text-base font-bold text-[#0D1B3E] mb-6">Headquarters</h3>
                
                <div className="space-y-5">
                  {[
                    [MapPin, 'Address', 'No. 312, Galle Road,\nMount Lavinia, Sri Lanka'],
                    [Phone, 'General Line', '+94 112 638 538'],
                    [MessageCircle, 'WhatsApp Sales', '+94 725 516 516'],
                  ].map(([Icon, label, value]: any) => (
                    <div key={label} className="flex gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-[#E85D26]/8 flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-[#E85D26]" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-[#6B7A99] uppercase tracking-wider mb-0.5">{label}</div>
                        <div className="text-sm font-medium text-[#0D1B3E] whitespace-pre-line leading-relaxed">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#0D1B3E]/8 rounded-2xl p-8 shadow-sm">
                <h3 className="text-base font-bold text-[#0D1B3E] mb-6">Send an Inquiry</h3>
                <div className="space-y-4">
                  {[
                    { key: 'name', label: 'Full name', type: 'text' },
                    { key: 'email', label: 'Email address', type: 'email' },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="text-[10px] font-bold text-[#6B7A99] block mb-1.5 uppercase tracking-wider">{label}</label>
                      <input
                        type={type}
                        value={(contactForm as any)[key]}
                        onChange={e => setContactForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full bg-[#F5F6FA] border border-[#0D1B3E]/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E85D26] transition-colors"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] font-bold text-[#6B7A99] block mb-1.5 uppercase tracking-wider">Message</label>
                    <textarea
                      value={contactForm.message}
                      onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full bg-[#F5F6FA] border border-[#0D1B3E]/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E85D26] transition-colors h-24 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleContactSubmit}
                    disabled={contactSending}
                    className="w-full bg-[#0D1B3E] disabled:opacity-60 text-white font-semibold py-3 rounded-xl hover:bg-[#1A2F5E] transition-colors text-sm"
                  >
                    {contactSending ? 'Sending…' : 'Send Inquiry'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-[#0D1B3E]/40 backdrop-blur-sm z-50 flex justify-end" onClick={(e) => { if(e.target === e.currentTarget) setIsCartOpen(false) }}>
          <div className="w-full sm:w-[380px] bg-white h-full flex flex-col shadow-2xl">
            <div className="p-5 border-b border-[#0D1B3E]/8 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0D1B3E] flex items-center gap-2">
                <ShoppingCart size={18}/> Your Cart
                {cartCount > 0 && <span className="bg-[#E85D26] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
              </h3>
              <button onClick={() => setIsCartOpen(false)} className="text-[#6B7A99] hover:text-[#0D1B3E] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <ShoppingCart size={22} className="text-[#6B7A99]/40" />
                  </div>
                  <h4 className="text-[#0D1B3E] font-bold mb-1">Your cart is empty</h4>
                  <p className="text-[#6B7A99] text-sm">Browse inventory to add products.</p>
                  <button onClick={() => { setIsCartOpen(false); setPage('products'); }} className="mt-5 text-[#E85D26] font-semibold text-sm hover:underline">
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((x, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-white border border-[#0D1B3E]/8 rounded-xl relative">
                      <div className="bg-[#F5F6FA] rounded-xl w-14 h-14 flex items-center justify-center shrink-0">
                        {getCatIcon(x.category, "w-5 h-5 text-[#1A2F5E]/40")}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="text-sm font-semibold text-[#0D1B3E] mb-1 truncate pr-5">{x.name}</div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-bold text-[#E85D26]">{formatLKR(x.price * x.qty)}</div>
                          <div className="text-xs font-semibold text-[#6B7A99] bg-slate-100 px-2 py-0.5 rounded-md">Qty: {x.qty}</div>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(x.id)} className="absolute top-3 right-3 text-[#6B7A99] hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-5 border-t border-[#0D1B3E]/8 bg-white">
                <div className="flex justify-between items-end mb-5">
                  <span className="text-xs font-bold text-[#6B7A99] uppercase tracking-wider">Estimated Total</span>
                  <span className="text-2xl font-extrabold text-[#0D1B3E]">{formatLKR(cartTotal)}</span>
                </div>
                {checkoutStep === 'success' ? (
                  <div className="w-full bg-green-50 border border-green-200 text-green-700 font-semibold py-4 rounded-xl flex items-center justify-center gap-2 text-sm">
                    <CheckCircle size={18} className="text-green-500" /> Order placed successfully
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {(['CARD', 'ONLINE'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => setWebPaymentMethod(m)}
                          className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${webPaymentMethod === m ? 'bg-[#0D1B3E] text-white border-[#0D1B3E]' : 'bg-white text-[#6B7A99] border-[#0D1B3E]/15 hover:border-[#0D1B3E]'}`}
                        >
                          {m === 'CARD' ? 'Card' : 'Bank Transfer'}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleWebCheckout}
                      disabled={isCheckingOut}
                      className="w-full bg-[#0D1B3E] text-white font-bold py-3.5 rounded-xl hover:bg-[#1A2F5E] transition-colors flex justify-center items-center gap-2 disabled:opacity-60 text-sm shadow-lg"
                    >
                      <ShieldCheck size={18} /> {isCheckingOut ? 'Placing order…' : currentUser ? 'Place Order' : 'Sign in to checkout'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}
      {toastMsg && (
        <div className="fixed bottom-24 sm:bottom-6 right-5 bg-[#0D1B3E] text-white py-3 px-4 rounded-xl text-sm font-medium shadow-2xl z-[100] flex items-center gap-2.5 max-w-[280px]">
          <CheckCircle size={14} className="text-green-400 shrink-0" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}
