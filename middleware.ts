import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // All authentication validation is handled client-side since the server cannot access localStorage.
  // The dashboard layout component handles authentication checks and redirects.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
