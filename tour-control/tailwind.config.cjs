module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        bg: "var(--bg)",
        card: "var(--card)",
        line: "var(--line)",
        gold: "var(--gold)",
        muted: "var(--muted)",
        ok: "var(--ok)",
        bad: "var(--bad)",
        warn: "var(--warn)",
      },
    },
  },
  plugins: [],
};
