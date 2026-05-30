<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import InfoModal from "../InfoModal.vue";
import PinSettingsModal from "../PinSettingsModal.vue";
import StatsModal from "../StatsModal.vue";
import LanguageSwitcher from "../ui/LanguageSwitcher.vue";

const { t } = useI18n();

const showInfo = ref(false);
const showSettings = ref(false);
const showStats = ref(false);
</script>

<template>
  <div class="fixed top-3 left-3 flex items-center gap-1.5" style="z-index:var(--z-menu)">
    <!-- Settings -->
    <button
      class="w-6 h-6 rounded-full border border-gray-400 text-gray-300 flex items-center justify-center opacity-40 hover:opacity-70 active:opacity-90 transition-opacity cursor-pointer touch-manipulation"
      style="background: rgba(255,255,255,0.06);"
      :aria-label="t('menu.settings')"
      @click="showSettings = true"
    >
      <svg viewBox="0 0 20 20" class="w-3 h-3 fill-current">
        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
      </svg>
    </button>
    <!-- Stats -->
    <button
      class="w-6 h-6 rounded-full border border-gray-400 text-gray-300 flex items-center justify-center opacity-40 hover:opacity-70 active:opacity-90 transition-opacity cursor-pointer touch-manipulation"
      style="background: rgba(255,255,255,0.06);"
      :aria-label="t('menu.stats')"
      @click="showStats = true"
    >
      <svg viewBox="0 0 20 20" class="w-3 h-3 fill-current">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
      </svg>
    </button>
    <!-- Info -->
    <button
      class="w-6 h-6 rounded-full border border-gray-400 text-gray-300 text-[11px] font-bold flex items-center justify-center opacity-40 hover:opacity-70 active:opacity-90 transition-opacity cursor-pointer touch-manipulation"
      style="background: rgba(255,255,255,0.06);"
      :aria-label="t('menu.info')"
      @click="showInfo = true"
    >i</button>

    <!-- Switch de langue d'interface — discret, à côté des boutons accompagnateur -->
    <LanguageSwitcher variant="menu" />

    <PinSettingsModal v-model="showSettings" />
    <StatsModal v-model="showStats" />
    <InfoModal v-model="showInfo" />
  </div>
</template>
