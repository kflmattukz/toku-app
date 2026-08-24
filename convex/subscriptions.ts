import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const PLANS = {
  monthly: {
    price: 35000,
    durationMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    label: "Pro Bulanan (Rp 35.000 / bln)",
  },
  yearly: {
    price: 300000,
    durationMs: 365 * 24 * 60 * 60 * 1000, // 365 days
    label: "Pro Tahunan (Rp 300.000 / thn - Hemat Rp 120rb)",
  },
};

export const getStoreSubscription = query({
  args: {
    storeId: v.id("stores"),
  },
  handler: async (ctx, { storeId }) => {
    const store = await ctx.db.get(storeId);
    if (!store) return null;

    const isPro =
      store.tier === "pro" &&
      (!store.proExpiresAt || store.proExpiresAt > Date.now());

    const recentOrder = await ctx.db
      .query("subscriptions")
      .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
      .order("desc")
      .first();

    return {
      tier: isPro ? ("pro" as const) : ("free" as const),
      proExpiresAt: store.proExpiresAt,
      isPro,
      recentOrder,
    };
  },
});

export const createOrder = mutation({
  args: {
    storeId: v.id("stores"),
    userId: v.string(),
    plan: v.union(v.literal("monthly"), v.literal("yearly")),
  },
  handler: async (ctx, { storeId, userId, plan }) => {
    const planInfo = PLANS[plan];
    const orderId = `TOKU-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const id = await ctx.db.insert("subscriptions", {
      storeId,
      userId,
      orderId,
      plan,
      amount: planInfo.price,
      status: "pending",
      createdAt: Date.now(),
    });

    return {
      subscriptionId: id,
      orderId,
      amount: planInfo.price,
      plan,
    };
  },
});

export const settlePayment = mutation({
  args: {
    orderId: v.string(),
    paymentType: v.optional(v.string()),
  },
  handler: async (ctx, { orderId, paymentType }) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_orderId", (q) => q.eq("orderId", orderId))
      .first();

    if (!sub) throw new Error("Order tidak ditemukan");
    if (sub.status === "settled") return { success: true, alreadySettled: true };

    const planInfo = PLANS[sub.plan];
    const now = Date.now();

    // Check store's current expiration
    const store = await ctx.db.get(sub.storeId);
    let baseTime = now;
    if (store?.proExpiresAt && store.proExpiresAt > now) {
      baseTime = store.proExpiresAt;
    }
    const newExpiresAt = baseTime + planInfo.durationMs;

    // Update subscription
    await ctx.db.patch(sub._id, {
      status: "settled",
      settledAt: now,
      paymentType: paymentType || "midtrans_qris",
    });

    // Update store tier
    if (store) {
      await ctx.db.patch(store._id, {
        tier: "pro",
        proExpiresAt: newExpiresAt,
      });
    }

    return {
      success: true,
      storeId: sub.storeId,
      newExpiresAt,
    };
  },
});

export const simulatePayment = mutation({
  args: {
    orderId: v.string(),
  },
  handler: async (ctx, { orderId }) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_orderId", (q) => q.eq("orderId", orderId))
      .first();

    if (!sub) throw new Error("Order tidak ditemukan");

    const planInfo = PLANS[sub.plan];
    const now = Date.now();

    const store = await ctx.db.get(sub.storeId);
    let baseTime = now;
    if (store?.proExpiresAt && store.proExpiresAt > now) {
      baseTime = store.proExpiresAt;
    }
    const newExpiresAt = baseTime + planInfo.durationMs;

    await ctx.db.patch(sub._id, {
      status: "settled",
      settledAt: now,
      paymentType: "sandbox_simulator",
    });

    if (store) {
      await ctx.db.patch(store._id, {
        tier: "pro",
        proExpiresAt: newExpiresAt,
      });
    }

    return {
      success: true,
      newExpiresAt,
    };
  },
});
