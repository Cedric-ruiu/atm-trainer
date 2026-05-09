<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import AtmScreenLayout from "../components/AtmScreenLayout.vue";
import { useAtmState } from "../composables/useAtmState.js";
import { useProgression } from "../composables/useProgression.js";
import { useSession } from "../composables/useSession.js";

const { navigate } = useAtmState();
const { currentUser, resetSession } = useSession();
const { loadUser, recordSession } = useProgression();

const showFarewell = ref(false);
let t1 = null;
let t2 = null;

onMounted(() => {
  t1 = setTimeout(() => {
    showFarewell.value = true;
    t2 = setTimeout(() => {
      recordSession(false);
      currentUser.value = loadUser();
      resetSession();
      navigate("ScreenAccueil");
    }, 10000);
  }, 10000);
});

onUnmounted(() => {
  clearTimeout(t1);
  clearTimeout(t2);
});
</script>

<template>
  <AtmScreenLayout>
    <div class="flex-1 flex flex-col items-center justify-center gap-6 p-10">
      <!-- Icône verrou -->
      <svg viewBox="0 0 24 24" class="w-14 h-14 fill-current text-white/70">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
      </svg>

      <div class="text-center flex flex-col gap-2">
        <p class="text-2xl font-black tracking-widest uppercase text-white">
          CARTE BLOQUÉE
        </p>
        <p class="text-white/70 text-base text-center leading-relaxed">
          Veuillez vous rapprocher<br>d'un guichet
        </p>
      </div>

      <Transition
        enter-active-class="transition-opacity duration-700"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
      >
        <p v-if="showFarewell" class="text-lg font-bold tracking-widest text-center" style="color: #f0c040">
          Merci de votre visite
        </p>
      </Transition>
    </div>
  </AtmScreenLayout>
</template>
