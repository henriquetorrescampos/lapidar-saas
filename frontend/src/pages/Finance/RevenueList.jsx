import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/api";
import Card from "../../components/Common/Card";
import Alert from "../../components/Common/Alert";
import Loading from "../../components/Common/Loading";
import Modal from "../../components/Common/Modal";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export default function RevenueList() {
  const api = useApi();
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showMonths, setShowMonths] = useState(6);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchRevenues();
  }, [filter, selectedYear, selectedMonth]);

  const fetchRevenues = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { source: filter !== "all" ? filter : undefined };

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

      const data = await api.get("/finance/revenue", params);
      setRevenues(data);
    } catch (err) {
      setError(err.message || "Erro ao carregar receitas");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/finance/revenue/${id}`);
      setRevenues(revenues.filter((r) => r.id !== id));
      setDeleteModal({ isOpen: false, id: null });
    } catch (err) {
      setError(err.message || "Erro ao deletar receita");
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

  const totalAmount = revenues.reduce((sum, r) => sum + r.amount, 0);

  // Agrupar receitas por ano e mês
  const groupedRevenues = revenues.reduce((acc, revenue) => {
    const date = new Date(revenue.date);
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(revenue);
    return acc;
  }, {});

  // Ordenar anos decrescente
  const sortedYears = Object.keys(groupedRevenues).sort((a, b) => b - a);

  // Coletar os meses recentes (baseado em showMonths)
  const recentMonths = [];
  for (const year of sortedYears) {
    const sortedMonthsInYear = Object.keys(groupedRevenues[year]).sort(
      (a, b) => b - a,
    );
    for (const month of sortedMonthsInYear) {
      recentMonths.push({ year, month });
      if (recentMonths.length >= showMonths) break;
    }
    if (recentMonths.length >= showMonths) break;
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Receitas</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter("health_plan")}
            className={`px-4 py-2 rounded ${
              filter === "health_plan"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Planos
          </button>
          <button
            onClick={() => setFilter("particular")}
            className={`px-4 py-2 rounded ${
              filter === "particular"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Particular
          </button>
        </div>
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
            {sortedYears.map((year) => (
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
              Object.keys(groupedRevenues[selectedYear] || {})
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

      {error && <Alert type="error" message={error} />}

      {revenues.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Nenhuma receita registrada
        </p>
      ) : (
        <>
          <div className="mb-4 p-4 bg-green-50 rounded">
            <p className="text-sm text-gray-600">Total de Receitas</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div className="space-y-6">
            {sortedYears.map((year) => (
              <div key={year} className="border rounded-lg p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{year}</h2>
                <div className="space-y-4">
                  {Object.keys(groupedRevenues[year])
                    .sort((a, b) => b - a)
                    .filter((month) =>
                      recentMonths.some(
                        (rm) => rm.year === year && rm.month === month,
                      ),
                    )
                    .map((month) => {
                      const monthName = new Date(
                        year,
                        month - 1,
                      ).toLocaleDateString("pt-BR", { month: "long" });
                      const monthRevenues = groupedRevenues[year][month];
                      const monthTotal = monthRevenues.reduce(
                        (sum, r) => sum + r.amount,
                        0,
                      );

                      return (
                        <div
                          key={month}
                          className="border-l-4 border-blue-500 pl-4"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-700">
                              {monthName}
                            </h3>
                            <span className="text-sm text-gray-600">
                              Total: {formatCurrency(monthTotal)} (
                              {monthRevenues.length} receita
                              {monthRevenues.length !== 1 ? "s" : ""})
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
                                    Fonte
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
                                {monthRevenues
                                  .sort(
                                    (a, b) =>
                                      new Date(b.date) - new Date(a.date),
                                  )
                                  .map((revenue) => (
                                    <tr
                                      key={revenue.id}
                                      className="border-b hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-3 text-sm">
                                        {new Date(
                                          revenue.date,
                                        ).toLocaleDateString("pt-BR")}
                                      </td>
                                      <td className="px-4 py-3 text-sm">
                                        {revenue.source === "health_plan"
                                          ? `Plano: ${revenue.health_plan?.name || "N/A"}`
                                          : "Particular"}
                                      </td>
                                      <td className="px-4 py-3 text-right font-semibold">
                                        {formatCurrency(revenue.amount)}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        <button
                                          onClick={() =>
                                            openDeleteModal(revenue.id)
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
          {recentMonths.length <
            Object.values(groupedRevenues).reduce(
              (sum, year) => sum + Object.keys(year).length,
              0,
            ) && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowMonths((prev) => prev + 6)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Carregar mais meses
              </button>
            </div>
          )}{" "}
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
        <p className="text-gray-700 mb-6">
          Tem certeza que deseja deletar esta receita? Esta ação não pode ser
          desfeita.
        </p>
      </Modal>
    </Card>
  );
}
