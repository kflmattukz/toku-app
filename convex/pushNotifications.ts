import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

export const subscribe = mutation({
  args: {
    storeId: v.id("stores"),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if subscription with same endpoint already exists
    const existing = await ctx.db
      .query("push_subscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        storeId: args.storeId,
        p256dh: args.p256dh,
        auth: args.auth,
        createdAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("push_subscriptions", {
      storeId: args.storeId,
      endpoint: args.endpoint,
      p256dh: args.p256dh,
      auth: args.auth,
      createdAt: Date.now(),
    });
  },
});

export const unsubscribe = mutation({
  args: {
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("push_subscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

// Internal helper to fetch all active push subscriptions for a store
export const getSubscriptionsForStore = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("push_subscriptions")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .collect();
  },
});

// Internal mutation to clean up expired or invalid subscriptions
export const removeInvalidSubscription = internalMutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("push_subscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();
    if (sub) {
      await ctx.db.delete(sub._id);
    }
  },
});
