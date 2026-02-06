/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{ts,tsx,js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                'accent-primary': '#39ff14', // Neon Green
                'accent-secondary': '#059669', // Emerald
                'accent-highlight': '#4ade80',
                'glass-bg': 'rgba(255, 255, 255, 0.05)',
                'glass-border': 'rgba(255, 255, 255, 0.1)',
                'dark-bg': '#0f172a', // Slate 900
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                neon: ['"Neon Glow"', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-in': 'bounceIn 0.5s cubic-bezier(0.8, 0, 1, 1)',
            },
            keyframes: {
                bounceIn: {
                    '0%': { transform: 'scale(0.3)', opacity: '0' },
                    '50%': { transform: 'scale(1.05)' },
                    '70%': { transform: 'scale(0.9)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
