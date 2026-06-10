/**
 * Alias de types par table, dérivés du schéma prod généré (database.types.ts).
 * database.types.ts est régénéré tel quel depuis Supabase — ne jamais l'éditer.
 * Les composants importent depuis ce fichier, pas depuis database.types.ts.
 */
import type { Tables, TablesInsert, TablesUpdate } from "./database.types";

export type Processus = Tables<"processus">;
export type ProcessusInsert = TablesInsert<"processus">;

export type Sop = Tables<"sops">;
export type SopInsert = TablesInsert<"sops">;
export type SopUpdate = TablesUpdate<"sops">;

export type Capa = Tables<"capa">;
export type CapaInsert = TablesInsert<"capa">;
export type CapaUpdate = TablesUpdate<"capa">;

export type Audit = Tables<"audits">;
export type AuditInsert = TablesInsert<"audits">;
export type AuditFinding = Tables<"audit_findings">;
export type AuditFindingInsert = TablesInsert<"audit_findings">;

export type Risque = Tables<"risques">;
export type RisqueInsert = TablesInsert<"risques">;

export type Vigilance = Tables<"vigilances">;
export type VigilanceInsert = TablesInsert<"vigilances">;

export type Declaration = Tables<"declarations">;
export type DeclarationInsert = TablesInsert<"declarations">;

export type Equipement = Tables<"equipements">;
export type EquipementInsert = TablesInsert<"equipements">;
export type Maintenance = Tables<"maintenance">;
export type MaintenanceInsert = TablesInsert<"maintenance">;

export type Formation = Tables<"formations">;
export type FormationInsert = TablesInsert<"formations">;
export type Habilitation = Tables<"habilitations">;
export type HabilitationInsert = TablesInsert<"habilitations">;

export type Fournisseur = Tables<"fournisseurs">;
export type FournisseurInsert = TablesInsert<"fournisseurs">;

export type Reclamation = Tables<"reclamations">;
export type ReclamationInsert = TablesInsert<"reclamations">;

export type Indicateur = Tables<"indicateurs">;
export type IndicateurInsert = TablesInsert<"indicateurs">;
export type IndicateurValeur = Tables<"indicateurs_valeurs">;
export type IndicateurValeurInsert = TablesInsert<"indicateurs_valeurs">;

export type RevueDirection = Tables<"revue_direction">;
export type RevueDirectionInsert = TablesInsert<"revue_direction">;
export type RevueAction = Tables<"revue_actions">;
export type RevueActionInsert = TablesInsert<"revue_actions">;

export type StaffLite = Tables<"staff_lite">;
export type StaffLiteInsert = TablesInsert<"staff_lite">;

export type PhsqSnapshot = Tables<"phsq_snapshots">;
export type KpiHistory = Tables<"kpi_history">;
export type SmqConfig = Tables<"smq_config">;

export type ColdChainMonthlySync = Tables<"cold_chain_monthly_sync">;
export type ColdChainAnomaly = Tables<"cold_chain_anomalies">;
