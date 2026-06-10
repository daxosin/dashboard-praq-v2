ALTER TABLE public.revue_direction
  ADD COLUMN IF NOT EXISTS perimetre text NOT NULL DEFAULT 'GLOBAL';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'revue_direction_perimetre_check'
      AND conrelid = 'public.revue_direction'::regclass
  ) THEN
    ALTER TABLE public.revue_direction
      ADD CONSTRAINT revue_direction_perimetre_check
      CHECK (perimetre IN ('GLOBAL', 'OFFICINE', 'PDA'));
  END IF;
END$$;

COMMENT ON COLUMN public.revue_direction.perimetre IS
  'Périmètre de la revue de direction : GLOBAL (défaut) | OFFICINE | PDA. Le freeze snapshote l''état qualité scopé à ce périmètre.';

CREATE OR REPLACE FUNCTION public.fn_auto_freeze_rdd() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND COALESCE(OLD.statut, '') <> 'REALISEE'
     AND NEW.statut = 'REALISEE'
     AND NEW.snapshot_at IS NULL
  THEN
    NEW.snapshot_smq := (SELECT to_jsonb(k.*) FROM public.kpi_smq_current_scoped(NEW.perimetre) k LIMIT 1);

    NEW.snapshot_capa := COALESCE((SELECT jsonb_agg(to_jsonb(c.*)) FROM public.capa c
      WHERE c.deleted_at IS NULL AND (
            NEW.perimetre = 'GLOBAL'
         OR (NEW.perimetre = 'PDA'      AND      public.praq_is_pda(c.processus_id, c.praq_overrides))
         OR (NEW.perimetre = 'OFFICINE' AND NOT  public.praq_is_pda(c.processus_id, c.praq_overrides)))), '[]'::jsonb);

    NEW.snapshot_audits := COALESCE((SELECT jsonb_agg(to_jsonb(a.*)) FROM public.audits a
      WHERE a.deleted_at IS NULL AND (
            NEW.perimetre = 'GLOBAL'
         OR (NEW.perimetre = 'PDA'      AND      public.praq_is_pda(a.processus_id, a.praq_overrides))
         OR (NEW.perimetre = 'OFFICINE' AND NOT  public.praq_is_pda(a.processus_id, a.praq_overrides)))), '[]'::jsonb);

    NEW.snapshot_fournisseurs := COALESCE((SELECT jsonb_agg(to_jsonb(f.*)) FROM public.fournisseurs f
      WHERE f.deleted_at IS NULL), '[]'::jsonb);

    NEW.snapshot_risques := COALESCE((SELECT jsonb_agg(to_jsonb(r.*)) FROM public.risques r
      WHERE r.deleted_at IS NULL AND (
            NEW.perimetre = 'GLOBAL'
         OR (NEW.perimetre = 'PDA'      AND      public.praq_is_pda(r.processus_id, r.praq_overrides))
         OR (NEW.perimetre = 'OFFICINE' AND NOT  public.praq_is_pda(r.processus_id, r.praq_overrides)))), '[]'::jsonb);

    NEW.snapshot_reclamations := COALESCE((SELECT jsonb_agg(to_jsonb(rc.*)) FROM public.reclamations rc
      WHERE rc.deleted_at IS NULL AND (
            NEW.perimetre = 'GLOBAL'
         OR (NEW.perimetre = 'PDA'      AND      public.praq_is_pda(rc.processus_id, rc.praq_overrides))
         OR (NEW.perimetre = 'OFFICINE' AND NOT  public.praq_is_pda(rc.processus_id, rc.praq_overrides)))), '[]'::jsonb);

    NEW.snapshot_at := now();
    NEW.snapshot_by := public.fn_actor_uid();
    NEW.frozen_at   := now();
    NEW.frozen_by   := public.fn_actor_uid();
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.freeze_rdd(p_rdd_id uuid) RETURNS public.revue_direction
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_rdd        public.revue_direction;
  v_actor_uid  uuid := public.fn_actor_uid();
  v_p          text;
BEGIN
  SELECT * INTO v_rdd FROM public.revue_direction WHERE id = p_rdd_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Revue de direction % introuvable.', p_rdd_id USING ERRCODE = 'no_data_found';
  END IF;
  IF v_rdd.snapshot_at IS NOT NULL THEN
    RETURN v_rdd;
  END IF;
  v_p := v_rdd.perimetre;

  UPDATE public.revue_direction
  SET
    snapshot_smq = (SELECT to_jsonb(k.*) FROM public.kpi_smq_current_scoped(v_p) k LIMIT 1),
    snapshot_capa = COALESCE((SELECT jsonb_agg(to_jsonb(c.*)) FROM public.capa c
      WHERE c.deleted_at IS NULL AND (
            v_p = 'GLOBAL'
         OR (v_p = 'PDA'      AND      public.praq_is_pda(c.processus_id, c.praq_overrides))
         OR (v_p = 'OFFICINE' AND NOT  public.praq_is_pda(c.processus_id, c.praq_overrides)))), '[]'::jsonb),
    snapshot_audits = COALESCE((SELECT jsonb_agg(to_jsonb(a.*)) FROM public.audits a
      WHERE a.deleted_at IS NULL AND (
            v_p = 'GLOBAL'
         OR (v_p = 'PDA'      AND      public.praq_is_pda(a.processus_id, a.praq_overrides))
         OR (v_p = 'OFFICINE' AND NOT  public.praq_is_pda(a.processus_id, a.praq_overrides)))), '[]'::jsonb),
    snapshot_fournisseurs = COALESCE((SELECT jsonb_agg(to_jsonb(f.*)) FROM public.fournisseurs f
      WHERE f.deleted_at IS NULL), '[]'::jsonb),
    snapshot_risques = COALESCE((SELECT jsonb_agg(to_jsonb(r.*)) FROM public.risques r
      WHERE r.deleted_at IS NULL AND (
            v_p = 'GLOBAL'
         OR (v_p = 'PDA'      AND      public.praq_is_pda(r.processus_id, r.praq_overrides))
         OR (v_p = 'OFFICINE' AND NOT  public.praq_is_pda(r.processus_id, r.praq_overrides)))), '[]'::jsonb),
    snapshot_reclamations = COALESCE((SELECT jsonb_agg(to_jsonb(rc.*)) FROM public.reclamations rc
      WHERE rc.deleted_at IS NULL AND (
            v_p = 'GLOBAL'
         OR (v_p = 'PDA'      AND      public.praq_is_pda(rc.processus_id, rc.praq_overrides))
         OR (v_p = 'OFFICINE' AND NOT  public.praq_is_pda(rc.processus_id, rc.praq_overrides)))), '[]'::jsonb),
    snapshot_at = now(),
    snapshot_by = v_actor_uid,
    frozen_at   = now(),
    frozen_by   = v_actor_uid
  WHERE id = p_rdd_id
  RETURNING * INTO v_rdd;

  PERFORM public.fn_archive_smq_score();
  RETURN v_rdd;
END;
$$;
