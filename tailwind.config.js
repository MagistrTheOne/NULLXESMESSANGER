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
        primary: "#090D12",
        secondary: "#0F151C",
        accent: "#00B7FF",
        accentDark: "#0088CC",
        danger: "#FF1A4B",
      },
    },
  },
  plugins: [],
};

