"use client";

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext, useTheme } from '@/app/providers';
import { useSmqScore } from '@/lib/hooks/useSmqScore';
import { useAlerts } from '@/lib/hooks/useAlerts';
import { useExportImport } from '@/lib/hooks/useExportImport';
import { TABS } from '@/lib/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const { score } = useSmqScore();
  const { alerts } = useAlerts();
  const { exportAll, importAll, importing } = useExportImport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="muted">Chargement...</div>
      </div>
    );
  }

  if (!user) return null;

  const criticalAlerts = alerts.filter(a => a.severity === 'error').length;

  const handleExport = async () => {
    try {
      await exportAll();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importAll(file);
      alert('Import terminé avec succès');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Erreur lors de l\'import');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ height: '100vh', backgroundColor: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header style={{
        backgroundColor: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 24px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <div className="tag" style={{ color: 'var(--accent)', marginBottom: '4px' }}>
                DASHBOARD PRAQ
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 700 }}>
                Pharm<span style={{ color: 'var(--accent)' }}>a</span>78
              </h1>
            </div>

            <div style={{
              width: '60px',
              height: '60px',
              position: 'relative',
              marginLeft: '16px',
            }}>
              <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="8"
                  strokeDasharray={`${(score.total / 100) * 283} 283`}
                  strokeLinecap="round"
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--accent)',
              }}>
                {score.total}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {criticalAlerts > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--signal-error)',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {criticalAlerts}
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              style={{
                padding: '8px 12px',
                backgroundColor: 'var(--elevation)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {theme === 'dark' ? 'Jour' : 'Nuit'}
            </button>

            <button
              onClick={handleExport}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--accent)',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Export JSON
            </button>

            <button
              onClick={handleImportClick}
              disabled={importing}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--elevation)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: importing ? 'not-allowed' : 'pointer',
                opacity: importing ? 0.6 : 1,
              }}
            >
              {importing ? 'Import...' : 'Import JSON'}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </header>

      <div style={{
        backgroundColor: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        overflowX: 'auto',
        padding: '0 24px',
      }}>
        <div style={{
          display: 'flex',
          gap: '32px',
        }}>
          {TABS.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link
                key={tab.number}
                href={tab.path}
                style={{
                  padding: '16px 0',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      <main style={{ padding: '24px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}
