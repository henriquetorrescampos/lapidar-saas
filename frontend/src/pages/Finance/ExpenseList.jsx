import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/api";
import Card from "../../components/Common/Card";
import Alert from "../../components/Common/Alert";
import Loading from "../../components/Common/Loading";
import Modal from "../../components/Common/Modal";

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
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export default function ExpenseList() {
  const api = useApi();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchExpenses();
  }, [filter, selectedYear, selectedMonth]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = filter !== "all" ? { category: filter } : {};

      if (selectedYear) {
        if (selectedMonth) {
          // Filtro por mês específico
          const dateFrom = new Date(selectedYear, selectedMonth - 1, 1);
          const dateTo = new Date(selectedYear, selectedMonth, 0); // Último dia do mês
          params.date_from = dateFrom.toISOString().split("T")[0];
          params.date_to = dateTo.toISOString().split("T")[0];
        } else {
          // Filtro por ano inteiro
          params.date_from = `${selectedYear}-01-01`;
          params.date_to = `${selectedYear}-12-31`;
        }
      }

      // Remover undefined
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key],
      );

      const data = await api.get("/finance/expense", params);
      setExpenses(data);
    } catch (err) {
      setError(err.message || "Erro ao carregar despesas");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/finance/expense/${id}`);
      setExpenses(expenses.filter((e) => e.id !== id));
      setDeleteModal({ isOpen: false, id: null });
    } catch (err) {
      setError(err.message || "Erro ao deletar despesa");
    }
  };

  const openDeleteModal = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null });
  };

  const confirmDelete = () => {
    if (deleteModal.id) {
      handleDelete(deleteModal.id);
    }
  };

  if (loading) return <Loading />;

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Agrupar despesas por ano e mês
  const groupedExpenses = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(expense);
    return acc;
  }, {});

  // Ordenar anos decrescente
  const sortedYears = Object.keys(groupedExpenses).sort((a, b) => b - a);

  // Coletar os anos e meses para os filtros
  const availableYears = sortedYears;
  const categories = ["all", ...Object.keys(EXPENSE_CATEGORIES)];

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Despesas</h2>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded whitespace-nowrap text-sm ${
              filter === cat
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {cat === "all" ? "Todas" : EXPENSE_CATEGORIES[cat]}
          </button>
        ))}
      </div>

      {/* Filtros de data */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ano</label>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedMonth(""); // Reset month when year changes
            }}
            className="px-3 py-2 border rounded"
          >
            <option value="">Todos os anos</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mês</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border rounded"
            disabled={!selectedYear}
          >
            <option value="">Todos os meses</option>
            {selectedYear &&
              Object.keys(groupedExpenses[selectedYear] || {})
                .sort((a, b) => b - a)
                .map((month) => (
                  <option key={month} value={month}>
                    {new Date(selectedYear, month - 1).toLocaleDateString(
                      "pt-BR",
                      { month: "long" },
                    )}
                  </option>
                ))}
          </select>
        </div>
      </div>

      {expenses.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Nenhuma despesa registrada
        </p>
      ) : (
        <>
          <div className="mb-4 p-4 bg-red-50 rounded">
            <p className="text-sm text-gray-600">Total de Despesas</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalAmount)}
            </p>
          </div>

          <div className="space-y-6">
            {sortedYears.map((year) => (
              <div key={year} className="border rounded-lg p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{year}</h2>
                <div className="space-y-4">
                  {Object.keys(groupedExpenses[year])
                    .sort((a, b) => b - a)
                    .map((month) => {
                      const monthName = new Date(
                        year,
                        month - 1,
                      ).toLocaleDateString("pt-BR", { month: "long" });
                      const monthExpenses = groupedExpenses[year][month];
                      const monthTotal = monthExpenses.reduce(
                        (sum, e) => sum + e.amount,
                        0,
                      );

                      return (
                        <div
                          key={month}
                          className="border-l-4 border-red-500 pl-4"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-700">
                              {monthName}
                            </h3>
                            <span className="text-sm text-gray-600">
                              Total: {formatCurrency(monthTotal)} (
                              {monthExpenses.length} despesa
                              {monthExpenses.length !== 1 ? "s" : ""})
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-4 py-2 text-left text-sm font-semibold">
                                    Data
                                  </th>
                                  <th className="px-4 py-2 text-left text-sm font-semibold">
                                    Categoria
                                  </th>
                                  <th className="px-4 py-2 text-right text-sm font-semibold">
                                    Valor
                                  </th>
                                  <th className="px-4 py-2 text-center text-sm font-semibold">
                                    Ações
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {monthExpenses
                                  .sort(
                                    (a, b) =>
                                      new Date(b.date) - new Date(a.date),
                                  )
                                  .map((expense) => (
                                    <tr
                                      key={expense.id}
                                      className="border-b hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-3 text-sm">
                                        {new Date(
                                          expense.date,
                                        ).toLocaleDateString("pt-BR")}
                                      </td>
                                      <td className="px-4 py-3 text-sm font-medium">
                                        {EXPENSE_CATEGORIES[expense.category]}
                                      </td>
                                      <td className="px-4 py-3 text-right font-semibold">
                                        {formatCurrency(expense.amount)}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        <button
                                          onClick={() =>
                                            openDeleteModal(expense.id)
                                          }
                                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                          Deletar
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Confirmar Exclusão"
        onConfirm={confirmDelete}
        confirmText="Deletar"
        confirmVariant="danger"
      >
        <p className="text-gray-700">
          Tem certeza que deseja remover esta despesa? Esta ação não pode ser
          desfeita.
        </p>
      </Modal>
    </Card>
  );
}
