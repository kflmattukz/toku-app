"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
// @ts-ignore
import webpush from "web-push";

// Internal action running in Node.js runtime to trigger web-push notifications to store devices
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
