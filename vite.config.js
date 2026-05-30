import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/atm-trainer/",
  plugins: [vue(), tailwindcss()],
  // vite-ssg: pré-rend chaque route dans son propre index de répertoire
  // (`/en` → `dist/en/index.html`, servi à `/atm-trainer/en/`).
  ssgOptions: {
    dirStyle: "nested",
  },
  // Flags Vue — requis pour que les deps externalisées (vue-i18n) les résolvent
  // pendant le rendu serveur de vite-ssg (Vite 8 / Rolldown).
  define: {
    __VUE_OPTIONS_API__: "true",
    __VUE_PROD_DEVTOOLS__: "false",
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
  },
  ssr: {
    noExternal: ["vue-i18n"],
  },
});
