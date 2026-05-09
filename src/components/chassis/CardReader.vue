<script setup>
import DraggableCard from "../draggables/DraggableCard.vue";

const props = defineProps({
  portrait: Boolean,
  setSlotEl: Function,  // function ref: called with the slot DOM element on mount/unmount
  cardVisible: Boolean,
  cardInReader: Boolean,
  swallowing: Boolean,
  ejecting: Boolean,
  isDragging: Boolean,
  dragX: Number,
  dragY: Number,
  cardFloating: Boolean,
  floatX: Number,
  floatY: Number,
  doCardDown: Function,
  doCardMove: Function,
  doCardUp: Function,
  doCardCancel: Function,
});
</script>

<template>
  <!-- ── Landscape card reader ─────────────────────────────────────────────── -->
  <div v-if="!portrait" class="w-full flex flex-col items-center gap-1">
    <div class="relative flex flex-col items-center w-full">
      <div class="flex flex-col items-center rounded-lg"
           style="background: linear-gradient(180deg, #5a6470 0%, #3d4550 40%, #2e3540 100%); padding: 6px 10px 8px; width: 100%; box-shadow: inset 0 2px 6px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.25);">
        <div style="border: 1px solid rgba(255,255,255,0.12); border-radius: 4px; padding: 6px 8px 0; width: 100%; display:flex; flex-direction:column; align-items:center;">
          <div :ref="setSlotEl"
               class="relative flex items-center justify-center"
               style="width: var(--card-slot-w); height: 22px; background: #0a0c10; border-radius: 2px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.9), inset 0 0 8px rgba(0,0,0,0.8);">
            <span v-if="!cardInReader" class="text-[7px] tracking-wider uppercase select-none"
                  style="color: rgba(255,255,255,0.25);">insérer ›</span>
          </div>
          <div class="w-full mt-1 mb-1"
               style="height: 3px; border-radius: 1px; background: linear-gradient(90deg, transparent 0%, #00e060 20%, #00ff70 50%, #00e060 80%, transparent 100%); box-shadow: 0 0 6px rgba(0,255,80,0.7), 0 0 12px rgba(0,255,80,0.3);" />
        </div>
      </div>
      <div v-if="cardVisible && cardInReader && !swallowing"
           :class="ejecting ? 'eject-container' : ''"
           style="--peek-h:var(--card-peek-h); position:absolute; top:100%; left:50%; margin-left:calc(var(--card-w) / -2); width:var(--card-w); height:var(--card-peek-h); overflow:hidden;">
        <DraggableCard
          :portrait="false"
          placement="reader"
          :isDragging :dragX :dragY :cardFloating :floatX :floatY
          :doDown="doCardDown"
          :doMove="doCardMove"
          :doUp="doCardUp"
          :doCancel="doCardCancel"
        />
      </div>
    </div>
  </div>

  <!-- ── Portrait card reader ──────────────────────────────────────────────── -->
  <div v-else class="relative flex flex-col items-center">
    <div class="flex flex-col items-center rounded-md"
         style="background: linear-gradient(180deg, #5a6470 0%, #2e3540 100%); padding: 5px 8px 7px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.6);">
      <div style="border: 1px solid rgba(255,255,255,0.10); border-radius: 3px; padding: 4px 6px 0; display:flex; flex-direction:column; align-items:center;">
        <div :ref="setSlotEl"
             style="width: var(--card-slot-w); height: 16px; background: #0a0c10; border-radius: 2px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.9);" />
        <div class="w-full mt-1"
             style="height: 3px; border-radius: 1px; background: linear-gradient(90deg, transparent, #00e060, #00ff70, #00e060, transparent); box-shadow: 0 0 6px rgba(0,255,80,0.7);" />
      </div>
    </div>
    <div v-if="cardVisible && cardInReader && !swallowing"
         :class="ejecting ? 'eject-container' : ''"
         style="--peek-h:var(--card-peek-h); position:absolute; top:100%; left:50%; margin-left:calc(var(--card-w) / -2); width:var(--card-w); height:var(--card-peek-h); overflow:hidden;">
      <DraggableCard
        :portrait="true"
        placement="reader"
        :isDragging :dragX :dragY :cardFloating :floatX :floatY
        :doDown="doCardDown"
        :doMove="doCardMove"
        :doUp="doCardUp"
        :doCancel="doCardCancel"
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
