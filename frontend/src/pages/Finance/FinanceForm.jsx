import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Alert from "../../components/Common/Alert";
import { financeService } from "../../services/financeService";

export default function FinanceForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    type: "income",
    category: "",
    amount: "",
  });

  const categories = {
    income: ["Atendimentos", "Consultas", "Procedimentos", "Outro"],
    expense: ["Aluguel", "Salários", "Suprimentos", "Serviços", "Outro"],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await financeService.create({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      navigate("/finance");
    } catch (err) {
      setError(err.message || "Erro ao criar transação");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/finance")}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Nova Transação</h1>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input-field"
              >
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories[formData.type].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor
              </label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate("/finance")}>
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
