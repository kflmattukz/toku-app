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
    // Insert transaction
    const txId = await ctx.db.insert("transactions", args);
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

export const dailySummary = query({
  args: { storeId: v.id("stores"), startOfDay: v.number(), endOfDay: v.number() },
  handler: async (ctx, { storeId, startOfDay, endOfDay }) => {
    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_storeId_createdAt", (q) =>
        q.eq("storeId", storeId).gte("createdAt", startOfDay).lte("createdAt", endOfDay),
      )
      .collect();
    const total = txs.reduce((sum, t) => sum + t.total, 0);
    return { total, count: txs.length, transactions: txs };
  },
});
