import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const enums = await prisma.statusEnum.findMany({
      where: { isActive: true },
      orderBy: [{ stage: 'asc' }, { displayOrder: 'asc' }],
    })

    return NextResponse.json(enums)
  } catch (error) {
    console.error('GET /api/status-enums error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const { stage, value, displayOrder } = await request.json()

    if (!stage || !value) {
      return NextResponse.json({ error: 'Stage and value are required' }, { status: 400 })
    }

    const enumVal = await prisma.statusEnum.create({
      data: {
        stage,
        value,
        displayOrder: displayOrder || 0,
        isActive: true,
      },
    })

    return NextResponse.json(enumVal, { status: 201 })
  } catch (error) {
    console.error('POST /api/status-enums error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
