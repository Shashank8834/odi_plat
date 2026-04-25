import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [
      total,
      llpStats,
      odiStats,
      indianBankStats,
      companyStats,
      paymentStats,
    ] = await Promise.all([
      prisma.client.count({ where: { isDeleted: false } }),
      prisma.client.groupBy({ by: ['llpStatus'], where: { isDeleted: false }, _count: true }),
      prisma.client.groupBy({ by: ['odiStatus'], where: { isDeleted: false }, _count: true }),
      prisma.client.groupBy({ by: ['indianBankStatus'], where: { isDeleted: false }, _count: true }),
      prisma.client.groupBy({ by: ['companyStatus'], where: { isDeleted: false }, _count: true }),
      prisma.client.groupBy({ by: ['paymentStatus'], where: { isDeleted: false }, _count: true }),
    ])

    // Active: not cancelled and not on hold (consistent with pipeline view)
    const active = await prisma.client.count({
      where: { isDeleted: false, llpStatus: { notIn: ['CANCELLED', 'ON_HOLD'] } },
    })

    const cancelled = await prisma.client.count({
      where: { isDeleted: false, llpStatus: 'CANCELLED' },
    })

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const stalled = await prisma.client.count({
      where: {
        isDeleted: false,
        llpStatus: { notIn: ['CANCELLED', 'ON_HOLD'] },
        updatedAt: { lt: sevenDaysAgo },
      },
    })

    return NextResponse.json({
      total,
      active,
      cancelled,
      stalled,
      llpStats,
      odiStats,
      indianBankStats,
      companyStats,
      paymentStats,
    })
  } catch (error) {
    console.error('GET /api/analytics/pipeline error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
