<script setup>
import { useI18n } from "vue-i18n";
import ProjectInfo from "./ProjectInfo.vue";

defineProps({ modelValue: Boolean });
defineEmits(["update:modelValue"]);

const { t } = useI18n();
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
      @click.self="$emit('update:modelValue', false)"
    >
      <div
        class="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl text-white"
        style="background: #1a1e24; box-shadow: 0 20px 60px rgba(0,0,0,0.7);"
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
      >
        <!-- Close button -->
        <button
          class="btn absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-lg font-light"
          :aria-label="t('intro.close')"
          @click="$emit('update:modelValue', false)"
        >×</button>

        <ProjectInfo title-id="info-modal-title" />
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
