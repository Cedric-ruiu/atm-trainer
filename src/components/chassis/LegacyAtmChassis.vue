<script setup>
// LEGACY CHASSIS — exact duplicate of the pre-step-5 template (dual v-if branches
// for portrait/landscape). Fallback activated via `?legacy` URL flag. DO NOT
// refactor — this component exists so users can rollback if the unified layout
// has a regression. To be removed once AtmChassis.vue is validated on tablets.
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
  // Shared
  dragX: Number,
  dragY: Number,
  // Card
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
  // Receipt
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
  // Bills
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
  <!-- ═══════════════════════════════════════════════ LANDSCAPE LAYOUT ══════ -->
  <template v-if="!portrait">
    <div class="atm-chassis flex flex-col max-w-[1280px] w-full rounded-2xl shadow-2xl overflow-hidden border border-[#888]">
      <div class="flex flex-row items-stretch">

        <!-- Screen -->
        <div class="shrink-0 bg-gray-50 flex flex-col overflow-hidden"
             style="aspect-ratio: 4/3; height: min(70dvh, 580px);">
          <slot />
        </div>

        <!-- Chassis column -->
        <div class="flex-1 min-w-0 flex flex-col items-center gap-3 p-4 border-l border-[#888]"
             style="background: linear-gradient(160deg, #c0c0c0 0%, #8e8e8e 25%, #b0b0b0 55%, #c8c8c8 80%, #9a9a9a 100%); box-shadow: inset 1px 0 0 rgba(255,255,255,0.35);">

          <CardReader
            :portrait="false" :setSlotEl
            :cardVisible :cardInReader :swallowing :ejecting
            :isDragging :dragX :dragY :cardFloating :floatX :floatY
            :doCardDown :doCardMove :doCardUp :doCardCancel
          />

          <div class="w-full flex-1 flex flex-col items-center gap-2">
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

          <ReceiptSlot
            :portrait="false"
            :receiptVisible :receiptEjecting :isReceiptDragging
            :dragX :dragY :receiptFloating :receiptFloatX :receiptFloatY
            :doReceiptDown :doReceiptMove :doReceiptUp :doReceiptCancel
          />
        </div>
      </div>

      <!-- Bottom row: Bills + Pocket -->
      <div class="w-full border-t border-[#888] flex flex-row"
           style="background: linear-gradient(160deg, #c0c0c0 0%, #8e8e8e 25%, #b0b0b0 55%, #c8c8c8 80%, #9a9a9a 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.35);">
        <BillsTray
          :portrait="false" :billsVisible :isBillsDragging
          :dragX :dragY :billsFloating :billsFloatX :billsFloatY
          :doBillsDown :doBillsMove :doBillsUp :doBillsCancel
        />
        <PocketZone
          :portrait="false" :setPocketEl
          :cardVisible :cardInReader :swallowing
          :isDragging :dragX :dragY :cardFloating :floatX :floatY
          :doCardDown :doCardMove :doCardUp :doCardCancel
        />
      </div>
    </div>
  </template>

  <!-- ═══════════════════════════════════════════════ PORTRAIT LAYOUT ═══════ -->
  <template v-else>
    <div class="atm-chassis flex flex-col max-w-[700px] w-full rounded-2xl shadow-2xl overflow-hidden border border-[#888]">

      <!-- Screen -->
      <div class="w-full bg-gray-50 flex flex-col" style="aspect-ratio: 4/3;">
        <slot />
      </div>

      <!-- Keypad + Card reader + Receipt row -->
      <div class="w-full flex flex-row border-t border-[#888]"
           style="background: linear-gradient(160deg, #c0c0c0 0%, #8e8e8e 25%, #b0b0b0 55%, #c8c8c8 80%, #9a9a9a 100%);">

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

        <div class="flex flex-col border-l border-[#888] p-3 gap-12 items-center justify-center">
          <CardReader
            :portrait="true" :setSlotEl
            :cardVisible :cardInReader :swallowing :ejecting
            :isDragging :dragX :dragY :cardFloating :floatX :floatY
            :doCardDown :doCardMove :doCardUp :doCardCancel
          />
          <ReceiptSlot
            :portrait="true"
            :receiptVisible :receiptEjecting :isReceiptDragging
            :dragX :dragY :receiptFloating :receiptFloatX :receiptFloatY
            :doReceiptDown :doReceiptMove :doReceiptUp :doReceiptCancel
          />
        </div>
      </div>

      <!-- Bills + Pocket row -->
      <div class="w-full flex flex-row border-t border-[#888]"
           style="background: linear-gradient(160deg, #c0c0c0 0%, #8e8e8e 25%, #b0b0b0 55%, #c8c8c8 80%, #9a9a9a 100%);">
        <BillsTray
          :portrait="true" :billsVisible :isBillsDragging
          :dragX :dragY :billsFloating :billsFloatX :billsFloatY
          :doBillsDown :doBillsMove :doBillsUp :doBillsCancel
        />
        <PocketZone
          :portrait="true" :setPocketEl
          :cardVisible :cardInReader :swallowing
          :isDragging :dragX :dragY :cardFloating :floatX :floatY
          :doCardDown :doCardMove :doCardUp :doCardCancel
        />
      </div>
    </div>
  </template>
</template>
