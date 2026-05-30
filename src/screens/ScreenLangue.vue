<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import AtmScreenLayout from "../components/AtmScreenLayout.vue";
import { useAtmI18n } from "../composables/useAtmI18n.js";
import { chooseAtmLocale } from "../composables/useAtmLocale.js";
import { useAtmState } from "../composables/useAtmState.js";

const { navigate } = useAtmState();
const { at } = useAtmI18n();
const { locale } = useI18n(); // appLocale (interface) → ordre des choix

// Langue DU DAB simulé (axe B). Choisir une langue fixe `atmLocale` puis avance.
// Libellés = autonymes NON traduits. L'ordre favorise la langue d'interface (comme
// un DAB du pays de l'utilisateur) ; Brezhoneg toujours en dernier, désactivé.
const langs = computed(() => {
  const fr = { code: "fr", label: "Français", disabled: false };
  const en = { code: "en", label: "English", disabled: false };
  const br = { code: "br", label: "Brezhoneg", disabled: true };
  const active = locale.value === "en" ? [en, fr] : [fr, en];
  return [...active, br];
});

function selectLang(lang) {
  if (lang.disabled) return;
  chooseAtmLocale(lang.code);
  navigate("ScreenOperation");
}
</script>

<template>
  <AtmScreenLayout :warn="false">
    <div class="flex-1 flex flex-col items-center justify-center gap-8 px-8 py-4">
      <p class="text-xl font-black tracking-widest uppercase text-white">
        {{ at("atm.langue.title") }}
      </p>

      <div class="flex flex-col gap-4 w-full max-w-xs">
        <button
          v-for="lang in langs"
          :key="lang.code"
          class="flex items-center gap-4 w-full px-6 py-4 rounded-xl text-lg font-bold tracking-wide transition-colors border"
          :class="lang.disabled
            ? 'text-white/40 cursor-not-allowed border-white/15'
            : 'text-white'"
          :style="lang.disabled
            ? 'background: rgba(255,255,255,0.06)'
            : 'background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.4)'"
          :disabled="lang.disabled"
          @click="selectLang(lang)"
        >
          <!-- Drapeau France -->
          <svg v-if="lang.code === 'fr'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" class="w-10 h-7 rounded shrink-0">
            <rect width="20" height="40" fill="#002395" />
            <rect x="20" width="20" height="40" fill="#fff" />
            <rect x="40" width="20" height="40" fill="#ED2939" />
          </svg>
          <!-- Drapeau Royaume-Uni -->
          <svg v-else-if="lang.code === 'en'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" class="w-10 h-7 rounded shrink-0">
            <rect width="60" height="40" fill="#012169" />
            <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" stroke-width="8" />
            <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" stroke-width="4" />
            <path d="M30,0 V40 M0,20 H60" stroke="#fff" stroke-width="12" />
            <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" stroke-width="6" />
          </svg>
          <!-- Drapeau Bretagne (Gwenn-ha-du) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" class="w-10 h-7 rounded shrink-0 opacity-50">
            <rect width="60" height="40" fill="#fff" />
            <rect y="3.6" width="60" height="3.6" fill="#000" />
            <rect y="10.9" width="60" height="3.6" fill="#000" />
            <rect y="18.2" width="60" height="3.6" fill="#000" />
            <rect y="25.5" width="60" height="3.6" fill="#000" />
            <rect y="32.8" width="60" height="3.6" fill="#000" />
            <rect width="24" height="22" fill="#000" />
            <circle cx="8" cy="7" r="2" fill="#fff" />
            <circle cx="16" cy="7" r="2" fill="#fff" />
            <circle cx="12" cy="14" r="2" fill="#fff" />
          </svg>
          {{ lang.label }}
        </button>
      </div>
    </div>
  </AtmScreenLayout>
</template>
