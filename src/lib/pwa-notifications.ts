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
        });
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
