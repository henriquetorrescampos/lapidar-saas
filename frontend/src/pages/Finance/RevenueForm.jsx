import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/api";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Alert from "../../components/Common/Alert";

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

export default function RevenueForm({ onSuccess }) {
  const api = useApi();
  const [healthPlans, setHealthPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    source: "health_plan",
    health_plan_id: "",
    amount: "",
  });

  useEffect(() => {
    fetchHealthPlans();
  }, []);

  const fetchHealthPlans = async () => {
    try {
      const data = await api.get("/finance/health-plan");
      setHealthPlans(data);
    } catch (err) {
      console.error("Erro ao carregar planos:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        source: formData.source,
        amount: parseCurrency(formData.amount),
      };

      if (formData.source === "health_plan") {
        if (!formData.health_plan_id) {
          throw new Error("Selecione um plano de saúde");
        }
        payload.health_plan_id = parseInt(formData.health_plan_id);
      }

      await api.post("/finance/revenue", payload);
      setSuccess(true);
      setFormData({
        source: "health_plan",
        health_plan_id: "",
        amount: "",
      });

      setTimeout(() => setSuccess(false), 3000);
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Erro ao criar receita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Registrar Receita</h2>

      {error && <Alert type="error" message={error} />}
      {success && (
        <Alert type="success" message="Receita registrada com sucesso!" />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fonte</label>
          <select
            value={formData.source}
            onChange={(e) => {
              setFormData({ ...formData, source: e.target.value });
              if (e.target.value === "particular") {
                setFormData((prev) => ({
                  ...prev,
                  health_plan_id: "",
                }));
              }
            }}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="health_plan">Plano de Saúde</option>
            <option value="particular">Particular</option>
          </select>
        </div>

        {formData.source === "health_plan" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Plano de Saúde
            </label>
            <select
              value={formData.health_plan_id}
              onChange={(e) =>
                setFormData({ ...formData, health_plan_id: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Selecione um plano</option>
              {healthPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>
        )}

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
          {loading ? "Registrando..." : "Registrar Receita"}
        </Button>
      </form>
    </Card>
  );
}
