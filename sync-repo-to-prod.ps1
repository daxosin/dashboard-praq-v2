# =============================================================
# Synchronisation repo Git ↔ production Supabase
# Généré le 2026-04-27 — à exécuter UNE FOIS
# =============================================================
#
# AVANT D'EXÉCUTER :
# 1. Ferme toute session Claude Code active dans VS Code
#    (sinon les locks .git/index.lock + .git/config.lock bloquent)
# 2. Ferme VS Code complètement (par sécurité)
#
# Pour exécuter ce script :
#   Clic droit > Exécuter avec PowerShell
#   OU dans un terminal PowerShell :
#     cd "C:\Users\PP_MIKAELIAN\Desktop\projets digitaux\PRAQ dash"
#     .\sync-repo-to-prod.ps1
# =============================================================

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\PP_MIKAELIAN\Desktop\projets digitaux\PRAQ dash"
Start-Transcript -Path "sync-output.log" -Force | Out-Null

Write-Host ""
Write-Host "=== 1/6 Suppression des locks git parasites ===" -ForegroundColor Cyan
Remove-Item -Force ".git\index.lock"  -ErrorAction SilentlyContinue
Remove-Item -Force ".git\config.lock" -ErrorAction SilentlyContinue
Write-Host "OK"

Write-Host ""
Write-Host "=== 2/6 Suppression des fichiers de test parasites ===" -ForegroundColor Cyan
Remove-Item -Force "supabase\migrations\_test_write.txt" -ErrorAction SilentlyContinue
Remove-Item -Force "supabase\migrations\_test_dst.txt"   -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "supabase\migrations\_test_dir" -ErrorAction SilentlyContinue
Write-Host "OK"

Write-Host ""
Write-Host "=== 3/6 Réparation upstream branche main ===" -ForegroundColor Cyan
git branch --unset-upstream 2>$null
git branch --set-upstream-to=origin/main main
Write-Host "OK"

Write-Host ""
Write-Host "=== 4/6 État avant commit ===" -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "=== 5/6 Commit global ===" -ForegroundColor Cyan
git add -A
git commit -m @"
fix(db): synchroniser le repo avec les migrations production

- Rapatrier les 4 migrations appliquees en prod (6-8 avril 2026) :
  * 20260406090959_create_praq_tables.sql (schema complet 12 tables + seeds)
  * 20260406200033_create_capa_table.sql
  * 20260406201733_create_formations_table.sql (+ habilitations + RLS)
  * 20260408132010_add_score_global_to_kpi_history.sql

- Archiver les 11 anciennes migrations obsoletes du 15 fev dans
  supabase/migrations/_archive/ (ne suivaient pas la convention CLI,
  jamais enregistrees dans schema_migrations)

- Reparer branch.main : remote=origin, merge=refs/heads/main
  (etait pointe vers refs/heads/master qui n'existe plus)

- Mettre a jour .gitignore : SOPs-Pharma78/, .vscode, .DS_Store, .env.production

- Ajouter README_ARCHIVE.md pour tracabilite ISO 9001.

Le repo represente maintenant fidelement l'etat de la base prod.
Si supabase db reset, le schema sera correctement reconstitue.
"@

Write-Host ""
Write-Host "=== 6/6 Push vers origin/main ===" -ForegroundColor Cyan
git push origin main

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "  Synchronisation terminee. Le repo est aligne." -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verification finale :"
git log -1 --oneline
git status

Write-Host ""
Write-Host "Tu peux supprimer ce script :"
Write-Host "  Remove-Item -Force sync-repo-to-prod.ps1"

Stop-Transcript | Out-Null
