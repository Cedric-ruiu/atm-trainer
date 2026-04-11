<script setup>
defineProps({
  warn: { type: Boolean, default: true },
});
</script>

<template>
  <div
    class="min-h-full flex flex-col"
    style="background: linear-gradient(160deg, #2457a0 0%, #1a3878 50%, #152e60 100%)"
  >
    <!-- Header : logo banque -->
    <div class="flex items-center px-5 pt-3 pb-2 shrink-0">
      <div class="leading-none">
        <p class="text-[9px] font-bold tracking-[0.35em] uppercase text-white/50">MA</p>
        <p class="text-base font-black tracking-[0.2em] uppercase text-white leading-none">BANQUE</p>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="flex-1 flex min-h-0">
      <slot />
    </div>

    <!-- Barre basse VIGILANCE FRAUDE -->
    <div
      v-if="warn"
      class="px-5 py-2 shrink-0"
      style="background: #0d1a2e"
    >
      <span
        class="text-[10px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded"
        style="color: #d4900a; background: rgba(212,144,10,0.15)"
      >VIGILANCE FRAUDE</span>
      <p class="text-white/70 text-xs mt-0.5">
        Protégez votre code secret lors de la saisie
      </p>
    </div>
  </div>
</template>
