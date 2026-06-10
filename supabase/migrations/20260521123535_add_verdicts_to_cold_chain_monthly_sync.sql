ALTER TABLE public.cold_chain_monthly_sync
  ADD COLUMN IF NOT EXISTS verdicts JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.cold_chain_monthly_sync.verdicts IS
'Verdicts mensuels par enceinte, ecrits par cowork. Forme attendue :
{
  "FRO-001": { "thermique": "vert" | "ambre" | "rouge" | null,
               "it":        "vert" | "ambre" | "rouge" | null,
               "commentaire": "texte libre optionnel" },
  "FRO-002": { ... }, ...
}
La cle absente d''une enceinte signifie "non evalue".';
