<script setup>
import { inject, onMounted } from "vue";
import AtmScreenLayout from "../components/AtmScreenLayout.vue";
import { useAtmState } from "../composables/useAtmState.js";
import { useProgression } from "../composables/useProgression.js";
import { useSession } from "../composables/useSession.js";
import { playApplause } from "../utils/sounds.js";

const { navigate } = useAtmState();
const { currentUser, selectedAmount } = useSession();
const { getStats, recordSession } = useProgression();

const billsVisible = inject("billsVisible");
const onBillsClick = inject("onBillsClick");

function finishSession() {
  if (!currentUser.value) {
    navigate("ScreenRemerciement");
    return;
  }
  recordSession(currentUser.value.id, true);
  const { currentStreak } = getStats(currentUser.value.id);
  if (currentStreak >= 5) playApplause();
  navigate("ScreenRemerciement");
}

onMounted(() => {
  billsVisible.value = true;
  onBillsClick.value = () => finishSession();
});
</script>

<template>
  <AtmScreenLayout>
    <div class="flex-1 flex items-center justify-center px-6 py-4">

      <!-- Deux colonnes -->
      <div class="flex items-center gap-0 w-full max-w-2xl">

        <!-- Gauche : illustration billet -->
        <div class="flex-1 flex items-center justify-center">
          <svg viewBox="0 0 160 90" class="w-40 opacity-80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Ombre billet -->
            <rect x="8" y="8" width="148" height="78" rx="6" fill="rgba(0,0,0,0.3)" />
            <!-- Billet principal -->
            <rect x="4" y="4" width="148" height="78" rx="6" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" fill="rgba(255,255,255,0.08)" />
            <!-- Bande gauche -->
            <rect x="4" y="4" width="28" height="78" rx="6" fill="rgba(255,255,255,0.08)" />
            <!-- Symbole € -->
            <text x="18" y="50" font-family="serif" font-size="26" fill="white" opacity="0.7" text-anchor="middle" font-weight="bold">€</text>
            <!-- Lignes déco -->
            <line x1="40" y1="20" x2="140" y2="20" stroke="rgba(255,255,255,0.2)" stroke-width="0.8" />
            <line x1="40" y1="66" x2="140" y2="66" stroke="rgba(255,255,255,0.2)" stroke-width="0.8" />
            <!-- Montant -->
            <text x="92" y="52" font-family="monospace" font-size="28" fill="white" opacity="0.85" text-anchor="middle" font-weight="bold">€</text>
          </svg>
        </div>

        <!-- Séparateur cyan -->
        <div class="w-px self-stretch mx-4" style="background: #00b4c8; opacity: 0.7" />

        <!-- Droite : texte -->
        <div class="flex-1 flex flex-col gap-3 pl-4">
          <h1 class="text-xl font-black tracking-widest uppercase leading-tight" style="color: #f0c040">
            VEUILLEZ PRENDRE VOS BILLETS
          </h1>
          <p class="text-3xl font-bold font-mono text-white">
            {{ selectedAmount }} €
          </p>
          <p class="text-white/60 text-sm">
            Glissez vos billets vers la zone poche
          </p>
        </div>

      </div>
    </div>
  </AtmScreenLayout>
</template>
