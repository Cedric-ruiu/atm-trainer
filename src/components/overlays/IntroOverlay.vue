<script setup>
import { onMounted, ref } from "vue";
import ProjectInfo from "../ProjectInfo.vue";

const STORAGE_KEY = "atm-trainer-intro-seen";

// Au build SSG (pas de `window`) et pour tout visiteur/crawler sans flag → ouverte.
// Le HTML statique embarque donc le contenu *ouvert* : indexable sans exécuter de JS,
// et Googlebot (localStorage non persisté entre crawls) le voit toujours.
const visible = ref(
  typeof window === "undefined" || localStorage.getItem(STORAGE_KEY) !== "1",
);

const startBtn = ref(null);

onMounted(() => {
  // L'attribut data-intro-seen posé par le script inline du <head> n'était qu'un
  // pont anti-flash pré-hydratation : l'état réactif prend désormais le relais.
  document.documentElement.removeAttribute("data-intro-seen");
  if (visible.value) startBtn.value?.focus();
});

function close() {
  visible.value = false;
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch (e) {}
}
</script>

<template>
  <div
    v-show="visible"
    class="atm-intro-overlay fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="intro-title"
    @click.self="close"
    @keydown.esc="close"
  >
    <div
      class="relative w-full max-w-3xl h-[94dvh] flex flex-col overflow-hidden rounded-2xl text-white"
      style="background: #1a1e24; box-shadow: 0 20px 60px rgba(0,0,0,0.7);"
    >
      <!-- Close button -->
      <button
        class="btn absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xl font-light"
        aria-label="Fermer"
        @click="close"
      >×</button>

      <!-- Contenu défilant -->
      <div class="flex-1 overflow-y-auto overscroll-contain">
        <ProjectInfo title-id="intro-title" />
      </div>

      <!-- Pied fixe : CTA toujours visible, sans scroll -->
      <div class="shrink-0 border-t border-white/10 p-4" style="background: #1a1e24;">
        <button
          ref="startBtn"
          class="btn w-full px-4 py-3 rounded-lg text-base font-bold text-white"
          style="background: #2457a0;"
          @click="close"
        >
          Démarrer
        </button>
      </div>
    </div>
  </div>
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
