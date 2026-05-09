<script setup>
import DraggableCard from "../draggables/DraggableCard.vue";

const props = defineProps({
  portrait: Boolean,
  setPocketEl: Function,  // function ref: called with the drop zone DOM element on mount/unmount
  cardVisible: Boolean,
  cardInReader: Boolean,
  swallowing: Boolean,
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
  <!-- ── Landscape pocket ───────────────────────────────────────────────────── -->
  <div v-if="!portrait" class="w-[280px] shrink-0 border-l-2 flex flex-col"
       style="border-color: #7a5412; background: linear-gradient(170deg, #2e1a06 0%, #1e1004 100%);">
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
    <div :ref="setPocketEl"
         class="flex-1 flex items-center justify-center"
         style="padding: 16px 12px; min-height: 200px; background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 8px);">
      <div v-if="!cardVisible || cardInReader"
           style="border: 2px dashed rgba(200,150,60,0.22); border-radius:10px; width:130px; height:190px; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:8px;">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style="opacity:0.3;">
          <path d="M16 6v16M8 14l8 8 8-8" stroke="#c8a060" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span style="font-size:8px; color:rgba(200,150,60,0.35); text-transform:uppercase; letter-spacing:1.5px; text-align:center; line-height:1.6;">glissez<br>ici</span>
      </div>
      <div style="width: var(--card-w); height: var(--card-h);">
        <DraggableCard
          v-if="cardVisible && !cardInReader && !swallowing"
          :portrait="false"
          placement="pocket"
          :isDragging :dragX :dragY :cardFloating :floatX :floatY
          :doDown="doCardDown"
          :doMove="doCardMove"
          :doUp="doCardUp"
          :doCancel="doCardCancel"
        />
      </div>
    </div>
  </div>

  <!-- ── Portrait pocket ────────────────────────────────────────────────────── -->
  <div v-else class="flex-1 flex flex-col border-l-2"
       style="border-color: #7a5412; background: linear-gradient(170deg, #2e1a06 0%, #1e1004 100%);">
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
    <div :ref="setPocketEl"
         class="flex-1 flex items-center justify-center"
         style="padding: 12px 8px; min-height: 130px; background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 8px);">
      <div v-if="!cardVisible || cardInReader"
           style="border: 2px dashed rgba(200,150,60,0.22); border-radius:8px; width:96px; height:140px; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:6px;">
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none" style="opacity:0.3;">
          <path d="M16 6v16M8 14l8 8 8-8" stroke="#c8a060" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span style="font-size:7px; color:rgba(200,150,60,0.35); text-transform:uppercase; letter-spacing:1px; text-align:center; line-height:1.6;">glissez<br>ici</span>
      </div>
      <div style="width: var(--card-w); height: var(--card-h);">
        <DraggableCard
          v-if="cardVisible && !cardInReader && !swallowing"
          :portrait="true"
          placement="pocket"
          :isDragging :dragX :dragY :cardFloating :floatX :floatY
          :doDown="doCardDown"
          :doMove="doCardMove"
          :doUp="doCardUp"
          :doCancel="doCardCancel"
        />
      </div>
    </div>
  </div>
</template>
