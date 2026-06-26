import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'forttune_salt_2024').digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || user.password !== hashPassword(password)) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (err: any) {
    console.error('[LOGIN ERROR]', err.message ?? err)
    return NextResponse.json({ error: 'Internal server error: ' + (err.message ?? '') }, { status: 500 })
  }
}
