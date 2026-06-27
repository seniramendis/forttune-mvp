/**
 * POST /api/setup
 *
 * One-time endpoint to create the default admin account.
 * Protected by SETUP_TOKEN env var — set it to any random string,
 * call the endpoint once, then remove or leave it unset forever.
 *
 * Usage (from terminal):
 *   curl -X POST http://localhost:3000/api/setup \
 *     -H "Content-Type: application/json" \
 *     -d '{"token":"YOUR_SETUP_TOKEN"}'
 *
 * Or just run: npx prisma db seed
 * (the seed script does the same thing without needing this endpoint)
 */

import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'forttune_salt_2024').digest('hex');
}

export async function POST(request: Request) {
  const setupToken = process.env.SETUP_TOKEN;

  // If no SETUP_TOKEN is set in env, this endpoint is disabled entirely
  if (!setupToken) {
    return NextResponse.json({ error: 'Setup endpoint is disabled.' }, { status: 403 });
  }

  try {
    const { token } = await request.json();

    if (token !== setupToken) {
      return NextResponse.json({ error: 'Invalid setup token.' }, { status: 401 });
    }

    const existing = await prisma.user.findUnique({ where: { email: 'admin@forttune.lk' } });
    if (existing) {
      return NextResponse.json({ message: 'Admin account already exists. No changes made.' });
    }

    await prisma.user.create({
      data: {
        email:    'admin@forttune.lk',
        name:     'Forttune Admin',
        role:     'ADMIN',
        password: hashPassword('admin123'),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin account created. Email: admin@forttune.lk / Password: admin123. Change it immediately.'
    });
  } catch (error) {
    console.error('Setup failed:', error);
    return NextResponse.json({ error: 'Setup failed.' }, { status: 500 });
  }
}
