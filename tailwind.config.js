/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius, 16px)", // Default fallback
        md: "calc(var(--radius, 16px) - 2px)",
        sm: "calc(var(--radius, 16px) - 4px)",
      },
      colors: {
        primary: "#4F46E5", // Example primary color
        secondary: "#22D3EE", // Example secondary color
        accent: "#E11D48", // Example accent color
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      transitionProperty: {
        opacity: "opacity",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // For animations
    // require("@tailwindcss/typography"), // For rich text support (optional)
  ],
};
