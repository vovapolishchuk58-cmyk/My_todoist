/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'todoist-red': '#dc4c3e',
        'todoist-red-hover': '#b73f32',
        'sidebar-bg': '#fafafa',
        'sidebar-border': '#e0e0e0',
        'sidebar-hover': '#f5f5f5',
        'sidebar-active': '#ffffff',
      },
    },
  },
  plugins: [],
}
