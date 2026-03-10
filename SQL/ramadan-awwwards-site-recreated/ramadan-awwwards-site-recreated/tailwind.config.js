/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: '#020617',
        gold: '#FACC15',
        moon: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      boxShadow: {
        glow: '0 0 60px rgba(250, 204, 21, 0.22)',
      },
      backgroundImage: {
        'gold-radial': 'radial-gradient(circle, rgba(250,204,21,0.18), transparent 72%)',
      },
    },
  },
  plugins: [],
};
