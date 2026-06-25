"use client";

import React, { useState, useEffect } from 'react';
import { Search, Barcode, Trash2, CreditCard, Banknote, LogOut, Plus, Minus } from 'lucide-react';

export default function PosTerminal() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [barcode, setBarcode] = useState('');

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

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = inventory.find(p => p.sku === barcode);
    if (product) {
      addToCart(product);
      setBarcode('');
    } else {
      alert('Product not found!');
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = cartTotal * 0.18; // Example 18% VAT
  const grandTotal = cartTotal + tax;

  const filteredInventory = inventory.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.includes(search))
  );

  return (
    <div className="flex h-screen w-full bg-[#0B0F19] text-slate-200 font-sans overflow-hidden">
      
      {/* LEFT PANEL: Products & Search */}
      <div className="flex-1 flex flex-col h-full border-r border-slate-800">
        
        {/* Top Bar */}
        <div className="h-[60px] bg-[#111827] flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">F</div>
            <span className="font-semibold text-lg tracking-wide">Forttune POS</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>Terminal 01</span>
            <span className="px-2 py-1 bg-slate-800 rounded-md text-slate-300">Cashier: Senira</span>
          </div>
        </div>

        {/* Search & Barcode */}
        <div className="p-4 flex gap-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search products by name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1F2937] border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <form onSubmit={handleBarcodeSubmit} className="relative w-64">
            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Scan Barcode (SKU)" 
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full bg-[#1F2937] border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </form>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 pt-0">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-slate-500">Loading inventory...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredInventory.map(product => (
                <div 
                  key={product.id} 
                  onClick={() => addToCart(product)}
                  className="bg-[#1F2937] border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-blue-500 hover:bg-[#273548] transition-all flex flex-col h-full"
                >
                  <div className="text-xs text-slate-500 mb-1">SKU: {product.sku || 'N/A'}</div>
                  <div className="font-medium text-sm mb-2 flex-1 leading-snug">{product.name}</div>
                  <div className="flex items-end justify-between mt-auto pt-3">
                    <div className="text-blue-400 font-semibold text-sm">Rs {product.price.toLocaleString('en-LK')}</div>
                    <div className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400">{product.stock} in stock</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Cart & Checkout */}
      <div className="w-[400px] bg-[#111827] flex flex-col h-full shrink-0 relative">
        
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Current Order</h2>
          <button onClick={() => setCart([])} className="text-slate-500 hover:text-red-400 transition-colors text-sm flex items-center gap-1">
            <Trash2 size={14} /> Clear
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
              <Barcode size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Scan an item or select from inventory</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className="bg-[#1F2937] rounded-lg p-3 flex flex-col gap-2 border border-slate-800">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium pr-4 leading-tight">{item.name}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-400 mt-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-slate-400">Rs {item.price.toLocaleString('en-LK')}</div>
                    <div className="flex items-center bg-[#111827] rounded-md border border-slate-700">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:text-blue-400"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1.5 hover:text-blue-400"><Plus size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Footer */}
        <div className="bg-[#1F2937] p-5 border-t border-slate-800">
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>Rs {cartTotal.toLocaleString('en-LK')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>VAT (18%)</span>
              <span>Rs {tax.toLocaleString('en-LK')}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-xl pt-2 border-t border-slate-700 mt-2">
              <span>Total</span>
              <span className="text-blue-400">Rs {grandTotal.toLocaleString('en-LK')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <button className="bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors border border-slate-600">
              <Banknote size={18} /> Cash
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors border border-slate-600">
              <CreditCard size={18} /> Card
            </button>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-lg font-bold text-sm tracking-wide transition-colors shadow-lg shadow-blue-900/20">
            COMPLETE ORDER
          </button>
        </div>

      </div>
    </div>
  );
}