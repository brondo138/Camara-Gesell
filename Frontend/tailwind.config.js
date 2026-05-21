/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  "#f0f4fa",
          100: "#d9e4f4",
          200: "#b3c9e9",
          300: "#7aa4d4",
          400: "#4a7fbf",
          500: "#2c5f9e",
          600: "#1e4a83",
          700: "#163968",
          800: "#102b50",
          900: "#0a1c35",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}