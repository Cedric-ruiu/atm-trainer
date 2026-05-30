<script setup>
import { useAtmI18n } from "../../composables/useAtmI18n.js";
import DraggableBills from "../draggables/DraggableBills.vue";

const { at } = useAtmI18n();

const props = defineProps({
  portrait: Boolean,
  billsVisible: Boolean,
  isBillsDragging: Boolean,
  dragX: Number,
  dragY: Number,
  billsFloating: Boolean,
  billsFloatX: Number,
  billsFloatY: Number,
  doBillsDown: Function,
  doBillsMove: Function,
  doBillsUp: Function,
  doBillsCancel: Function,
});
</script>

<template>
  <!-- ── Landscape bill tray ────────────────────────────────────────────────── -->
  <div v-if="!portrait" class="flex-1 px-4 py-4 flex flex-col items-center gap-1">
    <div class="flex flex-col items-center rounded-xl"
         style="background: linear-gradient(180deg, #4a5460 0%, #3a4450 50%, #2e3840 100%); padding: 8px 10px 10px; width: 100%; max-width: 330px; box-shadow: inset 0 3px 8px rgba(0,0,0,0.7), 0 2px 0 rgba(255,255,255,0.2);">
      <div style="border: 1px solid rgba(255,255,255,0.12); border-radius: 4px; padding: 6px 8px 0; width: 100%; display:flex; flex-direction:column; align-items:center;">
        <div class="relative flex items-center justify-center"
             style="width: var(--bills-slot-w); height: 18px; background: #0a0c10; border-radius: 2px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.95);">
          <span v-if="!billsVisible" class="text-[7px] tracking-wider uppercase select-none"
                style="color: rgba(255,255,255,0.2);">{{ at("atm.chassis.slotBills") }}</span>
        </div>
        <div class="w-full mt-1 mb-1"
             style="height: 3px; border-radius: 1px; background: linear-gradient(90deg, transparent 0%, #0090e0 20%, #00b8ff 50%, #0090e0 80%, transparent 100%); box-shadow: 0 0 6px rgba(0,170,255,0.6);" />
      </div>
    </div>
    <div v-if="billsVisible"
         style="width:var(--bills-w); height:var(--bills-visible-h); overflow:hidden; position:relative; margin-top:-4px;">
      <DraggableBills
        :portrait="false"
        :isBillsDragging :dragX :dragY :billsFloating :billsFloatX :billsFloatY
        :doDown="doBillsDown"
        :doMove="doBillsMove"
        :doUp="doBillsUp"
        :doCancel="doBillsCancel"
      />
    </div>
  </div>

  <!-- ── Portrait bill tray ─────────────────────────────────────────────────── -->
  <div v-else class="flex-1 p-3 border-r border-[#888] flex flex-col items-center gap-2">
    <div class="w-full flex flex-col items-center rounded-md"
         style="background: linear-gradient(180deg, #4a5460 0%, #2e3840 100%); padding: 6px 8px 8px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.6);">
      <div style="border: 1px solid rgba(255,255,255,0.10); border-radius: 3px; padding: 5px 8px 0; width: 100%; display:flex; flex-direction:column; align-items:center;">
        <div style="width: var(--bills-slot-w); height: 14px; background: #0a0c10; border-radius: 1px; box-shadow: inset 0 2px 3px rgba(0,0,0,0.9);"/>
        <div class="w-full mt-1"
             style="height: 3px; border-radius: 1px; background: linear-gradient(90deg, transparent, #0090e0, #00b8ff, #0090e0, transparent); box-shadow: 0 0 5px rgba(0,170,255,0.6);" />
      </div>
    </div>
    <div v-if="billsVisible"
         style="width:var(--bills-w); height:var(--bills-visible-h); overflow:hidden; position:relative; margin-top:-8px;">
      <DraggableBills
        :portrait="true"
        :isBillsDragging :dragX :dragY :billsFloating :billsFloatX :billsFloatY
        :doDown="doBillsDown"
        :doMove="doBillsMove"
        :doUp="doBillsUp"
        :doCancel="doBillsCancel"
      />
    </div>
  </div>
</template>
