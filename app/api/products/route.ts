import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Database failure' }, { status: 500 });
  }
}