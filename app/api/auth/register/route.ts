import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
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
    });
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
