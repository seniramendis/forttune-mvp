"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Truck, Award, HeadphonesIcon, ShieldCheck, Store, 
  Laptop, Monitor, Wifi, Printer, Server, Database, Mouse, 
  Search, MapPin, Phone, MessageCircle, Mail, Clock, Package, X, Plus
} from 'lucide-react';

// --- DATA ---
const CATEGORIES = ['All', 'Laptops', 'Desktops', 'Monitors', 'Networking', 'Printers', 'Servers', 'Storage', 'Accessories'];

const PRODS = [
  { id: 1, name: 'HP Elitebook 8 G1i 14 Ultra 7', brand: 'HP', cat: 'Laptops', price: 503000, spec: 'Ultra 7 14th Gen · Premium business', badge: 'hot' },
  { id: 2, name: 'HP Probook 4 Ultra 7 255U', brand: 'HP', cat: 'Laptops', price: 299000, spec: 'Intel Ultra 7 · 14th Gen · DOS', badge: '' },
  { id: 3, name: 'Dell Inspiron 3530 13th Gen i3', brand: 'Dell', cat: 'Laptops', price: 168000, spec: 'Core i3 13th Gen · in stock', badge: 'new' },
  { id: 4, name: 'Lenovo V15 G4 i5 13th Gen', brand: 'Lenovo', cat: 'Laptops', price: 168000, spec: 'Core i5 13th Gen · in stock', badge: '' },
  { id: 5, name: 'Asus Vivobook 15 A1504VA i7', brand: 'Asus', cat: 'Laptops', price: 298000, spec: 'Core i7 · 15.6" · in stock', badge: '' },
  { id: 6, name: 'Acer Notebook Intel i5 13420H', brand: 'Acer', cat: 'Laptops', price: 195000, spec: 'i5 13420H · 15.6"', badge: '' },
  { id: 7, name: 'Dell Inspiron 3530 i7', brand: 'Dell', cat: 'Laptops', price: 317600, spec: 'Core i7 · 15.6" · in stock', badge: '' },
  { id: 8, name: 'Dell Inspiron 3030 i7 Desktop', brand: 'Dell', cat: 'Desktops', price: 284000, spec: 'i7 14th Gen · SFF form factor', badge: '' },
  { id: 9, name: 'Monitor MSI G32C4X 31.5"', brand: 'MSI', cat: 'Monitors', price: 106000, spec: 'FHD · 250Hz · Curved', badge: 'hot' },
  { id: 10, name: 'Monitor MSI G27CQ4 E2 27"', brand: 'MSI', cat: 'Monitors', price: 88500, spec: 'WQHD 2K · 170Hz · Curved', badge: '' },
  { id: 11, name: 'Monitor MSI MAG 275F 27"', brand: 'MSI', cat: 'Monitors', price: 64500, spec: 'IPS · FHD · 180Hz', badge: 'new' },
  { id: 12, name: 'Asus ProArt 31.5" PA329CRV', brand: 'Asus', cat: 'Monitors', price: 271000, spec: '4K · Professional monitor', badge: '' },
  { id: 13, name: 'D-Link DGS-F1026P-E PoE Switch', brand: 'D-Link', cat: 'Networking', price: 94500, spec: '24GE PoE · 2 SFP · 250W', badge: '' },
  { id: 14, name: 'D-Link DGS-F1018P-E PoE Switch', brand: 'D-Link', cat: 'Networking', price: 91500, spec: '16GE PoE · 2 SFP · 150W', badge: 'new' },
  { id: 15, name: 'D-Link CAT6 UTP Cable 305M', brand: 'D-Link', cat: 'Networking', price: 66900, spec: '305m · 24AWG · Gray', badge: '' },
  { id: 16, name: 'D-Link DGS-F1010P-E Switch', brand: 'D-Link', cat: 'Networking', price: 31900, spec: '8GE PoE · 2GE Uplink · 120W', badge: '' },
  { id: 17, name: 'Brother PT-D610 Label Printer', brand: 'Brother', cat: 'Printers', price: 116300, spec: 'Laminated · Professional', badge: '' },
  { id: 18, name: 'Brother ADS-3100 Duplex Scanner', brand: 'Brother', cat: 'Printers', price: 196500, spec: 'Color duplex · 40ppm', badge: 'new' },
  { id: 19, name: 'Transcend 4TB External HDD', brand: 'Transcend', cat: 'Storage', price: 43600, spec: 'USB 3.1 · Portable', badge: '' },
  { id: 20, name: 'Transcend 2TB External HDD', brand: 'Transcend', cat: 'Storage', price: 30500, spec: 'USB 3.1 · Portable', badge: '' },
  { id: 21, name: 'Transcend 256GB Portable SSD', brand: 'Transcend', cat: 'Storage', price: 13600, spec: 'USB 3.1 Gen 2 · Compact', badge: '' },
  { id: 22, name: 'Lexar SSD NM610 512GB', brand: 'Lexar', cat: 'Storage', price: 12500, spec: 'M.2 NVMe · Read 2100MB/s', badge: '' },
  { id: 23, name: 'Tiandy 6MP 4G PT Solar Camera', brand: 'Tiandy', cat: 'Accessories', price: 26390, spec: '6MP · Solar · 4G · PT', badge: 'new' },
  { id: 24, name: 'A4Tech GH-30 Gaming Case', brand: 'A4Tech', cat: 'Accessories', price: 15500, spec: 'Tempered glass · ATX', badge: '' },
];

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

// --- MAIN COMPONENT ---
export default function ForttuneApp() {
  const [page, setPage] = useState('home');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Auto-hide toast
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
    showToast(`${product.brand} — added to cart`);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(x => x.id !== id));
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCat(cat);
    setPage('products');
  };

  const filteredProducts = PRODS.filter(p => {
    const catOk = activeCat === 'All' || p.cat === activeCat;
    const sOk = !search || p.name.toLowerCase().includes(search.toLowerCase()) || 
                p.brand.toLowerCase().includes(search.toLowerCase()) || 
                p.spec.toLowerCase().includes(search.toLowerCase());
    return catOk && sOk;
  });

  const cartTotal = cart.reduce((s, x) => s + (x.price * x.qty), 0);
  const cartCount = cart.reduce((s, x) => s + x.qty, 0);

  // --- REUSABLE PRODUCT CARD ---
  const ProductCard = ({ p }: { p: any }) => (
    <div className="bg-white border-[0.5px] border-border rounded-[10px] overflow-hidden cursor-pointer hover:border-orange transition-colors flex flex-col h-full">
      <div className="bg-bg h-[110px] flex items-center justify-center relative shrink-0">
        {getCatIcon(p.cat, "w-10 h-10 text-navy2/20")}
        {p.badge === 'hot' && <span className="absolute top-[7px] left-[7px] text-[9px] font-medium px-[6px] py-[2px] rounded-[4px] text-white bg-orange">Hot</span>}
        {p.badge === 'new' && <span className="absolute top-[7px] left-[7px] text-[9px] font-medium px-[6px] py-[2px] rounded-[4px] text-white bg-[#1D9E75]">New</span>}
      </div>
      <div className="p-[10px] flex flex-col flex-1">
        <div className="text-[9px] font-medium text-orange uppercase tracking-[0.5px] mb-[3px]">{p.brand}</div>
        <div className="text-[12px] font-medium text-navy leading-[1.35] mb-[4px]">{p.name}</div>
        <div className="text-[10px] text-muted mb-[8px] leading-[1.4] flex-1">{p.spec}</div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="text-[13px] font-medium text-navy">{formatLKR(p.price)}</div>
            <div className="text-[9px] text-muted font-normal">LKR incl. taxes</div>
          </div>
          <button onClick={() => addToCart(p)} className="bg-navy text-white border-none w-[26px] h-[26px] rounded-[6px] cursor-pointer flex items-center justify-center shrink-0 hover:bg-orange transition-colors">
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-bg font-sans text-[14px] text-[#0D1B3E] min-h-[700px] relative overflow-hidden">
      
      {/* NAVBAR */}
      <nav className="bg-navy h-[52px] flex items-center justify-between px-5 sticky top-0 z-40">
        <div className="text-white text-[17px] font-medium tracking-[0.3px]">Fortt<em className="text-orange not-italic">une</em></div>
        <div className="flex gap-5 hidden sm:flex">
          {['home', 'products', 'contact'].map(p => (
            <button key={p} onClick={() => setPage(p)} className={`text-[12px] capitalize transition-colors ${page === p ? 'text-white' : 'text-white/65 hover:text-white'}`}>
              {p}
            </button>
          ))}
        </div>
        <button onClick={() => setIsCartOpen(true)} className="bg-orange border-none text-white px-[13px] py-[6px] rounded-[6px] text-[12px] cursor-pointer flex items-center gap-[5px]">
          <ShoppingCart size={14} />
          Cart ({cartCount})
        </button>
      </nav>

      {/* MOBILE NAV (Bottom) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around p-3 z-30">
        {['home', 'products', 'contact'].map(p => (
          <button key={p} onClick={() => setPage(p)} className={`text-[11px] font-medium capitalize flex flex-col items-center gap-1 ${page === p ? 'text-orange' : 'text-muted'}`}>
             {p === 'home' ? <Store size={18}/> : p === 'products' ? <Package size={18}/> : <Phone size={18}/>}
            {p}
          </button>
        ))}
      </div>

      <div className="pb-16 sm:pb-0">
        {/* PAGE: HOME */}
        {page === 'home' && (
          <div className="block">
            <div className="bg-navy pt-[36px] px-5 pb-[30px] relative overflow-hidden">
              <div className="absolute -right-[40px] -top-[40px] w-[240px] h-[240px] rounded-full bg-orange/10 pointer-events-none"></div>
              <div className="inline-block bg-orange/15 text-orange2 text-[10px] font-medium tracking-[0.8px] uppercase px-[9px] py-[3px] rounded-[4px] mb-[12px]">Sri Lanka's IT hardware distributor</div>
              <h1 className="text-white text-[24px] font-medium leading-[1.3] max-w-[380px] mb-[10px]">Premium tech,<br/>delivered to your <em className="text-orange not-italic">door.</em></h1>
              <p className="text-white/55 text-[13px] max-w-[340px] leading-[1.65] mb-[20px]">Laptops, servers, networking and peripherals from 15+ global brands. Trusted by 500+ channel partners across Sri Lanka.</p>
              <div className="flex gap-[8px] flex-wrap relative z-10">
                <button onClick={() => setPage('products')} className="bg-orange text-white border-none px-[18px] py-[9px] rounded-[6px] text-[12px] font-medium cursor-pointer">Browse products</button>
                <button onClick={() => setPage('contact')} className="bg-transparent text-white border border-white/30 px-[18px] py-[9px] rounded-[6px] text-[12px] cursor-pointer">Request a quote</button>
              </div>
              <div className="flex gap-5 mt-[26px] pt-[20px] border-t border-white/10 overflow-x-auto whitespace-nowrap hide-scrollbar">
                <div><div className="text-white text-[18px] font-medium">500+</div><div className="text-white/45 text-[10px] mt-[2px]">Channel partners</div></div>
                <div><div className="text-white text-[18px] font-medium">15+</div><div className="text-white/45 text-[10px] mt-[2px]">Global brands</div></div>
                <div><div className="text-white text-[18px] font-medium">10k+</div><div className="text-white/45 text-[10px] mt-[2px]">Products</div></div>
                <div><div className="text-white text-[18px] font-medium">20+</div><div className="text-white/45 text-[10px] mt-[2px]">Years experience</div></div>
              </div>
            </div>

            <div className="bg-white border-b-[0.5px] border-border py-[10px] px-5 flex gap-5 overflow-x-auto hide-scrollbar">
              <div className="flex items-center gap-[7px] whitespace-nowrap"><Truck size={15} className="text-orange"/><span className="text-[11px] text-muted font-medium">Island-wide delivery</span></div>
              <div className="flex items-center gap-[7px] whitespace-nowrap"><Award size={15} className="text-orange"/><span className="text-[11px] text-muted font-medium">Trusted warranty</span></div>
              <div className="flex items-center gap-[7px] whitespace-nowrap"><HeadphonesIcon size={15} className="text-orange"/><span className="text-[11px] text-muted font-medium">After-sales service</span></div>
              <div className="flex items-center gap-[7px] whitespace-nowrap"><ShieldCheck size={15} className="text-orange"/><span className="text-[11px] text-muted font-medium">Secure checkout</span></div>
              <div className="flex items-center gap-[7px] whitespace-nowrap"><Store size={15} className="text-orange"/><span className="text-[11px] text-muted font-medium">Click & collect</span></div>
            </div>

            <div className="bg-white border-b-[0.5px] border-border py-[9px] px-5 flex items-center gap-[10px] overflow-x-auto hide-scrollbar">
              <span className="text-[10px] text-muted uppercase tracking-[0.7px] whitespace-nowrap font-medium">Brands</span>
              {['HP','Dell','Lenovo','Asus','Acer','MSI','Epson','Brother','D-Link','Transcend','Lexar','Tiandy'].map(b => (
                <span key={b} className="bg-bg border-[0.5px] border-border text-navy2 text-[11px] font-medium px-[11px] py-[4px] rounded-[14px] whitespace-nowrap cursor-pointer hover:bg-navy hover:text-white hover:border-navy transition-colors">{b}</span>
              ))}
            </div>

            <div className="p-[18px] px-5 max-w-7xl mx-auto">
              <div className="text-[10px] font-medium text-orange uppercase tracking-[0.8px] mb-[4px]">Shop by category</div>
              <div className="flex items-center justify-between mb-[14px]">
                <div className="text-[15px] font-medium text-navy m-0">Categories</div>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-[8px] mb-[20px]">
                {CATEGORIES.filter(c=>c!=='All').map(cat => (
                  <div key={cat} onClick={() => handleCategoryClick(cat)} className="bg-white border-[0.5px] border-border rounded-[10px] py-[14px] px-[8px] text-center cursor-pointer hover:border-orange transition-colors flex flex-col items-center">
                    {getCatIcon(cat, "text-navy2/45 mb-[6px] w-[22px] h-[22px]")}
                    <span className="text-[11px] font-medium text-navy">{cat}</span>
                  </div>
                ))}
              </div>

              <div className="text-[10px] font-medium text-orange uppercase tracking-[0.8px] mb-[4px]">Featured products</div>
              <div className="flex items-center justify-between mb-[14px]">
                <div className="text-[15px] font-medium text-navy m-0">Hot picks</div>
                <span onClick={() => setPage('products')} className="text-[11px] text-orange cursor-pointer hover:underline">View all →</span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(155px,1fr))] gap-[10px]">
                {PRODS.filter(p => p.badge).slice(0,6).map(p => <ProductCard key={p.id} p={p} />)}
              </div>

              <div className="mt-[18px]">
                <div className="bg-navy rounded-[10px] py-[18px] px-5 flex items-center justify-between gap-[14px] flex-wrap mb-[6px]">
                  <div>
                    <div className="text-[9px] text-orange2 font-medium uppercase tracking-[0.7px] mb-[4px]">Click & collect</div>
                    <div className="text-white text-[14px] font-medium mb-[3px]">Order online, pick up in-store.</div>
                    <div className="text-white/45 text-[11px] max-w-[400px]">Buy securely online. Collect from our Mount Lavinia showroom — zero delivery wait.</div>
                  </div>
                  <button onClick={() => setPage('products')} className="bg-orange text-white border-none px-[18px] py-[9px] rounded-[6px] text-[12px] font-medium cursor-pointer">Shop now</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE: PRODUCTS */}
        {page === 'products' && (
          <div className="p-[16px] px-5 max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-[10px] mb-[12px] flex-wrap">
              <div className="text-[15px] font-medium text-navy">All products</div>
              <div className="flex items-center gap-[6px] bg-white border-[0.5px] border-border rounded-[7px] py-[7px] px-[11px] flex-1 max-w-[260px]">
                <Search size={15} className="text-muted" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-none outline-none text-[12px] bg-transparent w-full text-navy placeholder:text-muted"
                />
              </div>
            </div>
            <div className="flex gap-[7px] flex-wrap mb-[14px]">
              {CATEGORIES.map(cat => (
                <div 
                  key={cat} 
                  onClick={() => setActiveCat(cat)}
                  className={`border-[0.5px] text-[11px] px-[11px] py-[4px] rounded-[14px] cursor-pointer transition-colors ${activeCat === cat ? 'bg-navy text-white border-navy' : 'bg-white text-muted border-border'}`}
                >
                  {cat}
                </div>
              ))}
            </div>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(155px,1fr))] gap-[10px]">
                {filteredProducts.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            ) : (
              <div className="text-muted text-[13px] py-5">No products found.</div>
            )}
          </div>
        )}

        {/* PAGE: CONTACT */}
        {page === 'contact' && (
          <div className="p-[18px] px-5 max-w-7xl mx-auto">
            <div className="text-[10px] font-medium text-orange uppercase tracking-[0.8px] mb-[4px]">Get in touch</div>
            <div className="text-[15px] font-medium text-navy mb-[14px]">Contact Forttune Channels</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] max-w-[660px]">
              <div className="bg-white border-[0.5px] border-border rounded-[10px] p-[18px]">
                <h3 className="text-[13px] font-medium text-navy mb-[12px] flex items-center gap-[7px]"><MapPin size={15} className="text-orange"/>Our showroom</h3>
                <div className="flex gap-[9px] mb-[10px]"><MapPin size={14} className="text-orange mt-[2px] shrink-0"/><div><div className="text-[10px] text-muted">Address</div><div className="text-[12px] font-medium text-navy">No. 312, Galle Road, Mount Lavinia</div></div></div>
                <div className="flex gap-[9px] mb-[10px]"><Phone size={14} className="text-orange mt-[2px] shrink-0"/><div><div className="text-[10px] text-muted">General</div><div className="text-[12px] font-medium text-navy">+94 112 638 538</div></div></div>
                <div className="flex gap-[9px] mb-[10px]"><MessageCircle size={14} className="text-orange mt-[2px] shrink-0"/><div><div className="text-[10px] text-muted">Hotline / WhatsApp</div><div className="text-[12px] font-medium text-navy">+94 725 516 516</div></div></div>
                <div className="flex gap-[9px] mb-[10px]"><Mail size={14} className="text-orange mt-[2px] shrink-0"/><div><div className="text-[10px] text-muted">Email</div><div className="text-[12px] font-medium text-navy">info@forttune.lk</div></div></div>
                <div className="flex gap-[9px] mb-[10px]"><Clock size={14} className="text-orange mt-[2px] shrink-0"/><div><div className="text-[10px] text-muted">Hours</div><div className="text-[12px] font-medium text-navy">Mon–Fri, 9am–5pm</div></div></div>
                <div className="mt-[12px] bg-bg rounded-[7px] p-[10px] text-[11px] text-muted flex gap-[7px] items-start">
                  <Package size={14} className="text-orange mt-[1px] shrink-0"/>
                  <span>Click & Collect available — order online, collect from our showroom same day.</span>
                </div>
              </div>
              <div className="bg-white border-[0.5px] border-border rounded-[10px] p-[18px]">
                <h3 className="text-[13px] font-medium text-navy mb-[12px] flex items-center gap-[7px]"><MessageCircle size={15} className="text-orange"/>Send a message</h3>
                <div className="mb-[10px]"><label className="text-[10px] text-muted block mb-[3px] uppercase tracking-[0.5px]">Your name</label><input type="text" placeholder="Full name" className="w-full bg-bg border-[0.5px] border-border rounded-[6px] py-[7px] px-[9px] text-[12px] text-navy outline-none" /></div>
                <div className="mb-[10px]"><label className="text-[10px] text-muted block mb-[3px] uppercase tracking-[0.5px]">Email</label><input type="email" placeholder="you@company.lk" className="w-full bg-bg border-[0.5px] border-border rounded-[6px] py-[7px] px-[9px] text-[12px] text-navy outline-none" /></div>
                <div className="mb-[10px]"><label className="text-[10px] text-muted block mb-[3px] uppercase tracking-[0.5px]">Subject</label>
                  <select className="w-full bg-bg border-[0.5px] border-border rounded-[6px] py-[7px] px-[9px] text-[12px] text-navy outline-none">
                    <option>Product inquiry</option>
                    <option>Dealer / reseller network</option>
                    <option>Bulk / corporate pricing</option>
                    <option>Technical support</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="mb-[10px]"><label className="text-[10px] text-muted block mb-[3px] uppercase tracking-[0.5px]">Message</label><textarea placeholder="How can we help?" className="w-full bg-bg border-[0.5px] border-border rounded-[6px] py-[7px] px-[9px] text-[12px] text-navy outline-none h-[70px] resize-none"></textarea></div>
                <button onClick={() => showToast('Message sent! We\'ll reply within 24 hrs.')} className="bg-orange text-white border-none py-[9px] px-[16px] rounded-[6px] text-[12px] font-medium cursor-pointer w-full hover:bg-orange2 transition-colors">Send message</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CART OVERLAY */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={(e) => { if(e.target === e.currentTarget) setIsCartOpen(false) }}>
          <div className="w-[290px] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-[14px] px-[18px] border-b-[0.5px] border-border flex items-center justify-between">
              <h3 className="text-[14px] font-medium text-navy m-0">Cart ({cartCount})</h3>
              <button onClick={() => setIsCartOpen(false)} className="bg-none border-none cursor-pointer text-muted hover:text-navy"><X size={17} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-[14px] px-[18px]">
              {cart.length === 0 ? (
                <div className="text-center py-8 px-4 text-muted text-[12px]">
                  <ShoppingCart size={28} className="mx-auto mb-[8px] opacity-25" />
                  Your cart is empty
                </div>
              ) : (
                cart.map((x, i) => (
                  <div key={i} className="flex gap-[9px] mb-[12px] pb-[12px] border-b-[0.5px] border-border">
                    <div className="bg-bg rounded-[6px] w-[42px] h-[42px] flex items-center justify-center shrink-0">
                      {getCatIcon(x.cat, "w-[18px] h-[18px] text-navy2/35")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-navy mb-[2px] leading-tight">{x.name}</div>
                      <div className="text-[11px] text-orange font-medium">{formatLKR(x.price * x.qty)}{x.qty > 1 ? ` (×${x.qty})` : ''}</div>
                    </div>
                    <button onClick={() => removeFromCart(x.id)} className="bg-none border-none text-muted cursor-pointer hover:text-red-500 self-start ml-auto"><X size={13} /></button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-[14px] px-[18px] border-t-[0.5px] border-border bg-gray-50">
                <div className="flex justify-between text-[13px] font-medium text-navy mb-[10px]">
                  <span>Total</span>
                  <span>{formatLKR(cartTotal)}</span>
                </div>
                <button onClick={() => showToast('Checkout via PayHere / WebXPay — coming in Phase 3!')} className="bg-orange text-white border-none p-[10px] rounded-[7px] text-[13px] font-medium cursor-pointer w-full hover:bg-orange2 transition-colors">Proceed to checkout</button>
                <div className="text-[10px] text-muted text-center mt-[7px] flex items-center justify-center gap-[4px]">
                  <ShieldCheck size={12} /> Secure · PayHere · WebXPay
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 bg-navy text-white py-[9px] px-[14px] rounded-[7px] text-[12px] z-[100] shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-200">
          {toastMsg}
        </div>
      )}

    </div>
  );
}