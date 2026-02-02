import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
        },
        nostr: "#8b5cf6",
        trust: {
          green: "#22c55e",
          yellow: "#eab308",
          red: "#ef4444",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "sans-serif",
        ],
        mono: ["Fira Code", "Consolas", "Monaco", "monospace"],
      },
      animation: {
        "fade-in-node": "fadeInNode 0.8s ease-out forwards",
        "fade-in-line": "fadeInLine 1s ease-out forwards",
        "pulse-ring": "pulseRing 3s ease-out infinite",
        "traveling-pulse": "travelingPulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeInNode: {
          "0%": { opacity: "0", transform: "scale(0)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        fadeInLine: {
          "0%": {
            opacity: "0",
            strokeDasharray: "100",
            strokeDashoffset: "100",
          },
          "100%": {
            opacity: "1",
            strokeDasharray: "100",
            strokeDashoffset: "0",
          },
        },
        pulseRing: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "20%": { opacity: "0.4" },
          "100%": { opacity: "0", transform: "scale(2.5)" },
        },
        travelingPulse: {
          "0%": { opacity: "0" },
          "10%": { opacity: "0.8" },
          "90%": { opacity: "0.8" },
          "100%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
