import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Rate limiting: in-memory store (IP -> {attempts, resetTime})
const rateLimitStore = new Map<string, { attempts: number; resetTime: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 60000; // 1 minute

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 300000);

/**
 * Check rate limiting for given IP
 * Returns true if rate limit exceeded
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { attempts: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return true;
  }

  record.attempts++;
  return false;
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0] || realIP || "unknown";
}

/**
 * Constant-time comparison to prevent timing attacks
 * Compares PIN against all hashes regardless of match
 */
async function verifyPinConstantTime(
  pin: string,
  staffPins: any[]
): Promise<any | null> {
  let matchedStaffPin: any = null;

  // CRITICAL: Compare against ALL pins to prevent timing attacks
  // This ensures the response time is constant regardless of match position
  for (const staffPin of staffPins) {
    const isMatch = await bcrypt.compare(pin, staffPin.pin_hash);
    // Use timing-safe assignment
    if (isMatch && !matchedStaffPin) {
      matchedStaffPin = staffPin;
    }
  }

  return matchedStaffPin;
}

export async function POST(request: NextRequest) {
  // Security headers
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    "Pragma": "no-cache",
    "X-Content-Type-Options": "nosniff",
  };

  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    if (checkRateLimit(clientIP)) {
      return NextResponse.json(
        { success: false, message: "Trop de tentatives. Réessayez dans 1 minute." },
        { status: 429, headers }
      );
    }

    const { pin } = await request.json();

    // Strict input validation: PIN must be exactly 4 digits
    if (!pin || typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { success: false, message: "PIN invalide" },
        { status: 400, headers }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: staffPins, error: fetchError } = await supabase
      .from("staff_pins")
      .select(`
        id,
        staff_id,
        pin_hash,
        locked,
        failed_attempts,
        staff:staff_id (
          id,
          name,
          role
        )
      `)
      .eq("locked", false);

    if (fetchError) {
      // Don't leak error details to client
      return NextResponse.json(
        { success: false, message: "Erreur serveur" },
        { status: 500, headers }
      );
    }

    // Return generic error even if no staff pins exist
    // This prevents leaking information about the number of staff
    if (!staffPins || staffPins.length === 0) {
      return NextResponse.json(
        { success: false, message: "PIN incorrect" },
        { status: 401, headers }
      );
    }

    // Use constant-time verification to prevent timing attacks
    const matchedStaffPin = await verifyPinConstantTime(pin, staffPins);

    if (matchedStaffPin) {
      // Reset failed attempts on success
      await supabase
        .from("staff_pins")
        .update({ failed_attempts: 0 })
        .eq("id", matchedStaffPin.id);

      const staff = Array.isArray(matchedStaffPin.staff)
        ? matchedStaffPin.staff[0]
        : matchedStaffPin.staff;

      return NextResponse.json(
        {
          success: true,
          staff: {
            id: staff.id,
            name: staff.name,
            role: staff.role,
          },
        },
        { headers }
      );
    }

    // Generic error message - don't leak information
    return NextResponse.json(
      { success: false, message: "PIN incorrect" },
      { status: 401, headers }
    );
  } catch (error) {
    // Don't leak error details to client
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500, headers }
    );
  }
}
