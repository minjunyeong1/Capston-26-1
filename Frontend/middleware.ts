// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('user_id')?.value || ''; // 쿠키나 로컬스토리지 방식에 맞춰 수정
  const { pathname } = request.nextUrl;

  // 1. 로그인 없이 접근 가능한 페이지들
  if (pathname.startsWith('/auth') || pathname === '/') {
    return NextResponse.next();
  }

  // 2. 로그인되지 않았는데 대시보드(학습, 마이페이지, 달력)에 접근하려고 하면 로그인 페이지로!
  if (!userId && pathname.startsWith('/')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// 미들웨어를 적용할 경로
export const config = {
  matcher: ['/study/:path*', '/mypage/:path*', '/calendar/:path*'],
};