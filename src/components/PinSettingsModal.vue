<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useProgression } from "../composables/useProgression.js";
import { useSession } from "../composables/useSession.js";

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue"]);

const { t } = useI18n();

const { currentUser, solde } = useSession();
const { generatePin, loadUser, saveUser } = useProgression();

const mode = ref("demo"); // 'manual' | 'generated' | 'demo'
const manualDigits = ref([]);
const showPin = ref(false);

const soldeInput = ref("");
const DEFAULT_SOLDE = 200;
const QUICK_AMOUNTS = [50, 100, 200, 500];

function setSolde(val) {
  const n = Math.max(0, Math.round(val / 10) * 10);
  solde.value = n;
  soldeInput.value = String(n);
}

function onSoldeInput(e) {
  soldeInput.value = e.target.value;
}

function onSoldeBlur() {
  const parsed = parseInt(soldeInput.value, 10);
  if (!isNaN(parsed) && parsed >= 0) {
    setSolde(parsed);
  } else {
    soldeInput.value = String(solde.value);
  }
}

function adjustSolde(delta) {
  setSolde(solde.value + delta);
}

const hasPin = computed(() => !!currentUser.value?.pin);

const modes = [
  { key: "manual", labelKey: "pin.modeManual" },
  { key: "generated", labelKey: "pin.modeGenerated" },
  { key: "demo", labelKey: "pin.modeDemo" },
];

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    mode.value = currentUser.value?.pin ? "manual" : "demo";
    manualDigits.value = [];
    showPin.value = false;
    soldeInput.value = String(solde.value);
  },
);

function selectMode(m) {
  mode.value = m;
  manualDigits.value = [];
  showPin.value = false;
  if (m === "demo") {
    persistPin(null);
  } else if (m === "generated") {
    persistPin(generatePin());
  }
}

function persistPin(pin) {
  const user = loadUser();
  if (!user) return;
  user.pin = pin;
  saveUser(user);
  currentUser.value = loadUser();
}

function addDigit(d) {
  if (manualDigits.value.length < 4) {
    manualDigits.value = [...manualDigits.value, d];
  }
}

function removeDigit() {
  manualDigits.value = manualDigits.value.slice(0, -1);
}

function confirmManual() {
  if (manualDigits.value.length !== 4) return;
  persistPin(manualDigits.value.join(""));
  manualDigits.value = [];
}

function clearPin() {
  mode.value = "demo";
  persistPin(null);
}
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      @click.self="emit('update:modelValue', false)"
    >
      <div
        class="relative w-full max-w-sm rounded-2xl text-white"
        style="background: #1a1e24; box-shadow: 0 20px 60px rgba(0,0,0,0.7);"
      >
        <button
          class="btn absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-lg font-light"
          :aria-label="t('intro.close')"
          @click="emit('update:modelValue', false)"
        >×</button>

        <div class="p-6">
          <p class="text-xs font-bold tracking-widest uppercase text-yellow-400 mb-4">{{ t("pin.title") }}</p>

          <!-- Mode selector -->
          <div class="flex gap-2 mb-4">
            <button
              v-for="m in modes"
              :key="m.key"
              class="btn flex-1 px-2 py-2 rounded-lg text-xs font-bold tracking-wide transition-colors border"
              :style="mode === m.key
                ? 'background: rgba(0,180,200,0.22); border-color: rgba(0,180,200,0.7); color: white;'
                : 'background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.55);'"
              @click="selectMode(m.key)"
            >{{ t(m.labelKey) }}</button>
          </div>

          <!-- PIN display — visible dès qu'un code est défini, quel que soit le mode -->
          <div v-if="hasPin" class="flex items-center gap-4 mb-4 px-1">
            <button
              class="btn px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border shrink-0"
              style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.7);"
              @click="showPin = !showPin"
            >{{ showPin ? t("pin.hide") : t("pin.show") }}</button>
            <div class="flex gap-3">
              <span
                v-for="i in 4"
                :key="i"
                class="text-2xl font-mono font-bold"
                style="color: #f0c040;"
              >{{ showPin ? currentUser.pin[i - 1] : '∗' }}</span>
            </div>
          </div>

          <!-- Sub-panel: manual -->
          <div v-if="mode === 'manual'" class="flex flex-col items-center gap-3 mb-4">
            <!-- Dot indicator -->
            <div class="flex gap-3">
              <span
                v-for="i in 4"
                :key="i"
                class="w-3 h-3 rounded-full border-2 transition-colors"
                :style="i <= manualDigits.length
                  ? 'background: #f0c040; border-color: #f0c040;'
                  : 'background: transparent; border-color: rgba(255,255,255,0.3);'"
              />
            </div>
            <!-- Mini digit grid -->
            <div class="grid grid-cols-3 gap-1.5">
              <button
                v-for="d in [1,2,3,4,5,6,7,8,9]"
                :key="d"
                class="btn w-10 h-10 rounded-lg text-white font-bold text-sm flex items-center justify-center"
                style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);"
                @click="addDigit(String(d))"
              >{{ d }}</button>
              <button
                class="btn w-10 h-10 rounded-lg text-white/60 font-bold text-sm flex items-center justify-center"
                style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);"
                @click="removeDigit"
              >⌫</button>
              <button
                class="btn w-10 h-10 rounded-lg text-white font-bold text-sm flex items-center justify-center"
                style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);"
                @click="addDigit('0')"
              >0</button>
              <div />
            </div>
            <button
              v-if="manualDigits.length === 4"
              class="btn px-6 py-2 rounded-lg text-sm font-bold text-white"
              style="background: rgba(0,180,200,0.3); border: 1px solid rgba(0,180,200,0.6);"
              @click="confirmManual"
            >{{ t("pin.valider") }}</button>
          </div>

          <!-- Sub-panel: generated (code affiché dans la section commune ci-dessus) -->
          <div v-else-if="mode === 'generated'" class="mb-4 py-1">
            <p class="text-xs text-white/40 text-center">{{ t("pin.generatedHint") }}</p>
          </div>

          <!-- Sub-panel: demo -->
          <div v-else class="mb-4 py-1">
            <p class="text-xs text-white/50 text-center">{{ t("pin.demoHint") }}</p>
          </div>

          <!-- Clear button -->
          <button
            class="btn w-full px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide border text-center mb-2"
            style="background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.12); color: rgba(255,255,255,0.45);"
            @click="clearPin"
          >{{ t("pin.clearBtn") }}</button>

          <!-- Solde section -->
          <div class="mt-4 pt-4" style="border-top: 1px solid rgba(255,255,255,0.1);">
            <p class="text-xs font-bold tracking-widest uppercase text-yellow-400 mb-3">{{ t("pin.soldeTitle") }}</p>

            <!-- Quick amount buttons -->
            <div class="flex gap-2 mb-3">
              <button
                v-for="a in QUICK_AMOUNTS"
                :key="a"
                class="btn flex-1 py-1.5 rounded-lg text-xs font-bold border"
                :style="solde === a
                  ? 'background: rgba(0,180,200,0.22); border-color: rgba(0,180,200,0.7); color: white;'
                  : 'background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.55);'"
                @click="setSolde(a)"
              >{{ a }} €</button>
            </div>

            <!-- +/- controls + input -->
            <div class="flex items-center gap-2 mb-3">
              <button
                class="btn w-10 h-10 rounded-lg text-white font-bold text-xl flex items-center justify-center shrink-0"
                style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);"
                @click="adjustSolde(-10)"
              >−</button>
              <div class="relative flex-1">
                <input
                  type="number"
                  min="0"
                  step="10"
                  inputmode="numeric"
                  class="w-full rounded-lg text-center font-mono font-bold text-white text-lg py-2 px-8 outline-none"
                  style="background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.2);"
                  :value="soldeInput"
                  @input="onSoldeInput"
                  @blur="onSoldeBlur"
                  @keydown.enter="onSoldeBlur"
                />
                <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-white/40 pointer-events-none">€</span>
              </div>
              <button
                class="btn w-10 h-10 rounded-lg text-white font-bold text-xl flex items-center justify-center shrink-0"
                style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);"
                @click="adjustSolde(10)"
              >+</button>
            </div>

            <!-- Reset solde -->
            <button
              class="btn w-full px-4 py-2 rounded-lg text-xs font-bold tracking-wide border text-center"
              style="background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.12); color: rgba(255,255,255,0.45);"
              @click="setSolde(DEFAULT_SOLDE)"
            >{{ t("pin.soldeReset", { n: DEFAULT_SOLDE }) }}</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.btn {
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: filter 0.12s ease;
}
.btn:hover { filter: brightness(1.2); }
.btn:active { filter: brightness(0.82); }

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type=number] { -moz-appearance: textfield; }
</style>
