/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0b0f14",
        secondary: "#11161d",
        secondaryAlt: "#0F151C",
        accent: "#00b7ff",
        accentDark: "#0088CC",
        spiderNeon: "#0099dd",
        danger: "#ff1759",
        text: {
          primary: "#FFFFFF",
          secondary: "#B0B8C0",
          muted: "#6B7280",
        },
        neon: {
          blue: "#00B7FF",
          cyan: "#00E5FF",
          purple: "#8B5CF6",
          spider: "#0099dd",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui"],
        mono: ["JetBrainsMono", "monospace"],
      },
      boxShadow: {
        neon: "0 0 10px rgba(0, 183, 255, 0.5), 0 0 20px rgba(0, 183, 255, 0.3)",
        "neon-spider": "0 0 10px rgba(0, 153, 221, 0.5), 0 0 20px rgba(0, 153, 221, 0.3)",
        "neon-glow": "0 0 15px rgba(0, 183, 255, 0.6), 0 0 30px rgba(0, 183, 255, 0.4)",
      },
    },
  },
  plugins: [],
};

