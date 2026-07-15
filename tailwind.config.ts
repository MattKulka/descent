import type { Config } from 'tailwindcss';

// Ocean-depth palette: zones from sunlit surface down to the hadal trench.
// Used both for Tailwind utilities and as the source of truth for the depth gradient.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        depth: {
          surface: '#4cc9e8', // sunlit epipelagic
          twilight: '#1b7fa8', // mesopelagic
          midnight: '#0a3a5c', // bathypelagic
          abyss: '#04162b', // abyssopelagic
          hadal: '#01060f', // hadal trench
        },
        foam: '#eaf6fb',
        bioluminescent: '#7ef0d0',
      },
      fontFamily: {
        display: ['"Fraunces Variable"', 'Fraunces', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
