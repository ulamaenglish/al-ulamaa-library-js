import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginRateLimit } from "@/lib/ratelimit";

export async function POST(request: Request) {
  try {
    // 🛡️ RATE LIMITING: Check login attempts
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { success, limit, remaining, reset } = await loginRateLimit.limit(ip);

    if (!success) {
      const resetTime = new Date(reset);
      console.warn(`⚠️ Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        {
          error: `Too many login attempts. Please try again at ${resetTime.toLocaleTimeString()}`,
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }

    console.log(
      `🔓 Login attempt - IP: ${ip} - Remaining: ${remaining}/${limit}`
    );

    const { password } = await request.json();
    // ... rest of your code stays the same

    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
      console.warn("⚠️ Failed login attempt");
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const sessionToken = `admin_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2)}`;

    console.log("✅ Login successful");
    console.log("Setting cookie:", sessionToken.substring(0, 20) + "...");

    // Set cookie using Next.js cookies() API
    const cookieStore = await cookies();
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 24 hours
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
