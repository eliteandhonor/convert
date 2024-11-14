/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        matrix: {
          900: '#000000',
          800: '#001100',
          700: '#002200',
          600: '#003300',
          500: '#004400',
          glow: '#00ff00',
          text: '#22ff22',
          accent: '#11ff11',
          hover: '#33ff33',
          muted: '#116611'
        }
      },
      animation: {
        'matrix-glow': 'glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-matrix': 'pulse-matrix 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'glitch': 'glitch 1s linear infinite',
        'scan-line': 'scan-line 6s linear infinite',
        'hover-glow': 'hover-glow 1.5s ease-in-out infinite',
        'shine': 'shine 3s ease-in-out infinite'
      },
      keyframes: {
        glow: {
          '0%, 100%': { 
            textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00',
            boxShadow: '0 0 10px #00ff00, 0 0 20px #00ff00'
          },
          '50%': { 
            textShadow: '0 0 20px #00ff00, 0 0 30px #00ff00',
            boxShadow: '0 0 20px #00ff00, 0 0 30px #00ff00'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'pulse-matrix': {
          '0%, 100%': { opacity: 0.8 },
          '50%': { opacity: 0.4 }
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        },
        'hover-glow': {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.2)' }
        },
        'shine': {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' }
        }
      },
      boxShadow: {
        'matrix': '0 0 10px rgba(0, 255, 0, 0.3)',
        'matrix-hover': '0 0 20px rgba(0, 255, 0, 0.5)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}