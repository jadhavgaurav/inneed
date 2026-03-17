import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('access_token')?.value

  // Protected routes
  const customerRoutes = ['/cart', '/checkout', '/orders', '/rentals', '/saved', '/profile']
  const vendorRoutes = ['/vendor/dashboard', '/vendor/listings', '/vendor/bookings', '/vendor/calendar', '/vendor/earnings']
  const adminRoutes = ['/admin']

  const isProtected =
    customerRoutes.some(r => pathname.startsWith(r)) ||
    vendorRoutes.some(r => pathname.startsWith(r)) ||
    adminRoutes.some(r => pathname.startsWith(r))

  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
