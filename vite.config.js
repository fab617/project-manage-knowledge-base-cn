// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const base =
    command === "build" && process.env.BASE_PATH
      ? `${process.env.BASE_PATH}`
      : "/files/pm/";

  return {
    base,
    plugins: [react()],
  };
});
