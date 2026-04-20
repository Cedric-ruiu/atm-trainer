<script setup>
import { computed, onMounted, onUnmounted, provide, ref, watch } from "vue";
import { useAtmState } from "../composables/useAtmState.js";
import { useSession } from "../composables/useSession.js";
import AtmKeypad from "./AtmKeypad.vue";
import InfoModal from "./InfoModal.vue";
import PinSettingsModal from "./PinSettingsModal.vue";
import StatsModal from "./StatsModal.vue";

const { currentScreen } = useAtmState();
const showInfo = ref(false);
const showSettings = ref(false);
const showStats = ref(false);
const { selectedAmount, solde } = useSession();

// ── Chassis reactive state ────────────────────────────────────────────────────
const cardVisible = ref(false);
const receiptVisible = ref(false);
const billsVisible = ref(false);
const onCardClick = ref(null);
const onReceiptClick = ref(null);
const onBillsClick = ref(null);
const keypadBus = ref(null);
const cardInReader = ref(false);

// ── Receipt drag & drop state ─────────────────────────────────────────────────
const receiptFloating = ref(false);
const receiptFloatX = ref(0);
const receiptFloatY = ref(0);
const receiptEjecting = ref(false);
const isReceiptDragging = ref(false);

// Receipt rendered dimensions per orientation
const RECEIPT_W_LS = 70;
const RECEIPT_H_LS = 190; // 30% visible = 57px
const RECEIPT_W_PT = 54;
const RECEIPT_H_PT = 145; // 30% visible = 43px

// ── Bills drag & drop state ───────────────────────────────────────────────────
const billsFloating = ref(false);
const billsFloatX = ref(0);
const billsFloatY = ref(0);
const isBillsDragging = ref(false);

// Bills rendered dimensions per orientation (landscape 2:1 ratio euro bill)
const BILLS_W_LS = 275;
const BILLS_H_LS = 145; // ~2/3 visible = 97px
const BILLS_W_PT = 190;
const BILLS_H_PT = 100; // ~2/3 visible = 67px

// Denomination breakdown for bill SVG display (greedy: 50 → 20 → 10)
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
  return "#D43030"; // 10€
}

provide("cardVisible", cardVisible);
provide("receiptVisible", receiptVisible);
provide("billsVisible", billsVisible);
provide("onCardClick", onCardClick);
provide("onReceiptClick", onReceiptClick);
provide("onBillsClick", onBillsClick);
provide("keypadBus", keypadBus);
provide("cardInReader", cardInReader);

watch(
  currentScreen,
  () => {
    cardVisible.value = false;
    receiptVisible.value = false;
    billsVisible.value = false;
    onCardClick.value = null;
    onReceiptClick.value = null;
    onBillsClick.value = null;
    keypadBus.value = null;
    cardInReader.value = false;
    cardFloating.value = false;
    ejecting.value = false;
    receiptFloating.value = false;
    receiptEjecting.value = false;
    isReceiptDragging.value = false;
    billsFloating.value = false;
    isBillsDragging.value = false;
  },
  { flush: "pre" },
);

// ── Keypad bridge ─────────────────────────────────────────────────────────────
function handleKey(type, payload) {
  keypadBus.value = payload !== undefined ? { type, payload } : { type };
}

// ── Orientation detection ─────────────────────────────────────────────────────
const isPortrait = ref(
  typeof window !== "undefined" &&
    window.matchMedia("(orientation: portrait)").matches,
);
function _onOrientChange(e) {
  isPortrait.value = e.matches;
}
const _mql =
  typeof window !== "undefined"
    ? window.matchMedia("(orientation: portrait)")
    : null;
onMounted(() => _mql?.addEventListener("change", _onOrientChange));
onUnmounted(() => _mql?.removeEventListener("change", _onOrientChange));

// ── Drag & Drop ───────────────────────────────────────────────────────────────
const isDragging = ref(false);
const dragX = ref(0);
const dragY = ref(0);
const dragOffX = ref(0);
const dragOffY = ref(0);
const swallowing = ref(false);
const swallowX = ref(0);
const swallowY = ref(0);
const cardFloating = ref(false); // card dropped mid-air, stays at float position
const floatX = ref(0);
const floatY = ref(0);
const ejecting = ref(false); // ejection animation running (3s)

const readerSlotRef = ref(null);
const pocketZoneRef = ref(null);

// Card rendered dimensions per orientation
const CARD_W_LS = 110;
const CARD_H_LS = 174; // landscape
const CARD_W_PT = 80;
const CARD_H_PT = 127; // portrait

function triggerSwallow(slotRect) {
  swallowX.value = slotRect.left + slotRect.width / 2;
  swallowY.value = dragY.value; // card center at moment of insertion
  cardFloating.value = false;
  swallowing.value = true;
  setTimeout(() => {
    swallowing.value = false;
    cardVisible.value = false;
    cardInReader.value = false;
    onCardClick.value?.();
  }, 3000);
}

function checkInsertionHit(cardCX, cardCY) {
  if (cardInReader.value || swallowing.value || !readerSlotRef.value)
    return false;
  const cardW = isPortrait.value ? CARD_W_PT : CARD_W_LS;
  const cardH = isPortrait.value ? CARD_H_PT : CARD_H_LS;
  const slot = readerSlotRef.value.getBoundingClientRect();

  // Top edge of card
  const cardTop = cardCY - cardH / 2;
  // Vertical: top edge must be inside [slot.top - tolerance, slot.bottom]
  if (cardTop < slot.top - 24 || cardTop > slot.bottom + 4) return false;

  // Horizontal: 80% of card width must overlap the slot horizontally
  const cardLeft = cardCX - cardW / 2;
  const cardRight = cardCX + cardW / 2;
  const ol = Math.max(cardLeft, slot.left);
  const or2 = Math.min(cardRight, slot.right);
  const overlap = Math.max(0, or2 - ol);
  return overlap / cardW >= 0.8;
}

function onCardPointerDown(e) {
  e.preventDefault();
  cardFloating.value = false;
  ejecting.value = false; // stop ejection animation if user grabs during it
  const rect = e.currentTarget.getBoundingClientRect();
  dragOffX.value = e.clientX - (rect.left + rect.width / 2);
  dragOffY.value = e.clientY - (rect.top + rect.height / 2);
  dragX.value = e.clientX - dragOffX.value;
  dragY.value = e.clientY - dragOffY.value;
  isDragging.value = true;
  e.currentTarget.setPointerCapture(e.pointerId);
}

function onCardPointerMove(e) {
  if (!isDragging.value) return;
  const cx = e.clientX - dragOffX.value;
  const cy = e.clientY - dragOffY.value;
  dragX.value = cx;
  dragY.value = cy;

  // Auto-trigger insertion on move (top edge touching slot, 80% centered)
  if (!cardInReader.value && checkInsertionHit(cx, cy)) {
    isDragging.value = false;
    try {
      e.currentTarget?.releasePointerCapture(e.pointerId);
    } catch (_) {}
    triggerSwallow(readerSlotRef.value.getBoundingClientRect());
  }
}

// Ejection: when cardInReader becomes true, animate card coming out of slot (3s)
watch(cardInReader, (inReader) => {
  if (inReader && cardVisible.value) {
    cardFloating.value = false;
    ejecting.value = true;
    setTimeout(() => {
      ejecting.value = false;
    }, 3000);
  }
});

// Ejection: when receiptVisible becomes true, animate receipt coming out of slot (3s)
watch(receiptVisible, (visible) => {
  if (visible) {
    receiptFloating.value = false;
    receiptEjecting.value = true;
    setTimeout(() => {
      receiptEjecting.value = false;
    }, 3000);
  }
});

// Bills appear immediately when billsVisible becomes true (no animation)
watch(billsVisible, (visible) => {
  if (visible) {
    billsFloating.value = false;
  }
});

function onCardPointerUp(e) {
  if (!isDragging.value) return;
  isDragging.value = false;

  const cx = e.clientX - dragOffX.value;
  const cy = e.clientY - dragOffY.value;

  if (!cardInReader.value) {
    // Final check for insertion on release
    if (checkInsertionHit(cx, cy)) {
      triggerSwallow(readerSlotRef.value.getBoundingClientRect());
      return;
    }
    // Not inserted — card stays floating at drop position
    cardFloating.value = true;
    floatX.value = cx;
    floatY.value = cy;
    return;
  }

  // Retrieval: check if dropped on pocket zone
  if (pocketZoneRef.value) {
    const rect = pocketZoneRef.value.getBoundingClientRect();
    if (
      cx >= rect.left &&
      cx <= rect.right &&
      cy >= rect.top &&
      cy <= rect.bottom
    ) {
      cardVisible.value = false;
      cardInReader.value = false;
      cardFloating.value = false;
      onCardClick.value?.();
      return;
    }
  }
  // Not dropped on pocket — card stays floating at drop position
  cardFloating.value = true;
  floatX.value = cx;
  floatY.value = cy;
}

// ── Receipt Drag & Drop ───────────────────────────────────────────────────────
function onReceiptPointerDown(e) {
  if (isDragging.value) return; // card already being dragged
  e.preventDefault();
  receiptFloating.value = false;
  receiptEjecting.value = false;
  const rect = e.currentTarget.getBoundingClientRect();
  dragOffX.value = e.clientX - (rect.left + rect.width / 2);
  dragOffY.value = e.clientY - (rect.top + rect.height / 2);
  dragX.value = e.clientX - dragOffX.value;
  dragY.value = e.clientY - dragOffY.value;
  isReceiptDragging.value = true;
  e.currentTarget.setPointerCapture(e.pointerId);
}

function onReceiptPointerMove(e) {
  if (!isReceiptDragging.value) return;
  dragX.value = e.clientX - dragOffX.value;
  dragY.value = e.clientY - dragOffY.value;
}

function onReceiptPointerUp(e) {
  if (!isReceiptDragging.value) return;
  isReceiptDragging.value = false;
  try { e.currentTarget?.releasePointerCapture(e.pointerId); } catch (_) {}

  const cx = e.clientX - dragOffX.value;
  const cy = e.clientY - dragOffY.value;

  if (pocketZoneRef.value) {
    const rect = pocketZoneRef.value.getBoundingClientRect();
    if (
      cx >= rect.left &&
      cx <= rect.right &&
      cy >= rect.top &&
      cy <= rect.bottom
    ) {
      receiptVisible.value = false;
      receiptFloating.value = false;
      onReceiptClick.value?.();
      return;
    }
  }
  receiptFloating.value = true;
  receiptFloatX.value = cx;
  receiptFloatY.value = cy;
}

// ── Bills Drag & Drop ─────────────────────────────────────────────────────────
function onBillsPointerDown(e) {
  if (isDragging.value || isReceiptDragging.value) return;
  e.preventDefault();
  billsFloating.value = false;
  const rect = e.currentTarget.getBoundingClientRect();
  dragOffX.value = e.clientX - (rect.left + rect.width / 2);
  dragOffY.value = e.clientY - (rect.top + rect.height / 2);
  dragX.value = e.clientX - dragOffX.value;
  dragY.value = e.clientY - dragOffY.value;
  isBillsDragging.value = true;
  e.currentTarget.setPointerCapture(e.pointerId);
}

function onBillsPointerMove(e) {
  if (!isBillsDragging.value) return;
  dragX.value = e.clientX - dragOffX.value;
  dragY.value = e.clientY - dragOffY.value;
}

function onBillsPointerUp(e) {
  if (!isBillsDragging.value) return;
  isBillsDragging.value = false;
  try { e.currentTarget?.releasePointerCapture(e.pointerId); } catch (_) {}

  const cx = e.clientX - dragOffX.value;
  const cy = e.clientY - dragOffY.value;

  if (pocketZoneRef.value) {
    const rect = pocketZoneRef.value.getBoundingClientRect();
    if (
      cx >= rect.left &&
      cx <= rect.right &&
      cy >= rect.top &&
      cy <= rect.bottom
    ) {
      billsVisible.value = false;
      billsFloating.value = false;
      onBillsClick.value?.();
      return;
    }
  }
  billsFloating.value = true;
  billsFloatX.value = cx;
  billsFloatY.value = cy;
}
</script>

<template>
  <div class="min-h-dvh bg-[#2a2e33] flex items-center justify-center p-3">

    <!-- Menu buttons — top-left corner, discrete -->
    <div class="fixed top-3 left-3 z-9400 flex gap-1.5">
      <!-- Settings -->
      <button
        class="w-6 h-6 rounded-full border border-gray-400 text-gray-300 flex items-center justify-center opacity-40 hover:opacity-70 active:opacity-90 transition-opacity cursor-pointer touch-manipulation"
        style="background: rgba(255,255,255,0.06);"
        aria-label="Paramètres du code"
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
        aria-label="Statistiques"
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
        aria-label="Informations sur le projet"
        @click="showInfo = true"
      >i</button>
    </div>

    <!-- Swallow animation overlay -->
    <div v-if="swallowing"
         class="pointer-events-none fixed z-[9999] swallow-card"
         :style="{ left: swallowX + 'px', top: swallowY + 'px', '--ch': (isPortrait ? CARD_H_PT : CARD_H_LS) + 'px' }">
      <svg viewBox="0 0 540 856" xmlns="http://www.w3.org/2000/svg"
           :class="isPortrait ? 'w-[80px] h-[127px]' : 'w-[110px] h-[174px]'"
           class="rounded">
        <defs>
          <linearGradient id="sw-cb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stop-color="#1a3a6e"/>
            <stop offset="50%"  stop-color="#0d2247"/>
            <stop offset="100%" stop-color="#162d5a"/>
          </linearGradient>
        </defs>
        <rect width="540" height="856" rx="40" fill="url(#sw-cb)"/>
        <rect x="0" y="0" width="540" height="68" fill="#080810" opacity="0.9"/>
        <text x="50" y="130" font-family="sans-serif" font-size="42" font-weight="700" fill="rgba(255,255,255,0.9)">ADAPT BANK</text>
        <rect width="540" height="856" rx="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
      </svg>
    </div>

    <!-- ══════════════════════════════════════════════ LANDSCAPE LAYOUT ══════ -->
    <template v-if="!isPortrait">
      <div class="flex flex-col max-w-[1280px] w-full rounded-2xl shadow-2xl overflow-hidden border border-[#888]">

        <!-- Top row: screen (fixed 4:3 height) + chassis fills rest ───────── -->
        <div class="flex flex-row items-stretch">

          <!-- Screen: height drives 4:3 width -->
          <div class="shrink-0 bg-gray-50 flex flex-col overflow-hidden"
               style="aspect-ratio: 4/3; height: min(70dvh, 580px);">
            <slot />
          </div>

          <!-- ── Chassis column — flex-1, all remaining width ───────────── -->
          <div class="flex-1 min-w-0 flex flex-col items-center gap-3 p-4 border-l border-[#888]"
               style="background: linear-gradient(160deg, #c0c0c0 0%, #8e8e8e 25%, #b0b0b0 55%, #c8c8c8 80%, #9a9a9a 100%); box-shadow: inset 1px 0 0 rgba(255,255,255,0.35);">

            <!-- ── 1. Card reader ──────────────────────────────────────── -->
            <div class="w-full flex flex-col items-center gap-1">
              <!-- Housing + card eject in relative wrapper so keypad never shifts -->
              <div class="relative flex flex-col items-center w-full">
                <div class="flex flex-col items-center rounded-lg"
                     style="background: linear-gradient(180deg, #5a6470 0%, #3d4550 40%, #2e3540 100%); padding: 6px 10px 8px; width: 100%; box-shadow: inset 0 2px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.25);">
                  <div style="border: 1px solid rgba(255,255,255,0.12); border-radius: 4px; padding: 6px 8px 0; width: 100%; display:flex; flex-direction:column; align-items:center;">
                    <!-- Slot slit — 120px wide to match 110px card + tolerance -->
                    <div ref="readerSlotRef"
                         class="relative flex items-center justify-center"
                         style="width: 120px; height: 22px; background: #0a0c10; border-radius: 2px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.9), inset 0 0 8px rgba(0,0,0,0.8);">
                      <span v-if="!cardInReader" class="text-[7px] tracking-wider uppercase select-none"
                            style="color: rgba(255,255,255,0.25);">insérer ›</span>
                    </div>
                    <!-- Green LED -->
                    <div class="w-full mt-1 mb-1"
                         style="height: 3px; border-radius: 1px; background: linear-gradient(90deg, transparent 0%, #00e060 20%, #00ff70 50%, #00e060 80%, transparent 100%); box-shadow: 0 0 6px rgba(0,255,80,0.7), 0 0 12px rgba(0,255,80,0.3);" />
                  </div>
                </div>
                <!-- Card ejecting: absolute so keypad never shifts -->
                <div v-if="cardVisible && cardInReader && !swallowing"
                     :class="ejecting ? 'eject-container' : ''"
                     style="--peek-h:52px; position:absolute; top:100%; left:50%; margin-left:-55px; width:110px; height:52px; overflow:hidden;">
                <button
                  class="touch-none select-none"
                  :style="isDragging
                    ? `position:fixed; left:${dragX}px; top:${dragY}px; width:110px; height:174px; transform:translate(-50%,-50%); z-index:9998; cursor:grabbing;`
                    : cardFloating
                      ? `position:fixed; left:${floatX}px; top:${floatY}px; width:110px; height:174px; transform:translate(-50%,-50%); z-index:9997; cursor:grab;`
                      : 'position:absolute; bottom:0; left:0; width:110px; height:174px; cursor:grab;'"
                  @pointerdown="onCardPointerDown"
                  @pointermove="onCardPointerMove"
                  @pointerup="onCardPointerUp"
                >
                    <svg viewBox="0 0 540 856" xmlns="http://www.w3.org/2000/svg" class="w-[110px] h-[174px] rounded drop-shadow-xl">
                      <defs>
                        <linearGradient id="cb" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%"   stop-color="#1a3a6e"/>
                          <stop offset="50%"  stop-color="#0d2247"/>
                          <stop offset="100%" stop-color="#162d5a"/>
                        </linearGradient>
                        <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%"   stop-color="#e8c84a"/>
                          <stop offset="40%"  stop-color="#c8a020"/>
                          <stop offset="100%" stop-color="#e0b830"/>
                        </linearGradient>
                        <linearGradient id="ch" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%"   stop-color="#c0a0ff" stop-opacity="0.75"/>
                          <stop offset="50%"  stop-color="#80e8ff" stop-opacity="0.85"/>
                          <stop offset="100%" stop-color="#ff80c0" stop-opacity="0.75"/>
                        </linearGradient>
                        <clipPath id="cc"><rect width="540" height="856" rx="40"/></clipPath>
                      </defs>
                      <rect width="540" height="856" rx="40" fill="url(#cb)"/>
                      <g clip-path="url(#cc)" opacity="0.06">
                        <line x1="-100" y1="856" x2="656"  y2="0"   stroke="white" stroke-width="50"/>
                        <line x1="100"  y1="856" x2="856"  y2="0"   stroke="white" stroke-width="50"/>
                        <line x1="300"  y1="856" x2="1056" y2="0"   stroke="white" stroke-width="50"/>
                      </g>
                      <rect x="0" y="0" width="540" height="68" fill="#080810" opacity="0.9" clip-path="url(#cc)"/>
                      <text x="42" y="124" font-family="sans-serif" font-size="40" font-weight="700" fill="rgba(255,255,255,0.9)" letter-spacing="2">ADAPT BANK</text>
                      <rect x="42"  y="190" width="130" height="103" rx="10" fill="url(#cg)"/>
                      <rect x="56"  y="204" width="102" height="75"  rx="5"  fill="#b89018"/>
                      <line x1="107" y1="190" x2="107" y2="204" stroke="#c8a020" stroke-width="4"/>
                      <line x1="80"  y1="256" x2="56"  y2="256" stroke="#c8a020" stroke-width="4"/>
                      <line x1="134" y1="256" x2="158" y2="256" stroke="#c8a020" stroke-width="4"/>
                      <line x1="107" y1="293" x2="107" y2="307" stroke="#c8a020" stroke-width="4"/>
                      <line x1="72"  y1="232" x2="142" y2="232" stroke="#d4a830" stroke-width="2" opacity="0.5"/>
                      <line x1="72"  y1="272" x2="142" y2="272" stroke="#d4a830" stroke-width="2" opacity="0.5"/>
                      <line x1="95"  y1="208" x2="95"  y2="275" stroke="#d4a830" stroke-width="2" opacity="0.5"/>
                      <line x1="119" y1="208" x2="119" y2="275" stroke="#d4a830" stroke-width="2" opacity="0.5"/>
                      <circle cx="420" cy="250" r="72" fill="url(#ch)" opacity="0.85"/>
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
              </div>
              </div><!-- end relative wrapper -->
            </div>

            <!-- ── 2. Keypad — grows to fill remaining chassis height ──── -->
            <div class="w-full flex-1 flex flex-col items-center gap-2">
              <!-- No dark housing — sits directly on metallic chassis -->
              <div class="w-full flex-1 flex items-center justify-center rounded-xl p-3">
                <div class="w-full max-w-[300px]">
                  <AtmKeypad
                    @digit="handleKey('digit', $event)"
                    @cancel="handleKey('cancel')"
                    @clear="handleKey('clear')"
                    @confirm="handleKey('confirm')"
                  />
                </div>
              </div>
            </div>

            <!-- ── 3. Receipt slot ─────────────────────────────────────── -->
            <div class="w-full flex flex-col items-center gap-1">
              <!-- Housing + receipt eject in relative wrapper so eject doesn't shift housing -->
              <div class="relative flex flex-col items-center w-full" style="z-index:20">
                <div class="flex flex-col items-center rounded-lg"
                     style="background: linear-gradient(180deg, #5a6470 0%, #3d4550 40%, #2e3540 100%); padding: 6px 10px 8px; width: 100%; box-shadow: inset 0 2px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.25);">
                  <div style="border: 1px solid rgba(255,255,255,0.12); border-radius: 4px; padding: 6px 8px 0; width: 100%; display:flex; flex-direction:column; align-items:center;">
                    <!-- Receipt slot slit — 74px wide to match receipt -->
                    <div class="relative flex items-center justify-center"
                         style="width: 74px; height: 18px; background: #0a0c10; border-radius: 1px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.95);">
                      <span v-if="!receiptVisible" class="text-[7px] tracking-wider uppercase select-none"
                            style="color: rgba(255,255,255,0.22);">reçu</span>
                    </div>
                    <!-- LED line -->
                    <div class="w-full mt-1 mb-1"
                         style="height: 2px; border-radius: 1px; background: linear-gradient(90deg, transparent 0%, #e0a000 20%, #ffc800 50%, #e0a000 80%, transparent 100%); box-shadow: 0 0 5px rgba(255,180,0,0.6);" />
                  </div>
                </div>
                <!-- Receipt ejecting: absolute so housing never shifts -->
                <div v-if="receiptVisible"
                     :class="receiptEjecting ? 'eject-container' : ''"
                     style="--peek-h:57px; position:absolute; top:100%; left:50%; margin-left:-35px; width:70px; height:57px; overflow:hidden;">
                <button
                  class="touch-none select-none"
                  :style="isReceiptDragging
                    ? `position:fixed; left:${dragX}px; top:${dragY}px; width:${RECEIPT_W_LS}px; height:${RECEIPT_H_LS}px; transform:translate(-50%,-50%); z-index:9998; cursor:grabbing;`
                    : receiptFloating
                      ? `position:fixed; left:${receiptFloatX}px; top:${receiptFloatY}px; width:${RECEIPT_W_LS}px; height:${RECEIPT_H_LS}px; transform:translate(-50%,-50%); z-index:9997; cursor:grab;`
                      : `position:absolute; top:0; left:0; width:${RECEIPT_W_LS}px; height:${RECEIPT_H_LS}px; cursor:grab;`"
                  @pointerdown="onReceiptPointerDown"
                  @pointermove="onReceiptPointerMove"
                  @pointerup="onReceiptPointerUp"
                >
                  <svg viewBox="0 0 520 1400" xmlns="http://www.w3.org/2000/svg"
                       :style="`width:${RECEIPT_W_LS}px; height:${RECEIPT_H_LS}px; display:block; filter:drop-shadow(0 3px 8px rgba(0,0,0,0.55));`">
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
              </div>
              </div><!-- end relative wrapper -->
            </div>

          </div>
        </div>

        <!-- ── Bottom row: Bill tray + Pocket ────────────────────────────── -->
        <div class="w-full border-t border-[#888] flex flex-row"
             style="background: linear-gradient(160deg, #c0c0c0 0%, #8e8e8e 25%, #b0b0b0 55%, #c8c8c8 80%, #9a9a9a 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.35);">

          <!-- Bill tray -->
          <div class="flex-1 px-4 py-4 flex flex-col items-center gap-1">
            <!-- Housing with slot -->
            <div class="flex flex-col items-center rounded-xl"
                 style="background: linear-gradient(180deg, #4a5460 0%, #3a4450 50%, #2e3840 100%); padding: 8px 10px 10px; width: 100%; max-width: 330px; box-shadow: inset 0 3px 8px rgba(0,0,0,0.7), 0 2px 0 rgba(255,255,255,0.2);">
              <div style="border: 1px solid rgba(255,255,255,0.12); border-radius: 4px; padding: 6px 8px 0; width: 100%; display:flex; flex-direction:column; align-items:center;">
                <!-- Slot slit — 285px wide to match bill width -->
                <div class="relative flex items-center justify-center"
                     style="width: 285px; height: 18px; background: #0a0c10; border-radius: 2px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.95);">
                  <span v-if="!billsVisible" class="text-[7px] tracking-wider uppercase select-none"
                        style="color: rgba(255,255,255,0.2);">billets</span>
                </div>
                <!-- Blue LED (ATM cash dispenser) -->
                <div class="w-full mt-1 mb-1"
                     style="height: 3px; border-radius: 1px; background: linear-gradient(90deg, transparent 0%, #0090e0 20%, #00b8ff 50%, #0090e0 80%, transparent 100%); box-shadow: 0 0 6px rgba(0,170,255,0.6);" />
              </div>
            </div>
            <!-- Bills: appear immediately, top 1/3 hidden in slot, bottom 2/3 visible -->
            <div v-if="billsVisible"
                 style="width:275px; height:97px; overflow:hidden; position:relative; margin-top:-4px;">
              <button
                class="touch-none select-none"
                :style="isBillsDragging
                  ? `position:fixed; left:${dragX}px; top:${dragY}px; width:${BILLS_W_LS}px; height:${BILLS_H_LS}px; transform:translate(-50%,-50%); z-index:9998; cursor:grabbing;`
                  : billsFloating
                    ? `position:fixed; left:${billsFloatX}px; top:${billsFloatY}px; width:${BILLS_W_LS}px; height:${BILLS_H_LS}px; transform:translate(-50%,-50%); z-index:9997; cursor:grab;`
                    : `position:absolute; bottom:0; left:0; width:${BILLS_W_LS}px; height:${BILLS_H_LS}px; cursor:grab;`"
                @pointerdown="onBillsPointerDown"
                @pointermove="onBillsPointerMove"
                @pointerup="onBillsPointerUp"
              >
                <!-- Bill stack SVG — viewBox adds 20px buffer for rear bill offsets -->
                <svg viewBox="0 0 1290 690" xmlns="http://www.w3.org/2000/svg"
                     :style="`width:${BILLS_W_LS}px; height:${BILLS_H_LS}px; display:block; filter:drop-shadow(0 4px 12px rgba(0,0,0,0.65));`">
                  <defs>
                    <linearGradient id="bill-ls-grad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                      <stop offset="0%"   :stop-color="billsBreakdown[0] === 50 ? '#F09218' : billsBreakdown[0] === 20 ? '#2368D0' : '#DC3232'"/>
                      <stop offset="100%" :stop-color="billsBreakdown[0] === 50 ? '#C86808' : billsBreakdown[0] === 20 ? '#1448B0' : '#AA1414'"/>
                    </linearGradient>
                  </defs>
                  <!-- Rear bill 2 (if ≥3 bills in stack) -->
                  <rect v-if="billsBreakdown.length >= 3" x="20" y="20" width="1270" height="670" rx="12" :fill="billBgColor(billsBreakdown[2])" opacity="0.85"/>
                  <rect v-if="billsBreakdown.length >= 3" x="20" y="20" width="1270" height="670" rx="12" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="6"/>
                  <!-- Rear bill 1 (if ≥2 bills in stack) -->
                  <rect v-if="billsBreakdown.length >= 2" x="10" y="10" width="1270" height="670" rx="12" :fill="billBgColor(billsBreakdown[1])" opacity="0.9"/>
                  <rect v-if="billsBreakdown.length >= 2" x="10" y="10" width="1270" height="670" rx="12" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="5"/>
                  <!-- Front bill: full realistic design -->
                  <g v-if="billsBreakdown.length > 0">
                    <!-- Main body -->
                    <rect width="1270" height="670" rx="12" fill="url(#bill-ls-grad)"/>
                    <!-- Left decorative band -->
                    <rect width="370" height="670" rx="12" fill="rgba(0,0,0,0.13)"/>
                    <!-- Security thread (thin vertical line) -->
                    <rect x="350" y="0" width="10" height="670" fill="rgba(255,255,255,0.14)"/>
                    <!-- EU stars ring — 12 stars, center (160,335), radius 88 -->
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
                    <!-- "BCE ECB" small text -->
                    <text x="160" y="570" text-anchor="middle" font-family="sans-serif" font-size="34" fill="rgba(255,255,255,0.55)" letter-spacing="6">BCE ECB</text>
                    <!-- Architectural arch motif (center) -->
                    <rect x="430" y="140" width="200" height="380" fill="rgba(255,255,255,0.05)"/>
                    <path d="M430 270 Q530 150 630 270" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="8"/>
                    <rect x="465" y="290" width="55" height="230" fill="rgba(255,255,255,0.09)"/>
                    <rect x="540" y="290" width="55" height="230" fill="rgba(255,255,255,0.09)"/>
                    <rect x="440" y="510" width="180" height="22" fill="rgba(255,255,255,0.12)"/>
                    <!-- Hologram patch (right side) -->
                    <circle cx="1130" cy="220" r="85" fill="rgba(255,255,255,0.07)"/>
                    <circle cx="1130" cy="220" r="85" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="3"/>
                    <circle cx="1130" cy="220" r="55" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
                    <!-- Large denomination number (center-right) -->
                    <text x="960" y="470" text-anchor="middle" font-family="serif" font-size="340" font-weight="900" fill="rgba(255,255,255,0.96)">{{ billsBreakdown[0] }}</text>
                    <!-- "EURO" text under denomination -->
                    <text x="960" y="570" text-anchor="middle" font-family="sans-serif" font-size="58" fill="rgba(255,255,255,0.78)" letter-spacing="18">EURO</text>
                    <!-- "BCE" header line -->
                    <text x="640" y="46" font-family="sans-serif" font-size="28" fill="rgba(255,255,255,0.5)" letter-spacing="4">BANQUE CENTRALE EUROPÉENNE  •  EUROPEAN CENTRAL BANK</text>
                    <!-- Serial number -->
                    <text x="420" y="638" font-family="monospace" font-size="34" fill="rgba(255,255,255,0.6)" letter-spacing="3">EA{{ billsBreakdown[0] }}2345678901 B</text>
                    <!-- Bottom color strip -->
                    <rect x="0" y="645" width="1270" height="25" fill="rgba(0,0,0,0.2)"/>
                    <!-- Border -->
                    <rect width="1270" height="670" rx="12" fill="none" stroke="rgba(0,0,0,0.4)" stroke-width="8"/>
                    <rect x="14" y="14" width="1242" height="642" rx="8" fill="none" stroke="rgba(255,255,255,0.13)" stroke-width="3"/>
                  </g>
                </svg>
              </button>
            </div>
          </div>

          <!-- Pocket zone -->
          <div class="w-[280px] shrink-0 border-l-2 flex flex-col"
               style="border-color: #7a5412; background: linear-gradient(170deg, #2e1a06 0%, #1e1004 100%);">
            <!-- Label header -->
            <div class="flex items-center gap-2 px-3 py-2" style="border-bottom: 1px solid rgba(160,110,30,0.3);">
              <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
                <rect x="4" y="12" width="24" height="16" rx="3" fill="#a07030" stroke="#c8a060" stroke-width="1.5"/>
                <path d="M10 12V10a6 6 0 0 1 12 0v2" stroke="#c8a060" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                <circle cx="16" cy="20" r="2.5" fill="#7a5020"/>
                <circle cx="16" cy="20" r="1" fill="#c8a060" opacity="0.6"/>
              </svg>
              <div>
                <div style="font-size:11px; font-weight:800; letter-spacing:2.5px; text-transform:uppercase; color:#c8a060; line-height:1.2;">Votre poche</div>
                <div style="font-size:9px; color:rgba(200,160,80,0.55); line-height:1.4; margin-top:1px;">Glissez vos affaires ici</div>
              </div>
            </div>
            <!-- Drop zone -->
            <div ref="pocketZoneRef"
                 class="flex-1 flex items-center justify-center"
                 style="padding: 16px 12px; min-height: 200px; background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 8px);">
              <!-- Empty hint -->
              <div v-if="!cardVisible || cardInReader"
                   style="border: 2px dashed rgba(200,150,60,0.22); border-radius:10px; width:130px; height:190px; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:8px;">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style="opacity:0.3;">
                  <path d="M16 6v16M8 14l8 8 8-8" stroke="#c8a060" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span style="font-size:8px; color:rgba(200,150,60,0.35); text-transform:uppercase; letter-spacing:1.5px; text-align:center; line-height:1.6;">glissez<br>ici</span>
              </div>
              <div style="width: 110px; height: 174px;">
                  <button v-if="cardVisible && !cardInReader && !swallowing"
                          class="touch-none select-none"
                          :style="isDragging
                            ? `position:fixed; left:${dragX}px; top:${dragY}px; width:110px; height:174px; transform:translate(-50%,-50%); z-index:9998; cursor:grabbing;`
                            : cardFloating
                              ? `position:fixed; left:${floatX}px; top:${floatY}px; width:110px; height:174px; transform:translate(-50%,-50%); z-index:9997; cursor:grab;`
                              : 'cursor:grab; width:110px; height:174px; display:block;'"
                          @pointerdown="onCardPointerDown"
                          @pointermove="onCardPointerMove"
                          @pointerup="onCardPointerUp"
                  >
                    <svg viewBox="0 0 540 856" xmlns="http://www.w3.org/2000/svg" class="w-[110px] h-[174px] rounded drop-shadow-md">
                      <defs>
                        <linearGradient id="cb2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%"   stop-color="#1a3a6e"/>
                          <stop offset="50%"  stop-color="#0d2247"/>
                          <stop offset="100%" stop-color="#162d5a"/>
                        </linearGradient>
                        <linearGradient id="cg2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%"   stop-color="#e8c84a"/>
                          <stop offset="40%"  stop-color="#c8a020"/>
                          <stop offset="100%" stop-color="#e0b830"/>
                        </linearGradient>
                        <linearGradient id="ch2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%"   stop-color="#c0a0ff" stop-opacity="0.75"/>
                          <stop offset="50%"  stop-color="#80e8ff" stop-opacity="0.85"/>
                          <stop offset="100%" stop-color="#ff80c0" stop-opacity="0.75"/>
                        </linearGradient>
                        <clipPath id="cc2"><rect width="540" height="856" rx="40"/></clipPath>
                      </defs>
                      <rect width="540" height="856" rx="40" fill="url(#cb2)"/>
                      <g clip-path="url(#cc2)" opacity="0.06">
                        <line x1="-100" y1="856" x2="656"  y2="0"   stroke="white" stroke-width="50"/>
                        <line x1="100"  y1="856" x2="856"  y2="0"   stroke="white" stroke-width="50"/>
                        <line x1="300"  y1="856" x2="1056" y2="0"   stroke="white" stroke-width="50"/>
                      </g>
                      <rect x="0" y="0" width="540" height="68" fill="#080810" opacity="0.9" clip-path="url(#cc2)"/>
                      <text x="42" y="124" font-family="sans-serif" font-size="40" font-weight="700" fill="rgba(255,255,255,0.9)" letter-spacing="2">ADAPT BANK</text>
                      <rect x="42"  y="190" width="130" height="103" rx="10" fill="url(#cg2)"/>
                      <rect x="56"  y="204" width="102" height="75"  rx="5"  fill="#b89018"/>
                      <line x1="107" y1="190" x2="107" y2="204" stroke="#c8a020" stroke-width="4"/>
                      <line x1="80"  y1="256" x2="56"  y2="256" stroke="#c8a020" stroke-width="4"/>
                      <line x1="134" y1="256" x2="158" y2="256" stroke="#c8a020" stroke-width="4"/>
                      <line x1="107" y1="293" x2="107" y2="307" stroke="#c8a020" stroke-width="4"/>
                      <line x1="72"  y1="232" x2="142" y2="232" stroke="#d4a830" stroke-width="2" opacity="0.5"/>
                      <line x1="72"  y1="272" x2="142" y2="272" stroke="#d4a830" stroke-width="2" opacity="0.5"/>
                      <line x1="95"  y1="208" x2="95"  y2="275" stroke="#d4a830" stroke-width="2" opacity="0.5"/>
                      <line x1="119" y1="208" x2="119" y2="275" stroke="#d4a830" stroke-width="2" opacity="0.5"/>
                      <circle cx="420" cy="250" r="72" fill="url(#ch2)" opacity="0.85"/>
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
              </div>
            </div>
          </div>

        </div>

      </div>
    </template>

    <!-- ══════════════════════════════════════════════ PORTRAIT LAYOUT ═══════ -->
    <template v-else>
      <div class="flex flex-col max-w-[700px] w-full rounded-2xl shadow-2xl overflow-hidden border border-[#888]">

        <!-- Screen (4:3) -->
        <div class="w-full bg-gray-50 flex flex-col" style="aspect-ratio: 4/3;">
          <slot />
        </div>

        <!-- ── Keypad + Card reader + Receipt row ────────────────────────── -->
        <div class="w-full flex flex-row border-t border-[#888]"
             style="background: linear-gradient(160deg, #c0c0c0 0%, #8e8e8e 25%, #b0b0b0 55%, #c8c8c8 80%, #9a9a9a 100%);">

          <!-- Keypad (left, flex-1) -->
          <div class="flex-1 p-4 flex items-center justify-center">
            <div class="w-full max-w-[260px]">
              <AtmKeypad
                @digit="handleKey('digit', $event)"
                @cancel="handleKey('cancel')"
                @clear="handleKey('clear')"
                @confirm="handleKey('confirm')"
              />
            </div>
          </div>

          <!-- Card reader + Receipt stacked (right column) -->
          <div class="flex flex-col border-l border-[#888] p-3 gap-12 items-center justify-center">

            <!-- Card reader -->
            <div class="relative flex flex-col items-center">
              <div class="flex flex-col items-center rounded-md"
                   style="background: linear-gradient(180deg, #5a6470 0%, #2e3540 100%); padding: 5px 8px 7px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.6);">
                <div style="border: 1px solid rgba(255,255,255,0.10); border-radius: 3px; padding: 4px 6px 0; display:flex; flex-direction:column; align-items:center;">
                  <div ref="readerSlotRef"
                       style="width: 90px; height: 16px; background: #0a0c10; border-radius: 2px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.9);" />
                  <div class="w-full mt-1"
                       style="height: 3px; border-radius: 1px; background: linear-gradient(90deg, transparent, #00e060, #00ff70, #00e060, transparent); box-shadow: 0 0 6px rgba(0,255,80,0.7);" />
                </div>
              </div>
              <!-- Card ejecting: absolute so row height never shifts -->
              <div v-if="cardVisible && cardInReader && !swallowing"
                   :class="ejecting ? 'eject-container' : ''"
                   style="--peek-h:38px; position:absolute; top:100%; left:50%; margin-left:-40px; width:80px; height:38px; overflow:hidden;">
              <button
                class="touch-none select-none"
                :style="isDragging
                  ? `position:fixed; left:${dragX}px; top:${dragY}px; width:80px; height:127px; transform:translate(-50%,-50%); z-index:9998; cursor:grabbing;`
                  : cardFloating
                    ? `position:fixed; left:${floatX}px; top:${floatY}px; width:80px; height:127px; transform:translate(-50%,-50%); z-index:9997; cursor:grab;`
                    : 'position:absolute; bottom:0; left:0; width:80px; height:127px; cursor:grab;'"
                @pointerdown="onCardPointerDown"
                @pointermove="onCardPointerMove"
                @pointerup="onCardPointerUp"
              >
                <svg viewBox="0 0 540 856" xmlns="http://www.w3.org/2000/svg" class="w-[80px] h-[127px] rounded drop-shadow-xl">
                  <defs>
                    <linearGradient id="p-cb" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%"   stop-color="#1a3a6e"/>
                      <stop offset="50%"  stop-color="#0d2247"/>
                      <stop offset="100%" stop-color="#162d5a"/>
                    </linearGradient>
                    <linearGradient id="p-cg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%"   stop-color="#e8c84a"/>
                      <stop offset="40%"  stop-color="#c8a020"/>
                      <stop offset="100%" stop-color="#e0b830"/>
                    </linearGradient>
                    <clipPath id="p-cc"><rect width="540" height="856" rx="40"/></clipPath>
                  </defs>
                  <rect width="540" height="856" rx="40" fill="url(#p-cb)"/>
                  <rect x="0" y="0" width="540" height="68" fill="#080810" opacity="0.9" clip-path="url(#p-cc)"/>
                  <text x="42" y="124" font-family="sans-serif" font-size="40" font-weight="700" fill="rgba(255,255,255,0.9)">ADAPT BANK</text>
                  <rect x="42"  y="190" width="130" height="103" rx="10" fill="url(#p-cg)"/>
                  <rect x="56"  y="204" width="102" height="75"  rx="5"  fill="#b89018"/>
                  <text x="42" y="530" font-family="monospace" font-size="36" fill="rgba(255,255,255,0.85)" letter-spacing="3">••••  ••••</text>
                  <text x="42" y="590" font-family="monospace" font-size="36" fill="rgba(255,255,255,0.85)" letter-spacing="3">••••  ••••</text>
                  <rect width="540" height="856" rx="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
                </svg>
              </button>
            </div>
            </div><!-- end card reader relative wrapper -->

            <!-- Receipt -->
            <div class="relative flex flex-col items-center">
              <div class="flex flex-col items-center rounded-md"
                   style="background: linear-gradient(180deg, #5a6470 0%, #2e3540 100%); padding: 5px 8px 7px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.6);">
                <div style="border: 1px solid rgba(255,255,255,0.10); border-radius: 3px; padding: 4px 6px 0; display:flex; flex-direction:column; align-items:center;">
                  <!-- Receipt slot slit — 58px wide to match portrait receipt -->
                  <div style="width: 58px; height: 14px; background: #0a0c10; border-radius: 1px; box-shadow: inset 0 2px 3px rgba(0,0,0,0.9);"/>
                  <div class="w-full mt-1"
                       style="height: 2px; border-radius: 1px; background: linear-gradient(90deg, transparent, #e0a000, #ffc800, #e0a000, transparent); box-shadow: 0 0 4px rgba(255,180,0,0.5);" />
                </div>
              </div>
              <!-- Receipt ejecting: absolute so housing never shifts -->
              <div v-if="receiptVisible"
                   :class="receiptEjecting ? 'eject-container' : ''"
                   style="--peek-h:43px; position:absolute; top:100%; left:50%; margin-left:-27px; width:54px; height:43px; overflow:hidden;">
              <button
                class="touch-none select-none"
                :style="isReceiptDragging
                  ? `position:fixed; left:${dragX}px; top:${dragY}px; width:${RECEIPT_W_PT}px; height:${RECEIPT_H_PT}px; transform:translate(-50%,-50%); z-index:9998; cursor:grabbing;`
                  : receiptFloating
                    ? `position:fixed; left:${receiptFloatX}px; top:${receiptFloatY}px; width:${RECEIPT_W_PT}px; height:${RECEIPT_H_PT}px; transform:translate(-50%,-50%); z-index:9997; cursor:grab;`
                    : `position:absolute; top:0; left:0; width:${RECEIPT_W_PT}px; height:${RECEIPT_H_PT}px; cursor:grab;`"
                @pointerdown="onReceiptPointerDown"
                @pointermove="onReceiptPointerMove"
                @pointerup="onReceiptPointerUp"
              >
                <svg viewBox="0 0 520 1400" xmlns="http://www.w3.org/2000/svg"
                     :style="`width:${RECEIPT_W_PT}px; height:${RECEIPT_H_PT}px; display:block; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.5));`">
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
            </div>
            </div><!-- end receipt relative wrapper -->

          </div><!-- end right column -->
        </div>

        <!-- ── Bills + Pocket row ─────────────────────────────────────────── -->
        <div class="w-full flex flex-row border-t border-[#888]"
             style="background: linear-gradient(160deg, #c0c0c0 0%, #8e8e8e 25%, #b0b0b0 55%, #c8c8c8 80%, #9a9a9a 100%);">

          <!-- Bills section (flex-1, larger) -->
          <div class="flex-1 p-3 border-r border-[#888] flex flex-col items-center gap-2">
            <!-- Housing with slot -->
            <div class="w-full flex flex-col items-center rounded-md"
                 style="background: linear-gradient(180deg, #4a5460 0%, #2e3840 100%); padding: 6px 8px 8px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.6);">
              <div style="border: 1px solid rgba(255,255,255,0.10); border-radius: 3px; padding: 5px 8px 0; width: 100%; display:flex; flex-direction:column; align-items:center;">
                <!-- Slot slit — 200px wide to match portrait bill width -->
                <div style="width: 200px; height: 14px; background: #0a0c10; border-radius: 1px; box-shadow: inset 0 2px 3px rgba(0,0,0,0.9);"/>
                <!-- Blue LED -->
                <div class="w-full mt-1"
                     style="height: 3px; border-radius: 1px; background: linear-gradient(90deg, transparent, #0090e0, #00b8ff, #0090e0, transparent); box-shadow: 0 0 5px rgba(0,170,255,0.6);" />
              </div>
            </div>
            <!-- Bills: appear immediately, top 1/3 hidden in slot, bottom 2/3 visible -->
            <div v-if="billsVisible"
                 style="width:190px; height:67px; overflow:hidden; position:relative; margin-top:-8px;">
              <button
                class="touch-none select-none"
                :style="isBillsDragging
                  ? `position:fixed; left:${dragX}px; top:${dragY}px; width:${BILLS_W_PT}px; height:${BILLS_H_PT}px; transform:translate(-50%,-50%); z-index:9998; cursor:grabbing;`
                  : billsFloating
                    ? `position:fixed; left:${billsFloatX}px; top:${billsFloatY}px; width:${BILLS_W_PT}px; height:${BILLS_H_PT}px; transform:translate(-50%,-50%); z-index:9997; cursor:grab;`
                    : `position:absolute; bottom:0; left:0; width:${BILLS_W_PT}px; height:${BILLS_H_PT}px; cursor:grab;`"
                @pointerdown="onBillsPointerDown"
                @pointermove="onBillsPointerMove"
                @pointerup="onBillsPointerUp"
              >
                <svg viewBox="0 0 1290 690" xmlns="http://www.w3.org/2000/svg"
                     :style="`width:${BILLS_W_PT}px; height:${BILLS_H_PT}px; display:block; filter:drop-shadow(0 3px 8px rgba(0,0,0,0.6));`">
                  <defs>
                    <linearGradient id="bill-pt-grad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                      <stop offset="0%"   :stop-color="billsBreakdown[0] === 50 ? '#F09218' : billsBreakdown[0] === 20 ? '#2368D0' : '#DC3232'"/>
                      <stop offset="100%" :stop-color="billsBreakdown[0] === 50 ? '#C86808' : billsBreakdown[0] === 20 ? '#1448B0' : '#AA1414'"/>
                    </linearGradient>
                  </defs>
                  <!-- Rear bill 2 -->
                  <rect v-if="billsBreakdown.length >= 3" x="20" y="20" width="1270" height="670" rx="12" :fill="billBgColor(billsBreakdown[2])" opacity="0.85"/>
                  <rect v-if="billsBreakdown.length >= 3" x="20" y="20" width="1270" height="670" rx="12" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="6"/>
                  <!-- Rear bill 1 -->
                  <rect v-if="billsBreakdown.length >= 2" x="10" y="10" width="1270" height="670" rx="12" :fill="billBgColor(billsBreakdown[1])" opacity="0.9"/>
                  <rect v-if="billsBreakdown.length >= 2" x="10" y="10" width="1270" height="670" rx="12" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="5"/>
                  <!-- Front bill -->
                  <g v-if="billsBreakdown.length > 0">
                    <rect width="1270" height="670" rx="12" fill="url(#bill-pt-grad)"/>
                    <rect width="370" height="670" rx="12" fill="rgba(0,0,0,0.13)"/>
                    <rect x="350" y="0" width="10" height="670" fill="rgba(255,255,255,0.14)"/>
                    <!-- EU stars ring -->
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
                    <!-- Arch motif -->
                    <rect x="430" y="140" width="200" height="380" fill="rgba(255,255,255,0.05)"/>
                    <path d="M430 270 Q530 150 630 270" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="8"/>
                    <rect x="465" y="290" width="55" height="230" fill="rgba(255,255,255,0.09)"/>
                    <rect x="540" y="290" width="55" height="230" fill="rgba(255,255,255,0.09)"/>
                    <rect x="440" y="510" width="180" height="22" fill="rgba(255,255,255,0.12)"/>
                    <!-- Large denomination number -->
                    <text x="960" y="470" text-anchor="middle" font-family="serif" font-size="340" font-weight="900" fill="rgba(255,255,255,0.96)">{{ billsBreakdown[0] }}</text>
                    <text x="960" y="570" text-anchor="middle" font-family="sans-serif" font-size="58" fill="rgba(255,255,255,0.78)" letter-spacing="18">EURO</text>
                    <text x="420" y="638" font-family="monospace" font-size="34" fill="rgba(255,255,255,0.6)" letter-spacing="3">EA{{ billsBreakdown[0] }}2345678901 B</text>
                    <rect x="0" y="645" width="1270" height="25" fill="rgba(0,0,0,0.2)"/>
                    <rect width="1270" height="670" rx="12" fill="none" stroke="rgba(0,0,0,0.4)" stroke-width="8"/>
                    <rect x="14" y="14" width="1242" height="642" rx="8" fill="none" stroke="rgba(255,255,255,0.13)" stroke-width="3"/>
                  </g>
                </svg>
              </button>
            </div>
          </div>

          <!-- Pocket section -->
          <div class="flex-1 flex flex-col border-l-2"
               style="border-color: #7a5412; background: linear-gradient(170deg, #2e1a06 0%, #1e1004 100%);">
            <!-- Label header -->
            <div class="flex items-center gap-2 px-3 py-2" style="border-bottom: 1px solid rgba(160,110,30,0.3);">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
                <rect x="4" y="12" width="24" height="16" rx="3" fill="#a07030" stroke="#c8a060" stroke-width="1.5"/>
                <path d="M10 12V10a6 6 0 0 1 12 0v2" stroke="#c8a060" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                <circle cx="16" cy="20" r="2.5" fill="#7a5020"/>
                <circle cx="16" cy="20" r="1" fill="#c8a060" opacity="0.6"/>
              </svg>
              <div>
                <div style="font-size:10px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:#c8a060; line-height:1.2;">Votre poche</div>
                <div style="font-size:8px; color:rgba(200,160,80,0.55); line-height:1.4; margin-top:1px;">Glissez vos affaires ici</div>
              </div>
            </div>
            <!-- Drop zone -->
            <div ref="pocketZoneRef"
                 class="flex-1 flex items-center justify-center"
                 style="padding: 12px 8px; min-height: 130px; background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 8px);">
              <!-- Empty hint -->
              <div v-if="!cardVisible || cardInReader"
                   style="border: 2px dashed rgba(200,150,60,0.22); border-radius:8px; width:96px; height:140px; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:6px;">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" style="opacity:0.3;">
                  <path d="M16 6v16M8 14l8 8 8-8" stroke="#c8a060" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span style="font-size:7px; color:rgba(200,150,60,0.35); text-transform:uppercase; letter-spacing:1px; text-align:center; line-height:1.6;">glissez<br>ici</span>
              </div>
              <div style="width: 80px; height: 127px;">
                  <button v-if="cardVisible && !cardInReader && !swallowing"
                          class="touch-none select-none"
                          :style="isDragging
                            ? `position:fixed; left:${dragX}px; top:${dragY}px; width:80px; height:127px; transform:translate(-50%,-50%); z-index:9998; cursor:grabbing;`
                            : cardFloating
                              ? `position:fixed; left:${floatX}px; top:${floatY}px; width:80px; height:127px; transform:translate(-50%,-50%); z-index:9997; cursor:grab;`
                              : 'cursor:grab; width:80px; height:127px; display:block;'"
                          @pointerdown="onCardPointerDown"
                          @pointermove="onCardPointerMove"
                          @pointerup="onCardPointerUp"
                  >
                    <svg viewBox="0 0 540 856" xmlns="http://www.w3.org/2000/svg" class="w-[80px] h-[127px] rounded">
                      <defs>
                        <linearGradient id="p-cb2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%"   stop-color="#1a3a6e"/>
                          <stop offset="50%"  stop-color="#0d2247"/>
                          <stop offset="100%" stop-color="#162d5a"/>
                        </linearGradient>
                        <linearGradient id="p-cg2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%"   stop-color="#e8c84a"/>
                          <stop offset="40%"  stop-color="#c8a020"/>
                          <stop offset="100%" stop-color="#e0b830"/>
                        </linearGradient>
                        <clipPath id="p-cc2"><rect width="540" height="856" rx="40"/></clipPath>
                      </defs>
                      <rect width="540" height="856" rx="40" fill="url(#p-cb2)"/>
                      <rect x="0" y="0" width="540" height="68" fill="#080810" opacity="0.9" clip-path="url(#p-cc2)"/>
                      <text x="42" y="124" font-family="sans-serif" font-size="40" font-weight="700" fill="rgba(255,255,255,0.9)">ADAPT BANK</text>
                      <rect x="42"  y="190" width="130" height="103" rx="10" fill="url(#p-cg2)"/>
                      <rect x="56"  y="204" width="102" height="75"  rx="5"  fill="#b89018"/>
                      <text x="42" y="530" font-family="monospace" font-size="36" fill="rgba(255,255,255,0.85)" letter-spacing="3">••••  ••••</text>
                      <text x="42" y="590" font-family="monospace" font-size="36" fill="rgba(255,255,255,0.85)" letter-spacing="3">••••  ••••</text>
                      <rect width="540" height="856" rx="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
                    </svg>
                  </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </template>

    <PinSettingsModal v-model="showSettings" />
    <StatsModal v-model="showStats" />
    <InfoModal v-model="showInfo" />
  </div>
</template>

<style scoped>
/* ── Swallow: card slides UP into reader slot (3s) ────────────────────────── */
.swallow-card {
  animation: swallow-into-slot 3s ease-in forwards;
}
@keyframes swallow-into-slot {
  0%   {
    transform: translate(-50%, -50%);
    clip-path: inset(0 0 0 0 round 4px);
  }
  100% {
    transform: translate(-50%, calc(-50% - var(--ch)));
    clip-path: inset(100% 0 0 0 round 0px);
  }
}

/* ── Eject: container grows from 0 → peek height, element stays at top:0/bottom:0 ── */
/* Correct content (denomination/header/cardholder) is always visible as container expands */
.eject-container {
  animation: eject-peek 3s ease-out forwards;
}
@keyframes eject-peek {
  0%   { height: 0; }
  10%  { height: 0; } /* brief mechanical pause before motion */
  100% { height: var(--peek-h); }
}
</style>
