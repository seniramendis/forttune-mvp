import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastReload } from './stream/route';

export const dynamic = 'force-dynamic';

// 1. GET ALL PRODUCTS — excludes soft-deleted (archived_hidden) unless ?admin=1
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === '1';

    const products = await prisma.product.findMany({
      where: isAdmin ? undefined : { badge: { not: 'archived_hidden' } },
      orderBy: { createdAt: 'desc' }
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
        badge: body.badge === 'archived_hidden' ? null : body.badge, // Clear out if custom reset triggered
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

// 4. ARCHIVE TO HIDE WITHOUT INTERFERING WITH CLIENT MUTATIONS
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Set standard soft status property safely
    await prisma.product.update({
      where: { id },
      data: { badge: 'archived_hidden' }
    });

    broadcastReload();
    return NextResponse.json({ success: true, message: 'Product hidden smoothly' });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}