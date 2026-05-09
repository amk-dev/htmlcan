import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { pagesPlugin } from "./vite-plugin-pages";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    pagesPlugin(process.env.HTMLCAN_FOLDER),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
