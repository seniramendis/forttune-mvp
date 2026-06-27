import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Memory-optimized track manager mapping request occurrences per IP
const trackingCache = new Map<string, { count: number; ResetTimestamp: number }>();

// Roles permitted to access /admin routes
const ADMIN_ROLES = ['ADMIN'];

// Roles permitted to access /pos routes
const POS_ROLES = ['ADMIN', 'CASHIER'];

function parseSessionCookie(cookieValue: string): { role?: string } | null {
  try {
    const decoded = Buffer.from(cookieValue, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

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

  // ── 2. ADMIN ROUTE GUARD — requires ADMIN role ──
  if (urlPath.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('admin_session');

    if (!sessionCookie?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', urlPath);
      return NextResponse.redirect(loginUrl);
    }

    // FIX: Validate the role embedded in the session token, not just cookie presence
    const session = parseSessionCookie(sessionCookie.value);
    if (!session || !ADMIN_ROLES.includes(session.role ?? '')) {
      // Cookie exists but role is not ADMIN — send them to their correct home
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  // ── 3. POS ROUTE GUARD — requires ADMIN or CASHIER role ──
  if (urlPath.startsWith('/pos')) {
    const sessionCookie = request.cookies.get('admin_session');

    if (!sessionCookie?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', urlPath);
      return NextResponse.redirect(loginUrl);
    }

    const session = parseSessionCookie(sessionCookie.value);
    if (!session || !POS_ROLES.includes(session.role ?? '')) {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

// Protect both auth APIs and protected UI routes
export const config = {
  matcher: ['/api/auth/:path*', '/admin/:path*', '/pos/:path*'],
};
