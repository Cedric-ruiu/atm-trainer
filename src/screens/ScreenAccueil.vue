<script setup>
import { inject, onMounted } from "vue";
import AtmScreenLayout from "../components/AtmScreenLayout.vue";
import { useAtmState } from "../composables/useAtmState.js";

const { navigate } = useAtmState();

const cardVisible = inject("cardVisible");
const onCardClick = inject("onCardClick");

onMounted(() => {
  cardVisible.value = true;
  onCardClick.value = () => navigate("ScreenLangue");
});
</script>

<template>
  <AtmScreenLayout :warn="false">
    <div class="flex-1 flex items-center justify-center px-6 py-4">

      <!-- Deux colonnes -->
      <div class="flex items-center gap-0 w-full max-w-2xl">

        <!-- Gauche : illustration carte -->
        <div class="flex-1 flex items-center justify-center">
          <svg viewBox="0 0 120 80" class="w-36 opacity-80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Carte -->
            <rect x="4" y="4" width="112" height="72" rx="8" stroke="white" stroke-width="2.5" />
            <!-- Puce -->
            <rect x="14" y="22" width="22" height="18" rx="3" stroke="white" stroke-width="1.5" />
            <line x1="20" y1="22" x2="20" y2="40" stroke="white" stroke-width="0.8" opacity="0.6" />
            <line x1="26" y1="22" x2="26" y2="40" stroke="white" stroke-width="0.8" opacity="0.6" />
            <line x1="14" y1="29" x2="36" y2="29" stroke="white" stroke-width="0.8" opacity="0.6" />
            <line x1="14" y1="34" x2="36" y2="34" stroke="white" stroke-width="0.8" opacity="0.6" />
            <!-- Numéro de carte -->
            <text x="14" y="58" font-family="monospace" font-size="7" fill="white" opacity="0.7">•••• •••• •••• ••••</text>
            <!-- Flèche insertion -->
            <line x1="85" y1="40" x2="105" y2="40" stroke="#00b4c8" stroke-width="2" stroke-linecap="round" />
            <polyline points="100,35 105,40 100,45" stroke="#00b4c8" stroke-width="2" stroke-linejoin="round" fill="none" />
          </svg>
        </div>

        <!-- Séparateur cyan -->
        <div class="w-px self-stretch mx-4" style="background: #00b4c8; opacity: 0.7" />

        <!-- Droite : texte -->
        <div class="flex-1 flex flex-col gap-4 pl-4">
          <h1 class="text-xl font-black tracking-widest uppercase text-white leading-tight">
            INTRODUISEZ<br>VOTRE CARTE
          </h1>
          <div>
            <p class="text-white/70 text-sm">Billets disponibles :</p>
            <p class="font-bold text-base" style="color: #f0c040">10 € – 20 € – 50 €</p>
          </div>
        </div>
      </div>
    </div>
  </AtmScreenLayout>
</template>
