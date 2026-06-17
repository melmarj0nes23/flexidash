import { auth } from "@/auth";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(20, "10 s"),
    })
  : null;

const authMiddleware = auth((req) => {
  const isLoggedIn = !!req.auth;
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  const isAuthPage = authRoutes.some(route => req.nextUrl.pathname.startsWith(route));
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/");

  if (isApiRoute) {
    return;
  }

  if (!isLoggedIn && !isAuthPage) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL("/", req.nextUrl));
  }
});

export default async function middleware(req: NextRequest, event: any) {
  if (ratelimit) {
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);
    
    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: "Too Many Requests. Please slow down." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }
  }

  return authMiddleware(req, event);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
