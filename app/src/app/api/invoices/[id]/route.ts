import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { invoiceNo, amount, status, paymentDate } = await request.json()

    const existing = await prisma.invoice.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const data: Record<string, unknown> = {}
    if (invoiceNo !== undefined) data.invoiceNo = invoiceNo || null
    if (amount !== undefined) data.amount = amount ? parseFloat(amount) : null
    if (status !== undefined) data.status = status
    if (paymentDate !== undefined) data.paymentDate = paymentDate ? new Date(paymentDate) : null

    const invoice = await prisma.invoice.update({
      where: { id },
      data,
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('PATCH /api/invoices/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
