import { ref } from "vue";

const currentUser = ref(null);
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
