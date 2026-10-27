import type { Config } from "tailwindcss";

// Paleta extraída del flyer de Isariza Sabores
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        crema: { DEFAULT: "#F6EFE2", 50: "#FBF8F2", 100: "#F6EFE2", 200: "#EDE1CB" },
        cacao: { DEFAULT: "#3A2A1F", 700: "#4A372A", 500: "#6B5546" },
        oliva: { DEFAULT: "#56663A", 700: "#45522E", 300: "#A3AE84", 100: "#E4E8D6" },
        aji: { DEFAULT: "#B5342A", 700: "#922920" },
        kraft: { DEFAULT: "#C8A47A", 300: "#E3CDAF" },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        script: ["'Caveat'", "cursive"],
        sans: ["'Lato'", "system-ui", "sans-serif"],
      },
      boxShadow: { frasco: "0 10px 30px -12px rgba(58,42,31,.35)" },
    },
  },
  plugins: [],
};
export default config;
