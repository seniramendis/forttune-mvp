"use client";

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingCart, TrendingUp, AlertCircle, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // We fetch products here for the inventory table
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  // Mock data for the chart MVP (You will replace this with live Order data later)
  const salesData = [
    { name: 'Mon', revenue: 450000 },
    { name: 'Tue', revenue: 820000 },
    { name: 'Wed', revenue: 310000 },
    { name: 'Thu', revenue: 1050000 },
    { name: 'Fri', revenue: 600000 },
    { name: 'Sat', revenue: 1200000 },
    { name: 'Sun', revenue: 400000 },
  ];

  const totalRevenue = salesData.reduce((acc, curr) => acc + curr.revenue, 0);
  const lowStockItems = products.filter(p => p.stock < 5).length;

  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] font-sans text-[#0D1B3E]">
      
      {/* SIDEBAR */}
      <div className="w-[260px] bg-white border-r border-[#0D1B3E]/10 flex flex-col shrink-0 z-10">
        <div className="h-[70px] flex items-center px-6 border-b border-[#0D1B3E]/10 shrink-0">
          <div className="w-8 h-8 bg-[#E85D26] rounded flex items-center justify-center font-bold text-white mr-3">F</div>
          <span className="font-semibold text-[16px] tracking-wide">Forttune Admin</span>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-[#E85D26]/10 text-[#E85D26]' : 'text-[#6B7A99] hover:bg-gray-50 hover:text-[#0D1B3E]'}`}>
            <LayoutDashboard size={18} /> Overview
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'inventory' ? 'bg-[#E85D26]/10 text-[#E85D26]' : 'text-[#6B7A99] hover:bg-gray-50 hover:text-[#0D1B3E]'}`}>
            <Package size={18} /> Inventory {lowStockItems > 0 && <span className="ml-auto bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-[10px]">{lowStockItems}</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#6B7A99] hover:bg-gray-50 hover:text-[#0D1B3E] transition-colors">
            <ShoppingCart size={18} /> Orders
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#6B7A99] hover:bg-gray-50 hover:text-[#0D1B3E] transition-colors">
            <Users size={18} /> Customers
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER */}
        <header className="h-[70px] bg-white border-b border-[#0D1B3E]/10 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-semibold capitalize">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-[#6B7A99]">Welcome, Senira</div>
            <div className="w-9 h-9 rounded-full bg-[#0D1B3E] text-white flex items-center justify-center font-semibold text-sm">SM</div>
          </div>
        </header>

        {/* CONTENT SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl">
              {/* STATS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border border-[#0D1B3E]/10 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><TrendingUp size={20} /></div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12.5%</span>
                  </div>
                  <div className="text-[#6B7A99] text-sm font-medium mb-1">7-Day Revenue</div>
                  <div className="text-2xl font-bold text-[#0D1B3E]">Rs {totalRevenue.toLocaleString('en-LK')}</div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-[#0D1B3E]/10 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><ShoppingCart size={20} /></div>
                  </div>
                  <div className="text-[#6B7A99] text-sm font-medium mb-1">Total Orders (Week)</div>
                  <div className="text-2xl font-bold text-[#0D1B3E]">142</div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-[#0D1B3E]/10 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><AlertCircle size={20} /></div>
                  </div>
                  <div className="text-[#6B7A99] text-sm font-medium mb-1">Low Stock Alerts</div>
                  <div className="text-2xl font-bold text-red-600">{lowStockItems} Items</div>
                </div>
              </div>

              {/* CHART AREA */}
              <div className="bg-white rounded-xl p-6 border border-[#0D1B3E]/10 shadow-sm">
                <h3 className="text-base font-semibold mb-6">Revenue Trend</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7A99', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7A99', fontSize: 12}} tickFormatter={(val) => `Rs ${(val/1000)}k`} />
                      <Tooltip cursor={{fill: '#F5F6FA'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="revenue" fill="#0D1B3E" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="bg-white rounded-xl border border-[#0D1B3E]/10 shadow-sm overflow-hidden max-w-7xl">
              <div className="p-5 border-b border-[#0D1B3E]/10 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-[15px]">Product Database</h3>
                <button className="bg-[#0D1B3E] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1A2F5E] transition-colors">
                  + Add Product
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white border-b border-[#0D1B3E]/10 text-[#6B7A99]">
                    <tr>
                      <th className="font-medium p-4 pl-6">SKU</th>
                      <th className="font-medium p-4">Product Name</th>
                      <th className="font-medium p-4">Category</th>
                      <th className="font-medium p-4">Price (LKR)</th>
                      <th className="font-medium p-4">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-[#6B7A99]">
                          No products in database. Add some directly via Prisma Studio!
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id} className="border-b last:border-0 border-[#0D1B3E]/5 hover:bg-gray-50/50">
                          <td className="p-4 pl-6 text-[#6B7A99] font-mono text-xs">{product.sku || 'N/A'}</td>
                          <td className="p-4 font-medium text-[#0D1B3E]">{product.name}</td>
                          <td className="p-4">
                            <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium">
                              {product.category}
                            </span>
                          </td>
                          <td className="p-4 text-[#0D1B3E] font-medium">Rs {product.price.toLocaleString('en-LK')}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {product.stock} units
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}