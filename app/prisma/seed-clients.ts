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
  let updated = 0

  for (const c of clients as any[]) {
    if (!c.name || c.serialNo == null) continue
    const existing = await prisma.client.findUnique({ where: { serialNo: c.serialNo } })
    if (existing) {
      await prisma.client.update({
        where: { serialNo: c.serialNo },
        data: { ...c, isDeleted: false },
      })
      updated++
    } else {
      await prisma.client.create({ data: c })
      created++
    }
  }

  console.log(`Done. Created: ${created}, Updated: ${updated}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
