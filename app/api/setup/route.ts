import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // 1. Extract configurations securely from environment seeds
    const adminName = process.env.INIT_ADMIN_NAME || "Forttune Master Admin";
    const adminEmail = process.env.INIT_ADMIN_EMAIL || "admin@forttune.com";
    const adminPassword = process.env.INIT_ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Secure administration initialization credentials are missing from system environments." },
        { status: 500 }
      );
    }

    // 2. Cryptographically hash the seed password with an adjustable work factor (12 rounds)
    const saltRounds = 12;
    const secureHashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // 3. Upsert the admin account securely (Blocks duplicate generation records)
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        name: adminName,
        password: secureHashedPassword,
        role: Role.ADMIN // Forces master administrative privileges assignment explicitly
      },
      create: {
        email: adminEmail,
        name: adminName,
        password: secureHashedPassword,
        role: Role.ADMIN
      }
    });

    return NextResponse.json({
      success: true,
      message: "Administrative credentials seeded and initialized securely using Bcrypt structures.",
      account: {
        email: adminUser.email,
        role: adminUser.role
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Setup Security Exception Handling:", error);
    return NextResponse.json(
      { error: "An unexpected database exception occurred during system initialization vectors." },
      { status: 500 }
    );
  }
}