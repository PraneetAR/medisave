"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Heart, Loader2, AlertCircle, Lock, KeyRound } from "lucide-react";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

type Step = "login" | "otp" | "forgot_request" | "forgot_reset";

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm]       = useState({ email: "", password: "" });
  const [resetForm, setResetForm] = useState({ otp: "", password: "" });
  const [otp, setOtp]         = useState("");
  const [step, setStep]       = useState<Step>("login");
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
      await authApi.login(form);
      setStep("otp");
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

  const handleForgotPassword = async () => {
    setError("");
    if (!form.email) {
      setError("Please enter your email address first");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.forgotPassword({ email: form.email });
      toast.success(data.message);
      setStep("forgot_reset");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message ?? "Failed to request reset");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    if (resetForm.otp.length !== 6 || resetForm.password.length < 8) {
      setError("Please fill all fields correctly (Password min 8 chars)");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.resetPassword({
        email: form.email,
        otp: resetForm.otp,
        password: resetForm.password
      });
      toast.success(data.message);
      setStep("login");
      setResetForm({ otp: "", password: "" });
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message ?? "Failed to reset password");
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
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-slate-800 mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              {step === "forgot_reset" ? "Reset Password" : "Welcome back"}
            </h1>
            <p className="text-slate-500 text-sm">
              {step === "forgot_reset" 
                ? "Enter the code sent to your email" 
                : "Sign in to your MediSave account"}
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    <button 
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Forgot password?
                    </button>
                  </div>
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
            ) : step === "otp" ? (
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
            ) : (
              /* forgot_reset step */
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Reset Code (OTP)</label>
                  <input type="text" placeholder="123456" maxLength={6}
                    className="input-field text-center tracking-[1em] text-lg font-bold"
                    value={resetForm.otp}
                    onChange={(e) => setResetForm({ ...resetForm, otp: e.target.value.replace(/\D/g, "") })} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      className="input-field pr-10"
                      value={resetForm.password}
                      onChange={(e) => {
                        setError("");
                        setResetForm({ ...resetForm, password: e.target.value });
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleResetPassword()} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button onClick={handleResetPassword} disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Resetting..." : "Reset Password"}
                </button>

                <button onClick={() => setStep("login")} className="text-sm text-slate-500 hover:text-slate-700 w-full text-center">
                  ← Back to login
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
