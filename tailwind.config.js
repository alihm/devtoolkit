/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Neo-brutalist palette
        accent: {
          lime: '#CCFF00',
          coral: '#FF6B6B',
          cyan: '#00FFFF',
          violet: '#9D4EDD',
        },
        surface: {
          light: '#F5F5F0',
          dark: '#0D0D0D',
          muted: '#1A1A1A',
          elevated: '#252525',
        }
      },
      fontFamily: {
        display: ['"Space Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px currentColor',
        'brutal-sm': '2px 2px 0px 0px currentColor',
        'brutal-lg': '6px 6px 0px 0px currentColor',
        'glow-lime': '0 0 20px rgba(204, 255, 0, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 255, 255, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'typewriter': 'typewriter 0.5s steps(10) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(204, 255, 0, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(204, 255, 0, 0.4)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}
