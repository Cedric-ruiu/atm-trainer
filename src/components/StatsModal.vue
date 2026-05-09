<script setup>
import { computed, ref, watch } from "vue";
import { useProgression } from "../composables/useProgression.js";
import { useSession } from "../composables/useSession.js";

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue"]);

const { currentUser, solde } = useSession();
const { loadUser, saveUser } = useProgression();

const objectifLocal = ref(5);
const showResetDialog = ref(false);
const resetAlsoPin = ref(false);
const resetAlsoSolde = ref(false);
const DEFAULT_SOLDE = 200;

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    objectifLocal.value = currentUser.value?.objectif ?? 5;
    showResetDialog.value = false;
    resetAlsoPin.value = false;
    resetAlsoSolde.value = false;
  },
);

const stats = computed(() => {
  const u = currentUser.value;
  if (!u) return { total: 0, successes: 0, failures: 0, currentStreak: 0, bestStreak: 0, objectif: 5 };
  const sessions = u.sessions;
  const total = sessions.length;
  const successes = sessions.filter((s) => s.success).length;
  return {
    total,
    successes,
    failures: total - successes,
    currentStreak: u.streak,
    bestStreak: u.bestStreak,
    objectif: u.objectif,
  };
});

const recentSessions = computed(() =>
  [...(currentUser.value?.sessions ?? [])].reverse(),
);

const objectifAtteint = computed(() => stats.value.bestStreak >= stats.value.objectif);

function formatTime(iso) {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}h${m}`;
}

function updateObjectif(val) {
  const v = Math.max(1, Math.min(99, val));
  objectifLocal.value = v;
  const user = loadUser();
  if (!user) return;
  user.objectif = v;
  saveUser(user);
  currentUser.value = loadUser();
}

function confirmReset() {
  const user = loadUser();
  if (!user) return;
  user.sessions = [];
  user.streak = 0;
  user.bestStreak = 0;
  if (resetAlsoPin.value) user.pin = null;
  saveUser(user);
  currentUser.value = loadUser();
  if (resetAlsoSolde.value) solde.value = DEFAULT_SOLDE;
  showResetDialog.value = false;
  resetAlsoPin.value = false;
  resetAlsoSolde.value = false;
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
        class="relative w-full max-w-sm max-h-[90dvh] overflow-y-auto rounded-2xl text-white"
        style="background: #1a1e24; box-shadow: 0 20px 60px rgba(0,0,0,0.7);"
      >
        <button
          class="btn absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-lg font-light"
          aria-label="Fermer"
          @click="emit('update:modelValue', false)"
        >×</button>

        <div class="p-6">
          <p class="text-xs font-bold tracking-widest uppercase text-yellow-400 mb-4">Objectifs / Statistiques</p>

          <!-- Reset button -->
          <button
            class="btn w-full px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide border mb-5 text-center"
            style="background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.3); color: rgba(239,68,68,0.7);"
            @click="showResetDialog = true"
          >Réinitialiser les statistiques ↺</button>

          <!-- Reset dialog overlay -->
          <Teleport to="body">
            <Transition
              enter-active-class="transition-opacity duration-150"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-100"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div
                v-if="showResetDialog"
                class="fixed inset-0 flex items-center justify-center p-4"
                style="z-index: 10100; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px);"
                @click.self="showResetDialog = false"
              >
                <div
                  class="w-full max-w-xs rounded-2xl p-5 text-white"
                  style="background: #1f2430; box-shadow: 0 24px 64px rgba(0,0,0,0.8); border: 1px solid rgba(239,68,68,0.3);"
                >
                  <p class="text-sm font-bold text-red-400 mb-1">Réinitialiser les statistiques ?</p>
                  <p class="text-xs text-white/50 mb-4">L'historique, la série en cours et la meilleure série seront effacés.</p>

                  <!-- Options -->
                  <div class="flex flex-col gap-2 mb-5">
                    <label class="flex items-center gap-3 cursor-pointer select-none">
                      <span
                        class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors"
                        :style="resetAlsoPin
                          ? 'background: rgba(0,180,200,0.6); border: 1.5px solid rgba(0,180,200,0.9);'
                          : 'background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.2);'"
                        @click="resetAlsoPin = !resetAlsoPin"
                      >
                        <svg v-if="resetAlsoPin" viewBox="0 0 24 24" class="w-3 h-3 fill-white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      </span>
                      <span class="text-xs text-white/70">Réinitialiser aussi le code PIN</span>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer select-none">
                      <span
                        class="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors"
                        :style="resetAlsoSolde
                          ? 'background: rgba(0,180,200,0.6); border: 1.5px solid rgba(0,180,200,0.9);'
                          : 'background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.2);'"
                        @click="resetAlsoSolde = !resetAlsoSolde"
                      >
                        <svg v-if="resetAlsoSolde" viewBox="0 0 24 24" class="w-3 h-3 fill-white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      </span>
                      <span class="text-xs text-white/70">Réinitialiser aussi le solde (→ {{ DEFAULT_SOLDE }} €)</span>
                    </label>
                  </div>

                  <!-- Actions -->
                  <div class="flex gap-2">
                    <button
                      class="btn flex-1 py-2.5 rounded-lg text-xs font-bold border"
                      style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.55);"
                      @click="showResetDialog = false"
                    >Annuler</button>
                    <button
                      class="btn flex-1 py-2.5 rounded-lg text-xs font-bold border"
                      style="background: rgba(239,68,68,0.25); border-color: rgba(239,68,68,0.6); color: #fca5a5;"
                      @click="confirmReset"
                    >Confirmer</button>
                  </div>
                </div>
              </div>
            </Transition>
          </Teleport>

          <!-- Objectif série | Meilleure série | Objectif rempli ? -->
          <div class="flex gap-2 mb-5">
            <!-- Objectif série (editable) -->
            <div class="flex-1 rounded-xl p-3 text-center" style="background: rgba(0,0,0,0.3)">
              <p class="text-white/50 text-[10px] uppercase tracking-widest mb-2">Objectif série</p>
              <div class="flex items-center justify-center gap-1">
                <button
                  class="btn w-6 h-6 rounded text-white/60 font-bold text-sm flex items-center justify-center"
                  style="background: rgba(255,255,255,0.08);"
                  @click="updateObjectif(objectifLocal - 1)"
                >−</button>
                <span class="text-xl font-bold w-7 text-center" style="color: #00b4c8;">{{ objectifLocal }}</span>
                <button
                  class="btn w-6 h-6 rounded text-white/60 font-bold text-sm flex items-center justify-center"
                  style="background: rgba(255,255,255,0.08);"
                  @click="updateObjectif(objectifLocal + 1)"
                >+</button>
              </div>
            </div>
            <!-- Meilleure série -->
            <div class="flex-1 rounded-xl p-3 text-center" style="background: rgba(0,0,0,0.3)">
              <p class="text-white/50 text-[10px] uppercase tracking-widest mb-2">Meilleure série</p>
              <p class="text-xl font-bold" style="color: #00d4a0;">{{ stats.bestStreak }}</p>
            </div>
            <!-- Objectif rempli ? -->
            <div class="flex-1 rounded-xl p-3 text-center" style="background: rgba(0,0,0,0.3)">
              <p class="text-white/50 text-[10px] uppercase tracking-widest mb-2">Objectif rempli ?</p>
              <p class="text-xl font-bold italic" :style="objectifAtteint ? 'color: #00d4a0;' : 'color: #ff6060;'">
                {{ objectifAtteint ? 'OUI' : 'NON' }}
              </p>
            </div>
          </div>

          <!-- Historique des tentatives header -->
          <p class="text-white/40 text-xs uppercase tracking-widest mb-3">Historique des tentatives</p>

          <!-- Total / Réussites / Échec -->
          <div class="flex gap-2 mb-4">
            <div class="flex-1 rounded-xl p-3 text-center" style="background: rgba(0,0,0,0.3)">
              <p class="text-xl font-bold text-white">{{ stats.total }}</p>
              <p class="text-white/50 text-[10px] uppercase tracking-widest mt-1">Total</p>
            </div>
            <div class="flex-1 rounded-xl p-3 text-center" style="background: rgba(0,0,0,0.3)">
              <p class="text-xl font-bold" style="color: #00d4a0;">{{ stats.successes }}</p>
              <p class="text-white/50 text-[10px] uppercase tracking-widest mt-1">Réussites</p>
            </div>
            <div class="flex-1 rounded-xl p-3 text-center" style="background: rgba(0,0,0,0.3)">
              <p class="text-xl font-bold" style="color: #ff6060;">{{ stats.failures }}</p>
              <p class="text-white/50 text-[10px] uppercase tracking-widest mt-1">Échec</p>
            </div>
          </div>

          <!-- Session history -->
          <div v-if="recentSessions.length" class="flex flex-col gap-1.5">
            <div
              v-for="session in recentSessions"
              :key="session.date"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold"
              :style="session.success
                ? 'background: rgba(0,212,160,0.15); color: #00d4a0;'
                : 'background: rgba(255,96,96,0.15); color: #ff6060;'"
            >
              <svg v-if="session.success" viewBox="0 0 24 24" class="w-4 h-4 shrink-0 fill-current">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <svg v-else viewBox="0 0 24 24" class="w-4 h-4 shrink-0 fill-current">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
              </svg>
              {{ session.success ? 'Succès' : 'Échec' }} à {{ formatTime(session.date) }}
            </div>
          </div>
          <p v-else class="text-white/30 text-xs text-center py-2">Aucune session enregistrée</p>
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
</style>
