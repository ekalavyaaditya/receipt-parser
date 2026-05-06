/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1917",
        paper: "#f7f3ea",
        accent: "#b45309",
        calm: "#0f766e"
      }
    }
  },
  plugins: []
};

