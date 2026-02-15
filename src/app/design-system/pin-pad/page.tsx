"use client";

import React, { useState } from "react";

export default function PinPadDemo() {
  const [pin, setPin] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState("");

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = [...pin, num];
      setPin(newPin);

      if (newPin.length === 4) {
        if (newPin.join("") === "1234") {
          setError("");
          alert("PIN correct : 1234");
          setPin([]);
        } else {
          setError("PIN incorrect");
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setPin([]);
          }, 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  };

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
          PIN Pad Demo (essayez 1234)
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
              disabled={pin.length === 0}
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

          <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: "var(--card)", border: "1px solid var(--brd)" }}>
            <p className="text-xs" style={{ color: "var(--sec)" }}>
              Essayez le PIN : <span className="font-bold" style={{ color: "var(--accent)" }}>1234</span>
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--mut)" }}>
              Tout autre PIN affichera "PIN incorrect" avec animation shake.
            </p>
          </div>
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
