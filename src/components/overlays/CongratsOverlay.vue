<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { playApplause } from "../../utils/sounds.js";

const showCongrats = ref(false);
let congratsTimer = null;

const CONFETTI = [
  { x: 8,  color: "#f0c040", delay: 0    },
  { x: 18, color: "#00d4a0", delay: 0.15 },
  { x: 28, color: "#ff6060", delay: 0.3  },
  { x: 38, color: "#00b4c8", delay: 0.05 },
  { x: 48, color: "#f0c040", delay: 0.2  },
  { x: 58, color: "#00d4a0", delay: 0.4  },
  { x: 68, color: "#ff6060", delay: 0.1  },
  { x: 78, color: "#00b4c8", delay: 0.25 },
  { x: 88, color: "#f0c040", delay: 0.35 },
  { x: 22, color: "#00d4a0", delay: 0.45 },
  { x: 52, color: "#ff6060", delay: 0.08 },
  { x: 72, color: "#00b4c8", delay: 0.18 },
];

function openCongrats() {
  showCongrats.value = true;
  playApplause();
  congratsTimer = setTimeout(() => { showCongrats.value = false; }, 5000);
}

function closeCongrats() {
  clearTimeout(congratsTimer);
  showCongrats.value = false;
}

function _onObjectifAtteint() { openCongrats(); }
onMounted(() => window.addEventListener("atm-objectif-atteint", _onObjectifAtteint));
onUnmounted(() => { window.removeEventListener("atm-objectif-atteint", _onObjectifAtteint); clearTimeout(congratsTimer); });
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-500"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="showCongrats"
      class="fixed inset-0 flex items-center justify-center"
      style="z-index:var(--z-congrats); background: rgba(0,0,0,0.55);"
      @click="closeCongrats"
    >
      <!-- Confetti pieces -->
      <span
        v-for="(p, i) in CONFETTI"
        :key="i"
        class="confetti-piece"
        :style="`left:${p.x}%; background:${p.color}; animation-delay:${p.delay}s;`"
      />

      <!-- Card -->
      <div
        class="relative z-10 flex flex-col items-center gap-3 px-10 py-8 rounded-2xl text-white text-center pointer-events-none"
        style="background: rgba(20,26,34,0.95); box-shadow: 0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08);"
      >
        <p class="text-4xl tracking-widest select-none">★ ★ ★</p>
        <p class="text-xs font-bold tracking-widest uppercase" style="color:#f0c040;">Objectif atteint !</p>
        <p class="text-2xl font-black tracking-wide uppercase">Félicitations !</p>
        <p class="text-sm mt-1" style="color: rgba(255,255,255,0.45);">Appuyez pour continuer</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.confetti-piece {
  position: fixed;
  top: -12px;
  width: 9px;
  height: 9px;
  border-radius: 2px;
  pointer-events: none;
  animation: confetti-fall 2.2s ease-in forwards;
}
@keyframes confetti-fall {
  0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
  75%  { opacity: 1; }
  100% { transform: translateY(100vh) rotate(600deg); opacity: 0; }
}
</style>
