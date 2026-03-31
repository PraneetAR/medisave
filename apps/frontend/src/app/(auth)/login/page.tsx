"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Heart, Loader2, AlertCircle, Lock } from "lucide-react";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import { AxiosError } from "axios"; // Add this line

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm]       = useState({ email: "", password: "" });
  const [otp, setOtp]         = useState("");
  const [step, setStep]       = useState<"login" | "otp">("login");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [locked, setLocked]   = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLocked(false);
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      // Step 1: Just request the OTP
      await authApi.login(form);
      setStep("otp"); // Move to OTP entry step
      toast.success("OTP sent to your email!");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const status = axiosError.response?.status;
      const msg = axiosError.response?.data?.message ?? "Login failed";
      
      if (status === 423) setLocked(true);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp({ email: form.email, otp });
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
      toast.success(`Welcome back, ${data.data.user.name}!`);
      router.replace("/dashboard");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message ?? "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Left panel */}
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
          <p className="text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}>
            Manage medicines smarter. Pay less every time.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {["                                                                   "].map((f) => (
            <span key={f} className="text-xs"
              style={{ color: "rgba(255,255,255,0.4)" }}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-slate-800 mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Welcome back
            </h1>
            <p className="text-slate-500 text-sm">
              Sign in to your MediSave account
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className={`flex items-center gap-2.5 p-3.5 rounded-xl mb-4
              border ${locked
                ? "bg-orange-50 border-orange-200"
                : "bg-red-50 border-red-200"}`}>
              {locked
                ? <Lock className="w-4 h-4 text-orange-500 shrink-0" />
                : <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
              <p className={`text-sm ${locked ? "text-orange-600" : "text-red-600"}`}>
                {error}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {step === "login" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input type="email" placeholder="you@example.com"
                    className="input-field"
                    value={form.email}
                    onChange={(e) => {
                      setError("");
                      setForm({ ...form, email: e.target.value });
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      className="input-field pr-10"
                      value={form.password}
                      onChange={(e) => {
                        setError("");
                        setForm({ ...form, password: e.target.value });
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button onClick={handleSubmit} disabled={loading || locked}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {locked ? "Account Locked" : loading ? "Sending OTP..." : "Get OTP"}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Enter OTP sent to {form.email}</label>
                  <input type="text" placeholder="123456" maxLength={6}
                    className="input-field text-center tracking-[1em] text-lg font-bold"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()} />
                </div>

                <button onClick={handleVerifyOtp} disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>

                <button onClick={() => setStep("login")} className="text-sm text-slate-500 hover:text-slate-700 w-full text-center">
                  ← Back to password
                </button>
              </>
            )}
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium"
              style={{ color: "#3b5bdb" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}