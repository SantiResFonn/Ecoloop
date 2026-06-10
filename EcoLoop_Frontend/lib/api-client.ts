const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getSessionToken = () => {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem("ecoloop_session");
  if (stored) {
    try {
      return JSON.parse(stored).token;
    } catch {
      return null;
    }
  }
  return null;
};

export const apiClient = {
  async request(path: string, options: RequestInit = {}) {
    const token = getSessionToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error || "Error en la solicitud");
    }

    return payload;
  },

  get(path: string) {
    return this.request(path, { method: "GET" });
  },

  post(path: string, body?: any) {
    return this.request(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put(path: string, body?: any) {
    return this.request(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete(path: string) {
    return this.request(path, { method: "DELETE" });
  },
};

export default apiClient;
