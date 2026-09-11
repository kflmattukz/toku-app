import { useState, useCallback } from "react";
import type { OrderRecord, OrderStatus } from "../types";

export function useOrderDragAndDrop() {
  const [draggedOrder, setDraggedOrder] = useState<OrderRecord | null>(null);
  const [dropTargetStatus, setDropTargetStatus] = useState<OrderStatus | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, order: OrderRecord) => {
    if (order.status === "completed" || order.status === "cancelled") {
      e.preventDefault();
      return;
    }
    setDraggedOrder(order);
    e.dataTransfer.setData("application/json", JSON.stringify(order));
    e.dataTransfer.effectAllowed = "move";

    // Ghost styling
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add("opacity-40");
    }
  }, []);

  const handleDragEnd = useCallback((e?: React.DragEvent | any) => {
    setDraggedOrder(null);
    setDropTargetStatus(null);
    if (e && e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("opacity-40");
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, status: OrderStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetStatus(status);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, status: OrderStatus) => {
    // Only reset if leaving the column element itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDropTargetStatus((current) => (current === status ? null : current));
  }, []);

  const handleDrop = useCallback(
    (
      e: React.DragEvent,
      targetStatus: OrderStatus,
      onTransition: (order: OrderRecord, target: OrderStatus) => void,
    ) => {
      e.preventDefault();
      setDropTargetStatus(null);

      let orderToMove = draggedOrder;
      if (!orderToMove) {
        try {
          const raw = e.dataTransfer.getData("application/json");
          if (raw) orderToMove = JSON.parse(raw);
        } catch {}
      }

      if (orderToMove && orderToMove.status !== targetStatus) {
        onTransition(orderToMove, targetStatus);
      }
      setDraggedOrder(null);
    },
    [draggedOrder],
  );

  return {
    draggedOrder,
    dropTargetStatus,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
