// Axe B — locale du SIMULATEUR DAB (`atmLocale`), indépendante de la langue
// d'interface (`appLocale`, pilotée par la route). Singletons module-level.
//
// Sémantique :
//  - tant qu'aucune langue n'est explicitement choisie dans ScreenLangue, le
//    simulateur SUIT la langue d'interface (cf. useAtmI18n : `at()` dérive alors de
//    la locale per-app, ce qui est SSG-safe — vite-ssg rend les routes en parallèle,
//    donc on ne lit pas un ref module mutable pendant le pré-rendu) ;
//  - un choix dans ScreenLangue fixe `atmLocale` et le rend indépendant ;
//  - le switch d'interface ne modifie pas un `atmLocale` déjà choisi ;
//  - `resetSession()` (retour Accueil / fin de flux) efface le choix → le simulateur
//    re-suit la langue d'interface.
//
// Au build SSG, `atmLocaleChosen` reste `false` (aucune interaction) → les écrans
// pré-rendus sont dans la langue de la page.
import { ref } from "vue";

export const atmLocale = ref("fr");
export const atmLocaleChosen = ref(false);

export function chooseAtmLocale(code) {
  atmLocale.value = code;
  atmLocaleChosen.value = true;
}

export function resetAtmLocale() {
  atmLocaleChosen.value = false;
}
