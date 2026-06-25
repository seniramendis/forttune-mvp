import path from 'path'
import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

config({ path: '.env.local' })

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    url: process.env.DATABASE_URL!,
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg')
      return new PrismaPg({ connectionString: process.env.DATABASE_URL })
    },
  },
})