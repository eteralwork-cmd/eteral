/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF8F5',
        ink: '#2A2A2E',
        slatey: '#6B6B73',
        mist: '#E8E6E2',
        coral: '#F5A3A0',
        sky: '#9CC4F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.35em',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(20px,-20px) scale(1.05)' },
        },
        floatSlow2: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(-20px,20px) scale(1.08)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        fadeIn: 'fadeIn 0.6s ease forwards',
        floatSlow: 'floatSlow 14s ease-in-out infinite',
        floatSlow2: 'floatSlow2 16s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
