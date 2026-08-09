/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Showroom premium — navy-led, less SaaS sky
        bg: '#F7F8FA',
        surface: '#FFFFFF',
        'surface-alt': '#EEF1F6',
        brand: {
          DEFAULT: '#2563EB',
          50: '#EFF4FF',
          100: '#DBE6FE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E3A8A',
          900: '#0F1B3D',
        },
        accent: {
          DEFAULT: '#0F766E',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        heading: '#0B1220',
        body: '#3F4B5F',
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
        soft: '0 1px 2px rgba(11, 18, 32, 0.04), 0 4px 14px rgba(11, 18, 32, 0.05)',
        card: '0 2px 8px rgba(11, 18, 32, 0.04), 0 10px 28px rgba(11, 18, 32, 0.07)',
        'card-hover': '0 8px 20px rgba(11, 18, 32, 0.08), 0 20px 40px rgba(11, 18, 32, 0.08)',
        glow: '0 1px 0 rgba(255,255,255,0.12) inset, 0 8px 24px rgba(37, 99, 235, 0.22)',
        'inner-line': 'inset 0 0 0 1px rgba(226, 232, 240, 0.9)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 55%, #3B82F6 100%)',
        'brand-gradient-r': 'linear-gradient(to right, #1E3A8A, #2563EB, #38BDF8)',
        'sky-fade': 'radial-gradient(120% 120% at 50% 0%, #EEF1F6 0%, #F7F8FA 55%, #FFFFFF 100%)',
        'hero-mesh': 'radial-gradient(ellipse 100% 80% at 20% -10%, rgba(30,58,138,0.08) 0%, transparent 55%), radial-gradient(ellipse 80% 60% at 85% 5%, rgba(37,99,235,0.06) 0%, transparent 50%)',
        'blue-teal': 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #0EA5E9 100%)',
        'teal-blue': 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 50%, #1E3A8A 100%)',
        'glow-blue': 'radial-gradient(ellipse at center, rgba(37,99,235,0.12) 0%, transparent 70%)',
        'glow-teal': 'radial-gradient(ellipse at center, rgba(14,165,233,0.08) 0%, transparent 70%)',
        'section-alt': 'linear-gradient(180deg, #EEF1F6 0%, #F7F8FA 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%)',
        'footer-navy': 'linear-gradient(180deg, #1E3A8A 0%, #0B1220 100%)',
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
        'page-progress': {
          '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
          '60%': { transform: 'scaleX(0.85)', transformOrigin: 'left' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left' },
        },
        'page-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'hero-rise': {
          '0%': { opacity: '0', transform: 'translate3d(0, 18px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        'hero-scale': {
          '0%': { opacity: '0', transform: 'translate3d(0, 12px, 0) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' },
        },
        'hero-pop': {
          '0%': { opacity: '0', transform: 'translate3d(0, 8px, 0) scale(0.92)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0) scale(1)' },
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
        'page-fade-in': 'page-fade-in 0.2s ease-out both',
        'hero-rise': 'hero-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        'hero-scale': 'hero-scale 0.65s cubic-bezier(0.22, 1, 0.36, 1) both',
        'hero-pop': 'hero-pop 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
