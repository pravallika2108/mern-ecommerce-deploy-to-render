import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/auth/register", "/auth/login"];
const superAdminRoutes = ["/super-admin", "/super-admin/:path*"];
const userRoutes = ["/home"];

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  if (accessToken) {
    try {
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(process.env.JWT_SECRET)
      );
      const { role } = payload as { role: string };

      // If user is already logged in and trying to access auth pages, redirect based on role
      if (publicRoutes.includes(pathname)) {
        return NextResponse.redirect(
          new URL(role === "SUPER_ADMIN" ? "/super-admin" : "/home", request.url)
        );
      }

      // Super admin trying to access user pages? Redirect to super-admin dashboard
      if (
        role === "SUPER_ADMIN" &&
        userRoutes.some((route) => pathname.startsWith(route))
      ) {
        return NextResponse.redirect(new URL("/super-admin", request.url));
      }

      // Non-super-admin trying to access super-admin pages? Redirect to user home
      if (
        role !== "SUPER_ADMIN" &&
        superAdminRoutes.some((route) => pathname.startsWith(route))
      ) {
        return NextResponse.redirect(new URL("/home", request.url));
      }

      // Everything's fine, let them continue
      return NextResponse.next();
    } catch (e) {
      console.error("Token verification failed", e);

      // Use your deployed backend URL for refreshing token
     const backendUrl = process.env.NEXT_PUBLIC_API_URL 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`
        : "http://localhost:3001/api/auth/refresh-token";
      const refreshResponse = await fetch(backendUrl, {
        method: "POST",
        headers: {
          // Forward cookies so backend gets the refreshToken cookie
          cookie: request.headers.get("cookie") || "",
        },
        credentials: "include",
      });

      if (refreshResponse.ok) {
        // Tokens refreshed successfully; continue to requested page
        return NextResponse.next();
      } else {
        // Refresh token invalid/expired; clear cookies and redirect to login
        const response = NextResponse.redirect(new URL("/auth/login", request.url));
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        return response;
      }
    }
  }

  // No access token and trying to access a protected route -> redirect to login
  if (!publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Public route - allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"], // Protect all routes except API and static files
};
