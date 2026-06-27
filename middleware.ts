import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight, memory-optimized track manager mapping request occurrences per IP
const trackingCache = new Map<string, { count: number; ResetTimestamp: number }>();

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'global_client';
  const urlPath = request.nextUrl.pathname;

  // Apply protection controls strictly against authentication endpoints
  if (urlPath.startsWith('/api/auth/login') || urlPath.startsWith('/api/auth/register')) {
    const currentTime = Date.now();
    const clientRecord = trackingCache.get(ip);

    if (!clientRecord) {
      trackingCache.set(ip, { count: 1, ResetTimestamp: currentTime + 60 * 1000 }); // 1-minute tracking window
      return NextResponse.next();
    }

    if (currentTime > clientRecord.ResetTimestamp) {
      // Re-initialize window after timeframe window expiration passes
      trackingCache.set(ip, { count: 1, ResetTimestamp: currentTime + 60 * 1000 });
      return NextResponse.next();
    }

    clientRecord.count += 1;

    // Reject processing if an individual client drops more than 10 requests within a single minute
    if (clientRecord.count > 10) {
      return new NextResponse(
        JSON.stringify({ error: "Too many authentication attempts. Please try again later." }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/auth/:path*',
};