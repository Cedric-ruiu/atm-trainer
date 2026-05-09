<script setup>
// UNIFIED CHASSIS — single template. Orientation switches via Tailwind
// `landscape:` variants + CSS `display:contents` on the card/receipt wrapper
// (so in landscape the card+keypad+receipt become flat siblings of the chassis
// flex column, reordered by `order-1/2/3`).
//
// Fallback: see LegacyAtmChassis.vue — activated by `?legacy` URL flag.
import { inject } from "vue";
import AtmKeypad from "../AtmKeypad.vue";
import BillsTray from "./BillsTray.vue";
import CardReader from "./CardReader.vue";
import PocketZone from "./PocketZone.vue";
import ReceiptSlot from "./ReceiptSlot.vue";

defineProps({
  portrait: Boolean,
  setSlotEl: Function,
  setPocketEl: Function,
  dragX: Number,
  dragY: Number,
  cardVisible: Boolean,
  cardInReader: Boolean,
  swallowing: Boolean,
  ejecting: Boolean,
  isDragging: Boolean,
  cardFloating: Boolean,
  floatX: Number,
  floatY: Number,
  doCardDown: Function,
  doCardMove: Function,
  doCardUp: Function,
  doCardCancel: Function,
  receiptVisible: Boolean,
  receiptEjecting: Boolean,
  isReceiptDragging: Boolean,
  receiptFloating: Boolean,
  receiptFloatX: Number,
  receiptFloatY: Number,
  doReceiptDown: Function,
  doReceiptMove: Function,
  doReceiptUp: Function,
  doReceiptCancel: Function,
  billsVisible: Boolean,
  isBillsDragging: Boolean,
  billsFloating: Boolean,
  billsFloatX: Number,
  billsFloatY: Number,
  doBillsDown: Function,
  doBillsMove: Function,
  doBillsUp: Function,
  doBillsCancel: Function,
});

const keypadBus = inject("keypadBus");
function handleKey(type, payload) {
  keypadBus.value = payload !== undefined ? { type, payload } : { type };
}
</script>

<template>
  <div class="atm-chassis chassis-outer flex flex-col w-full rounded-2xl shadow-2xl overflow-hidden border border-[#888] max-w-[700px] landscape:max-w-[1280px]">

    <!-- Top section: screen + chassis-block. Stack vertically in portrait, side-by-side in landscape. -->
    <div class="flex flex-col landscape:flex-row items-stretch">

      <!-- Screen -->
      <div class="screen-area w-full landscape:w-auto landscape:shrink-0 bg-gray-50 flex flex-col overflow-hidden">
        <slot />
      </div>

      <!-- Chassis block: keypad + (card/receipt wrapper).
           Portrait: flex-row (keypad left, card/receipt column right).
           Landscape: flex-col (card, keypad, receipt stacked — via `display:contents` on card/receipt wrapper + CSS `order`). -->
      <div
        class="chassis-block flex flex-row landscape:flex-col flex-1 landscape:min-w-0 landscape:items-center landscape:gap-3 landscape:p-4 border-t border-[#888] landscape:border-t-0 landscape:border-l"
        style="background: linear-gradient(160deg, #c0c0c0 0%, #8e8e8e 25%, #b0b0b0 55%, #c8c8c8 80%, #9a9a9a 100%);"
      >

        <!-- Keypad wrapper. Portrait: flex-1 left cell with p-4. Landscape: order-2 (between card and receipt). -->
        <div class="flex-1 flex items-center justify-center p-4 landscape:w-full landscape:p-3 landscape:order-2">
          <div class="w-full max-w-[260px] landscape:max-w-[300px]">
            <AtmKeypad
              @digit="handleKey('digit', $event)"
              @cancel="handleKey('cancel')"
              @clear="handleKey('clear')"
              @confirm="handleKey('confirm')"
            />
          </div>
        </div>

        <!-- Card + Receipt wrapper.
             Portrait: flex-col right cell (border-l, p-3, gap-12).
             Landscape: `display:contents` — children (CardReader, ReceiptSlot) become
             direct flex-col siblings of the chassis-block, ordered by `order-1`/`order-3`. -->
        <div class="flex flex-col border-l border-[#888] p-3 gap-12 items-center justify-center landscape:contents">
          <CardReader
            class="landscape:order-1"
            :portrait="portrait" :setSlotEl="setSlotEl"
            :cardVisible="cardVisible" :cardInReader="cardInReader" :swallowing="swallowing" :ejecting="ejecting"
            :isDragging="isDragging" :dragX="dragX" :dragY="dragY"
            :cardFloating="cardFloating" :floatX="floatX" :floatY="floatY"
            :doCardDown="doCardDown" :doCardMove="doCardMove"
            :doCardUp="doCardUp" :doCardCancel="doCardCancel"
          />
          <ReceiptSlot
            class="landscape:order-3"
            :portrait="portrait"
            :receiptVisible="receiptVisible" :receiptEjecting="receiptEjecting" :isReceiptDragging="isReceiptDragging"
            :dragX="dragX" :dragY="dragY"
            :receiptFloating="receiptFloating" :receiptFloatX="receiptFloatX" :receiptFloatY="receiptFloatY"
            :doReceiptDown="doReceiptDown" :doReceiptMove="doReceiptMove"
            :doReceiptUp="doReceiptUp" :doReceiptCancel="doReceiptCancel"
          />
        </div>
      </div>
    </div>

    <!-- Bottom row: Bills + Pocket (same in both orientations). -->
    <div
      class="w-full border-t border-[#888] flex flex-row"
      style="background: linear-gradient(160deg, #c0c0c0 0%, #8e8e8e 25%, #b0b0b0 55%, #c8c8c8 80%, #9a9a9a 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.35);"
    >
      <BillsTray
        :portrait="portrait" :billsVisible="billsVisible" :isBillsDragging="isBillsDragging"
        :dragX="dragX" :dragY="dragY"
        :billsFloating="billsFloating" :billsFloatX="billsFloatX" :billsFloatY="billsFloatY"
        :doBillsDown="doBillsDown" :doBillsMove="doBillsMove"
        :doBillsUp="doBillsUp" :doBillsCancel="doBillsCancel"
      />
      <PocketZone
        :portrait="portrait" :setPocketEl="setPocketEl"
        :cardVisible="cardVisible" :cardInReader="cardInReader" :swallowing="swallowing"
        :isDragging="isDragging" :dragX="dragX" :dragY="dragY"
        :cardFloating="cardFloating" :floatX="floatX" :floatY="floatY"
        :doCardDown="doCardDown" :doCardMove="doCardMove"
        :doCardUp="doCardUp" :doCardCancel="doCardCancel"
      />
    </div>
  </div>
</template>

<style scoped>
.screen-area {
  aspect-ratio: 4 / 3;
}
@media (orientation: landscape) {
  .screen-area {
    height: min(70dvh, 580px);
  }
  /* Landscape-only subtle inset highlight on chassis-block left edge
     (matches legacy visual) */
  .chassis-block {
    box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.35);
  }
}
</style>
