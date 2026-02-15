"use client";

import { useEffect, useState } from 'react';
import { useSupabase } from '@/app/providers';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtime<T = any>(
  tableName: string,
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData);
  const supabase = useSupabase();

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtime = () => {
      channel = supabase
        .channel(`${tableName}_changes`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: tableName,
          },
          (payload) => {
            setData((current) => [payload.new as T, ...current]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: tableName,
          },
          (payload) => {
            setData((current) =>
              current.map((item: any) =>
                item.id === (payload.new as any).id ? (payload.new as T) : item
              )
            );
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: tableName,
          },
          (payload) => {
            setData((current) =>
              current.filter((item: any) => item.id !== (payload.old as any).id)
            );
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [tableName]);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return data;
}
