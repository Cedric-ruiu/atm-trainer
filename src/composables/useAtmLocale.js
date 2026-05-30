// Axe B — locale du SIMULATEUR DAB (`atmLocale`), indépendante de la langue
// d'interface (`appLocale`). Singletons module-level, SSR-safe (défaut "fr"),
// sans dépendance à l'instance vue-i18n (créée par app).
//
// Sémantique :
//  - défaut = appLocale ;
//  - suit appLocale tant qu'aucun choix explicite n'est fait dans ScreenLangue ;
//  - après un choix, atmLocale devient indépendant (un switch d'interface ne le
//    modifie plus) ;
//  - resetSession() (retour Accueil / fin de flux) ré-synchronise sur appLocale.
import { ref } from "vue";

export const appLocale = ref("fr"); // miroir de route.meta.locale
export const atmLocale = ref("fr"); // locale du DAB simulé
export const atmLocaleChosen = ref(false); // un choix explicite a-t-il été fait ?

// Appelé par router.beforeEach. Fait suivre la locale du simulateur tant que
// l'apprenant n'a pas explicitement choisi une langue dans ScreenLangue.
export function setAppLocale(code) {
  appLocale.value = code;
  if (!atmLocaleChosen.value) atmLocale.value = code;
}

export function chooseAtmLocale(code) {
  atmLocale.value = code;
  atmLocaleChosen.value = true;
}

export function resetAtmLocale() {
  atmLocaleChosen.value = false;
  atmLocale.value = appLocale.value;
}
