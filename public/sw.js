// Buyurtma yetkazilganda bildirishnoma uchun service worker
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const client = list[0];
      if (client) return client.focus();
      return self.clients.openWindow("/buyurtmalar");
    }),
  );
});
