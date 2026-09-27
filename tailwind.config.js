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
        background: {
          DEFAULT: '#0b0c10',
          elevated: '#11131a',
        },
        surface: {
          DEFAULT: '#14161f',
          subtle: '#1a1d28',
          hover: '#222634',
          active: '#2a2f40',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(255, 255, 255, 0.16)',
        },
        brand: {
          DEFAULT: '#e50914',
          accent: '#ff2d55',
          hover: '#ff446a',
          muted: 'rgba(255, 45, 85, 0.15)',
        },
        yox: {
          text: {
            primary: '#f3f4f6',
            secondary: '#9ca3af',
            muted: '#6b7280',
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
      },
      aspectRatio: {
        'poster': '2 / 3',
        'backdrop': '16 / 9',
      }
    },
  },
  plugins: [],
}
