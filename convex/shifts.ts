import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getActive = query({
  args: {
    storeId: v.id("stores"),
  },
  handler: async (ctx, { storeId }) => {
    return ctx.db
      .query("shifts")
      .withIndex("by_storeId_status", (q) =>
        q.eq("storeId", storeId).eq("status", "open"),
      )
      .first();
  },
});

export const listRecent = query({
  args: {
    storeId: v.id("stores"),
  },
  handler: async (ctx, { storeId }) => {
    return ctx.db
      .query("shifts")
      .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
      .order("desc")
      .take(20);
  },
});

export const startShift = mutation({
  args: {
    storeId: v.id("stores"),
    cashierId: v.optional(v.id("cashiers")),
    cashierName: v.string(),
    startingCash: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if open shift already exists
    const existing = await ctx.db
      .query("shifts")
      .withIndex("by_storeId_status", (q) =>
        q.eq("storeId", args.storeId).eq("status", "open"),
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return ctx.db.insert("shifts", {
      storeId: args.storeId,
      cashierId: args.cashierId,
      cashierName: args.cashierName,
      startingCash: args.startingCash,
      startedAt: Date.now(),
      status: "open",
    });
  },
});

export const endShift = mutation({
  args: {
    shiftId: v.id("shifts"),
    actualCash: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { shiftId, actualCash, notes }) => {
    const shift = await ctx.db.get(shiftId);
    if (!shift || shift.status === "closed") {
      throw new Error("Shift tidak ditemukan atau sudah ditutup");
    }

    // Calculate total cash transactions during this shift
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_storeId_createdAt", (q) =>
        q.eq("storeId", shift.storeId).gte("createdAt", shift.startedAt),
      )
      .filter((q) => q.eq(q.field("paymentMethod"), "cash"))
      .collect();

    const cashSales = transactions.reduce((acc, t) => acc + (t.total || 0), 0);
    const expectedCash = shift.startingCash + cashSales;
    const difference = actualCash - expectedCash;

    await ctx.db.patch(shiftId, {
      endedAt: Date.now(),
      expectedCash,
      actualCash,
      difference,
      notes,
      status: "closed",
    });

    return {
      startingCash: shift.startingCash,
      cashSales,
      expectedCash,
      actualCash,
      difference,
    };
  },
});
