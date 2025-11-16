import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        uw: {
          red: "#c5050c",
          dark: "#9b0000"
        }
      }
    }
  },
  plugins: []
} satisfies Config;


