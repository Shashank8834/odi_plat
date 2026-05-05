import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { bucketLlpStatus } from '@/lib/constants'

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
      allClients,
    ] = await Promise.all([
      prisma.client.count({ where: { isDeleted: false } }),
      prisma.client.groupBy({ by: ['llpStatus'], where: { isDeleted: false }, _count: true }),
      prisma.client.groupBy({ by: ['odiStatus'], where: { isDeleted: false }, _count: true }),
      prisma.client.groupBy({ by: ['indianBankStatus'], where: { isDeleted: false }, _count: true }),
      prisma.client.groupBy({ by: ['companyStatus'], where: { isDeleted: false }, _count: true }),
      prisma.client.groupBy({ by: ['paymentStatus'], where: { isDeleted: false }, _count: true }),
      prisma.client.findMany({
        where: { isDeleted: false },
        select: { llpStatus: true, updatedAt: true },
      }),
    ])

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    let active = 0
    let cancelled = 0
    let stalled = 0
    for (const c of allClients) {
      const b = bucketLlpStatus(c.llpStatus)
      if (b === 'CANCELLED') cancelled++
      else {
        active++
        if (c.updatedAt < sevenDaysAgo) stalled++
      }
    }

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
