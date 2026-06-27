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
    const { cart, paymentMethod, isPosOrder, total } = body;

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // We use a Prisma Transaction: If stock deduction fails, the order is cancelled automatically.
    const order = await prisma.$transaction(async (tx) => {
      
      // 1. Create the Order and OrderItems
      const newOrder = await tx.order.create({
        data: {
          total: parseFloat(total),
          paymentMethod: paymentMethod || 'CASH',
          isPosOrder: isPosOrder,
          status: 'COMPLETED',
          items: {
            create: cart.map((item: any) => ({
              productId: item.id,
              quantity: item.qty,
              price: item.price
            }))
          }
        }
      });

      // 2. Deduct the stock from the inventory for each item
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
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}