import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/auth';

// Define which paths are protected and require authentication
const protectedPaths = [
  '/dashboard',
  '/employees',
  '/clients',
  '/projects',
  '/attendance',
  '/leave',
  '/settings',
];

// Define which paths are public and don't require authentication
const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth',
];

// Define which paths are API routes
const apiPaths = [
  '/api/',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public paths and static files
  if (
    publicPaths.some(path => pathname.startsWith(path)) ||
    pathname.includes('/_next/') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('/public/')
  ) {
    return NextResponse.next();
  }
  
  // For API routes, let the route handlers handle authentication
  if (apiPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  if (isProtectedPath) {
    // Get the token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      // Redirect to login if no token is found
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      return NextResponse.redirect(url);
    }
    
    try {
      // Verify the token
      const payload = await verifyJWT(token);
      
      if (!payload) {
        // Redirect to login if token is invalid
        const url = new URL('/login', request.url);
        url.searchParams.set('callbackUrl', encodeURI(pathname));
        return NextResponse.redirect(url);
      }
      
      // Token is valid, allow access
      return NextResponse.next();
    } catch (error) {
      // Redirect to login if token verification fails
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      return NextResponse.redirect(url);
    }
  }
  
  // For all other paths, allow access
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
