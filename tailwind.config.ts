import type { Config } from "tailwindcss";

// Design direction: "the control room" — dark, dense, monospace-forward,
// a status dot in front of every row instead of a colored badge. The
// opposite register from LedgerLite's paper ledger, on purpose: this is
// an internal ops tool, not a customer-facing product.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#0F1115",
        surface: "#161922",
        border: "#2A2E37",
        fg: "#EDEEF0",
        muted: "#8A8F9C",
        active: "#4FD1C5",
        pending: "#E0A458",
        danger: "#E5484D",
      },
      fontFamily: {
        display: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
