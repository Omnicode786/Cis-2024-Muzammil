/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: "#FFFBF0", // Warm Cream White
                primary: "#1a1a1a", // Soft Black
                secondary: "#666666",
                portfolio: {
                    paper: "#fff9ec",
                    ink: "#111111",
                    muted: "#56524c",
                    red: "#ff4d4d",
                    cyan: "#1ee3cf",
                    signal: "#f8d34f",
                    blue: "#246bfe",
                },
                accent: {
                    red: "#FF3366",
                    cyan: "#00CCFF",
                    yellow: "#FFCC00",
                    purple: "#663399",
                    mint: "#00FF99",
                },
            },
            fontFamily: {
                sans: ['Satoshi', 'sans-serif'],
                mono: ['Space Grotesk', 'monospace'],
                display: ['Space Grotesk', 'sans-serif'],
            },
            boxShadow: {
                'pop': '4px 4px 0px 0px rgba(0,0,0,1)', // Neo-brutalist shadow
                'pop-hover': '8px 8px 0px 0px rgba(0,0,0,1)',
            },
            animation: {
                marquee: 'marquee 25s linear infinite',
                marquee2: 'marquee2 25s linear infinite',
                'bounce-slow': 'bounce 3s infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                marquee2: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0%)' },
                },
            },
        },
    },
    plugins: [],
}
