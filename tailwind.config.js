/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          900: '#0a0a0f', // Deepest black-blue
          800: '#13131f', // Card background
          700: '#1c1c2e', // Border color
        },
        neon: {
          blue: '#4f46e5',   // Indigo-600 (Primary)
          purple: '#9333ea', // Purple-600 (Accent)
          green: '#10b981',  // Success
          red: '#ef4444',    // Danger/Fraud
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px #4f46e5, 0 0 10px #4f46e5' },
          '50%': { boxShadow: '0 0 20px #9333ea, 0 0 30px #9333ea' },
        }
      }
    },
  },
  plugins: [],
}