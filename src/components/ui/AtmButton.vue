<script setup>
defineProps({
  variant: {
    type: String,
    default: "primary",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click"]);
</script>

<template>
  <button
    :disabled="disabled"
    class="px-4 py-2 rounded font-semibold"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>
