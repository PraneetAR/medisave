import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach JWT on every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Handle 401 - try refresh then logout
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccess  = data.data.accessToken;
        const newRefresh = data.data.refreshToken;

        localStorage.setItem("accessToken", newAccess);
        localStorage.setItem("refreshToken", newRefresh);

        if (original.headers) {
          original.headers.Authorization = `Bearer ${newAccess}`;
        }
        return api(original);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// ─── Reminders ────────────────────────────────────────────────────
export const remindersApi = {
  getAll:  ()                      => api.get("/reminders"),
  getOne:  (id: string)            => api.get(`/reminders/${id}`),
  create:  (data: unknown)         => api.post("/reminders", data),
  update:  (id: string, data: unknown) => api.put(`/reminders/${id}`, data),
  delete:  (id: string)            => api.delete(`/reminders/${id}`),
  toggle:  (id: string)            => api.patch(`/reminders/${id}/toggle`),
};

// ─── Prices ───────────────────────────────────────────────────────
export const pricesApi = {
  search: (q: string) =>
    api.get(`/prices/search?q=${encodeURIComponent(q)}`),
  cacheStatus: (q: string) =>
    api.get(`/prices/cache-status?q=${encodeURIComponent(q)}`),
};

export default api;
