"use client";

import Footer from '@/components/Footer';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { 
  ShoppingCart, ShieldCheck, Heart,
  Search, MessageCircle, Package, X, ChevronLeft, ChevronRight, Minus, Plus, Trash2, CheckCircle,
  User, LogOut, ChevronDown, Wrench, Camera, Wifi
} from 'lucide-react';
import { FloatingDock, type FloatingDockItem } from '@/components/ui/floating-dock';
import {
  IconHome,
  IconDeviceLaptop,
  IconShoppingCart,
  IconPhone,
  IconUserCircle,
  IconLogin2,
  IconInfoCircle,
  IconTool,
  IconDots,
} from '@tabler/icons-react';

const CATEGORIES = ['All', 'Laptops', 'Desktops', 'Monitors', 'Networking', 'Printers', 'Servers', 'Storage', 'Accessories'];

const CartIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <ShoppingCart size={size} className={className} strokeWidth={1.75} />
);

// Minimal modern SVG icons per category
const CatIcons: Record<string, (props: { size?: number; className?: string }) => React.JSX.Element> = {
  Laptops: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="4" width="20" height="13" rx="2"/>
      <path d="M1 21h22"/>
    </svg>
  ),
  Desktops: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  ),
  Monitors: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="20" height="13" rx="2"/>
      <path d="M8 21h8M12 16v5"/>
      <circle cx="12" cy="9.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  Networking: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12.55a11 11 0 0114.08 0"/>
      <path d="M1.42 9a16 16 0 0121.16 0"/>
      <path d="M8.53 16.11a6 6 0 016.95 0"/>
      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  Printers: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 6 2 18 2 18 9"/>
      <rect x="6" y="17" width="12" height="5"/>
      <rect x="2" y="9" width="20" height="8" rx="1"/>
      <line x1="18" y1="13" x2="18" y2="13.01"/>
    </svg>
  ),
  Servers: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="20" height="5" rx="1"/>
      <rect x="2" y="10" width="20" height="5" rx="1"/>
      <rect x="2" y="17" width="20" height="4" rx="1"/>
      <circle cx="6" cy="5.5" r="0.8" fill="currentColor" stroke="none"/>
      <circle cx="6" cy="12.5" r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  ),
  Storage: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
    </svg>
  ),
  Accessories: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="7" y="2" width="10" height="18" rx="4"/>
      <line x1="12" y1="7" x2="12" y2="9"/>
    </svg>
  ),
  All: ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
};

const getCatIcon = (cat: string, className: string = "", size: number = 20) => {
  const Icon = CatIcons[cat] || CatIcons['All'];
  return <Icon size={size} className={className} />;
};

const formatLKR = (num: number) => `Rs ${num.toLocaleString('en-LK')}`;

export default function ForttuneApp() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [page, setPage] = useState('home');
  const expertiseScrollRef = useRef<HTMLDivElement>(null);
  const homeExpertiseScrollRef = useRef<HTMLDivElement>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [pdpQty, setPdpQty] = useState(1);

  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // --- Add-to-cart "fly" animation state ---
  const cartIconRef = useRef<HTMLButtonElement | null>(null);
  const cartGlyphRef = useRef<HTMLSpanElement | null>(null);
  const [flyingItems, setFlyingItems] = useState<{ id: number; x1: number; y1: number; x2: number; y2: number; image?: string }[]>([]);
  const [cartBump, setCartBump] = useState(false);

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

  // Hero background slideshow
  const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1600&q=80', // laptop setup
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80', // circuit board
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80', // server room
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80', // team with laptops
  ];
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPrev, setHeroPrev] = useState<number | null>(null);
  const [heroFading, setHeroFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroPrev(heroIndex);
      setHeroFading(true);
      setHeroIndex(i => (i + 1) % HERO_IMAGES.length);
      setTimeout(() => { setHeroPrev(null); setHeroFading(false); }, 1200);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroIndex]);

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

  // Launches a small icon that arcs from the clicked button to the header cart icon
  const triggerFlyToCart = (originEl: HTMLElement | null, image?: string) => {
    if (!originEl || !cartIconRef.current) return;
    const startRect = originEl.getBoundingClientRect();
    const endRect = cartIconRef.current.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setFlyingItems(prev => [...prev, {
      id,
      x1: startRect.left + startRect.width / 2,
      y1: startRect.top + startRect.height / 2,
      x2: endRect.left + endRect.width / 2,
      y2: endRect.top + endRect.height / 2,
      image,
    }]);
  };

  // Reusable Add to Cart button with morph, ripple, and fly-to-cart effects
  const AddToCartButton = ({ product, quantity = 1, image, disabled, variant = 'card' }: { product: any; quantity?: number; image?: string; disabled?: boolean; variant?: 'card' | 'pdp' }) => {
    const [status, setStatus] = useState<'idle' | 'added'>('idle');
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const isCard = variant === 'card';

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled || status === 'added') return;
      addToCart(product, quantity);
      triggerFlyToCart(btnRef.current, image);
      setStatus('added');
      setTimeout(() => setStatus('idle'), 1100);
    };

    return (
      <motion.button
        ref={btnRef}
        disabled={disabled}
        onClick={handleClick}
        whileTap={!disabled ? { scale: 0.93 } : undefined}
        animate={status === 'added' ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={
          isCard
            ? "relative flex-1 flex items-center justify-center gap-1.5 overflow-hidden bg-[#E85D26] hover:bg-[#f47a4a] text-white text-[11px] font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
            : "relative flex-1 bg-[#E85D26] disabled:opacity-50 text-white rounded-xl font-semibold text-sm hover:bg-[#F47A4A] transition-colors shadow-md shadow-[#E85D26]/20 flex items-center justify-center gap-2 overflow-hidden"
        }
      >
        {/* ripple burst on success */}
        <AnimatePresence>
          {status === 'added' && (
            <motion.span
              key="ripple"
              initial={{ scale: 0, opacity: 0.55 }}
              animate={{ scale: 2.8, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.55)', borderRadius: '999px', pointerEvents: 'none' }}
            />
          )}
        </AnimatePresence>

        {/* icon + label morph */}
        <AnimatePresence mode="wait" initial={false}>
          {status === 'added' ? (
            <motion.span
              key="check"
              initial={{ scale: 0, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="flex items-center gap-1.5 relative z-10"
            >
              <CheckCircle size={isCard ? 13 : 16} /> {isCard ? 'Added!' : 'Added to Cart'}
            </motion.span>
          ) : (
            <motion.span
              key="cart"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="flex items-center gap-1.5 relative z-10"
            >
              <CartIcon size={isCard ? 13 : 16} /> {disabled ? 'Out of Stock' : (isCard ? 'Add to cart' : 'Add to Cart')}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
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
              {getCatIcon(p.category, "text-[#1A2F5E]/15", 56)}
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
              <AddToCartButton product={p} quantity={1} image={p.image} variant="card" />
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

      {/* FLYING ADD-TO-CART ITEMS */}
      <AnimatePresence>
        {flyingItems.map(item => {
          const arcLift = Math.min(160, Math.max(60, Math.abs(item.x2 - item.x1) * 0.35));
          return (
            <motion.div
              key={item.id}
              initial={{ x: item.x1 - 16, y: item.y1 - 16, scale: 1, opacity: 1, rotate: 0 }}
              animate={{
                x: [item.x1 - 16, (item.x1 + item.x2) / 2 - 16, item.x2 - 16],
                y: [item.y1 - 16, Math.min(item.y1, item.y2) - arcLift, item.y2 - 16],
                scale: [1, 1.25, 0.25],
                opacity: [1, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 0.7, ease: 'easeInOut', times: [0, 0.5, 1] }}
              onAnimationComplete={() => {
                setFlyingItems(prev => prev.filter(f => f.id !== item.id));
                setCartBump(true);
                setTimeout(() => setCartBump(false), 380);
              }}
              style={{
                position: 'fixed', top: 0, left: 0, zIndex: 100, pointerEvents: 'none',
                width: 32, height: 32, borderRadius: '50%', overflow: 'hidden',
                boxShadow: '0 6px 18px rgba(232,93,38,0.45)',
              }}
              className="bg-white border-2 border-[#E85D26] flex items-center justify-center"
            >
              {item.image ? (
                <img src={item.image} className="w-full h-full object-cover mix-blend-multiply" />
              ) : (
                <CartIcon size={14} className="text-[#E85D26]" />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {/* NAVBAR — floating pill style */}
      <motion.div
        className="sticky top-0 z-40 px-4 md:px-8 pt-3 pb-1 pointer-events-none"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <nav className="pointer-events-auto bg-white/95 backdrop-blur-md border border-[#E2E6F0] rounded-2xl shadow-[0_4px_24px_rgba(13,27,62,0.09)] h-[60px] flex items-center justify-between px-4 md:px-6 mx-auto max-w-7xl">

          {/* LOGO */}
          <div className="flex items-center cursor-pointer gap-2.5 shrink-0" onClick={() => setPage('home')}>
            <img
              src="https://res.cloudinary.com/dukv2otyn/image/upload/v1782676866/Forttune-3.1_sj71vp.webp"
              alt="Forttune Channels"
              className="h-8 object-contain"
            />
          </div>

          {/* CENTER NAV — floating dock */}
          <div className="flex-1 flex items-center justify-center">
            <FloatingDock
              desktopClassName="h-12 px-3 pb-1.5 shadow-none border-none bg-transparent"
              mobileClassName="!hidden"
              items={(() => {
                const dock: FloatingDockItem[] = [
                  {
                    title: 'Home',
                    icon: <IconHome className="h-full w-full text-black" />,
                    onClick: () => { setPage('home'); window.scrollTo(0, 0); },
                    active: page === 'home',
                  },
                  {
                    title: 'Products',
                    icon: <IconDeviceLaptop className="h-full w-full text-black" />,
                    onClick: () => { setPage('products'); window.scrollTo(0, 0); },
                    active: page === 'products' || page === 'product-detail',
                  },
                  {
                    title: 'Contact',
                    icon: <IconPhone className="h-full w-full text-black" />,
                    onClick: () => { setPage('contact'); window.scrollTo(0, 0); },
                    active: page === 'contact',
                  },
                  {
                    title: 'Services',
                    icon: <IconTool className="h-full w-full text-black" />,
                    onClick: () => { setPage('services'); window.scrollTo(0, 0); },
                    active: page === 'services',
                  },
                  {
                    title: 'About',
                    icon: <IconInfoCircle className="h-full w-full text-black" />,
                    onClick: () => { setPage('about'); window.scrollTo(0, 0); },
                    active: page === 'about',
                  },
                ];
                return dock;
              })()}
            />
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E2E6F0] hover:bg-[#F5F6FA] transition-colors text-[13px] font-medium text-[#0D1B3E]"
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
                <a href="/register" className="px-3 py-1.5 rounded-xl border border-[#E2E6F0] bg-white text-[#0D1B3E] text-[13px] font-semibold hover:border-[#0D1B3E]/30 transition-colors hidden sm:block shadow-sm">
                  Register
                </a>
              </div>
            )}

            <motion.button
              ref={cartIconRef}
              onClick={() => setIsCartOpen(true)}
              animate={cartBump ? { scale: [1, 1.25, 0.93, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              onMouseEnter={() => {
                if (!cartGlyphRef.current) return;
                gsap.killTweensOf(cartGlyphRef.current);
                gsap.to(cartGlyphRef.current, { scale: 1.25, duration: 0.3, ease: 'back.out(3)' });
                gsap.fromTo(
                  cartGlyphRef.current,
                  { rotate: 0 },
                  {
                    rotate: 14,
                    duration: 0.1,
                    ease: 'power2.out',
                    yoyo: true,
                    repeat: 3,
                    onComplete: () => gsap.set(cartGlyphRef.current, { rotate: 0 }),
                  }
                );
              }}
              onMouseLeave={() => {
                if (!cartGlyphRef.current) return;
                gsap.killTweensOf(cartGlyphRef.current);
                gsap.to(cartGlyphRef.current, { scale: 1, rotate: 0, duration: 0.3, ease: 'power3.out' });
              }}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl text-[#0D1B3E] cursor-pointer"
              aria-label="Open cart"
            >
              <span ref={cartGlyphRef} className="inline-flex">
                <CartIcon size={20} />
              </span>
              <AnimatePresence mode="wait">
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                    className="absolute -top-0.5 -right-0.5 bg-[#E85D26] text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center leading-none"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>
      </motion.div>

      {/* BOTTOM TAB BAR — mobile only */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E2E6F0] pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16">
          {[
            {
              key: 'home',
              label: 'Home',
              icon: IconHome,
              active: page === 'home',
              onClick: () => { setMoreMenuOpen(false); setPage('home'); window.scrollTo(0, 0); },
            },
            {
              key: 'products',
              label: 'Products',
              icon: IconDeviceLaptop,
              active: page === 'products' || page === 'product-detail',
              onClick: () => { setMoreMenuOpen(false); setPage('products'); window.scrollTo(0, 0); },
            },
            {
              key: 'cart',
              label: 'Cart',
              icon: IconShoppingCart,
              active: false,
              badge: cartCount > 0 ? cartCount : undefined,
              onClick: () => { setMoreMenuOpen(false); setIsCartOpen(true); },
            },
            {
              key: 'account',
              label: currentUser ? 'Account' : 'Sign In',
              icon: currentUser ? IconUserCircle : IconLogin2,
              active: page === 'dashboard',
              onClick: () => {
                setMoreMenuOpen(false);
                if (currentUser) {
                  window.location.href = currentUser.role === 'ADMIN' ? '/admin' : '/dashboard';
                } else {
                  window.location.href = '/login';
                }
              },
            },
            {
              key: 'more',
              label: 'More',
              icon: IconDots,
              active: moreMenuOpen || page === 'contact' || page === 'about' || page === 'services',
              onClick: () => setMoreMenuOpen(v => !v),
            },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={tab.onClick}
                className="relative flex flex-col items-center justify-center gap-1"
              >
                <Icon className={`h-5 w-5 ${tab.active ? 'text-[#0D1B3E]' : 'text-[#9AA4B8]'}`} />
                <span className={`text-[10px] font-medium ${tab.active ? 'text-[#0D1B3E]' : 'text-[#9AA4B8]'}`}>
                  {tab.label}
                </span>
                {!!tab.badge && (
                  <span className="absolute top-1.5 right-[28%] flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E85D26] px-1 text-[9px] font-bold leading-none text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* MORE SHEET — mobile only */}
      <AnimatePresence>
        {moreMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMoreMenuOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-[#0D1B3E]/30"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden fixed bottom-16 inset-x-0 z-40 bg-white rounded-t-2xl border-t border-[#E2E6F0] shadow-[0_-8px_30px_rgba(13,27,62,0.12)] pb-[env(safe-area-inset-bottom)]"
            >
              <div className="w-10 h-1 rounded-full bg-[#E2E6F0] mx-auto mt-3 mb-1" />
              <div className="py-2">
                {[
                  { key: 'services', label: 'Services', icon: IconTool },
                  { key: 'about', label: 'About Us', icon: IconInfoCircle },
                  { key: 'contact', label: 'Contact', icon: IconPhone },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => { setMoreMenuOpen(false); setPage(item.key); window.scrollTo(0, 0); }}
                      className={`w-full flex items-center gap-3 px-6 py-3.5 text-[14px] font-medium transition-colors ${page === item.key ? 'text-[#E85D26]' : 'text-[#0D1B3E]'} hover:bg-[#F5F6FA]`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="pb-16 md:pb-0">
        
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
                  getCatIcon(selectedProduct.category, "text-[#1A2F5E]/10", 128)
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
                    <AddToCartButton
                      product={selectedProduct}
                      quantity={pdpQty}
                      image={selectedProduct.image}
                      disabled={selectedProduct.stock === 0}
                      variant="pdp"
                    />
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
            <div className="relative overflow-hidden border-b border-[#0D1B3E]/8" style={{ minHeight: '420px' }}>
              {/* Slideshow background images */}
              {HERO_IMAGES.map((src, i) => (
                <div
                  key={src}
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backgroundImage: `url(${src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: i === heroIndex ? 1 : 0,
                    transition: i === heroIndex ? 'opacity 1.2s ease-in-out' : 'opacity 0.6s ease-in-out',
                    zIndex: i === heroIndex ? 1 : 0,
                  }}
                />
              ))}

              {/* Dark overlay for readability */}
              <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(105deg, rgba(13,27,62,0.82) 0%, rgba(13,27,62,0.55) 55%, rgba(13,27,62,0.25) 100%)' }} />

              {/* Content */}
              <div className="relative z-20 pt-14 pb-14 px-5 md:pt-24 md:pb-20 md:px-10 max-w-7xl mx-auto">
                <div className="max-w-[560px]">
                  <div className="inline-block bg-[#E85D26] text-white text-[10px] font-bold tracking-[1.2px] uppercase px-3 py-1.5 rounded-full mb-5">
                    Sri Lanka's IT Hardware Distributor
                  </div>
                  <h1 className="text-white text-[34px] md:text-[52px] font-extrabold leading-[1.15] mb-5 drop-shadow-lg">
                    Premium tech,<br/>
                    delivered to your <span className="text-[#E85D26]">door.</span>
                  </h1>
                  <p className="text-white/80 text-[15px] max-w-[420px] leading-[1.7] mb-8">
                    Laptops, servers, networking and peripherals from 15+ global brands. Trusted by 500+ channel partners across the island.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <button onClick={() => setPage('products')} className="bg-[#E85D26] text-white px-6 py-3.5 rounded-xl text-[14px] font-semibold hover:bg-[#f47a4a] transition-colors shadow-lg">
                      Browse Inventory
                    </button>
                    <button onClick={() => setPage('contact')} className="bg-white/15 backdrop-blur-sm text-white border border-white/30 px-6 py-3.5 rounded-xl text-[14px] font-semibold hover:bg-white/25 transition-colors">
                      Request a Quote
                    </button>
                  </div>
                </div>

                {/* Slide dots */}
                <div className="flex gap-1.5 mt-10">
                  {HERO_IMAGES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setHeroPrev(heroIndex); setHeroIndex(i); }}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === heroIndex ? '24px' : '8px',
                        height: '8px',
                        background: i === heroIndex ? '#E85D26' : 'rgba(255,255,255,0.45)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* CATEGORIES + LATEST */}
            <div className="max-w-7xl mx-auto px-5 md:px-10 py-10">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-[#0D1B3E]">Shop by Category</h2>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <div
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className="group bg-white border border-[#0D1B3E]/8 rounded-2xl py-5 px-2 text-center cursor-pointer hover:border-[#E85D26]/40 hover:shadow-[0_4px_20px_rgba(232,93,38,0.10)] transition-all duration-200 flex flex-col items-center gap-2.5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#F5F6FA] group-hover:bg-[#E85D26]/8 flex items-center justify-center transition-colors duration-200">
                        {getCatIcon(cat, "text-[#0D1B3E]/40 group-hover:text-[#E85D26] transition-colors duration-200", 18)}
                      </div>
                      <span className="text-[10px] font-semibold text-[#6B7A99] group-hover:text-[#0D1B3E] leading-tight tracking-wide uppercase transition-colors duration-200">{cat}</span>
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

            {/* EXPERTISE — photo card carousel */}
            <div className="py-14 md:py-20">
              <div className="max-w-3xl mx-auto px-5 md:px-10 text-center mb-10 md:mb-14">
                <motion.h2
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="text-black text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6"
                >
                  Tailored expertise<br/>for every challenge
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[#6B7A99] text-base md:text-lg leading-relaxed"
                >
                  What sets us apart isn't just the hardware — it's the people, the reach, and the follow-through behind every partnership.
                </motion.p>
              </div>

              <div className="max-w-6xl mx-auto px-5 md:px-10 flex justify-end gap-2 mb-4">
                <button
                  onClick={() => homeExpertiseScrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
                  className="w-10 h-10 rounded-full border border-[#0D1B3E]/15 flex items-center justify-center hover:bg-[#0D1B3E] hover:text-white hover:border-[#0D1B3E] transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => homeExpertiseScrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
                  className="w-10 h-10 rounded-full border border-[#0D1B3E]/15 flex items-center justify-center hover:bg-[#0D1B3E] hover:text-white hover:border-[#0D1B3E] transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div
                ref={homeExpertiseScrollRef}
                className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory px-5 md:px-10 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {[
                  {
                    title: 'Partner Reach',
                    body: 'Well engaged with every Province, District and Region in the country — the accessibility behind every brand we represent.',
                    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80',
                  },
                  {
                    title: 'Adaptability',
                    body: "We adjust our conditions to a moving technology market, so the benefit reaches our stakeholders, not just us.",
                    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=900&q=80',
                  },
                  {
                    title: 'Integrity',
                    body: 'A dependable technology provider to vendors, partners and customers alike — that reputation is the product.',
                    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80',
                  },
                  {
                    title: 'Teamwork',
                    body: 'One team across vendors, partners and customers, geared toward a single outcome: the team succeeds together.',
                    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80',
                  },
                  {
                    title: 'After Sales Support',
                    body: "A platform only stays useful if it's maintained. We stay on it for timely upgrades, long after the sale closes.",
                    image: 'https://images.unsplash.com/photo-1553775282-20af80779df7?w=900&q=80',
                  },
                ].map(({ title, body, image }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative overflow-hidden aspect-square shadow-sm cursor-pointer shrink-0 snap-start w-[78%] xs:w-[60%] sm:w-[300px]"
                  >
                    <img
                      src={image}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B3E]/90 via-[#0D1B3E]/10 to-transparent" />
                    <div className="absolute inset-0 p-5 flex flex-col justify-end">
                      <span className="inline-block w-fit text-[12px] font-bold uppercase tracking-[1.5px] text-white bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-md mb-2">
                        {title}
                      </span>
                      <p className="text-white/85 text-[13px] leading-relaxed overflow-hidden max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-[max-height,opacity] duration-500 ease-out">
                        {body}
                      </p>
                    </div>
                  </motion.div>
                ))}
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
                <h3 className="text-base font-bold text-[#0D1B3E] mb-1">Headquarters</h3>
                <p className="text-xs text-[#6B7A99] mb-6">Mount Lavinia, Sri Lanka</p>

                <div className="divide-y divide-[#0D1B3E]/8">
                  <div className="py-4 first:pt-0">
                    <div className="text-[10px] font-bold text-[#6B7A99] uppercase tracking-wider mb-1">Address</div>
                    <div className="text-sm font-medium text-[#0D1B3E] leading-relaxed">
                      No. 312, Galle Road,<br />Mount Lavinia, Sri Lanka
                    </div>
                  </div>

                  <a href="tel:+94112638538" className="group flex items-center justify-between gap-3 py-4">
                    <div>
                      <div className="text-[10px] font-bold text-[#6B7A99] uppercase tracking-wider mb-1">General Line</div>
                      <div className="text-sm font-medium text-[#0D1B3E] group-hover:text-[#E85D26] transition-colors">
                        +94 112 638 538
                      </div>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-[#6B7A99] group-hover:text-[#E85D26] group-hover:translate-x-0.5 transition-all" />
                  </a>

                  <a
                    href="https://wa.me/94725516516"
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-3 py-4 last:pb-0"
                  >
                    <div>
                      <div className="text-[10px] font-bold text-[#6B7A99] uppercase tracking-wider mb-1">WhatsApp Sales</div>
                      <div className="text-sm font-medium text-[#0D1B3E] group-hover:text-[#E85D26] transition-colors">
                        +94 725 516 516
                      </div>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-[#6B7A99] group-hover:text-[#E85D26] group-hover:translate-x-0.5 transition-all" />
                  </a>
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

        {/* PAGE: SERVICES */}
        {page === 'services' && (
          <div>
            {/* HERO */}
            <div className="bg-[#0D1B3E] relative overflow-hidden">
              <div className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full bg-[#E85D26]/10 blur-3xl" />
              <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-16 pb-14 md:pt-24 md:pb-20">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-px bg-[#E85D26]" />
                  <span className="text-[#E85D26] text-[11px] font-bold uppercase tracking-[2px]">Beyond Distribution</span>
                </div>
                <h1 className="text-white font-extrabold tracking-tight leading-[0.98] text-[42px] sm:text-[56px] md:text-[72px] max-w-3xl">
                  Hardware is the start.<br/>Service is the rest.
                </h1>
                <p className="text-white/60 text-[15px] md:text-base max-w-lg mt-7 leading-relaxed">
                  A technical bench, a security crew, and a network team — on call island-wide for the work that keeps your business running long after the invoice.
                </p>
              </div>
            </div>

            {/* SERVICES — full-bleed split panels */}
            <div>
              {[
                {
                  icon: Wrench,
                  eyebrow: 'Repair',
                  title: 'Notebook & Desktop Repair',
                  body: "Water damage, a crashed hard drive, a fault nobody can name — when a machine goes down it stalls the whole day. Our bench has 10+ years of hands-on repair experience across every size, style and type of computer, plus a preventive check-up program built to catch problems before they cost you a day's work.",
                  tags: ['Preventive check-ups', 'Hardware diagnostics', 'Component-level repair', 'Performance tuning'],
                  panelBg: '#0D1B3E',
                  image: 'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=1000&q=80',
                },
                {
                  icon: Camera,
                  eyebrow: 'Security',
                  title: 'CCTV Installation',
                  body: 'Professional-grade surveillance, planned and installed by people who do this for a living. We design indoor and outdoor coverage, IP video systems and video analytics around your premises — not a generic kit, a system that covers every angle that actually matters to you, day or night.',
                  tags: ['IP video surveillance', '30m+ night clarity', 'Intruder deterrence', 'Remote receiving centre', 'Monitor from anywhere'],
                  panelBg: '#13234d',
                  image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1000&q=80',
                },
                {
                  icon: Wifi,
                  eyebrow: 'Networking',
                  title: 'Networking & Wi-Fi',
                  body: 'From a single office LAN to a multi-site WAN rollout, our partners and technical team carry the project from design through installation to post-deployment support — built for strong coverage, easy provisioning, and enough headroom for every device your team adds next.',
                  tags: ['Wireless LAN', 'Outdoor Wi-Fi', 'Network security', 'Guest access', 'BYOD ready'],
                  panelBg: '#0D1B3E',
                  image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=1000&q=80',
                },
              ].map(({ icon: Icon, eyebrow, title, body, tags, panelBg, image }, i) => (
                <div
                  key={title}
                  className={`grid grid-cols-1 lg:grid-cols-2 ${i !== 0 ? 'border-t border-[#0D1B3E]/10' : ''}`}
                >
                  {/* TEXT SIDE */}
                  <div className={`flex items-center px-5 md:px-10 lg:px-16 py-14 md:py-20 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="max-w-md"
                    >
                      <motion.span
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="text-[11px] font-bold uppercase tracking-[2px] text-[#E85D26] mb-3 block"
                      >
                        {eyebrow}
                      </motion.span>
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="text-3xl md:text-[40px] font-extrabold text-[#0D1B3E] tracking-tight leading-[1.05] mb-5"
                      >
                        {title}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="text-[#6B7A99] text-[15px] leading-relaxed mb-6"
                      >
                        {body}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-wrap gap-2"
                      >
                        {tags.map(t => (
                          <span key={t} className="text-[12px] font-medium text-[#0D1B3E] bg-[#F5F6FA] border border-[#0D1B3E]/8 px-3 py-1.5 rounded-full">
                            {t}
                          </span>
                        ))}
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* ILLUSTRATION SIDE */}
                  <div
                    className={`relative overflow-hidden min-h-[320px] md:min-h-[420px] ${i % 2 === 1 ? 'lg:order-1' : ''}`}
                    style={{ background: panelBg }}
                  >
                    {/* photo */}
                    <img
                      src={image}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${panelBg}33, ${panelBg}99)` }} />

                    {/* radiating lines */}
                    <svg viewBox="0 0 600 500" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
                      {[
                        [300, 250, 40, 30], [300, 250, 560, 40], [300, 250, 580, 220],
                        [300, 250, 560, 460], [300, 250, 60, 470], [300, 250, 20, 240],
                        [300, 250, 150, 10], [300, 250, 460, 10],
                      ].map(([x1, y1, x2, y2], idx) => (
                        <motion.line
                          key={idx}
                          x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke="#E85D26" strokeOpacity="0.45" strokeWidth="1.5"
                          initial={{ pathLength: 0, opacity: 0 }}
                          whileInView={{ pathLength: 1, opacity: 1 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{ duration: 1, delay: 0.1 + idx * 0.05, ease: 'easeOut' }}
                        />
                      ))}
                      {/* floating shapes */}
                      <motion.rect x="60" y="80" width="10" height="10" fill="#E85D26" opacity="0.7"
                        animate={{ y: [80, 65, 80] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
                      <motion.circle cx="520" cy="120" r="5" fill="#fff" opacity="0.4"
                        animate={{ y: [120, 135, 120] }} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }} />
                      <motion.rect x="500" y="380" width="14" height="14" fill="#E85D26" opacity="0.5" transform="rotate(20 507 387)"
                        animate={{ y: [380, 395, 380] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
                      <motion.circle cx="90" cy="400" r="4" fill="#fff" opacity="0.5"
                        animate={{ y: [400, 388, 400] }} transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }} />
                      <motion.path d="M460 230 l5 -8 5 8 -5 8 z" fill="#E85D26" opacity="0.6"
                        animate={{ rotate: [0, 15, 0] }} style={{ transformOrigin: '465px 230px' }}
                        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }} />
                    </svg>

                    {/* central icon badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-[28%] border-[3px] border-[#F5F1E3] flex items-center justify-center bg-white/[0.03]">
                        <Icon size={56} className="text-[#F5F1E3]" strokeWidth={1.6} />
                      </div>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="max-w-6xl mx-auto px-5 md:px-10 pb-16 md:pb-24">
              <div className="bg-[#0D1B3E] rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
                <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-[#E85D26]/10 blur-3xl" />
                <h3 className="relative text-white text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Need a hand from the team?</h3>
                <p className="relative text-white/60 text-sm max-w-md mx-auto mb-7">
                  Tell us what's broken, what you're protecting, or what you're connecting — we'll route it to the right specialist.
                </p>
                <button onClick={() => { setPage('contact'); window.scrollTo(0, 0); }} className="relative bg-[#E85D26] text-white px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-[#f47a4a] transition-colors">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAGE: ABOUT */}
        {page === 'about' && (
          <div>
            {/* HERO */}
            <div className="bg-[#0D1B3E] relative overflow-hidden">
              <div className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full bg-[#E85D26]/10 blur-3xl" />
              <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-16 pb-14 md:pt-24 md:pb-20">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-px bg-[#E85D26]" />
                  <span className="text-[#E85D26] text-[11px] font-bold uppercase tracking-[2px]">Who We Are</span>
                </div>
                <h1 className="text-white font-extrabold tracking-tight leading-[0.98] text-[42px] sm:text-[56px] md:text-[72px] max-w-3xl">
                  20 years of distribution,<br/>one channel partner.
                </h1>
                <p className="text-white/60 text-[15px] md:text-base max-w-lg mt-7 leading-relaxed">
                  Forttune was founded to connect global tech brands with the resellers who actually reach Sri Lanka's market — and to back that connection with people who understand it.
                </p>

                {/* STAT ROW */}
                <div className="grid grid-cols-3 gap-6 md:gap-10 mt-12 max-w-xl">
                  {[['20+', 'Years of distribution expertise'], ['600+', 'Reseller engagements'], ['2020', 'Forttune founded']].map(([num, label], i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.55, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 0.5, delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                        className="text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-1"
                      >
                        {num}
                      </motion.div>
                      <div className="text-white/50 text-[12px] leading-snug">{label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* STORY — split layout */}
            <div className="max-w-6xl mx-auto px-5 md:px-10 py-14 md:py-20">
              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 md:gap-14">
                <motion.h2
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[#0D1B3E] text-2xl md:text-[28px] font-extrabold tracking-tight leading-tight"
                >
                  Built on relationships the industry already trusted.
                </motion.h2>
                <div className="space-y-5 text-[#6B7A99] text-[15px] leading-relaxed border-l border-[#0D1B3E]/10 pl-6 md:pl-10">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-5"
                  >
                    <p>
                      Forttune focusses on technology distribution — PCs, Notebooks, Servers & Storages, Printers and high-quality peripherals — working closely with channel partners to fulfil hardware and software requirements across the island. Multiple global brands and hundreds of partners run through that one connection.
                    </p>
                    <p>
                      That expertise traces back to Forttune's founder: an IT distribution specialist with 20 years in the industry and 600+ reseller engagements behind him, giving the company a read on local market dynamics that's hard to fake. That same integrity with partners is what creates unique value for the brands who work with us.
                    </p>
                    <p>
                      The reseller network reaches every region, with Bell Store extending that further into retail. On the corporate side, the team has delivered top-tier installations across Servers, Switches, Storage, Virtualization, back-office integration, Email, Directory and Network Services.
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* MISSION / VISION */}
            <div className="bg-[#F5F6FA] border-y border-[#0D1B3E]/8">
              <div className="max-w-6xl mx-auto px-5 md:px-10 py-14 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#E85D26] mb-3 block">Mission</span>
                  <p className="text-[#0D1B3E] text-xl md:text-2xl font-semibold tracking-tight leading-snug">
                    To be a reliable supplier of Information Technology products and services through omni-channel.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#E85D26] mb-3 block">Vision</span>
                  <p className="text-[#0D1B3E] text-xl md:text-2xl font-semibold tracking-tight leading-snug">
                    Enhance the customer experience and people's lifestyle by delivering high-quality technology efficiently, as a sustainable organization for the country.
                  </p>
                </motion.div>
              </div>
            </div>

            {/* EXPERTISE — photo card carousel */}
            <div className="py-14 md:py-20">
              <div className="max-w-3xl mx-auto px-5 md:px-10 text-center mb-10 md:mb-14">
                <motion.h2
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="text-black text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6"
                >
                  Tailored expertise<br/>for every challenge
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[#6B7A99] text-base md:text-lg leading-relaxed"
                >
                  What sets us apart isn't just the hardware — it's the people, the reach, and the follow-through behind every partnership.
                </motion.p>
              </div>

              <div className="max-w-6xl mx-auto px-5 md:px-10 flex justify-end gap-2 mb-4">
                <button
                  onClick={() => expertiseScrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
                  className="w-10 h-10 rounded-full border border-[#0D1B3E]/15 flex items-center justify-center hover:bg-[#0D1B3E] hover:text-white hover:border-[#0D1B3E] transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => expertiseScrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
                  className="w-10 h-10 rounded-full border border-[#0D1B3E]/15 flex items-center justify-center hover:bg-[#0D1B3E] hover:text-white hover:border-[#0D1B3E] transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div
                ref={expertiseScrollRef}
                className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory px-5 md:px-10 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {[
                  {
                    title: 'Partner Reach',
                    body: 'Well engaged with every Province, District and Region in the country — the accessibility behind every brand we represent.',
                    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80',
                  },
                  {
                    title: 'Adaptability',
                    body: "We adjust our conditions to a moving technology market, so the benefit reaches our stakeholders, not just us.",
                    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=900&q=80',
                  },
                  {
                    title: 'Integrity',
                    body: 'A dependable technology provider to vendors, partners and customers alike — that reputation is the product.',
                    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80',
                  },
                  {
                    title: 'Teamwork',
                    body: 'One team across vendors, partners and customers, geared toward a single outcome: the team succeeds together.',
                    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80',
                  },
                  {
                    title: 'After Sales Support',
                    body: "A platform only stays useful if it's maintained. We stay on it for timely upgrades, long after the sale closes.",
                    image: 'https://images.unsplash.com/photo-1553775282-20af80779df7?w=900&q=80',
                  },
                ].map(({ title, body, image }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative overflow-hidden aspect-square shadow-sm cursor-pointer shrink-0 snap-start w-[78%] xs:w-[60%] sm:w-[300px]"
                  >
                    <img
                      src={image}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B3E]/90 via-[#0D1B3E]/10 to-transparent" />
                    <div className="absolute inset-0 p-5 flex flex-col justify-end">
                      <span className="inline-block w-fit text-[12px] font-bold uppercase tracking-[1.5px] text-white bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-md mb-2">
                        {title}
                      </span>
                      <p className="text-white/85 text-[13px] leading-relaxed overflow-hidden max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-[max-height,opacity] duration-500 ease-out">
                        {body}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* LEADERSHIP */}
            <div className="max-w-6xl mx-auto px-5 md:px-10 py-16 md:py-24">
              <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#E85D26] mb-6 block">Leadership</span>
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-14 items-start">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="w-28 h-28 md:w-full md:h-auto md:aspect-square rounded-3xl bg-[#0D1B3E] flex items-center justify-center mx-auto md:mx-0"
                >
                  <span className="text-white text-4xl font-extrabold tracking-tight">GS</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3 className="text-[#0D1B3E] text-2xl md:text-3xl font-extrabold tracking-tight mb-1">Gnanam Sellathurrai</h3>
                  <div className="text-[#E85D26] text-[12px] font-bold uppercase tracking-wider mb-5">Founder & CEO, Forttune Channels (Pvt) Ltd</div>
                  <div className="space-y-4 text-[#6B7A99] text-[15px] leading-relaxed">
                    <p>
                      A visionary IT professional and entrepreneur responsible for the full spectrum of operation and profitability at Forttune. A distribution specialist for computer hardware, especially PCs and Notebooks, he founded the company after 20+ years serving key distribution firms.
                    </p>
                    <p>
                      Forttune launched at the start of the COVID-19 pandemic in 2020 — and steadily grew into momentum anyway, recording remarkable revenue with strong partner engagements and a presence that keeps expanding.
                    </p>
                    <p>
                      He holds an MBA from Mahatma Gandhi University, India, and previously held senior roles at Redington SL, Tech Pacific Lanka, Samson Information Technologies, and Engenuity. He remains an active Executive Council Member of FITIS (Federation of Information Technology Industry in Sri Lanka), Hardware Chapter.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* CTA */}
            <div className="max-w-6xl mx-auto px-5 md:px-10 pb-16 md:pb-24">
              <div className="bg-[#0D1B3E] rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
                <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-[#E85D26]/10 blur-3xl" />
                <h3 className="relative text-white text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Let's work together</h3>
                <p className="relative text-white/60 text-sm max-w-md mx-auto mb-7">
                  Reach out to our team in Mount Lavinia for bulk orders, partnership enquiries, or support.
                </p>
                <button onClick={() => { setPage('contact'); window.scrollTo(0, 0); }} className="relative bg-[#E85D26] text-white px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-[#f47a4a] transition-colors">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-[#0D1B3E]/40 backdrop-blur-sm z-50 flex justify-end" onClick={(e) => { if(e.target === e.currentTarget) setIsCartOpen(false) }}>
          <div className="w-1/2 min-w-[260px] sm:w-[380px] bg-white h-full flex flex-col shadow-2xl">
            <div className="p-5 border-b border-[#0D1B3E]/8 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0D1B3E] flex items-center gap-2">
                <CartIcon size={18}/> Your Cart
                {cartCount > 0 && <span className="bg-[#E85D26] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
              </h3>
              <button onClick={() => setIsCartOpen(false)} className="text-[#6B7A99] hover:text-[#0D1B3E] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <CartIcon size={56} className="text-[#C4CCDB] mb-4" />
                  <h4 className="text-[#0D1B3E] font-bold mb-1">Cart is empty</h4>
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
                        {getCatIcon(x.category, "text-[#1A2F5E]/40", 20)}
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
        <div className="fixed bottom-20 md:bottom-6 right-5 bg-[#0D1B3E] text-white py-3 px-4 rounded-xl text-sm font-medium shadow-2xl z-[100] flex items-center gap-2.5 max-w-[280px]">
          <CheckCircle size={14} className="text-green-400 shrink-0" />
          {toastMsg}
        </div>
      )}

      {/* FOOTER */}
      <Footer />
    </div>
  );
}