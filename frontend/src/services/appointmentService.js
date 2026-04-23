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

export const appointmentService = {
  getByPatientAndSpecialty: async (patientId, specialty) => {
    try {
      const response = await fetch(
        `${API_URL}/sessions?patient_id=${patientId}&specialty=${specialty}`,
        {
          method: "GET",
          headers: getHeaders(),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || error.message || "Erro ao buscar sessões",
        );
      }

      return response.json();
    } catch (err) {
      console.error("Erro na requisição:", err);
      throw new Error(err.message || "Erro ao buscar sessões");
    }
  },

  createSingle: async (data) => {
    try {
      const response = await fetch(`${API_URL}/sessions`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || error.message || "Erro ao gravar sessão",
        );
      }

      return response.json();
    } catch (err) {
      console.error("Erro na requisição:", err);
      throw new Error(err.message || "Erro ao gravar sessão");
    }
  },

  createBulk: async (data) => {
    try {
      const response = await fetch(`${API_URL}/sessions/bulk`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || error.message || "Erro ao gravar sessões",
        );
      }

      return response.json();
    } catch (err) {
      console.error("Erro na requisição:", err);
      throw new Error(err.message || "Erro ao gravar sessões");
    }
  },

  getHistoryByPatient: async (patientId) => {
    try {
      const response = await fetch(
        `${API_URL}/sessions/history?patient_id=${patientId}`,
        {
          method: "GET",
          headers: getHeaders(),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || error.message || "Erro ao buscar histórico",
        );
      }

      return response.json();
    } catch (err) {
      console.error("Erro na requisição:", err);
      throw new Error(err.message || "Erro ao buscar histórico");
    }
  },

  archiveHistory: async (data) => {
    try {
      const response = await fetch(`${API_URL}/sessions/history`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || error.message || "Erro ao gravar histórico",
        );
      }

      return response.json();
    } catch (err) {
      console.error("Erro na requisição:", err);
      throw new Error(err.message || "Erro ao gravar histórico");
    }
  },

  updateDate: async (sessionId, date) => {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ date }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || "Erro ao atualizar sessão");
      }

      return response.json();
    } catch (err) {
      console.error("Erro na requisição:", err);
      throw new Error(err.message || "Erro ao atualizar sessão");
    }
  },

  deleteSingle: async (sessionId) => {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || error.message || "Erro ao deletar sessão",
        );
      }

      return response.json();
    } catch (err) {
      console.error("Erro na requisição:", err);
      throw new Error(err.message || "Erro ao deletar sessão");
    }
  },

  deleteHistory: async (historyId) => {
    try {
      const response = await fetch(`${API_URL}/sessions/history/${historyId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || error.message || "Erro ao deletar histórico",
        );
      }

      return response.json();
    } catch (err) {
      console.error("Erro na requisição:", err);
      throw new Error(err.message || "Erro ao deletar histórico");
    }
  },
};
