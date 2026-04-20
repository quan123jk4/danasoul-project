/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Quét tất cả file trong src
  ],
  theme: {
    extend: {
      colors: {
        vcbDigi: "#468045", // Thêm màu xanh Vietcombank cho dự án Danasoul
      },
    },
  },
  plugins: [],
};
