const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getHeaders() {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function getFileHeaders() {
  const token = localStorage.getItem("token");
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export const employeeService = {
  getAll: async ({ page, limit } = {}) => {
    const params = new URLSearchParams();
    if (page) params.set("page", page);
    if (limit) params.set("limit", limit);

    const query = params.toString();
    const url = `${API_URL}/employees${query ? `?${query}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Erro ao carregar funcionários");
    }

    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Funcionário não encontrado");
    }

    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_URL}/employees`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Erro ao criar funcionário");
    }

    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Erro ao atualizar funcionário");
    }

    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Erro ao deletar funcionário");
    }

    return true;
  },

  getDocuments: async (employeeId) => {
    const response = await fetch(
      `${API_URL}/employees/${employeeId}/documents`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Erro ao carregar documentos");
    }

    return response.json();
  },

  uploadDocument: async (employeeId, file, documentType) => {
    const formData = new FormData();
    formData.append("file", file);
    if (documentType) {
      formData.append("document_type", documentType);
    }

    const response = await fetch(
      `${API_URL}/employees/${employeeId}/documents`,
      {
        method: "POST",
        headers: getFileHeaders(),
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Erro ao anexar documento");
    }

    return response.json();
  },

  deleteDocument: async (employeeId, documentId) => {
    const response = await fetch(
      `${API_URL}/employees/${employeeId}/documents/${documentId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Erro ao excluir documento");
    }

    return true;
  },

  downloadDocument: async (employeeId, document) => {
    const response = await fetch(
      `${API_URL}/employees/${employeeId}/documents/${document.id}/download`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Erro ao baixar documento");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = document.original_name || "documento";
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  getDocumentDownloadUrl: (employeeId, documentId) =>
    `${API_URL}/employees/${employeeId}/documents/${documentId}/download`,
};
