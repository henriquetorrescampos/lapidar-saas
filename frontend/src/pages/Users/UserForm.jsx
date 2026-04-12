import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Alert from "../../components/Common/Alert";
import { userService } from "../../services/userService";

const UNITS = ["SENADOR CANEDO"];

export default function UserForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    unit: "SENADOR CANEDO",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Converter nome para maiúsculas automaticamente
    if (name === "name") {
      newValue = value.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await userService.create(formData);
      navigate("/users");
    } catch (err) {
      setError(err.message || "Erro ao criar usuário");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/users")}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Novo Usuário</h1>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-10"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Função
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="user">Usuário</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value=""></option>
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate("/users")}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? "Criando..." : "Criar"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
