export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { prompt: ["Prompt", "sans-serif"] },
      colors: {
        cream: "#fffaf3",
        rose: "#ffdce8",
        rose2: "#fff1f6",
        brown: "#7a4f38",
        coffee: "#4b2f24",
        mocha: "#b78a66",
        mint: "#dff4e8",
        sage: "#7da88b",
        sky: "#e6f4ff",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(75,47,36,.10)",
        glow: "0 30px 90px rgba(75,47,36,.14)",
      },
    },
  },
  plugins: [],
};
