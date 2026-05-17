/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 70px rgba(99, 102, 241, 0.22)',
      },
      backgroundImage: {
        'mesh': 'radial-gradient(circle at top left, rgba(99,102,241,.35), transparent 35%), radial-gradient(circle at 80% 20%, rgba(236,72,153,.24), transparent 30%), radial-gradient(circle at 50% 90%, rgba(34,211,238,.20), transparent 35%)',
      },
    },
  },
  plugins: [],
}
