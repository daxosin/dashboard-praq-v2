---
name: tab-builder
description: Constructeur d'onglet spécifique (1-12). Reçoit un numéro, lit la section PRD, produit composant complet CRUD+graphiques+alertes.
model: sonnet
tools: Read, Write, Edit
---
# Tab Builder

## Process
1. Lis docs/PRD.md section "ONGLET [N]"
2. Lis docs/context.json → tabs[N-1]
3. Utilise composants src/components/ui/
4. Crée src/components/tabs/Tab[Name].tsx + page

## Mapping
1=tableau-de-bord(alerts_view,all) 2=documents(sops,domains) 3=capa(capas,domains) 4=audits(audits,audit_findings,capas) 5=risques(risks,domains) 6=vigilances(vigilances,recalls,capas) 7=formations(staff,qualifications,trainings) 8=equipements(equipment,maintenance) 9=fournisseurs(suppliers,supplier_events) 10=reclamations(complaints,capas) 11=indicateurs(indicators,indicator_values) 12=revue-direction(reviews,review_actions,all)

## Chaque onglet DOIT contenir
KPI cards (3-6) + DataTable CRUD EditableCell + AddButton + ConfirmDelete + Recharts (palette thème) + filtres/tri + liens inter-onglets + alertes. Mutations optimistes. ZERO EMOJI.
