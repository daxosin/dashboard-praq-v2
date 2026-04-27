-- ============================================================
-- Ajout colonne score_global à kpi_history
-- Migration appliquée en production le 2026-04-08 13:20:10 UTC
-- Rapatriée localement le 2026-04-27
-- ============================================================

ALTER TABLE kpi_history ADD COLUMN IF NOT EXISTS score_global numeric;
