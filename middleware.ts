import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/gate', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route requires protection
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    // In a real app, you'd verify the Firebase token here
    // For now, we'll let the client-side useAuth hook handle protection
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)'],
};
