/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'quantum-blue': '#00BFFF',
        'quantum-violet': '#8A2BE2',
        'quantum-emerald': '#00FF7F',
        'quantum-magenta': '#FF00FF',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'space': ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 