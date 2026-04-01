/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ✅ Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // ✅ Dark mode color palette
        dark: {
          bg: '#0f172a',      // Main background (slate-900)
          card: '#1e293b',    // Card background (slate-800)
          hover: '#334155',   // Hover states (slate-700)
          border: '#475569',  // Borders (slate-600)
          text: '#e2e8f0',    // Primary text (slate-200)
          muted: '#94a3b8',   // Secondary text (slate-400)
        }
      },
    },
  },
  plugins: [],
}