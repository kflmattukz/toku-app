import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByUserId = query({
  args: {
    userId: v.string(),
    userEmail: v.optional(v.string()),
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, { userId, userEmail, storeId }) => {
    // If specific storeId requested, fetch and verify ownership
    if (storeId) {
      const store = await ctx.db.get(storeId);
      if (
        store &&
        (store.userId === userId || (userEmail && store.userEmail === userEmail))
      ) {
        return store;
      }
    }

    // 1. Try finding by userEmail if provided (canonical Google identity)
    if (userEmail) {
      const storeByEmail = await ctx.db
        .query("stores")
        .withIndex("by_userEmail", (q) => q.eq("userEmail", userEmail))
        .first();

      if (storeByEmail) return storeByEmail;
    }

    // 2. Try finding by current userId
    const storeByUserId = await ctx.db
      .query("stores")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (storeByUserId) return storeByUserId;

    return null;
  },
});

export const listUserStores = query({
  args: {
    userId: v.string(),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, { userId, userEmail }) => {
    const storeMap = new Map();

    if (userEmail) {
      const byEmail = await ctx.db
        .query("stores")
        .withIndex("by_userEmail", (q) => q.eq("userEmail", userEmail))
        .collect();
      for (const s of byEmail) {
        storeMap.set(s._id, s);
      }
    }

    const byId = await ctx.db
      .query("stores")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    for (const s of byId) {
      storeMap.set(s._id, s);
    }

    return Array.from(storeMap.values());
  },
});

const CategoryValidator = v.union(
  v.literal("bengkel"),
  v.literal("laundry"),
  v.literal("barbershop_salon"),
  v.literal("kuliner_resto"),
  v.literal("fashion_butik"),
  v.literal("toko_bangunan"),
  v.literal("petshop"),
  v.literal("atk_fotokopi"),
  v.literal("sembako"),
  v.literal("warung_kopi"),
  v.literal("apotek"),
  v.literal("konter_pulsa"),
  v.literal("kelontong"),
  v.literal("lainnya"),
);

export const create = mutation({
  args: {
    userId: v.string(),
    userEmail: v.optional(v.string()),
    name: v.string(),
    category: CategoryValidator,
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if store already exists for userEmail
    if (args.userEmail) {
      const existingByEmail = await ctx.db
        .query("stores")
        .withIndex("by_userEmail", (q) => q.eq("userEmail", args.userEmail))
        .first();
      if (existingByEmail) {
        await ctx.db.patch(existingByEmail._id, {
          userId: args.userId,
          userEmail: args.userEmail,
          name: args.name,
          category: args.category,
          address: args.address,
        });
        return existingByEmail._id;
      }
    }

    // Check if store already exists for userId
    const existingById = await ctx.db
      .query("stores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (existingById) {
      await ctx.db.patch(existingById._id, {
        userId: args.userId,
        userEmail: args.userEmail,
        name: args.name,
        category: args.category,
        address: args.address,
      });
      return existingById._id;
    }

    return ctx.db.insert("stores", {
      userId: args.userId,
      userEmail: args.userEmail,
      name: args.name,
      category: args.category,
      address: args.address,
      tier: "free",
      lowStockThreshold: 5,
      isMainBranch: true,
      branchName: "Pusat",
      createdAt: Date.now(),
    });
  },
});

export const createBranch = mutation({
  args: {
    userId: v.string(),
    userEmail: v.optional(v.string()),
    name: v.string(),
    branchName: v.string(),
    category: CategoryValidator,
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingStores = await ctx.db
      .query("stores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return ctx.db.insert("stores", {
      userId: args.userId,
      userEmail: args.userEmail,
      name: args.name,
      category: args.category,
      address: args.address,
      branchName: args.branchName,
      isMainBranch: existingStores.length === 0,
      tier: "free",
      lowStockThreshold: 5,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("stores"),
    name: v.optional(v.string()),
    branchName: v.optional(v.string()),
    lowStockThreshold: v.optional(v.number()),
    category: v.optional(CategoryValidator),
    address: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});
