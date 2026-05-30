<script setup>
import { inject, ref, watch } from "vue";
import AtmScreenLayout from "../components/AtmScreenLayout.vue";
import { useAtmI18n } from "../composables/useAtmI18n.js";
import { useAtmState } from "../composables/useAtmState.js";

const { at } = useAtmI18n();
const { navigate } = useAtmState();

const cardVisible = inject("cardVisible");
const receiptVisible = inject("receiptVisible");
const onCardClick = inject("onCardClick");
const onReceiptClick = inject("onReceiptClick");
const cardInReader = inject("cardInReader");

// "choice" | "oui" | "non"
const step = ref("choice");
const cardTaken = ref(false);
const receiptTaken = ref(false);

watch(step, (s) => {
  cardTaken.value = false;
  receiptTaken.value = false;

  if (s === "oui") {
    cardVisible.value = true;
    cardInReader.value = true;
    receiptVisible.value = true;

    onCardClick.value = () => {
      cardTaken.value = true;
      cardVisible.value = false;
      onCardClick.value = null;
      if (receiptTaken.value) navigate("ScreenBillets");
    };

    onReceiptClick.value = () => {
      receiptTaken.value = true;
      receiptVisible.value = false;
      onReceiptClick.value = null;
      if (cardTaken.value) navigate("ScreenBillets");
    };
  } else if (s === "non") {
    cardVisible.value = true;
    cardInReader.value = true;
    onCardClick.value = () => navigate("ScreenBillets");
  }
});
</script>

<template>
  <AtmScreenLayout>
    <div class="flex-1 flex flex-col items-center justify-center gap-7 px-8 py-4">

      <!-- Choix reçu -->
      <template v-if="step === 'choice'">
        <p class="text-xl font-black tracking-widest uppercase text-white text-center">
          {{ at("atm.recu.question") }}
        </p>
        <div class="flex gap-4 w-full max-w-xs">
          <button
            class="flex-1 px-6 py-5 rounded-xl text-white text-lg font-bold tracking-wide transition-colors border"
            style="background: rgba(0,180,200,0.22); border-color: rgba(0,180,200,0.5)"
            @click="step = 'oui'"
          >
            {{ at("atm.common.yes") }}
          </button>
          <button
            class="flex-1 px-6 py-5 rounded-xl text-white text-lg font-bold tracking-wide transition-colors border"
            style="background: rgba(220,50,50,0.2); border-color: rgba(220,50,50,0.45)"
            @click="step = 'non'"
          >
            {{ at("atm.common.no") }}
          </button>
        </div>
      </template>

      <!-- Avec reçu -->
      <template v-else-if="step === 'oui'">
        <p class="text-xl font-black tracking-widest uppercase text-white text-center">
          {{ at("atm.recu.takeBoth") }}
        </p>
        <p class="text-white/60 text-sm text-center">
          {{ at("atm.recu.dragBoth") }}
        </p>

        <!-- Indicateurs de statut -->
        <div class="flex gap-10 items-start">
          <div class="flex flex-col items-center gap-2">
            <div
              class="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors duration-300"
              :style="cardTaken
                ? 'border-color: #00b4c8; background: rgba(0,180,200,0.15)'
                : 'border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.06)'"
            >
              <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current" :class="cardTaken ? 'text-[#00b4c8]' : 'text-white/40'">
                <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
              </svg>
            </div>
            <p class="text-xs font-bold" :class="cardTaken ? 'text-[#00b4c8]' : 'text-white/50'">
              {{ cardTaken ? at("atm.recu.cardTaken") : at("atm.recu.cardLabel") }}
            </p>
          </div>
          <div class="flex flex-col items-center gap-2">
            <div
              class="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors duration-300"
              :style="receiptTaken
                ? 'border-color: #00b4c8; background: rgba(0,180,200,0.15)'
                : 'border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.06)'"
            >
              <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current" :class="receiptTaken ? 'text-[#00b4c8]' : 'text-white/40'">
                <path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z" />
              </svg>
            </div>
            <p class="text-xs font-bold" :class="receiptTaken ? 'text-[#00b4c8]' : 'text-white/50'">
              {{ receiptTaken ? at("atm.recu.receiptTaken") : at("atm.recu.receiptLabel") }}
            </p>
          </div>
        </div>
      </template>

      <!-- Sans reçu -->
      <template v-else-if="step === 'non'">
        <p class="text-xl font-black tracking-widest uppercase text-white text-center">
          {{ at("atm.common.takeCard") }}
        </p>
        <p class="text-white/60 text-sm text-center">
          {{ at("atm.common.cardInReader") }}
        </p>
      </template>

    </div>
  </AtmScreenLayout>
</template>
