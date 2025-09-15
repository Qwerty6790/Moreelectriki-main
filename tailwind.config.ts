import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        // Custom site scrollbar styling (webkit + firefox)
        '::-webkit-scrollbar': {
          width: '12px',
          height: '12px'
        },
        '::-webkit-scrollbar-thumb': {
          background: 'rgba(16,16,16,0.6)',
          borderRadius: '9999px',
          border: '3px solid rgba(255,255,255,0.04)'
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(16,16,16,0.8)'
        },
        '::-webkit-scrollbar-track': {
          background: 'transparent'
        },
        'html, body, #__next': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(16,16,16,0.6) transparent'
        }
      });
    })
  ],
};
export default config;
