import { useAuth } from "./useAuth";

export function useApi() {
  const { token } = useAuth();

  const api = {
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",

    async get(url, params = {}, options = {}) {
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Build query string from params
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = queryString
        ? `${this.baseURL}${url}?${queryString}`
        : `${this.baseURL}${url}`;

      const response = await fetch(fullUrl, {
        method: "GET",
        headers,
        ...options,
      });

      if (!response.ok) throw new Error("Request failed");
      return response.json();
    },

    async post(url, data, options = {}) {
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${url}`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
        ...options,
      });

      if (!response.ok) throw new Error("Request failed");
      return response.json();
    },

    async put(url, data, options = {}) {
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${url}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
        ...options,
      });

      if (!response.ok) throw new Error("Request failed");
      return response.json();
    },

    async delete(url, options = {}) {
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${url}`, {
        method: "DELETE",
        headers,
        ...options,
      });

      if (!response.ok) throw new Error("Request failed");

      // Para respostas 204 (No Content), não há corpo para parsear
      if (response.status === 204) {
        return null;
      }

      return response.json();
    },
  };

  return api;
}
