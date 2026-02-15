"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@/components/icons";
import { Badge } from "@/components/ui";
import { createClient } from "@/lib/supabase";
type RecentDeclaration = {
  id: string;
  created_at: string;
  type: string | null;
  domain_id: string | null;
  status: string | null;
  terrain_zone: string | null;
};

const PIN_LENGTH = 4;
const MAX_ATTEMPTS = 5;

export default function DeclarePage() {
  const router = useRouter();
  const [pin, setPin] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [authenticatedStaff, setAuthenticatedStaff] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);
  const [recentDeclarations, setRecentDeclarations] = useState<RecentDeclaration[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (authenticatedStaff) {
      fetchRecentDeclarations(authenticatedStaff.id);
    }
  }, [authenticatedStaff]);

  const fetchRecentDeclarations = async (staffId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("capas")
      .select("id, created_at, type, domain_id, status, terrain_zone")
      .eq("created_by", staffId)
      .eq("source", "Terrain")
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setRecentDeclarations(data);
    }
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < PIN_LENGTH) {
      const newPin = [...pin, num];
      setPin(newPin);

      if (newPin.length === PIN_LENGTH) {
        verifyPin(newPin.join(""));
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  };

  const verifyPin = async (pinCode: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinCode }),
      });

      const data = await response.json();

      if (data.success && data.staff) {
        setShowSuccess(true);
        setAuthenticatedStaff(data.staff);

        // Set secure cookie with SameSite protection
        const staffCookie = {
          id: data.staff.id,
          name: data.staff.name,
          role: data.staff.role,
        };
        const cookieValue = encodeURIComponent(JSON.stringify(staffCookie));
        const isSecure = window.location.protocol === "https:" ? "Secure;" : "";
        document.cookie = `staff_auth=${cookieValue}; path=/; max-age=3600; SameSite=Strict; ${isSecure}`;

        setTimeout(() => {
          router.push("/declare/form");
        }, 1500);
      } else if (data.locked) {
        setError("Compte bloqué. Contactez le PRAQ.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setPin([]);
      } else {
        setError(data.message || "PIN incorrect");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setPin([]);
      }
    } catch (err) {
      setError("Erreur de connexion");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess && authenticatedStaff) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-theme="dark"
        style={{
          background: "var(--bg)",
          color: "var(--text)",
        }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <CheckIcon size={32} className="text-black" />
          </div>
          <h2 className="text-2xl font-bold">Bonjour {authenticatedStaff.name.split(" ")[0]}</h2>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      data-theme="dark"
      style={{
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      <header className="py-6 px-6 border-b" style={{ borderColor: "var(--brd)" }}>
        <h1 className="text-center text-3xl font-bold tracking-tight">
          Pharma<span style={{ color: "var(--accent)" }}>7</span>8
        </h1>
        <p className="text-center text-sm mt-1" style={{ color: "var(--mut)" }}>
          Déclaration terrain
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${shake ? "animate-shake" : ""}`}
                  style={{
                    backgroundColor: pin.length > i ? "var(--accent)" : "var(--brd)",
                  }}
                />
              ))}
            </div>

            {error && (
              <p
                className="text-center text-sm font-semibold mb-4"
                style={{ color: "var(--red)" }}
              >
                {error}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={isLoading}
                className="h-16 rounded-lg font-bold text-2xl transition-all duration-150 active:scale-95"
                style={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--brd)",
                  color: "var(--text)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--elev)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--card)";
                }}
              >
                {num}
              </button>
            ))}

            <div />

            <button
              onClick={() => handleNumberClick("0")}
              disabled={isLoading}
              className="h-16 rounded-lg font-bold text-2xl transition-all duration-150 active:scale-95"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--brd)",
                color: "var(--text)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--elev)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--card)";
              }}
            >
              0
            </button>

            <button
              onClick={handleDelete}
              disabled={isLoading || pin.length === 0}
              className="h-16 rounded-lg font-semibold text-base transition-all duration-150 active:scale-95"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--brd)",
                color: "var(--text)",
                opacity: pin.length === 0 ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (pin.length > 0) {
                  e.currentTarget.style.backgroundColor = "var(--elev)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--card)";
              }}
            >
              Suppr.
            </button>
          </div>

          {authenticatedStaff && recentDeclarations.length > 0 && (
            <div
              className="mt-12 p-4 rounded-lg"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--brd)",
              }}
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--sec)" }}>
                Mes déclarations
              </h3>
              <div className="space-y-2">
                {recentDeclarations.map((decl) => (
                  <div
                    key={decl.id}
                    className="flex items-center justify-between py-2 px-3 rounded"
                    style={{ backgroundColor: "var(--bg)" }}
                  >
                    <div className="flex-1">
                      <p className="text-xs" style={{ color: "var(--mut)" }}>
                        {new Date(decl.created_at).toLocaleDateString("fr-FR")}
                      </p>
                      <p className="text-sm font-medium">{decl.type}</p>
                      {decl.terrain_zone && (
                        <p className="text-xs" style={{ color: "var(--sec)" }}>
                          {decl.terrain_zone}
                        </p>
                      )}
                    </div>
                    <Badge variant={decl.status === "Clôturée" ? "ok" : decl.status === "En cours" ? "wip" : "crit"}>
                      {decl.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
