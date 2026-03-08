"use client";

import { useEffect, useState } from "react";
import { Bell, ShoppingCart, CheckCircle, Clock, Trash2, Loader2 } from "lucide-react";
import { remindersApi } from "@/services/api";
import api from "@/services/api";
import { useAuthStore } from "@/store/auth.store";
import { Reminder } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [reminders, setReminders]         = useState<Reminder[]>([]);
  const [loading, setLoading]             = useState(true);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    remindersApi.getAll()
      .then(({ data }) => setReminders(data.data ?? []))
      .catch(() => setReminders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await api.delete("/users/account");
      clearAuth();
      toast.success("Account deleted successfully");
      router.replace("/login");
    } catch {
      toast.error("Failed to delete account. Try again.");
    } finally {
      setDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  const active   = reminders.filter((r) => r.isActive);
  const inactive = reminders.filter((r) => !r.isActive);

  const formatTime = (h: number, m: number) =>
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  const stats = [
    { label: "Total Reminders", value: reminders.length,  icon: Bell,         color: "#3b5bdb" },
    { label: "Active",          value: active.length,     icon: CheckCircle,  color: "#22c55e" },
    { label: "Paused",          value: inactive.length,   icon: Clock,        color: "#f59e0b" },
    { label: "Platforms",       value: 3,                 icon: ShoppingCart, color: "#8b5cf6" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-800"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
          {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here&apos;s your medicine overview for today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {label}
              </span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}18` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-semibold text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Today's Schedule */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Today&apos;s Schedule
            </h2>
            <Link href="/reminders" className="text-xs font-medium" style={{ color: "#3b5bdb" }}>
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : active.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No active reminders</p>
              <Link href="/reminders"
                className="text-xs font-medium mt-1 inline-block" style={{ color: "#3b5bdb" }}>
                Add your first reminder →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {active.slice(0, 5).map((r) => (
                <div key={r._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-slate-100">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#3b5bdb18" }}>
                    <span className="text-lg">💊</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {r.medicineName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {r.dosage} {r.unit} · {r.times.map((t) => formatTime(t.hour, t.minute)).join(", ")}
                    </p>
                  </div>
                  <span className="badge-green">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link href="/reminders"
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200
                hover:border-[#3b5bdb] hover:bg-[#3b5bdb08] transition-all duration-150">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#3b5bdb18" }}>
                <Bell className="w-5 h-5" style={{ color: "#3b5bdb" }} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Add Reminder</p>
                <p className="text-xs text-slate-500">Schedule a new medicine</p>
              </div>
            </Link>
            <Link href="/prices"
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200
                hover:border-[#22c55e] hover:bg-[#22c55e08] transition-all duration-150">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#22c55e18" }}>
                <ShoppingCart className="w-5 h-5" style={{ color: "#22c55e" }} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Compare Prices</p>
                <p className="text-xs text-slate-500">Find the best deal</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-100">
        <h2 className="font-semibold text-slate-800 mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Danger Zone
        </h2>
        <p className="text-slate-500 text-sm mb-4">
          Permanently delete your account and all associated data.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200
              text-red-600 text-sm font-medium hover:bg-red-50 transition-all duration-150">
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm font-medium text-red-700 mb-3">
              ⚠️ This will permanently delete your account, all reminders, and data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600
                  hover:bg-red-700 text-white text-sm font-medium transition-all duration-150
                  disabled:opacity-50">
                {deletingAccount && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {deletingAccount ? "Deleting..." : "Yes, delete everything"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600
                  text-sm font-medium hover:bg-slate-50 transition-all duration-150">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
