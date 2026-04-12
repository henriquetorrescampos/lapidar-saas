import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { authService } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Common/Button";
import Alert from "../components/Common/Alert";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validar campos antes de fazer login
    if (!email.trim() || !password.trim()) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(email, password);

      if (!response.token) {
        throw new Error("Token não recebido da resposta do servidor");
      }

      // Armazenar o token no contexto e localStorage
      await login(response.token);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Erro ao fazer login. Verifique as credenciais.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f8fafc,_#e2e8f0_45%,_#cbd5e1)] p-4">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-[28px] bg-white/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur">
          <div className="mb-8 text-center">
            {showLogo && (
              <div className="mb-6 rounded-[24px] bg-white px-6 py-5">
                <img
                  src="/lapidar-logo.jpg"
                  alt="Lapidar Clínica Multidisciplinar"
                  className="mx-auto w-full max-w-[300px] object-contain"
                  onError={() => setShowLogo(false)}
                />
              </div>
            )}
            {!showLogo && (
              <>
                <h1 className="mb-2 text-3xl font-bold text-primary-700">
                  Lapidar
                </h1>
                <p className="text-gray-600">Clínica Multidisciplinar</p>
              </>
            )}
            <p className="bold text-lg font-medium uppercase tracking-[0.24em] text-slate-400">
              Acesso ao sistema
            </p>
          </div>

          {error && (
            <Alert
              type="error"
              title="Erro no login"
              message={error}
              onClose={() => setError("")}
            />
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? "Carregando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Sistema Lapidar Clínica Multidisciplinar
          </p>
        </div>
      </div>
    </div>
  );
}
