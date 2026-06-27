import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Memory-optimized track manager mapping request occurrences per IP
const trackingCache = new Map<string, { count: number; ResetTimestamp: number }>();

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'global_client';
  const urlPath = request.nextUrl.pathname;

  // ── 1. RATE LIMITING LAYER (Hardens Login/Register Endpoints) ──
  if (urlPath.startsWith('/api/auth/login') || urlPath.startsWith('/api/auth/register')) {
    const currentTime = Date.now();
    const clientRecord = trackingCache.get(ip);

    if (!clientRecord) {
      trackingCache.set(ip, { count: 1, ResetTimestamp: currentTime + 60 * 1000 });
      return NextResponse.next();
    }

    if (currentTime > clientRecord.ResetTimestamp) {
      trackingCache.set(ip, { count: 1, ResetTimestamp: currentTime + 60 * 1000 });
      return NextResponse.next();
    }

    clientRecord.count += 1;

    if (clientRecord.count > 10) {
      return new NextResponse(
        JSON.stringify({ error: "Too many authentication attempts. Please try again later." }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // ── 2. SECURE ADMIN PAGE ROUTE GUARD LAYER ──
  // Intercepts any request trying to access layout paths under /admin
  if (urlPath.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('admin_session');

    // If the high-entropy HTTP-Only cookie token is completely missing, redirect instantly
    if (!sessionCookie || !sessionCookie.value) {
      const loginRedirectUrl = new URL('/login', request.url);
      // Optional: Pass along the target URL path so they can return here after signing in
      loginRedirectUrl.searchParams.set('from', urlPath); 
      return NextResponse.redirect(loginRedirectUrl);
    }
  }

  return NextResponse.next();
}

// Map configuration bounds to protect both the auth APIs and the admin UI pages
export const config = {
  matcher: ['/api/auth/:path*', '/admin/:path*'],
};