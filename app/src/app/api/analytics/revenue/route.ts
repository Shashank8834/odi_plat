import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [totalAgg, paidAgg, recentInvoices] = await Promise.all([
      prisma.invoice.aggregate({ _sum: { amount: true } }),
      prisma.invoice.aggregate({ where: { status: 'SENT' }, _sum: { amount: true } }),
      prisma.invoice.findMany({
        include: { client: { select: { name: true, serialNo: true } } },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
    ])

    const totalRevenue = totalAgg._sum.amount ?? 0
    const paid = paidAgg._sum.amount ?? 0
    const pending = totalRevenue - paid

    const totalInvoicesCount = await prisma.invoice.count()

    return NextResponse.json({
      totalRevenue,
      paid,
      pending,
      totalInvoices: totalInvoicesCount,
      recentInvoices,
    })
  } catch (error) {
    console.error('GET /api/analytics/revenue error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
