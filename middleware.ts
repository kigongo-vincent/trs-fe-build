import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Server middleware cannot access localStorage where user session is stored.
  // Allow requests to pass through; client-side guards will handle redirects.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
