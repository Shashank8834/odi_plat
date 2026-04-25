import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const client = await prisma.client.findUnique({
      where: { id, isDeleted: false },
      include: {
        invoices: { orderBy: { createdAt: 'desc' } },
        statusLogs: { orderBy: { timestamp: 'desc' }, take: 50 },
        clientNotes: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(client)
  } catch (error) {
    console.error('GET /api/clients/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const body = await request.json()
    const existing = await prisma.client.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Create audit log for each changed field
    const changedBy = session.user.email ?? session.user.name ?? 'unknown'
    const logEntries = []

    for (const [key, newValue] of Object.entries(body)) {
      const oldValue = (existing as any)[key]
      if (oldValue !== newValue) {
        logEntries.push({
          clientId: id,
          field: key,
          oldValue: oldValue ? String(oldValue) : null,
          newValue: newValue ? String(newValue) : null,
          changedBy,
        })
      }
    }

    const [updated] = await prisma.$transaction([
      prisma.client.update({ where: { id }, data: body }),
      ...logEntries.map((entry) => prisma.statusLog.create({ data: entry })),
    ])

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH /api/clients/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params

    await prisma.client.update({
      where: { id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/clients/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
