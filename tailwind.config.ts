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
        background: "#F0EBE3",
        surface: "#E8E2D8",
        elevated: "#FFFFFF",
        border: "#D6CFC5",
        "border-subtle": "#E0DAD0",
        "primary-text": "#1A1714",
        "secondary-text": "#6B6560",
        "tertiary-text": "#9C958E",
        stone: "#B8AFA4",
        accent: "#1A1714",
        "accent-inverse": "#F0EBE3",
        success: "#5A8A6A",
        warning: "#A68B4E",
        error: "#A65A5A",
        info: "#5A7A9A",
      },
      fontFamily: {
        pretendard: ["var(--font-pretendard)", "sans-serif"],
      },
      fontSize: {
        hero: ["40px", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "300" }],
        h2: ["26px", { lineHeight: "1.3", letterSpacing: "-0.015em", fontWeight: "500" }],
        h3: ["20px", { lineHeight: "1.4", fontWeight: "500" }],
        body: ["15px", { lineHeight: "1.75", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.5", letterSpacing: "0.02em", fontWeight: "500" }],
        label: ["10px", { lineHeight: "1.4", letterSpacing: "0.14em", fontWeight: "600" }],
      },
      spacing: {
        "2xs": "2px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
      },
      borderRadius: {
        sm: "2px",
        md: "6px",
        lg: "10px",
        xl: "16px",
        full: "9999px",
      },
      maxWidth: {
        content: "480px",
      },
      transitionDuration: {
        micro: "50-100ms",
        short: "150-250ms",
        medium: "250-400ms",
        long: "400-700ms",
      },
    },
  },
  plugins: [],
};

export default config;