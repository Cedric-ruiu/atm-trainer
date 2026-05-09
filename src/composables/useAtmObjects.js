// Module-level singleton — refs shared across all callers.
// provide() is called inside setup context (AtmShell) so injection is scoped correctly.
import { provide, ref } from "vue";

const cardVisible = ref(false);
const receiptVisible = ref(false);
const billsVisible = ref(false);
const onCardClick = ref(null);
const onReceiptClick = ref(null);
const onBillsClick = ref(null);
const keypadBus = ref(null);
const cardInReader = ref(false);

export function useAtmObjects() {
  provide("cardVisible", cardVisible);
  provide("receiptVisible", receiptVisible);
  provide("billsVisible", billsVisible);
  provide("onCardClick", onCardClick);
  provide("onReceiptClick", onReceiptClick);
  provide("onBillsClick", onBillsClick);
  provide("keypadBus", keypadBus);
  provide("cardInReader", cardInReader);

  function resetAll() {
    cardVisible.value = false;
    receiptVisible.value = false;
    billsVisible.value = false;
    onCardClick.value = null;
    onReceiptClick.value = null;
    onBillsClick.value = null;
    keypadBus.value = null;
    cardInReader.value = false;
  }

  const card = {
    show({ inReader = false, onExtract = null } = {}) {
      cardVisible.value = true;
      if (inReader) cardInReader.value = true;
      if (onExtract) onCardClick.value = onExtract;
    },
    hide() {
      cardVisible.value = false;
      cardInReader.value = false;
      onCardClick.value = null;
    },
  };

  const receipt = {
    show({ onCollect = null } = {}) {
      receiptVisible.value = true;
      if (onCollect) onReceiptClick.value = onCollect;
    },
    hide() {
      receiptVisible.value = false;
      onReceiptClick.value = null;
    },
  };

  const bills = {
    show({ onCollect = null } = {}) {
      billsVisible.value = true;
      if (onCollect) onBillsClick.value = onCollect;
    },
    hide() {
      billsVisible.value = false;
      onBillsClick.value = null;
    },
  };

  return {
    cardVisible,
    receiptVisible,
    billsVisible,
    onCardClick,
    onReceiptClick,
    onBillsClick,
    keypadBus,
    cardInReader,
    card,
    receipt,
    bills,
    resetAll,
  };
}
