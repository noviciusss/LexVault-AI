import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F14",
        surface: {
          DEFAULT: "#131922",
          elevated: "#1A2230",
          subtle: "#0F141C",
          border: "rgba(255, 255, 255, 0.08)",
        },
        accent: {
          DEFAULT: "#C9A24B",
          hover: "#DEBA65",
          muted: "#8C6F31",
          subtle: "rgba(201, 162, 75, 0.12)",
        },
        content: {
          primary: "#E7EAEE",
          secondary: "#9BA3AF",
          muted: "#64748B",
        },
        status: {
          success: "#2FBF8F",
          warning: "#E0A93E",
          danger: "#E0554F",
          info: "#3B82F6",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)",
        gold: "0 0 25px -4px rgba(201, 162, 75, 0.25)",
      },
      animation: {
        "pulse-gold": "pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out forwards",
      },
      keyframes: {
        pulseGold: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 15px rgba(201, 162, 75, 0.4)" },
          "50%": { opacity: "0.6", boxShadow: "0 0 5px rgba(201, 162, 75, 0.1)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
