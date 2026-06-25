"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Truck, Award, HeadphonesIcon, ShieldCheck, Store, 
  Laptop, Monitor, Wifi, Printer, Server, Database, Mouse, 
  Search, MapPin, Phone, MessageCircle, Mail, Clock, Package, X, Plus
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
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Fetch Database Data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        
        // Safety net: check if the response is OK before trying to read JSON
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setInventory(data);
      } catch (err) {
        console.error("Failed to load inventory", err);
        // Fallback to empty array to prevent map() errors on the frontend
        setInventory([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Toast Timer
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 2600);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const showToast = (msg: string) => setToastMsg(msg);

  const addToCart = (product: any) => {
    setCart(prev => {
      const ex = prev.find(x => x.id === product.id);
      if (ex) return prev.map(x => x.id === product.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.name} — added to cart`);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(x => x.id !== id));
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCat(cat);
    setPage('products');
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
    <div className="bg-white border-[0.5px] border-[#0D1B3E]/10 rounded-[10px] overflow-hidden cursor-pointer hover:border-[#E85D26] transition-colors flex flex-col h-full">
      <div className="bg-[#F5F6FA] h-[110px] flex items-center justify-center relative shrink-0">
        {getCatIcon(p.category, "w-10 h-10 text-[#1A2F5E]/20")}
        {p.badge === 'hot' && <span className="absolute top-[7px] left-[7px] text-[9px] font-medium px-[6px] py-[2px] rounded-[4px] text-white bg-[#E85D26]">Hot</span>}
        {p.badge === 'new' && <span className="absolute top-[7px] left-[7px] text-[9px] font-medium px-[6px] py-[2px] rounded-[4px] text-white bg-[#1D9E75]">New</span>}
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
          <button onClick={() => addToCart(p)} className="bg-[#0D1B3E] text-white border-none w-[26px] h-[26px] rounded-[6px] cursor-pointer flex items-center justify-center shrink-0 hover:bg-[#E85D26] transition-colors">
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F5F6FA] font-sans text-[14px] text-[#0D1B3E] min-h-[700px] relative overflow-hidden">
      
      {/* NAVBAR */}
      <nav className="bg-white border-b-[0.5px] border-[#0D1B3E]/10 h-[52px] flex items-center justify-between px-5 sticky top-0 z-40">
        <div className="flex items-center cursor-pointer" onClick={() => setPage('home')}>
          <img 
            src="https://res.cloudinary.com/dukv2otyn/image/upload/v1781957501/874b574032c781f9eb100c851006a78d_crop1681211041_sxrilv.png" 
            alt="Forttune Logo" 
            className="h-[28px] w-auto object-contain"
          />
        </div>
        <div className="flex gap-5 hidden sm:flex">
          {['home', 'products', 'contact'].map(p => (
            <button key={p} onClick={() => setPage(p)} className={`text-[12px] font-medium capitalize transition-colors ${page === p ? 'text-[#E85D26]' : 'text-[#6B7A99] hover:text-[#0D1B3E]'}`}>
              {p}
            </button>
          ))}
        </div>
        <button onClick={() => setIsCartOpen(true)} className="bg-[#E85D26] border-none text-white px-[13px] py-[6px] rounded-[6px] text-[12px] cursor-pointer flex items-center gap-[5px]">
          <ShoppingCart size={14} />
          Cart ({cartCount})
        </button>
      </nav>

      {/* MOBILE NAV */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#0D1B3E]/10 flex justify-around p-3 z-30">
        {['home', 'products', 'contact'].map(p => (
          <button key={p} onClick={() => setPage(p)} className={`text-[11px] font-medium capitalize flex flex-col items-center gap-1 ${page === p ? 'text-[#E85D26]' : 'text-[#6B7A99]'}`}>
             {p === 'home' ? <Store size={18}/> : p === 'products' ? <Package size={18}/> : <Phone size={18}/>}
            {p}
          </button>
        ))}
      </div>

      <div className="pb-16 sm:pb-0">
        {/* PAGE: HOME */}
        {page === 'home' && (
          <div className="block">
            {/* HERO SECTION */}
            <div className="bg-white border-b-[0.5px] border-[#0D1B3E]/10 pt-[36px] px-5 pb-[30px] relative overflow-hidden">
              <div className="absolute -right-[40px] -top-[40px] w-[240px] h-[240px] rounded-full bg-[#E85D26]/10 pointer-events-none"></div>
              <div className="inline-block bg-[#E85D26]/15 text-[#E85D26] text-[10px] font-medium tracking-[0.8px] uppercase px-[9px] py-[3px] rounded-[4px] mb-[12px]">Sri Lanka's IT hardware distributor</div>
              <h1 className="text-[#0D1B3E] text-[24px] font-medium leading-[1.3] max-w-[380px] mb-[10px]">Premium tech,<br/>delivered to your <em className="text-[#E85D26] not-italic">door.</em></h1>
              <p className="text-[#6B7A99] text-[13px] max-w-[340px] leading-[1.65] mb-[20px]">Laptops, servers, networking and peripherals from 15+ global brands. Trusted by 500+ channel partners across Sri Lanka.</p>
              <div className="flex gap-[8px] flex-wrap relative z-10">
                <button onClick={() => setPage('products')} className="bg-[#E85D26] text-white border-none px-[18px] py-[9px] rounded-[6px] text-[12px] font-medium cursor-pointer hover:bg-[#F47A4A] transition-colors">Browse products</button>
                <button onClick={() => setPage('contact')} className="bg-transparent text-[#0D1B3E] border border-[#0D1B3E]/10 px-[18px] py-[9px] rounded-[6px] text-[12px] font-medium cursor-pointer hover:border-[#0D1B3E] transition-colors">Request a quote</button>
              </div>
              <div className="flex gap-5 mt-[26px] pt-[20px] border-t border-[#0D1B3E]/10 overflow-x-auto whitespace-nowrap hide-scrollbar">
                <div><div className="text-[#0D1B3E] text-[18px] font-medium">500+</div><div className="text-[#6B7A99] text-[10px] mt-[2px]">Channel partners</div></div>
                <div><div className="text-[#0D1B3E] text-[18px] font-medium">15+</div><div className="text-[#6B7A99] text-[10px] mt-[2px]">Global brands</div></div>
                <div><div className="text-[#0D1B3E] text-[18px] font-medium">10k+</div><div className="text-[#6B7A99] text-[10px] mt-[2px]">Products</div></div>
                <div><div className="text-[#0D1B3E] text-[18px] font-medium">20+</div><div className="text-[#6B7A99] text-[10px] mt-[2px]">Years experience</div></div>
              </div>
            </div>

            <div className="bg-white border-b-[0.5px] border-[#0D1B3E]/10 py-[10px] px-5 flex gap-5 overflow-x-auto hide-scrollbar">
              <div className="flex items-center gap-[7px] whitespace-nowrap"><Truck size={15} className="text-[#E85D26]"/><span className="text-[11px] text-[#6B7A99] font-medium">Island-wide delivery</span></div>
              <div className="flex items-center gap-[7px] whitespace-nowrap"><Award size={15} className="text-[#E85D26]"/><span className="text-[11px] text-[#6B7A99] font-medium">Trusted warranty</span></div>
              <div className="flex items-center gap-[7px] whitespace-nowrap"><HeadphonesIcon size={15} className="text-[#E85D26]"/><span className="text-[11px] text-[#6B7A99] font-medium">After-sales service</span></div>
              <div className="flex items-center gap-[7px] whitespace-nowrap"><ShieldCheck size={15} className="text-[#E85D26]"/><span className="text-[11px] text-[#6B7A99] font-medium">Secure checkout</span></div>
              <div className="flex items-center gap-[7px] whitespace-nowrap"><Store size={15} className="text-[#E85D26]"/><span className="text-[11px] text-[#6B7A99] font-medium">Click & collect</span></div>
            </div>

            <div className="bg-white border-b-[0.5px] border-[#0D1B3E]/10 py-[9px] px-5 flex items-center gap-[10px] overflow-x-auto hide-scrollbar">
              <span className="text-[10px] text-[#6B7A99] uppercase tracking-[0.7px] whitespace-nowrap font-medium">Brands</span>
              {['HP','Dell','Lenovo','Asus','Acer','MSI','Epson','Brother','D-Link','Transcend','Lexar','Tiandy'].map(b => (
                <span key={b} className="bg-[#F5F6FA] border-[0.5px] border-[#0D1B3E]/10 text-[#1A2F5E] text-[11px] font-medium px-[11px] py-[4px] rounded-[14px] whitespace-nowrap cursor-pointer hover:bg-[#0D1B3E] hover:text-white hover:border-[#0D1B3E] transition-colors">{b}</span>
              ))}
            </div>

            {/* CATEGORIES SECTION */}
            <div className="p-[18px] px-5 max-w-7xl mx-auto bg-[#F5F6FA]">
              <div className="text-[10px] font-medium text-[#E85D26] uppercase tracking-[0.8px] mb-[4px]">Shop by category</div>
              <div className="flex items-center justify-between mb-[14px]">
                <div className="text-[15px] font-medium text-[#0D1B3E] m-0">Categories</div>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-[8px] mb-[20px]">
                {CATEGORIES.filter(c=>c!=='All').map(cat => (
                  <div key={cat} onClick={() => handleCategoryClick(cat)} className="bg-white border-[0.5px] border-[#0D1B3E]/10 rounded-[10px] py-[14px] px-[8px] text-center cursor-pointer hover:border-[#E85D26] transition-colors flex flex-col items-center">
                    {getCatIcon(cat, "text-[#1A2F5E]/45 mb-[6px] w-[22px] h-[22px]")}
                    <span className="text-[11px] font-medium text-[#0D1B3E]">{cat}</span>
                  </div>
                ))}
              </div>

              <div className="text-[10px] font-medium text-[#E85D26] uppercase tracking-[0.8px] mb-[4px]">Featured products</div>
              <div className="flex items-center justify-between mb-[14px]">
                <div className="text-[15px] font-medium text-[#0D1B3E] m-0">Hot picks</div>
                <span onClick={() => setPage('products')} className="text-[11px] text-[#E85D26] cursor-pointer hover:underline">View all →</span>
              </div>
              
              {isLoading ? (
                <div className="text-[#6B7A99] text-[13px] py-5">Loading products...</div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(155px,1fr))] gap-[10px]">
                  {inventory.filter(p => p.badge).slice(0,6).map(p => <ProductCard key={p.id} p={p} />)}
                </div>
              )}

              <div className="mt-[18px]">
                <div className="bg-white border-[0.5px] border-[#0D1B3E]/10 rounded-[10px] py-[18px] px-5 flex items-center justify-between gap-[14px] flex-wrap mb-[6px]">
                  <div>
                    <div className="text-[9px] text-[#E85D26] font-medium uppercase tracking-[0.7px] mb-[4px]">Click & collect</div>
                    <div className="text-[#0D1B3E] text-[14px] font-medium mb-[3px]">Order online, pick up in-store.</div>
                    <div className="text-[#6B7A99] text-[11px] max-w-[400px]">Buy securely online. Collect from our Mount Lavinia showroom — zero delivery wait.</div>
                  </div>
                  <button onClick={() => setPage('products')} className="bg-[#E85D26] text-white border-none px-[18px] py-[9px] rounded-[6px] text-[12px] font-medium cursor-pointer">Shop now</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE: PRODUCTS */}
        {page === 'products' && (
          <div className="p-[16px] px-5 max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-[10px] mb-[12px] flex-wrap">
              <div className="text-[15px] font-medium text-[#0D1B3E]">All products</div>
              <div className="flex items-center gap-[6px] bg-white border-[0.5px] border-[#0D1B3E]/10 rounded-[7px] py-[7px] px-[11px] flex-1 max-w-[260px]">
                <Search size={15} className="text-[#6B7A99]" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-none outline-none text-[12px] bg-transparent w-full text-[#0D1B3E] placeholder:text-[#6B7A99]"
                />
              </div>
            </div>
            <div className="flex gap-[7px] flex-wrap mb-[14px]">
              {CATEGORIES.map(cat => (
                <div 
                  key={cat} 
                  onClick={() => setActiveCat(cat)}
                  className={`border-[0.5px] text-[11px] px-[11px] py-[4px] rounded-[14px] cursor-pointer transition-colors ${activeCat === cat ? 'bg-[#0D1B3E] text-white border-[#0D1B3E]' : 'bg-white text-[#6B7A99] border-[#0D1B3E]/10'}`}
                >
                  {cat}
                </div>
              ))}
            </div>
            
            {isLoading ? (
              <div className="text-[#6B7A99] text-[13px] py-5">Loading products...</div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(155px,1fr))] gap-[10px]">
                {filteredProducts.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            ) : (
              <div className="text-[#6B7A99] text-[13px] py-5">No products found.</div>
            )}
          </div>
        )}

        {/* PAGE: CONTACT */}
        {page === 'contact' && (
          <div className="p-[18px] px-5 max-w-7xl mx-auto bg-[#F5F6FA]">
            <div className="text-[10px] font-medium text-[#E85D26] uppercase tracking-[0.8px] mb-[4px]">Get in touch</div>
            <div className="text-[15px] font-medium text-[#0D1B3E] mb-[14px]">Contact Forttune Channels</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] max-w-[660px]">
              <div className="bg-white border-[0.5px] border-[#0D1B3E]/10 rounded-[10px] p-[18px]">
                <h3 className="text-[13px] font-medium text-[#0D1B3E] mb-[12px] flex items-center gap-[7px]"><MapPin size={15} className="text-[#E85D26]"/>Our showroom</h3>
                <div className="flex gap-[9px] mb-[10px]"><MapPin size={14} className="text-[#E85D26] mt-[2px] shrink-0"/><div><div className="text-[10px] text-[#6B7A99]">Address</div><div className="text-[12px] font-medium text-[#0D1B3E]">No. 312, Galle Road, Mount Lavinia</div></div></div>
                <div className="flex gap-[9px] mb-[10px]"><Phone size={14} className="text-[#E85D26] mt-[2px] shrink-0"/><div><div className="text-[10px] text-[#6B7A99]">General</div><div className="text-[12px] font-medium text-[#0D1B3E]">+94 112 638 538</div></div></div>
                <div className="flex gap-[9px] mb-[10px]"><MessageCircle size={14} className="text-[#E85D26] mt-[2px] shrink-0"/><div><div className="text-[10px] text-[#6B7A99]">Hotline / WhatsApp</div><div className="text-[12px] font-medium text-[#0D1B3E]">+94 725 516 516</div></div></div>
                <div className="flex gap-[9px] mb-[10px]"><Mail size={14} className="text-[#E85D26] mt-[2px] shrink-0"/><div><div className="text-[10px] text-[#6B7A99]">Email</div><div className="text-[12px] font-medium text-[#0D1B3E]">info@forttune.lk</div></div></div>
                <div className="flex gap-[9px] mb-[10px]"><Clock size={14} className="text-[#E85D26] mt-[2px] shrink-0"/><div><div className="text-[10px] text-[#6B7A99]">Hours</div><div className="text-[12px] font-medium text-[#0D1B3E]">Mon–Fri, 9am–5pm</div></div></div>
                <div className="mt-[12px] bg-[#F5F6FA] rounded-[7px] p-[10px] text-[11px] text-[#6B7A99] flex gap-[7px] items-start">
                  <Package size={14} className="text-[#E85D26] mt-[1px] shrink-0"/>
                  <span>Click & Collect available — order online, collect from our showroom same day.</span>
                </div>
              </div>
              <div className="bg-white border-[0.5px] border-[#0D1B3E]/10 rounded-[10px] p-[18px]">
                <h3 className="text-[13px] font-medium text-[#0D1B3E] mb-[12px] flex items-center gap-[7px]"><MessageCircle size={15} className="text-[#E85D26]"/>Send a message</h3>
                <div className="mb-[10px]"><label className="text-[10px] text-[#6B7A99] block mb-[3px] uppercase tracking-[0.5px]">Your name</label><input type="text" placeholder="Full name" className="w-full bg-[#F5F6FA] border-[0.5px] border-[#0D1B3E]/10 rounded-[6px] py-[7px] px-[9px] text-[12px] text-[#0D1B3E] outline-none" /></div>
                <div className="mb-[10px]"><label className="text-[10px] text-[#6B7A99] block mb-[3px] uppercase tracking-[0.5px]">Email</label><input type="email" placeholder="you@company.lk" className="w-full bg-[#F5F6FA] border-[0.5px] border-[#0D1B3E]/10 rounded-[6px] py-[7px] px-[9px] text-[12px] text-[#0D1B3E] outline-none" /></div>
                <div className="mb-[10px]"><label className="text-[10px] text-[#6B7A99] block mb-[3px] uppercase tracking-[0.5px]">Subject</label>
                  <select className="w-full bg-[#F5F6FA] border-[0.5px] border-[#0D1B3E]/10 rounded-[6px] py-[7px] px-[9px] text-[12px] text-[#0D1B3E] outline-none">
                    <option>Product inquiry</option>
                    <option>Dealer / reseller network</option>
                    <option>Bulk / corporate pricing</option>
                    <option>Technical support</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="mb-[10px]"><label className="text-[10px] text-[#6B7A99] block mb-[3px] uppercase tracking-[0.5px]">Message</label><textarea placeholder="How can we help?" className="w-full bg-[#F5F6FA] border-[0.5px] border-[#0D1B3E]/10 rounded-[6px] py-[7px] px-[9px] text-[12px] text-[#0D1B3E] outline-none h-[70px] resize-none"></textarea></div>
                <button onClick={() => showToast('Message sent! We\'ll reply within 24 hrs.')} className="bg-[#E85D26] text-white border-none py-[9px] px-[16px] rounded-[6px] text-[12px] font-medium cursor-pointer w-full hover:bg-[#F47A4A] transition-colors">Send message</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CART OVERLAY */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={(e) => { if(e.target === e.currentTarget) setIsCartOpen(false) }}>
          <div className="w-[290px] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-[14px] px-[18px] border-b-[0.5px] border-[#0D1B3E]/10 flex items-center justify-between">
              <h3 className="text-[14px] font-medium text-[#0D1B3E] m-0">Cart ({cartCount})</h3>
              <button onClick={() => setIsCartOpen(false)} className="bg-none border-none cursor-pointer text-[#6B7A99] hover:text-[#0D1B3E]"><X size={17} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-[14px] px-[18px]">
              {cart.length === 0 ? (
                <div className="text-center py-8 px-4 text-[#6B7A99] text-[12px]">
                  <ShoppingCart size={28} className="mx-auto mb-[8px] opacity-25" />
                  Your cart is empty
                </div>
              ) : (
                cart.map((x, i) => (
                  <div key={i} className="flex gap-[9px] mb-[12px] pb-[12px] border-b-[0.5px] border-[#0D1B3E]/10">
                    <div className="bg-[#F5F6FA] rounded-[6px] w-[42px] h-[42px] flex items-center justify-center shrink-0">
                      {getCatIcon(x.category, "w-[18px] h-[18px] text-[#1A2F5E]/35")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-[#0D1B3E] mb-[2px] leading-tight">{x.name}</div>
                      <div className="text-[11px] text-[#E85D26] font-medium">{formatLKR(x.price * x.qty)}{x.qty > 1 ? ` (×${x.qty})` : ''}</div>
                    </div>
                    <button onClick={() => removeFromCart(x.id)} className="bg-none border-none text-[#6B7A99] cursor-pointer hover:text-red-500 self-start ml-auto"><X size={13} /></button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-[14px] px-[18px] border-t-[0.5px] border-[#0D1B3E]/10 bg-gray-50">
                <div className="flex justify-between text-[13px] font-medium text-[#0D1B3E] mb-[10px]">
                  <span>Total</span>
                  <span>{formatLKR(cartTotal)}</span>
                </div>
                <button onClick={() => showToast('Checkout via PayHere / WebXPay — coming in Phase 3!')} className="bg-[#E85D26] text-white border-none p-[10px] rounded-[7px] text-[13px] font-medium cursor-pointer w-full hover:bg-[#F47A4A] transition-colors">Proceed to checkout</button>
                <div className="text-[10px] text-[#6B7A99] text-center mt-[7px] flex items-center justify-center gap-[4px]">
                  <ShieldCheck size={12} /> Secure · PayHere · WebXPay
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 bg-[#0D1B3E] text-white py-[9px] px-[14px] rounded-[7px] text-[12px] z-[100] shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-200">
          {toastMsg}
        </div>
      )}

    </div>
  );
}