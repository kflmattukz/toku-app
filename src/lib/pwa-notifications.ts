/**
 * PWA System-Level Notifications Helper
 * Supports Android Chrome/PWA and iOS 16.4+ standalone PWAs.
 */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    return registration;
  } catch (err) {
    console.warn("[PWA] Service Worker registration failed:", err);
    return null;
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermissionStatus(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error("[PWA] Error requesting notification permission:", err);
    return "denied";
  }
}

export interface SystemNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  vibrate?: number[];
}

export async function sendSystemNotification(options: SystemNotificationOptions): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== "granted") return false;

  const {
    title,
    body,
    icon = "/favicon/favicon-96x96.png",
    badge = "/favicon/favicon-96x96.png",
    tag = "toku-order-" + Date.now(),
    url = "/pesanan",
    vibrate = [200, 100, 200, 100, 200],
  } = options;

  try {
    // Prefer Service Worker registration to trigger system OS notification on mobile
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && "showNotification" in reg) {
        await reg.showNotification(title, {
          body,
          icon,
          badge,
          tag,
          vibrate,
          renotify: true,
          data: { url },
        } as NotificationOptions);

        return true;
      }
    }

    // Fallback to standard Window Notification
    const notif = new Notification(title, {
      body,
      icon,
      badge,
      tag,
      data: { url },
    });

    notif.onclick = () => {
      window.focus();
      window.location.href = url;
    };

    return true;
  } catch (err) {
    console.warn("[PWA] System notification error:", err);
    return false;
  }
}

/**
 * Convert base64 url string to Uint8Array for PushManager subscribe applicationServerKey
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * Subscribe current browser/device to Web Push notifications.
 */
export async function subscribeToPush(
  vapidPublicKey?: string
): Promise<PushSubscriptionData | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }

  const publicKey = vapidPublicKey || (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    console.warn("[PWA Push] VAPID public key not found");
    return null;
  }

  try {
    const reg = await registerServiceWorker();
    if (!reg) return null;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as any,
      });
    }

    const subJson = sub.toJSON();
    if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
      return null;
    }

    return {
      endpoint: subJson.endpoint,
      p256dh: subJson.keys.p256dh,
      auth: subJson.keys.auth,
    };
  } catch (err) {
    console.error("[PWA Push] Subscription error:", err);
    return null;
  }
}

/**
 * Unsubscribe current browser/device from Web Push notifications.
 */
export async function unsubscribeFromPush(): Promise<string | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return null;

    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      return endpoint;
    }
    return null;
  } catch (err) {
    console.error("[PWA Push] Unsubscribe error:", err);
    return null;
  }
}

