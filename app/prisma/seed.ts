import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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
  console.log('Seeding ODI Platform — admin user only')

  const adminEmail = process.env.SEED_ADMIN_EMAIL
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  const adminName = process.env.SEED_ADMIN_NAME ?? 'Admin'

  if (!adminEmail || !adminPassword) {
    console.error(
      'Refusing to seed: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env first.'
    )
    process.exit(1)
  }
  if (adminPassword.length < 12) {
    console.error('Refusing to seed: SEED_ADMIN_PASSWORD must be at least 12 characters.')
    process.exit(1)
  }

  const hashed = await bcrypt.hash(adminPassword, 12)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: adminName,
      email: adminEmail,
      password: hashed,
      role: 'ADMIN',
    },
  })

  console.log(`Admin ready: ${adminEmail}`)
  console.log('Add team members from inside the app via the users API once logged in.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
