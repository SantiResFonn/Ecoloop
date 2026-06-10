import { apiClient } from "@/lib/api-client";

export const authService = {
  async login(email: string, password: string) {
    const data = await apiClient.post("/api/v1/auth/login", { email, password });
    if (typeof window !== "undefined") {
      const session = { ...data.user, token: data.token };
      window.localStorage.setItem("ecoloop_session", JSON.stringify(session));
      document.cookie = `ecoloop_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
    return data;
  },

  async register(email: string, password: string, fullName?: string) {
    const data = await apiClient.post("/api/v1/auth/register", {
      email,
      password,
      full_name: fullName,
      role: "user",
    });
    if (typeof window !== "undefined") {
      const session = { ...data.user, token: data.token };
      window.localStorage.setItem("ecoloop_session", JSON.stringify(session));
      document.cookie = `ecoloop_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
    return data;
  },

  async getUser() {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem("ecoloop_session");
    if (stored) {
      try {
        const session = JSON.parse(stored);
        const profile = await apiClient.get(`/api/v1/profiles/${session.id}`);
        // Return profile extended with the token
        return { ...profile, token: session.token };
      } catch (err) {
        console.error("Error refreshing user profile:", err);
        return null;
      }
    }
    return null;
  },

  async logout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("ecoloop_session");
      document.cookie = `ecoloop_session=; path=/; max-age=0`;
    }
  },
};

export default authService;
