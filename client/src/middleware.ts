import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/auth/register", "/auth/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes without any checks
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // For all other routes, just let them through
  // The client-side will handle authentication checks and redirects
  // because middleware cannot access httpOnly cookies from cross-origin backend
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
