<script setup>
import { useAtmI18n } from "../../composables/useAtmI18n.js";
import DraggableReceipt from "../draggables/DraggableReceipt.vue";

const { at } = useAtmI18n();

const props = defineProps({
  portrait: Boolean,
  receiptVisible: Boolean,
  receiptEjecting: Boolean,
  isReceiptDragging: Boolean,
  dragX: Number,
  dragY: Number,
  receiptFloating: Boolean,
  receiptFloatX: Number,
  receiptFloatY: Number,
  doReceiptDown: Function,
  doReceiptMove: Function,
  doReceiptUp: Function,
  doReceiptCancel: Function,
});
</script>

<template>
  <!-- ── Landscape receipt slot ─────────────────────────────────────────────── -->
  <div v-if="!portrait" class="w-full flex flex-col items-center gap-1">
    <div class="relative flex flex-col items-center w-full" style="z-index:20">
      <div class="flex flex-col items-center rounded-lg"
           style="background: linear-gradient(180deg, #5a6470 0%, #3d4550 40%, #2e3540 100%); padding: 6px 10px 8px; width: 100%; box-shadow: inset 0 2px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.25);">
        <div style="border: 1px solid rgba(255,255,255,0.12); border-radius: 4px; padding: 6px 8px 0; width: 100%; display:flex; flex-direction:column; align-items:center;">
          <div class="relative flex items-center justify-center"
               style="width: var(--receipt-slot-w); height: 18px; background: #0a0c10; border-radius: 1px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.95);">
            <span v-if="!receiptVisible" class="text-[7px] tracking-wider uppercase select-none"
                  style="color: rgba(255,255,255,0.22);">{{ at("atm.chassis.slotReceipt") }}</span>
          </div>
          <div class="w-full mt-1 mb-1"
               style="height: 2px; border-radius: 1px; background: linear-gradient(90deg, transparent 0%, #e0a000 20%, #ffc800 50%, #e0a000 80%, transparent 100%); box-shadow: 0 0 5px rgba(255,180,0,0.6);" />
        </div>
      </div>
      <div v-if="receiptVisible"
           :class="receiptEjecting ? 'eject-container' : ''"
           style="--peek-h:var(--receipt-peek-h); position:absolute; top:100%; left:50%; margin-left:calc(var(--receipt-w) / -2); width:var(--receipt-w); height:var(--receipt-peek-h); overflow:hidden;">
        <DraggableReceipt
          :portrait="false"
          :isReceiptDragging :dragX :dragY :receiptFloating :receiptFloatX :receiptFloatY
          :doDown="doReceiptDown"
          :doMove="doReceiptMove"
          :doUp="doReceiptUp"
          :doCancel="doReceiptCancel"
        />
      </div>
    </div>
  </div>

  <!-- ── Portrait receipt slot ──────────────────────────────────────────────── -->
  <div v-else class="relative flex flex-col items-center">
    <div class="flex flex-col items-center rounded-md"
         style="background: linear-gradient(180deg, #5a6470 0%, #2e3540 100%); padding: 5px 8px 7px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.6);">
      <div style="border: 1px solid rgba(255,255,255,0.10); border-radius: 3px; padding: 4px 6px 0; display:flex; flex-direction:column; align-items:center;">
        <div style="width: var(--receipt-slot-w); height: 14px; background: #0a0c10; border-radius: 1px; box-shadow: inset 0 2px 3px rgba(0,0,0,0.9);"/>
        <div class="w-full mt-1"
             style="height: 2px; border-radius: 1px; background: linear-gradient(90deg, transparent, #e0a000, #ffc800, #e0a000, transparent); box-shadow: 0 0 4px rgba(255,180,0,0.5);" />
      </div>
    </div>
    <div v-if="receiptVisible"
         :class="receiptEjecting ? 'eject-container' : ''"
         style="--peek-h:var(--receipt-peek-h); position:absolute; top:100%; left:50%; margin-left:calc(var(--receipt-w) / -2); width:var(--receipt-w); height:var(--receipt-peek-h); overflow:hidden;">
      <DraggableReceipt
        :portrait="true"
        :isReceiptDragging :dragX :dragY :receiptFloating :receiptFloatX :receiptFloatY
        :doDown="doReceiptDown"
        :doMove="doReceiptMove"
        :doUp="doReceiptUp"
        :doCancel="doReceiptCancel"
      />
    </div>
  </div>
</template>

<style scoped>
.eject-container {
  animation: eject-peek 3s ease-out forwards;
}
@keyframes eject-peek {
  0%   { height: 0; }
  10%  { height: 0; }
  100% { height: var(--peek-h); }
}
</style>
