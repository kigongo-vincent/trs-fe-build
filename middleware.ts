import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/signup",
  "/api",
  "/_next",
  "/favicon.ico",
  "/public",
];

function isPublic(path: string) {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Only protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    // Try to get token and user from cookies (for future), fallback to localStorage (client-side)
    // For now, we can't access localStorage here, so only basic protection
    // You should move token to cookies for full SSR protection
    // Redirect to / if not authenticated
    const token = request.cookies.get("token")?.value;
    const userStr = request.cookies.get("user")?.value;
    if (!token || !userStr) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    // Parse user and check role
    let user;
    try {
      user = JSON.parse(decodeURIComponent(userStr));
    } catch {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    const role = user?.role?.name;
    // Role-based protection
    // REMOVE super-admin role check
    // if (
    //   pathname.startsWith("/dashboard/super-admin") &&
    //   role !== "Super Admin"
    // ) {
    //   const url = request.nextUrl.clone();
    //   url.pathname =
    //     role === "Company Admin"
    //       ? "/dashboard/company-admin"
    //       : "/dashboard/employee";
    //   return NextResponse.redirect(url);
    // }
    if (
      pathname.startsWith("/dashboard/company-admin") &&
      role !== "Company Admin"
    ) {
      const url = request.nextUrl.clone();
      url.pathname =
        role === "Super Admin"
          ? "/dashboard/super-admin"
          : "/dashboard/employee";
      return NextResponse.redirect(url);
    }
    if (
      pathname.startsWith("/dashboard/employee") &&
      role !== "Consultant" &&
      role !== "Employee" &&
      role !== "Consultancy"
    ) {
      const url = request.nextUrl.clone();
      url.pathname =
        role === "Super Admin"
          ? "/dashboard/super-admin"
          : "/dashboard/company-admin";
      return NextResponse.redirect(url);
    }
    // TODO: Add token expiry check if you move token to cookies
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
