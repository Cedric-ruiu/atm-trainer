import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/atm-trainer/",
  plugins: [vue(), tailwindcss()],
});
