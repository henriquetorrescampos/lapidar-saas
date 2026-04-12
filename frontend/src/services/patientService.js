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

export const patientService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/patients`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar pacientes");
    }

    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Paciente não encontrado");
    }

    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_URL}/patients`, {
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

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      method: "PUT",
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
    const response = await fetch(`${API_URL}/patients/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      // Se quiser ver o erro real do backend antes de lançar a exceção:
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Erro ao deletar paciente");
    }

    // Não use .json() para status 204
    return true;
  },
};
