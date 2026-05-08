import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'fr', 'ar'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  const pathLocale = locales.find((l) =>
    request.nextUrl.pathname.startsWith(`/${l}`)
  );
  if (pathLocale) return pathLocale;

  const acceptLang = request.headers.get('accept-language') || '';
  const preferred = locales.find((l) => acceptLang.startsWith(l));
  return preferred || defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API, static files, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/locales') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if locale is in path
  const pathnameHasLocale = locales.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|locales|favicon.ico).*)',
  ],
};
