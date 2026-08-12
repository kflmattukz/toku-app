/**
 * Offline transaction queue using localStorage.
 * ponytail: localStorage instead of idb-keyval — no extra dep, sync API, fine for <5MB of queued txs.
 * Upgrade to IndexedDB if queue size becomes an issue.
 */

const QUEUE_KEY = "toku_offline_queue";

export type OfflineTx = {
  storeId: string;
  items: Array<{ productId: string; name: string; price: number; qty: number }>;
  total: number;
  paymentMethod: "cash" | "qris";
  cashPaid?: number;
  change?: number;
  createdAt: number;
};

export function enqueueOfflineTx(tx: OfflineTx): void {
  const queue = getOfflineQueue();
  queue.push(tx);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function getOfflineQueue(): OfflineTx[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}
