import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useApi } from "../../hooks/api";
import { employeeService } from "../../services/employeeService";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "../../components/Common/Card";
import Loading from "../../components/Common/Loading";
import Alert from "../../components/Common/Alert";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export default function FinanceDashboard() {
  const api = useApi();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showValues, setShowValues] = useState(true);
  const [consolidatedPayroll, setConsolidatedPayroll] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};

      if (selectedYear) {
        if (selectedMonth) {
          const dateFrom = new Date(selectedYear, selectedMonth - 1, 1);
          const dateTo = new Date(selectedYear, selectedMonth, 0);
          params.date_from = dateFrom.toISOString().split("T")[0];
          params.date_to = dateTo.toISOString().split("T")[0];
        } else {
          params.date_from = `${selectedYear}-01-01`;
          params.date_to = `${selectedYear}-12-31`;
        }
      }

      const [data, employeeData] = await Promise.all([
        api.get("/finance/dashboard", params),
        employeeService.getAll({ page: 1, limit: 1 }),
      ]);

      setDashboard(data);
      setConsolidatedPayroll(employeeData?.meta?.consolidatedPayroll ?? null);
    } catch (err) {
      setError(err.message || "Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedYear, selectedMonth]);

  if (loading) return <Loading />;

  const indicators = [
    {
      title: "Faturamento Bruto",
      value: dashboard?.gross_revenue,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Impostos",
      value: dashboard?.tax,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Custos Operacionais",
      value: dashboard?.operational_costs,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Lucro Líquido",
      value: dashboard?.net_profit,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Margem",
      value: `${dashboard?.margin}%`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Folha de Pagamento",
      value: consolidatedPayroll,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
    },
  ];

  // Dados para gráfico de receita por fonte
  const revenueData = [
    ...Object.entries(dashboard?.revenue_by_health_plan || {})
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
      })),
    ...(dashboard?.revenue_by_source?.particular > 0
      ? [{ name: "Particular", value: dashboard.revenue_by_source.particular }]
      : []),
  ];

  // Dados para gráfico de despesa por categoria
  const expenseData = Object.entries(dashboard?.expense_by_category || {})
    .filter(([, value]) => value > 0)
    .map(([category, value]) => ({
      name: formatCategoryName(category),
      value,
    }));

  const COLORS = [
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
  ];

  return (
    <div className="space-y-8">
      {error && <Alert type="error" message={error} />}

      {/* Filtros de período */}
      <Card>
        <h3 className="font-semibold mb-4">Filtrar por período</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ano</label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedMonth("");
              }}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Todos os anos</option>
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mês</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={!selectedYear}
              className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
            >
              <option value="">Todos os meses</option>
              {Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                return (
                  <option key={month} value={month}>
                    {new Date(2000, month - 1).toLocaleDateString("pt-BR", {
                      month: "long",
                    })}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </Card>

      {/* Indicadores Principais */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Indicadores</h3>
        <button
          type="button"
          onClick={() => setShowValues((v) => !v)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          {showValues ? <Eye size={18} /> : <EyeOff size={18} />}
          {showValues ? "Ocultar valores" : "Mostrar valores"}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicators.map((indicator, idx) => (
          <Card key={idx} className={`${indicator.bgColor}`}>
            <p className="text-sm text-gray-600 mb-2">{indicator.title}</p>
            <p className={`text-2xl font-bold ${indicator.color}`}>
              {!showValues
                ? "••••••"
                : indicator.value === null
                  ? "–"
                  : indicator.title === "Margem"
                    ? indicator.value
                    : formatCurrency(Number(indicator.value))}
            </p>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita por Fonte */}
        <Card>
          <h3 className="font-semibold mb-4">Receita por Fonte</h3>
          {!showValues ? (
            <p className="text-gray-400 text-center py-8">Valores ocultos</p>
          ) : revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name}: ${formatCurrency(value)}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhuma receita registrada neste período
            </p>
          )}
        </Card>

        {/* Despesa por Categoria */}
        <Card>
          <h3 className="font-semibold mb-4">Despesas por Categoria</h3>
          {!showValues ? (
            <p className="text-gray-400 text-center py-8">Valores ocultos</p>
          ) : expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#8884d8">
                  {expenseData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhuma despesa registrada neste período
            </p>
          )}
        </Card>
      </div>

      {/* Resumo */}
      <Card>
        <h3 className="font-semibold mb-4">Resumo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Total de Receitas</p>
            <p className="text-xl font-bold text-green-600">
              {showValues ? dashboard?.revenue_count || 0 : "•••"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total de Despesas</p>
            <p className="text-xl font-bold text-red-600">
              {showValues ? dashboard?.expense_count || 0 : "•••"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Taxa de Lucratividade</p>
            <p className="text-xl font-bold text-blue-600">
              {showValues
                ? `${(
                    (dashboard?.net_profit / (dashboard?.gross_revenue || 1)) *
                    100
                  ).toFixed(1)}%`
                : "•••"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function formatCategoryName(category) {
  const names = {
    salario: "Salário",
    aluguel: "Aluguel",
    energia: "Energia",
    agua: "Água",
    internet: "Internet",
    imposto: "Imposto",
    outros: "Outros",
  };
  return names[category] || category;
}
