<script setup>
import { inject, ref, watch } from "vue";
import AtmScreenLayout from "../components/AtmScreenLayout.vue";
import { useAtmI18n } from "../composables/useAtmI18n.js";
import { useAtmState } from "../composables/useAtmState.js";
import { useSession } from "../composables/useSession.js";

const { at } = useAtmI18n();
const { navigate } = useAtmState();
const { setSelectedAmount, setTransactionType, solde } = useSession();

const cardVisible = inject("cardVisible");
const onCardClick = inject("onCardClick");
const cardInReader = inject("cardInReader");
const keypadBus = inject("keypadBus");

// "amounts" | "confirm" | "custom" | "cancel"
const step = ref("amounts");
const pendingAmount = ref(0);
const customDigits = ref([]);
const customError = ref("");

function selectAmount(amount) {
  pendingAmount.value = amount;
  step.value = "confirm";
}

function confirmAmount() {
  setSelectedAmount(pendingAmount.value);
  setTransactionType("montant");
  navigate("ScreenCode");
}

function onCustomDigit(d) {
  if (customDigits.value.length < 5) {
    customDigits.value = [...customDigits.value, d];
    customError.value = "";
  }
}

function onCustomClear() {
  customDigits.value = customDigits.value.slice(0, -1);
  customError.value = "";
}

function onCustomConfirm() {
  const amount = Number(customDigits.value.join(""));
  if (!amount || amount <= 0) {
    customError.value = at("atm.montant.errInvalid");
    return;
  }
  if (amount % 10 !== 0) {
    customError.value = at("atm.montant.errMultiple");
    return;
  }
  if (amount > solde.value) {
    customError.value = at("atm.montant.errInsufficient");
    return;
  }
  setSelectedAmount(amount);
  setTransactionType("montant");
  navigate("ScreenCode");
}

watch(step, (s) => {
  if (s === "cancel") {
    cardVisible.value = true;
    cardInReader.value = true;
    onCardClick.value = () => navigate("ScreenRemerciement");
  }
});

watch(keypadBus, (event) => {
  if (!event) return;
  if (step.value !== "custom") return;
  if (event.type === "digit") onCustomDigit(event.payload);
  if (event.type === "clear") onCustomClear();
  if (event.type === "confirm") onCustomConfirm();
  if (event.type === "cancel") step.value = "amounts";
});
</script>

<template>
  <AtmScreenLayout>
    <div class="flex-1 flex flex-col items-center justify-center gap-5 px-8 py-4">

      <!-- Choix du montant -->
      <template v-if="step === 'amounts'">
        <p class="text-xl font-black tracking-widest uppercase text-white text-center">
          {{ at("atm.montant.title") }}
        </p>
        <div class="grid grid-cols-3 gap-3 w-full max-w-xs">
          <button
            v-for="amount in [10, 20, 30, 50, 100]"
            :key="amount"
            class="px-3 py-4 rounded-xl text-white text-base font-bold tracking-wide transition-colors border"
            style="background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.25)"
            @click="selectAmount(amount)"
          >
            {{ amount }} €
          </button>
          <button
            class="px-3 py-4 rounded-xl text-white/70 text-base font-bold tracking-wide transition-colors border"
            style="background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.15)"
            @click="step = 'custom'; customDigits = []; customError = ''"
          >
            {{ at("atm.montant.other") }}
          </button>
        </div>
        <button
          class="w-full max-w-xs px-6 py-4 rounded-xl text-white text-base font-bold tracking-wide transition-colors border"
          style="background: rgba(220,50,50,0.2); border-color: rgba(220,50,50,0.45)"
          @click="step = 'cancel'"
        >
          {{ at("atm.common.cancel") }}
        </button>
      </template>

      <!-- Confirmation -->
      <template v-else-if="step === 'confirm'">
        <p class="text-white/80 text-base text-center uppercase tracking-widest">
          {{ at("atm.montant.confirmQuestion") }}
        </p>
        <p class="text-4xl font-bold font-mono" style="color: #f0c040">
          {{ pendingAmount }} €
        </p>
        <div class="flex gap-4 w-full max-w-xs">
          <button
            class="flex-1 px-6 py-4 rounded-xl text-white text-base font-bold tracking-wide transition-colors border"
            style="background: rgba(0,180,200,0.22); border-color: rgba(0,180,200,0.5)"
            @click="confirmAmount"
          >
            {{ at("atm.common.yes") }}
          </button>
          <button
            class="flex-1 px-6 py-4 rounded-xl text-white text-base font-bold tracking-wide transition-colors border"
            style="background: rgba(220,50,50,0.2); border-color: rgba(220,50,50,0.45)"
            @click="step = 'amounts'"
          >
            {{ at("atm.common.no") }}
          </button>
        </div>
      </template>

      <!-- Saisie libre -->
      <template v-else-if="step === 'custom'">
        <p class="text-white/80 text-base uppercase tracking-widest text-center">
          {{ at("atm.montant.enterAmount") }}
        </p>
        <div
          class="w-full max-w-xs rounded-xl px-6 py-4 text-center"
          style="background: rgba(0,0,0,0.4); border: 1.5px solid #00b4c8"
        >
          <span class="text-4xl font-bold font-mono" style="color: #f0c040">
            {{ customDigits.length ? customDigits.join("") : "0" }} €
          </span>
        </div>
        <p v-if="customError" class="text-sm font-bold text-center" style="color: #f0c040">
          {{ customError }}
        </p>
        <p class="text-white/50 text-xs tracking-widest uppercase">
          {{ at("atm.montant.useKeypad") }}
        </p>
      </template>

      <!-- Annulation -->
      <template v-else-if="step === 'cancel'">
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
