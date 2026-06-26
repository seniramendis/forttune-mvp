"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Truck, Award, HeadphonesIcon, ShieldCheck, Store, 
  Laptop, Monitor, Wifi, Printer, Server, Database, Mouse, 
  Search, MapPin, Phone, MessageCircle, Mail, Clock, Package, X, Plus, ChevronLeft, Minus, Trash2
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
  const [selectedProduct, setSelectedProduct] = useState<any>(null); // State for the PDP
  const [pdpQty, setPdpQty] = useState(1); // Quantity selector on the PDP

  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 2600);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

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
    const catOk = activeCat === 'All' || p.category === activeCat;
    const sOk = !search || p.name.toLowerCase().includes(search.toLowerCase()) || 
                (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) || 
                (p.spec && p.spec.toLowerCase().includes(search.toLowerCase()));
    return catOk && sOk;
  });

  const cartTotal = cart.reduce((s, x) => s + (x.price * x.qty), 0);
  const cartCount = cart.reduce((s, x) => s + x.qty, 0);

  const ProductCard = ({ p }: { p: any }) => (
    <div 
      onClick={() => openProductDetail(p)}
      className="bg-white border-[0.5px] border-[#0D1B3E]/10 rounded-[10px] overflow-hidden cursor-pointer hover:border-[#E85D26] hover:shadow-lg transition-all flex flex-col h-full group"
    >
      <div className="bg-[#F5F6FA] h-[110px] flex items-center justify-center relative shrink-0 group-hover:bg-slate-100 transition-colors">
        {getCatIcon(p.category, "w-10 h-10 text-[#1A2F5E]/20")}
        {p.badge === 'hot' && <span className="absolute top-[7px] left-[7px] text-[9px] font-medium px-[6px] py-[2px] rounded-[4px] text-white bg-[#E85D26]">Hot</span>}
        {p.badge === 'new' && <span className="absolute top-[7px] left-[7px] text-[9px] font-medium px-[6px] py-[2px] rounded-[4px] text-white bg-[#1D9E75]">New</span>}
        {p.stock === 0 && <span className="absolute top-[7px] right-[7px] text-[9px] font-medium px-[6px] py-[2px] rounded-[4px] text-red-600 bg-red-100">Out of Stock</span>}
      </div>
      <div className="p-[10px] flex flex-col flex-1">
        <div className="text-[9px] font-medium text-[#E85D26] uppercase tracking-[0.5px] mb-[3px]">{p.brand}</div>
        <div className="text-[12px] font-medium text-[#0D1B3E] leading-[1.35] mb-[4px]">{p.name}</div>
        <div className="text-[10px] text-[#6B7A99] mb-[8px] leading-[1.4] flex-1">{p.spec}</div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="text-[13px] font-medium text-[#0D1B3E]">{formatLKR(p.price)}</div>
            <div className="text-[9px] text-[#6B7A99] font-normal">LKR incl. taxes</div>
          </div>
          <button 
            disabled={p.stock === 0}
            onClick={(e) => { e.stopPropagation(); addToCart(p, 1); }} 
            className="bg-[#0D1B3E] disabled:opacity-50 text-white border-none w-[26px] h-[26px] rounded-[6px] flex items-center justify-center shrink-0 hover:bg-[#E85D26] transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F5F6FA] font-sans text-[14px] text-[#0D1B3E] min-h-screen relative overflow-hidden">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b-[0.5px] border-[#0D1B3E]/10 h-[60px] flex items-center justify-between px-5 md:px-10 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center cursor-pointer" onClick={() => setPage('home')}>
          <div className="w-8 h-8 bg-[#E85D26] rounded flex items-center justify-center font-bold text-white mr-3">F</div>
          <span className="font-bold text-[18px] tracking-wide text-[#0D1B3E] hidden sm:block">Forttune Channels</span>
        </div>
        <div className="flex gap-8 hidden sm:flex">
          {['home', 'products', 'contact'].map(p => (
            <button key={p} onClick={() => { setPage(p); window.scrollTo(0,0); }} className={`text-[13px] font-semibold capitalize transition-colors ${page === p || (page === 'product-detail' && p === 'products') ? 'text-[#E85D26]' : 'text-[#6B7A99] hover:text-[#0D1B3E]'}`}>
              {p}
            </button>
          ))}
        </div>
        <button onClick={() => setIsCartOpen(true)} className="bg-[#0D1B3E] hover:bg-[#1A2F5E] transition-colors border-none text-white px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer flex items-center gap-2 shadow-md">
          <ShoppingCart size={16} />
          Cart ({cartCount})
        </button>
      </nav>

      {/* MOBILE NAV */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#0D1B3E]/10 flex justify-around p-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {['home', 'products', 'contact'].map(p => (
          <button key={p} onClick={() => { setPage(p); window.scrollTo(0,0); }} className={`text-[11px] font-medium capitalize flex flex-col items-center gap-1 ${page === p || (page === 'product-detail' && p === 'products') ? 'text-[#E85D26]' : 'text-[#6B7A99]'}`}>
             {p === 'home' ? <Store size={18}/> : p === 'products' ? <Package size={18}/> : <Phone size={18}/>}
            {p}
          </button>
        ))}
      </div>

      <div className="pb-20 sm:pb-10">
        
        {/* --- PRODUCT DETAIL PAGE (PDP) --- */}
        {page === 'product-detail' && selectedProduct && (
          <div className="max-w-5xl mx-auto px-5 pt-8 animate-in fade-in duration-300">
            <button 
              onClick={() => setPage('products')} 
              className="text-[#6B7A99] hover:text-[#E85D26] flex items-center gap-2 text-sm font-medium mb-6 transition-colors"
            >
              <ChevronLeft size={16} /> Back to Products
            </button>

            <div className="bg-white rounded-2xl border border-[#0D1B3E]/10 shadow-sm overflow-hidden flex flex-col md:flex-row">
              
              {/* Product Visual */}
              <div className="w-full md:w-1/2 bg-[#F5F6FA] p-12 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#0D1B3E]/10 relative min-h-[300px]">
                {getCatIcon(selectedProduct.category, "w-32 h-32 text-[#1A2F5E]/10")}
                <div className="absolute top-6 left-6 flex gap-2">
                  {selectedProduct.badge === 'hot' && <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md text-white bg-[#E85D26] shadow-sm">🔥 Trending</span>}
                  {selectedProduct.badge === 'new' && <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md text-white bg-[#1D9E75] shadow-sm">New Arrival</span>}
                </div>
              </div>

              {/* Product Data */}
              <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col">
                <div className="text-[11px] font-bold text-[#E85D26] uppercase tracking-wider mb-2">{selectedProduct.brand}</div>
                <h1 className="text-2xl lg:text-3xl font-bold text-[#0D1B3E] leading-tight mb-4">{selectedProduct.name}</h1>
                
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#0D1B3E]/10">
                  <div className="text-3xl font-bold text-[#0D1B3E]">{formatLKR(selectedProduct.price)}</div>
                  <div className="text-xs text-[#6B7A99] bg-slate-100 px-3 py-1.5 rounded-md">Vat Included</div>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex justify-between">
                    <span className="text-[#6B7A99] text-sm">Category</span>
                    <span className="font-medium text-[#0D1B3E]">{selectedProduct.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7A99] text-sm">SKU Number</span>
                    <span className="font-mono text-sm text-[#0D1B3E]">{selectedProduct.sku || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7A99] text-sm">Availability</span>
                    <span className={`font-semibold ${selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of Stock'}
                    </span>
                  </div>
                  {selectedProduct.spec && (
                    <div className="mt-4 pt-4 border-t border-[#0D1B3E]/10">
                      <span className="block text-[#6B7A99] text-sm mb-1">Key Specifications</span>
                      <p className="font-medium text-[#0D1B3E] leading-relaxed">{selectedProduct.spec}</p>
                    </div>
                  )}
                </div>

                {/* Purchase Actions */}
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 h-[48px]">
                    <div className="flex items-center justify-between border border-[#0D1B3E]/20 rounded-xl px-4 w-[120px] bg-white">
                      <button onClick={() => setPdpQty(Math.max(1, pdpQty - 1))} className="text-[#6B7A99] hover:text-[#E85D26]"><Minus size={16} /></button>
                      <span className="font-semibold text-[15px]">{pdpQty}</span>
                      <button onClick={() => setPdpQty(Math.min(selectedProduct.stock, pdpQty + 1))} className="text-[#6B7A99] hover:text-[#E85D26]"><Plus size={16} /></button>
                    </div>
                    <button 
                      disabled={selectedProduct.stock === 0}
                      onClick={() => addToCart(selectedProduct, pdpQty)} 
                      className="flex-1 bg-[#E85D26] disabled:opacity-50 disabled:hover:bg-[#E85D26] text-white rounded-xl font-semibold text-sm hover:bg-[#F47A4A] transition-colors shadow-md shadow-[#E85D26]/20 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} /> {selectedProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                  
                  <a 
                    href={`https://wa.me/94725516516?text=Hi, I would like to inquire about the ${selectedProduct.name} (SKU: ${selectedProduct.sku}). Is it available for bulk purchase?`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 border border-[#0D1B3E]/20 text-[#0D1B3E] font-medium text-sm h-[48px] rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <MessageCircle size={18} className="text-green-600" />
                    Inquire via WhatsApp
                  </a>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* PAGE: HOME */}
        {page === 'home' && (
          <div className="block">
            {/* HERO SECTION */}
            <div className="bg-white border-b-[0.5px] border-[#0D1B3E]/10 pt-[50px] px-5 pb-[40px] md:pt-[80px] md:pb-[60px] md:px-10 relative overflow-hidden">
              <div className="absolute -right-[100px] -top-[100px] w-[400px] h-[400px] rounded-full bg-[#E85D26]/5 pointer-events-none"></div>
              <div className="max-w-7xl mx-auto">
                <div className="inline-block bg-[#E85D26]/10 text-[#E85D26] text-[11px] font-bold tracking-[1px] uppercase px-[12px] py-[4px] rounded-full mb-[16px]">Sri Lanka's IT Hardware Distributor</div>
                <h1 className="text-[#0D1B3E] text-[32px] md:text-[48px] font-extrabold leading-[1.2] max-w-[600px] mb-[16px]">Premium tech,<br/>delivered to your <span className="text-[#E85D26]">door.</span></h1>
                <p className="text-[#6B7A99] text-[15px] max-w-[450px] leading-[1.6] mb-[30px]">Laptops, servers, networking and peripherals from 15+ global brands. Trusted by 500+ channel partners across the island.</p>
                <div className="flex gap-[12px] flex-wrap relative z-10">
                  <button onClick={() => setPage('products')} className="bg-[#0D1B3E] text-white border-none px-[24px] py-[12px] rounded-lg text-[14px] font-semibold cursor-pointer hover:bg-[#1A2F5E] transition-colors shadow-lg">Browse Inventory</button>
                  <button onClick={() => setPage('contact')} className="bg-white text-[#0D1B3E] border border-[#0D1B3E]/20 px-[24px] py-[12px] rounded-lg text-[14px] font-semibold cursor-pointer hover:border-[#E85D26] hover:text-[#E85D26] transition-colors">Request Quote</button>
                </div>
              </div>
            </div>

            <div className="bg-white border-b-[0.5px] border-[#0D1B3E]/10 py-4 px-5 md:px-10 flex gap-8 overflow-x-auto hide-scrollbar max-w-7xl mx-auto justify-between">
              <div className="flex items-center gap-3 whitespace-nowrap"><Truck size={20} className="text-[#E85D26]"/><span className="text-[13px] text-[#0D1B3E] font-semibold">Island-wide delivery</span></div>
              <div className="flex items-center gap-3 whitespace-nowrap"><Award size={20} className="text-[#E85D26]"/><span className="text-[13px] text-[#0D1B3E] font-semibold">Official Warranty</span></div>
              <div className="flex items-center gap-3 whitespace-nowrap"><HeadphonesIcon size={20} className="text-[#E85D26]"/><span className="text-[13px] text-[#0D1B3E] font-semibold">B2B Support</span></div>
              <div className="flex items-center gap-3 whitespace-nowrap"><Store size={20} className="text-[#E85D26]"/><span className="text-[13px] text-[#0D1B3E] font-semibold">Mt. Lavinia Pickup</span></div>
            </div>

            {/* CATEGORIES SECTION */}
            <div className="p-5 md:p-10 max-w-7xl mx-auto bg-[#F5F6FA]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#0D1B3E] m-0">Shop by Category</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-10">
                {CATEGORIES.filter(c=>c!=='All').map(cat => (
                  <div key={cat} onClick={() => handleCategoryClick(cat)} className="bg-white border border-[#0D1B3E]/10 rounded-xl py-4 px-2 text-center cursor-pointer hover:border-[#E85D26] hover:shadow-md transition-all flex flex-col items-center">
                    {getCatIcon(cat, "text-[#1A2F5E]/60 mb-2 w-6 h-6")}
                    <span className="text-xs font-semibold text-[#0D1B3E]">{cat}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#0D1B3E] m-0">Latest Arrivals</h2>
                <span onClick={() => setPage('products')} className="text-sm font-semibold text-[#E85D26] cursor-pointer hover:underline">View Entire Catalog →</span>
              </div>
              
              {isLoading ? (
                <div className="text-[#6B7A99] text-[13px] py-10 text-center font-medium">Connecting to live database...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {inventory.slice(0,6).map(p => <ProductCard key={p.id} p={p} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAGE: PRODUCTS */}
        {page === 'products' && (
          <div className="p-5 md:p-10 max-w-7xl mx-auto animate-in fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <h1 className="text-2xl font-bold text-[#0D1B3E]">Our Inventory</h1>
              <div className="flex items-center gap-2 bg-white border border-[#0D1B3E]/10 rounded-lg py-2.5 px-4 w-full md:w-[320px] shadow-sm">
                <Search size={18} className="text-[#6B7A99]" />
                <input 
                  type="text" 
                  placeholder="Search by name, brand, or SKU..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-none outline-none text-sm bg-transparent w-full text-[#0D1B3E] placeholder:text-[#6B7A99]"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap mb-8">
              {CATEGORIES.map(cat => (
                <div 
                  key={cat} 
                  onClick={() => setActiveCat(cat)}
                  className={`border text-xs font-medium px-4 py-2 rounded-full cursor-pointer transition-colors shadow-sm ${activeCat === cat ? 'bg-[#0D1B3E] text-white border-[#0D1B3E]' : 'bg-white text-[#6B7A99] border-[#0D1B3E]/10 hover:border-[#E85D26]'}`}
                >
                  {cat}
                </div>
              ))}
            </div>
            
            {isLoading ? (
              <div className="text-[#6B7A99] text-[13px] py-10 text-center font-medium">Loading catalog...</div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredProducts.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-10 text-center border border-[#0D1B3E]/10">
                <Package size={32} className="mx-auto text-[#6B7A99]/50 mb-3" />
                <div className="text-[#0D1B3E] font-medium text-lg">No products found</div>
                <div className="text-[#6B7A99] text-sm mt-1">Try adjusting your search or category filter.</div>
              </div>
            )}
          </div>
        )}

        {/* PAGE: CONTACT */}
        {page === 'contact' && (
          <div className="p-5 md:p-10 max-w-7xl mx-auto animate-in fade-in">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-[#0D1B3E] mb-3">Partner with Forttune</h1>
              <p className="text-[#6B7A99] max-w-2xl mx-auto">Whether you're looking to bulk order for your enterprise or need support for a recent purchase, our team in Mount Lavinia is ready to assist.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white border border-[#0D1B3E]/10 rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-[#0D1B3E] mb-6 flex items-center gap-2"><MapPin className="text-[#E85D26]"/> Headquarters</h3>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#E85D26]/10 flex items-center justify-center shrink-0"><MapPin size={18} className="text-[#E85D26]"/></div>
                    <div><div className="text-xs font-semibold text-[#6B7A99] uppercase tracking-wider mb-1">Address</div><div className="text-sm font-medium text-[#0D1B3E] leading-relaxed">No. 312, Galle Road,<br/>Mount Lavinia, Sri Lanka</div></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#E85D26]/10 flex items-center justify-center shrink-0"><Phone size={18} className="text-[#E85D26]"/></div>
                    <div><div className="text-xs font-semibold text-[#6B7A99] uppercase tracking-wider mb-1">General Line</div><div className="text-sm font-medium text-[#0D1B3E]">+94 112 638 538</div></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#E85D26]/10 flex items-center justify-center shrink-0"><MessageCircle size={18} className="text-[#E85D26]"/></div>
                    <div><div className="text-xs font-semibold text-[#6B7A99] uppercase tracking-wider mb-1">WhatsApp Sales</div><div className="text-sm font-medium text-[#0D1B3E]">+94 725 516 516</div></div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#0D1B3E]/10 rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-[#0D1B3E] mb-6">Send an Inquiry</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#6B7A99] block mb-1.5 uppercase">Full Name</label>
                    <input type="text" className="w-full bg-[#F5F6FA] border border-[#0D1B3E]/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#E85D26] transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#6B7A99] block mb-1.5 uppercase">Email Address</label>
                    <input type="email" className="w-full bg-[#F5F6FA] border border-[#0D1B3E]/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#E85D26] transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#6B7A99] block mb-1.5 uppercase">Message</label>
                    <textarea className="w-full bg-[#F5F6FA] border border-[#0D1B3E]/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#E85D26] transition-colors h-24 resize-none"></textarea>
                  </div>
                  <button onClick={() => showToast('Message sent successfully!')} className="w-full bg-[#0D1B3E] text-white font-semibold py-3 rounded-lg hover:bg-[#1A2F5E] transition-colors shadow-md">Submit Request</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CART OVERLAY */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-[#0D1B3E]/40 backdrop-blur-sm z-50 flex justify-end" onClick={(e) => { if(e.target === e.currentTarget) setIsCartOpen(false) }}>
          <div className="w-full sm:w-[380px] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-[#0D1B3E]/10 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-[#0D1B3E] flex items-center gap-2"><ShoppingCart size={20}/> Your Cart</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-[#6B7A99] hover:text-[#E85D26] bg-white rounded-full p-1 shadow-sm"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart size={24} className="text-[#6B7A99]/50" />
                  </div>
                  <h4 className="text-[#0D1B3E] font-bold text-lg mb-1">Cart is Empty</h4>
                  <p className="text-[#6B7A99] text-sm">Looks like you haven't added any hardware yet.</p>
                  <button onClick={() => { setIsCartOpen(false); setPage('products'); }} className="mt-6 text-[#E85D26] font-semibold text-sm hover:underline">Start Shopping</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((x, i) => (
                    <div key={i} className="flex gap-4 p-3 bg-white border border-[#0D1B3E]/10 rounded-xl shadow-sm relative">
                      <div className="bg-[#F5F6FA] rounded-lg w-16 h-16 flex items-center justify-center shrink-0">
                        {getCatIcon(x.category, "w-6 h-6 text-[#1A2F5E]/40")}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="text-sm font-bold text-[#0D1B3E] mb-1 truncate pr-6">{x.name}</div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-bold text-[#E85D26]">{formatLKR(x.price * x.qty)}</div>
                          <div className="text-xs font-semibold text-[#6B7A99] bg-slate-100 px-2 py-0.5 rounded">Qty: {x.qty}</div>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(x.id)} className="absolute top-3 right-3 text-[#6B7A99] hover:text-red-500 bg-white"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-6 border-t border-[#0D1B3E]/10 bg-white shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-sm font-bold text-[#6B7A99] uppercase tracking-wider">Estimated Total</span>
                  <span className="text-2xl font-extrabold text-[#0D1B3E]">{formatLKR(cartTotal)}</span>
                </div>
                <button onClick={() => showToast('Secure Checkout via PayHere — Coming in Phase 3!')} className="w-full bg-[#0D1B3E] text-white font-bold py-4 rounded-xl hover:bg-[#1A2F5E] transition-all shadow-lg flex justify-center items-center gap-2">
                  <ShieldCheck size={20} /> Checkout Securely
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-[#0D1B3E] text-white py-3 px-5 rounded-xl text-sm font-medium shadow-2xl z-[100] animate-in slide-in-from-bottom-5 duration-300 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><CheckCircle size={14}/></div>
          {toastMsg}
        </div>
      )}

    </div>
  );
}