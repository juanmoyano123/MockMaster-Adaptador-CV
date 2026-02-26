/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan only the sidepanel source files so unused utility classes are
  // purged from the production build.
  content: [
    './src/sidepanel/**/*.{ts,tsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        // Same design tokens used in the main MockMaster Next.js app so
        // both surfaces feel visually consistent.
        primary: {
          DEFAULT: '#0A66C2',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#0A66C2',
          700: '#0B5394',
          800: '#094374',
          900: '#07365C',
        },
        secondary: {
          DEFAULT: '#059669',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        accent: {
          DEFAULT: '#DC2626',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        blue: {
          DEFAULT: '#2563EB',
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
        teal: {
          DEFAULT: '#0D9488',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4', 'Georgia', 'serif'],
      },
      // The sidepanel has a fixed narrow width (400px max in Chrome).
      // These custom sizes help keep the layout compact.
      spacing: {
        'panel': '400px',
      },
    },
  },
  plugins: [],
};
