import { ViteSSG } from "vite-ssg/single-page";
import App from "./App.vue";
import "./style.css";

// useHead désactivé : tout le <head> est statique dans index.html. Sans cette
// option, unhead réécrit <html> et force lang="en" (la source est "fr").
export const createApp = ViteSSG(App, undefined, { useHead: false });
