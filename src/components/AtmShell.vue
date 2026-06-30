<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useAtmObjects } from "../composables/useAtmObjects.js";
import { useAtmState } from "../composables/useAtmState.js";
import { useDraggable } from "../composables/useDraggable.js";
import AtmChassis from "./chassis/AtmChassis.vue";
import LegacyAtmChassis from "./chassis/LegacyAtmChassis.vue";
import CongratsOverlay from "./overlays/CongratsOverlay.vue";
import MenuButtons from "./overlays/MenuButtons.vue";

// `?legacy` URL flag: rollback lever for step-5 template unification.
// To remove once AtmChassis.vue is validated on real tablets.
const useLegacyLayout =
  typeof window !== "undefined" &&
  new URLSearchParams(location.search).has("legacy");

const { currentScreen } = useAtmState();
const {
  cardVisible,
  receiptVisible,
  billsVisible,
  onCardClick,
  onReceiptClick,
  onBillsClick,
  cardInReader,
  resetAll,
} = useAtmObjects();

watch(
  currentScreen,
  () => {
    resetAll();
    cardDrag.cancel();
    receiptDrag.cancel();
    billsDrag.cancel();
    cardFloating.value = false;
    ejecting.value = false;
    receiptFloating.value = false;
    receiptEjecting.value = false;
    billsFloating.value = false;
  },
  { flush: "pre" },
);

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

// ── Shared drag position refs ─────────────────────────────────────────────────
const dragX = ref(0);
const dragY = ref(0);

// ── Card-specific state ───────────────────────────────────────────────────────
const swallowing = ref(false);
const swallowX = ref(0);
const swallowY = ref(0);
const swallowDy = ref(0);
const cardFloating = ref(false);
const floatX = ref(0);
const floatY = ref(0);
const ejecting = ref(false);

const readerSlotRef = ref(null);
const pocketZoneRef = ref(null);
const setReaderSlotEl = (el) => {
  readerSlotRef.value = el;
};
const setPocketZoneEl = (el) => {
  pocketZoneRef.value = el;
};

function triggerSwallow(slotRect) {
  const cardH = cardDrag.cardSize.value.h;
  const targetY = slotRect.top + slotRect.height / 2 + cardH / 2;
  swallowX.value = slotRect.left + slotRect.width / 2;
  swallowY.value = targetY;
  swallowDy.value = dragY.value - targetY;
  cardFloating.value = false;
  swallowing.value = true;
  setTimeout(() => {
    swallowing.value = false;
    cardVisible.value = false;
    cardInReader.value = false;
    onCardClick.value?.();
  }, 3000);
}

const cardDrag = useDraggable({
  posX: dragX,
  posY: dragY,
  dropZones: () => {
    const zones = { pocket: pocketZoneRef };
    if (!cardInReader.value && !swallowing.value) {
      zones.slot = {
        ref: readerSlotRef,
        mode: "edge-top+overlap",
        overlap: 0.8,
        tolerancePx: 8,
        proximity: true,
      };
    }
    return zones;
  },
  onStart: () => {
    cardFloating.value = false;
    ejecting.value = false;
  },
  onProximity: (zoneName) => {
    if (zoneName === "slot") {
      triggerSwallow(readerSlotRef.value.getBoundingClientRect());
    }
  },
  onDrop: (zoneName) => {
    if (zoneName === "pocket" && cardInReader.value) {
      cardVisible.value = false;
      cardInReader.value = false;
      cardFloating.value = false;
      onCardClick.value?.();
    } else if (zoneName === "slot") {
      triggerSwallow(readerSlotRef.value.getBoundingClientRect());
    } else {
      cardFloating.value = true;
      floatX.value = dragX.value;
      floatY.value = dragY.value;
    }
  },
  onDropOutside: (cx, cy) => {
    cardFloating.value = true;
    floatX.value = cx;
    floatY.value = cy;
  },
});
const isDragging = cardDrag.isDragging;
const onCardPointerDown = cardDrag.onPointerDown;
const onCardPointerMove = cardDrag.onPointerMove;
const onCardPointerUp = cardDrag.onPointerUp;
const onCardPointerCancel = cardDrag.onPointerCancel;

watch(cardInReader, (inReader) => {
  if (inReader && cardVisible.value) {
    cardFloating.value = false;
    ejecting.value = true;
    setTimeout(() => {
      ejecting.value = false;
    }, 3000);
  }
});

// ── Receipt drag ──────────────────────────────────────────────────────────────
const receiptFloating = ref(false);
const receiptFloatX = ref(0);
const receiptFloatY = ref(0);
const receiptEjecting = ref(false);

const receiptDrag = useDraggable({
  posX: dragX,
  posY: dragY,
  dropZones: { pocket: pocketZoneRef },
  enabled: () => !cardDrag.isDragging.value,
  onStart: () => {
    receiptFloating.value = false;
    receiptEjecting.value = false;
  },
  onDrop: () => {
    receiptVisible.value = false;
    receiptFloating.value = false;
    onReceiptClick.value?.();
  },
  onDropOutside: (cx, cy) => {
    receiptFloating.value = true;
    receiptFloatX.value = cx;
    receiptFloatY.value = cy;
  },
});
const isReceiptDragging = receiptDrag.isDragging;
const onReceiptPointerDown = receiptDrag.onPointerDown;
const onReceiptPointerMove = receiptDrag.onPointerMove;
const onReceiptPointerUp = receiptDrag.onPointerUp;
const onReceiptPointerCancel = receiptDrag.onPointerCancel;

watch(receiptVisible, (visible) => {
  if (visible) {
    receiptFloating.value = false;
    receiptEjecting.value = true;
    setTimeout(() => {
      receiptEjecting.value = false;
    }, 3000);
  }
});

// ── Bills drag ────────────────────────────────────────────────────────────────
const billsFloating = ref(false);
const billsFloatX = ref(0);
const billsFloatY = ref(0);

const billsDrag = useDraggable({
  posX: dragX,
  posY: dragY,
  dropZones: { pocket: pocketZoneRef },
  enabled: () => !cardDrag.isDragging.value && !receiptDrag.isDragging.value,
  onStart: () => {
    billsFloating.value = false;
  },
  onDrop: () => {
    billsVisible.value = false;
    billsFloating.value = false;
    onBillsClick.value?.();
  },
  onDropOutside: (cx, cy) => {
    billsFloating.value = true;
    billsFloatX.value = cx;
    billsFloatY.value = cy;
  },
});
const isBillsDragging = billsDrag.isDragging;
const onBillsPointerDown = billsDrag.onPointerDown;
const onBillsPointerMove = billsDrag.onPointerMove;
const onBillsPointerUp = billsDrag.onPointerUp;
const onBillsPointerCancel = billsDrag.onPointerCancel;

watch(billsVisible, (visible) => {
  if (visible) billsFloating.value = false;
});
</script>

<template>
  <main class="min-h-dvh bg-[#2a2e33] flex items-center justify-center p-3">

    <MenuButtons />

    <!-- Swallow animation overlay (global, sits on top during 3s ingestion) -->
    <div
      v-if="swallowing"
      class="pointer-events-none fixed swallow-card"
      :style="{ left: swallowX + 'px', top: swallowY + 'px', '--ch': 'var(--card-h)', '--dy': swallowDy + 'px', zIndex: 'var(--z-swallow)' }"
    >
      <svg viewBox="0 0 540 856" xmlns="http://www.w3.org/2000/svg"
           class="rounded"
           style="width:var(--card-w); height:var(--card-h);">
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

    <!-- Chassis: unified or legacy based on `?legacy` URL flag -->
    <LegacyAtmChassis
      v-if="useLegacyLayout"
      :portrait="isPortrait" :setSlotEl="setReaderSlotEl" :setPocketEl="setPocketZoneEl"
      :dragX="dragX" :dragY="dragY"
      :cardVisible="cardVisible" :cardInReader="cardInReader" :swallowing="swallowing" :ejecting="ejecting"
      :isDragging="isDragging" :cardFloating="cardFloating" :floatX="floatX" :floatY="floatY"
      :doCardDown="onCardPointerDown" :doCardMove="onCardPointerMove"
      :doCardUp="onCardPointerUp" :doCardCancel="onCardPointerCancel"
      :receiptVisible="receiptVisible" :receiptEjecting="receiptEjecting" :isReceiptDragging="isReceiptDragging"
      :receiptFloating="receiptFloating" :receiptFloatX="receiptFloatX" :receiptFloatY="receiptFloatY"
      :doReceiptDown="onReceiptPointerDown" :doReceiptMove="onReceiptPointerMove"
      :doReceiptUp="onReceiptPointerUp" :doReceiptCancel="onReceiptPointerCancel"
      :billsVisible="billsVisible" :isBillsDragging="isBillsDragging"
      :billsFloating="billsFloating" :billsFloatX="billsFloatX" :billsFloatY="billsFloatY"
      :doBillsDown="onBillsPointerDown" :doBillsMove="onBillsPointerMove"
      :doBillsUp="onBillsPointerUp" :doBillsCancel="onBillsPointerCancel"
    >
      <slot />
    </LegacyAtmChassis>
    <AtmChassis
      v-else
      :portrait="isPortrait" :setSlotEl="setReaderSlotEl" :setPocketEl="setPocketZoneEl"
      :dragX="dragX" :dragY="dragY"
      :cardVisible="cardVisible" :cardInReader="cardInReader" :swallowing="swallowing" :ejecting="ejecting"
      :isDragging="isDragging" :cardFloating="cardFloating" :floatX="floatX" :floatY="floatY"
      :doCardDown="onCardPointerDown" :doCardMove="onCardPointerMove"
      :doCardUp="onCardPointerUp" :doCardCancel="onCardPointerCancel"
      :receiptVisible="receiptVisible" :receiptEjecting="receiptEjecting" :isReceiptDragging="isReceiptDragging"
      :receiptFloating="receiptFloating" :receiptFloatX="receiptFloatX" :receiptFloatY="receiptFloatY"
      :doReceiptDown="onReceiptPointerDown" :doReceiptMove="onReceiptPointerMove"
      :doReceiptUp="onReceiptPointerUp" :doReceiptCancel="onReceiptPointerCancel"
      :billsVisible="billsVisible" :isBillsDragging="isBillsDragging"
      :billsFloating="billsFloating" :billsFloatX="billsFloatX" :billsFloatY="billsFloatY"
      :doBillsDown="onBillsPointerDown" :doBillsMove="onBillsPointerMove"
      :doBillsUp="onBillsPointerUp" :doBillsCancel="onBillsPointerCancel"
    >
      <slot />
    </AtmChassis>

    <CongratsOverlay />
  </main>
</template>

<style scoped>
.swallow-card {
  animation: swallow-into-slot 3s ease-in forwards;
}
@keyframes swallow-into-slot {
  0%   {
    transform: translate(-50%, calc(-50% + var(--dy)));
    clip-path: inset(0 0 0 0 round 4px);
  }
  15%  {
    transform: translate(-50%, -50%);
    clip-path: inset(0 0 0 0 round 4px);
  }
  100% {
    transform: translate(-50%, calc(-50% - var(--ch)));
    clip-path: inset(100% 0 0 0 round 0px);
  }
}
</style>
