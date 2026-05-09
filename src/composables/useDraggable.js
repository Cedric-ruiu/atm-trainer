// Per-instance factory — NO module-level refs.
// Each call creates independent drag state. Safe to call multiple times in one component.
import { ref } from "vue";

export function useDraggable({
  posX,         // external ref — composable writes cursor X (shared across instances OK since mutex)
  posY,         // external ref — composable writes cursor Y
  dropZones = {},  // { name: domRef } or { name: { ref, mode?, overlap?, tolerancePx? } }
  enabled,      // optional ref/computed → boolean
  onStart,      // () => void — fired on pointerdown before drag begins
  onDrop,       // (zoneName) => void — fired on pointerup inside a zone
  onProximity,  // (zoneName) => void — fired mid-drag when hit (stops drag immediately)
  onDropOutside, // (x, y) => void — fired on pointerup outside all zones
} = {}) {
  const isDragging = ref(false);
  const cardSize = ref({ w: 0, h: 0 });
  const offX = ref(0);
  const offY = ref(0);
  let elW = 0;
  let elH = 0;
  let zoneRects = {};
  let _vpW = 0;
  let _vpH = 0;

  function _isEnabled() {
    if (enabled === undefined) return true;
    if (typeof enabled === "function") return enabled();
    return enabled?.value ?? true;
  }

  function _buildZoneRects() {
    zoneRects = {};
    const zones = typeof dropZones === "function" ? dropZones() : dropZones;
    for (const [name, def] of Object.entries(zones)) {
      const zoneRef = def?.ref ?? def;
      const el = zoneRef?.value;
      if (!el) continue;
      zoneRects[name] = {
        rect: el.getBoundingClientRect(),
        mode: def?.mode ?? "center-in",
        overlap: def?.overlap ?? 0.8,
        tolerancePx: def?.tolerancePx ?? 8,
        proximity: def?.proximity ?? false,
      };
    }
  }

  function _checkHit(cx, cy, zone) {
    const { rect, mode, overlap, tolerancePx } = zone;
    if (mode === "edge-top+overlap") {
      const top = cy - elH / 2;
      if (top < rect.top - tolerancePx || top > rect.bottom + tolerancePx) return false;
      const left = cx - elW / 2;
      const right = cx + elW / 2;
      const ol = Math.max(left, rect.left);
      const or2 = Math.min(right, rect.right);
      return Math.max(0, or2 - ol) / elW >= overlap;
    }
    return cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom;
  }

  function onPointerDown(e) {
    if (!_isEnabled()) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    elW = rect.width;
    elH = rect.height;
    cardSize.value = { w: elW, h: elH };
    offX.value = e.clientX - (rect.left + rect.width / 2);
    offY.value = e.clientY - (rect.top + rect.height / 2);
    posX.value = Math.round(e.clientX - offX.value);
    posY.value = Math.round(e.clientY - offY.value);
    _vpW = window.innerWidth;
    _vpH = window.innerHeight;
    _buildZoneRects();
    isDragging.value = true;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    onStart?.();
  }

  function onPointerMove(e) {
    if (!isDragging.value) return;
    if (window.innerWidth !== _vpW || window.innerHeight !== _vpH) {
      _vpW = window.innerWidth;
      _vpH = window.innerHeight;
      _buildZoneRects();
    }
    const cx = e.clientX - offX.value;
    const cy = e.clientY - offY.value;
    posX.value = Math.round(cx);
    posY.value = Math.round(cy);

    if (onProximity) {
      for (const [name, zone] of Object.entries(zoneRects)) {
        if (!zone.proximity) continue;
        if (_checkHit(cx, cy, zone)) {
          isDragging.value = false;
          try { e.currentTarget?.releasePointerCapture(e.pointerId); } catch (_) {}
          onProximity(name);
          return;
        }
      }
    }
  }

  function onPointerUp(e) {
    if (!isDragging.value) return;
    isDragging.value = false;
    try { e.currentTarget?.releasePointerCapture(e.pointerId); } catch (_) {}
    const cx = e.clientX - offX.value;
    const cy = e.clientY - offY.value;

    for (const [name, zone] of Object.entries(zoneRects)) {
      if (_checkHit(cx, cy, zone)) {
        onDrop?.(name);
        return;
      }
    }
    onDropOutside?.(cx, cy);
  }

  function onPointerCancel() {
    isDragging.value = false;
    zoneRects = {};
  }

  // Called by parent watch(currentScreen) to force-reset state on screen change
  function cancel() {
    isDragging.value = false;
    zoneRects = {};
  }

  return { isDragging, cardSize, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, cancel };
}
