import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

export const SUPPORTED_LOCALES = ["fr", "en"];

// Instance i18n fraîche par app. Pendant le SSG, vite-ssg appelle la factory
// une fois par route ; un singleton partagé ferait fuiter la locale d'une page
// à l'autre (la locale globale est mutée par le guard du router).
export function createAppI18n() {
  return createI18n({
    legacy: false,
    locale: "fr",
    fallbackLocale: "fr",
    messages: { fr, en },
  });
}
