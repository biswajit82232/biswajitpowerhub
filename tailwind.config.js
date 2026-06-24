/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Electric Sky Premium palette
        bg: '#F8FBFF',
        surface: '#FFFFFF',
        'surface-alt': '#F0F9FF',
        brand: {
          DEFAULT: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        accent: {
          DEFAULT: '#14B8A6',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        heading: '#0F172A',
        body: '#475569',
        muted: '#64748B',
        line: '#E2E8F0',
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          '"Plus Jakarta Sans"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        'display-2xl': ['clamp(2.75rem, 7vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-xl': ['clamp(2.25rem, 5.5vw, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'display-lg': ['clamp(1.875rem, 4vw, 2.75rem)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.18', letterSpacing: '-0.015em' }],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)',
        card: '0 2px 8px rgba(15, 23, 42, 0.05), 0 12px 32px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 8px 24px rgba(59, 130, 246, 0.12), 0 24px 56px rgba(15, 23, 42, 0.12)',
        glow: '0 0 0 1px rgba(59, 130, 246, 0.1), 0 8px 32px rgba(59, 130, 246, 0.18)',
        'inner-line': 'inset 0 0 0 1px rgba(226, 232, 240, 0.9)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #3B82F6 0%, #14B8A6 100%)',
        'brand-gradient-r': 'linear-gradient(to right, #3B82F6, #06B6D4, #14B8A6)',
        'sky-fade': 'radial-gradient(120% 120% at 50% 0%, #F0F9FF 0%, #F8FBFF 55%, #FFFFFF 100%)',
        'hero-mesh': 'radial-gradient(ellipse 100% 80% at 20% -10%, #DBEAFE 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 80% 10%, #CCFBF1 0%, transparent 55%), radial-gradient(ellipse 60% 80% at 50% 100%, #EFF6FF 0%, transparent 60%)',
        'blue-teal': 'linear-gradient(135deg, #2563EB 0%, #0891B2 50%, #0D9488 100%)',
        'teal-blue': 'linear-gradient(135deg, #0D9488 0%, #0891B2 50%, #2563EB 100%)',
        'glow-blue': 'radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, transparent 70%)',
        'glow-teal': 'radial-gradient(ellipse at center, rgba(20,184,166,0.15) 0%, transparent 70%)',
        'section-alt': 'linear-gradient(180deg, #F0F9FF 0%, #F8FBFF 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%)',
      },
      maxWidth: {
        content: '1200px',
        prose: '68ch',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'reviews-marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-18px) scale(1.03)' },
        },
        'float-med': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'orb-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.12)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'badge-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(59,130,246,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(20,184,166,0.5), 0 0 40px rgba(59,130,246,0.2)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'reviews-marquee': 'reviews-marquee 55s linear infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'float-med': 'float-med 4.5s ease-in-out infinite',
        'orb-pulse': 'orb-pulse 7s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'badge-glow': 'badge-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
