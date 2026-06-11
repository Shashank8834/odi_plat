import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { bucketLlpStatus, resolveOverallStatus, type OverallStatus } from '@/lib/constants'

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
        select: {
          id: true,
          serialNo: true,
          name: true,
          partner: true,
          overallStatus: true,
          llpStatus: true,
          odiStatus: true,
          indianBankStatus: true,
          foreignBankStatus: true,
          companyStatus: true,
          fcgprStatus: true,
          shareCertStatus: true,
          form3Status: true,
        },
      }),
    ])

    const isToStart = (v: string | null) => (v ?? '').trim().toLowerCase() === 'to start'
    const TO_START_FIELDS = [
      'llpStatus', 'odiStatus', 'indianBankStatus', 'foreignBankStatus',
      'companyStatus', 'fcgprStatus', 'shareCertStatus', 'form3Status',
    ] as const

    let active = 0
    let cancelled = 0
    // Headline counts by the boss's 4 top-level statuses, computed over every
    // client (not a paginated slice) so the dashboard cards stay correct at any size.
    const overallCounts: Record<OverallStatus, number> = {
      IN_PROCESS: 0, TO_START: 0, COMPLETED: 0, CANCELLED: 0,
    }
    const toStartClients: Array<{
      id: string
      serialNo: number
      name: string
      partner: string | null
      llpStatus: string | null
      fields: string[]
    }> = []
    for (const c of allClients) {
      overallCounts[resolveOverallStatus(c.overallStatus, c.llpStatus)]++
      const b = bucketLlpStatus(c.llpStatus)
      if (b === 'CANCELLED') cancelled++
      else active++
      const fields = TO_START_FIELDS.filter((f) => isToStart((c as any)[f]))
      if (fields.length > 0) {
        toStartClients.push({
          id: c.id,
          serialNo: c.serialNo,
          name: c.name,
          partner: c.partner,
          llpStatus: c.llpStatus,
          fields: [...fields],
        })
      }
    }
    toStartClients.sort((a, b) => a.serialNo - b.serialNo)

    return NextResponse.json({
      total,
      active,
      cancelled,
      overallCounts,
      toStart: toStartClients.length,
      toStartClients,
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
