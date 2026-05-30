<script setup>
import { useAtmI18n } from "../composables/useAtmI18n.js";

const emit = defineEmits(["digit", "cancel", "clear", "confirm"]);

const { at } = useAtmI18n();
</script>

<template>
  <div class="atm-keypad-grid">
    <!-- Row 1 -->
    <button class="atm-key atm-key--digit" @click="emit('digit', '1')">1</button>
    <button class="atm-key atm-key--digit" @click="emit('digit', '2')">2</button>
    <button class="atm-key atm-key--digit" @click="emit('digit', '3')">3</button>
    <button class="atm-key atm-key--action atm-key--annulation" @click="emit('cancel')">
      <span class="atm-key__stripe atm-key__stripe--red" />
      {{ at("atm.keypad.cancel") }}
    </button>

    <!-- Row 2 -->
    <button class="atm-key atm-key--digit" @click="emit('digit', '4')">4</button>
    <button class="atm-key atm-key--digit" @click="emit('digit', '5')">5</button>
    <button class="atm-key atm-key--digit" @click="emit('digit', '6')">6</button>
    <button class="atm-key atm-key--action atm-key--correction" @click="emit('clear')">
      <span class="atm-key__stripe atm-key__stripe--amber" />
      {{ at("atm.keypad.correction") }}
    </button>

    <!-- Row 3 -->
    <button class="atm-key atm-key--digit" @click="emit('digit', '7')">7</button>
    <button class="atm-key atm-key--digit" @click="emit('digit', '8')">8</button>
    <button class="atm-key atm-key--digit" @click="emit('digit', '9')">9</button>
    <div class="atm-key atm-key--dead" />

    <!-- Row 4 -->
    <div class="atm-key atm-key--dead" />
    <button class="atm-key atm-key--digit" @click="emit('digit', '0')">0</button>
    <div class="atm-key atm-key--dead" />
    <button class="atm-key atm-key--action atm-key--validation" @click="emit('confirm')">
      <span class="atm-key__stripe atm-key__stripe--green" />
      {{ at("atm.keypad.validation") }}
    </button>
  </div>
</template>

<style scoped>
.atm-keypad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr) auto;
  grid-template-rows: repeat(4, auto);
  gap: 8px;
}

/* ── Base key ───────────────────────────────────────────────────────────── */
.atm-key {
  border-radius: 6px;
  min-height: 3rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-align: center;
  transition: transform 0.07s ease, box-shadow 0.07s ease, filter 0.07s ease;
  user-select: none;
  cursor: pointer;
  border: none;
  outline: none;
  position: relative;
  overflow: hidden;
}
.atm-key:active {
  transform: translateY(1px);
  filter: brightness(0.9);
}

/* ── Digit keys ─────────────────────────────────────────────────────────── */
.atm-key--digit {
  padding: 0.4rem 0.2rem;
  aspect-ratio: 1;
  background: linear-gradient(170deg,
    #c8d0d8 0%,
    #9aa4ae 30%,
    #7e8c98 60%,
    #9fadb8 100%
  );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3),
    inset 1px 0 0 rgba(255, 255, 255, 0.15),
    0 3px 5px rgba(0, 0, 0, 0.5),
    0 1px 2px rgba(0, 0, 0, 0.35);
  color: #1a222c;
  font-family: monospace;
  font-size: 1.1rem;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.45);
}
.atm-key--digit:active {
  box-shadow:
    inset 0 2px 5px rgba(0, 0, 0, 0.4),
    0 1px 1px rgba(0, 0, 0, 0.3);
}

/* ── Dead / empty keys ──────────────────────────────────────────────────── */
.atm-key--dead {
  background: linear-gradient(170deg,
    #c8d0d8 0%,
    #9aa4ae 30%,
    #7e8c98 60%,
    #9fadb8 100%
  );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3),
    inset 1px 0 0 rgba(255, 255, 255, 0.15),
    0 3px 5px rgba(0, 0, 0, 0.5),
    0 1px 2px rgba(0, 0, 0, 0.35);
  cursor: default;
  pointer-events: none;
}

/* ── Action keys (steel body + colored stripe) ──────────────────────────── */
.atm-key--action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0.55rem 0.6rem;
  white-space: nowrap;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: linear-gradient(170deg,
    #c0c8d0 0%,
    #8e9aa6 30%,
    #727e8a 60%,
    #8c9aa6 100%
  );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3),
    0 3px 5px rgba(0, 0, 0, 0.5);
  color: #1a222c;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
}
.atm-key--action:active {
  box-shadow:
    inset 0 2px 5px rgba(0, 0, 0, 0.4),
    0 1px 1px rgba(0, 0, 0, 0.3);
}

/* ── Colored stripe indicator ───────────────────────────────────────────── */
.atm-key__stripe {
  display: block;
  width: 70%;
  height: 4px;
  border-radius: 2px;
}
.atm-key__stripe--red   { background: #dc2626; box-shadow: 0 0 4px rgba(220,38,38,0.6); }
.atm-key__stripe--amber { background: #d97706; box-shadow: 0 0 4px rgba(217,119,6,0.6); }
.atm-key__stripe--green { background: #16a34a; box-shadow: 0 0 4px rgba(22,163,74,0.6); }
</style>
