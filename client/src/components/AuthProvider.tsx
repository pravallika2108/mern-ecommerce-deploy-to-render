"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const publicRoutes = ["/auth/register", "/auth/login"];
const superAdminRoutes = ["/super-admin"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth, user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check auth on mount
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Handle redirects based on auth state
    if (isAuthenticated && user) {
      // If authenticated and on public route, redirect to appropriate page
      if (publicRoutes.includes(pathname)) {
        if (user.role === "SUPER_ADMIN") {
          router.push("/super-admin");
        } else {
          router.push("/home");
        }
      }

      // If regular user trying to access super admin routes
      if (user.role !== "SUPER_ADMIN" && superAdminRoutes.some(route => pathname.startsWith(route))) {
        router.push("/home");
      }

      // If super admin trying to access user routes
      if (user.role === "SUPER_ADMIN" && pathname.startsWith("/home")) {
        router.push("/super-admin");
      }
    } else if (!isAuthenticated && !publicRoutes.includes(pathname)) {
      // Not authenticated and trying to access protected route
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, pathname, router]);

  return <>{children}</>;
}
