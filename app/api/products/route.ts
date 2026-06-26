import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastReload } from './stream/route';

export const dynamic = 'force-dynamic';

// 1. GET ALL ACTIVE PRODUCTS (Filters out items marked with our hidden delete badge)
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        NOT: {
          badge: 'archived_hidden'
        }
      },
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
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// 3. EDIT PRODUCT
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });

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
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// 4. BULLETPROOF SOFT-DELETE VIA FIELD OVERRIDE
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Instead of dropping rows and hitting relation blocks, flag it!
    // This leaves sales history safe while pulling it out of view.
    await prisma.product.update({
      where: { id },
      data: { badge: 'archived_hidden' }
    });

    broadcastReload();
    return NextResponse.json({ success: true, message: 'Product hidden successfully' });
  } catch (error) {
    console.error("Delete Handler Error:", error);
    return NextResponse.json({ error: 'Database transaction failed' }, { status: 500 });
  }
}