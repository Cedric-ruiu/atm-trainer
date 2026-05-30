<script setup>
import { computed } from "vue";
import AtmShell from "../components/AtmShell.vue";
import IntroOverlay from "../components/overlays/IntroOverlay.vue";
import { useAtmState } from "../composables/useAtmState.js";
import ScreenAccueil from "../screens/ScreenAccueil.vue";
import ScreenBillets from "../screens/ScreenBillets.vue";
import ScreenCarteBloquee from "../screens/ScreenCarteBloquee.vue";
import ScreenCode from "../screens/ScreenCode.vue";
import ScreenLangue from "../screens/ScreenLangue.vue";
import ScreenMontant from "../screens/ScreenMontant.vue";
import ScreenOperation from "../screens/ScreenOperation.vue";
import ScreenRecu from "../screens/ScreenRecu.vue";
import ScreenRemerciement from "../screens/ScreenRemerciement.vue";

const screens = {
  ScreenAccueil,
  ScreenLangue,
  ScreenOperation,
  ScreenMontant,
  ScreenCode,
  ScreenRecu,
  ScreenBillets,
  ScreenRemerciement,
  ScreenCarteBloquee,
};

const { currentScreen } = useAtmState();
const activeScreen = computed(() => screens[currentScreen.value]);
</script>

<template>
  <AtmShell>
    <component :is="activeScreen" />
  </AtmShell>
  <IntroOverlay />
</template>
