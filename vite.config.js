// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 读取环境变量，默认值为 /
const basePath = process.env.VITE_BASE_PATH || "/";

export default defineConfig({
  // 关键：动态设置基础路径（Vite 要求末尾加 /，需处理）
  base: basePath === "/" ? "/" : `${basePath}/`,
  plugins: [react()],
});
