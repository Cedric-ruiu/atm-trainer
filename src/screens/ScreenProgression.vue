<script setup>
import { inject, ref, watch } from "vue";
import AtmScreenLayout from "../components/AtmScreenLayout.vue";
import { useAtmState } from "../composables/useAtmState.js";
import { useProgression } from "../composables/useProgression.js";
import { useSession } from "../composables/useSession.js";

const { navigate } = useAtmState();
const { currentUser } = useSession();
const { generatePin, loadUsers, saveUser } = useProgression();

const keypadBus = inject("keypadBus");

// "name" | "pin"
const step = ref("name");
const name = ref("");
const nameError = ref("");

// "enter" | "generate"
const pinMode = ref(null);
const pinDigits = ref([]);
const generatedPin = ref("");
const pinError = ref("");

const selectedExisting = ref(null);
const showPinChange = ref(false);

const existingUsers = ref(loadUsers());

function selectExistingUser(user) {
  name.value = user.name;
  selectedExisting.value = user;
  nameError.value = "";
  showPinChange.value = false;
  pinMode.value = null;
  pinDigits.value = [];
  generatedPin.value = "";
  pinError.value = "";
  step.value = "pin";
}

function goToPin() {
  if (!name.value.trim()) {
    nameError.value = "Le nom est obligatoire";
    return;
  }
  const existing = loadUsers().find(
    (u) => u.name.toLowerCase() === name.value.trim().toLowerCase(),
  );
  if (existing) {
    selectExistingUser(existing);
    return;
  }
  selectedExisting.value = null;
  nameError.value = "";
  step.value = "pin";
}

function selectPinMode(mode) {
  pinMode.value = mode;
  pinDigits.value = [];
  generatedPin.value = "";
  pinError.value = "";
  if (mode === "generate") {
    generatedPin.value = generatePin();
  }
}

function onDigit(d) {
  if (pinDigits.value.length < 4) {
    pinDigits.value = [...pinDigits.value, d];
    pinError.value = "";
  }
}

function onClear() {
  pinDigits.value = pinDigits.value.slice(0, -1);
  pinError.value = "";
}

function submit() {
  if (selectedExisting.value && !showPinChange.value) {
    currentUser.value = selectedExisting.value;
    navigate("ScreenStats");
    return;
  }

  if (!pinMode.value) {
    pinError.value = "Choisissez une option pour le code PIN";
    return;
  }
  if (pinMode.value === "enter" && pinDigits.value.length < 4) {
    pinError.value = "Le code PIN doit contenir 4 chiffres";
    return;
  }

  const pin =
    pinMode.value === "generate"
      ? generatedPin.value
      : pinDigits.value.join("");
  const base =
    selectedExisting.value ??
    loadUsers().find(
      (u) => u.name.toLowerCase() === name.value.trim().toLowerCase(),
    );
  const user = {
    id: base?.id ?? crypto.randomUUID(),
    name: name.value.trim(),
    pin,
    sessions: base?.sessions ?? [],
  };

  saveUser(user);
  currentUser.value = user;
  navigate("ScreenStats");
}

watch(keypadBus, (event) => {
  if (!event) return;
  if (step.value !== "pin" || pinMode.value !== "enter") return;
  if (event.type === "digit") onDigit(event.payload);
  if (event.type === "clear") onClear();
  if (event.type === "confirm") submit();
  if (event.type === "cancel") step.value = "name";
});
</script>

<template>
  <AtmScreenLayout :warn="false">
    <div class="flex-1 flex flex-col items-center justify-center gap-6 px-8 py-4">
      <h1 class="text-lg font-black tracking-widest uppercase text-white text-center">
        PROGRESSION UTILISATEUR
      </h1>

      <!-- Étape 1 — Nom -->
      <template v-if="step === 'name'">
        <div class="w-full max-w-xs flex flex-col gap-4">
          <label class="text-white/70 font-bold text-xs uppercase tracking-widest">
            Nom de l'utilisateur
          </label>
          <input
            v-model="name"
            type="text"
            placeholder="Saisissez un nom…"
            class="w-full rounded-xl px-5 py-4 text-white text-base font-mono tracking-wide focus:outline-none placeholder-white/30"
            style="background: rgba(0,0,0,0.35); border: 1.5px solid #00b4c8"
            @keydown.enter="goToPin"
          />
          <p v-if="nameError" class="text-sm font-bold" style="color: #f0c040">{{ nameError }}</p>

          <!-- Utilisateurs existants -->
          <div v-if="existingUsers.length" class="flex flex-col gap-2 mt-1">
            <p class="text-white/40 text-xs uppercase tracking-widest">Utilisateurs existants</p>
            <button
              v-for="user in existingUsers"
              :key="user.id"
              class="w-full px-5 py-3 rounded-xl text-left text-white font-bold tracking-wide transition-colors border"
              style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2)"
              @click="selectExistingUser(user)"
            >
              {{ user.name }}
            </button>
          </div>
        </div>

        <div class="flex gap-4 w-full max-w-xs">
          <button
            class="flex-1 px-6 py-4 rounded-xl text-white text-base font-bold tracking-wide transition-colors border"
            style="background: rgba(0,180,200,0.22); border-color: rgba(0,180,200,0.5)"
            @click="goToPin"
          >
            Suivant
          </button>
          <button
            class="px-5 py-4 rounded-xl text-white/70 font-bold tracking-wide transition-colors border"
            style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2)"
            @click="navigate('ScreenAccueil')"
          >
            Retour
          </button>
        </div>
      </template>

      <!-- Étape 2 — PIN -->
      <template v-else>
        <p class="text-white/70 text-sm text-center">
          Code PIN pour <span class="text-white font-bold">{{ name }}</span>
        </p>

        <button
          v-if="selectedExisting && !showPinChange"
          class="px-5 py-2 rounded-xl text-white/70 text-sm font-bold tracking-wide transition-colors border"
          style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2)"
          @click="showPinChange = true"
        >
          Modifier le code PIN
        </button>

        <div v-if="!selectedExisting || showPinChange" class="flex gap-3 w-full max-w-xs">
          <button
            class="flex-1 px-4 py-4 rounded-xl text-sm font-bold tracking-wide transition-colors border-2"
            :style="pinMode === 'enter'
              ? 'background: rgba(0,180,200,0.22); border-color: #00b4c8; color: white'
              : 'background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.6)'"
            @click="selectPinMode('enter')"
          >
            Entrer le code
          </button>
          <button
            class="flex-1 px-4 py-4 rounded-xl text-sm font-bold tracking-wide transition-colors border-2"
            :style="pinMode === 'generate'
              ? 'background: rgba(0,180,200,0.22); border-color: #00b4c8; color: white'
              : 'background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.6)'"
            @click="selectPinMode('generate')"
          >
            Générer
          </button>
        </div>

        <!-- Saisie manuelle -->
        <template v-if="(!selectedExisting || showPinChange) && pinMode === 'enter'">
          <div class="flex gap-5">
            <div
              v-for="i in 4"
              :key="i"
              class="w-10 h-10 rounded-full border-2 transition-colors"
              :style="i <= pinDigits.length
                ? 'border-color: #00b4c8; background: #00b4c8'
                : 'border-color: rgba(255,255,255,0.4); background: transparent'"
            />
          </div>
          <p class="text-white/40 text-xs tracking-widest uppercase">
            Utilisez le clavier à droite
          </p>
        </template>

        <!-- Code généré -->
        <template v-else-if="(!selectedExisting || showPinChange) && pinMode === 'generate'">
          <div class="rounded-xl px-10 py-5 text-center" style="background: rgba(0,0,0,0.4); border: 1.5px solid #00b4c8">
            <p class="text-white/50 text-xs uppercase tracking-widest mb-2">Code provisoire</p>
            <p class="text-5xl font-bold font-mono tracking-[0.25em]" style="color: #f0c040">
              {{ generatedPin }}
            </p>
          </div>
          <p class="text-sm font-bold tracking-wide text-center" style="color: #f0c040">
            Notez ce code avant de continuer
          </p>
        </template>

        <p v-if="pinError" class="text-sm font-bold" style="color: #f0c040">{{ pinError }}</p>

        <div v-if="(!selectedExisting || showPinChange) ? pinMode !== 'enter' : true" class="flex gap-4 w-full max-w-xs">
          <button
            class="flex-1 px-6 py-4 rounded-xl text-white text-base font-bold tracking-wide transition-colors border"
            style="background: rgba(0,180,200,0.22); border-color: rgba(0,180,200,0.5)"
            @click="submit"
          >
            Suivant
          </button>
          <button
            class="px-5 py-4 rounded-xl text-white/70 font-bold tracking-wide transition-colors border"
            style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2)"
            @click="step = 'name'"
          >
            Retour
          </button>
        </div>
        <div v-else-if="!selectedExisting || showPinChange" class="w-full max-w-xs">
          <button
            class="px-5 py-3 rounded-xl text-white/60 text-sm font-bold tracking-wide transition-colors border"
            style="background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2)"
            @click="step = 'name'"
          >
            ← Retour
          </button>
        </div>
      </template>

    </div>
  </AtmScreenLayout>
</template>
