/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050510',
        card: '#0B0F1A',
        accent: '#00FF9C',
        'accent-dark': '#00d683',
        secondary: '#5CE1E6',
        muted: '#9CA3AF',
        border: 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass-card': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glow-accent': '0 0 20px rgba(0, 255, 156, 0.4)',
      },
    },
  },
  plugins: [],
}
