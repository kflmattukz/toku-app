import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByUserId = query({
  args: {
    userId: v.string(),
    userEmail: v.optional(v.string()),
    storeId: v.optional(v.id("stores")),
  },
  handler: async (ctx, { userId, userEmail, storeId }) => {
    const cleanEmail = userEmail?.trim().toLowerCase();

    // 1. If specific storeId requested, fetch and verify ownership
    if (storeId) {
      const store = await ctx.db.get(storeId);
      if (store) {
        const storeEmailClean = store.userEmail?.trim().toLowerCase();
        if (
          store.userId === userId ||
          (cleanEmail && storeEmailClean === cleanEmail)
        ) {
          return store;
        }
      }
    }

    // 2. Try finding by userEmail (case-insensitive & whitespace trimmed)
    if (cleanEmail) {
      if (userEmail) {
        const storeByEmail = await ctx.db
          .query("stores")
          .withIndex("by_userEmail", (q) => q.eq("userEmail", userEmail))
          .first();
        if (storeByEmail) return storeByEmail;
      }

      const storeByCleanEmail = await ctx.db
        .query("stores")
        .withIndex("by_userEmail", (q) => q.eq("userEmail", cleanEmail))
        .first();
      if (storeByCleanEmail) return storeByCleanEmail;

      // Scan stores for case-insensitive match
      const allStores = await ctx.db.query("stores").collect();
      const match = allStores.find(
        (s) => s.userEmail && s.userEmail.trim().toLowerCase() === cleanEmail,
      );
      if (match) return match;
    }

    // 3. Try finding by current userId
    const storeByUserId = await ctx.db
      .query("stores")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (storeByUserId) return storeByUserId;

    // 4. Multi-device identity fallback:
    // If user logged in on another device where Better Auth assigned another userId for the same email,
    // find linked users in auth_users and check their stores.
    if (cleanEmail) {
      const allUsers = await ctx.db.query("auth_users").collect();
      const linkedUsers = allUsers.filter(
        (u) => u.email && u.email.trim().toLowerCase() === cleanEmail,
      );
      for (const u of linkedUsers) {
        if (u.id !== userId) {
          const store = await ctx.db
            .query("stores")
            .withIndex("by_userId", (q) => q.eq("userId", u.id))
            .first();
          if (store) return store;
        }
      }
    }

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
    const cleanEmail = userEmail?.trim().toLowerCase();

    if (cleanEmail) {
      if (userEmail) {
        const byEmail = await ctx.db
          .query("stores")
          .withIndex("by_userEmail", (q) => q.eq("userEmail", userEmail))
          .collect();
        for (const s of byEmail) {
          storeMap.set(s._id, s);
        }
      }

      const byCleanEmail = await ctx.db
        .query("stores")
        .withIndex("by_userEmail", (q) => q.eq("userEmail", cleanEmail))
        .collect();
      for (const s of byCleanEmail) {
        storeMap.set(s._id, s);
      }

      const allStores = await ctx.db.query("stores").collect();
      for (const s of allStores) {
        if (s.userEmail && s.userEmail.trim().toLowerCase() === cleanEmail) {
          storeMap.set(s._id, s);
        }
      }

      // Find stores linked to other userIds with same email
      const allUsers = await ctx.db.query("auth_users").collect();
      const linkedUserIds = new Set(
        allUsers
          .filter((u) => u.email && u.email.trim().toLowerCase() === cleanEmail)
          .map((u) => u.id),
      );
      for (const uid of linkedUserIds) {
        const byId = await ctx.db
          .query("stores")
          .withIndex("by_userId", (q) => q.eq("userId", uid))
          .collect();
        for (const s of byId) {
          storeMap.set(s._id, s);
        }
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

export const syncUserStore = mutation({
  args: {
    storeId: v.id("stores"),
    userId: v.string(),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, { storeId, userId, userEmail }) => {
    const store = await ctx.db.get(storeId);
    if (!store) return;
    const cleanEmail = userEmail?.trim().toLowerCase();
    const patch: Record<string, any> = {};
    if (store.userId !== userId) patch.userId = userId;
    if (cleanEmail && store.userEmail !== cleanEmail) patch.userEmail = cleanEmail;
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(storeId, patch);
    }
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
    const cleanEmail = args.userEmail?.trim().toLowerCase();

    // Check if store already exists for userEmail
    if (cleanEmail) {
      const existingByEmail = await ctx.db
        .query("stores")
        .withIndex("by_userEmail", (q) => q.eq("userEmail", cleanEmail))
        .first();
      if (existingByEmail) {
        await ctx.db.patch(existingByEmail._id, {
          userId: args.userId,
          userEmail: cleanEmail,
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
        userEmail: cleanEmail,
        name: args.name,
        category: args.category,
        address: args.address,
      });
      return existingById._id;
    }

    return ctx.db.insert("stores", {
      userId: args.userId,
      userEmail: cleanEmail,
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
    const cleanEmail = args.userEmail?.trim().toLowerCase();
    const existingStores = await ctx.db
      .query("stores")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return ctx.db.insert("stores", {
      userId: args.userId,
      userEmail: cleanEmail,
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
