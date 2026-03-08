// MediSave Service Worker — handles background push notifications

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: "MediSave Reminder",
      body: event.data.text(),
    };
  }

  const options = {
    body:    payload.body  ?? "Time to take your medicine",
    icon:    "/icon-192.png",
    badge:   "/icon-72.png",
    vibrate: [200, 100, 200],
    tag:     "medisave-reminder",
    renotify: true,
    data:    payload.data ?? {},
    actions: [
      { action: "taken",  title: "✅ Taken" },
      { action: "snooze", title: "⏰ Snooze 10 min" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title ?? "MediSave", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "taken") {
    // Mark as taken — just close
    return;
  }

  if (event.action === "snooze") {
    // Snooze — close for now
    return;
  }

  // Default click — open app
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("medisave") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/reminders");
      }
    })
  );
});
