// =============================================
// Dashboard PRAQ v2 — Pharma78
// Database Types — Auto-generated from Supabase schema
// =============================================

// =============================================
// ENUMS
// =============================================

export type SopStatus = 'Planifié' | 'En cours' | 'Validé' | 'En révision' | 'Archivé';

export type CapaStatus = 'Ouverte' | 'En cours' | 'Vérification efficacité' | 'Clôturée';

export type CapaSource =
  | 'Audit'
  | 'Réclamation'
  | 'Vigilance'
  | 'Auto-évaluation'
  | 'Revue direction'
  | 'Terrain';

export type CapaType =
  | 'Non-conformité'
  | 'Action corrective'
  | 'Action préventive'
  | 'Amélioration'
  | 'Anomalie'
  | 'Near miss';

export type AuditStatus = 'Planifié' | 'En cours' | 'Réalisé' | 'Reporté' | 'Annulé';

export type RiskLevel = 'Acceptable' | 'Surveillance' | 'Inacceptable';

export type ProcessType = 'Management' | 'Réalisation' | 'Support';

// =============================================
// TABLE TYPES
// =============================================

export type Domain = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  name: string;
  process_type: ProcessType;
};

export type Staff = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  name: string;
  role: string;
  cluster: string | null;
  email: string | null;
  active: boolean;
};

export type StaffPin = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  staff_id: string;
  pin_hash: string;
  locked: boolean;
  failed_attempts: number;
};

export type Sop = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  code: string;
  title: string;
  domain_id: string;
  owner: string | null;
  status: SopStatus;
  version: string;
  validated_at: string | null;
  next_revision: string | null;
  notes: string | null;
};

export type Capa = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  source: CapaSource;
  type: CapaType;
  domain_id: string | null;
  description: string;
  root_cause: string | null;
  action: string | null;
  owner: string | null;
  due_date: string | null;
  status: CapaStatus;
  closed_at: string | null;
  efficacy_check: string | null;
  efficacy_result: string | null;
  terrain_zone: string | null;
  terrain_severity: string | null;
  terrain_photo_url: string | null;
};

export type Audit = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  type: string;
  domain_id: string | null;
  reference: string;
  auditor: string | null;
  planned_at: string | null;
  completed_at: string | null;
  status: AuditStatus;
  major_findings: number;
  minor_findings: number;
  observations: number;
  strengths: string | null;
  summary: string | null;
};

export type AuditFinding = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  audit_id: string;
  type: string;
  clause_ref: string | null;
  description: string;
  capa_id: string | null;
};

export type Risk = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  domain_id: string | null;
  description: string;
  causes: string | null;
  consequences: string | null;
  probability: number;
  gravity: number;
  detectability: number;
  criticality: number; // Generated
  level: RiskLevel | null;
  mitigation: string | null;
  owner: string | null;
  review_due: string | null;
  residual_p: number | null;
  residual_g: number | null;
  residual_d: number | null;
  residual_crit: number; // Generated
};

export type Vigilance = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  type: string;
  product: string | null;
  lot: string | null;
  severity: string | null;
  declared_ansm: boolean;
  ansm_ref: string | null;
  measures: string | null;
  capa_id: string | null;
  status: string;
};

export type Recall = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  source: string;
  product: string;
  lots: string | null;
  action: string;
  quantity: string | null;
  status: string;
};

export type Qualification = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  staff_id: string;
  skill_name: string;
  obtained_at: string;
  expires_at: string | null;
  status: string;
};

export type Training = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  staff_id: string;
  title: string;
  type: string;
  planned_at: string | null;
  completed_at: string | null;
  evaluation: string | null;
  next_due: string | null;
};

export type Equipment = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  name: string;
  category: string;
  brand_model: string | null;
  serial_no: string | null;
  location: string | null;
  commissioned_at: string | null;
  status: string;
  criticality: string;
};

export type Maintenance = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  equipment_id: string;
  type: string;
  frequency: string | null;
  last_done_at: string | null;
  next_due_at: string;
  provider: string | null;
  status: string | null;
  result: string | null;
  certificate_ref: string | null;
};

export type Supplier = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  name: string;
  type: string;
  category: string | null;
  contract: string | null;
  last_eval_at: string | null;
  eval_score: number | null;
  rgpd_clause: boolean;
  hds_compliant: boolean;
};

export type SupplierEvent = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  supplier_id: string;
  type: string;
  description: string;
  action: string | null;
  capa_id: string | null;
};

export type Complaint = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  source: string;
  ehpad_name: string | null;
  category: string;
  severity: string | null;
  owner: string | null;
  responded_at: string | null;
  status: string;
  satisfaction: string | null;
  capa_id: string | null;
};

export type Indicator = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  label: string;
  target: number;
  unit: string;
  direction: 'up' | 'down';
  source_tab: string | null;
};

export type IndicatorValue = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  indicator_id: string;
  period: string;
  value: number;
};

export type Review = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  date: string;
  participants: string | null;
  status: string;
  context_notes: string | null;
  resource_notes: string | null;
  improvement: string | null;
};

export type ReviewAction = {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  review_id: string;
  decision: string;
  action: string | null;
  owner: string | null;
  due_date: string | null;
  status: string;
  followup_notes: string | null;
};

// =============================================
// VIEWS
// =============================================

export type AlertSeverity = 'red' | 'amber' | 'green';

export type AlertType =
  | 'capa_overdue'
  | 'qualification_expiring'
  | 'qualification_expired'
  | 'maintenance_overdue'
  | 'sop_revision_due'
  | 'complaint_overdue'
  | 'vigilance_undeclared';

export type Alert = {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  source_table: string;
  source_id: string;
  created_at: string;
};

// =============================================
// INSERT TYPES (without generated fields)
// =============================================

export type DomainInsert = Omit<Domain, 'id' | 'created_at' | 'updated_at'>;
export type StaffInsert = Omit<Staff, 'id' | 'created_at' | 'updated_at'>;
export type StaffPinInsert = Omit<StaffPin, 'id' | 'created_at' | 'updated_at'>;
export type SopInsert = Omit<Sop, 'id' | 'created_at' | 'updated_at'>;
export type CapaInsert = Omit<Capa, 'id' | 'created_at' | 'updated_at'>;
export type AuditInsert = Omit<Audit, 'id' | 'created_at' | 'updated_at'>;
export type AuditFindingInsert = Omit<AuditFinding, 'id' | 'created_at' | 'updated_at'>;
export type RiskInsert = Omit<Risk, 'id' | 'created_at' | 'updated_at' | 'criticality' | 'residual_crit'>;
export type VigilanceInsert = Omit<Vigilance, 'id' | 'created_at' | 'updated_at'>;
export type RecallInsert = Omit<Recall, 'id' | 'created_at' | 'updated_at'>;
export type QualificationInsert = Omit<Qualification, 'id' | 'created_at' | 'updated_at'>;
export type TrainingInsert = Omit<Training, 'id' | 'created_at' | 'updated_at'>;
export type EquipmentInsert = Omit<Equipment, 'id' | 'created_at' | 'updated_at'>;
export type MaintenanceInsert = Omit<Maintenance, 'id' | 'created_at' | 'updated_at'>;
export type SupplierInsert = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;
export type SupplierEventInsert = Omit<SupplierEvent, 'id' | 'created_at' | 'updated_at'>;
export type ComplaintInsert = Omit<Complaint, 'id' | 'created_at' | 'updated_at'>;
export type IndicatorInsert = Omit<Indicator, 'id' | 'created_at' | 'updated_at'>;
export type IndicatorValueInsert = Omit<IndicatorValue, 'id' | 'created_at' | 'updated_at'>;
export type ReviewInsert = Omit<Review, 'id' | 'created_at' | 'updated_at'>;
export type ReviewActionInsert = Omit<ReviewAction, 'id' | 'created_at' | 'updated_at'>;

// =============================================
// UPDATE TYPES (all fields optional except id)
// =============================================

export type DomainUpdate = Partial<Omit<Domain, 'id' | 'created_at' | 'updated_at'>>;
export type StaffUpdate = Partial<Omit<Staff, 'id' | 'created_at' | 'updated_at'>>;
export type StaffPinUpdate = Partial<Omit<StaffPin, 'id' | 'created_at' | 'updated_at'>>;
export type SopUpdate = Partial<Omit<Sop, 'id' | 'created_at' | 'updated_at'>>;
export type CapaUpdate = Partial<Omit<Capa, 'id' | 'created_at' | 'updated_at'>>;
export type AuditUpdate = Partial<Omit<Audit, 'id' | 'created_at' | 'updated_at'>>;
export type AuditFindingUpdate = Partial<Omit<AuditFinding, 'id' | 'created_at' | 'updated_at'>>;
export type RiskUpdate = Partial<Omit<Risk, 'id' | 'created_at' | 'updated_at' | 'criticality' | 'residual_crit'>>;
export type VigilanceUpdate = Partial<Omit<Vigilance, 'id' | 'created_at' | 'updated_at'>>;
export type RecallUpdate = Partial<Omit<Recall, 'id' | 'created_at' | 'updated_at'>>;
export type QualificationUpdate = Partial<Omit<Qualification, 'id' | 'created_at' | 'updated_at'>>;
export type TrainingUpdate = Partial<Omit<Training, 'id' | 'created_at' | 'updated_at'>>;
export type EquipmentUpdate = Partial<Omit<Equipment, 'id' | 'created_at' | 'updated_at'>>;
export type MaintenanceUpdate = Partial<Omit<Maintenance, 'id' | 'created_at' | 'updated_at'>>;
export type SupplierUpdate = Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>;
export type SupplierEventUpdate = Partial<Omit<SupplierEvent, 'id' | 'created_at' | 'updated_at'>>;
export type ComplaintUpdate = Partial<Omit<Complaint, 'id' | 'created_at' | 'updated_at'>>;
export type IndicatorUpdate = Partial<Omit<Indicator, 'id' | 'created_at' | 'updated_at'>>;
export type IndicatorValueUpdate = Partial<Omit<IndicatorValue, 'id' | 'created_at' | 'updated_at'>>;
export type ReviewUpdate = Partial<Omit<Review, 'id' | 'created_at' | 'updated_at'>>;
export type ReviewActionUpdate = Partial<Omit<ReviewAction, 'id' | 'created_at' | 'updated_at'>>;

// =============================================
// DATABASE TYPE (for Supabase client)
// =============================================

export type Database = {
  public: {
    Tables: {
      domains: {
        Row: Domain;
        Insert: DomainInsert;
        Update: DomainUpdate;
      };
      staff: {
        Row: Staff;
        Insert: StaffInsert;
        Update: StaffUpdate;
      };
      staff_pins: {
        Row: StaffPin;
        Insert: StaffPinInsert;
        Update: StaffPinUpdate;
      };
      sops: {
        Row: Sop;
        Insert: SopInsert;
        Update: SopUpdate;
      };
      capas: {
        Row: Capa;
        Insert: CapaInsert;
        Update: CapaUpdate;
      };
      audits: {
        Row: Audit;
        Insert: AuditInsert;
        Update: AuditUpdate;
      };
      audit_findings: {
        Row: AuditFinding;
        Insert: AuditFindingInsert;
        Update: AuditFindingUpdate;
      };
      risks: {
        Row: Risk;
        Insert: RiskInsert;
        Update: RiskUpdate;
      };
      vigilances: {
        Row: Vigilance;
        Insert: VigilanceInsert;
        Update: VigilanceUpdate;
      };
      recalls: {
        Row: Recall;
        Insert: RecallInsert;
        Update: RecallUpdate;
      };
      qualifications: {
        Row: Qualification;
        Insert: QualificationInsert;
        Update: QualificationUpdate;
      };
      trainings: {
        Row: Training;
        Insert: TrainingInsert;
        Update: TrainingUpdate;
      };
      equipment: {
        Row: Equipment;
        Insert: EquipmentInsert;
        Update: EquipmentUpdate;
      };
      maintenance: {
        Row: Maintenance;
        Insert: MaintenanceInsert;
        Update: MaintenanceUpdate;
      };
      suppliers: {
        Row: Supplier;
        Insert: SupplierInsert;
        Update: SupplierUpdate;
      };
      supplier_events: {
        Row: SupplierEvent;
        Insert: SupplierEventInsert;
        Update: SupplierEventUpdate;
      };
      complaints: {
        Row: Complaint;
        Insert: ComplaintInsert;
        Update: ComplaintUpdate;
      };
      indicators: {
        Row: Indicator;
        Insert: IndicatorInsert;
        Update: IndicatorUpdate;
      };
      indicator_values: {
        Row: IndicatorValue;
        Insert: IndicatorValueInsert;
        Update: IndicatorValueUpdate;
      };
      reviews: {
        Row: Review;
        Insert: ReviewInsert;
        Update: ReviewUpdate;
      };
      review_actions: {
        Row: ReviewAction;
        Insert: ReviewActionInsert;
        Update: ReviewActionUpdate;
      };
    };
    Views: {
      alerts_view: {
        Row: Alert;
      };
    };
    Enums: {
      sop_status: SopStatus;
      capa_status: CapaStatus;
      capa_source: CapaSource;
      capa_type: CapaType;
      audit_status: AuditStatus;
      risk_level: RiskLevel;
      process_type: ProcessType;
    };
  };
};
