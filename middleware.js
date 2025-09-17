// middleware.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Public routes (no login required)
  const publicPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/products', // public but restricted for admins
    '/contact', // fully public now
  ];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // 1 Logged-in user visiting a public page → redirect based on role
  if (isPublicPath && token && !pathname.startsWith('/products')) {
    return NextResponse.redirect(
      new URL(token.role === 'admin' ? '/dashboard' : '/', req.url)
    );
  }

  // Restrict /products for admins
  if (pathname.startsWith('/products') && token?.role === 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 2 Not logged in → block protected pages (except public)
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 3 Admin-only routes
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/add-product') ||
    pathname.startsWith('/all-products')
  ) {
    if (token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Both user & admin can access /profile
  if (pathname.startsWith('/profile') && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/dashboard/:path*',
    '/users/:path*',
    '/reports/:path*',
    '/add-product',
    '/all-products',
    '/products/:path*', // public but admin-blocked
    '/contact/:path*', // fully public
    '/profile', // requires login (both admin & user allowed)
  ],
};
