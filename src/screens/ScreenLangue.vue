<script setup>
import AtmScreenLayout from "../components/AtmScreenLayout.vue";
import { useAtmState } from "../composables/useAtmState.js";

const { navigate } = useAtmState();
</script>

<template>
  <AtmScreenLayout :warn="false">
    <div class="flex-1 flex flex-col items-center justify-center gap-8 px-8 py-4">
      <h1 class="text-xl font-black tracking-widest uppercase text-white">
        CHOISISSEZ VOTRE LANGUE
      </h1>

      <div class="flex flex-col gap-4 w-full max-w-xs">
        <!-- Français — actif -->
        <button
          class="flex items-center gap-4 w-full px-6 py-4 rounded-xl text-white text-lg font-bold tracking-wide transition-colors border"
          style="background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.4)"
          @click="navigate('ScreenOperation')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" class="w-10 h-7 rounded shrink-0">
            <rect width="20" height="40" fill="#002395" />
            <rect x="20" width="20" height="40" fill="#fff" />
            <rect x="40" width="20" height="40" fill="#ED2939" />
          </svg>
          Français
        </button>

        <!-- English — inactif -->
        <button
          class="flex items-center gap-4 w-full px-6 py-4 rounded-xl text-white/40 text-lg font-bold tracking-wide cursor-not-allowed border border-white/15"
          style="background: rgba(255,255,255,0.06)"
          disabled
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" class="w-10 h-7 rounded shrink-0 opacity-50">
            <rect width="60" height="40" fill="#012169" />
            <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" stroke-width="8" />
            <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" stroke-width="4" />
            <path d="M30,0 V40 M0,20 H60" stroke="#fff" stroke-width="12" />
            <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" stroke-width="6" />
          </svg>
          English
        </button>

        <!-- Brezhoneg — inactif -->
        <button
          class="flex items-center gap-4 w-full px-6 py-4 rounded-xl text-white/40 text-lg font-bold tracking-wide cursor-not-allowed border border-white/15"
          style="background: rgba(255,255,255,0.06)"
          disabled
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" class="w-10 h-7 rounded shrink-0 opacity-50">
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
          Brezhoneg
        </button>
      </div>
    </div>
  </AtmScreenLayout>
</template>
