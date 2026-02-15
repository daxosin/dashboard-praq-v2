"use client";

import { useState } from 'react';
import { useSupabase } from '@/app/providers';
import { exportAllData, exportTabData, importData } from '@/lib/export-import';

export type ImportResults = Record<string, { success: number; errors: number }>;

export function useExportImport() {
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const supabase = useSupabase();

  const exportAll = async () => {
    try {
      await exportAllData(supabase);
    } catch (error) {
      console.error('Error exporting all data:', error);
      throw error;
    }
  };

  const exportTab = (tableName: string, data: any[]) => {
    try {
      exportTabData(tableName, data);
    } catch (error) {
      console.error('Error exporting tab data:', error);
      throw error;
    }
  };

  const importAll = async (file: File) => {
    setImporting(true);
    setImportResults(null);

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      const results = await importData(supabase, jsonData);
      setImportResults(results);

      return results;
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    } finally {
      setImporting(false);
    }
  };

  return {
    exportAll,
    exportTab,
    importAll,
    importing,
    importResults,
  };
}
