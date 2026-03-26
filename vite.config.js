// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";

function replaceInPublic() {
  return {
    name: "replace-in-public",
    closeBundle() {
      const basePath = process.env.VITE_BASE_PATH || "files/pm";
      const public404 = resolve("public/404.html");
      const dist404 = resolve("dist/404.html");

      if (existsSync(public404)) {
        let content = readFileSync(public404, "utf-8");
        content = content.replace(/__BASE_PATH__/g, basePath);
        writeFileSync(dist404, content);
      }
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const basePath = process.env.VITE_BASE_PATH || "files/pm";
  const base = `/${basePath}/`;

  return {
    base,
    define: {
      __BASE_PATH__: JSON.stringify(basePath),
    },
    plugins: [react(), replaceInPublic()],
  };
});
