// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const base = process.env.VITE_BASE_PATH
    ? `/${process.env.VITE_BASE_PATH}/`
    : "/files/pm/";

  return {
    base,
    plugins: [react()],
  };
});
