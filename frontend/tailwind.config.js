/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1B5E20",      // verde escuro quadra
        secondary: "#43A047",    // verde médio
        accent: "#A5D6A7"        // verde claro
      }
    },
  },
  plugins: [],
}