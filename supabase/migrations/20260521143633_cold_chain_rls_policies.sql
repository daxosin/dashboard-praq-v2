CREATE POLICY cold_chain_monthly_sync_read
  ON public.cold_chain_monthly_sync
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY cold_chain_monthly_sync_insert
  ON public.cold_chain_monthly_sync
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY cold_chain_monthly_sync_update
  ON public.cold_chain_monthly_sync
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY cold_chain_monthly_sync_delete_blocked
  ON public.cold_chain_monthly_sync
  FOR DELETE TO authenticated
  USING (false);

CREATE POLICY cold_chain_anomalies_read
  ON public.cold_chain_anomalies
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY cold_chain_anomalies_insert
  ON public.cold_chain_anomalies
  FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY cold_chain_anomalies_update
  ON public.cold_chain_anomalies
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY cold_chain_anomalies_delete_blocked
  ON public.cold_chain_anomalies
  FOR DELETE TO authenticated
  USING (false);
