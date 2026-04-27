-- =============================================
-- Dashboard PRAQ v2 — Pharma78
-- Migration 040 — Row Level Security (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE capas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vigilances ENABLE ROW LEVEL SECURITY;
ALTER TABLE recalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_actions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Helper function to get user role
-- =============================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role')::TEXT,
    'declarant'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- =============================================
-- PRAQ (admin) — Full access to all tables
-- =============================================

-- Domains
CREATE POLICY "praq_all_domains" ON domains FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Staff
CREATE POLICY "praq_all_staff" ON staff FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Staff PINs
CREATE POLICY "praq_all_staff_pins" ON staff_pins FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- SOPs
CREATE POLICY "praq_all_sops" ON sops FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- CAPAs
CREATE POLICY "praq_all_capas" ON capas FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Audits
CREATE POLICY "praq_all_audits" ON audits FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Audit Findings
CREATE POLICY "praq_all_audit_findings" ON audit_findings FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Risks
CREATE POLICY "praq_all_risks" ON risks FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Vigilances
CREATE POLICY "praq_all_vigilances" ON vigilances FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Recalls
CREATE POLICY "praq_all_recalls" ON recalls FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Qualifications
CREATE POLICY "praq_all_qualifications" ON qualifications FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Trainings
CREATE POLICY "praq_all_trainings" ON trainings FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Equipment
CREATE POLICY "praq_all_equipment" ON equipment FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Maintenance
CREATE POLICY "praq_all_maintenance" ON maintenance FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Suppliers
CREATE POLICY "praq_all_suppliers" ON suppliers FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Supplier Events
CREATE POLICY "praq_all_supplier_events" ON supplier_events FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Complaints
CREATE POLICY "praq_all_complaints" ON complaints FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Indicators
CREATE POLICY "praq_all_indicators" ON indicators FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Indicator Values
CREATE POLICY "praq_all_indicator_values" ON indicator_values FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Reviews
CREATE POLICY "praq_all_reviews" ON reviews FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- Review Actions
CREATE POLICY "praq_all_review_actions" ON review_actions FOR ALL TO authenticated USING (get_user_role() = 'praq') WITH CHECK (get_user_role() = 'praq');

-- =============================================
-- DIRECTION — Read-only access to all tables
-- =============================================

CREATE POLICY "direction_select_domains" ON domains FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_staff" ON staff FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_sops" ON sops FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_capas" ON capas FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_audits" ON audits FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_audit_findings" ON audit_findings FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_risks" ON risks FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_vigilances" ON vigilances FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_recalls" ON recalls FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_qualifications" ON qualifications FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_trainings" ON trainings FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_equipment" ON equipment FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_maintenance" ON maintenance FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_suppliers" ON suppliers FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_supplier_events" ON supplier_events FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_complaints" ON complaints FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_indicators" ON indicators FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_indicator_values" ON indicator_values FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_reviews" ON reviews FOR SELECT TO authenticated USING (get_user_role() = 'direction');
CREATE POLICY "direction_select_review_actions" ON review_actions FOR SELECT TO authenticated USING (get_user_role() = 'direction');

-- =============================================
-- AUDITEUR — Limited read-only access
-- =============================================

CREATE POLICY "auditeur_select_domains" ON domains FOR SELECT TO authenticated USING (get_user_role() = 'auditeur');
CREATE POLICY "auditeur_select_sops" ON sops FOR SELECT TO authenticated USING (get_user_role() = 'auditeur');
CREATE POLICY "auditeur_select_audits" ON audits FOR SELECT TO authenticated USING (get_user_role() = 'auditeur');
CREATE POLICY "auditeur_select_audit_findings" ON audit_findings FOR SELECT TO authenticated USING (get_user_role() = 'auditeur');
CREATE POLICY "auditeur_select_risks" ON risks FOR SELECT TO authenticated USING (get_user_role() = 'auditeur');
CREATE POLICY "auditeur_select_capas" ON capas FOR SELECT TO authenticated USING (get_user_role() = 'auditeur');

-- =============================================
-- RESP_PROCESSUS — Select all + Update on own domain
-- (simplified version: can select all, update limited by app logic)
-- =============================================

CREATE POLICY "resp_select_all" ON capas FOR SELECT TO authenticated USING (get_user_role() = 'resp_processus');
CREATE POLICY "resp_select_sops" ON sops FOR SELECT TO authenticated USING (get_user_role() = 'resp_processus');
CREATE POLICY "resp_select_risks" ON risks FOR SELECT TO authenticated USING (get_user_role() = 'resp_processus');
CREATE POLICY "resp_select_audits" ON audits FOR SELECT TO authenticated USING (get_user_role() = 'resp_processus');

-- =============================================
-- DECLARANT — Insert terrain CAPAs + Select own declarations
-- =============================================

CREATE POLICY "declarant_insert_capas" ON capas
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() = 'declarant'
    AND source = 'Terrain'
  );

CREATE POLICY "declarant_select_own_capas" ON capas
  FOR SELECT TO authenticated
  USING (
    get_user_role() = 'declarant'
    AND created_by = auth.uid()
    AND source = 'Terrain'
  );

-- Declarant needs to read domains for the form
CREATE POLICY "declarant_select_domains" ON domains FOR SELECT TO authenticated USING (get_user_role() = 'declarant');

-- =============================================
-- PUBLIC ACCESS (anon users) - NONE
-- All tables require authentication
-- =============================================
