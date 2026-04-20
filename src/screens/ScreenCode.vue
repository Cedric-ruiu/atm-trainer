<script setup>
import { inject, ref, watch } from "vue";
import AtmScreenLayout from "../components/AtmScreenLayout.vue";
import { useAtmState } from "../composables/useAtmState.js";
import { useSession } from "../composables/useSession.js";

const { navigate } = useAtmState();
const { currentUser, deductAmount, pinAttempts, selectedAmount } = useSession();

const keypadBus = inject("keypadBus");

const digits = ref([]);
const errorMessage = ref("");

function onDigit(d) {
  if (digits.value.length < 4) {
    digits.value = [...digits.value, d];
    errorMessage.value = "";
  }
}

function onClear() {
  digits.value = digits.value.slice(0, -1);
  errorMessage.value = "";
}

function onConfirm() {
  if (digits.value.length < 4) return;

  const entered = digits.value.join("");

  if (!currentUser.value?.pin) {
    deductAmount();
    navigate("ScreenRecu");
    return;
  }

  if (entered === currentUser.value.pin) {
    deductAmount();
    navigate("ScreenRecu");
  } else {
    pinAttempts.value++;
    digits.value = [];
    if (pinAttempts.value >= 3) {
      navigate("ScreenCarteBloquee");
    } else {
      errorMessage.value = `Code incorrect — ${3 - pinAttempts.value} tentative(s) restante(s)`;
    }
  }
}

watch(keypadBus, (event) => {
  if (!event) return;
  if (event.type === "digit") onDigit(event.payload);
  if (event.type === "clear") onClear();
  if (event.type === "confirm") onConfirm();
  if (event.type === "cancel") navigate("ScreenOperation");
});
</script>

<template>
  <AtmScreenLayout>
    <div class="flex-1 flex items-center justify-center px-6 py-4">

      <!-- Deux colonnes -->
      <div class="flex items-center gap-0 w-full max-w-2xl">

        <!-- Gauche : grille décorative + étoiles -->
        <div class="flex-1 flex flex-col items-center justify-center gap-5">
          <!-- Grille 3×3 + 0 -->
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="n in [1,2,3,4,5,6,7,8,9]"
              :key="n"
              class="w-9 h-9 rounded-md border flex items-center justify-center text-white/50 text-sm font-mono"
              style="border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.06)"
            >
              {{ n }}
            </div>
            <div class="w-9 h-9" />
            <div
              class="w-9 h-9 rounded-md border flex items-center justify-center text-white/50 text-sm font-mono"
              style="border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.06)"
            >
              0
            </div>
            <div class="w-9 h-9" />
          </div>

          <!-- Indicateur PIN -->
          <div class="flex gap-3">
            <span
              v-for="i in 4"
              :key="i"
              class="text-4xl font-black font-mono leading-none transition-colors duration-150"
              :style="i <= digits.length ? 'color: #f0c040' : 'color: rgba(255,255,255,0.25)'"
            >*</span>
          </div>
        </div>

        <!-- Séparateur cyan -->
        <div class="w-px self-stretch mx-5" style="background: #00b4c8; opacity: 0.7" />

        <!-- Droite : instructions -->
        <div class="flex-1 flex flex-col gap-3 pl-4">
          <p v-if="selectedAmount" class="text-sm font-bold" style="color: #f0c040">
            Vous avez demandé {{ selectedAmount }} €
          </p>
          <h1 class="text-lg font-black tracking-wide uppercase text-white leading-snug">
            SAISISSEZ VOTRE CODE SECRET
          </h1>
          <p class="text-white/60 text-sm italic">
            à l'abri des regards indiscrets
          </p>
          <p class="text-base font-black tracking-wide uppercase text-white mt-1">
            PUIS VALIDEZ
          </p>

          <!-- Erreur -->
          <Transition
            enter-active-class="transition-opacity duration-300"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
          >
            <p v-if="errorMessage" class="text-sm font-bold mt-1" style="color: #f0c040">
              {{ errorMessage }}
            </p>
          </Transition>
        </div>

      </div>
    </div>
  </AtmScreenLayout>
</template>
