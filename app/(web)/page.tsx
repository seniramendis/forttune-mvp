"use client";

import Footer from '@/components/Footer';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Truck, Award, HeadphonesIcon, ShieldCheck, Store, Heart,
  Search, MapPin, Phone, MessageCircle, Package, X, ChevronLeft, Minus, Plus, Trash2, CheckCircle,
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
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [pdpQty, setPdpQty] = useState(1);

  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // --- Add-to-cart "fly" animation state ---
  const cartIconRef = useRef<HTMLButtonElement | null>(null);
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
              className="relative w-10 h-10 flex items-center justify-center rounded-xl text-[#0D1B3E] hover:bg-[#0D1B3E]/6 transition-colors cursor-pointer"
              aria-label="Open cart"
            >
              <CartIcon size={20} />
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
        <div className="grid grid-cols-4 h-16">
          {[
            {
              key: 'home',
              label: 'Home',
              icon: IconHome,
              active: page === 'home',
              onClick: () => { setPage('home'); window.scrollTo(0, 0); },
            },
            {
              key: 'products',
              label: 'Products',
              icon: IconDeviceLaptop,
              active: page === 'products' || page === 'product-detail',
              onClick: () => { setPage('products'); window.scrollTo(0, 0); },
            },
            {
              key: 'cart',
              label: 'Cart',
              icon: IconShoppingCart,
              active: false,
              badge: cartCount > 0 ? cartCount : undefined,
              onClick: () => setIsCartOpen(true),
            },
            {
              key: 'account',
              label: currentUser ? 'Account' : 'Sign In',
              icon: currentUser ? IconUserCircle : IconLogin2,
              active: page === 'dashboard',
              onClick: () => {
                if (currentUser) {
                  window.location.href = currentUser.role === 'ADMIN' ? '/admin' : '/dashboard';
                } else {
                  window.location.href = '/login';
                }
              },
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

        {/* PAGE: SERVICES */}
        {page === 'services' && (
          <div>
            <div className="bg-[#0D1B3E] border-b border-[#0D1B3E]/8">
              <div className="max-w-5xl mx-auto px-5 md:px-10 py-14 text-center">
                <div className="inline-block bg-[#E85D26] text-white text-[10px] font-bold tracking-[1.2px] uppercase px-3 py-1.5 rounded-full mb-5">
                  What We Offer
                </div>
                <h1 className="text-white text-3xl md:text-4xl font-extrabold leading-tight mb-4">Our Services</h1>
                <p className="text-white/75 max-w-2xl mx-auto text-sm leading-relaxed">
                  Beyond hardware distribution, Forttune's technical team supports your business with repairs, security and networking services delivered island-wide.
                </p>
              </div>
            </div>

            <div className="max-w-5xl mx-auto px-5 md:px-10 py-12 space-y-8">
              {[
                {
                  icon: Wrench,
                  title: 'Notebook & Desktop Repair Services',
                  body: "Everyone relies on their notebooks and desktops for business and personal use, and a bad day — water damage, a crashed hard drive, or another fault — can turn into a major inconvenience. With over 10+ years of experienced technicians, Forttune provides comprehensive computer support services, ready to take on repairs no matter the size, style or type of computer.",
                  bullets: ['Regular notebook and desktop preventive check-ups', 'Hardware diagnostics and component repair', 'Performance optimization to avoid future problems'],
                },
                {
                  icon: Camera,
                  title: 'CCTV Installation Service',
                  body: 'Protect your assets with professional business CCTV systems using state-of-the-art cameras to monitor your property, people and operations 24 hours a day. Our team has years of experience planning, customizing and installing comprehensive CCTV systems, including IP video surveillance, indoor and outdoor cameras, and cutting-edge video analytics tailored to your premises.',
                  bullets: [
                    'Crime prevention, detection and monitoring',
                    'Clear images day and night at ranges up to 30 metres',
                    'Audible warnings to deter intruders',
                    'Automatic connection to a remote video receiving centre',
                    'Access to your business CCTV from anywhere',
                  ],
                },
                {
                  icon: Wifi,
                  title: 'Networking & WiFi Solutions for Home & Office',
                  body: 'Forttune offers high-performance networking with strong Wi-Fi coverage, fast and easy provisioning through a built-in controller, and support for a large number of clients per access point. Whether implementing a LAN or WAN solution as part of a larger infrastructure project or a one-off deployment, our technical and support teams guide you through design, installation and post-deployment.',
                  bullets: ['Wireless LAN', 'Outdoor Wi-Fi', 'Network security', 'Guest Wi-Fi access', 'Bring Your Own Device (BYOD)'],
                },
              ].map(({ icon: Icon, title, body, bullets }) => (
                <div key={title} className="bg-white border border-[#0D1B3E]/8 rounded-2xl p-8 shadow-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#E85D26]/8 flex items-center justify-center shrink-0">
                      <Icon size={22} className="text-[#E85D26]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0D1B3E] pt-1.5">{title}</h3>
                  </div>
                  <p className="text-[#6B7A99] text-sm leading-relaxed mb-5">{body}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {bullets.map(b => (
                      <div key={b} className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-[#1D9E75] mt-0.5 shrink-0" />
                        <span className="text-[#0D1B3E] text-[13px] leading-snug">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* CTA */}
              <div className="bg-[#0D1B3E] rounded-2xl p-10 text-center">
                <h3 className="text-white text-xl font-bold mb-3">Need a service from our team?</h3>
                <p className="text-white/70 text-sm max-w-md mx-auto mb-6">
                  Get in touch and we'll match you with the right specialist for your repair, security or networking needs.
                </p>
                <button onClick={() => { setPage('contact'); window.scrollTo(0, 0); }} className="bg-[#E85D26] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#f47a4a] transition-colors">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAGE: ABOUT */}
        {page === 'about' && (
          <div>
            <div className="bg-[#0D1B3E] border-b border-[#0D1B3E]/8">
              <div className="max-w-5xl mx-auto px-5 md:px-10 py-14 text-center">
                <div className="inline-block bg-[#E85D26] text-white text-[10px] font-bold tracking-[1.2px] uppercase px-3 py-1.5 rounded-full mb-5">
                  Who We Are
                </div>
                <h1 className="text-white text-3xl md:text-4xl font-extrabold leading-tight mb-4">About Forttune</h1>
                <p className="text-white/75 max-w-2xl mx-auto text-sm leading-relaxed">
                  Forttune was founded as an Information Technology company to fulfil the vast areas of technology requirements, focusing on technology distribution and working closely with channel partners across Sri Lanka.
                </p>
              </div>
            </div>

            <div className="max-w-5xl mx-auto px-5 md:px-10 py-12 space-y-14">
              {/* INTRO */}
              <div className="space-y-4 text-[#0D1B3E]/80 text-sm leading-relaxed">
                <p>
                  Forttune mainly focusses on technology distribution, working closely with its channel partners in fulfilling hardware and software requirements across PCs, Notebooks, Servers & Storages, Printers and high-quality peripherals. Forttune connects multiple brands with hundreds of channel partners island-wide.
                </p>
                <p>
                  The expertise behind Forttune comes from its founder, an IT distribution specialist with 20 years of experience and over 600+ reseller engagements — giving the company a strong understanding of local market dynamics and unique value for the brands it represents.
                </p>
                <p>
                  Forttune reaches the market through its reseller base across the country, and further partners with Bell Store to reach retail customers nationwide. The corporate-focused team has completed top-tier installations across Servers, Switches, Storage, Virtualization, back-office system integration, Email and Directory and Network Services.
                </p>
              </div>

              {/* MISSION / VISION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#0D1B3E]/8 rounded-2xl p-8 shadow-sm">
                  <h3 className="text-base font-bold text-[#0D1B3E] mb-3">Mission</h3>
                  <p className="text-[#6B7A99] text-sm leading-relaxed">
                    To be a reliable supplier of Information Technology products and services through omni-channel.
                  </p>
                </div>
                <div className="bg-white border border-[#0D1B3E]/8 rounded-2xl p-8 shadow-sm">
                  <h3 className="text-base font-bold text-[#0D1B3E] mb-3">Vision</h3>
                  <p className="text-[#6B7A99] text-sm leading-relaxed">
                    Enhance the customer experience and people's lifestyle by delivering high-quality technological products and services efficiently, as a sustainable organization for the country.
                  </p>
                </div>
              </div>

              {/* OUR EXPERTISE */}
              <div>
                <h2 className="text-lg font-bold text-[#0D1B3E] mb-6 text-center">Our Expertise</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    ['Partner Reach', 'Well engaged with all the Provinces, Districts and Regions in the country, giving the best accessibility to the products we carry and the brands we represent.'],
                    ['Adaptability', 'We adjust our conditions to the dynamic technology world to pass the benefit on to our stakeholders.'],
                    ['Integrity', 'We work very closely with our vendors, partners and customers as a dependable technology provider.'],
                    ['Teamwork', 'Our team is geared to provide robust products and solutions, working with vendors, partners and customers as one single team.'],
                    ['After Sales Support', 'Technology needs careful monitoring for timely upgrades and maintenance — we are dedicated to keeping the platform up to standard.'],
                  ].map(([title, body]) => (
                    <div key={title} className="bg-white border border-[#0D1B3E]/8 rounded-2xl p-6">
                      <h4 className="text-sm font-bold text-[#0D1B3E] mb-2">{title}</h4>
                      <p className="text-[#6B7A99] text-[13px] leading-relaxed">{body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* LEADERSHIP */}
              <div>
                <h2 className="text-lg font-bold text-[#0D1B3E] mb-6 text-center">Leadership</h2>
                <div className="bg-white border border-[#0D1B3E]/8 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-[#F5F6FA] flex items-center justify-center shrink-0 mx-auto md:mx-0">
                    <User size={32} className="text-[#0D1B3E]/30" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#0D1B3E] mb-0.5">Gnanam Sellathurrai</h4>
                    <div className="text-[11px] font-bold text-[#E85D26] uppercase tracking-wider mb-3">Founder & CEO, Forttune Channels (Pvt) Ltd</div>
                    <div className="space-y-3 text-[#6B7A99] text-sm leading-relaxed">
                      <p>
                        A visionary IT professional and entrepreneur who is responsible for the full spectrum of operation and profitability of the organization. He is a distribution specialist for computer hardware products, especially PCs and Notebooks, and founded Forttune after serving key distribution companies over 20+ years.
                      </p>
                      <p>
                        Even though the company started during the COVID-19 pandemic in 2020, it steadily gained momentum and recorded remarkable revenue with strong business partner engagements, and continues to grow with a strong market presence.
                      </p>
                      <p>
                        He holds a Master of Business Administration from Mahatma Gandhi University, India, and has held senior roles at Redington SL, Tech Pacific Lanka, Samson Information Technologies, and Engenuity, prior to founding Forttune. He is also an active contributor to the IT industry as an Executive Council Member of FITIS (Federation of Information Technology Industry in Sri Lanka), Hardware Chapter.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-[#0D1B3E] rounded-2xl p-10 text-center">
                <h3 className="text-white text-xl font-bold mb-3">Let's work together</h3>
                <p className="text-white/70 text-sm max-w-md mx-auto mb-6">
                  Reach out to our team in Mount Lavinia for bulk orders, partnership enquiries, or support.
                </p>
                <button onClick={() => { setPage('contact'); window.scrollTo(0, 0); }} className="bg-[#E85D26] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#f47a4a] transition-colors">
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