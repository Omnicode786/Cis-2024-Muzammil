/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        system: {
          void: '#fff8eb',
          panel: '#ffffffcc',
          text: '#20302d',
          cyan: '#65cfd7',
          lime: '#a8d58c',
          blue: '#8fb8ff',
          red: '#ef8a7a',
          cream: '#fff2d9',
          sage: '#d8ead6',
          bark: '#8d6b45',
          mist: '#eef8f5',
        },
      },
      fontFamily: {
        sans: ['Satoshi', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
