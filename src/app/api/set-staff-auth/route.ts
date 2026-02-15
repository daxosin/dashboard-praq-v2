import { NextRequest, NextResponse } from "next/server";

/**
 * Set secure staff authentication cookie
 * This endpoint should be called after PIN verification
 */
export async function POST(request: NextRequest) {
  try {
    const { staffId, name, role } = await request.json();

    if (!staffId || !name || !role) {
      return NextResponse.json(
        { success: false, message: "Données manquantes" },
        { status: 400 }
      );
    }

    const cookieData = JSON.stringify({ id: staffId, name, role });

    // Set secure cookie with proper flags
    const cookieOptions = [
      `staff_auth=${encodeURIComponent(cookieData)}`,
      "Path=/",
      "Max-Age=3600", // 1 hour
      "SameSite=Strict", // CSRF protection
      // Note: HttpOnly cannot be set from client-side JavaScript
      // Note: Secure flag should be set in production (HTTPS only)
      process.env.NODE_ENV === "production" ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    const response = NextResponse.json({ success: true });
    response.headers.set("Set-Cookie", cookieOptions);

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * Clear staff authentication cookie
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    "staff_auth=; Path=/; Max-Age=0; SameSite=Strict"
  );
  return response;
}
