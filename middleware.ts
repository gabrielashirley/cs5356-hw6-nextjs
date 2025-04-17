import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // reference: https://better-auth.vercel.app/docs/integrations/next#for-nextjs-release-1517-and-below
  // fetch get-session
  const response = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });
  
  const session = response.data;

  // redirect unauthenticated users from /todos to /auth/sign-in
  if (pathname.startsWith("/todos") && !session) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  if (pathname.startsWith("/admin")) {
    // redirect unauthenticated users from /admin to /auth/sign-in
    if (!session) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    // redirect non-admin users from /admin away from it
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // runtime: "nodejs" -- somehow my middleware module cannot be found if I use this
  // so I follow Better-Auth's docs for https://better-auth.vercel.app/docs/integrations/next#for-nextjs-release-1517-and-below
  matcher: ["/todos", "/admin"],
};
