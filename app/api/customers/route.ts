import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Compute totals per customer
    const enriched = customers.map(c => ({
      ...c,
      totalOrders: c.orders.length,
      totalSpent: c.orders.reduce((sum, o) => sum + o.total, 0),
      lastOrderDate: c.orders[0]?.createdAt ?? null,
    }))

    return NextResponse.json(enriched)
  } catch (err: any) {
    console.error('[CUSTOMERS ERROR]', err)
    return NextResponse.json({ error: 'Failed to fetch customers.' }, { status: 500 })
  }
}
