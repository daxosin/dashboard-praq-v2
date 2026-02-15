-- =============================================
-- Dashboard PRAQ v2 — Pharma78
-- Migration 999 — Schema Verification
-- Ce fichier n'est PAS une migration à appliquer.
-- C'est un ensemble de requêtes pour VÉRIFIER le schéma.
-- =============================================

-- =============================================
-- 1. ENUMS VERIFICATION
-- =============================================

DO $$
DECLARE
  enum_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO enum_count
  FROM pg_type
  WHERE typname IN (
    'sop_status',
    'capa_status',
    'capa_source',
    'capa_type',
    'audit_status',
    'risk_level',
    'process_type'
  );

  IF enum_count = 7 THEN
    RAISE NOTICE '✓ All 7 enums created successfully';
  ELSE
    RAISE WARNING '✗ Expected 7 enums, found %', enum_count;
  END IF;
END $$;

-- =============================================
-- 2. TABLES VERIFICATION
-- =============================================

DO $$
DECLARE
  table_count INTEGER;
  expected_tables TEXT[] := ARRAY[
    'domains', 'staff', 'staff_pins', 'sops', 'capas',
    'audits', 'audit_findings', 'risks', 'vigilances', 'recalls',
    'qualifications', 'trainings', 'equipment', 'maintenance',
    'suppliers', 'supplier_events', 'complaints',
    'indicators', 'indicator_values', 'reviews', 'review_actions'
  ];
  missing_tables TEXT[];
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

  IF table_count = 21 THEN
    RAISE NOTICE '✓ All 21 tables created successfully';
  ELSE
    RAISE WARNING '✗ Expected 21 tables, found %', table_count;
  END IF;

  -- Check for missing tables
  SELECT ARRAY_AGG(t)
  INTO missing_tables
  FROM UNNEST(expected_tables) AS t
  WHERE t NOT IN (
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
  );

  IF missing_tables IS NOT NULL THEN
    RAISE WARNING 'Missing tables: %', missing_tables;
  END IF;
END $$;

-- =============================================
-- 3. STANDARD COLUMNS VERIFICATION
-- =============================================

DO $$
DECLARE
  table_name TEXT;
  missing_cols TEXT[];
BEGIN
  FOR table_name IN
    SELECT t.table_name
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
  LOOP
    SELECT ARRAY_AGG(col)
    INTO missing_cols
    FROM UNNEST(ARRAY['id', 'created_at', 'updated_at', 'created_by']) AS col
    WHERE col NOT IN (
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND information_schema.columns.table_name = table_name
    );

    IF missing_cols IS NOT NULL THEN
      RAISE WARNING 'Table % missing standard columns: %', table_name, missing_cols;
    END IF;
  END LOOP;

  RAISE NOTICE '✓ Standard columns verification complete';
END $$;

-- =============================================
-- 4. TRIGGERS VERIFICATION
-- =============================================

DO $$
DECLARE
  trigger_count INTEGER;
  expected_count INTEGER := 21; -- updated_at triggers
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_name LIKE 'update_%_updated_at';

  IF trigger_count = expected_count THEN
    RAISE NOTICE '✓ All % updated_at triggers created successfully', expected_count;
  ELSE
    RAISE WARNING '✗ Expected % updated_at triggers, found %', expected_count, trigger_count;
  END IF;

  -- Check risk level trigger
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'set_risk_level'
  ) THEN
    RAISE NOTICE '✓ Risk level trigger created';
  ELSE
    RAISE WARNING '✗ Risk level trigger missing';
  END IF;
END $$;

-- =============================================
-- 5. VIEWS VERIFICATION
-- =============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name = 'alerts_view'
  ) THEN
    RAISE NOTICE '✓ alerts_view created successfully';
  ELSE
    RAISE WARNING '✗ alerts_view missing';
  END IF;
END $$;

-- =============================================
-- 6. RLS VERIFICATION
-- =============================================

DO $$
DECLARE
  rls_count INTEGER;
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO rls_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND rowsecurity = true;

  IF rls_count = 21 THEN
    RAISE NOTICE '✓ RLS enabled on all 21 tables';
  ELSE
    RAISE WARNING '✗ RLS should be enabled on 21 tables, enabled on %', rls_count;
  END IF;

  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';

  RAISE NOTICE 'ℹ Total RLS policies created: %', policy_count;

  IF policy_count < 50 THEN
    RAISE WARNING '✗ Expected at least 50 policies, found %', policy_count;
  END IF;
END $$;

-- =============================================
-- 7. SEED DATA VERIFICATION
-- =============================================

DO $$
DECLARE
  domain_count INTEGER;
  sop_count INTEGER;
  sop_validated INTEGER;
  sop_progress INTEGER;
  sop_planned INTEGER;
  indicator_count INTEGER;
  equipment_count INTEGER;
BEGIN
  -- Domains
  SELECT COUNT(*) INTO domain_count FROM domains;
  IF domain_count = 16 THEN
    RAISE NOTICE '✓ 16 domains seeded';
  ELSE
    RAISE WARNING '✗ Expected 16 domains, found %', domain_count;
  END IF;

  -- SOPs
  SELECT COUNT(*) INTO sop_count FROM sops;
  SELECT COUNT(*) INTO sop_validated FROM sops WHERE status = 'Validé';
  SELECT COUNT(*) INTO sop_progress FROM sops WHERE status = 'En cours';
  SELECT COUNT(*) INTO sop_planned FROM sops WHERE status = 'Planifié';

  IF sop_count = 90 THEN
    RAISE NOTICE '✓ 90 SOPs seeded (Validé: %, En cours: %, Planifié: %)',
      sop_validated, sop_progress, sop_planned;
  ELSE
    RAISE WARNING '✗ Expected 90 SOPs, found %', sop_count;
  END IF;

  IF sop_validated != 18 OR sop_progress != 33 OR sop_planned != 39 THEN
    RAISE WARNING '✗ SOP breakdown incorrect. Expected 18/33/39, got %/%/%',
      sop_validated, sop_progress, sop_planned;
  END IF;

  -- Indicators
  SELECT COUNT(*) INTO indicator_count FROM indicators;
  IF indicator_count = 8 THEN
    RAISE NOTICE '✓ 8 indicators seeded';
  ELSE
    RAISE WARNING '✗ Expected 8 indicators, found %', indicator_count;
  END IF;

  -- Equipment
  SELECT COUNT(*) INTO equipment_count FROM equipment;
  IF equipment_count = 17 THEN
    RAISE NOTICE '✓ 17 equipment items seeded';
  ELSE
    RAISE WARNING '✗ Expected 17 equipment items, found %', equipment_count;
  END IF;
END $$;

-- =============================================
-- 8. INDEXES VERIFICATION
-- =============================================

DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';

  RAISE NOTICE 'ℹ Custom indexes created: %', index_count;

  IF index_count < 18 THEN
    RAISE WARNING '✗ Expected at least 18 custom indexes, found %', index_count;
  ELSE
    RAISE NOTICE '✓ Sufficient indexes created';
  END IF;
END $$;

-- =============================================
-- 9. FOREIGN KEYS VERIFICATION
-- =============================================

DO $$
DECLARE
  fk_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints
  WHERE constraint_schema = 'public'
  AND constraint_type = 'FOREIGN KEY';

  RAISE NOTICE 'ℹ Foreign key constraints: %', fk_count;

  IF fk_count < 20 THEN
    RAISE WARNING '✗ Expected at least 20 FK constraints, found %', fk_count;
  ELSE
    RAISE NOTICE '✓ Foreign keys properly defined';
  END IF;
END $$;

-- =============================================
-- 10. FUNCTIONS VERIFICATION
-- =============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'update_updated_at_column'
  ) THEN
    RAISE NOTICE '✓ update_updated_at_column() function exists';
  ELSE
    RAISE WARNING '✗ update_updated_at_column() function missing';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'calculate_risk_level'
  ) THEN
    RAISE NOTICE '✓ calculate_risk_level() function exists';
  ELSE
    RAISE WARNING '✗ calculate_risk_level() function missing';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'get_user_role'
  ) THEN
    RAISE NOTICE '✓ get_user_role() function exists';
  ELSE
    RAISE WARNING '✗ get_user_role() function missing';
  END IF;
END $$;

-- =============================================
-- FINAL SUMMARY
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE 'SCHEMA VERIFICATION COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE 'Review the output above for any warnings (✗)';
  RAISE NOTICE 'All checks passed should show (✓)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create first PRAQ user in Supabase Dashboard';
  RAISE NOTICE '2. Set user_metadata.role = "praq"';
  RAISE NOTICE '3. Test authentication and queries';
  RAISE NOTICE '4. Generate TypeScript types if needed';
  RAISE NOTICE '═══════════════════════════════════════════════════';
END $$;
