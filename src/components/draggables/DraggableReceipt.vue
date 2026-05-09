<script setup>
import { computed } from "vue";
import { useSession } from "../../composables/useSession.js";

const props = defineProps({
  portrait: Boolean,
  isReceiptDragging: Boolean,
  dragX: Number,
  dragY: Number,
  receiptFloating: Boolean,
  receiptFloatX: Number,
  receiptFloatY: Number,
  doDown: Function,
  doMove: Function,
  doUp: Function,
  doCancel: Function,
});

const { selectedAmount, solde } = useSession();

const btnStyle = computed(() => {
  if (props.isReceiptDragging)
    return `position:fixed; left:${props.dragX}px; top:${props.dragY}px; width:var(--receipt-w); height:var(--receipt-h); transform:translate(-50%,-50%); z-index:var(--z-dragging); cursor:grabbing;`;
  if (props.receiptFloating)
    return `position:fixed; left:${props.receiptFloatX}px; top:${props.receiptFloatY}px; width:var(--receipt-w); height:var(--receipt-h); transform:translate(-50%,-50%); z-index:var(--z-floating); cursor:grab;`;
  return `position:absolute; top:0; left:0; width:var(--receipt-w); height:var(--receipt-h); cursor:grab;`;
});

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
    <svg viewBox="0 0 520 1400" xmlns="http://www.w3.org/2000/svg"
         style="width:var(--receipt-w); height:var(--receipt-h); display:block; filter:drop-shadow(0 3px 8px rgba(0,0,0,0.55));">
      <rect width="520" height="1400" fill="#fdfcf8"/>
      <rect width="520" height="22" fill="#ede9df"/>
      <circle cx="30"  cy="11" r="7" fill="#d0ccba"/>
      <circle cx="260" cy="11" r="7" fill="#d0ccba"/>
      <circle cx="490" cy="11" r="7" fill="#d0ccba"/>
      <text x="260" y="74" text-anchor="middle" font-family="monospace" font-size="52" font-weight="900" fill="#111" letter-spacing="2">BANQUE ADAPT</text>
      <line x1="40" y1="92" x2="480" y2="92" stroke="#ccc" stroke-width="2"/>
      <text x="40" y="128" font-family="monospace" font-size="27" fill="#555">11/04/2026  14:32</text>
      <text x="40" y="162" font-family="monospace" font-size="27" fill="#555">DAB 75001-PARIS</text>
      <line x1="40" y1="184" x2="480" y2="184" stroke="#bbb" stroke-width="1" stroke-dasharray="8 5"/>
      <text x="40" y="226" font-family="monospace" font-size="34" font-weight="700" fill="#222">RETRAIT DAB</text>
      <text x="260" y="314" text-anchor="middle" font-family="monospace" font-size="84" font-weight="900" fill="#111">{{ selectedAmount || 0 }} €</text>
      <line x1="40" y1="342" x2="480" y2="342" stroke="#bbb" stroke-width="1" stroke-dasharray="8 5"/>
      <text x="40"  y="378" font-family="monospace" font-size="26" fill="#666">Solde disponible :</text>
      <text x="480" y="378" text-anchor="end" font-family="monospace" font-size="28" font-weight="700" fill="#333">{{ solde }} €</text>
      <line x1="40" y1="400" x2="480" y2="400" stroke="#ccc" stroke-width="2"/>
      <text x="260" y="444" text-anchor="middle" font-family="monospace" font-size="28" fill="#888">Merci de votre visite</text>
      <text x="260" y="478" text-anchor="middle" font-family="monospace" font-size="23" fill="#aaa">banque-adapt.fr</text>
      <g transform="translate(75, 510)">
        <rect x="0"   width="6"  height="72" fill="#1a1a1a"/><rect x="11"  width="12" height="72" fill="#1a1a1a"/>
        <rect x="28"  width="6"  height="72" fill="#1a1a1a"/><rect x="38"  width="18" height="72" fill="#1a1a1a"/>
        <rect x="62"  width="6"  height="72" fill="#1a1a1a"/><rect x="72"  width="10" height="72" fill="#1a1a1a"/>
        <rect x="86"  width="6"  height="72" fill="#1a1a1a"/><rect x="96"  width="15" height="72" fill="#1a1a1a"/>
        <rect x="116" width="6"  height="72" fill="#1a1a1a"/><rect x="126" width="10" height="72" fill="#1a1a1a"/>
        <rect x="140" width="6"  height="72" fill="#1a1a1a"/><rect x="150" width="12" height="72" fill="#1a1a1a"/>
        <rect x="167" width="6"  height="72" fill="#1a1a1a"/><rect x="177" width="18" height="72" fill="#1a1a1a"/>
        <rect x="200" width="6"  height="72" fill="#1a1a1a"/><rect x="210" width="10" height="72" fill="#1a1a1a"/>
        <rect x="224" width="6"  height="72" fill="#1a1a1a"/><rect x="234" width="15" height="72" fill="#1a1a1a"/>
        <rect x="254" width="6"  height="72" fill="#1a1a1a"/><rect x="264" width="10" height="72" fill="#1a1a1a"/>
        <rect x="278" width="6"  height="72" fill="#1a1a1a"/><rect x="288" width="12" height="72" fill="#1a1a1a"/>
        <rect x="305" width="6"  height="72" fill="#1a1a1a"/><rect x="315" width="18" height="72" fill="#1a1a1a"/>
        <rect x="338" width="6"  height="72" fill="#1a1a1a"/><rect x="348" width="10" height="72" fill="#1a1a1a"/>
        <rect x="362" width="6"  height="72" fill="#1a1a1a"/>
      </g>
      <text x="260" y="622" text-anchor="middle" font-family="monospace" font-size="22" fill="#555" letter-spacing="4">2604 2026 0001</text>
      <rect x="0" y="1360" width="520" height="40" fill="#ede9df"/>
    </svg>
  </button>
</template>
