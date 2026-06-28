import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withDbRetry } from '@/lib/db-retry';

export const dynamic = 'force-dynamic';

// Admin-only: returns every order with user info
export async function GET() {
  try {
    const orders = await withDbRetry(() =>
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: { product: { select: { name: true } } }
          }
        }
      })
    );

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch all orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
