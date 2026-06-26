import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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