import React from 'react';
import { Search, ShoppingCart, User, Menu, Monitor, Laptop, Server, HardDrive, ShieldCheck, Headphones } from 'lucide-react';

export default function ForttuneHome() {
  return (
    <div className="min-h-screen bg-brand-light font-sans text-gray-800">
      
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Area */}
            <div className="flex-shrink-0 flex items-center">
              <div className="text-3xl font-bold text-brand-blue tracking-tight">
                FORTTUNE
              </div>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  className="w-full bg-gray-100 border border-transparent rounded-full py-2.5 pl-5 pr-12 focus:bg-white focus:border-brand-blue focus:ring-0 transition-colors"
                  placeholder="Search for Laptops, Monitors, Servers..."
                />
                <button className="absolute right-0 top-0 mt-2 mr-4 text-gray-500 hover:text-brand-blue">
                  <Search size={20} />
                </button>
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-6">
              <button className="text-gray-600 hover:text-brand-blue transition flex items-center gap-2">
                <User size={24} />
                <span className="hidden lg:block text-sm font-medium">Account</span>
              </button>
              <button className="text-gray-600 hover:text-brand-green transition flex items-center gap-2 relative">
                <ShoppingCart size={24} />
                <span className="absolute -top-2 -right-2 bg-brand-green text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
                <span className="hidden lg:block text-sm font-medium">Cart</span>
              </button>
              <button className="md:hidden text-gray-600">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Secondary Nav / Categories */}
        <div className="hidden md:block bg-brand-blue">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 text-sm font-medium text-white/90 py-3">
              <a href="#" className="hover:text-white transition">Home</a>
              <a href="#" className="hover:text-white transition">Products</a>
              <a href="#" className="hover:text-white transition">Brands</a>
              <a href="#" className="hover:text-white transition">Services</a>
              <a href="#" className="hover:text-white transition">Dealer Network</a>
              <a href="#" className="hover:text-white transition">About Us</a>
            </nav>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Enterprise Technology</span>{' '}
                  <span className="block text-brand-blue">Provider in Sri Lanka</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  We specialize in PCs, Notebooks, Servers, Storages, and high-quality peripherals. Connecting multi-brands with hundreds of channel partners.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <a href="#" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-blue hover:bg-blue-800 md:py-4 md:text-lg transition">
                      Shop Now
                    </a>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a href="#" className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-brand-blue bg-white hover:bg-gray-50 md:py-4 md:text-lg transition">
                      Partner with Us
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-50 flex items-center justify-center">
          {/* Placeholder for Hero Graphic/Banner */}
          <div className="w-3/4 h-3/4 bg-gray-200 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
             [Insert Modern Tech Banner Here]
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 uppercase tracking-wide border-b-2 border-brand-green inline-block pb-2">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { name: 'Laptops', icon: Laptop },
            { name: 'Monitors', icon: Monitor },
            { name: 'Servers', icon: Server },
            { name: 'Storage', icon: HardDrive },
            { name: 'Accessories', icon: Headphones },
            { name: 'Security', icon: ShieldCheck },
          ].map((cat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center hover:shadow-md hover:border-brand-blue transition cursor-pointer group">
              <cat.icon size={40} className="text-gray-400 group-hover:text-brand-blue transition mb-4" />
              <span className="text-sm font-semibold text-gray-700 group-hover:text-brand-blue transition">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS (MVP Sample Data) */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 uppercase tracking-wide border-b-2 border-brand-green inline-block pb-2">
            Featured Laptops
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "HP Elitebook 8 G1i 14 Ultra 7", price: "Rs 503,000.00" },
              { title: "HP Probook 4 Intel® Ultra 7", price: "Rs 299,000.00" },
              { title: "Dell Inspiron 3530 - 13th Gen i3", price: "Rs 168,000.00" },
              { title: "Lenovo V15 G4 i5 13th Gen", price: "Rs 168,000.00" }
            ].map((product, i) => (
              <div key={i} className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="aspect-w-1 aspect-h-1 bg-gray-100 p-8 flex items-center justify-center">
                   {/* Product Image Placeholder */}
                  <Laptop size={80} className="text-gray-300 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-5">
                  <h3 className="text-sm text-gray-700 font-medium line-clamp-2 h-10 mb-2">
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold text-brand-blue">{product.price}</span>
                  </div>
                  <button className="w-full mt-4 bg-gray-50 text-brand-blue border border-brand-blue/20 font-medium py-2 rounded hover:bg-brand-blue hover:text-white transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION / FOOTER PREVIEW */}
      <section className="bg-brand-blue py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-white text-center">
          <div>
            <div className="mx-auto bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck size={28} />
            </div>
            <h4 className="font-semibold text-lg">Trusted Warranty</h4>
            <p className="text-sm text-white/70 mt-2">Official brand warranties on all enterprise hardware.</p>
          </div>
          <div>
            <div className="mx-auto bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Search size={28} /> {/* Using Search icon as placeholder for shipping truck */}
            </div>
            <h4 className="font-semibold text-lg">Island Wide Delivery</h4>
            <p className="text-sm text-white/70 mt-2">Fast, secure shipping across Sri Lanka.</p>
          </div>
          <div>
            <div className="mx-auto bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Headphones size={28} />
            </div>
            <h4 className="font-semibold text-lg">After Sales Service</h4>
            <p className="text-sm text-white/70 mt-2">Dedicated tech support team for all clients.</p>
          </div>
        </div>
      </section>
      
    </div>
  );
}