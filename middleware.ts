import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export default auth((req) => {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const role = req.auth?.user?.role;

    if (role !== "ADMIN" && role !== "HR_OFFICER") {
      return NextResponse.redirect(new URL("/employee/profile", req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*"],
};
