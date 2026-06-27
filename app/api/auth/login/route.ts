import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Unified baseline error message to eliminate user/email enumeration vectors
    const accessDeniedResponse = () => NextResponse.json(
      { error: "Invalid email or password security credentials." },
      { status: 401 }
    );

    if (!email || !password) {
      return accessDeniedResponse();
    }

    // 1. Fetch User securely via Prisma parameterized query layers (Blocks SQL Injections)
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return accessDeniedResponse();
    }

    // 2. Cryptographic Password Verification against secure Bcrypt hashes
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return accessDeniedResponse();
    }

    // 3. High-Entropy Session Token — embed role so middleware can verify it
    const sessionPayload = JSON.stringify({
      userId: user.id,
      role: user.role,
      token: crypto.randomBytes(32).toString('hex'),
    });
    const sessionToken = Buffer.from(sessionPayload).toString('base64');

    // 4. Determine redirect target based on role
    const redirectPath =
      user.role === 'ADMIN' ? '/admin' :
      user.role === 'CASHIER' ? '/pos' :
      '/';

    const response = NextResponse.json({
      success: true,
      redirectTo: redirectPath,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    // FIX: secure:false on localhost (HTTP); secure:true in production (HTTPS)
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: isProduction,          // ← was hardcoded true, broke localhost entirely
      sameSite: 'strict',
      maxAge: 60 * 60 * 4,           // 4-hour session
      path: '/',
    });

    return response;

  } catch (error) {
    console.error("Login Security Exception Handling:", error);
    return NextResponse.json(
      { error: "An unexpected internal server authentication error occurred." },
      { status: 500 }
    );
  }
}
