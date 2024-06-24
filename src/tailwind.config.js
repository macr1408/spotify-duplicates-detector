/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "selector",
  theme: {
    extend: {
      colors: {
        main: "#242424",
        alt: "#1ed760",
      },
    },
  },
  plugins: [],
};
