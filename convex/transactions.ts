import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { storeId: v.id("stores"), limit: v.optional(v.number()) },
  handler: async (ctx, { storeId, limit }) => {
    let q = ctx.db
      .query("transactions")
      .withIndex("by_storeId_createdAt", (q) => q.eq("storeId", storeId))
      .order("desc");
    if (limit) return q.take(limit);
    return q.collect();
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    items: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        price: v.number(),
        costPrice: v.optional(v.number()),
        qty: v.number(),
        discountType: v.optional(v.union(v.literal("percentage"), v.literal("nominal"))),
        discountValue: v.optional(v.number()),
        subtotal: v.optional(v.number()),
      }),
    ),
    subtotal: v.optional(v.number()),
    discountType: v.optional(v.union(v.literal("percentage"), v.literal("nominal"))),
    discountValue: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    total: v.number(),
    paymentMethod: v.union(v.literal("cash"), v.literal("qris")),
    cashPaid: v.optional(v.number()),
    change: v.optional(v.number()),
    cashierId: v.optional(v.string()),
    cashierName: v.optional(v.string()),
    shiftId: v.optional(v.string()),
    createdAt: v.number(),
    syncedFromOffline: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Populate costPrice for items if not present
    const enrichedItems = await Promise.all(
      args.items.map(async (item) => {
        if (item.costPrice !== undefined) return item;
        try {
          const productId = ctx.db.normalizeId("products", item.productId);
          if (productId) {
            const product = await ctx.db.get(productId);
            return {
              ...item,
              costPrice: product?.costPrice ?? 0,
            };
          }
        } catch {}
        return { ...item, costPrice: 0 };
      }),
    );

    // Insert transaction with status completed by default
    const txId = await ctx.db.insert("transactions", {
      ...args,
      items: enrichedItems,
      status: "completed",
    });

    // Deduct stock for each item
    for (const item of args.items) {
      try {
        const productId = ctx.db.normalizeId("products", item.productId);
        if (productId) {
          const product = await ctx.db.get(productId);
          if (product) {
            await ctx.db.patch(productId, {
              stock: Math.max(0, product.stock - item.qty),
            });
          }
        }
      } catch {
        // Skip stock update if product was deleted
      }
    }
    return txId;
  },
});

export const cancel = mutation({
  args: {
    id: v.id("transactions"),
    reason: v.string(),
    cancelledBy: v.optional(v.string()),
  },
  handler: async (ctx, { id, reason, cancelledBy }) => {
    const tx = await ctx.db.get(id);
    if (!tx) throw new Error("Transaksi tidak ditemukan");
    if (tx.status === "cancelled") throw new Error("Transaksi ini sudah dibatalkan sebelumnya");

    // 1. Mark transaction as cancelled
    await ctx.db.patch(id, {
      status: "cancelled",
      cancelledAt: Date.now(),
      cancelReason: reason,
      cancelledBy: cancelledBy || "Kasir",
    });

    // 2. Return stock to products
    for (const item of tx.items) {
      try {
        const productId = ctx.db.normalizeId("products", item.productId);
        if (productId) {
          const product = await ctx.db.get(productId);
          if (product) {
            await ctx.db.patch(productId, {
              stock: product.stock + item.qty,
            });
          }
        }
      } catch {
        // Skip stock restoration if product was permanently deleted
      }
    }

    return true;
  },
});

export const dailySummary = query({
  args: { storeId: v.id("stores"), startOfDay: v.number(), endOfDay: v.number() },
  handler: async (ctx, { storeId, startOfDay, endOfDay }) => {
    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_storeId_createdAt", (q) =>
        q.eq("storeId", storeId).gte("createdAt", startOfDay).lte("createdAt", endOfDay),
      )
      .collect();

    const validTxs = txs.filter((t) => t.status !== "cancelled");
    const cancelledTxs = txs.filter((t) => t.status === "cancelled");

    const total = validTxs.reduce((sum, t) => sum + t.total, 0);
    const cancelledTotal = cancelledTxs.reduce((sum, t) => sum + t.total, 0);

    // Hitung Total HPP (Cost of Goods Sold)
    let totalCogs = 0;
    for (const t of validTxs) {
      for (const item of t.items) {
        totalCogs += (item.costPrice ?? 0) * item.qty;
      }
    }

    const grossProfit = total - totalCogs;
    const grossMargin = total > 0 ? (grossProfit / total) * 100 : 0;

    // Ambil Pengeluaran Operasional dalam periode ini
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_storeId_date", (q) =>
        q.eq("storeId", storeId).gte("date", startOfDay).lte("date", endOfDay),
      )
      .collect();

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - totalExpenses;
    const netMargin = total > 0 ? (netProfit / total) * 100 : 0;

    return {
      total,
      count: validTxs.length,
      transactions: validTxs,
      allTransactions: txs,
      cancelledTotal,
      cancelledCount: cancelledTxs.length,
      cancelledTransactions: cancelledTxs,
      totalCogs,
      grossProfit,
      grossMargin,
      totalExpenses,
      netProfit,
      netMargin,
      expenses,
    };
  },
});

