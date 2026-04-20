import { ref } from "vue";

const VALID_SCREENS = new Set([
  "ScreenAccueil",
  "ScreenStats",
  "ScreenLangue",
  "ScreenOperation",
  "ScreenMontant",
  "ScreenCode",
  "ScreenRecu",
  "ScreenBillets",
  "ScreenRemerciement",
  "ScreenCarteBloquee",
]);

const currentScreen = ref("ScreenAccueil");

export function useAtmState() {
  function navigate(screenName) {
    if (!VALID_SCREENS.has(screenName)) {
      console.warn(`[useAtmState] Unknown screen: "${screenName}"`);
      return;
    }
    currentScreen.value = screenName;
  }

  return {
    currentScreen,
    navigate,
  };
}
