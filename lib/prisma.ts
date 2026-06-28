import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Add it to your .env.local file.')
  }
  const adapter = new PrismaPg(
    {
      connectionString: process.env.DATABASE_URL,
      // Fail a connection attempt within 10s instead of hanging indefinitely
      // (important for Supabase free-tier projects waking from auto-pause).
      connectionTimeoutMillis: 10_000,
      // Drop idle connections after 30s so the pool doesn't hold onto
      // connections that Supabase's pooler may have already recycled.
      idleTimeoutMillis: 30_000,
      max: 10,
    },
    {
      onPoolError: (err) => console.error('[prisma] pg pool error:', err.message),
      onConnectionError: (err) => console.error('[prisma] pg connection error:', err.message),
    }
  )
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma