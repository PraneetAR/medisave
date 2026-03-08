"use client";

import { Bell, BellOff, Loader2 } from "lucide-react";
import { usePushNotification } from "@/hooks/usePushNotification";

export default function NotificationBell() {
  const { status, subscribe, unsubscribe } = usePushNotification();

  if (status === "unsupported") return null;

  return (
    <div className="relative group">
      <button
        onClick={status === "granted" ? unsubscribe : subscribe}
        disabled={status === "loading"}
        title={
          status === "granted"
            ? "Notifications enabled — click to disable"
            : status === "denied"
            ? "Notifications blocked — enable in browser settings"
            : "Enable push notifications"
        }
        className="p-2 rounded-xl transition-all duration-150 relative"
        style={{
          backgroundColor:
            status === "granted" ? "#3b5bdb18" : "transparent",
          color:
            status === "granted"
              ? "#3b5bdb"
              : status === "denied"
              ? "#ef4444"
              : "rgba(255,255,255,0.6)",
        }}>
        {status === "loading" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : status === "granted" ? (
          <Bell className="w-4 h-4" />
        ) : (
          <BellOff className="w-4 h-4" />
        )}

        {/* Green dot when active */}
        {status === "granted" && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5
            rounded-full bg-green-400" />
        )}
      </button>

      {/* Tooltip */}
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2
        bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg
        whitespace-nowrap opacity-0 group-hover:opacity-100
        transition-opacity duration-150 pointer-events-none z-50">
        {status === "granted"
          ? "Notifications ON"
          : status === "denied"
          ? "Blocked in browser"
          : "Enable notifications"}
      </div>
    </div>
  );
}
