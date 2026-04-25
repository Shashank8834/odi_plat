import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const llpStatus = searchParams.get('llpStatus')
    const odiStatus = searchParams.get('odiStatus')
    const indianBankStatus = searchParams.get('indianBankStatus')
    const foreignBankStatus = searchParams.get('foreignBankStatus')
    const companyStatus = searchParams.get('companyStatus')
    const paymentStatus = searchParams.get('paymentStatus')
    const furtherWork = searchParams.get('furtherWork')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {
      isDeleted: false,
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { partner: { contains: search } },
      ]
    }
    if (llpStatus) where.llpStatus = llpStatus
    if (odiStatus) where.odiStatus = odiStatus
    if (indianBankStatus) where.indianBankStatus = indianBankStatus
    if (foreignBankStatus) where.foreignBankStatus = foreignBankStatus
    if (companyStatus) where.companyStatus = companyStatus
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (furtherWork) where.furtherWork = furtherWork

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { serialNo: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.client.count({ where }),
    ])

    return NextResponse.json({ clients, total, page, limit })
  } catch (error) {
    console.error('GET /api/clients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, partner, ...rest } = body

    if (!name) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 })
    }

    // Get next serial number
    const maxClient = await prisma.client.findFirst({
      orderBy: { serialNo: 'desc' },
      select: { serialNo: true },
    })
    const nextSerialNo = (maxClient?.serialNo ?? 0) + 1

    const client = await prisma.client.create({
      data: { name, partner, serialNo: nextSerialNo, ...rest },
    })

    await prisma.statusLog.create({
      data: {
        clientId: client.id,
        field: 'CLIENT_CREATED',
        oldValue: null,
        newValue: name,
        changedBy: session.user.email ?? session.user.name ?? 'unknown',
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('POST /api/clients error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
