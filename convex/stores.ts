import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByUserId = query({
  args: {
    userId: v.string(),
    userEmail: v.optional(v.string()),
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, { userId, userEmail, storeId }) => {
    // If specific storeId requested, fetch it
    if (storeId) {
      const store = await ctx.db.get(storeId);
      if (store) return store;
    }

    // 1. Try finding by current userId
    const storeByUserId = await ctx.db
      .query("stores")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (storeByUserId) return storeByUserId;

    // 2. Try finding by userEmail if provided
    if (userEmail) {
      const storeByEmail = await ctx.db
        .query("stores")
        .withIndex("by_userEmail", (q) => q.eq("userEmail", userEmail))
        .first();

      if (storeByEmail) return storeByEmail;
    }

    // 3. Fallback for single store environments: if a store exists in Convex, reclaim it
    const anyStore = await ctx.db.query("stores").first();
    if (anyStore) return anyStore;

    return null;
  },
});

export const listUserStores = query({
  args: {
    userId: v.string(),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, { userId, userEmail }) => {
    let stores = await ctx.db
      .query("stores")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    if (stores.length === 0 && userEmail) {
      stores = await ctx.db
        .query("stores")
        .withIndex("by_userEmail", (q) => q.eq("userEmail", userEmail))
        .collect();
    }

    return stores;
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    userEmail: v.optional(v.string()),
    name: v.string(),
    category: v.union(
      v.literal("sembako"),
      v.literal("warung_kopi"),
      v.literal("apotek"),
      v.literal("konter_pulsa"),
      v.literal("kelontong"),
      v.literal("lainnya"),
    ),
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

    // Fallback: check if there's any orphaned store document to update
    const orphanStore = await ctx.db.query("stores").first();
    if (orphanStore) {
      await ctx.db.patch(orphanStore._id, {
        userId: args.userId,
        userEmail: args.userEmail,
        name: args.name,
        category: args.category,
        address: args.address,
      });
      return orphanStore._id;
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
    category: v.union(
      v.literal("sembako"),
      v.literal("warung_kopi"),
      v.literal("apotek"),
      v.literal("konter_pulsa"),
      v.literal("kelontong"),
      v.literal("lainnya"),
    ),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check existing stores
    const existingStores = await ctx.db
      .query("stores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const mainStore = existingStores.find((s) => s.tier === "pro" || s.isMainBranch) || existingStores[0];
    const isPro = mainStore && mainStore.tier === "pro" && (!mainStore.proExpiresAt || mainStore.proExpiresAt > Date.now());

    if (existingStores.length >= 1 && !isPro) {
      throw new Error("Free tier hanya dapat memiliki 1 cabang/outlet. Upgrade ke Pro untuk menambah cabang.");
    }

    return ctx.db.insert("stores", {
      userId: args.userId,
      userEmail: args.userEmail,
      name: args.name,
      category: args.category,
      address: args.address,
      branchName: args.branchName,
      isMainBranch: existingStores.length === 0,
      tier: isPro ? "pro" : "free",
      proExpiresAt: mainStore?.proExpiresAt,
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
    category: v.optional(
      v.union(
        v.literal("sembako"),
        v.literal("warung_kopi"),
        v.literal("apotek"),
        v.literal("konter_pulsa"),
        v.literal("kelontong"),
        v.literal("lainnya"),
      ),
    ),
    address: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});
