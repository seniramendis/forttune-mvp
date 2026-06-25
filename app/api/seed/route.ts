import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 

export async function GET() {
  try {
    const products = [
      { name: 'HP Elitebook 8 G1i 14 Ultra 7', brand: 'HP', category: 'Laptops', price: 503000, spec: 'Ultra 7 14th Gen', badge: 'hot', stock: 12, sku: '849302' },
      { name: 'Monitor MSI G32C4X 31.5"', brand: 'MSI', category: 'Monitors', price: 106000, spec: 'FHD 250Hz Curved', badge: 'hot', stock: 5, sku: '739201' },
      { name: 'D-Link DGS-F1026P-E Switch', brand: 'D-Link', category: 'Networking', price: 94500, spec: '24GE PoE', badge: '', stock: 8, sku: '492011' },
      { name: 'Lexar SSD NM610 512GB', brand: 'Lexar', category: 'Storage', price: 12500, spec: 'M.2 NVMe', badge: '', stock: 45, sku: '583920' },
      { name: 'Brother PT-D610 Printer', brand: 'Brother', category: 'Printers', price: 116300, spec: 'Professional', badge: '', stock: 3, sku: '993822' },
      { name: 'Transcend 4TB Ext HDD', brand: 'Transcend', category: 'Storage', price: 43600, spec: 'USB 3.1', badge: '', stock: 24, sku: '103944' }
    ];

    // Wipe any empty/broken rows first to start fresh
    await prisma.product.deleteMany({});
    
    // Inject the new items directly into Supabase
    await prisma.product.createMany({
      data: products,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Database successfully seeded! Go refresh your Web and POS pages." 
    });
    
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed database", details: error }, { status: 500 });
  }
}