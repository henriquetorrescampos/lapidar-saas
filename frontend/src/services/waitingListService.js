const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getHeaders() {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export const waitingListService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/waiting-list`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao carregar lista de espera");
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_URL}/waiting-list`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Erro ao adicionar à lista de espera");
    }
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/waiting-list/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Erro ao atualizar");
    }
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/waiting-list/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Erro ao remover da lista de espera");
    }
    return true;
  },
};
