import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: { select: { name: true, image: true } } }
        }
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // FIX: destructure userId — was missing, so web orders were never linked to a customer
    const { cart, userId, paymentMethod, isPosOrder, total } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Web orders require a logged-in user; POS walk-in orders do not
    if (!isPosOrder && !userId) {
      return NextResponse.json({ error: 'Authentication required to place an order.' }, { status: 401 });
    }

    // Pre-flight stock check: verify every item has sufficient inventory before opening a transaction
    const productIds = cart.map((item: any) => item.id);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    for (const item of cart) {
      const product = products.find((p: any) => p.id === item.id);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 400 });
      }
      if (product.stock < item.qty) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.name}". Only ${product.stock} unit(s) available.` },
          { status: 400 }
        );
      }
    }

    // Prisma Transaction: if any update fails the whole order rolls back automatically
    const order = await prisma.$transaction(async (tx) => {
      
      // 1. Create the Order and OrderItems; link to userId if provided
      const newOrder = await tx.order.create({
        data: {
          total: parseFloat(total),
          paymentMethod: paymentMethod || 'CASH',
          isPosOrder: Boolean(isPosOrder),
          status: 'COMPLETED',
          // FIX: connect userId when provided (web orders) — null for POS walk-in
          ...(userId ? { user: { connect: { id: userId } } } : {}),
          items: {
            create: cart.map((item: any) => ({
              productId: item.id,
              quantity: item.qty,
              price: item.price,
            }))
          }
        }
      });

      // 2. Deduct stock for each item atomically
      for (const item of cart) {
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.qty } }
        });
      }

      return newOrder;
    });

    return NextResponse.json({ success: true, order });
    
  } catch (error) {
    console.error("Checkout failed:", error);
    return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 });
  }
}