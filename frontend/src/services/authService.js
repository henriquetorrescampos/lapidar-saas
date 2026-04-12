const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao fazer login");
    }

    return response.json();
  },

  logout: () => {
    localStorage.removeItem("token");
  },
};
