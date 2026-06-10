"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, UploadIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase";
// Flux terrain hérité — repose sur des tables absentes en prod (`domains`,
// `staff_pins`, bucket `photos`) : décision de refonte en attente (CLAUDE.md TODOs).
type Domain = { id: string; name: string };

const EVENT_TYPES = [
  { value: "Non-conformité", label: "Non-conformité", color: "var(--red)" },
  { value: "Anomalie", label: "Anomalie", color: "var(--amber)" },
  { value: "Near miss", label: "Near miss", color: "var(--accent)" },
];

const ZONES = [
  "PDA Robot 1",
  "PDA Robot 2",
  "Contrôle qualité",
  "Conditionnement",
  "Stock chambre froide",
  "Stock ambiant",
  "Stock stupéfiants",
  "Officine comptoir",
  "Officine back-office",
  "Orthopédie",
  "Luxe L'Écrin",
  "Nature",
  "Livraison véhicule 1",
  "Livraison véhicule 2",
  "Livraison véhicule 3",
  "Cabine téléconsultation",
  "Locaux techniques",
  "Salle pause",
];

const SEVERITIES = [
  { value: "Faible", label: "Faible", color: "var(--grn)" },
  { value: "Moyenne", label: "Moyenne", color: "var(--amber)" },
  { value: "Élevée", label: "Élevée", color: "var(--red)" },
];

type StaffAuth = {
  id: string;
  name: string;
  role: string;
};

export default function DeclareFormPage() {
  const router = useRouter();
  const [staffAuth, setStaffAuth] = useState<StaffAuth | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [eventType, setEventType] = useState<string>("");
  const [domainId, setDomainId] = useState<string>("");
  const [zone, setZone] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState<string>("");
  const [severity, setSeverity] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("staff_auth="))
      ?.split("=")[1];

    if (cookieValue) {
      try {
        const auth = JSON.parse(decodeURIComponent(cookieValue));
        setStaffAuth(auth);
      } catch (e) {
        router.push("/declare");
      }
    } else {
      router.push("/declare");
    }
  }, [router]);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data) {
      setDomains(data);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"];
      if (!allowedTypes.includes(file.type)) {
        alert("Type de fichier non autorisé. Formats acceptés : JPEG, PNG, WebP, HEIC");
        e.target.value = "";
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("Fichier trop volumineux. Taille maximum : 10 MB");
        e.target.value = "";
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !staffAuth) return null;

    const supabase = createClient();
    const fileExt = photoFile.name.split(".").pop();
    const fileName = `${staffAuth.id}-${Date.now()}.${fileExt}`;
    const filePath = `terrain-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(filePath, photoFile);

    if (uploadError) {
      // Don't log sensitive upload errors to console
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("photos").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staffAuth || !eventType || !domainId || !zone || description.length < 10) {
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl: string | null = null;
      if (photoFile) {
        photoUrl = await uploadPhoto();
      }

      // Use secure API endpoint with server-side validation
      const response = await fetch("/api/terrain-capa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          domainId,
          zone,
          description,
          severity,
          staffId: staffAuth.id,
          photoUrl,
          date,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Erreur lors de l'enregistrement");
        return;
      }

      setIsSubmitted(true);
    } catch (err) {
      alert("Erreur lors de l'envoi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = eventType && domainId && zone && description.length >= 10;

  if (!staffAuth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-theme="dark"
        style={{ background: "var(--bg)", color: "var(--text)" }}
      >
        <p>Chargement...</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        data-theme="dark"
        style={{
          background: "var(--bg)",
          color: "var(--text)",
          fontFamily: "Montserrat, sans-serif",
        }}
      >
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--grn)" }}
          >
            <CheckIcon size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Déclaration enregistrée</h2>
          <p className="text-lg mb-8" style={{ color: "var(--sec)" }}>
            Votre signalement a été transmis au PRAQ
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEventType("");
                setDomainId("");
                setZone("");
                setDescription("");
                setSeverity("");
                setPhotoFile(null);
                setPhotoPreview("");
                setDate(new Date().toISOString().split("T")[0]);
              }}
              className="py-4 px-6 rounded-lg font-bold text-base transition-all duration-150 active:scale-95"
              style={{
                backgroundColor: "var(--accent)",
                color: "#000",
              }}
            >
              Nouvelle déclaration
            </button>
            <button
              onClick={() => router.push("/declare")}
              className="py-4 px-6 rounded-lg font-semibold text-base transition-all duration-150 active:scale-95"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--brd)",
                color: "var(--text)",
              }}
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-24"
      data-theme="dark"
      style={{
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      <header className="py-6 px-6 border-b sticky top-0 z-10" style={{ borderColor: "var(--brd)", backgroundColor: "var(--bg)" }}>
        <h1 className="text-center text-2xl font-bold tracking-tight">
          Pharma<span style={{ color: "var(--accent)" }}>7</span>8
        </h1>
        <p className="text-center text-sm mt-1" style={{ color: "var(--mut)" }}>
          Déclaration terrain
        </p>
      </header>

      <main className="px-6 py-8">
        <div className="w-full max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--sec)" }}>
                Type d'événement
              </label>
              <div className="grid grid-cols-1 gap-3">
                {EVENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setEventType(type.value)}
                    className="h-12 rounded-lg font-bold text-base transition-all duration-150 active:scale-95"
                    style={{
                      backgroundColor: eventType === type.value ? type.color : "var(--card)",
                      border: `2px solid ${eventType === type.value ? type.color : "var(--brd)"}`,
                      color: eventType === type.value ? "#fff" : "var(--text)",
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--sec)" }}>
                Domaine
              </label>
              <select
                value={domainId}
                onChange={(e) => setDomainId(e.target.value)}
                className="w-full h-12 px-4 rounded-lg text-base"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--brd)",
                  color: "var(--text)",
                }}
              >
                <option value="">Sélectionnez un domaine</option>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--sec)" }}>
                Zone
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full h-12 px-4 rounded-lg text-base"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--brd)",
                  color: "var(--text)",
                }}
              >
                <option value="">Sélectionnez une zone</option>
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--sec)" }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 px-4 rounded-lg text-base"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--brd)",
                  color: "var(--text)",
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--sec)" }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez l'événement (10 caractères min.)"
                rows={5}
                className="w-full px-4 py-3 rounded-lg text-base resize-none"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--brd)",
                  color: "var(--text)",
                }}
              />
              <p className="text-xs mt-1" style={{ color: description.length >= 10 ? "var(--grn)" : "var(--mut)" }}>
                {description.length} / 10 caractères minimum
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--sec)" }}>
                Gravité ressentie (optionnel)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {SEVERITIES.map((sev) => (
                  <button
                    key={sev.value}
                    type="button"
                    onClick={() => setSeverity(severity === sev.value ? "" : sev.value)}
                    className="h-12 rounded-lg font-semibold text-sm transition-all duration-150 active:scale-95"
                    style={{
                      backgroundColor: severity === sev.value ? sev.color : "var(--card)",
                      border: `2px solid ${severity === sev.value ? sev.color : "var(--brd)"}`,
                      color: severity === sev.value ? "#fff" : "var(--text)",
                    }}
                  >
                    {sev.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--sec)" }}>
                Photo (optionnel)
              </label>
              <div>
                <label
                  className="flex items-center justify-center gap-2 h-12 rounded-lg font-semibold text-base cursor-pointer transition-all duration-150"
                  style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--brd)",
                    color: "var(--text)",
                  }}
                >
                  <UploadIcon size={18} />
                  {photoFile ? photoFile.name : "Choisir une photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {photoPreview && (
                  <div className="mt-3">
                    <img
                      src={photoPreview}
                      alt="Aperçu"
                      className="w-full h-48 object-cover rounded-lg"
                      style={{ border: "1px solid var(--brd)" }}
                    />
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>

      <div
        className="fixed bottom-0 left-0 right-0 p-6 border-t"
        style={{
          backgroundColor: "var(--bg)",
          borderColor: "var(--brd)",
        }}
      >
        <div className="w-full max-w-md mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full py-4 rounded-lg font-bold text-base transition-all duration-150 active:scale-95"
            style={{
              backgroundColor: isFormValid ? "var(--accent)" : "var(--brd)",
              color: isFormValid ? "#000" : "var(--mut)",
              opacity: isFormValid ? 1 : 0.6,
              cursor: isFormValid ? "pointer" : "not-allowed",
            }}
          >
            {isSubmitting ? "Envoi en cours..." : "Envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
}
