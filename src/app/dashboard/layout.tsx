"use client";

import { useEffect, useRef, useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

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
  const currentTab = TABS.find(t => t.path === pathname) || TABS[0];

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
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--card)',
        borderBottom: '1px solid var(--brd)',
        padding: '12px 24px',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          {/* Left: Logo + Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1 }}>
                Pharm<span style={{ color: 'var(--accent)' }}>a</span>78
              </h1>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.8px', color: 'var(--accent)', textTransform: 'uppercase' as const, marginTop: '2px' }}>
                DASHBOARD PRAQ
              </div>
            </div>

            <div style={{
              width: '48px',
              height: '48px',
              position: 'relative',
            }}>
              <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--brd)" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="8" strokeDasharray={`${(score.total / 100) * 283} 283`} strokeLinecap="round" />
              </svg>
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                fontSize: '15px', fontWeight: 700, color: 'var(--accent)',
              }}>
                {score.total}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {criticalAlerts > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '8px',
                backgroundColor: 'rgba(255,68,68,0.12)', color: 'var(--red)',
                fontSize: '12px', fontWeight: 600,
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--red)', display: 'inline-block' }} />
                {criticalAlerts} alerte{criticalAlerts > 1 ? 's' : ''}
              </div>
            )}

            <button onClick={toggleTheme} style={{
              padding: '8px 14px', backgroundColor: 'var(--elev)', border: '1px solid var(--brd)',
              borderRadius: '8px', color: 'var(--text)', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
            }}>
              {theme === 'dark' ? '☀ Jour' : '☾ Nuit'}
            </button>

            <button onClick={handleExport} style={{
              padding: '8px 16px', backgroundColor: 'var(--accent)', color: '#000',
              border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
              Export
            </button>

            <button onClick={handleImportClick} disabled={importing} style={{
              padding: '8px 16px', backgroundColor: 'var(--elev)', border: '1px solid var(--brd)',
              borderRadius: '8px', color: 'var(--text)', fontSize: '13px', fontWeight: 500,
              cursor: importing ? 'not-allowed' : 'pointer', opacity: importing ? 0.6 : 1,
            }}>
              {importing ? 'Import...' : 'Import'}
            </button>

            <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileChange} style={{ display: 'none' }} />
          </div>
        </div>
      </header>

      {/* Tab Navigation - Dropdown style */}
      <div style={{
        backgroundColor: 'var(--card)',
        borderBottom: '1px solid var(--brd)',
        padding: '0 24px',
        position: 'relative',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Current tab dropdown */}
          <div style={{ position: 'relative', flex: 1 }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '14px 0', border: 'none', backgroundColor: 'transparent',
                cursor: 'pointer', width: '100%',
              }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '28px', height: '28px', borderRadius: '8px',
                backgroundColor: 'var(--accent-dim)', color: 'var(--accent)',
                fontSize: '13px', fontWeight: 700,
              }}>
                {currentTab.number}
              </span>
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>
                {currentTab.name}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--mut)', marginLeft: '4px' }}>
                — {currentTab.description}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mut)" strokeWidth="2" style={{ marginLeft: 'auto', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 40,
                backgroundColor: 'var(--card)', border: '1px solid var(--brd)',
                borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                padding: '8px', maxHeight: '70vh', overflowY: 'auto',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                  {TABS.map((tab) => {
                    const isActive = pathname === tab.path;
                    return (
                      <Link
                        key={tab.number}
                        href={tab.path}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 14px', borderRadius: '8px',
                          backgroundColor: isActive ? 'var(--accent-dim)' : 'transparent',
                          textDecoration: 'none', transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--elev)'; }}
                        onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                      >
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                          backgroundColor: isActive ? 'var(--accent)' : 'var(--elev)',
                          color: isActive ? '#000' : 'var(--mut)',
                          fontSize: '13px', fontWeight: 700,
                        }}>
                          {tab.number}
                        </span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: isActive ? 'var(--accent)' : 'var(--text)' }}>
                            {tab.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--mut)', marginTop: '1px' }}>
                            {tab.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 30 }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main style={{ padding: '24px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}
