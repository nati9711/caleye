import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#0a0a0f',
        'bg-surface': '#1a1a2e',
        'bg-elevated': '#252542',
        'bg-border': 'rgba(255, 255, 255, 0.08)',
        accent: '#00d4aa',
        'accent-hover': '#00eebb',
        'accent-muted': 'rgba(0, 212, 170, 0.15)',
        'accent-cyan': '#06B6D4',
        'accent-warm': '#f59e0b',
        'accent-warm-hover': '#fbbf24',
        'accent-coral': '#FB7185',
        'accent-purple': '#7c3aed',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'text-tertiary': '#64748b',
        success: '#22c55e',
        error: '#ef4444',
        // Macro colors
        'macro-protein': '#3b82f6',
        'macro-carbs': '#22c55e',
        'macro-fat': '#f59e0b',
        // Chart bar colors
        'cal-light': '#22c55e',
        'cal-medium': '#f59e0b',
        'cal-heavy': '#ef4444',
        // Rarity colors
        'rarity-common': '#22c55e',
        'rarity-uncommon': '#3b82f6',
        'rarity-rare': '#a855f7',
        'rarity-epic': '#f59e0b',
        'rarity-legendary': '#ef4444',
      },
      fontFamily: {
        heebo: ['Heebo', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
      },
      borderRadius: {
        card: '16px',
        'btn-lg': '12px',
        'btn-sm': '8px',
        thumb: '8px',
        input: '8px',
        badge: '50%',
        pip: '12px',
        'chart-bar': '4px',
      },
      boxShadow: {
        'elevation-1': '0 2px 8px rgba(0, 0, 0, 0.2)',
        'elevation-2': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'elevation-3': '0 16px 48px rgba(0, 0, 0, 0.4)',
        glow: '0 0 20px rgba(0, 212, 170, 0.3)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.3)',
      },
      fontSize: {
        h1: ['28px', { lineHeight: '1.3', fontWeight: '700' }],
        h2: ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['11px', { lineHeight: '1.4', fontWeight: '300' }],
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'float-xp': 'float-xp 1.5s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-slide-up': 'fade-slide-up 0.3s ease-out forwards',
        'spin-glow': 'spin-glow 0.8s ease-out',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'float-xp': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '50%': { transform: 'translateY(-30px)', opacity: '1' },
          '100%': { transform: 'translateY(-60px)', opacity: '0' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%) translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0) translateY(0)', opacity: '1' },
        },
        'fade-slide-up': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-20px)', opacity: '0' },
        },
        'spin-glow': {
          '0%': { transform: 'rotate(0deg) scale(0.5)', opacity: '0' },
          '50%': { transform: 'rotate(180deg) scale(1.2)', opacity: '1' },
          '100%': { transform: 'rotate(360deg) scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
