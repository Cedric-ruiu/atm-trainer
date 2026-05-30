// Helper i18n pour les composants du SIMULATEUR (l'écran bleu du DAB).
// `at(key, named)` rend la chaîne dans la locale du simulateur (axe B).
//
// Tant qu'aucune langue n'a été choisie dans ScreenLangue, le simulateur suit la
// langue d'interface via `locale` (composer per-app → SSG-safe : vite-ssg rend les
// routes en parallèle, on évite donc de lire un ref module mutable au pré-rendu).
// Après un choix explicite, il devient indépendant via `atmLocale` (module-level).
//
// Les composants d'INTERFACE utilisent `t()` normal (suit appLocale).
import { useI18n } from "vue-i18n";
import { atmLocale, atmLocaleChosen } from "./useAtmLocale.js";

export function useAtmI18n() {
  const { t, tm, rt, locale } = useI18n();
  return {
    at: (key, named) =>
      t(key, named ?? {}, {
        locale: atmLocaleChosen.value ? atmLocale.value : locale.value,
      }),
    tm,
    rt,
    atmLocale,
  };
}
