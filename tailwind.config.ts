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
        bg: "var(--color-bg)",
        surface: {
          DEFAULT: "var(--color-surface)",
          2: "var(--color-surface-2)",
        },
        border: "var(--color-border)",
        accent: {
          DEFAULT: "var(--color-accent)",
          dim: "var(--color-accent-dim)",
        },
        // foreground / text
        fg: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
          dim: "var(--color-text-dim)",
        },
        danger: "var(--color-danger)",
        success: "var(--color-success)",
        info: "var(--color-info)",
      },
      fontFamily: {
        serif: ["var(--font-main)", "Georgia", "serif"],
        sans: ["var(--font-main)", "Georgia", "serif"],
      },
      maxWidth: {
        app: "430px",
      },
      minHeight: {
        screen: "100dvh",
      },
    },
  },
  plugins: [],
};
export default config;
