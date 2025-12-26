/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
        "!./node_modules/**",
        "!./server/**",
    ],
    theme: {
        extend: {
            colors: {
                // Custom NYX color palette
                nyx: {
                    dark: '#0a0f2b',
                    darker: '#060912',
                    accent: '#00d4ff',
                    purple: '#7c3aed',
                    magenta: '#ff00ff',
                },
            },
            animation: {
                'pulse-glow': 'pulse-glow 3s infinite ease-in-out',
                'pulse-border': 'pulse-border 3s infinite ease-in-out',
                'fade-in': 'fadeIn 0.5s ease-in-out',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))' },
                    '50%': { filter: 'drop-shadow(0 0 16px rgba(124, 58, 237, 0.6))' },
                },
                'pulse-border': {
                    '0%, 100%': { borderColor: 'rgba(167, 139, 250, 0.8)' },
                    '50%': { borderColor: 'rgba(34, 211, 238, 0.8)' },
                },
                fadeIn: {
                    from: { opacity: '0', transform: 'scale(0.95)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
            },
        },
    },
    plugins: [],
};
