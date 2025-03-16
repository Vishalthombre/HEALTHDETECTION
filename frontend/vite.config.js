import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Ensure build output goes to the correct folder
  },
  base: "/", // Important for correct routing on Render
});
