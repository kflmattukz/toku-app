import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    storeId: v.id("stores"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { storeId, startDate, endDate, category }) => {
    let q = ctx.db
      .query("expenses")
      .withIndex("by_storeId_date", (q) => {
        const query = q.eq("storeId", storeId);
        if (startDate !== undefined && endDate !== undefined) {
          return query.gte("date", startDate).lte("date", endDate);
        }
        if (startDate !== undefined) {
          return query.gte("date", startDate);
        }
        if (endDate !== undefined) {
          return query.lte("date", endDate);
        }
        return query;
      })
      .order("desc");

    const expenses = await q.collect();

    if (category && category !== "all") {
      return expenses.filter((e) => e.category === category);
    }
    return expenses;
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    category: v.union(
      v.literal("operasional"),
      v.literal("gaji"),
      v.literal("sewa"),
      v.literal("utilitas"),
      v.literal("bahan_baku"),
      v.literal("lainnya"),
    ),
    amount: v.number(),
    date: v.number(),
    notes: v.optional(v.string()),
    source: v.optional(v.union(v.literal("cash_drawer"), v.literal("bank"), v.literal("owner"))),
    shiftId: v.optional(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("expenses", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return true;
  },
});

export const summary = query({
  args: {
    storeId: v.id("stores"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, { storeId, startDate, endDate }) => {
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_storeId_date", (q) =>
        q.eq("storeId", storeId).gte("date", startDate).lte("date", endDate),
      )
      .collect();

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const byCategory: Record<string, number> = {
      operasional: 0,
      gaji: 0,
      sewa: 0,
      utilitas: 0,
      bahan_baku: 0,
      lainnya: 0,
    };

    for (const exp of expenses) {
      byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
    }

    return {
      total,
      count: expenses.length,
      expenses,
      byCategory,
    };
  },
});
