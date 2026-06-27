import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Unified baseline message definition for all access rejections
    const accessDeniedResponse = () => NextResponse.json(
      { error: "Invalid email or password security credentials." },
      { status: 401 }
    );

    if (!email || !password) {
      return accessDeniedResponse();
    }

    // 1. Fetch User securely using Prisma parameterized layers (Defends against SQL Injections)
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return accessDeniedResponse();
    }

    // 2. Secure Hash Verification against stored Bcrypt string
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return accessDeniedResponse();
    }

    // 3. Post-Authentication Session Management Configuration
    // Generate a high-entropy cryptographically secure random session string
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // Set cookie parameters for session defense mechanisms
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });

    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,     // Prevents client-side Cross-Site Scripting (XSS) script tracking loops
      secure: true,       // Enforces transmission exclusively over encrypted HTTPS connections
      sameSite: 'strict', // Blocks Cross-Site Request Forgery (CSRF) vectors entirely
      maxAge: 60 * 60 * 4, // 4-hour session lifecycle management window
      path: '/'
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