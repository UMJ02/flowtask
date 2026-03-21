import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(214 32% 91%)",
        background: "hsl(210 40% 98%)",
        foreground: "hsl(222 47% 11%)",
        card: "hsl(0 0% 100%)",
        muted: "hsl(210 40% 96.1%)",
        primary: "hsl(222 47% 11%)",
        accent: "hsl(215 20% 65%)",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        xl: "1rem",
        '2xl': "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
