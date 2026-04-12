const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getHeaders() {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const userService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar usuários");
    }

    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  },
};
