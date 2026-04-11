<script setup>
import { inject, ref } from "vue";
import AtmScreenLayout from "../components/AtmScreenLayout.vue";
import { useAtmState } from "../composables/useAtmState.js";
import { useSession } from "../composables/useSession.js";

const { navigate } = useAtmState();
const { setSelectedAmount, setTransactionType, solde } = useSession();

const cardVisible = inject("cardVisible");
const onCardClick = inject("onCardClick");
const cardInReader = inject("cardInReader");

const showSolde = ref(false);
const cancelMode = ref(false);

function selectExpress() {
  setSelectedAmount(50);
  setTransactionType("express");
  navigate("ScreenCode");
}

function handleCancel() {
  cancelMode.value = true;
  cardVisible.value = true;
  cardInReader.value = true;
  onCardClick.value = () => navigate("ScreenRemerciement");
}
</script>

<template>
  <AtmScreenLayout>
    <div class="flex-1 flex flex-col items-center justify-center gap-5 px-8 py-4">

      <!-- Mode annulation -->
      <template v-if="cancelMode">
        <h1 class="text-xl font-black tracking-widest uppercase text-white text-center">
          RETIREZ VOTRE CARTE
        </h1>
        <p class="text-white/60 text-sm text-center">
          Votre carte est disponible dans le lecteur
        </p>
      </template>

      <!-- Vue principale -->
      <template v-else>
        <h1 class="text-xl font-black tracking-widest uppercase text-white text-center">
          CHOISISSEZ VOTRE OPÉRATION
        </h1>

        <!-- Encart solde -->
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div
            v-if="showSolde"
            class="w-full max-w-xs px-5 py-3 rounded-xl text-center"
            style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.15)"
          >
            <p class="text-white/60 text-xs uppercase tracking-widest mb-1">Solde disponible</p>
            <p class="text-3xl font-bold font-mono" style="color: #f0c040">{{ solde }} €</p>
          </div>
        </Transition>

        <div class="flex flex-col gap-3 w-full max-w-xs">
          <button
            class="w-full px-6 py-4 rounded-xl text-white text-base font-bold tracking-wide transition-colors border text-left"
            style="background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.25)"
            @click="selectExpress"
          >
            Retrait rapide 50 €
          </button>
          <button
            class="w-full px-6 py-4 rounded-xl text-white text-base font-bold tracking-wide transition-colors border text-left"
            style="background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.25)"
            @click="navigate('ScreenMontant')"
          >
            Autre montant
          </button>
          <button
            class="w-full px-6 py-4 rounded-xl text-white text-base font-bold tracking-wide transition-colors border text-left"
            style="background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.25)"
            @click="showSolde = !showSolde"
          >
            Consulter le solde
          </button>
          <button
            class="w-full px-6 py-4 rounded-xl text-white text-base font-bold tracking-wide transition-colors border text-left"
            style="background: rgba(220,50,50,0.2); border-color: rgba(220,50,50,0.45)"
            @click="handleCancel"
          >
            Annuler
          </button>
        </div>
      </template>

    </div>
  </AtmScreenLayout>
</template>
