<script setup>
import { computed } from "vue";
import { useSession } from "../../composables/useSession.js";

const props = defineProps({
  portrait: Boolean,
  isBillsDragging: Boolean,
  dragX: Number,
  dragY: Number,
  billsFloating: Boolean,
  billsFloatX: Number,
  billsFloatY: Number,
  doDown: Function,
  doMove: Function,
  doUp: Function,
  doCancel: Function,
});

const { selectedAmount } = useSession();

const btnStyle = computed(() => {
  if (props.isBillsDragging)
    return `position:fixed; left:${props.dragX}px; top:${props.dragY}px; width:var(--bills-w); height:var(--bills-h); transform:translate(-50%,-50%); z-index:var(--z-dragging); cursor:grabbing;`;
  if (props.billsFloating)
    return `position:fixed; left:${props.billsFloatX}px; top:${props.billsFloatY}px; width:var(--bills-w); height:var(--bills-h); transform:translate(-50%,-50%); z-index:var(--z-floating); cursor:grab;`;
  return `position:absolute; bottom:0; left:0; width:var(--bills-w); height:var(--bills-h); cursor:grab;`;
});

const billsBreakdown = computed(() => {
  let remaining = selectedAmount.value || 0;
  const bills = [];
  for (const denom of [50, 20, 10]) {
    const count = Math.floor(remaining / denom);
    for (let i = 0; i < count; i++) bills.push(denom);
    remaining -= count * denom;
  }
  return bills;
});

function billBgColor(denom) {
  if (denom === 50) return "#F08C10";
  if (denom === 20) return "#2062C8";
  return "#D43030";
}

const gradId = computed(() => props.portrait ? "db-pt-grad" : "db-ls-grad");

const handleDown   = (e) => props.doDown?.(e);
const handleMove   = (e) => props.doMove?.(e);
const handleUp     = (e) => props.doUp?.(e);
const handleCancel = (e) => props.doCancel?.(e);
</script>

<template>
  <button
    class="touch-none select-none"
    :style="btnStyle"
    @pointerdown="handleDown"
    @pointermove="handleMove"
    @pointerup="handleUp"
    @pointercancel="handleCancel"
  >
    <svg viewBox="0 0 1290 690" xmlns="http://www.w3.org/2000/svg"
         style="width:var(--bills-w); height:var(--bills-h); display:block; filter:drop-shadow(0 4px 12px rgba(0,0,0,0.65));">
      <defs>
        <linearGradient :id="gradId" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%"   :stop-color="billsBreakdown[0] === 50 ? '#F09218' : billsBreakdown[0] === 20 ? '#2368D0' : '#DC3232'"/>
          <stop offset="100%" :stop-color="billsBreakdown[0] === 50 ? '#C86808' : billsBreakdown[0] === 20 ? '#1448B0' : '#AA1414'"/>
        </linearGradient>
      </defs>
      <rect v-if="billsBreakdown.length >= 3" x="20" y="20" width="1270" height="670" rx="12" :fill="billBgColor(billsBreakdown[2])" opacity="0.85"/>
      <rect v-if="billsBreakdown.length >= 3" x="20" y="20" width="1270" height="670" rx="12" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="6"/>
      <rect v-if="billsBreakdown.length >= 2" x="10" y="10" width="1270" height="670" rx="12" :fill="billBgColor(billsBreakdown[1])" opacity="0.9"/>
      <rect v-if="billsBreakdown.length >= 2" x="10" y="10" width="1270" height="670" rx="12" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="5"/>
      <g v-if="billsBreakdown.length > 0">
        <rect width="1270" height="670" rx="12" :fill="`url(#${gradId})`"/>
        <rect width="370" height="670" rx="12" fill="rgba(0,0,0,0.13)"/>
        <rect x="350" y="0" width="10" height="670" fill="rgba(255,255,255,0.14)"/>
        <circle cx="160" cy="335" r="92" fill="none" stroke="rgba(255,220,50,0.22)" stroke-width="3"/>
        <text x="160" y="247" text-anchor="middle" dominant-baseline="central" font-size="36" fill="rgba(255,220,50,0.9)">★</text>
        <text x="204" y="259" text-anchor="middle" dominant-baseline="central" font-size="36" fill="rgba(255,220,50,0.9)">★</text>
        <text x="236" y="291" text-anchor="middle" dominant-baseline="central" font-size="36" fill="rgba(255,220,50,0.9)">★</text>
        <text x="248" y="335" text-anchor="middle" dominant-baseline="central" font-size="36" fill="rgba(255,220,50,0.9)">★</text>
        <text x="236" y="379" text-anchor="middle" dominant-baseline="central" font-size="36" fill="rgba(255,220,50,0.9)">★</text>
        <text x="204" y="411" text-anchor="middle" dominant-baseline="central" font-size="36" fill="rgba(255,220,50,0.9)">★</text>
        <text x="160" y="423" text-anchor="middle" dominant-baseline="central" font-size="36" fill="rgba(255,220,50,0.9)">★</text>
        <text x="116" y="411" text-anchor="middle" dominant-baseline="central" font-size="36" fill="rgba(255,220,50,0.9)">★</text>
        <text x="84"  y="379" text-anchor="middle" dominant-baseline="central" font-size="36" fill="rgba(255,220,50,0.9)">★</text>
        <text x="72"  y="335" text-anchor="middle" dominant-baseline="central" font-size="36" fill="rgba(255,220,50,0.9)">★</text>
        <text x="84"  y="291" text-anchor="middle" dominant-baseline="central" font-size="36" fill="rgba(255,220,50,0.9)">★</text>
        <text x="116" y="259" text-anchor="middle" dominant-baseline="central" font-size="36" fill="rgba(255,220,50,0.9)">★</text>
        <text x="160" y="570" text-anchor="middle" font-family="sans-serif" font-size="34" fill="rgba(255,255,255,0.55)" letter-spacing="6">BCE ECB</text>
        <rect x="430" y="140" width="200" height="380" fill="rgba(255,255,255,0.05)"/>
        <path d="M430 270 Q530 150 630 270" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="8"/>
        <rect x="465" y="290" width="55" height="230" fill="rgba(255,255,255,0.09)"/>
        <rect x="540" y="290" width="55" height="230" fill="rgba(255,255,255,0.09)"/>
        <rect x="440" y="510" width="180" height="22" fill="rgba(255,255,255,0.12)"/>
        <circle cx="1130" cy="220" r="85" fill="rgba(255,255,255,0.07)"/>
        <circle cx="1130" cy="220" r="85" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="3"/>
        <circle cx="1130" cy="220" r="55" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
        <text x="960" y="470" text-anchor="middle" font-family="serif" font-size="340" font-weight="900" fill="rgba(255,255,255,0.96)">{{ billsBreakdown[0] }}</text>
        <text x="960" y="570" text-anchor="middle" font-family="sans-serif" font-size="58" fill="rgba(255,255,255,0.78)" letter-spacing="18">EURO</text>
        <text x="640" y="46" font-family="sans-serif" font-size="28" fill="rgba(255,255,255,0.5)" letter-spacing="4">BANQUE CENTRALE EUROPÉENNE  •  EUROPEAN CENTRAL BANK</text>
        <text x="420" y="638" font-family="monospace" font-size="34" fill="rgba(255,255,255,0.6)" letter-spacing="3">EA{{ billsBreakdown[0] }}2345678901 B</text>
        <rect x="0" y="645" width="1270" height="25" fill="rgba(0,0,0,0.2)"/>
        <rect width="1270" height="670" rx="12" fill="none" stroke="rgba(0,0,0,0.4)" stroke-width="8"/>
        <rect x="14" y="14" width="1242" height="642" rx="8" fill="none" stroke="rgba(255,255,255,0.13)" stroke-width="3"/>
      </g>
    </svg>
  </button>
</template>
