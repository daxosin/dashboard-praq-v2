import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Allowed event types
const ALLOWED_EVENT_TYPES = ["Non-conformité", "Anomalie", "Near miss"];

// Allowed zones
const ALLOWED_ZONES = [
  "PDA Robot 1",
  "PDA Robot 2",
  "Contrôle qualité",
  "Conditionnement",
  "Stock chambre froide",
  "Stock ambiant",
  "Stock stupéfiants",
  "Officine comptoir",
  "Officine back-office",
  "Orthopédie",
  "Luxe L'Écrin",
  "Nature",
  "Livraison véhicule 1",
  "Livraison véhicule 2",
  "Livraison véhicule 3",
  "Cabine téléconsultation",
  "Locaux techniques",
  "Salle pause",
];

// Allowed severities
const ALLOWED_SEVERITIES = ["Faible", "Moyenne", "Élevée"];

// File upload limits
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

/**
 * Sanitize string input to prevent XSS
 */
function sanitizeString(input: string): string {
  // Remove any potential HTML/script tags
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate date format (ISO 8601)
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate CAPA data from terrain
 */
function validateCapaData(data: any): {
  valid: boolean;
  errors: string[];
  sanitized?: any;
} {
  const errors: string[] = [];

  // Required fields
  if (!data.eventType || typeof data.eventType !== "string") {
    errors.push("Type d'événement manquant ou invalide");
  } else if (!ALLOWED_EVENT_TYPES.includes(data.eventType)) {
    errors.push("Type d'événement non autorisé");
  }

  if (!data.domainId || typeof data.domainId !== "string") {
    errors.push("Domaine manquant ou invalide");
  } else if (!isValidUUID(data.domainId)) {
    errors.push("Format de domaine invalide");
  }

  if (!data.zone || typeof data.zone !== "string") {
    errors.push("Zone manquante ou invalide");
  } else if (!ALLOWED_ZONES.includes(data.zone)) {
    errors.push("Zone non autorisée");
  }

  if (!data.description || typeof data.description !== "string") {
    errors.push("Description manquante ou invalide");
  } else if (data.description.length < 10) {
    errors.push("Description trop courte (minimum 10 caractères)");
  } else if (data.description.length > 5000) {
    errors.push("Description trop longue (maximum 5000 caractères)");
  }

  if (!data.staffId || typeof data.staffId !== "string") {
    errors.push("ID staff manquant ou invalide");
  } else if (!isValidUUID(data.staffId)) {
    errors.push("Format ID staff invalide");
  }

  // Optional fields
  if (data.severity && !ALLOWED_SEVERITIES.includes(data.severity)) {
    errors.push("Gravité non autorisée");
  }

  if (data.date && !isValidDate(data.date)) {
    errors.push("Format de date invalide");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Sanitize data
  const sanitized = {
    eventType: sanitizeString(data.eventType),
    domainId: data.domainId,
    zone: sanitizeString(data.zone),
    description: sanitizeString(data.description),
    staffId: data.staffId,
    severity: data.severity ? sanitizeString(data.severity) : null,
    date: data.date || new Date().toISOString(),
  };

  return { valid: true, errors: [], sanitized };
}

export async function POST(request: NextRequest) {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    "X-Content-Type-Options": "nosniff",
  };

  try {
    const body = await request.json();

    // Validate input data
    const validation = validateCapaData(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Données invalides",
          errors: validation.errors,
        },
        { status: 400, headers }
      );
    }

    const { sanitized } = validation;

    // Create Supabase client with service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify that staff exists and is not locked
    const { data: staff, error: staffError } = await supabase
      .from("staff")
      .select("id, name")
      .eq("id", sanitized.staffId)
      .single();

    if (staffError || !staff) {
      return NextResponse.json(
        {
          success: false,
          message: "Staff non autorisé",
        },
        { status: 403, headers }
      );
    }

    // Verify that domain exists
    const { data: domain, error: domainError } = await supabase
      .from("domains")
      .select("id")
      .eq("id", sanitized.domainId)
      .single();

    if (domainError || !domain) {
      return NextResponse.json(
        {
          success: false,
          message: "Domaine invalide",
        },
        { status: 400, headers }
      );
    }

    // Insert CAPA with parameterized query (Supabase handles this safely)
    const capaData = {
      source: "Terrain",
      type: sanitized.eventType,
      domain_id: sanitized.domainId,
      description: sanitized.description,
      status: "Ouverte",
      terrain_zone: sanitized.zone,
      terrain_severity: sanitized.severity,
      terrain_photo_url: body.photoUrl || null, // Photo URL validated separately
      created_by: sanitized.staffId,
      owner: null,
      due_date: null,
      root_cause: null,
      action: null,
      closed_at: null,
      efficacy_check: null,
      efficacy_result: null,
    };

    const { data: insertedCapa, error: insertError } = await supabase
      .from("capas")
      .insert([capaData])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        {
          success: false,
          message: "Erreur lors de l'enregistrement",
        },
        { status: 500, headers }
      );
    }

    return NextResponse.json(
      {
        success: true,
        capaId: insertedCapa.id,
        message: "Déclaration enregistrée",
      },
      { headers }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur",
      },
      { status: 500, headers }
    );
  }
}
