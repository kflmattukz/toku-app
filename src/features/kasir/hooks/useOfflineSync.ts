import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { getOfflineQueue, clearOfflineQueue } from "#/lib/offline-queue";
import type { Id } from "../../../../convex/_generated/dataModel";

export function useOfflineSync(storeId?: Id<"stores">) {
  const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? navigator.onLine : true);
  const createTx = useMutation(api.transactions.create);

  const flushOfflineQueue = useCallback(async () => {
    if (!storeId) return;
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    for (const tx of queue) {
      try {
        await createTx({
          ...tx,
          storeId,
          syncedFromOffline: true,
        });
      } catch {
        /* skip */
      }
    }
    clearOfflineQueue();
  }, [storeId, createTx]);

  useEffect(() => {
    const on = () => {
      setIsOnline(true);
      toast.success("Koneksi kembali online", {
        description: "Transaksi offline disinkronkan ke cloud",
      });
      flushOfflineQueue();
    };

    const off = () => {
      setIsOnline(false);
      toast.warning("Koneksi internet terputus", {
        description: "Toku POS berjalan dalam Mode Offline",
      });
    };

    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [flushOfflineQueue]);

  return { isOnline, flushOfflineQueue };
}
