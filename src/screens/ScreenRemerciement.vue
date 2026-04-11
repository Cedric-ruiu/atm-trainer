<script setup>
import { onMounted, onUnmounted } from "vue";
import AtmScreenLayout from "../components/AtmScreenLayout.vue";
import { useAtmState } from "../composables/useAtmState.js";
import { useSession } from "../composables/useSession.js";

const { navigate } = useAtmState();
const { resetSession } = useSession();

let timer = null;

onMounted(() => {
  resetSession();
  timer = setTimeout(() => navigate("ScreenAccueil"), 5000);
});

onUnmounted(() => {
  clearTimeout(timer);
});
</script>

<template>
  <AtmScreenLayout :warn="false">
    <div class="flex-1 flex flex-col items-center justify-center gap-3 p-10">
      <p class="text-3xl font-black tracking-widest uppercase text-center leading-relaxed" style="color: #f0c040">
        MERCI DE VOTRE VISITE
      </p>
      <p class="text-white/60 text-sm tracking-widest uppercase text-center">
        Au revoir
      </p>
    </div>
  </AtmScreenLayout>
</template>
