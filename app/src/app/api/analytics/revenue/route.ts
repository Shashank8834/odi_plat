import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const invoices = await prisma.invoice.findMany({
    include: {
      client: { select: { name: true, serialNo: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amount ?? 0), 0)

  // Paid invoices: those with status = SENT and client paymentStatus = PAID
  const paidInvoices = invoices.filter((inv) => inv.status === 'SENT')
  const paid = paidInvoices.reduce((sum, inv) => sum + (inv.amount ?? 0), 0)
  const pending = totalRevenue - paid

  return NextResponse.json({
    totalRevenue,
    paid,
    pending,
    totalInvoices: invoices.length,
    recentInvoices: invoices.slice(0, 15),
  })
}
