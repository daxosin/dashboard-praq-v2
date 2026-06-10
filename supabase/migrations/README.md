# Migrations — état de synchronisation avec la prod

> Dernière synchro : 2026-06-10 (rapatriement des 6 migrations du 21/05 et 02/06).

## Migrations trackées (10) — identiques au tracker prod `supabase_migrations.schema_migrations`

| Version | Nom |
|---|---|
| 20260406090959 | create_praq_tables (12 tables + seeds) |
| 20260406200033 | create_capa_table |
| 20260406201733 | create_formations_table (formations + habilitations + RLS) |
| 20260408132010 | add_score_global_to_kpi_history |
| 20260521094437 | create_cold_chain_tables |
| 20260521123535 | add_verdicts_to_cold_chain_monthly_sync |
| 20260521143633 | cold_chain_rls_policies |
| 20260602172444 | kpi_history_perimetre |
| 20260602172552 | kpi_smq_scoped_functions (praq_is_pda, kpi_smq_components_scoped, kpi_smq_current_scoped) |
| 20260602194205 | revue_direction_perimetre (+ fn_auto_freeze_rdd, freeze_rdd) |

## ⚠️ Tables prod créées HORS migration (14)

Ces tables existent en prod mais ne correspondent à aucune migration trackée
(créées par SQL direct via Cowork/MCP). Non-conformité de traçabilité à résorber :
soit rétro-documenter en migration de constat, soit accepter `db pull` comme source.

`staff_lite`, `audit_findings`, `plan_strategique`, `maintenance`, `projets`,
`projet_taches`, `indicateurs`, `indicateurs_valeurs`, `revue_direction`,
`revue_actions`, `tracabilites_suivi`, `evaluations_collaborateur`, `audit_log`,
`cowork_runs`

Le schéma exact de TOUTES les tables (31) est dans `src/lib/database.types.ts`
(généré le 2026-06-10 via Supabase `generate_typescript_types`).

## Règles (rappel CLAUDE.md)

- Ne JAMAIS rejouer `_archive/` (schéma anglais obsolète, traçabilité ISO uniquement).
- Ne JAMAIS `supabase db reset` sans vérifier la présence des 10 migrations ci-dessus.
- Toujours aligner le code sur la DB, jamais l'inverse.
