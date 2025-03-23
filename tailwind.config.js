/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5f8d4e',    // Forest green
        secondary: '#a4be7b',  // Sage green
        tertiary: '#e5d9b6',   // Wheat
        dark: '#285430',       // Deep forest green
        light: '#fefae0',      // Cream
        accent: '#bc6c25',     // Terracotta
      },
    },
  },
  plugins: [],
} 