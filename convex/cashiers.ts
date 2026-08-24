import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByStore = query({
  args: {
    storeId: v.id("stores"),
  },
  handler: async (ctx, { storeId }) => {
    return ctx.db
      .query("cashiers")
      .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
      .collect();
  },
});

export const create = mutation({
  args: {
    storeId: v.id("stores"),
    name: v.string(),
    pin: v.string(),
    role: v.union(v.literal("owner"), v.literal("manager"), v.literal("cashier")),
  },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);
    if (!store) throw new Error("Toko tidak ditemukan");

    // Check cashier limit for Free tier (Free: max 1 cashier)
    const existing = await ctx.db
      .query("cashiers")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .collect();

    const isPro = store.tier === "pro" && (!store.proExpiresAt || store.proExpiresAt > Date.now());
    if (!isPro && existing.length >= 1) {
      throw new Error("Free tier hanya dapat memiliki 1 kasir. Upgrade ke Pro untuk kasir tanpa batas.");
    }

    return ctx.db.insert("cashiers", {
      storeId: args.storeId,
      name: args.name,
      pin: args.pin,
      role: args.role,
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("cashiers"),
    name: v.optional(v.string()),
    pin: v.optional(v.string()),
    role: v.optional(v.union(v.literal("owner"), v.literal("manager"), v.literal("cashier"))),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: {
    id: v.id("cashiers"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const verifyPin = query({
  args: {
    storeId: v.id("stores"),
    pin: v.string(),
  },
  handler: async (ctx, { storeId, pin }) => {
    const cashiers = await ctx.db
      .query("cashiers")
      .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    const match = cashiers.find((c) => c.pin === pin);
    if (!match) return null;

    return {
      _id: match._id,
      name: match.name,
      role: match.role,
    };
  },
});
