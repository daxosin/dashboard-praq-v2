"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSupabase } from '@/app/providers';

interface UseSupabaseCrudOptions {
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, any>;
}

export function useSupabaseCrud<T = any>(
  tableName: string,
  options: UseSupabaseCrudOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = useSupabase();
  const filtersKey = useMemo(() => JSON.stringify(options.filters), [options.filters]);
  const orderByKey = useMemo(() => JSON.stringify(options.orderBy), [options.orderBy]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(tableName).select(options.select || '*');

      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      const { data: result, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setData((result as T[]) || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [tableName, options.select, filtersKey, orderByKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const create = async (newData: Partial<T>) => {
    const previousData = [...data];
    try {
      const { data: result, error: createError } = await supabase
        .from(tableName)
        .insert(newData)
        .select()
        .single();

      if (createError) throw createError;

      setData([result as T, ...data]);
      return result;
    } catch (err) {
      setData(previousData);
      throw err;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    const previousData = [...data];
    try {
      const optimisticData = data.map((item: any) =>
        item.id === id ? { ...item, ...updates } : item
      );
      setData(optimisticData as T[]);

      const { data: result, error: updateError } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      return result;
    } catch (err) {
      setData(previousData);
      throw err;
    }
  };

  const remove = async (id: string) => {
    const previousData = [...data];
    try {
      const optimisticData = data.filter((item: any) => item.id !== id);
      setData(optimisticData);

      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    } catch (err) {
      setData(previousData);
      throw err;
    }
  };

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
    refresh,
  };
}
