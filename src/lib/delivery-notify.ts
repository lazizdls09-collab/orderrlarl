import { useEffect, useRef } from "react";
import { useMyOrders } from "@/lib/use-my-orders";

const NOTIFIED_KEY = "lazzat_notified_delivered_v1";

type Message = { title: string; body: string };

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function ensureServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch {
    /* ignore */
  }
}

function readNotified(): string[] {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveNotified(ids: string[]) {
  try {
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(ids.slice(-100)));
  } catch {
    /* ignore */
  }
}

async function showNotification({ title, body }: Message) {
  try {
    const reg =
      "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (reg) {
      await reg.showNotification(title, { body, icon: "/burger.png", badge: "/burger.png" });
      return;
    }
  } catch {
    /* fall back below */
  }
  try {
    new Notification(title, { body, icon: "/burger.png" });
  } catch {
    /* ignore */
  }
}

/** Mijozning buyurtmalari "yetkazildi" bo'lganda bildirishnoma yuboradi (sahifa ochiq bo'lganda). */
export function useDeliveryNotifications(messageFor: (orderNo: number) => Message) {
  const { data } = useMyOrders();
  const primed = useRef(false);
  const messageRef = useRef(messageFor);
  messageRef.current = messageFor;

  useEffect(() => {
    if (notificationsSupported() && Notification.permission === "granted") {
      void ensureServiceWorker();
    }
  }, []);

  useEffect(() => {
    if (!data || !notificationsSupported()) return;
    const notified = readNotified();
    const delivered = data.filter((o) => o.status === "delivered");

    // Birinchi yuklashda eski buyurtmalar haqida xabar bermaymiz
    if (!primed.current) {
      primed.current = true;
      saveNotified([...notified, ...delivered.map((o) => o.id)]);
      return;
    }

    const fresh = delivered.filter((o) => !notified.includes(o.id));
    if (!fresh.length) return;
    saveNotified([...notified, ...fresh.map((o) => o.id)]);
    if (Notification.permission !== "granted") return;
    for (const o of fresh) void showNotification(messageRef.current(o.order_no));
  }, [data]);
}
