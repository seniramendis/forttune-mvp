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
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Use Prisma's safe parameterized block to native-escape the string ID safely
    try {
      await prisma.$executeRaw`
        UPDATE "Product" 
        SET "deletedAt" = NOW() 
        WHERE id = ${id}
      `;
    } catch {
      // Hard fallback drop query if your schema didn't register the column locally yet
      await prisma.$executeRaw`
        DELETE FROM "Product" 
        WHERE id = ${id}
      `;
    }

    broadcastReload();
    return NextResponse.json({ success: true, message: 'Product processed successfully' });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: 'Database transaction failed' }, { status: 500 });
  }
}