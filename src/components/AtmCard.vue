<script setup>
// Visual bank card — clickable blue rectangle with golden chip (SVG)
// Represents the physical card the user inserts into the ATM
const emit = defineEmits(["insert"]);
</script>

<template>
  <button
    class="w-64 h-40 bg-blue-600 rounded-xl shadow-lg flex flex-col justify-between p-4 cursor-pointer hover:bg-blue-700 transition-colors"
    @click="emit('insert')"
  >
    <!-- Chip -->
    <div class="w-10 h-8 bg-yellow-400 rounded-sm" />
    <!-- Card number placeholder -->
    <div class="text-white font-mono text-sm tracking-widest">•••• •••• •••• ••••</div>
  </button>
</template>
