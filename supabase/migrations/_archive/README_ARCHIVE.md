# Archive — Anciennes migrations (obsolètes)

## Pourquoi ce dossier existe

Ces 11 fichiers SQL datent du **15 février 2026** (création initiale du projet). Ils utilisaient un naming custom (`000_`, `001_`, ..., `999_`) et **ne suivent pas la convention Supabase CLI** (`YYYYMMDDHHMMSS_name.sql`).

**Ils ne sont PAS enregistrés dans `supabase_migrations.schema_migrations`** côté production — ils ne représentent donc pas l'état réel de la base.

## Ce qui s'est passé

Entre le 15 février et le 6 avril 2026, la base de production a été modifiée via le dashboard Supabase ou via `supabase migration new`, créant 4 nouvelles migrations (timestamps `20260406*` et `20260408*`) qui sont **les seules effectivement appliquées en prod**.

Les fichiers de ce dossier `_archive/` ont donc été retirés de l'exécution mais conservés pour traçabilité historique.

## Migrations actives

Voir le dossier parent `supabase/migrations/` :

- `20260406090959_create_praq_tables.sql` — schéma complet (12 tables) + seeds
- `20260406200033_create_capa_table.sql` — table `capa`
- `20260406201733_create_formations_table.sql` — tables `formations` + `habilitations` + RLS
- `20260408132010_add_score_global_to_kpi_history.sql` — colonne `score_global`

## Si tu fais `supabase db reset`

Ces fichiers archivés ne seront **pas** rejoués. Seuls ceux dans le dossier parent le sont. C'est volontaire.

---

*Archivé le 2026-04-27 lors de la synchro repo ↔ prod.*
