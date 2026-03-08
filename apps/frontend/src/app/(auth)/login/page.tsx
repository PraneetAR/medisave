"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Heart, Loader2, AlertCircle } from "lucide-react";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm]     = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");  // ← inline error state

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
      toast.success(`Welcome back, ${data.data.user.name}!`);
      router.replace("/dashboard");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Login failed. Please try again.";
      setError(msg);  // ← show inline instead of toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <div className="hidden lg:flex w-[420px] flex-col justify-between p-12"
        style={{ backgroundColor: "#0a1550" }}>
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
        <div>
          <h2 className="text-white text-4xl font-semibold leading-tight mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Your health,<br />perfectly timed.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            Never miss a dose. Always find the best price.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-slate-800 mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Welcome back
            </h1>
            <p className="text-slate-500 text-sm">Sign in to your MediSave account</p>
          </div>

          {/* ← Inline error banner */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl mb-4
              bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" placeholder="you@example.com" className="input-field"
                value={form.email}
                onChange={(e) => { setError(""); setForm({ ...form, email: e.target.value }); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} placeholder="••••••••"
                  className="input-field pr-10"
                  value={form.password}
                  onChange={(e) => { setError(""); setForm({ ...form, password: e.target.value }); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium" style={{ color: "#3b5bdb" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
