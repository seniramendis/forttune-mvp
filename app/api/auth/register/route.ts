import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Strict regular expression validation for proper email formats
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Advanced password criteria: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // 1. Generic Error Message Strategy to prevent user enumeration
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Invalid registration parameters provided." },
        { status: 400 }
      );
    }

    // 2. Strict Input Validation Rules
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Please provide a formally valid email address." },
        { status: 400 }
      );
    }

    if (!PASSWORD_REGEX.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special symbols." },
        { status: 400 }
      );
    }

    // 3. Prevent Duplicates securely using Prisma parameterized inputs (Blocks SQL Injection)
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Invalid registration parameters provided." },
        { status: 400 }
      );
    }

    // 4. Secure Cryptographic Hashing (bcrypt with adjustable work factor / 12 rounds)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Store data securely in database
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'USER' // Defends against privilege escalation attacks
      }
    });

    return NextResponse.json(
      { success: true, message: "User registered successfully." },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration Error:", error);
    // Never expose database raw stack details or environment flags to the client
    return NextResponse.json(
      { error: "An unexpected error occurred during registration handling." },
      { status: 500 }
    );
  }
}