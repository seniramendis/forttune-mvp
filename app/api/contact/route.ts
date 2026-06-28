import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST /api/contact — submit a contact message (public)
export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const record = await prisma.contactMessage.create({
      data: { name: name.trim(), email: email.trim(), message: message.trim() },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error('[CONTACT POST]', err);
    return NextResponse.json({ error: 'Failed to save message.' }, { status: 500 });
  }
}

// GET /api/contact — fetch all messages (admin only, guarded by middleware)
export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(messages);
  } catch (err) {
    console.error('[CONTACT GET]', err);
    return NextResponse.json({ error: 'Failed to fetch messages.' }, { status: 500 });
  }
}

// PATCH /api/contact?id=xxx — mark as read / unread
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { read } = await req.json();
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { read },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('[CONTACT PATCH]', err);
    return NextResponse.json({ error: 'Failed to update message.' }, { status: 500 });
  }
}

// DELETE /api/contact?id=xxx — delete a message
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await prisma.contactMessage.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[CONTACT DELETE]', err);
    return NextResponse.json({ error: 'Failed to delete message.' }, { status: 500 });
  }
}
