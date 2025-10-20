import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Get cookies from Next.js cookies() API
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    console.log("=== VERIFY ROUTE ===");
    console.log("Cookie from store:", sessionCookie?.value);

    // Also try getting from request headers as backup
    const cookieHeader = request.headers.get("cookie");
    console.log("Cookie header:", cookieHeader);

    if (!sessionCookie || !sessionCookie.value) {
      console.log("❌ No session found");
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    console.log(
      "✅ Session verified:",
      sessionCookie.value.substring(0, 20) + "..."
    );
    return NextResponse.json({
      authenticated: true,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
