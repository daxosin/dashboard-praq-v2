ALTER TABLE public.kpi_history
  ADD COLUMN IF NOT EXISTS perimetre text NOT NULL DEFAULT 'GLOBAL';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'kpi_history_perimetre_check'
      AND conrelid = 'public.kpi_history'::regclass
  ) THEN
    ALTER TABLE public.kpi_history
      ADD CONSTRAINT kpi_history_perimetre_check
      CHECK (perimetre IN ('GLOBAL', 'OFFICINE', 'PDA'));
  END IF;
END$$;

ALTER TABLE public.kpi_history DROP CONSTRAINT IF EXISTS kpi_history_date_calcul_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'kpi_history_date_perimetre_key'
      AND conrelid = 'public.kpi_history'::regclass
  ) THEN
    ALTER TABLE public.kpi_history
      ADD CONSTRAINT kpi_history_date_perimetre_key
      UNIQUE (date_calcul, perimetre);
  END IF;
END$$;

COMMENT ON COLUMN public.kpi_history.perimetre IS
  'Périmètre du snapshot de score : GLOBAL (défaut, rétrocompat) | OFFICINE | PDA. UNIQUE(date_calcul, perimetre) → un score par périmètre par jour.';
