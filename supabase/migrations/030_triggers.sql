-- =============================================
-- Dashboard PRAQ v2 — Pharma78
-- Migration 030 — Triggers
-- =============================================

-- =============================================
-- AUTO UPDATE updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_pins_updated_at BEFORE UPDATE ON staff_pins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sops_updated_at BEFORE UPDATE ON sops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_capas_updated_at BEFORE UPDATE ON capas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON audits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audit_findings_updated_at BEFORE UPDATE ON audit_findings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vigilances_updated_at BEFORE UPDATE ON vigilances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recalls_updated_at BEFORE UPDATE ON recalls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_qualifications_updated_at BEFORE UPDATE ON qualifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON trainings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplier_events_updated_at BEFORE UPDATE ON supplier_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_indicators_updated_at BEFORE UPDATE ON indicators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_indicator_values_updated_at BEFORE UPDATE ON indicator_values FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_review_actions_updated_at BEFORE UPDATE ON review_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- AUTO CALCULATE RISK LEVEL
-- =============================================

CREATE OR REPLACE FUNCTION calculate_risk_level()
RETURNS TRIGGER AS $$
BEGIN
  -- criticality is auto-calculated by generated column
  -- we just need to set the level based on criticality
  IF NEW.criticality >= 60 THEN
    NEW.level = 'Inacceptable'::risk_level;
  ELSIF NEW.criticality >= 24 THEN
    NEW.level = 'Surveillance'::risk_level;
  ELSE
    NEW.level = 'Acceptable'::risk_level;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_risk_level
  BEFORE INSERT OR UPDATE OF probability, gravity, detectability
  ON risks
  FOR EACH ROW
  EXECUTE FUNCTION calculate_risk_level();
