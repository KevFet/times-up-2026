/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                accent: {
                    primary: '#ff2d55',
                    secondary: '#5856d6',
                    success: '#34c759',
                }
            }
        },
    },
    plugins: [],
}
