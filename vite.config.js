// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // 关键：动态设置基础路径（Vite 要求末尾加 /，需处理）
  base: "./",
  plugins: [react()],
});
