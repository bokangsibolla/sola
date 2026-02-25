import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sola: {
          orange: '#E5653A',
          orangeLight: '#FFF5F1',
          bg: '#FAFAFA',
          card: '#FFFFFF',
          border: '#F0F0F0',
          text: '#1A1A1A',
          textSecondary: '#6B7280',
          green: '#22C55E',
          red: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
