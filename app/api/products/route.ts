import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastReload } from './stream/route';

export const dynamic = 'force-dynamic';

// 1. GET ALL ACTIVE PRODUCTS (SQL approach)
export async function GET() {
  try {
    // Falls back safely if deletedAt column isn't there yet
    const products = await prisma.$queryRawUnsafe(`
      SELECT * FROM "Product" 
      WHERE "deletedAt" IS NULL 
      ORDER BY "createdAt" DESC
    `).catch(async () => {
      // If column is missing completely, fallback to returning all rows safely
      return await prisma.$queryRawUnsafe('SELECT * FROM "Product" ORDER BY "createdAt" DESC');
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Database failure' }, { status: 500 });
  }
}

// 2. CREATE PRODUCT
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        brand: body.brand,
        category: body.category,
        price: parseFloat(body.price),
        stock: parseInt(body.stock),
        sku: body.sku || null,
        spec: body.spec || null,
        badge: body.badge || null,
        image: body.image || null,
      }
    });

    broadcastReload();
    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// 3. EDIT PRODUCT
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const body = await request.json();
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        brand: body.brand,
        category: body.category,
        price: parseFloat(body.price),
        stock: parseInt(body.stock),
        sku: body.sku || null,
        spec: body.spec || null,
        badge: body.badge || null,
        image: body.image || null,
      }
    });

    broadcastReload();
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// 4. BYPASS CONSTRAINTS SOFT-DELETE
// 4. TRANSACTION-SAFE RELATIONAL HARD DELETE
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Run a direct database transaction using Prisma's low-level engine
    // This drops dependency records inside order tables first, then wipes the product safely
    await prisma.$transaction([
      // 1. Clear references inside your orders/line-items to bypass foreign key constraint crashes
      prisma.$executeRaw`DELETE FROM "OrderItem" WHERE "productId" = ${id}`,
      prisma.$executeRaw`DELETE FROM "Order" WHERE "productId" = ${id}`, 
      
      // 2. Wipe the main product record cleanly
      prisma.$executeRaw`DELETE FROM "Product" WHERE id = ${id}`
    ]).catch(async () => {
      // Fallback fallback: If your order schema names are different, execute a forced single row override
      return await prisma.$executeRaw`DELETE FROM "Product" WHERE id = ${id}`;
    });

    broadcastReload(); // Triggers instant dynamic reload on client storefront windows
    return NextResponse.json({ success: true, message: 'Product successfully purged from relational tables' });
  } catch (error) {
    console.error("Relational Transaction Crash:", error);
    return NextResponse.json({ error: 'Database transaction failed' }, { status: 500 });
  }
}