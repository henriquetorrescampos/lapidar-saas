import React, { useState } from "react";
import { useApi } from "../../hooks/api";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Alert from "../../components/Common/Alert";

const EXPENSE_CATEGORIES = {
  salario: "Salário/Pessoal",
  aluguel: "Aluguel",
  energia: "Energia",
  agua: "Água",
  internet: "Internet",
  imposto: "Imposto",
  outros: "Outros Custos",
};

const formatCurrency = (value) => {
  if (!value) return "";
  const numericValue = value.replace(/[^\d]/g, "");
  if (!numericValue) return "";
  const number = parseFloat(numericValue) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
};

const parseCurrency = (formattedValue) => {
  if (!formattedValue) return "";
  const numericString = formattedValue.replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(numericString) || "";
};

export default function ExpenseForm({ onSuccess }) {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    category: "salario",
    amount: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        category: formData.category,
        amount: parseCurrency(formData.amount),
      };

      await api.post("/finance/expense", payload);
      setSuccess(true);
      setFormData({
        category: "salario",
        amount: "",
      });

      setTimeout(() => setSuccess(false), 3000);
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Erro ao criar despesa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Registrar Despesa</h2>

      {error && <Alert type="error" message={error} />}
      {success && (
        <Alert type="success" message="Despesa registrada com sucesso!" />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Categoria</label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-3 py-2 border rounded"
            required
          >
            {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Valor</label>
          <input
            type="text"
            value={formData.amount}
            onChange={(e) => {
              const input = e.target.value;
              const formatted = formatCurrency(input);
              setFormData({ ...formData, amount: formatted });
            }}
            className="w-full px-3 py-2 border rounded"
            placeholder="R$ 0,00"
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Registrando..." : "Registrar Despesa"}
        </Button>
      </form>
    </Card>
  );
}
