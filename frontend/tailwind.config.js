module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                betclic: {
                    red: "#E30613",
                    redHover: "#C70511",
                    redLight: "#FFF1F2",
                    yellow: "#FFD700",
                    yellowHover: "#FFC700",
                    white: "#FFFFFF",
                    grayLight: "#F4F5F7",
                    grayBorder: "#E6E8EC",
                    grayText: "#6B7280",
                    dark: "#1F2937",
                    green: "#059669",
                },
            },
            fontFamily: {
                sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
