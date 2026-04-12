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

export const neuroScheduleService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.year) params.append("year", filters.year);
    if (filters.month) params.append("month", filters.month);
    if (filters.tab) params.append("tab", filters.tab);
    if (filters.displayStatus)
      params.append("displayStatus", filters.displayStatus);
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    const response = await fetch(`${API_URL}/neuro-schedules?${params}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar agendamentos");
    }

    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_URL}/neuro-schedules`, {
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

  updateStatus: async (id, status) => {
    const response = await fetch(`${API_URL}/neuro-schedules/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/neuro-schedules/${id}`, {
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
