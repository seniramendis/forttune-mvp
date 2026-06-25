import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// THIS IS THE MAGIC LINE: It prevents Next.js from caching the empty inventory
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Database failure' }, { status: 500 });
  }
}