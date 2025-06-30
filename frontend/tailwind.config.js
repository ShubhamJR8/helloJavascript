/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Light theme colors
        light: {
          bg: '#ffffff',
          'bg-secondary': '#f8fafc',
          'bg-tertiary': '#f1f5f9',
          text: '#1e293b',
          'text-secondary': '#475569',
          'text-muted': '#64748b',
          border: '#e2e8f0',
          'border-secondary': '#cbd5e1',
          primary: '#0d9488',
          'primary-hover': '#0f766e',
          secondary: '#6366f1',
          'secondary-hover': '#5855eb',
          accent: '#8b5cf6',
          'accent-hover': '#7c3aed',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        // Dark theme colors
        dark: {
          bg: '#0f172a',
          'bg-secondary': '#1e293b',
          'bg-tertiary': '#334155',
          text: '#f8fafc',
          'text-secondary': '#cbd5e1',
          'text-muted': '#94a3b8',
          border: '#334155',
          'border-secondary': '#475569',
          primary: '#14b8a6',
          'primary-hover': '#0d9488',
          secondary: '#818cf8',
          'secondary-hover': '#6366f1',
          accent: '#a78bfa',
          'accent-hover': '#8b5cf6',
          success: '#22c55e',
          warning: '#fbbf24',
          error: '#f87171',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ],
} 