"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Heart, Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

interface PasswordRule {
  label: string;
  test:  (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters",      test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter (A-Z)",  test: (pw) => /[A-Z]/.test(pw) },
  { label: "One number (0-9)",            test: (pw) => /[0-9]/.test(pw) },
];

export default function RegisterPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [touched, setTouched] = useState(false);

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(form.password));

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    if (!allRulesPassed) {
      setError("Password does not meet requirements");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
      toast.success("Account created! Welcome to MediSave 🎉");
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#3b5bdb" }}>
            <Heart className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold"
            style={{ fontFamily: "'Playfair Display', serif", color: "#0a1550" }}>
            MediSave
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-800 mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Create account
          </h1>
          <p className="text-slate-500 text-sm">
            Start managing your medicines smarter
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl mb-4
            bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full name
            </label>
            <input type="text" placeholder="Your name" className="input-field"
              value={form.name}
              onChange={(e) => { setError(""); setForm({ ...form, name: e.target.value }); }} />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email address
            </label>
            <input type="email" placeholder="you@example.com" className="input-field"
              value={form.email}
              onChange={(e) => { setError(""); setForm({ ...form, email: e.target.value }); }} />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Create a strong password"
                className="input-field pr-10"
                value={form.password}
                onChange={(e) => {
                  setError("");
                  setTouched(true);
                  setForm({ ...form, password: e.target.value });
                }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                  text-slate-400 hover:text-slate-600 transition-colors">
                {showPw
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength rules */}
            {touched && form.password.length > 0 && (
              <div className="mt-2.5 space-y-1.5 p-3 bg-slate-50
                rounded-xl border border-slate-100">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(form.password);
                  return (
                    <div key={rule.label}
                      className="flex items-center gap-2">
                      {passed
                        ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0"
                            style={{ color: "#22c55e" }} />
                        : <XCircle className="w-3.5 h-3.5 shrink-0 text-slate-300" />}
                      <span className="text-xs"
                        style={{ color: passed ? "#16a34a" : "#94a3b8" }}>
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || (touched && !allRulesPassed)}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-medium"
            style={{ color: "#3b5bdb" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
