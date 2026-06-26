import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'forttune_salt_2024').digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    // Create user directly in Prisma with hashed password
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: 'CUSTOMER',
        password: hashPassword(password),
      },
    })

    return NextResponse.json(
      { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('[REGISTER ERROR]', err.message ?? err)
    return NextResponse.json({ error: 'Internal server error: ' + (err.message ?? '') }, { status: 500 })
  }
}
