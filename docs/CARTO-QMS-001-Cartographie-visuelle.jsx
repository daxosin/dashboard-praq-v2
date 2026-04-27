import { useState } from "react";

const processes = {
  management: {
    label: "PROCESSUS DE MANAGEMENT",
    color: "#1B4D5C",
    items: [
      { code: "M1", name: "Politique qualité et revue de direction", pilot: "Direction / PRAQ", desc: "Définir la politique qualité, fixer les objectifs, conduire les revues de direction" },
      { code: "M2", name: "Pilotage stratégique", pilot: "Direction", desc: "Stratégie commerciale et développement, arbitrage inter-pôles" },
      { code: "M3", name: "Gestion documentaire SMQ", pilot: "PRAQ", desc: "Maîtriser la documentation qualité (création, révision, diffusion, archivage)" },
      { code: "M4", name: "Communication", pilot: "Direction / PRAQ", desc: "Communication qualité interne et relations institutionnelles" },
    ]
  },
  realisation: {
    label: "PROCESSUS DE RÉALISATION",
    color: "#2E7D5A",
    items: [
      { code: "R1", name: "Dispensation officinale B2C", pilot: "Pharm. réf. B2C", desc: "Tous univers : comptoir, orthopédie, compression, dermo-cosmétique, phyto… SOP dédiées par univers" },
      { code: "R2", name: "PDA robotisée B2B", pilot: "Pharm. réf. PDA / PRAQ", desc: "Prescriptions EHPAD → validation → robot Mekapharm → contrôle → livraison" },
      { code: "R3", name: "Dispositifs médicaux et MAD", pilot: "Tech. MAD réf.", desc: "DM (location, vente), livraison domicile, SAV, accompagnement patient" },
      { code: "R4", name: "Conseil et accompagnement", pilot: "Pharm. réf. ETP", desc: "Entretiens pharmaceutiques, vaccination, dépistage, ETP, pathologies chroniques" },
    ]
  },
  support: {
    label: "PROCESSUS DE SUPPORT",
    color: "#2A6478",
    items: [
      { code: "S1", name: "Achats et approvisionnements", pilot: "Resp. achats", desc: "Sélection fournisseurs, commandes, négociations" },
      { code: "S2", name: "Stock et logistique", pilot: "Resp. logistique", desc: "Réception, stockage, flux, inventaires, DLU, périmés" },
      { code: "S3", name: "RH et compétences", pilot: "Direction / RH", desc: "Recrutement, intégration, formation, habilitation, plannings" },
      { code: "S4", name: "Système d'information", pilot: "RSI / PRAQ", desc: "LGO, interfaces robot/SI, cybersécurité, sauvegardes" },
      { code: "S5", name: "Sécurité et hygiène", pilot: "Resp. sécurité / PRAQ", desc: "Sécurité personnes, hygiène locaux, DASRI, PCA" },
      { code: "S6", name: "Infrastructure et maintenance", pilot: "Resp. technique", desc: "Robot Mekapharm, froid, automates, locaux, calibrations" },
    ]
  },
  amelioration: {
    label: "MESURE, ANALYSE ET AMÉLIORATION",
    color: "#C4A35A",
    items: [
      { code: "A1", name: "Audits internes", pilot: "Resp. Qualité / PRAQ", desc: "Planification et réalisation des audits du SMQ" },
      { code: "A2", name: "NC et CAPA", pilot: "Resp. Qualité", desc: "Détection, analyse, actions correctives et préventives" },
      { code: "A3", name: "Mesure de satisfaction", pilot: "PRAQ / Direction", desc: "Enquêtes patients B2C, EHPAD B2B, collaborateurs" },
      { code: "A4", name: "Analyse KPI", pilot: "Resp. Qualité", desc: "Consolidation et analyse des indicateurs de performance" },
      { code: "A5", name: "Amélioration continue", pilot: "PRAQ / Direction", desc: "Opportunités, projets transversaux, retours d'expérience" },
    ]
  }
};

const interfaces = [
  { from: "R2", to: "S4", label: "Intégration LGO/Robot", criticality: "Élevée" },
  { from: "R2", to: "S2", label: "Approvisionnement PDA", criticality: "Élevée" },
  { from: "S3", to: "Tous", label: "Compétences/Habilitations", criticality: "Élevée" },
  { from: "A2", to: "Tous", label: "Circuit NC/CAPA", criticality: "Moyenne" },
  { from: "S5", to: "R2", label: "Hygiène zone PDA", criticality: "Moyenne" },
  { from: "M1", to: "A4", label: "Revue direction ↔ KPI", criticality: "Structurante" },
];

function ProcessCard({ item, isSelected, onClick, color }) {
  return (
    <button onClick={onClick} className="text-left w-full transition-all duration-200" style={{
      background: isSelected ? color : "#FFFFFF", color: isSelected ? "#FFFFFF" : "#1A1A1A",
      border: `1px solid ${isSelected ? color : "#E5E7EB"}`, borderRadius: "6px", padding: "12px 14px",
      boxShadow: isSelected ? `0 4px 12px ${color}33` : "0 1px 3px rgba(0,0,0,0.04)", cursor: "pointer", minHeight: "70px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
        <span style={{ background: isSelected ? "rgba(255,255,255,0.2)" : `${color}15`, color: isSelected ? "#FFFFFF" : color, padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" }}>{item.code}</span>
        <span style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.3 }}>{item.name}</span>
      </div>
      {isSelected && (<div style={{ fontSize: "11px", opacity: 0.9, marginTop: "6px", lineHeight: 1.4 }}><div style={{ marginBottom: "2px" }}>{item.desc}</div><div style={{ fontStyle: "italic", opacity: 0.8 }}>Pilote : {item.pilot}</div></div>)}
    </button>
  );
}

function ProcessBand({ family, data, selected, onSelect }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ background: `linear-gradient(90deg, ${data.color}, ${data.color}CC)`, color: "#FFFFFF", padding: "8px 16px", borderRadius: "6px 6px 0 0", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>{data.label}</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(data.items.length, 3)}, 1fr)`, gap: "8px", padding: "10px", background: "#F5F7F9", borderRadius: "0 0 6px 6px", border: "1px solid #E5E7EB", borderTop: "none" }}>
        {data.items.map(item => (<ProcessCard key={item.code} item={item} color={data.color} isSelected={selected === item.code} onClick={() => onSelect(selected === item.code ? null : item.code)} />))}
      </div>
    </div>
  );
}

export default function CartographiePharma78Pure() {
  const [selected, setSelected] = useState(null);
  const [showInterfaces, setShowInterfaces] = useState(false);
  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#FAFBFC", minHeight: "100vh", padding: "24px" }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, #1B4D5C, #3D8B8B)", position: "fixed", top: 0, left: 0, right: 0, zIndex: 10 }} />
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", color: "#3D8B8B", marginBottom: "6px" }}>CARTO-QMS-001 • GOUVERNANCE QUALITÉ</div>
          <h1 style={{ fontSize: "28px", fontWeight: 600, color: "#1B4D5C", margin: "0 0 6px 0" }}>Cartographie des processus</h1>
          <div style={{ width: "48px", height: "3px", background: "#C4A35A", margin: "0 auto 8px auto" }} />
          <div style={{ fontSize: "13px", color: "#5A6570" }}>Pharma78Pure — H8Pharma • 19 processus identifiés • ISO 9001:2015 + PDCA</div>
        </div>
        <div style={{ background: "linear-gradient(90deg, #3D8B8B, #2A6478)", color: "#FFFFFF", textAlign: "center", padding: "8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", marginBottom: "16px" }}>▼ EXIGENCES : Patients • EHPAD • Réglementation (CSP, BPP, ISO 9001)</div>
        {Object.entries(processes).map(([key, data]) => (<ProcessBand key={key} family={key} data={data} selected={selected} onSelect={setSelected} />))}
        <div style={{ background: "linear-gradient(90deg, #2A6478, #3D8B8B)", color: "#FFFFFF", textAlign: "center", padding: "8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", marginTop: "16px", marginBottom: "20px" }}>▲ SATISFACTION : Patients • EHPAD • Conformité réglementaire</div>
        <button onClick={() => setShowInterfaces(!showInterfaces)} style={{ background: showInterfaces ? "#1B4D5C" : "#FFFFFF", color: showInterfaces ? "#FFFFFF" : "#1B4D5C", border: "1px solid #1B4D5C", borderRadius: "6px", padding: "10px 20px", cursor: "pointer", fontWeight: 600, fontSize: "13px", width: "100%", marginBottom: "16px" }}>{showInterfaces ? "▲ Masquer les interfaces critiques" : "▼ Afficher les interfaces critiques"}</button>
        {showInterfaces && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "6px", overflow: "hidden", marginBottom: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px 80px 1fr 100px", fontSize: "11px", fontWeight: 700, color: "#FFFFFF", background: "#1B4D5C", padding: "8px 12px" }}><span>De</span><span>Vers</span><span>Description</span><span>Criticité</span></div>
            {interfaces.map((intf, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 80px 1fr 100px", padding: "8px 12px", fontSize: "12px", background: i % 2 === 0 ? "#F5F7F9" : "#FFFFFF", borderBottom: "1px solid #E5E7EB", alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: "#1B4D5C" }}>{intf.from}</span>
                <span style={{ fontWeight: 700, color: "#1B4D5C" }}>{intf.to}</span>
                <span style={{ color: "#5A6570" }}>{intf.label}</span>
                <span style={{ fontSize: "10px", fontWeight: 600, color: intf.criticality === "Élevée" ? "#C0392B" : intf.criticality === "Structurante" ? "#1B4D5C" : "#C4A35A", background: intf.criticality === "Élevée" ? "#FDEDEC" : intf.criticality === "Structurante" ? "#E8F0F3" : "#FEF9E7", padding: "2px 8px", borderRadius: "10px", textAlign: "center" }}>{intf.criticality}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "16px" }}>
          {[{ phase: "PLAN", desc: "Identifier, objectiver, planifier", color: "#1B4D5C" }, { phase: "DO", desc: "Mettre en œuvre les processus", color: "#2E7D5A" }, { phase: "CHECK", desc: "Surveiller, mesurer, évaluer", color: "#C4A35A" }, { phase: "ACT", desc: "Améliorer, corriger, capitaliser", color: "#2A6478" }].map(p => (
            <div key={p.phase} style={{ background: "#FFFFFF", border: `2px solid ${p.color}`, borderRadius: "6px", padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: p.color }}>{p.phase}</div>
              <div style={{ fontSize: "10px", color: "#5A6570", marginTop: "4px" }}>{p.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: "11px", color: "#5A6570", paddingTop: "8px", borderTop: "1px solid #E5E7EB" }}>Pharma78Pure — H8Pharma • CARTO-QMS-001 v0.1 • 24/02/2026 • Cliquer sur un processus pour détails</div>
      </div>
    </div>
  );
}
