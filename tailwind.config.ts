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
        background: "#0d0f14",
        foreground: "#e8e0d0",
        copper: {
          DEFAULT: "#c8843a",
          light: "#dba35c",
          dark: "#9c6427",
        },
        surface: "#161a22",
        border: "#2a2f3a",
      },
      fontFamily: {
        serif: ["EB Garamond", "Georgia", "serif"],
      },
      maxWidth: {
        app: "430px",
      },
    },
  },
  plugins: [],
};
export default config;
