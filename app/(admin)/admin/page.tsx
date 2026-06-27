"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, TrendingUp, AlertCircle, Users, X, Edit2, Trash2, Upload, Mail, Calendar, ShoppingBag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', brand: '', category: 'Laptops', price: '', stock: '', sku: '', spec: '', badge: '', image: ''
  });

  // ── Fix #15: Auth guard — only ADMIN role may access this page ────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('forttune_user');
      if (!stored) { router.replace('/login'); return; }
      const user = JSON.parse(stored);
      if (user.role !== 'ADMIN') { router.replace('/'); return; }
      setAdminUser(user);
    } catch {
      router.replace('/login');
    } finally {
      setAuthChecked(true);
    }
  }, []);

  const fetchInventory = async () => {
    try {
      // Admin needs to see ALL products including archived — use a dedicated param
      const res = await fetch('/api/products?admin=1');
      const data = await res.json();
      
      if (res.ok && Array.isArray(data)) {
        setProducts(data);
        setApiError(null);
      } else {
        setApiError(data.error || "Failed to parse product array from server.");
        setProducts([]);
      }
    } catch (err) {
      console.error(err);
      setApiError("Could not reach backend database stream.");
      setProducts([]);
    }
  };

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    setCustomersError(null);
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomersError(data.error || "Failed to load customers.");
        setCustomers([]);
      }
    } catch {
      setCustomersError("Could not reach the server.");
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  };

  const fetchAllOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/orders/all');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setAllOrders(data);
    } catch {}
    finally { setOrdersLoading(false); }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (activeTab === "customers") fetchCustomers();
    if (activeTab === "orders" || activeTab === "overview") fetchAllOrders();
  }, [activeTab]);

  // Converts a device file into a Base64 string for direct database storage
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', brand: '', category: 'Laptops', price: '', stock: '', sku: '', spec: '', badge: '', image: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand || '',
      category: product.category || 'Laptops',
      price: product.price.toString(),
      stock: product.stock.toString(),
      sku: product.sku || '',
      spec: product.spec || '',
      badge: product.badge || '',
      image: product.image || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const url = editingProduct ? `/api/products?id=${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchInventory();
        alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
      } else {
        alert('Action failed.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchInventory();
        alert('Product removed successfully!');
      } else {
        alert('Failed to delete product.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── Fix #12: Derive real 7-day revenue from allOrders ────────────────────
  const now = new Date();
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const salesData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const dayStr = DAY_NAMES[d.getDay()];
    const revenue = allOrders
      .filter(o => {
        const od = new Date(o.createdAt);
        return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth() && od.getDate() === d.getDate();
      })
      .reduce((sum, o) => sum + (o.total || 0), 0);
    return { name: dayStr, revenue };
  });

  const totalRevenue = allOrders
    .filter(o => {
      const d = new Date(o.createdAt);
      return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
    })
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const weekOrderCount = allOrders.filter(o => {
    const d = new Date(o.createdAt);
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const validProductList = Array.isArray(products) ? products : [];
  
  // Frontend Safety Filter: keeps soft-deleted entries out of the inventory table
  const activeProducts = validProductList.filter(p => p && p.badge !== 'archived_hidden');
  const lowStockItems = activeProducts.filter(p => typeof p.stock === 'number' && p.stock < 5).length;

  // Fix #15: Block render until auth is verified
  if (!authChecked) return (
    <div className="flex h-screen items-center justify-center bg-[#F5F6FA]">
      <div className="w-8 h-8 border-2 border-[#E85D26] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!adminUser) return null;

  // Fix #13: Admin name/initials derived from session
  const adminName = adminUser.name || adminUser.email || 'Admin';
  const adminInitials = adminName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

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
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-[#E85D26]/10 text-[#E85D26]' : 'text-[#6B7A99] hover:bg-gray-50 hover:text-[#0D1B3E]'}`}>
            <ShoppingCart size={18} /> Orders
          </button>
          <button onClick={() => setActiveTab('customers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'customers' ? 'bg-[#E85D26]/10 text-[#E85D26]' : 'text-[#6B7A99] hover:bg-gray-50 hover:text-[#0D1B3E]'}`}>
            <Users size={18} /> Customers {customers.length > 0 && <span className="ml-auto bg-[#0D1B3E]/10 text-[#0D1B3E] py-0.5 px-2 rounded-full text-[10px]">{customers.length}</span>}
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-[70px] bg-white border-b border-[#0D1B3E]/10 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-semibold capitalize">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-[#6B7A99]">Welcome, {adminName.split(' ')[0]}</div>
            <div className="w-9 h-9 rounded-full bg-[#0D1B3E] text-white flex items-center justify-center font-semibold text-sm">{adminInitials}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
              <AlertCircle size={18} />
              <div><strong>Database Error:</strong> {apiError}</div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl">
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
                  <div className="text-2xl font-bold text-[#0D1B3E]">{weekOrderCount}</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-[#0D1B3E]/10 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><AlertCircle size={20} /></div>
                  </div>
                  <div className="text-[#6B7A99] text-sm font-medium mb-1">Low Stock Alerts</div>
                  <div className="text-2xl font-bold text-red-600">{lowStockItems} Items</div>
                </div>
              </div>

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
                <button onClick={openAddModal} className="bg-[#0D1B3E] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1A2F5E] transition-colors">+ Add Product</button>
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
                      <th className="font-medium p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-[#6B7A99]">No products found.</td>
                      </tr>
                    ) : (
                      activeProducts.map((product) => product && (
                        <tr key={product.id} className="border-b last:border-0 border-[#0D1B3E]/5 hover:bg-gray-50/50">
                          <td className="p-4 pl-6 text-[#6B7A99] font-mono text-xs">{product.sku || 'N/A'}</td>
                          <td className="p-4 font-medium text-[#0D1B3E]">{product.name}</td>
                          <td className="p-4">
                            <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium">{product.category}</span>
                          </td>
                          <td className="p-4 text-[#0D1B3E] font-medium">Rs {(product.price || 0).toLocaleString('en-LK')}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${(product.stock || 0) < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{product.stock || 0} units</span>
                          </td>
                          <td className="p-4 text-right pr-6 space-x-2 whitespace-nowrap">
                            <button onClick={() => openEditModal(product)} className="text-gray-500 hover:text-blue-600 p-1 transition-colors"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteProduct(product.id, product.name)} className="text-gray-500 hover:text-red-600 p-1 transition-colors"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div className="flex-1 overflow-auto p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#0D1B3E]">Registered Customers</h2>
                  <p className="text-sm text-[#6B7A99] mt-0.5">All accounts created via the website</p>
                </div>
                <a href="/register" target="_blank" className="text-sm text-[#E85D26] font-medium hover:underline">+ Register page</a>
              </div>

              {customersError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
                  <AlertCircle size={16} /> {customersError}
                </div>
              )}

              {customersLoading ? (
                <div className="flex items-center justify-center py-16 text-[#6B7A99]">
                  <div className="animate-spin w-6 h-6 border-2 border-[#E85D26] border-t-transparent rounded-full mr-3"></div>
                  Loading customers…
                </div>
              ) : customers.length === 0 && !customersError ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Users size={40} className="text-[#6B7A99]/40 mb-3" />
                  <p className="text-[#0D1B3E] font-medium">No customers yet</p>
                  <p className="text-sm text-[#6B7A99] mt-1">Customers will appear here once they register on your site.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#0D1B3E]/10 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#0D1B3E]/10 bg-[#F5F6FA]">
                        <th className="text-left p-4 pl-6 text-xs font-semibold text-[#6B7A99] uppercase tracking-wide">Customer</th>
                        <th className="text-left p-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wide">Email</th>
                        <th className="text-left p-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wide">Orders</th>
                        <th className="text-left p-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wide">Total Spent</th>
                        <th className="text-left p-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wide">Last Order</th>
                        <th className="text-left p-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wide">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(c => (
                        <tr key={c.id} className="border-b last:border-0 border-[#0D1B3E]/5 hover:bg-gray-50/50">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#0D1B3E] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                                {(c.name || c.email || '?').charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-[#0D1B3E]">{c.name || <span className="text-[#6B7A99] italic">No name</span>}</span>
                            </div>
                          </td>
                          <td className="p-4 text-[#6B7A99]">
                            <div className="flex items-center gap-1.5">
                              <Mail size={13} className="shrink-0" />
                              {c.email || 'N/A'}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-[#0D1B3E]">
                              <ShoppingBag size={13} className="text-[#6B7A99] shrink-0" />
                              {c.totalOrders}
                            </div>
                          </td>
                          <td className="p-4 font-medium text-[#0D1B3E]">
                            {c.totalSpent > 0 ? `Rs ${c.totalSpent.toLocaleString('en-LK')}` : <span className="text-[#6B7A99]">—</span>}
                          </td>
                          <td className="p-4 text-[#6B7A99]">
                            {c.lastOrderDate
                              ? new Date(c.lastOrderDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '—'}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-[#6B7A99]">
                              <Calendar size={13} className="shrink-0" />
                              {new Date(c.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── ORDERS TAB (Fix #11) ── */}
          {activeTab === 'orders' && (
            <div className="max-w-7xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#0D1B3E]">All Orders</h2>
                  <p className="text-sm text-[#6B7A99] mt-0.5">Web and POS orders across all customers</p>
                </div>
              </div>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-20 text-[#6B7A99]">
                  <div className="animate-spin w-6 h-6 border-2 border-[#E85D26] border-t-transparent rounded-full mr-3"></div>
                  Loading orders…
                </div>
              ) : allOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ShoppingCart size={40} className="text-[#6B7A99]/40 mb-3" />
                  <p className="text-[#0D1B3E] font-medium">No orders yet</p>
                  <p className="text-sm text-[#6B7A99] mt-1">Orders placed via web or POS will appear here.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#0D1B3E]/10 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#0D1B3E]/10 bg-[#F5F6FA]">
                        <th className="text-left p-4 pl-6 text-xs font-semibold text-[#6B7A99] uppercase tracking-wide">Order ID</th>
                        <th className="text-left p-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wide">Customer</th>
                        <th className="text-left p-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wide">Channel</th>
                        <th className="text-left p-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wide">Payment</th>
                        <th className="text-left p-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wide">Status</th>
                        <th className="text-left p-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wide">Total</th>
                        <th className="text-left p-4 text-xs font-semibold text-[#6B7A99] uppercase tracking-wide">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allOrders.map((o: any) => (
                        <tr key={o.id} className="border-b last:border-0 border-[#0D1B3E]/5 hover:bg-gray-50/50">
                          <td className="p-4 pl-6 font-mono text-xs text-[#6B7A99]">#{o.id.slice(-8).toUpperCase()}</td>
                          <td className="p-4 text-[#0D1B3E] font-medium">{o.user?.name || o.user?.email || <span className="text-[#6B7A99] italic">Walk-in</span>}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${o.isPosOrder ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                              {o.isPosOrder ? 'POS' : 'Web'}
                            </span>
                          </td>
                          <td className="p-4 text-[#6B7A99] text-xs">{o.paymentMethod}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              o.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              o.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>{o.status}</span>
                          </td>
                          <td className="p-4 font-semibold text-[#0D1B3E]">Rs {o.total?.toLocaleString('en-LK')}</td>
                          <td className="p-4 text-[#6B7A99] text-xs">
                            {new Date(o.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* FORM MODAL WITH DEVICE FILE UPLOADER */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0D1B3E]/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[#0D1B3E]/10 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-[#0D1B3E]">{editingProduct ? 'Edit Product Parameters' : 'Add New Product'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B7A99] hover:text-[#E85D26] transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wide mb-1.5">Product Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-[#0D1B3E]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D26]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wide mb-1.5">Brand</label>
                  <input required type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full border border-[#0D1B3E]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D26]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wide mb-1.5">Category</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-[#0D1B3E]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D26]">
                    <option>Laptops</option><option>Desktops</option><option>Monitors</option><option>Networking</option><option>Printers</option><option>Storage</option><option>Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wide mb-1.5">Price (LKR)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-[#0D1B3E]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D26]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wide mb-1.5">Stock Quantity</label>
                  <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full border border-[#0D1B3E]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D26]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wide mb-1.5">SKU (Barcode)</label>
                  <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full border border-[#0D1B3E]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D26]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wide mb-1.5">Short Specs</label>
                  <input type="text" value={formData.spec} onChange={e => setFormData({...formData, spec: e.target.value})} className="w-full border border-[#0D1B3E]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D26]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wide mb-1.5">Badge Condition</label>
                  <select value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} className="w-full border border-[#0D1B3E]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E85D26]">
                    <option value="">None</option><option value="new">Force New Badge</option><option value="hot">Force Hot Badge</option>
                  </select>
                </div>

                {/* DEVICE FILE UPLOADER COMPONENT */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#6B7A99] uppercase tracking-wide mb-1.5">Upload Product Image</label>
                  <div className="flex items-center gap-4 border border-dashed border-[#0D1B3E]/30 rounded-lg p-4 bg-[#F5F6FA]">
                    <label className="cursor-pointer bg-[#0D1B3E] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#1A2F5E] flex items-center gap-2 transition-colors">
                      <Upload size={14} /> Choose File
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    <div className="text-xs text-[#6B7A99] flex-1 truncate">
                      {formData.image ? "Image attached from device successfully!" : "No file selected"}
                    </div>
                    {formData.image && (
                      <img src={formData.image} alt="Preview" className="w-12 h-12 rounded object-cover border border-[#0D1B3E]/10 bg-white" />
                    )}
                  </div>
                </div>

              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-[#6B7A99] hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-[#E85D26] hover:bg-[#F47A4A] rounded-lg disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}