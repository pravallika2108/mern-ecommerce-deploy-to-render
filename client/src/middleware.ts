import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/auth/register", "/auth/login"];

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;
 console.log(accessToken);
  // If user has access token and trying to access public routes, redirect to home
  if (accessToken && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // If no access token and trying to access protected routes, redirect to login
  if (!accessToken && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
