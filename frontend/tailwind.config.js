/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // WhatsApp Dark Theme (default)
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
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
};
