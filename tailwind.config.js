export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#7c3aed",
        success: "#22c55e",
        danger: "#ef4444",
        warning: "#f59e0b",
      },

      borderRadius: {
        xl: "1rem",
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },

  plugins: [],
};
