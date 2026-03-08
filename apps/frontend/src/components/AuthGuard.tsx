"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/services/api";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        clearAuth();
        router.replace("/login");
        return;
      }
      try {
        const { data } = await authApi.me();
        const refreshToken = localStorage.getItem("refreshToken") ?? "";
        setAuth(data.data, token, refreshToken);
      } catch {
        clearAuth();
        router.replace("/login");
      }
    };
    verify();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#3b5bdb]/20 border-t-[#3b5bdb] rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading MediSave...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
