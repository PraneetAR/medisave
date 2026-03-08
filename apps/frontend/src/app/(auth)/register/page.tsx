"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Heart, Loader2 } from "lucide-react";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields"); return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
      toast.success("Account created! Welcome to MediSave 🎉");
      router.replace("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#3b5bdb" }}>
            <Heart className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: "#0a1550" }}>
            MediSave
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-800 mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Create account
          </h1>
          <p className="text-slate-500 text-sm">Start managing your medicines smarter</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
            <input type="text" placeholder="Your name" className="input-field"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input type="email" placeholder="you@example.com" className="input-field"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className="input-field pr-10"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-medium" style={{ color: "#3b5bdb" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
