/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0a0a0a',
          'bg-secondary': '#111111',
          'bg-tertiary': '#1a1a1a',
          'bg-elevated': '#222222',
          hover: '#2a2a2a',
          border: '#2a2a2a',
          'border-light': '#333333',
        },
        accent: {
          DEFAULT: '#10b981',
          hover: '#059669',
          muted: 'rgba(16, 185, 129, 0.15)',
        },
        txt: {
          primary: '#e5e5e5',
          secondary: '#a3a3a3',
          muted: '#666666',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
