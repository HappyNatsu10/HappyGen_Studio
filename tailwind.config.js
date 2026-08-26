/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        surface: {
          0: '#0e0f14',
          1: '#15161d',
          2: '#1c1d27',
          3: '#242531',
          4: '#2e2f3d',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#7c7fff',
          subtle: 'rgba(99, 102, 241, 0.12)',
          muted: 'rgba(99, 102, 241, 0.06)',
        },
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      fontSize: {
        '2xs': ['10px', '14px'],
      },
    },
  },
  plugins: [],
}
