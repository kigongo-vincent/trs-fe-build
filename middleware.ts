import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Unconditionally allow all requests
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
