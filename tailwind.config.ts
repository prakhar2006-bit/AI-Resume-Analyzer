import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        heading: ['"Sora"', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        surface: 'hsl(var(--surface))',
        card: 'hsl(var(--card))',
        border: 'hsl(var(--border))',
        primary: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          muted: '#6366F120',
        },
        secondary: {
          DEFAULT: '#22D3EE',
          muted: '#22D3EE20',
        },
        success: { DEFAULT: '#10B981', muted: '#10B98120' },
        warning: { DEFAULT: '#F59E0B', muted: '#F59E0B20' },
        danger: { DEFAULT: '#EF4444', muted: '#EF444420' },
        orange: { DEFAULT: '#F97316', muted: '#F9731620' },
        textPrimary: 'hsl(var(--text-primary))',
        textMuted: 'hsl(var(--text-muted))',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      animation: {
        'pulse-border': 'pulse-border 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-border': {
          '0%, 100%': { borderColor: '#6366F150', boxShadow: '0 0 0 0 #6366F130' },
          '50%': { borderColor: '#6366F1', boxShadow: '0 0 20px 4px #6366F130' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        glow: '0 0 20px rgba(99,102,241,0.3)',
        'glow-cyan': '0 0 20px rgba(34,211,238,0.3)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}

export default config
