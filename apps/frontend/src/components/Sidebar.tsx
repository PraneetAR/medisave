"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ShoppingCart, LayoutDashboard, LogOut, Heart, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import NotificationBell from "@/components/ui/NotificationBell";
import toast from "react-hot-toast";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reminders", label: "Reminders",  icon: Bell },
  { href: "/prices",    label: "Prices",     icon: ShoppingCart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    toast.success("Logged out successfully");
    router.replace("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-40"
      style={{ backgroundColor: "#0a1550" }}>

      {/* Logo */}
      <div className="px-6 py-7" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#22c55e" }}>
            <Heart className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white text-xl font-semibold"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            MediSave
          </span>
        </div>
        <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          Smart health companion
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
              style={{
                backgroundColor: active ? "#3b5bdb" : "transparent",
                color: active ? "white" : "rgba(255,255,255,0.6)",
              }}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>

        {/* Notification bell */}
        <div className="flex items-center justify-between px-3 py-2 mb-2">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Push alerts
          </span>
          <NotificationBell />
        </div>

        {/* User info */}
        <div className="px-3 py-2 mb-1">
          <p className="text-white text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
            {user?.email}
          </p>
        </div>

        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            transition-all duration-150 text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.6)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#f87171";
            e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.6)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}>
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
