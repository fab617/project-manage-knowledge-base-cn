// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    {
      name: "compress-processes-json",
      closeBundle() {
        const distDir = path.resolve("dist");
        const filePath = path.join(distDir, "processes.json");

        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, "utf-8");
          const compressed = JSON.stringify(JSON.parse(content));
          fs.writeFileSync(filePath, compressed);
          console.log(
            `✅ processes.json 压缩完成: ${content.length} -> ${compressed.length} chars`
          );
        }
      },
    },
  ],
});
