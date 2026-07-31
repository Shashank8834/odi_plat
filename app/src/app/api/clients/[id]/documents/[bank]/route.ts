import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateBundle, isBankKey } from '@/lib/odi-docs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bank: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, bank } = await params
    if (!isBankKey(bank)) {
      return NextResponse.json({ error: 'Unknown bank' }, { status: 400 })
    }

    const client = await prisma.client.findUnique({
      where: { id, isDeleted: false },
      select: { name: true, partner: true, email: true },
    })
    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { filename, buffer, passedThrough } = await generateBundle(bank, client)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/zip',
        // filename* carries the real name; the ASCII filename is the fallback.
        'Content-Disposition':
          `attachment; filename="odi-drafts-${bank}.zip"; ` +
          `filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Content-Length': String(buffer.length),
        'X-Passed-Through': String(passedThrough.length),
      },
    })
  } catch (error) {
    console.error('GET /api/clients/[id]/documents/[bank] error:', error)
    return NextResponse.json({ error: 'Failed to generate documents' }, { status: 500 })
  }
}
