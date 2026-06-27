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

    // 3. High-Entropy Session Generation
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // Configure production cookie defense controls
    const response = NextResponse.json({
      success: true,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      }
    });

    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,     // Protects token values against client-side XSS malicious scripts
      secure: true,       // Enforces exclusive transmission over encrypted HTTPS channels
      sameSite: 'strict', // Hardens the network framework entirely against CSRF exploit flags
      maxAge: 60 * 60 * 4, // 4-hour active session lifetime window
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