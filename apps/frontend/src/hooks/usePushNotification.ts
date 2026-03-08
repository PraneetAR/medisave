"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";

export type PushStatus = "idle" | "loading" | "granted" | "denied" | "unsupported";

export const usePushNotification = () => {
  const [status, setStatus] = useState<PushStatus>("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "granted") setStatus("granted");
    if (Notification.permission === "denied")  setStatus("denied");
  }, []);

  const subscribe = async () => {
    if (!("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("loading");
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const { data } = await api.get("/push/vapid-public-key");
      const vapidKey = data.data.publicKey;

      if (!vapidKey) {
        setStatus("granted");
        return;
      }

      // ✅ Fix: cast to ArrayBuffer to satisfy strict TS
      const key = urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: key,
      });

      await api.post("/push/subscribe", { subscription });
      setStatus("granted");
    } catch (err) {
      console.error("Push subscription failed:", err);
      setStatus("denied");
    }
  };

  const unsubscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await api.delete("/push/unsubscribe", {
          data: { endpoint: sub.endpoint },
        });
        await sub.unsubscribe();
      }
      setStatus("idle");
    } catch (err) {
      console.error("Unsubscribe failed:", err);
    }
  };

  return { status, subscribe, unsubscribe };
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}
