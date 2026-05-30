import { ref } from "vue";
import { resetAtmLocale } from "./useAtmLocale.js";
import { useProgression } from "./useProgression.js";

const { loadUser, saveUser } = useProgression();

const isBrowser = typeof window !== "undefined";
let stored = isBrowser ? loadUser() : null;
if (isBrowser && !stored) {
  stored = { pin: null, sessions: [], streak: 0, bestStreak: 0, objectif: 5 };
  saveUser(stored);
}

const currentUser = ref(stored);
const selectedAmount = ref(0);
const pinAttempts = ref(0);
const transactionType = ref(null); // "express" | "montant" | null
const solde = ref(200);

export function useSession() {
  function setSelectedAmount(amount) {
    selectedAmount.value = amount;
  }

  function setTransactionType(type) {
    transactionType.value = type;
  }

  function resetSession() {
    selectedAmount.value = 0;
    pinAttempts.value = 0;
    transactionType.value = null;
    resetAtmLocale(); // ré-synchronise la langue du DAB sur la langue d'interface
    // currentUser and solde are preserved across resets
  }

  function deductAmount() {
    solde.value -= selectedAmount.value;
  }

  return {
    currentUser,
    selectedAmount,
    pinAttempts,
    transactionType,
    solde,
    setSelectedAmount,
    setTransactionType,
    resetSession,
    deductAmount,
  };
}
