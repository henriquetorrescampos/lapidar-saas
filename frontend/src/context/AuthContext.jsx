import React, { createContext, useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Buscar dados do usuário via API segura em vez de decodificar o JWT
      fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Token inválido");
          return res.json();
        })
        .then((userData) => {
          setUser(userData);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          setLoading(false);
        });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
