export interface TabConfig {
  number: number;
  name: string;
  icon: string;
  path: string;
  description: string;
}

export interface Alert {
  id: string;
  type: string;
  severity: 'error' | 'warn' | 'ok';
  message: string;
  source_table: string;
  source_id: string;
  created_at: string;
}

export interface SmqScore {
  total: number;
  sops: number;
  capa: number;
  habilitations: number;
  equipements: number;
  audits: number;
  reclamations: number;
  risques: number;
}

export interface TerrainForm {
  type_evenement: 'NC' | 'Anomalie' | 'Near miss';
  domain_id: string;
  zone: string;
  date: string;
  description: string;
  gravite?: 'Faible' | 'Moyenne' | 'Élevée';
  photo_url?: string;
}

export const TABS: TabConfig[] = [
  { number: 1, name: 'Tableau de bord', icon: 'grid', path: '/dashboard/tableau-de-bord', description: 'Score SMQ, alertes, KPI' },
  { number: 2, name: 'Documents & SOPs', icon: 'doc', path: '/dashboard/documents', description: 'SOPs, cycle de vie' },
  { number: 3, name: 'CAPA & NC', icon: 'zap', path: '/dashboard/capa', description: 'Registre CAPA' },
  { number: 4, name: 'Audits', icon: 'search', path: '/dashboard/audits', description: 'Programme audits' },
  { number: 5, name: 'Risques', icon: 'triangle', path: '/dashboard/risques', description: 'Matrice AMDEC' },
  { number: 6, name: 'Vigilances', icon: 'shield', path: '/dashboard/vigilances', description: 'Signalements' },
  { number: 7, name: 'Formations', icon: 'users', path: '/dashboard/formations', description: 'Habilitations' },
  { number: 8, name: 'Équipements', icon: 'tool', path: '/dashboard/equipements', description: 'Maintenance' },
  { number: 9, name: 'Fournisseurs', icon: 'truck', path: '/dashboard/fournisseurs', description: 'Évaluations' },
  { number: 10, name: 'Réclamations', icon: 'msg', path: '/dashboard/reclamations', description: 'Satisfaction' },
  { number: 11, name: 'Indicateurs', icon: 'bar-chart', path: '/dashboard/indicateurs', description: 'Tendances' },
  { number: 12, name: 'Revue de direction', icon: 'clipboard', path: '/dashboard/revue-direction', description: 'Décisions §9.3' },
  { number: 13, name: 'Administration', icon: 'settings', path: '/dashboard/administration', description: 'Utilisateurs, responsables' },
];
