<script setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div class="rounded-xl border border-gray-200 p-4 shadow-sm">
    <h2 v-if="title" class="text-lg font-semibold mb-2">{{ title }}</h2>
    <slot />
  </div>
</template>
