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

    const notes = await prisma.note.findMany({
      where: { clientId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('GET /api/clients/[id]/notes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const { content } = await request.json()
    if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 })

    const note = await prisma.note.create({
      data: {
        clientId: id,
        content,
        author: session.user.name ?? session.user.email ?? 'Unknown',
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('POST /api/clients/[id]/notes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
