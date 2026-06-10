CREATE OR REPLACE FUNCTION public.praq_is_pda(p_processus_id uuid, p_overrides jsonb)
RETURNS boolean
LANGUAGE sql IMMUTABLE
AS $$
  SELECT COALESCE(p_processus_id = 'ae3eb056-6419-4be2-bb67-8bbad5fb8408'::uuid, false)
      OR COALESCE(p_overrides ->> 'perimetre' = 'PDA', false);
$$;

CREATE OR REPLACE FUNCTION public.kpi_smq_components_scoped(p_perimetre text DEFAULT 'GLOBAL')
RETURNS TABLE (code text, label text, weight numeric, value numeric, n bigint)
LANGUAGE sql STABLE
SET search_path = public
AS $$
WITH
weights AS (
  SELECT composante AS code, COALESCE(poids, 0) AS weight
  FROM public.smq_config WHERE deleted_at IS NULL
),
sops_score AS (
  SELECT
    100.0 * sum(
      CASE
        WHEN statut = 'EN_VIGUEUR' THEN 1.0
        WHEN statut = 'BROUILLON'  THEN 0.5
        WHEN statut = 'A_REVOIR'   THEN 0.3
        ELSE 0
      END
    ) / NULLIF(count(*) FILTER (WHERE statut <> 'ARCHIVEE'), 0) AS value,
    count(*) FILTER (WHERE statut <> 'ARCHIVEE') AS n
  FROM public.sops
  WHERE deleted_at IS NULL AND (
        p_perimetre = 'GLOBAL'
     OR (p_perimetre = 'PDA'      AND      public.praq_is_pda(processus_id, praq_overrides))
     OR (p_perimetre = 'OFFICINE' AND NOT  public.praq_is_pda(processus_id, praq_overrides)))
),
capa_score AS (
  SELECT
    100.0 * sum(
      CASE
        WHEN statut = 'CLOSE'        THEN 1.0
        WHEN statut = 'VERIFICATION' THEN 0.85
        WHEN statut = 'EN_COURS'     THEN 0.6
        WHEN statut = 'OUVERTE'      THEN 0.3
        ELSE 0
      END
    ) / NULLIF(count(*), 0) AS value,
    count(*) AS n
  FROM public.capa
  WHERE deleted_at IS NULL AND (
        p_perimetre = 'GLOBAL'
     OR (p_perimetre = 'PDA'      AND      public.praq_is_pda(processus_id, praq_overrides))
     OR (p_perimetre = 'OFFICINE' AND NOT  public.praq_is_pda(processus_id, praq_overrides)))
),
hab_score AS (
  SELECT
    100.0 * sum(
      CASE
        WHEN statut IN ('VALIDE', 'A_JOUR', 'OK') THEN 1.0
        WHEN statut = 'A_RENOUVELER'              THEN 0.5
        ELSE 0
      END
    ) / NULLIF(count(*), 0) AS value,
    count(*) AS n
  FROM public.habilitations
  WHERE deleted_at IS NULL AND (
        p_perimetre = 'GLOBAL'
     OR (p_perimetre = 'PDA'      AND      public.praq_is_pda(processus_id, praq_overrides))
     OR (p_perimetre = 'OFFICINE' AND NOT  public.praq_is_pda(processus_id, praq_overrides)))
),
equip_score AS (
  SELECT
    100.0 * sum(
      CASE
        WHEN statut = 'OPERATIONNEL' THEN 1.0
        WHEN statut = 'A_VERIFIER'   THEN 0.6
        ELSE 0
      END
    ) / NULLIF(count(*), 0) AS value,
    count(*) AS n
  FROM public.equipements
  WHERE deleted_at IS NULL AND (
        p_perimetre = 'GLOBAL'
     OR (p_perimetre = 'PDA'      AND      public.praq_is_pda(NULL::uuid, praq_overrides))
     OR (p_perimetre = 'OFFICINE' AND NOT  public.praq_is_pda(NULL::uuid, praq_overrides)))
),
audits_score AS (
  SELECT
    100.0 * sum(
      CASE
        WHEN statut IN ('REALISE', 'CLOTUREE', 'CLOS', 'CLOSE')         THEN 1.0
        WHEN statut IN ('EN_COURS', 'CONSTATS', 'RAPPORT')              THEN 0.7
        WHEN statut IN ('PLANIFIE', 'PLANIFIEE', 'PREPARE')             THEN 0.4
        ELSE 0
      END
    ) / NULLIF(count(*), 0) AS value,
    count(*) AS n
  FROM public.audits
  WHERE deleted_at IS NULL AND (
        p_perimetre = 'GLOBAL'
     OR (p_perimetre = 'PDA'      AND      public.praq_is_pda(processus_id, praq_overrides))
     OR (p_perimetre = 'OFFICINE' AND NOT  public.praq_is_pda(processus_id, praq_overrides)))
),
recl_score AS (
  SELECT
    100.0 * sum(
      CASE
        WHEN statut IN ('CLOTUREE', 'CLOSE', 'CLOS', 'REGLEE') THEN 1.0
        WHEN statut = 'EN_COURS'                                THEN 0.6
        WHEN statut IN ('OUVERTE', 'OUVERT')                    THEN 0.2
        ELSE 0
      END
    ) / NULLIF(count(*), 0) AS value,
    count(*) AS n
  FROM public.reclamations
  WHERE deleted_at IS NULL AND (
        p_perimetre = 'GLOBAL'
     OR (p_perimetre = 'PDA'      AND      public.praq_is_pda(processus_id, praq_overrides))
     OR (p_perimetre = 'OFFICINE' AND NOT  public.praq_is_pda(processus_id, praq_overrides)))
),
risq_score AS (
  SELECT
    100.0 * sum(
      CASE
        WHEN statut = 'MAITRISE'      THEN 1.0
        WHEN statut = 'EN_TRAITEMENT' THEN 0.6
        WHEN statut = 'IDENTIFIE'     THEN 0.3
        ELSE 0
      END
    ) / NULLIF(count(*), 0) AS value,
    count(*) AS n
  FROM public.risques
  WHERE deleted_at IS NULL AND (
        p_perimetre = 'GLOBAL'
     OR (p_perimetre = 'PDA'      AND      public.praq_is_pda(processus_id, praq_overrides))
     OR (p_perimetre = 'OFFICINE' AND NOT  public.praq_is_pda(processus_id, praq_overrides)))
)
SELECT 'SOPS'          AS code, 'SOPs (engagement docu)'             AS label,
       (SELECT weight FROM weights WHERE code = 'SOPS')               AS weight,
       sops_score.value, sops_score.n
FROM sops_score
UNION ALL
SELECT 'CAPA',          'CAPA (engagement traitement)',
       (SELECT weight FROM weights WHERE code = 'CAPA'),
       capa_score.value, capa_score.n
FROM capa_score
UNION ALL
SELECT 'HABILITATIONS', 'Habilitations valides',
       (SELECT weight FROM weights WHERE code = 'HABILITATIONS'),
       hab_score.value, hab_score.n
FROM hab_score
UNION ALL
SELECT 'EQUIPEMENTS',   'Équipements conformes',
       (SELECT weight FROM weights WHERE code = 'EQUIPEMENTS'),
       equip_score.value, equip_score.n
FROM equip_score
UNION ALL
SELECT 'AUDITS',        'Audits (engagement)',
       (SELECT weight FROM weights WHERE code = 'AUDITS'),
       audits_score.value, audits_score.n
FROM audits_score
UNION ALL
SELECT 'RECLAMATIONS',  'Réclamations (engagement)',
       (SELECT weight FROM weights WHERE code = 'RECLAMATIONS'),
       recl_score.value, recl_score.n
FROM recl_score
UNION ALL
SELECT 'RISQUES',       'Risques maîtrisés',
       (SELECT weight FROM weights WHERE code = 'RISQUES'),
       risq_score.value, risq_score.n
FROM risq_score;
$$;

CREATE OR REPLACE FUNCTION public.kpi_smq_current_scoped(p_perimetre text DEFAULT 'GLOBAL')
RETURNS TABLE (
  score_global         numeric,
  active_weight        numeric,
  redistributed_weight numeric,
  active_components     bigint,
  total_components      bigint,
  breakdown            json,
  calculated_at        timestamptz
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
WITH comp AS (
  SELECT * FROM public.kpi_smq_components_scoped(p_perimetre)
),
active AS (
  SELECT * FROM comp WHERE n IS NOT NULL AND n > 0
),
total_active_weight AS (SELECT COALESCE(sum(weight), 0) AS w FROM active),
redistributed AS (
  SELECT
    code, label, value, n,
    CASE WHEN (SELECT w FROM total_active_weight) > 0
         THEN weight / (SELECT w FROM total_active_weight)
         ELSE 0
    END AS adjusted_weight,
    weight AS original_weight
  FROM active
)
SELECT
  COALESCE(round(sum(value * adjusted_weight)), 0)  AS score_global,
  (SELECT w FROM total_active_weight)               AS active_weight,
  100.0 - 100.0 * (SELECT w FROM total_active_weight) AS redistributed_weight,
  count(*)                                          AS active_components,
  (SELECT count(*) FROM comp)                       AS total_components,
  json_agg(json_build_object(
    'code', code,
    'label', label,
    'value', value,
    'weight', original_weight,
    'n', n
  ))                                                AS breakdown,
  now()                                             AS calculated_at
FROM redistributed;
$$;

GRANT EXECUTE ON FUNCTION public.praq_is_pda(uuid, jsonb)        TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.kpi_smq_components_scoped(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.kpi_smq_current_scoped(text)    TO anon, authenticated;
