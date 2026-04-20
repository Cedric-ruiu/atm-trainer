<script setup>
import { computed } from "vue";
import AtmScreenLayout from "../components/AtmScreenLayout.vue";
import { useAtmState } from "../composables/useAtmState.js";
import { useProgression } from "../composables/useProgression.js";
import { useSession } from "../composables/useSession.js";

const { navigate } = useAtmState();
const { currentUser } = useSession();
const { getStats } = useProgression();

const stats = computed(() => getStats());

const recentSessions = computed(() => {
  if (!currentUser.value?.sessions?.length) return [];
  return [...currentUser.value.sessions].reverse().slice(0, 10);
});

const progressPercent = computed(() => {
  if (!stats.value?.total) return 0;
  return Math.round((stats.value.successes / stats.value.total) * 100);
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
});

function formatDate(iso) {
  return dateFormatter.format(new Date(iso));
}
</script>

<template>
  <AtmScreenLayout :warn="false">
    <div class="flex-1 flex flex-col items-center justify-center gap-5 px-8 py-4 overflow-y-auto">

      <!-- Compteurs -->
      <div class="flex gap-3 w-full max-w-xs">
        <div class="flex-1 rounded-xl p-4 text-center" style="background: rgba(0,0,0,0.3)">
          <p class="text-2xl font-bold text-white">{{ stats.total }}</p>
          <p class="text-white/50 text-xs uppercase tracking-widest mt-1">Total</p>
        </div>
        <div class="flex-1 rounded-xl p-4 text-center" style="background: rgba(0,0,0,0.3)">
          <p class="text-2xl font-bold" style="color: #00d4a0">{{ stats.successes }}</p>
          <p class="text-white/50 text-xs uppercase tracking-widest mt-1">Réussies</p>
        </div>
        <div class="flex-1 rounded-xl p-4 text-center" style="background: rgba(0,0,0,0.3)">
          <p class="text-2xl font-bold" style="color: #ff6060">{{ stats.failures }}</p>
          <p class="text-white/50 text-xs uppercase tracking-widest mt-1">Échouées</p>
        </div>
      </div>

      <!-- Barre de progression -->
      <div class="w-full max-w-xs">
        <div class="flex justify-between text-xs text-white/50 uppercase tracking-widest mb-2">
          <span>Progression</span>
          <span>{{ progressPercent }} %</span>
        </div>
        <div class="w-full h-4 rounded-full overflow-hidden" style="background: rgba(0,0,0,0.4)">
          <div
            class="h-full rounded-full transition-all duration-500"
            style="background: #00b4c8"
            :style="{ width: progressPercent + '%' }"
          />
        </div>
      </div>

      <!-- Série courante / Meilleure série -->
      <div class="flex gap-3 w-full max-w-xs">
        <div class="flex-1 rounded-xl px-4 py-4 text-center" style="background: rgba(0,0,0,0.3)">
          <p class="text-2xl font-bold" style="color: #f0c040">{{ stats.currentStreak }}</p>
          <p class="text-white/50 text-xs uppercase tracking-widest mt-1">Série en cours</p>
        </div>
        <div class="flex-1 rounded-xl px-4 py-4 text-center" style="background: rgba(0,0,0,0.3)">
          <p class="text-2xl font-bold" style="color: #00d4a0">{{ stats.bestStreak }}</p>
          <p class="text-white/50 text-xs uppercase tracking-widest mt-1">Meilleure série</p>
        </div>
      </div>
      <p v-if="stats.currentStreak >= stats.objectif" class="font-bold text-sm" style="color: #00d4a0">
        Félicitations — objectif atteint !
      </p>

      <!-- Historique -->
      <div v-if="recentSessions.length" class="w-full max-w-xs flex flex-col gap-2">
        <p class="text-white/40 text-xs uppercase tracking-widest mb-1">10 dernières sessions</p>
        <div
          v-for="(session, i) in recentSessions"
          :key="i"
          class="flex items-center gap-3 px-4 py-3 rounded-xl"
          style="background: rgba(0,0,0,0.25)"
        >
          <svg v-if="session.success" viewBox="0 0 24 24" class="w-5 h-5 shrink-0 fill-current" style="color: #00d4a0">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" class="w-5 h-5 shrink-0 fill-current" style="color: #ff6060">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
          </svg>
          <span class="text-xs font-bold shrink-0" :style="session.success ? 'color: #00d4a0' : 'color: #ff6060'">
            {{ session.success ? "Réussie" : "Échouée" }}
          </span>
          <span class="text-white/40 text-xs">{{ formatDate(session.date) }}</span>
        </div>
      </div>
      <p v-else class="text-white/40 text-sm text-center">Aucune session pour l'instant</p>

      <!-- Actions -->
      <div class="flex gap-4 w-full max-w-xs mt-1">
        <button
          class="flex-1 px-6 py-4 rounded-xl text-white text-sm font-bold tracking-wide transition-colors border"
          style="background: rgba(0,180,200,0.22); border-color: rgba(0,180,200,0.5)"
          @click="navigate('ScreenAccueil')"
        >
          Commencer
        </button>
        <button
          class="px-5 py-4 rounded-xl text-white/70 font-bold tracking-wide transition-colors border"
          style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2)"
          @click="navigate('ScreenAccueil')"
        >
          Retour
        </button>
      </div>

    </div>
  </AtmScreenLayout>
</template>
