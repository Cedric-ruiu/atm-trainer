import { ViteSSG } from "vite-ssg";
import App from "./App.vue";
import { createAppI18n } from "./i18n/index.js";
import HomePage from "./pages/HomePage.vue";
import "./style.css";

// vue-router sert UNIQUEMENT aux 2 URLs d'interface (axe A). La navigation
// interne du DAB (useAtmState) n'est PAS router-isée. Les deux routes rendent
// la même HomePage ; l'état du DAB (singletons module-level) persiste au switch.
const routes = [
  { path: "/", component: HomePage, meta: { locale: "fr" } },
  { path: "/en", component: HomePage, meta: { locale: "en" } },
];

export const createApp = ViteSSG(
  App,
  { routes, base: "/atm-trainer/" },
  ({ app, router }) => {
    const i18n = createAppI18n();
    app.use(i18n);
    router.beforeEach((to) => {
      i18n.global.locale.value = to.meta.locale ?? "fr";
    });
  },
);
