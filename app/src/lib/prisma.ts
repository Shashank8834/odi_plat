import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL ?? 'file:./dev.db'

  if (databaseUrl.startsWith('file:')) {
    // SQLite — used in local development only
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
    const adapter = new PrismaBetterSqlite3({ url: databaseUrl })
    return new PrismaClient({
      adapter,
      log: ['error', 'warn'],
    } as any)
  }

  // PostgreSQL — used in production
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require('@prisma/adapter-pg')
  const adapter = new PrismaPg({ connectionString: databaseUrl })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  } as any)
}

// Lazy proxy: avoids constructing PrismaClient at import time.
// Next.js "Collecting page data" imports route modules — without this,
// any missing DATABASE_URL / adapter blows up the build.
function makeLazyPrisma(): PrismaClient {
  let instance: PrismaClient | undefined
  const get = () => (instance ??= createPrismaClient())
  return new Proxy({} as PrismaClient, {
    get(_t, prop, receiver) {
      const client = get() as any
      const value = client[prop]
      return typeof value === 'function' ? value.bind(client) : value
    },
    has(_t, prop) {
      return prop in (get() as any)
    },
  })
}

export const prisma = globalForPrisma.prisma ?? makeLazyPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
