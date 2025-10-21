import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { registerUser } from "@/lib/database";

// Rate limiter: 5 registrations per hour per IP
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
});

export async function POST(request: NextRequest) {
  try {
    // ✅ FIX: Get IP address properly in Next.js 15
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwardedFor?.split(",")[0] ?? realIp ?? "unknown";

    // Check rate limit
    const { success, remaining, reset } = await ratelimit.limit(
      `register_${ip}`
    );

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many registration attempts. Please try again in ${Math.ceil(
            (reset - Date.now()) / 1000 / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    // Parse request body
    const { username, email, password, fullName } = await request.json();

    // Validate inputs
    if (!username || !email || !password || !fullName) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate username format (alphanumeric, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Username must be 3-20 characters (letters, numbers, underscore only)",
        },
        { status: 400 }
      );
    }

    // Validate password strength (min 6 chars)
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Register user
    const result = await registerUser(username, email, password, fullName);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully!",
      remaining: remaining - 1,
    });
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
