/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#fff9ed",
                primary: "#24312f",
                secondary: "#6d7a73",
                system: {
                    void: "#fff8eb",
                    panel: "#ffffffcc",
                    text: "#20302d",
                    cyan: "#65cfd7",
                    lime: "#a8d58c",
                    blue: "#8fb8ff",
                    red: "#ef8a7a",
                    cream: "#fff2d9",
                    sage: "#d8ead6",
                    bark: "#8d6b45",
                    mist: "#eef8f5",
                },
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
