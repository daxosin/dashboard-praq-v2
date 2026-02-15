import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Export data to JSON file
 */
export function exportToJson(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export all tables data
 */
export async function exportAllData(supabase: SupabaseClient): Promise<void> {
  const tables = [
    'domains',
    'sops',
    'capas',
    'audits',
    'audit_findings',
    'risks',
    'vigilances',
    'recalls',
    'staff',
    'qualifications',
    'trainings',
    'equipment',
    'maintenance',
    'suppliers',
    'supplier_events',
    'complaints',
    'indicators',
    'indicator_values',
    'reviews',
    'review_actions',
  ];

  const data: Record<string, any[]> = {};

  for (const table of tables) {
    const { data: rows } = await supabase.from(table).select('*');
    data[table] = rows || [];
  }

  exportToJson(data, `pharma78-backup-${new Date().toISOString().slice(0, 10)}.json`);
}

/**
 * Export single table data
 */
export function exportTabData(tableName: string, data: any[]): void {
  exportToJson(data, `pharma78-${tableName}-${new Date().toISOString().slice(0, 10)}.json`);
}

/**
 * Allowed tables for import (whitelist)
 */
const ALLOWED_TABLES = [
  'domains',
  'sops',
  'capas',
  'audits',
  'audit_findings',
  'risks',
  'vigilances',
  'recalls',
  'staff',
  'qualifications',
  'trainings',
  'equipment',
  'maintenance',
  'suppliers',
  'supplier_events',
  'complaints',
  'indicators',
  'indicator_values',
  'reviews',
  'review_actions',
];

/**
 * Sanitize string value to prevent XSS
 */
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    // Remove potentially dangerous characters
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .slice(0, 10000); // Max length protection
  }
  return value;
}

/**
 * Validate and sanitize a single row
 */
function validateRow(row: any): { valid: boolean; sanitized?: any } {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return { valid: false };
  }

  // Check for mass assignment attack - limit number of fields
  const keys = Object.keys(row);
  if (keys.length > 50) {
    return { valid: false };
  }

  // Sanitize all string values
  const sanitized: any = {};
  for (const [key, value] of Object.entries(row)) {
    // Skip dangerous field names
    if (key.includes('__proto__') || key.includes('constructor') || key.includes('prototype')) {
      continue;
    }

    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeValue(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // For nested objects, stringify and sanitize
      sanitized[key] = sanitizeValue(JSON.stringify(value));
    } else {
      sanitized[key] = value;
    }
  }

  return { valid: true, sanitized };
}

/**
 * Import data from JSON with validation and sanitization
 */
export async function importData(
  supabase: SupabaseClient,
  jsonData: Record<string, any[]>
): Promise<Record<string, { success: number; errors: number; warnings: string[] }>> {
  const results: Record<string, { success: number; errors: number; warnings: string[] }> = {};

  for (const [table, rows] of Object.entries(jsonData)) {
    let success = 0;
    let errors = 0;
    const warnings: string[] = [];

    // Validate table name (prevent SQL injection via table name)
    if (!ALLOWED_TABLES.includes(table)) {
      warnings.push(`Table "${table}" non autorisée`);
      continue;
    }

    // Validate rows is an array
    if (!Array.isArray(rows)) {
      warnings.push(`Les données de "${table}" ne sont pas un tableau`);
      continue;
    }

    // Limit number of rows to prevent DoS
    if (rows.length > 10000) {
      warnings.push(`Trop de lignes pour "${table}" (max 10000)`);
      continue;
    }

    for (const row of rows) {
      const validation = validateRow(row);
      if (!validation.valid) {
        errors++;
        warnings.push(`Ligne invalide dans "${table}"`);
        continue;
      }

      const { error } = await supabase
        .from(table)
        .upsert(validation.sanitized, { onConflict: 'id' });

      if (error) {
        errors++;
        // Don't log full error to prevent info leakage
      } else {
        success++;
      }
    }

    results[table] = { success, errors, warnings };
  }

  return results;
}
