import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFDf8',
        surface: {
          DEFAULT: '#FFFFFF',
          border: '#F3E8D9',
        },
        stone: {
          900: '#1C1917',
          500: '#78716C',
        },
        primary: {
          from: '#DC2626',
          to: '#EF4444',
        },
        tint: {
          rose: '#FFE4E6',
          amber: '#FEF3C7',
          sky: '#DBEAFE',
          mint: '#D1FAE5',
          lavender: '#F5E9FF',
        },
        status: {
          correct: '#22C55E',
          wrong: '#FF1A1A',
          streak: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 8px 32px rgba(185, 28, 28, 0.06)',
        'glow-red': '0 10px 25px -3px rgba(220, 38, 38, 0.25)',
      },
      borderRadius: {
        '2xl': '16px',
      }
    },
  },
  plugins: [],
} satisfies Config
