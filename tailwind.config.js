/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14161A",
        paper: "#FFFFFF",
        panel: "#F5F6FA",
        line: "#E4E6EC",
        accent: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
        },
        signal: "#0EA5A0",
        muted: "#6B7280",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
