import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Lazy import so Prisma initialization errors are caught here,
    // not at module load time (which causes Next.js to return an HTML 500
    // page before our catch block can return proper JSON).
    const { prisma } = await import('@/lib/prisma');
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch (error) {
    console.error('API Error:', error);
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
