import { v } from "convex/values";
import { mutation, query, internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
// @ts-ignore
import webpush from "web-push";

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

// Internal action to trigger web-push notifications to all store devices
export const sendPushToStore = internalAction({
  args: {
    storeId: v.id("stores"),
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@toku.app";

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn("[WebPush] VAPID keys not configured in Convex environment. Skipping push.");
      return;
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const subscriptions: any[] = await ctx.runQuery((internal as any).pushNotifications.getSubscriptionsForStore, {
      storeId: args.storeId,
    });

    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
      url: args.url || "/pesanan",
      tag: args.tag || "toku-order-" + Date.now(),
      icon: "/favicon/favicon-96x96.png",
      badge: "/favicon/favicon-96x96.png",
    });

    await Promise.allSettled(
      subscriptions.map(async (sub: any) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, payload);
        } catch (error: any) {
          // If status code is 404 or 410 (Gone/Expired subscription), prune it
          if (error.statusCode === 404 || error.statusCode === 410) {
            console.info("[WebPush] Subscription expired or removed. Deleting endpoint:", sub.endpoint);
            await ctx.runMutation((internal as any).pushNotifications.removeInvalidSubscription, {
              endpoint: sub.endpoint,
            });
          } else {
            console.error("[WebPush] Error sending push notification:", error);
          }
        }
      })
    );
  },
});

