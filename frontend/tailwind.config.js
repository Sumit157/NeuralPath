/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:      '#000000',
        bg1:     '#0a0a0a',
        bg2:     '#111111',
        bg3:     '#1a1a1a',
        green:   '#00ff88',
        green2:  '#00cc6a',
        green3:  '#004422',
        border:  '#1e1e1e',
        border2: '#2a2a2a',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm:   ['DM Sans', 'sans-serif'],
      },
      animation: {
        'fade-in':  'fadeIn .4s ease forwards',
        'slide-in': 'slideIn .3s ease forwards',
        'pulse-dot':'pulseDot 1.5s ease infinite',
        'glow':     'glow 2.5s ease infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn:  { from: { opacity: 0, transform: 'translateX(-16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
        glow:     { '0%,100%': { boxShadow: '0 0 8px #00ff8840' }, '50%': { boxShadow: '0 0 28px #00ff8870' } },
      },
    },
  },
  plugins: [],
};
