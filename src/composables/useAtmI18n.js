// Helper i18n pour les composants du SIMULATEUR (l'écran bleu du DAB).
// `at(key, named)` force la locale du simulateur (`atmLocale`), indépendante de
// la locale d'interface globale. Réactif : `at()` lit `atmLocale.value` au render.
//
// Les composants d'INTERFACE utilisent `t()` normal (suit `appLocale`).
import { useI18n } from "vue-i18n";
import { atmLocale } from "./useAtmLocale.js";

export function useAtmI18n() {
  const { t, tm, rt } = useI18n();
  return {
    at: (key, named) => t(key, named ?? {}, { locale: atmLocale.value }),
    tm,
    rt,
    atmLocale,
  };
}
