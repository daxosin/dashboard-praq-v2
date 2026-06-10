export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_findings: {
        Row: {
          audit_id: string
          capa_id: string | null
          code: string
          created_at: string
          created_by: string | null
          created_by_kind: string | null
          delai_correction: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string
          frozen_at: string | null
          frozen_by: string | null
          id: string
          norme_concernee: string | null
          objet: string
          praq_overrides: Json
          source: string | null
          statut: string
          type: string
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          audit_id: string
          capa_id?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          delai_correction?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description: string
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          norme_concernee?: string | null
          objet: string
          praq_overrides?: Json
          source?: string | null
          statut?: string
          type: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          audit_id?: string
          capa_id?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          delai_correction?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          norme_concernee?: string | null
          objet?: string
          praq_overrides?: Json
          source?: string | null
          statut?: string
          type?: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_findings_audit_fk"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_findings_audit_fk"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_findings_capa_fk"
            columns: ["capa_id"]
            isOneToOne: false
            referencedRelation: "capa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_findings_capa_fk"
            columns: ["capa_id"]
            isOneToOne: false
            referencedRelation: "capa_active"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          actor_kind: string
          actor_uid: string | null
          changed_fields: string[] | null
          created_at: string
          id: number
          new_row: Json | null
          old_row: Json | null
          operation: string
          reason: string | null
          row_id: string
          table_name: string
        }
        Insert: {
          actor_kind: string
          actor_uid?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: number
          new_row?: Json | null
          old_row?: Json | null
          operation: string
          reason?: string | null
          row_id: string
          table_name: string
        }
        Update: {
          actor_kind?: string
          actor_uid?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: number
          new_row?: Json | null
          old_row?: Json | null
          operation?: string
          reason?: string | null
          row_id?: string
          table_name?: string
        }
        Relationships: []
      }
      audits: {
        Row: {
          auditeur: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_planifiee: string
          date_realisee: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          nb_constats_majeurs: number | null
          nb_constats_mineurs: number | null
          nb_observations: number | null
          notes: string | null
          praq_overrides: Json
          processus_id: string | null
          rapport_url: string | null
          source: string | null
          statut: string
          titre: string
          type: string
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          auditeur?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_planifiee: string
          date_realisee?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          nb_constats_majeurs?: number | null
          nb_constats_mineurs?: number | null
          nb_observations?: number | null
          notes?: string | null
          praq_overrides?: Json
          processus_id?: string | null
          rapport_url?: string | null
          source?: string | null
          statut?: string
          titre: string
          type?: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          auditeur?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_planifiee?: string
          date_realisee?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          nb_constats_majeurs?: number | null
          nb_constats_mineurs?: number | null
          nb_observations?: number | null
          notes?: string | null
          praq_overrides?: Json
          processus_id?: string | null
          rapport_url?: string | null
          source?: string | null
          statut?: string
          titre?: string
          type?: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audits_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audits_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus_active"
            referencedColumns: ["id"]
          },
        ]
      }
      capa: {
        Row: {
          actions: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_cloture: string | null
          date_echeance: string | null
          date_ouverture: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          notes: string | null
          praq_overrides: Json
          priorite: string | null
          processus_id: string | null
          reference: string | null
          responsable: string | null
          source: string | null
          statut: string
          titre: string
          type: string
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
          verification_efficacite: string | null
        }
        Insert: {
          actions?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_cloture?: string | null
          date_echeance?: string | null
          date_ouverture?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          notes?: string | null
          praq_overrides?: Json
          priorite?: string | null
          processus_id?: string | null
          reference?: string | null
          responsable?: string | null
          source?: string | null
          statut?: string
          titre: string
          type?: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
          verification_efficacite?: string | null
        }
        Update: {
          actions?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_cloture?: string | null
          date_echeance?: string | null
          date_ouverture?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          notes?: string | null
          praq_overrides?: Json
          priorite?: string | null
          processus_id?: string | null
          reference?: string | null
          responsable?: string | null
          source?: string | null
          statut?: string
          titre?: string
          type?: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
          verification_efficacite?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capa_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capa_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus_active"
            referencedColumns: ["id"]
          },
        ]
      }
      cold_chain_anomalies: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alarm_type: string
          created_at: string | null
          decided_at: string | null
          decided_by: string | null
          decision: string | null
          detected_at: string
          duration_min: number | null
          enceinte_code: string
          id: string
          notes: string | null
          pharmaco_eval: string | null
          resolved_at: string | null
          source_sync_id: string | null
          status: string
          temp_at_start: number | null
          temp_max: number | null
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alarm_type: string
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision?: string | null
          detected_at: string
          duration_min?: number | null
          enceinte_code: string
          id?: string
          notes?: string | null
          pharmaco_eval?: string | null
          resolved_at?: string | null
          source_sync_id?: string | null
          status?: string
          temp_at_start?: number | null
          temp_max?: number | null
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alarm_type?: string
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision?: string | null
          detected_at?: string
          duration_min?: number | null
          enceinte_code?: string
          id?: string
          notes?: string | null
          pharmaco_eval?: string | null
          resolved_at?: string | null
          source_sync_id?: string | null
          status?: string
          temp_at_start?: number | null
          temp_max?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cold_chain_anomalies_source_sync_id_fkey"
            columns: ["source_sync_id"]
            isOneToOne: false
            referencedRelation: "cold_chain_monthly_sync"
            referencedColumns: ["id"]
          },
        ]
      }
      cold_chain_monthly_sync: {
        Row: {
          alarms_total: number
          anomalies_created: number
          csv_path: string
          enceintes_synced: number
          executed_at: string
          executed_by: string
          id: string
          notes: string | null
          status: string
          verdicts: Json
          year_month: string
        }
        Insert: {
          alarms_total: number
          anomalies_created: number
          csv_path: string
          enceintes_synced: number
          executed_at: string
          executed_by: string
          id?: string
          notes?: string | null
          status: string
          verdicts?: Json
          year_month: string
        }
        Update: {
          alarms_total?: number
          anomalies_created?: number
          csv_path?: string
          enceintes_synced?: number
          executed_at?: string
          executed_by?: string
          id?: string
          notes?: string | null
          status?: string
          verdicts?: Json
          year_month?: string
        }
        Relationships: []
      }
      cowork_runs: {
        Row: {
          conflicts: Json | null
          error: string | null
          finished_at: string | null
          id: number
          inserted: number | null
          metadata: Json | null
          skipped_overrides: number | null
          source: string
          started_at: string
          status: string | null
          unchanged: number | null
          updated: number | null
        }
        Insert: {
          conflicts?: Json | null
          error?: string | null
          finished_at?: string | null
          id?: number
          inserted?: number | null
          metadata?: Json | null
          skipped_overrides?: number | null
          source: string
          started_at?: string
          status?: string | null
          unchanged?: number | null
          updated?: number | null
        }
        Update: {
          conflicts?: Json | null
          error?: string | null
          finished_at?: string | null
          id?: number
          inserted?: number | null
          metadata?: Json | null
          skipped_overrides?: number | null
          source?: string
          started_at?: string
          status?: string | null
          unchanged?: number | null
          updated?: number | null
        }
        Relationships: []
      }
      declarations: {
        Row: {
          capa_id: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_qualification: string | null
          date_traitement: string | null
          declarant: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string
          frozen_at: string | null
          frozen_by: string | null
          gravite: string | null
          id: string
          notes_praq: string | null
          photo_url: string | null
          pin_hash: string | null
          praq_overrides: Json
          processus_id: string | null
          qualifie_par_id: string | null
          source: string | null
          statut: string
          type: string
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          capa_id?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_qualification?: string | null
          date_traitement?: string | null
          declarant: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description: string
          frozen_at?: string | null
          frozen_by?: string | null
          gravite?: string | null
          id?: string
          notes_praq?: string | null
          photo_url?: string | null
          pin_hash?: string | null
          praq_overrides?: Json
          processus_id?: string | null
          qualifie_par_id?: string | null
          source?: string | null
          statut?: string
          type: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          capa_id?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_qualification?: string | null
          date_traitement?: string | null
          declarant?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string
          frozen_at?: string | null
          frozen_by?: string | null
          gravite?: string | null
          id?: string
          notes_praq?: string | null
          photo_url?: string | null
          pin_hash?: string | null
          praq_overrides?: Json
          processus_id?: string | null
          qualifie_par_id?: string | null
          source?: string | null
          statut?: string
          type?: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "declarations_capa_fk"
            columns: ["capa_id"]
            isOneToOne: false
            referencedRelation: "capa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_capa_fk"
            columns: ["capa_id"]
            isOneToOne: false
            referencedRelation: "capa_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus_active"
            referencedColumns: ["id"]
          },
        ]
      }
      equipements: {
        Row: {
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_dernier_etalonnage: string | null
          date_derniere_maintenance: string | null
          date_prochain_etalonnage: string | null
          date_prochaine_maintenance: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          fournisseur: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          localisation: string | null
          nom: string
          notes: string | null
          numero_serie: string | null
          praq_overrides: Json
          source: string | null
          statut: string
          type: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_dernier_etalonnage?: string | null
          date_derniere_maintenance?: string | null
          date_prochain_etalonnage?: string | null
          date_prochaine_maintenance?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          fournisseur?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          localisation?: string | null
          nom: string
          notes?: string | null
          numero_serie?: string | null
          praq_overrides?: Json
          source?: string | null
          statut?: string
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_dernier_etalonnage?: string | null
          date_derniere_maintenance?: string | null
          date_prochain_etalonnage?: string | null
          date_prochaine_maintenance?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          fournisseur?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          localisation?: string | null
          nom?: string
          notes?: string | null
          numero_serie?: string | null
          praq_overrides?: Json
          source?: string | null
          statut?: string
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
      evaluations_collaborateur: {
        Row: {
          augmentation_demandee: boolean | null
          competences_acquises: Json | null
          created_at: string
          created_by: string | null
          created_by_kind: string | null
          date_evaluation: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          evaluateur_id: string | null
          formations_demandees: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          objectifs_atteints: string | null
          objectifs_n_plus_1: string | null
          pj_url: string | null
          praq_overrides: Json
          signe_par_collaborateur: boolean | null
          signe_par_collaborateur_at: string | null
          source: string | null
          staff_id: string
          type: string
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          augmentation_demandee?: boolean | null
          competences_acquises?: Json | null
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          date_evaluation: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          evaluateur_id?: string | null
          formations_demandees?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          objectifs_atteints?: string | null
          objectifs_n_plus_1?: string | null
          pj_url?: string | null
          praq_overrides?: Json
          signe_par_collaborateur?: boolean | null
          signe_par_collaborateur_at?: string | null
          source?: string | null
          staff_id: string
          type?: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          augmentation_demandee?: boolean | null
          competences_acquises?: Json | null
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          date_evaluation?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          evaluateur_id?: string | null
          formations_demandees?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          objectifs_atteints?: string | null
          objectifs_n_plus_1?: string | null
          pj_url?: string | null
          praq_overrides?: Json
          signe_par_collaborateur?: boolean | null
          signe_par_collaborateur_at?: string | null
          source?: string | null
          staff_id?: string
          type?: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_collaborateur_evaluateur_id_fkey"
            columns: ["evaluateur_id"]
            isOneToOne: false
            referencedRelation: "staff_lite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_collaborateur_evaluateur_id_fkey"
            columns: ["evaluateur_id"]
            isOneToOne: false
            referencedRelation: "staff_lite_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_collaborateur_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_lite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_collaborateur_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_lite_active"
            referencedColumns: ["id"]
          },
        ]
      }
      formations: {
        Row: {
          attestation: boolean | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_formation: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          duree_heures: number | null
          formateur: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          nb_participants: number | null
          notes: string | null
          participants: string[] | null
          praq_overrides: Json
          processus_id: string | null
          source: string | null
          statut: string
          titre: string
          type: string
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          attestation?: boolean | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_formation?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          duree_heures?: number | null
          formateur?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          nb_participants?: number | null
          notes?: string | null
          participants?: string[] | null
          praq_overrides?: Json
          processus_id?: string | null
          source?: string | null
          statut?: string
          titre: string
          type: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          attestation?: boolean | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_formation?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          duree_heures?: number | null
          formateur?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          nb_participants?: number | null
          notes?: string | null
          participants?: string[] | null
          praq_overrides?: Json
          processus_id?: string | null
          source?: string | null
          statut?: string
          titre?: string
          type?: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formations_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formations_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus_active"
            referencedColumns: ["id"]
          },
        ]
      }
      fournisseurs: {
        Row: {
          contact_email: string | null
          contact_nom: string | null
          contact_tel: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_derniere_evaluation: string | null
          date_prochaine_evaluation: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          nb_nc: number | null
          nom: string
          notes: string | null
          praq_overrides: Json
          qualifie: boolean | null
          score_evaluation: number | null
          source: string | null
          type: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_nom?: string | null
          contact_tel?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_derniere_evaluation?: string | null
          date_prochaine_evaluation?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          nb_nc?: number | null
          nom: string
          notes?: string | null
          praq_overrides?: Json
          qualifie?: boolean | null
          score_evaluation?: number | null
          source?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_nom?: string | null
          contact_tel?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_derniere_evaluation?: string | null
          date_prochaine_evaluation?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          nb_nc?: number | null
          nom?: string
          notes?: string | null
          praq_overrides?: Json
          qualifie?: boolean | null
          score_evaluation?: number | null
          source?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
      habilitations: {
        Row: {
          collaborateur: string
          competence: string
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_expiration: string | null
          date_obtention: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          formation_id: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          notes: string | null
          poste: string | null
          praq_overrides: Json
          processus_id: string | null
          source: string | null
          statut: string
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          collaborateur: string
          competence: string
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_expiration?: string | null
          date_obtention?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          formation_id?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          notes?: string | null
          poste?: string | null
          praq_overrides?: Json
          processus_id?: string | null
          source?: string | null
          statut?: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          collaborateur?: string
          competence?: string
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_expiration?: string | null
          date_obtention?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          formation_id?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          notes?: string | null
          poste?: string | null
          praq_overrides?: Json
          processus_id?: string | null
          source?: string | null
          statut?: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habilitations_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habilitations_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habilitations_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habilitations_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus_active"
            referencedColumns: ["id"]
          },
        ]
      }
      indicateurs: {
        Row: {
          actif: boolean
          borne_basse: number | null
          borne_haute: number | null
          cible: number | null
          code: string
          created_at: string
          created_by: string | null
          created_by_kind: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          direction: string
          formule_sql: string | null
          frequence: string
          frozen_at: string | null
          frozen_by: string | null
          id: string
          libelle: string
          ordre: number
          praq_overrides: Json
          source: string | null
          unite: string | null
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          actif?: boolean
          borne_basse?: number | null
          borne_haute?: number | null
          cible?: number | null
          code: string
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          direction: string
          formule_sql?: string | null
          frequence: string
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          libelle: string
          ordre?: number
          praq_overrides?: Json
          source?: string | null
          unite?: string | null
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          actif?: boolean
          borne_basse?: number | null
          borne_haute?: number | null
          cible?: number | null
          code?: string
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          direction?: string
          formule_sql?: string | null
          frequence?: string
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          libelle?: string
          ordre?: number
          praq_overrides?: Json
          source?: string | null
          unite?: string | null
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
      indicateurs_valeurs: {
        Row: {
          atteint: boolean | null
          commentaire: string | null
          created_at: string
          created_by: string | null
          created_by_kind: string | null
          date_calcul: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          ecart: number | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          indicateur_id: string
          praq_overrides: Json
          source: string
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
          valeur: number
        }
        Insert: {
          atteint?: boolean | null
          commentaire?: string | null
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          date_calcul: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          ecart?: number | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          indicateur_id: string
          praq_overrides?: Json
          source?: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
          valeur: number
        }
        Update: {
          atteint?: boolean | null
          commentaire?: string | null
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          date_calcul?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          ecart?: number | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          indicateur_id?: string
          praq_overrides?: Json
          source?: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
          valeur?: number
        }
        Relationships: [
          {
            foreignKeyName: "indicateurs_valeurs_indicateur_id_fkey"
            columns: ["indicateur_id"]
            isOneToOne: false
            referencedRelation: "indicateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicateurs_valeurs_indicateur_id_fkey"
            columns: ["indicateur_id"]
            isOneToOne: false
            referencedRelation: "indicateurs_active"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_history: {
        Row: {
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_calcul: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          details: Json | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          nb_capa_en_retard: number | null
          nb_capa_ouvertes: number | null
          perimetre: string
          praq_overrides: Json
          score_audits: number | null
          score_capa: number | null
          score_equipements: number | null
          score_global: number | null
          score_habilitations: number | null
          score_reclamations: number | null
          score_risques: number | null
          score_smq: number | null
          score_sops: number | null
          source: string | null
          taux_audits_realises: number | null
          taux_equipements_conformes: number | null
          taux_habilitations: number | null
          taux_sops_conformes: number | null
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_calcul?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          details?: Json | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          nb_capa_en_retard?: number | null
          nb_capa_ouvertes?: number | null
          perimetre?: string
          praq_overrides?: Json
          score_audits?: number | null
          score_capa?: number | null
          score_equipements?: number | null
          score_global?: number | null
          score_habilitations?: number | null
          score_reclamations?: number | null
          score_risques?: number | null
          score_smq?: number | null
          score_sops?: number | null
          source?: string | null
          taux_audits_realises?: number | null
          taux_equipements_conformes?: number | null
          taux_habilitations?: number | null
          taux_sops_conformes?: number | null
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_calcul?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          details?: Json | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          nb_capa_en_retard?: number | null
          nb_capa_ouvertes?: number | null
          perimetre?: string
          praq_overrides?: Json
          score_audits?: number | null
          score_capa?: number | null
          score_equipements?: number | null
          score_global?: number | null
          score_habilitations?: number | null
          score_reclamations?: number | null
          score_risques?: number | null
          score_smq?: number | null
          score_sops?: number | null
          source?: string | null
          taux_audits_realises?: number | null
          taux_equipements_conformes?: number | null
          taux_habilitations?: number | null
          taux_sops_conformes?: number | null
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
      maintenance: {
        Row: {
          conforme: boolean | null
          cout_ht: number | null
          created_at: string
          created_by: string | null
          created_by_kind: string | null
          date_planifiee: string | null
          date_realisee: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          equipement_id: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          praq_overrides: Json
          prestataire: string | null
          rapport_url: string | null
          resultats: string | null
          source: string | null
          statut: string
          type: string
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          conforme?: boolean | null
          cout_ht?: number | null
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          date_planifiee?: string | null
          date_realisee?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          equipement_id?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          praq_overrides?: Json
          prestataire?: string | null
          rapport_url?: string | null
          resultats?: string | null
          source?: string | null
          statut?: string
          type: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          conforme?: boolean | null
          cout_ht?: number | null
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          date_planifiee?: string | null
          date_realisee?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          equipement_id?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          praq_overrides?: Json
          prestataire?: string | null
          rapport_url?: string | null
          resultats?: string | null
          source?: string | null
          statut?: string
          type?: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_equipement_fk"
            columns: ["equipement_id"]
            isOneToOne: false
            referencedRelation: "equipements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_equipement_fk"
            columns: ["equipement_id"]
            isOneToOne: false
            referencedRelation: "equipements_active"
            referencedColumns: ["id"]
          },
        ]
      }
      phsq_snapshots: {
        Row: {
          capa_delai_moyen_jours: number | null
          capa_en_retard: number | null
          capa_ouvertes: number | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_scraping: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          donnees: Json
          dysfonctionnements_clos: number | null
          dysfonctionnements_ouverts: number | null
          fiches_progres_ouvertes: number | null
          formations_a_jour: number | null
          formations_total: number | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          notifications: Json | null
          praq_overrides: Json
          source: string
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          capa_delai_moyen_jours?: number | null
          capa_en_retard?: number | null
          capa_ouvertes?: number | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_scraping?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          donnees: Json
          dysfonctionnements_clos?: number | null
          dysfonctionnements_ouverts?: number | null
          fiches_progres_ouvertes?: number | null
          formations_a_jour?: number | null
          formations_total?: number | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          notifications?: Json | null
          praq_overrides?: Json
          source?: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          capa_delai_moyen_jours?: number | null
          capa_en_retard?: number | null
          capa_ouvertes?: number | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_scraping?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          donnees?: Json
          dysfonctionnements_clos?: number | null
          dysfonctionnements_ouverts?: number | null
          fiches_progres_ouvertes?: number | null
          formations_a_jour?: number | null
          formations_total?: number | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          notifications?: Json | null
          praq_overrides?: Json
          source?: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
      plan_strategique: {
        Row: {
          annee: number
          axe: string
          created_at: string
          created_by: string | null
          created_by_kind: string | null
          date_echeance: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          indicateur_id: string | null
          notes: string | null
          objectif: string
          praq_overrides: Json
          responsable_id: string | null
          source: string | null
          statut: string
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
          valeur_actuelle: number | null
          valeur_cible: number | null
        }
        Insert: {
          annee: number
          axe: string
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          date_echeance?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          indicateur_id?: string | null
          notes?: string | null
          objectif: string
          praq_overrides?: Json
          responsable_id?: string | null
          source?: string | null
          statut?: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
          valeur_actuelle?: number | null
          valeur_cible?: number | null
        }
        Update: {
          annee?: number
          axe?: string
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          date_echeance?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          indicateur_id?: string | null
          notes?: string | null
          objectif?: string
          praq_overrides?: Json
          responsable_id?: string | null
          source?: string | null
          statut?: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
          valeur_actuelle?: number | null
          valeur_cible?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_strategique_indicateur_fk"
            columns: ["indicateur_id"]
            isOneToOne: false
            referencedRelation: "indicateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_strategique_indicateur_fk"
            columns: ["indicateur_id"]
            isOneToOne: false
            referencedRelation: "indicateurs_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_strategique_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "staff_lite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_strategique_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "staff_lite_active"
            referencedColumns: ["id"]
          },
        ]
      }
      processus: {
        Row: {
          actif: boolean | null
          code: string
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          nom: string
          praq_overrides: Json
          source: string | null
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          actif?: boolean | null
          code: string
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          nom: string
          praq_overrides?: Json
          source?: string | null
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          actif?: boolean | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          nom?: string
          praq_overrides?: Json
          source?: string | null
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
      projet_taches: {
        Row: {
          assigne_id: string | null
          created_at: string
          created_by: string | null
          created_by_kind: string | null
          date_debut: string | null
          date_echeance: string | null
          date_realisee: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          ordre: number
          praq_overrides: Json
          predecesseur_id: string | null
          projet_id: string
          source: string | null
          statut: string
          titre: string
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          assigne_id?: string | null
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          date_debut?: string | null
          date_echeance?: string | null
          date_realisee?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          ordre?: number
          praq_overrides?: Json
          predecesseur_id?: string | null
          projet_id: string
          source?: string | null
          statut?: string
          titre: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          assigne_id?: string | null
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          date_debut?: string | null
          date_echeance?: string | null
          date_realisee?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          ordre?: number
          praq_overrides?: Json
          predecesseur_id?: string | null
          projet_id?: string
          source?: string | null
          statut?: string
          titre?: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projet_taches_assigne_id_fkey"
            columns: ["assigne_id"]
            isOneToOne: false
            referencedRelation: "staff_lite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projet_taches_assigne_id_fkey"
            columns: ["assigne_id"]
            isOneToOne: false
            referencedRelation: "staff_lite_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projet_taches_predecesseur_fk"
            columns: ["predecesseur_id"]
            isOneToOne: false
            referencedRelation: "projet_taches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projet_taches_predecesseur_fk"
            columns: ["predecesseur_id"]
            isOneToOne: false
            referencedRelation: "projet_taches_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projet_taches_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projet_taches_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets_active"
            referencedColumns: ["id"]
          },
        ]
      }
      projets: {
        Row: {
          budget_consomme: number | null
          budget_prevu: number | null
          categorie: string | null
          chef_projet_id: string | null
          code: string
          created_at: string
          created_by: string | null
          created_by_kind: string | null
          date_debut: string | null
          date_fin_prevue: string | null
          date_fin_reelle: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          nom: string
          pj_url: string | null
          praq_overrides: Json
          source: string | null
          statut: string
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          budget_consomme?: number | null
          budget_prevu?: number | null
          categorie?: string | null
          chef_projet_id?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          date_debut?: string | null
          date_fin_prevue?: string | null
          date_fin_reelle?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          nom: string
          pj_url?: string | null
          praq_overrides?: Json
          source?: string | null
          statut?: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          budget_consomme?: number | null
          budget_prevu?: number | null
          categorie?: string | null
          chef_projet_id?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          date_debut?: string | null
          date_fin_prevue?: string | null
          date_fin_reelle?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          nom?: string
          pj_url?: string | null
          praq_overrides?: Json
          source?: string | null
          statut?: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projets_chef_projet_id_fkey"
            columns: ["chef_projet_id"]
            isOneToOne: false
            referencedRelation: "staff_lite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projets_chef_projet_id_fkey"
            columns: ["chef_projet_id"]
            isOneToOne: false
            referencedRelation: "staff_lite_active"
            referencedColumns: ["id"]
          },
        ]
      }
      reclamations: {
        Row: {
          action_corrective: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_cloture: string | null
          date_reception: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string
          frozen_at: string | null
          frozen_by: string | null
          gravite: string | null
          id: string
          notes: string | null
          praq_overrides: Json
          processus_id: string | null
          reference: string | null
          satisfaction: string | null
          source: string | null
          statut: string
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          action_corrective?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_cloture?: string | null
          date_reception?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description: string
          frozen_at?: string | null
          frozen_by?: string | null
          gravite?: string | null
          id?: string
          notes?: string | null
          praq_overrides?: Json
          processus_id?: string | null
          reference?: string | null
          satisfaction?: string | null
          source?: string | null
          statut?: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          action_corrective?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_cloture?: string | null
          date_reception?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string
          frozen_at?: string | null
          frozen_by?: string | null
          gravite?: string | null
          id?: string
          notes?: string | null
          praq_overrides?: Json
          processus_id?: string | null
          reference?: string | null
          satisfaction?: string | null
          source?: string | null
          statut?: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reclamations_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reclamations_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus_active"
            referencedColumns: ["id"]
          },
        ]
      }
      revue_actions: {
        Row: {
          capa_id: string | null
          created_at: string
          created_by: string | null
          created_by_kind: string | null
          date_echeance: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          num: number
          praq_overrides: Json
          responsable_id: string | null
          revue_id: string
          source: string | null
          statut: string
          titre: string
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          capa_id?: string | null
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          date_echeance?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          num: number
          praq_overrides?: Json
          responsable_id?: string | null
          revue_id: string
          source?: string | null
          statut?: string
          titre: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          capa_id?: string | null
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          date_echeance?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          num?: number
          praq_overrides?: Json
          responsable_id?: string | null
          revue_id?: string
          source?: string | null
          statut?: string
          titre?: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revue_actions_capa_fk"
            columns: ["capa_id"]
            isOneToOne: false
            referencedRelation: "capa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revue_actions_capa_fk"
            columns: ["capa_id"]
            isOneToOne: false
            referencedRelation: "capa_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revue_actions_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "staff_lite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revue_actions_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "staff_lite_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revue_actions_revue_id_fkey"
            columns: ["revue_id"]
            isOneToOne: false
            referencedRelation: "revue_direction"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revue_actions_revue_id_fkey"
            columns: ["revue_id"]
            isOneToOne: false
            referencedRelation: "revue_direction_active"
            referencedColumns: ["id"]
          },
        ]
      }
      revue_direction: {
        Row: {
          annee: number
          conclusions: string | null
          created_at: string
          created_by: string | null
          created_by_kind: string | null
          date_planifiee: string | null
          date_realisee: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          duree_min: number | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          ordre_du_jour: string | null
          pdf_url: string | null
          perimetre: string
          praq_overrides: Json
          presents: string | null
          prochaine_revue_date: string | null
          snapshot_at: string | null
          snapshot_audits: Json | null
          snapshot_by: string | null
          snapshot_capa: Json | null
          snapshot_fournisseurs: Json | null
          snapshot_reclamations: Json | null
          snapshot_risques: Json | null
          snapshot_smq: Json | null
          source: string | null
          statut: string
          synthese_executive: string | null
          trimestre: number | null
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          annee: number
          conclusions?: string | null
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          date_planifiee?: string | null
          date_realisee?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          duree_min?: number | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          ordre_du_jour?: string | null
          pdf_url?: string | null
          perimetre?: string
          praq_overrides?: Json
          presents?: string | null
          prochaine_revue_date?: string | null
          snapshot_at?: string | null
          snapshot_audits?: Json | null
          snapshot_by?: string | null
          snapshot_capa?: Json | null
          snapshot_fournisseurs?: Json | null
          snapshot_reclamations?: Json | null
          snapshot_risques?: Json | null
          snapshot_smq?: Json | null
          source?: string | null
          statut?: string
          synthese_executive?: string | null
          trimestre?: number | null
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          annee?: number
          conclusions?: string | null
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          date_planifiee?: string | null
          date_realisee?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          duree_min?: number | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          ordre_du_jour?: string | null
          pdf_url?: string | null
          perimetre?: string
          praq_overrides?: Json
          presents?: string | null
          prochaine_revue_date?: string | null
          snapshot_at?: string | null
          snapshot_audits?: Json | null
          snapshot_by?: string | null
          snapshot_capa?: Json | null
          snapshot_fournisseurs?: Json | null
          snapshot_reclamations?: Json | null
          snapshot_risques?: Json | null
          snapshot_smq?: Json | null
          source?: string | null
          statut?: string
          synthese_executive?: string | null
          trimestre?: number | null
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
      risques: {
        Row: {
          action_prevue: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          criticite: number | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          detectabilite: number
          frozen_at: string | null
          frozen_by: string | null
          gravite: number
          id: string
          niveau: string | null
          praq_overrides: Json
          probabilite: number
          processus_id: string | null
          source: string | null
          statut: string
          titre: string
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          action_prevue?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          criticite?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          detectabilite: number
          frozen_at?: string | null
          frozen_by?: string | null
          gravite: number
          id?: string
          niveau?: string | null
          praq_overrides?: Json
          probabilite: number
          processus_id?: string | null
          source?: string | null
          statut?: string
          titre: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          action_prevue?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          criticite?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          detectabilite?: number
          frozen_at?: string | null
          frozen_by?: string | null
          gravite?: number
          id?: string
          niveau?: string | null
          praq_overrides?: Json
          probabilite?: number
          processus_id?: string | null
          source?: string | null
          statut?: string
          titre?: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risques_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risques_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus_active"
            referencedColumns: ["id"]
          },
        ]
      }
      smq_config: {
        Row: {
          actif: boolean | null
          composante: string
          created_at: string
          created_by: string | null
          created_by_kind: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          poids: number
          praq_overrides: Json
          seuil_ambre: number | null
          seuil_vert: number | null
          source: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          actif?: boolean | null
          composante: string
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          poids: number
          praq_overrides?: Json
          seuil_ambre?: number | null
          seuil_vert?: number | null
          source?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          actif?: boolean | null
          composante?: string
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          poids?: number
          praq_overrides?: Json
          seuil_ambre?: number | null
          seuil_vert?: number | null
          source?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
      sops: {
        Row: {
          categorie: string
          code: string
          contenu: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_creation: string | null
          date_derniere_revision: string | null
          date_revision: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          fichier_url: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          nb_annexes: number
          notes: string | null
          praq_overrides: Json
          processus_id: string | null
          responsable: string | null
          source: string | null
          statut: string
          titre: string
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
          version: string
        }
        Insert: {
          categorie?: string
          code: string
          contenu?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_creation?: string | null
          date_derniere_revision?: string | null
          date_revision?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          fichier_url?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          nb_annexes?: number
          notes?: string | null
          praq_overrides?: Json
          processus_id?: string | null
          responsable?: string | null
          source?: string | null
          statut?: string
          titre: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
          version?: string
        }
        Update: {
          categorie?: string
          code?: string
          contenu?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_creation?: string | null
          date_derniere_revision?: string | null
          date_revision?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          fichier_url?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          nb_annexes?: number
          notes?: string | null
          praq_overrides?: Json
          processus_id?: string | null
          responsable?: string | null
          source?: string | null
          statut?: string
          titre?: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "sops_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sops_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus_active"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_lite: {
        Row: {
          actif: boolean
          created_at: string
          created_by: string | null
          created_by_kind: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          praq_overrides: Json
          prenom_nom: string
          role: string
          source: string | null
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          actif?: boolean
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          praq_overrides?: Json
          prenom_nom: string
          role: string
          source?: string | null
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          actif?: boolean
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          praq_overrides?: Json
          prenom_nom?: string
          role?: string
          source?: string | null
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
      tracabilites_suivi: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          created_by_kind: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          derniere_realisation: string | null
          frequence: string
          frozen_at: string | null
          frozen_by: string | null
          id: string
          libelle: string
          notes: string | null
          praq_overrides: Json
          prochaine_echeance: string | null
          responsable_id: string | null
          source: string | null
          source_url: string | null
          statut: string
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          derniere_realisation?: string | null
          frequence: string
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          libelle: string
          notes?: string | null
          praq_overrides?: Json
          prochaine_echeance?: string | null
          responsable_id?: string | null
          source?: string | null
          source_url?: string | null
          statut?: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          derniere_realisation?: string | null
          frequence?: string
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          libelle?: string
          notes?: string | null
          praq_overrides?: Json
          prochaine_echeance?: string | null
          responsable_id?: string | null
          source?: string | null
          source_url?: string | null
          statut?: string
          update_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracabilites_suivi_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "staff_lite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracabilites_suivi_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "staff_lite_active"
            referencedColumns: ["id"]
          },
        ]
      }
      vigilances: {
        Row: {
          actions_prises: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_signal: string
          date_traitement: string | null
          declare_ansm_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          etape_courante: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          nb_patients_concernes: number | null
          nb_patients_rappeles: number | null
          nb_unites_concernees: number | null
          nb_unites_isolees: number | null
          notes: string | null
          praq_overrides: Json
          ref_declaration_ansm: string | null
          reference: string | null
          source: string | null
          statut: string
          titre: string
          type: string
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          actions_prises?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_signal?: string
          date_traitement?: string | null
          declare_ansm_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          etape_courante?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          nb_patients_concernes?: number | null
          nb_patients_rappeles?: number | null
          nb_unites_concernees?: number | null
          nb_unites_isolees?: number | null
          notes?: string | null
          praq_overrides?: Json
          ref_declaration_ansm?: string | null
          reference?: string | null
          source?: string | null
          statut?: string
          titre: string
          type: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          actions_prises?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_signal?: string
          date_traitement?: string | null
          declare_ansm_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          etape_courante?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          nb_patients_concernes?: number | null
          nb_patients_rappeles?: number | null
          nb_unites_concernees?: number | null
          nb_unites_isolees?: number | null
          notes?: string | null
          praq_overrides?: Json
          ref_declaration_ansm?: string | null
          reference?: string | null
          source?: string | null
          statut?: string
          titre?: string
          type?: string
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      audit_findings_active: {
        Row: {
          audit_id: string | null
          capa_id: string | null
          code: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          delai_correction: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          norme_concernee: string | null
          objet: string | null
          praq_overrides: Json | null
          source: string | null
          statut: string | null
          type: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          audit_id?: string | null
          capa_id?: string | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          delai_correction?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          norme_concernee?: string | null
          objet?: string | null
          praq_overrides?: Json | null
          source?: string | null
          statut?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          audit_id?: string | null
          capa_id?: string | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          delai_correction?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          norme_concernee?: string | null
          objet?: string | null
          praq_overrides?: Json | null
          source?: string | null
          statut?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_findings_audit_fk"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_findings_audit_fk"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_findings_capa_fk"
            columns: ["capa_id"]
            isOneToOne: false
            referencedRelation: "capa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_findings_capa_fk"
            columns: ["capa_id"]
            isOneToOne: false
            referencedRelation: "capa_active"
            referencedColumns: ["id"]
          },
        ]
      }
      audits_active: {
        Row: {
          auditeur: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_planifiee: string | null
          date_realisee: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          nb_constats_majeurs: number | null
          nb_constats_mineurs: number | null
          nb_observations: number | null
          notes: string | null
          praq_overrides: Json | null
          processus_id: string | null
          rapport_url: string | null
          source: string | null
          statut: string | null
          titre: string | null
          type: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          auditeur?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_planifiee?: string | null
          date_realisee?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          nb_constats_majeurs?: number | null
          nb_constats_mineurs?: number | null
          nb_observations?: number | null
          notes?: string | null
          praq_overrides?: Json | null
          processus_id?: string | null
          rapport_url?: string | null
          source?: string | null
          statut?: string | null
          titre?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          auditeur?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_planifiee?: string | null
          date_realisee?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          nb_constats_majeurs?: number | null
          nb_constats_mineurs?: number | null
          nb_observations?: number | null
          notes?: string | null
          praq_overrides?: Json | null
          processus_id?: string | null
          rapport_url?: string | null
          source?: string | null
          statut?: string | null
          titre?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audits_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audits_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus_active"
            referencedColumns: ["id"]
          },
        ]
      }
      capa_active: {
        Row: {
          actions: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_cloture: string | null
          date_echeance: string | null
          date_ouverture: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          notes: string | null
          praq_overrides: Json | null
          priorite: string | null
          processus_id: string | null
          reference: string | null
          responsable: string | null
          source: string | null
          statut: string | null
          titre: string | null
          type: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
          verification_efficacite: string | null
        }
        Insert: {
          actions?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_cloture?: string | null
          date_echeance?: string | null
          date_ouverture?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          notes?: string | null
          praq_overrides?: Json | null
          priorite?: string | null
          processus_id?: string | null
          reference?: string | null
          responsable?: string | null
          source?: string | null
          statut?: string | null
          titre?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
          verification_efficacite?: string | null
        }
        Update: {
          actions?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_cloture?: string | null
          date_echeance?: string | null
          date_ouverture?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          notes?: string | null
          praq_overrides?: Json | null
          priorite?: string | null
          processus_id?: string | null
          reference?: string | null
          responsable?: string | null
          source?: string | null
          statut?: string | null
          titre?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
          verification_efficacite?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capa_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capa_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus_active"
            referencedColumns: ["id"]
          },
        ]
      }
      declarations_active: {
        Row: {
          capa_id: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_qualification: string | null
          date_traitement: string | null
          declarant: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          frozen_at: string | null
          frozen_by: string | null
          gravite: string | null
          id: string | null
          notes_praq: string | null
          photo_url: string | null
          pin_hash: string | null
          praq_overrides: Json | null
          processus_id: string | null
          qualifie_par_id: string | null
          source: string | null
          statut: string | null
          type: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          capa_id?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_qualification?: string | null
          date_traitement?: string | null
          declarant?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          gravite?: string | null
          id?: string | null
          notes_praq?: string | null
          photo_url?: string | null
          pin_hash?: string | null
          praq_overrides?: Json | null
          processus_id?: string | null
          qualifie_par_id?: string | null
          source?: string | null
          statut?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          capa_id?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_qualification?: string | null
          date_traitement?: string | null
          declarant?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          gravite?: string | null
          id?: string | null
          notes_praq?: string | null
          photo_url?: string | null
          pin_hash?: string | null
          praq_overrides?: Json | null
          processus_id?: string | null
          qualifie_par_id?: string | null
          source?: string | null
          statut?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "declarations_capa_fk"
            columns: ["capa_id"]
            isOneToOne: false
            referencedRelation: "capa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_capa_fk"
            columns: ["capa_id"]
            isOneToOne: false
            referencedRelation: "capa_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus_active"
            referencedColumns: ["id"]
          },
        ]
      }
      equipements_active: {
        Row: {
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_dernier_etalonnage: string | null
          date_derniere_maintenance: string | null
          date_prochain_etalonnage: string | null
          date_prochaine_maintenance: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          fournisseur: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          localisation: string | null
          nom: string | null
          notes: string | null
          numero_serie: string | null
          praq_overrides: Json | null
          source: string | null
          statut: string | null
          type: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_dernier_etalonnage?: string | null
          date_derniere_maintenance?: string | null
          date_prochain_etalonnage?: string | null
          date_prochaine_maintenance?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          fournisseur?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          localisation?: string | null
          nom?: string | null
          notes?: string | null
          numero_serie?: string | null
          praq_overrides?: Json | null
          source?: string | null
          statut?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_dernier_etalonnage?: string | null
          date_derniere_maintenance?: string | null
          date_prochain_etalonnage?: string | null
          date_prochaine_maintenance?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          fournisseur?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          localisation?: string | null
          nom?: string | null
          notes?: string | null
          numero_serie?: string | null
          praq_overrides?: Json | null
          source?: string | null
          statut?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
      evaluations_collaborateur_active: {
        Row: {
          augmentation_demandee: boolean | null
          competences_acquises: Json | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_evaluation: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          evaluateur_id: string | null
          formations_demandees: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          objectifs_atteints: string | null
          objectifs_n_plus_1: string | null
          pj_url: string | null
          praq_overrides: Json | null
          signe_par_collaborateur: boolean | null
          signe_par_collaborateur_at: string | null
          source: string | null
          staff_id: string | null
          type: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          augmentation_demandee?: boolean | null
          competences_acquises?: Json | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_evaluation?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          evaluateur_id?: string | null
          formations_demandees?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          objectifs_atteints?: string | null
          objectifs_n_plus_1?: string | null
          pj_url?: string | null
          praq_overrides?: Json | null
          signe_par_collaborateur?: boolean | null
          signe_par_collaborateur_at?: string | null
          source?: string | null
          staff_id?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          augmentation_demandee?: boolean | null
          competences_acquises?: Json | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_evaluation?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          evaluateur_id?: string | null
          formations_demandees?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          objectifs_atteints?: string | null
          objectifs_n_plus_1?: string | null
          pj_url?: string | null
          praq_overrides?: Json | null
          signe_par_collaborateur?: boolean | null
          signe_par_collaborateur_at?: string | null
          source?: string | null
          staff_id?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_collaborateur_evaluateur_id_fkey"
            columns: ["evaluateur_id"]
            isOneToOne: false
            referencedRelation: "staff_lite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_collaborateur_evaluateur_id_fkey"
            columns: ["evaluateur_id"]
            isOneToOne: false
            referencedRelation: "staff_lite_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_collaborateur_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_lite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_collaborateur_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_lite_active"
            referencedColumns: ["id"]
          },
        ]
      }
      formations_active: {
        Row: {
          attestation: boolean | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_formation: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          duree_heures: number | null
          formateur: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          nb_participants: number | null
          notes: string | null
          participants: string[] | null
          praq_overrides: Json | null
          processus_id: string | null
          source: string | null
          statut: string | null
          titre: string | null
          type: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          attestation?: boolean | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_formation?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          duree_heures?: number | null
          formateur?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          nb_participants?: number | null
          notes?: string | null
          participants?: string[] | null
          praq_overrides?: Json | null
          processus_id?: string | null
          source?: string | null
          statut?: string | null
          titre?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          attestation?: boolean | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_formation?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          duree_heures?: number | null
          formateur?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          nb_participants?: number | null
          notes?: string | null
          participants?: string[] | null
          praq_overrides?: Json | null
          processus_id?: string | null
          source?: string | null
          statut?: string | null
          titre?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formations_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formations_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus_active"
            referencedColumns: ["id"]
          },
        ]
      }
      fournisseurs_active: {
        Row: {
          contact_email: string | null
          contact_nom: string | null
          contact_tel: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_derniere_evaluation: string | null
          date_prochaine_evaluation: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          nb_nc: number | null
          nom: string | null
          notes: string | null
          praq_overrides: Json | null
          qualifie: boolean | null
          score_evaluation: number | null
          source: string | null
          type: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_nom?: string | null
          contact_tel?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_derniere_evaluation?: string | null
          date_prochaine_evaluation?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          nb_nc?: number | null
          nom?: string | null
          notes?: string | null
          praq_overrides?: Json | null
          qualifie?: boolean | null
          score_evaluation?: number | null
          source?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_nom?: string | null
          contact_tel?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_derniere_evaluation?: string | null
          date_prochaine_evaluation?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          nb_nc?: number | null
          nom?: string | null
          notes?: string | null
          praq_overrides?: Json | null
          qualifie?: boolean | null
          score_evaluation?: number | null
          source?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
      habilitations_active: {
        Row: {
          collaborateur: string | null
          competence: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_expiration: string | null
          date_obtention: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          formation_id: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          notes: string | null
          poste: string | null
          praq_overrides: Json | null
          processus_id: string | null
          source: string | null
          statut: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          collaborateur?: string | null
          competence?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_expiration?: string | null
          date_obtention?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          formation_id?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          notes?: string | null
          poste?: string | null
          praq_overrides?: Json | null
          processus_id?: string | null
          source?: string | null
          statut?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          collaborateur?: string | null
          competence?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_expiration?: string | null
          date_obtention?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          formation_id?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          notes?: string | null
          poste?: string | null
          praq_overrides?: Json | null
          processus_id?: string | null
          source?: string | null
          statut?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habilitations_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habilitations_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habilitations_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habilitations_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus_active"
            referencedColumns: ["id"]
          },
        ]
      }
      indicateurs_active: {
        Row: {
          actif: boolean | null
          borne_basse: number | null
          borne_haute: number | null
          cible: number | null
          code: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          direction: string | null
          formule_sql: string | null
          frequence: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          libelle: string | null
          ordre: number | null
          praq_overrides: Json | null
          source: string | null
          unite: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          actif?: boolean | null
          borne_basse?: number | null
          borne_haute?: number | null
          cible?: number | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          direction?: string | null
          formule_sql?: string | null
          frequence?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          libelle?: string | null
          ordre?: number | null
          praq_overrides?: Json | null
          source?: string | null
          unite?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          actif?: boolean | null
          borne_basse?: number | null
          borne_haute?: number | null
          cible?: number | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          direction?: string | null
          formule_sql?: string | null
          frequence?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          libelle?: string | null
          ordre?: number | null
          praq_overrides?: Json | null
          source?: string | null
          unite?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
      kpi_smq_components: {
        Row: {
          code: string | null
          label: string | null
          n: number | null
          value: number | null
          weight: number | null
        }
        Relationships: []
      }
      kpi_smq_current: {
        Row: {
          active_components: number | null
          active_weight: number | null
          breakdown: Json | null
          calculated_at: string | null
          redistributed_weight: number | null
          score_global: number | null
          total_components: number | null
        }
        Relationships: []
      }
      maintenance_active: {
        Row: {
          conforme: boolean | null
          cout_ht: number | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_planifiee: string | null
          date_realisee: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          equipement_id: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          praq_overrides: Json | null
          prestataire: string | null
          rapport_url: string | null
          resultats: string | null
          source: string | null
          statut: string | null
          type: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          conforme?: boolean | null
          cout_ht?: number | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_planifiee?: string | null
          date_realisee?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          equipement_id?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          praq_overrides?: Json | null
          prestataire?: string | null
          rapport_url?: string | null
          resultats?: string | null
          source?: string | null
          statut?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          conforme?: boolean | null
          cout_ht?: number | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_planifiee?: string | null
          date_realisee?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          equipement_id?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          praq_overrides?: Json | null
          prestataire?: string | null
          rapport_url?: string | null
          resultats?: string | null
          source?: string | null
          statut?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_equipement_fk"
            columns: ["equipement_id"]
            isOneToOne: false
            referencedRelation: "equipements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_equipement_fk"
            columns: ["equipement_id"]
            isOneToOne: false
            referencedRelation: "equipements_active"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_strategique_active: {
        Row: {
          annee: number | null
          axe: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_echeance: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          indicateur_id: string | null
          notes: string | null
          objectif: string | null
          praq_overrides: Json | null
          responsable_id: string | null
          source: string | null
          statut: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
          valeur_actuelle: number | null
          valeur_cible: number | null
        }
        Insert: {
          annee?: number | null
          axe?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_echeance?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          indicateur_id?: string | null
          notes?: string | null
          objectif?: string | null
          praq_overrides?: Json | null
          responsable_id?: string | null
          source?: string | null
          statut?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
          valeur_actuelle?: number | null
          valeur_cible?: number | null
        }
        Update: {
          annee?: number | null
          axe?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_echeance?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          indicateur_id?: string | null
          notes?: string | null
          objectif?: string | null
          praq_overrides?: Json | null
          responsable_id?: string | null
          source?: string | null
          statut?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
          valeur_actuelle?: number | null
          valeur_cible?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_strategique_indicateur_fk"
            columns: ["indicateur_id"]
            isOneToOne: false
            referencedRelation: "indicateurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_strategique_indicateur_fk"
            columns: ["indicateur_id"]
            isOneToOne: false
            referencedRelation: "indicateurs_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_strategique_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "staff_lite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_strategique_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "staff_lite_active"
            referencedColumns: ["id"]
          },
        ]
      }
      processus_active: {
        Row: {
          actif: boolean | null
          code: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          nom: string | null
          praq_overrides: Json | null
          source: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          actif?: boolean | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          nom?: string | null
          praq_overrides?: Json | null
          source?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          actif?: boolean | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          nom?: string | null
          praq_overrides?: Json | null
          source?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
      projet_taches_active: {
        Row: {
          assigne_id: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_debut: string | null
          date_echeance: string | null
          date_realisee: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          ordre: number | null
          praq_overrides: Json | null
          predecesseur_id: string | null
          projet_id: string | null
          source: string | null
          statut: string | null
          titre: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          assigne_id?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_debut?: string | null
          date_echeance?: string | null
          date_realisee?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          ordre?: number | null
          praq_overrides?: Json | null
          predecesseur_id?: string | null
          projet_id?: string | null
          source?: string | null
          statut?: string | null
          titre?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          assigne_id?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_debut?: string | null
          date_echeance?: string | null
          date_realisee?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          ordre?: number | null
          praq_overrides?: Json | null
          predecesseur_id?: string | null
          projet_id?: string | null
          source?: string | null
          statut?: string | null
          titre?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projet_taches_assigne_id_fkey"
            columns: ["assigne_id"]
            isOneToOne: false
            referencedRelation: "staff_lite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projet_taches_assigne_id_fkey"
            columns: ["assigne_id"]
            isOneToOne: false
            referencedRelation: "staff_lite_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projet_taches_predecesseur_fk"
            columns: ["predecesseur_id"]
            isOneToOne: false
            referencedRelation: "projet_taches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projet_taches_predecesseur_fk"
            columns: ["predecesseur_id"]
            isOneToOne: false
            referencedRelation: "projet_taches_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projet_taches_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projet_taches_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets_active"
            referencedColumns: ["id"]
          },
        ]
      }
      projets_active: {
        Row: {
          budget_consomme: number | null
          budget_prevu: number | null
          categorie: string | null
          chef_projet_id: string | null
          code: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_debut: string | null
          date_fin_prevue: string | null
          date_fin_reelle: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          nom: string | null
          pj_url: string | null
          praq_overrides: Json | null
          source: string | null
          statut: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          budget_consomme?: number | null
          budget_prevu?: number | null
          categorie?: string | null
          chef_projet_id?: string | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_debut?: string | null
          date_fin_prevue?: string | null
          date_fin_reelle?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          nom?: string | null
          pj_url?: string | null
          praq_overrides?: Json | null
          source?: string | null
          statut?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          budget_consomme?: number | null
          budget_prevu?: number | null
          categorie?: string | null
          chef_projet_id?: string | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_debut?: string | null
          date_fin_prevue?: string | null
          date_fin_reelle?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          nom?: string | null
          pj_url?: string | null
          praq_overrides?: Json | null
          source?: string | null
          statut?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projets_chef_projet_id_fkey"
            columns: ["chef_projet_id"]
            isOneToOne: false
            referencedRelation: "staff_lite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projets_chef_projet_id_fkey"
            columns: ["chef_projet_id"]
            isOneToOne: false
            referencedRelation: "staff_lite_active"
            referencedColumns: ["id"]
          },
        ]
      }
      reclamations_active: {
        Row: {
          action_corrective: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_cloture: string | null
          date_reception: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          frozen_at: string | null
          frozen_by: string | null
          gravite: string | null
          id: string | null
          notes: string | null
          praq_overrides: Json | null
          processus_id: string | null
          reference: string | null
          satisfaction: string | null
          source: string | null
          statut: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          action_corrective?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_cloture?: string | null
          date_reception?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          gravite?: string | null
          id?: string | null
          notes?: string | null
          praq_overrides?: Json | null
          processus_id?: string | null
          reference?: string | null
          satisfaction?: string | null
          source?: string | null
          statut?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          action_corrective?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_cloture?: string | null
          date_reception?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          gravite?: string | null
          id?: string | null
          notes?: string | null
          praq_overrides?: Json | null
          processus_id?: string | null
          reference?: string | null
          satisfaction?: string | null
          source?: string | null
          statut?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reclamations_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reclamations_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus_active"
            referencedColumns: ["id"]
          },
        ]
      }
      revue_actions_active: {
        Row: {
          capa_id: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_echeance: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          num: number | null
          praq_overrides: Json | null
          responsable_id: string | null
          revue_id: string | null
          source: string | null
          statut: string | null
          titre: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          capa_id?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_echeance?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          num?: number | null
          praq_overrides?: Json | null
          responsable_id?: string | null
          revue_id?: string | null
          source?: string | null
          statut?: string | null
          titre?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          capa_id?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_echeance?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          num?: number | null
          praq_overrides?: Json | null
          responsable_id?: string | null
          revue_id?: string | null
          source?: string | null
          statut?: string | null
          titre?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revue_actions_capa_fk"
            columns: ["capa_id"]
            isOneToOne: false
            referencedRelation: "capa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revue_actions_capa_fk"
            columns: ["capa_id"]
            isOneToOne: false
            referencedRelation: "capa_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revue_actions_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "staff_lite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revue_actions_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "staff_lite_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revue_actions_revue_id_fkey"
            columns: ["revue_id"]
            isOneToOne: false
            referencedRelation: "revue_direction"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revue_actions_revue_id_fkey"
            columns: ["revue_id"]
            isOneToOne: false
            referencedRelation: "revue_direction_active"
            referencedColumns: ["id"]
          },
        ]
      }
      revue_direction_active: {
        Row: {
          annee: number | null
          conclusions: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_planifiee: string | null
          date_realisee: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          duree_min: number | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          ordre_du_jour: string | null
          pdf_url: string | null
          praq_overrides: Json | null
          presents: string | null
          prochaine_revue_date: string | null
          snapshot_at: string | null
          snapshot_audits: Json | null
          snapshot_by: string | null
          snapshot_capa: Json | null
          snapshot_fournisseurs: Json | null
          snapshot_reclamations: Json | null
          snapshot_risques: Json | null
          snapshot_smq: Json | null
          source: string | null
          statut: string | null
          synthese_executive: string | null
          trimestre: number | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          annee?: number | null
          conclusions?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_planifiee?: string | null
          date_realisee?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          duree_min?: number | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          ordre_du_jour?: string | null
          pdf_url?: string | null
          praq_overrides?: Json | null
          presents?: string | null
          prochaine_revue_date?: string | null
          snapshot_at?: string | null
          snapshot_audits?: Json | null
          snapshot_by?: string | null
          snapshot_capa?: Json | null
          snapshot_fournisseurs?: Json | null
          snapshot_reclamations?: Json | null
          snapshot_risques?: Json | null
          snapshot_smq?: Json | null
          source?: string | null
          statut?: string | null
          synthese_executive?: string | null
          trimestre?: number | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          annee?: number | null
          conclusions?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_planifiee?: string | null
          date_realisee?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          duree_min?: number | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          ordre_du_jour?: string | null
          pdf_url?: string | null
          praq_overrides?: Json | null
          presents?: string | null
          prochaine_revue_date?: string | null
          snapshot_at?: string | null
          snapshot_audits?: Json | null
          snapshot_by?: string | null
          snapshot_capa?: Json | null
          snapshot_fournisseurs?: Json | null
          snapshot_reclamations?: Json | null
          snapshot_risques?: Json | null
          snapshot_smq?: Json | null
          source?: string | null
          statut?: string | null
          synthese_executive?: string | null
          trimestre?: number | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
      risques_active: {
        Row: {
          action_prevue: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          criticite: number | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          detectabilite: number | null
          frozen_at: string | null
          frozen_by: string | null
          gravite: number | null
          id: string | null
          niveau: string | null
          praq_overrides: Json | null
          probabilite: number | null
          processus_id: string | null
          source: string | null
          statut: string | null
          titre: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          action_prevue?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          criticite?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          detectabilite?: number | null
          frozen_at?: string | null
          frozen_by?: string | null
          gravite?: number | null
          id?: string | null
          niveau?: string | null
          praq_overrides?: Json | null
          probabilite?: number | null
          processus_id?: string | null
          source?: string | null
          statut?: string | null
          titre?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          action_prevue?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          criticite?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          detectabilite?: number | null
          frozen_at?: string | null
          frozen_by?: string | null
          gravite?: number | null
          id?: string | null
          niveau?: string | null
          praq_overrides?: Json | null
          probabilite?: number | null
          processus_id?: string | null
          source?: string | null
          statut?: string | null
          titre?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risques_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risques_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus_active"
            referencedColumns: ["id"]
          },
        ]
      }
      sops_active: {
        Row: {
          code: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_creation: string | null
          date_derniere_revision: string | null
          date_revision: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          fichier_url: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          notes: string | null
          praq_overrides: Json | null
          processus_id: string | null
          responsable: string | null
          source: string | null
          statut: string | null
          titre: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
          version: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_creation?: string | null
          date_derniere_revision?: string | null
          date_revision?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          fichier_url?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          notes?: string | null
          praq_overrides?: Json | null
          processus_id?: string | null
          responsable?: string | null
          source?: string | null
          statut?: string | null
          titre?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
          version?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_creation?: string | null
          date_derniere_revision?: string | null
          date_revision?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          fichier_url?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          notes?: string | null
          praq_overrides?: Json | null
          processus_id?: string | null
          responsable?: string | null
          source?: string | null
          statut?: string | null
          titre?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sops_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sops_processus_id_fkey"
            columns: ["processus_id"]
            isOneToOne: false
            referencedRelation: "processus_active"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_lite_active: {
        Row: {
          actif: boolean | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          praq_overrides: Json | null
          prenom_nom: string | null
          role: string | null
          source: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          actif?: boolean | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          praq_overrides?: Json | null
          prenom_nom?: string | null
          role?: string | null
          source?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          actif?: boolean | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          praq_overrides?: Json | null
          prenom_nom?: string | null
          role?: string | null
          source?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
      tracabilites_suivi_active: {
        Row: {
          code: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          derniere_realisation: string | null
          frequence: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          libelle: string | null
          notes: string | null
          praq_overrides: Json | null
          prochaine_echeance: string | null
          responsable_id: string | null
          source: string | null
          source_url: string | null
          statut: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          derniere_realisation?: string | null
          frequence?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          libelle?: string | null
          notes?: string | null
          praq_overrides?: Json | null
          prochaine_echeance?: string | null
          responsable_id?: string | null
          source?: string | null
          source_url?: string | null
          statut?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          derniere_realisation?: string | null
          frequence?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          libelle?: string | null
          notes?: string | null
          praq_overrides?: Json | null
          prochaine_echeance?: string | null
          responsable_id?: string | null
          source?: string | null
          source_url?: string | null
          statut?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracabilites_suivi_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "staff_lite"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracabilites_suivi_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "staff_lite_active"
            referencedColumns: ["id"]
          },
        ]
      }
      vigilances_active: {
        Row: {
          actions_prises: string | null
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_signal: string | null
          date_traitement: string | null
          declare_ansm_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string | null
          etape_courante: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string | null
          nb_patients_concernes: number | null
          nb_patients_rappeles: number | null
          nb_unites_concernees: number | null
          nb_unites_isolees: number | null
          notes: string | null
          praq_overrides: Json | null
          ref_declaration_ansm: string | null
          reference: string | null
          source: string | null
          statut: string | null
          titre: string | null
          type: string | null
          update_reason: string | null
          updated_at: string | null
          updated_by: string | null
          updated_by_kind: string | null
        }
        Insert: {
          actions_prises?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_signal?: string | null
          date_traitement?: string | null
          declare_ansm_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          etape_courante?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          nb_patients_concernes?: number | null
          nb_patients_rappeles?: number | null
          nb_unites_concernees?: number | null
          nb_unites_isolees?: number | null
          notes?: string | null
          praq_overrides?: Json | null
          ref_declaration_ansm?: string | null
          reference?: string | null
          source?: string | null
          statut?: string | null
          titre?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Update: {
          actions_prises?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_kind?: string | null
          date_signal?: string | null
          date_traitement?: string | null
          declare_ansm_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string | null
          etape_courante?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string | null
          nb_patients_concernes?: number | null
          nb_patients_rappeles?: number | null
          nb_unites_concernees?: number | null
          nb_unites_isolees?: number | null
          notes?: string | null
          praq_overrides?: Json | null
          ref_declaration_ansm?: string | null
          reference?: string | null
          source?: string | null
          statut?: string | null
          titre?: string | null
          type?: string | null
          update_reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
          updated_by_kind?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      fn_actor_kind: { Args: never; Returns: string }
      fn_actor_uid: { Args: never; Returns: string }
      fn_archive_smq_score: {
        Args: never
        Returns: {
          created_at: string | null
          created_by: string | null
          created_by_kind: string | null
          date_calcul: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          details: Json | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          nb_capa_en_retard: number | null
          nb_capa_ouvertes: number | null
          perimetre: string
          praq_overrides: Json
          score_audits: number | null
          score_capa: number | null
          score_equipements: number | null
          score_global: number | null
          score_habilitations: number | null
          score_reclamations: number | null
          score_risques: number | null
          score_smq: number | null
          score_sops: number | null
          source: string | null
          taux_audits_realises: number | null
          taux_equipements_conformes: number | null
          taux_habilitations: number | null
          taux_sops_conformes: number | null
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
        }
        SetofOptions: {
          from: "*"
          to: "kpi_history"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fn_install_audit_columns: {
        Args: { p_table: string }
        Returns: undefined
      }
      fn_install_standard_policies: {
        Args: { p_table: string }
        Returns: undefined
      }
      freeze_rdd: {
        Args: { p_rdd_id: string }
        Returns: {
          annee: number
          conclusions: string | null
          created_at: string
          created_by: string | null
          created_by_kind: string | null
          date_planifiee: string | null
          date_realisee: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          duree_min: number | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          ordre_du_jour: string | null
          pdf_url: string | null
          perimetre: string
          praq_overrides: Json
          presents: string | null
          prochaine_revue_date: string | null
          snapshot_at: string | null
          snapshot_audits: Json | null
          snapshot_by: string | null
          snapshot_capa: Json | null
          snapshot_fournisseurs: Json | null
          snapshot_reclamations: Json | null
          snapshot_risques: Json | null
          snapshot_smq: Json | null
          source: string | null
          statut: string
          synthese_executive: string | null
          trimestre: number | null
          update_reason: string | null
          updated_at: string
          updated_by: string | null
          updated_by_kind: string | null
        }
        SetofOptions: {
          from: "*"
          to: "revue_direction"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      kpi_smq_components_scoped: {
        Args: { p_perimetre?: string }
        Returns: {
          code: string
          label: string
          n: number
          value: number
          weight: number
        }[]
      }
      kpi_smq_current_scoped: {
        Args: { p_perimetre?: string }
        Returns: {
          active_components: number
          active_weight: number
          breakdown: Json
          calculated_at: string
          redistributed_weight: number
          score_global: number
          total_components: number
        }[]
      }
      praq_is_pda: {
        Args: { p_overrides: Json; p_processus_id: string }
        Returns: boolean
      }
      set_actor_context: {
        Args: { actor_kind: string; actor_uid?: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
