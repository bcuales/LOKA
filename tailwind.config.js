/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                brand: {
                    teal: '#0FB9B1',
                    yellow: '#F8D34A',
                },
            },
        },
    },
    plugins: [],
};
