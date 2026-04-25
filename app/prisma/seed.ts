import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter } as any)

const clients = [
  { name: 'Goldee Enterprises LLP', partner: 'Rajesh Kumar', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'HDFC', foreignBankStatus: 'DONE', companyStatus: 'INCORPORATED', fcgprStatus: 'FILED', shareCertStatus: 'SUBMITTED', form3Status: 'FILED', billingEntity: 'Goldee Enterprises', invoiceNo: '2025-26/3112', invoiceStatus: 'SENT', paymentStatus: 'PAID', furtherWork: 'NONE' },
  { name: 'Aryan Ventures LLP', partner: 'Aryan Singh', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'ICICI', foreignBankStatus: 'OPENED', companyStatus: 'INCORPORATED', fcgprStatus: 'FILED', shareCertStatus: 'SUBMITTED', form3Status: 'FILED', billingEntity: 'Aryan Ventures', invoiceNo: '2025-26/3113', invoiceStatus: 'SENT', paymentStatus: 'PAID', furtherWork: 'NONE' },
  { name: 'Priya Global LLP', partner: 'Priya Sharma', llpStatus: 'CLIENT_HAS_ENTITY', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'Kotak', foreignBankStatus: 'OPENED', companyStatus: 'NOT_REQUIRED', fcgprStatus: 'FILED', shareCertStatus: 'SUBMITTED', form3Status: 'NA', billingEntity: 'Priya Global', invoiceNo: '2025-26/3114', invoiceStatus: 'SENT', paymentStatus: 'PARTIALLY_PAID', furtherWork: 'MAY_COME' },
  { name: 'Bharat Overseas LLP', partner: 'Suresh Patel', llpStatus: 'IN_PROCESS', odiStatus: 'IN_PROCESS', indianBankStatus: 'BANK_SELECTED', indianBankName: 'HDFC', foreignBankStatus: 'NOT_REQUIRED', companyStatus: 'NOT_REQUIRED', fcgprStatus: 'NA', shareCertStatus: 'PENDING', form3Status: 'NA', billingEntity: 'Bharat Overseas', invoiceStatus: 'NOT_SENT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NONE' },
  { name: 'Sai International LLP', partner: 'Sai Kiran', llpStatus: 'CANCELLED', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'NOT_SENT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NONE' },
  { name: 'Meridian Exports LLP', partner: 'Meera Iyer', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'Axis', foreignBankStatus: 'DONE', companyStatus: 'INCORPORATED', fcgprStatus: 'FILED', shareCertStatus: 'SUBMITTED', form3Status: 'FILED', invoiceNo: '2025-26/3115', invoiceStatus: 'SENT', paymentStatus: 'PAID', furtherWork: 'CONVERTED' },
  { name: 'Nextgen Investments LLP', partner: 'Vikram Malhotra', llpStatus: 'NAME_APPLIED', odiStatus: 'IN_PROCESS', indianBankStatus: 'TO_START', foreignBankStatus: 'NOT_REQUIRED', companyStatus: 'NOT_REQUIRED', fcgprStatus: 'NA', shareCertStatus: null, form3Status: 'NA', invoiceStatus: 'DRAFT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NONE' },
  { name: 'Sunrise Capital LLP', partner: 'Anita Reddy', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'DBS', foreignBankStatus: 'OPENED', companyStatus: 'INCORPORATED', fcgprStatus: 'TO_BE_FILED', shareCertStatus: 'EMAILED', form3Status: 'PENDING', invoiceNo: '2025-26/3116', invoiceStatus: 'SENT', paymentStatus: 'TO_BE_PAID', furtherWork: 'MAY_COME' },
  { name: 'Cosmic Trades LLP', partner: 'Ravi Shankar', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'HSBC', foreignBankStatus: 'DONE', companyStatus: 'COMPLETE', fcgprStatus: 'FILED', shareCertStatus: 'SUBMITTED', form3Status: 'FILED', invoiceNo: '2025-26/3117', invoiceStatus: 'SENT', paymentStatus: 'PAID', furtherWork: 'NONE' },
  { name: 'Alpha Overseas LLP', partner: 'Deepa Nair', llpStatus: 'IN_PROCESS', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'NOT_SENT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NONE' },
  { name: 'Blue Horizon LLP', partner: 'Karan Mehta', llpStatus: 'CLIENT_HAS_ENTITY', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'RBL', foreignBankStatus: 'OPENED', companyStatus: 'NOT_REQUIRED', fcgprStatus: 'FILED', shareCertStatus: 'SUBMITTED', form3Status: 'NA', invoiceNo: '2025-26/3118', invoiceStatus: 'SENT', paymentStatus: 'PAID', furtherWork: 'NONE' },
  { name: 'Pinnacle Global LLP', partner: 'Neha Gupta', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'Kotak', foreignBankStatus: 'DONE', companyStatus: 'INCORPORATED', fcgprStatus: 'PENDING', shareCertStatus: 'PENDING', form3Status: 'PENDING', invoiceNo: '2025-26/3119', invoiceStatus: 'SENT', paymentStatus: 'PARTIALLY_PAID', furtherWork: 'NONE' },
  { name: 'Crown Exports LLP', partner: 'Amit Joshi', llpStatus: 'NAME_YET_TO_BE_APPLIED', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'NOT_SENT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NONE' },
  { name: 'Delta Ventures LLP', partner: 'Sunita Rao', llpStatus: 'CANCELLED', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'NOT_SENT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NO_REPLY' },
  { name: 'Global Path LLP', partner: 'Rohit Verma', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'SC', foreignBankStatus: 'DONE', companyStatus: 'NOT_REQUIRED', fcgprStatus: 'FILED', shareCertStatus: 'SUBMITTED', form3Status: 'NA', invoiceNo: '2025-26/3120', invoiceStatus: 'SENT', paymentStatus: 'PAID', furtherWork: 'NONE' },
  { name: 'Eureka Investments LLP', partner: 'Pallavi Bose', llpStatus: 'ON_HOLD', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'NOT_SENT', paymentStatus: 'TO_BE_DISCUSSED', furtherWork: 'NONE' },
  { name: 'Prime Overseas LLP', partner: 'Vivek Sinha', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'HDFC', foreignBankStatus: 'OPENED', companyStatus: 'INCORPORATED', fcgprStatus: 'FILED', shareCertStatus: 'SUBMITTED', form3Status: 'FILED', invoiceNo: '2025-26/3121', invoiceStatus: 'SENT', paymentStatus: 'PAID', furtherWork: 'CONVERTED' },
  { name: 'Vertex Capital LLP', partner: 'Shweta Agarwal', llpStatus: 'INCORPORATION_FILED', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'DRAFT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NONE' },
  { name: 'Horizon Exports LLP', partner: 'Rajiv Kumar', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'Axis', foreignBankStatus: 'DONE', companyStatus: 'COMPLETE', fcgprStatus: 'FILED', shareCertStatus: 'SUBMITTED', form3Status: 'FILED', invoiceNo: '2025-26/3122', invoiceStatus: 'SENT', paymentStatus: 'PAID', furtherWork: 'NONE' },
  { name: 'Nexus Trades LLP', partner: 'Pradeep Mishra', llpStatus: 'CANCELLED', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'NOT_SENT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NONE' },
  { name: 'Opulent LLP', partner: 'Kavita Pillai', llpStatus: 'CLIENT_HAS_ENTITY', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'ICICI', foreignBankStatus: 'OPENED', companyStatus: 'NOT_REQUIRED', fcgprStatus: 'FILED', shareCertStatus: 'TO_BE_CHECKED', form3Status: 'NA', invoiceNo: '2025-26/3123', invoiceStatus: 'SENT', paymentStatus: 'PARTIALLY_PAID', furtherWork: 'MAY_COME' },
  { name: 'Sapphire Global LLP', partner: 'Ganesh Iyer', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'BANK_SELECTED', indianBankName: 'DBS', foreignBankStatus: 'NOT_REQUIRED', companyStatus: 'INCORPORATED', fcgprStatus: 'TO_BE_FILED', shareCertStatus: 'PENDING', form3Status: 'PENDING', invoiceNo: '2025-26/3124', invoiceStatus: 'SENT', paymentStatus: 'INCORPORATION_PAID', furtherWork: 'NONE' },
  { name: 'Summit Ventures LLP', partner: 'Tara Singh', llpStatus: 'CANCELLED', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'NOT_SENT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NONE' },
  { name: 'Nova Overseas LLP', partner: 'Manish Shah', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'HDFC', foreignBankStatus: 'DONE', companyStatus: 'NOT_REQUIRED', fcgprStatus: 'FILED', shareCertStatus: 'SUBMITTED', form3Status: 'NA', invoiceNo: '2025-26/3125', invoiceStatus: 'SENT', paymentStatus: 'PAID', furtherWork: 'NONE' },
  { name: 'Titan LLP', partner: 'Supriya Nair', llpStatus: 'IN_PROCESS', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'NOT_SENT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NONE' },
  { name: 'Orbit Investments LLP', partner: 'Ajay Khanna', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'Yes Bank', foreignBankStatus: 'OPENED', companyStatus: 'INCORPORATED', fcgprStatus: 'FILED', shareCertStatus: 'SUBMITTED', form3Status: 'FILED', invoiceNo: '2025-26/3126', invoiceStatus: 'SENT', paymentStatus: 'PAID', furtherWork: 'NONE' },
  { name: 'Sterling Exports LLP', partner: 'Ritu Puri', llpStatus: 'CANCELLED', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'NOT_SENT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NO_REPLY' },
  { name: 'Voyager LLP', partner: 'Harish Patel', llpStatus: 'REGISTERED', odiStatus: 'NOT_REQUIRED', indianBankStatus: 'OPENED', indianBankName: 'Au Small Finance', foreignBankStatus: 'NOT_REQUIRED', companyStatus: 'NOT_REQUIRED', fcgprStatus: 'NA', shareCertStatus: null, form3Status: 'NA', invoiceNo: '2025-26/3127', invoiceStatus: 'SENT', paymentStatus: 'PAID', furtherWork: 'NONE' },
  { name: 'Pacific Overseas LLP', partner: 'Shalini Tiwari', llpStatus: 'SHARE_ALLOTMENT', odiStatus: 'IN_PROCESS', indianBankStatus: 'TO_START', foreignBankStatus: 'NOT_REQUIRED', companyStatus: 'NOT_REQUIRED', fcgprStatus: 'NA', shareCertStatus: null, form3Status: 'NA', invoiceStatus: 'DRAFT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NONE' },
  { name: 'Eternal Ventures LLP', partner: 'Mohan Das', llpStatus: 'CANCELLED', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'NOT_SENT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NONE' },
  // Fill in more to reach ~50+ representative clients
  { name: 'Fortune Exports LLP', partner: 'Lucky Mehta', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'HDFC', foreignBankStatus: 'DONE', companyStatus: 'INCORPORATED', fcgprStatus: 'FILED', shareCertStatus: 'SUBMITTED', form3Status: 'FILED', invoiceNo: '2025-26/3128', invoiceStatus: 'SENT', paymentStatus: 'PAID', furtherWork: 'NONE' },
  { name: 'Amber Overseas LLP', partner: 'Amber Singh', llpStatus: 'IN_PROCESS', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'NOT_SENT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NONE' },
  { name: 'Phoenix Capital LLP', partner: 'Priya Kapoor', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'Kotak', foreignBankStatus: 'DONE', companyStatus: 'COMPLETE', fcgprStatus: 'FILED', shareCertStatus: 'SUBMITTED', form3Status: 'FILED', invoiceNo: '2025-26/3129', invoiceStatus: 'SENT', paymentStatus: 'PAID', furtherWork: 'CONVERTED' },
  { name: 'Catalyst LLP', partner: 'Vikram Nair', llpStatus: 'NAME_APPLIED', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'DRAFT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NONE' },
  { name: 'Bright Future LLP', partner: 'Sundar Krishnan', llpStatus: 'CANCELLED', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'NOT_SENT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NONE' },
  { name: 'Trident Investments LLP', partner: 'Anjali Desai', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'ICICI', foreignBankStatus: 'OPENED', companyStatus: 'INCORPORATED', fcgprStatus: 'TO_BE_FILED', shareCertStatus: 'EMAILED', form3Status: 'PENDING', invoiceNo: '2025-26/3130', invoiceStatus: 'SENT', paymentStatus: 'TO_BE_PAID', furtherWork: 'MAY_COME' },
  { name: 'Quantum Ventures LLP', partner: 'Rakesh Jain', llpStatus: 'ON_HOLD', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'NOT_SENT', paymentStatus: 'TO_BE_DISCUSSED', furtherWork: 'NONE' },
  { name: 'Impetus LLP', partner: 'Geetha Varma', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'Deutsche', foreignBankStatus: 'DONE', companyStatus: 'NOT_REQUIRED', fcgprStatus: 'FILED', shareCertStatus: 'SUBMITTED', form3Status: 'NA', invoiceNo: '2025-26/3131', invoiceStatus: 'SENT', paymentStatus: 'PAID', furtherWork: 'NONE' },
  { name: 'Magnolia Exports LLP', partner: 'Sanjay Agarwal', llpStatus: 'CANCELLED', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'NOT_SENT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NONE' },
  { name: 'Zenith Capital LLP', partner: 'Divya Murthy', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'HDFC', foreignBankStatus: 'OPENED', companyStatus: 'INCORPORATED', fcgprStatus: 'FILED', shareCertStatus: 'SUBMITTED', form3Status: 'FILED', invoiceNo: '2025-26/3132', invoiceStatus: 'SENT', paymentStatus: 'PAID', furtherWork: 'NONE' },
  { name: 'Nexstra LLP', partner: 'Bala Subramaniam', llpStatus: 'IN_PROCESS', odiStatus: null, indianBankStatus: null, foreignBankStatus: null, companyStatus: null, fcgprStatus: null, shareCertStatus: null, form3Status: null, invoiceStatus: 'NOT_SENT', paymentStatus: 'TO_BE_PAID', furtherWork: 'NO_REPLY' },
  { name: 'Crescendo LLP', partner: 'Padma Iyer', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'BANK_SELECTED', indianBankName: 'RBL', foreignBankStatus: 'NOT_REQUIRED', companyStatus: 'NOT_REQUIRED', fcgprStatus: 'NA', shareCertStatus: null, form3Status: 'NA', invoiceNo: '2025-26/3133', invoiceStatus: 'SENT', paymentStatus: 'INCORPORATION_PAID', furtherWork: 'NONE' },
  { name: 'Polaris Overseas LLP', partner: 'Manoj Kumar', llpStatus: 'REGISTERED', odiStatus: 'UIN_ALLOTTED', indianBankStatus: 'OPENED', indianBankName: 'Axis', foreignBankStatus: 'DONE', companyStatus: 'INCORPORATED', fcgprStatus: 'FILED', shareCertStatus: 'SUBMITTED', form3Status: 'FILED', invoiceNo: '2025-26/3134', invoiceStatus: 'SENT', paymentStatus: 'PAID', furtherWork: 'NONE' },
]

async function main() {
  console.log('🌱 Seeding ODI Platform database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12)
  const managerPassword = await bcrypt.hash('Manager@123', 12)

  await prisma.user.upsert({
    where: { email: 'admin@odifirm.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@odifirm.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  await prisma.user.upsert({
    where: { email: 'manager@odifirm.com' },
    update: {},
    create: {
      name: 'Manager User',
      email: 'manager@odifirm.com',
      password: managerPassword,
      role: 'MANAGER',
    },
  })

  console.log('✅ Users created')

  // Create clients
  for (let i = 0; i < clients.length; i++) {
    const client = clients[i]
    const created = await prisma.client.create({
      data: { ...client, serialNo: i + 1 } as any,
    })

    // Create invoice record if invoice number exists
    if (client.invoiceNo) {
      await prisma.invoice.create({
        data: {
          clientId: created.id,
          invoiceNo: client.invoiceNo,
          status: client.invoiceStatus ?? 'NOT_SENT',
          amount: Math.floor(Math.random() * 50000) + 15000,
        },
      })
    }

    // Create initial status log
    await prisma.statusLog.create({
      data: {
        clientId: created.id,
        field: 'MIGRATION',
        oldValue: null,
        newValue: 'Client imported from Excel',
        changedBy: 'system',
      },
    })
  }

  console.log(`✅ ${clients.length} clients seeded`)
  console.log('\n📋 Login credentials:')
  console.log('  Admin:   admin@odifirm.com / Admin@123')
  console.log('  Manager: manager@odifirm.com / Manager@123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
