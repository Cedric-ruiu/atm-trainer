<script setup>
import { computed } from "vue";

const props = defineProps({
  portrait: Boolean,
  placement: { type: String, default: "reader" }, // "reader" | "pocket"
  isDragging: Boolean,
  dragX: Number,
  dragY: Number,
  cardFloating: Boolean,
  floatX: Number,
  floatY: Number,
  doDown: Function,
  doMove: Function,
  doUp: Function,
  doCancel: Function,
});

// Dimensions come from CSS custom properties — no JS constants needed.
const btnStyle = computed(() => {
  if (props.isDragging)
    return `position:fixed; left:${props.dragX}px; top:${props.dragY}px; width:var(--card-w); height:var(--card-h); transform:translate(-50%,-50%); z-index:var(--z-dragging); cursor:grabbing;`;
  if (props.cardFloating)
    return `position:fixed; left:${props.floatX}px; top:${props.floatY}px; width:var(--card-w); height:var(--card-h); transform:translate(-50%,-50%); z-index:var(--z-floating); cursor:grab;`;
  if (props.placement === "pocket")
    return `cursor:grab; width:var(--card-w); height:var(--card-h); display:block;`;
  return `position:absolute; bottom:0; left:0; width:var(--card-w); height:var(--card-h); cursor:grab;`;
});

// Stable wrappers — guarantee the prop function is invoked at runtime.
// Member expressions like `props.doDown` in @event bindings can behave
// unexpectedly across Vue compiler modes.
const handleDown   = (e) => props.doDown?.(e);
const handleMove   = (e) => props.doMove?.(e);
const handleUp     = (e) => props.doUp?.(e);
const handleCancel = (e) => props.doCancel?.(e);
</script>

<template>
  <Teleport to="body" :disabled="!isDragging && !cardFloating">
  <button
    class="touch-none select-none"
    :style="btnStyle"
    @pointerdown="handleDown"
    @pointermove="handleMove"
    @pointerup="handleUp"
    @pointercancel="handleCancel"
  >
    <!-- Portrait simplified -->
    <svg v-if="portrait" viewBox="0 0 540 856" xmlns="http://www.w3.org/2000/svg" class="rounded drop-shadow-xl" style="width:var(--card-w);height:var(--card-h);display:block;">
      <defs>
        <linearGradient id="dc-cb-pt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#1a3a6e"/>
          <stop offset="50%"  stop-color="#0d2247"/>
          <stop offset="100%" stop-color="#162d5a"/>
        </linearGradient>
        <linearGradient id="dc-cg-pt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#e8c84a"/>
          <stop offset="40%"  stop-color="#c8a020"/>
          <stop offset="100%" stop-color="#e0b830"/>
        </linearGradient>
        <clipPath id="dc-cc-pt"><rect width="540" height="856" rx="40"/></clipPath>
      </defs>
      <rect width="540" height="856" rx="40" fill="url(#dc-cb-pt)"/>
      <rect x="0" y="0" width="540" height="68" fill="#080810" opacity="0.9" clip-path="url(#dc-cc-pt)"/>
      <text x="42" y="124" font-family="sans-serif" font-size="40" font-weight="700" fill="rgba(255,255,255,0.9)">ADAPT BANK</text>
      <rect x="42"  y="190" width="130" height="103" rx="10" fill="url(#dc-cg-pt)"/>
      <rect x="56"  y="204" width="102" height="75"  rx="5"  fill="#b89018"/>
      <text x="42" y="530" font-family="monospace" font-size="36" fill="rgba(255,255,255,0.85)" letter-spacing="3">••••  ••••</text>
      <text x="42" y="590" font-family="monospace" font-size="36" fill="rgba(255,255,255,0.85)" letter-spacing="3">••••  ••••</text>
      <rect width="540" height="856" rx="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
    </svg>

    <!-- Landscape full detail -->
    <svg v-else viewBox="0 0 540 856" xmlns="http://www.w3.org/2000/svg" class="rounded drop-shadow-xl" style="width:var(--card-w);height:var(--card-h);display:block;">
      <defs>
        <linearGradient id="dc-cb-ls" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#1a3a6e"/>
          <stop offset="50%"  stop-color="#0d2247"/>
          <stop offset="100%" stop-color="#162d5a"/>
        </linearGradient>
        <linearGradient id="dc-cg-ls" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#e8c84a"/>
          <stop offset="40%"  stop-color="#c8a020"/>
          <stop offset="100%" stop-color="#e0b830"/>
        </linearGradient>
        <linearGradient id="dc-ch-ls" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#c0a0ff" stop-opacity="0.75"/>
          <stop offset="50%"  stop-color="#80e8ff" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#ff80c0" stop-opacity="0.75"/>
        </linearGradient>
        <clipPath id="dc-cc-ls"><rect width="540" height="856" rx="40"/></clipPath>
      </defs>
      <rect width="540" height="856" rx="40" fill="url(#dc-cb-ls)"/>
      <g clip-path="url(#dc-cc-ls)" opacity="0.06">
        <line x1="-100" y1="856" x2="656"  y2="0"   stroke="white" stroke-width="50"/>
        <line x1="100"  y1="856" x2="856"  y2="0"   stroke="white" stroke-width="50"/>
        <line x1="300"  y1="856" x2="1056" y2="0"   stroke="white" stroke-width="50"/>
      </g>
      <rect x="0" y="0" width="540" height="68" fill="#080810" opacity="0.9" clip-path="url(#dc-cc-ls)"/>
      <text x="42" y="124" font-family="sans-serif" font-size="40" font-weight="700" fill="rgba(255,255,255,0.9)" letter-spacing="2">ADAPT BANK</text>
      <rect x="42"  y="190" width="130" height="103" rx="10" fill="url(#dc-cg-ls)"/>
      <rect x="56"  y="204" width="102" height="75"  rx="5"  fill="#b89018"/>
      <line x1="107" y1="190" x2="107" y2="204" stroke="#c8a020" stroke-width="4"/>
      <line x1="80"  y1="256" x2="56"  y2="256" stroke="#c8a020" stroke-width="4"/>
      <line x1="134" y1="256" x2="158" y2="256" stroke="#c8a020" stroke-width="4"/>
      <line x1="107" y1="293" x2="107" y2="307" stroke="#c8a020" stroke-width="4"/>
      <line x1="72"  y1="232" x2="142" y2="232" stroke="#d4a830" stroke-width="2" opacity="0.5"/>
      <line x1="72"  y1="272" x2="142" y2="272" stroke="#d4a830" stroke-width="2" opacity="0.5"/>
      <line x1="95"  y1="208" x2="95"  y2="275" stroke="#d4a830" stroke-width="2" opacity="0.5"/>
      <line x1="119" y1="208" x2="119" y2="275" stroke="#d4a830" stroke-width="2" opacity="0.5"/>
      <circle cx="420" cy="250" r="72" fill="url(#dc-ch-ls)" opacity="0.85"/>
      <circle cx="420" cy="250" r="72" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
      <circle cx="420" cy="250" r="55" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <circle cx="420" cy="250" r="38" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      <text x="42" y="530" font-family="monospace" font-size="36" fill="rgba(255,255,255,0.85)" letter-spacing="3">••••  ••••</text>
      <text x="42" y="590" font-family="monospace" font-size="36" fill="rgba(255,255,255,0.85)" letter-spacing="3">••••  ••••</text>
      <text x="42" y="670" font-family="monospace" font-size="28" fill="rgba(255,255,255,0.6)" letter-spacing="2">12/28</text>
      <text x="42" y="720" font-family="monospace" font-size="26" fill="rgba(255,255,255,0.7)" letter-spacing="1">UTILISATEUR ADAPT</text>
      <rect width="540" height="856" rx="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
    </svg>
  </button>
  </Teleport>
</template>
