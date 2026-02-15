import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        card: "var(--card)",
        elev: "var(--elev)",
        accent: "var(--accent)",
        "accent-dim": "var(--accent-dim)",
        text: "var(--text)",
        sec: "var(--sec)",
        mut: "var(--mut)",
        brd: "var(--brd)",
        grn: "var(--grn)",
        amb: "var(--amb)",
        red: "var(--red)",
        h1: "var(--h1)",
        h2: "var(--h2)",
        tag: "var(--tag)",
        "badge-plan-bg": "var(--badge-plan-bg)",
        "badge-plan-c": "var(--badge-plan-c)",
        "risk-grn": "var(--risk-grn)",
        "risk-amb": "var(--risk-amb)",
        "risk-red": "var(--risk-red)",
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        arial: ["Arial", "sans-serif"],
        mono: ["SF Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
      },
      spacing: {
        "0.5": "2px",
        "1.5": "6px",
        "2.5": "10px",
        "3.5": "14px",
      },
    },
  },
  plugins: [],
};

export default config;
