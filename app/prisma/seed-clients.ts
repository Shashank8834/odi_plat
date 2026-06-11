import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import clients from './clients-data.json'

const databaseUrl = process.env.DATABASE_URL ?? 'file:./dev.db'

function makeAdapter() {
  if (databaseUrl.startsWith('file:')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
    return new PrismaBetterSqlite3({ url: databaseUrl })
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require('@prisma/adapter-pg')
  return new PrismaPg({ connectionString: databaseUrl })
}

const prisma = new PrismaClient({ adapter: makeAdapter() } as any)

async function main() {
  console.log(`Seeding ${clients.length} clients from ODI List Inkle...`)

  let created = 0
  let skipped = 0

  for (const c of clients as any[]) {
    if (!c.name || c.serialNo == null) continue
    const existing = await prisma.client.findUnique({ where: { serialNo: c.serialNo } })
    if (existing) {
      // Create-only: never overwrite clients already in the DB. The live app is
      // the source of truth — re-seeding from this static JSON snapshot on every
      // container restart would otherwise revert manual edits and un-delete rows.
      skipped++
    } else {
      await prisma.client.create({ data: c })
      created++
    }
  }

  console.log(`Done. Created: ${created}, Skipped (already present): ${skipped}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
