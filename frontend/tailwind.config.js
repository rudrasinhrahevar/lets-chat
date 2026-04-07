/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        'wa-bg': 'var(--wa-bg)',
        'wa-panel': 'var(--wa-panel)',
        'wa-input': 'var(--wa-input)',
        'wa-border': 'var(--wa-border)',
        'wa-text': 'var(--wa-text)',
        'wa-text-sec': 'var(--wa-text-sec)',
        'wa-icon': 'var(--wa-icon)',
        'wa-teal': '#00a884',
        'wa-teal-dk': '#008f72',
        'wa-green': '#25d366',
        'wa-bubble': 'var(--wa-bubble)',
        'wa-bubble2': 'var(--wa-bubble2)',
        'wa-danger': '#ea4335',
        'wa-unread': '#00a884',
        'wa-read': '#53bdeb',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Helvetica Neue', 'Helvetica', 'Lucida Grande', 'Arial', 'Ubuntu', 'Cantarell', 'Fira Sans', 'sans-serif'],
      },
      animation: {
        'bounce-in': 'bounceIn 0.5s ease-out',
        'pulse-dot': 'pulseDot 1s ease-in-out infinite',
        'slide-up': 'slideUp 0.2s ease-out',
        'slide-from-right': 'slideFromRight 0.25s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'highlight-msg': 'highlightMsg 1.5s ease-out',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.8)' },
        },
        slideUp: {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideFromRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        highlightMsg: {
          '0%': { background: 'rgba(0, 168, 132, 0.3)' },
          '100%': { background: 'transparent' },
        },
      }
    },
  },
  plugins: [],
};
