import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = request.nextUrl

  // Allow auth-related routes
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/clients/:path*',
    '/pipeline/:path*',
    '/analytics/:path*',
    '/api/clients/:path*',
    '/api/analytics/:path*',
    '/api/invoices/:path*',
    '/api/users/:path*',
    '/api/status-enums/:path*',
  ],
}
