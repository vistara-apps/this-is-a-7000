/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(220, 10%, 98%)',
        accent: 'hsl(140, 60%, 45%)',
        primary: 'hsl(210, 70%, 50%)',
        surface: 'hsl(0, 0%, 100%)',
        'text-primary': 'hsl(210, 20%, 20%)',
        'text-secondary': 'hsl(210, 20%, 40%)',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      spacing: {
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(210, 20%, 20%, 0.08)',
        'modal': '0 16px 48px hsla(210, 20%, 20%, 0.16)',
      },
      fontSize: {
        'display': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'heading': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.75rem', fontWeight: '400' }],
        'caption': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '300' }],
      },
    },
  },
  plugins: [],
}