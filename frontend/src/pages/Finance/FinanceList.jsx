import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Loading from "../../components/Common/Loading";
import Alert from "../../components/Common/Alert";
import Modal from "../../components/Common/Modal";
import { financeService } from "../../services/financeService";

export default function FinanceList() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadFinance();
  }, []);

  const loadFinance = async () => {
    try {
      setLoading(true);
      setCurrentPage(1);
      const [data, summaryData] = await Promise.all([
        financeService.getAll(),
        financeService.getSummary(),
      ]);
      setTransactions(Array.isArray(data) ? data : []);
      setSummary(summaryData);
    } catch (err) {
      setError("Erro ao carregar finanças");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await financeService.delete(selectedTransaction.id);
      setSuccess("Transação deletada com sucesso");
      setDeleteModalOpen(false);
      loadFinance();
    } catch (err) {
      setError("Erro ao deletar transação");
    }
  };

  // Agrupar transações por ano e mês
  const groupedTransactions = transactions.reduce((acc, tx) => {
    const date = new Date(tx.date);
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(tx);
    return acc;
  }, {});

  // Converter estrutura agrupada em array para paginação
  const groupedArray = Object.entries(groupedTransactions)
    .sort((a, b) => b[0] - a[0]) // Ordenar anos decrescente
    .map(([year, months]) => ({
      year,
      months: Object.entries(months)
        .sort((a, b) => b[0] - a[0]) // Ordenar meses decrescente
        .map(([month, items]) => ({
          month,
          items: items.sort((a, b) => new Date(b.date) - new Date(a.date)),
        })),
    }));

  // Calcular paginação
  const totalItems = groupedArray.reduce(
    (sum, year) =>
      sum +
      year.months.reduce((monthSum, month) => monthSum + month.items.length, 0),
    0,
  );
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Obter itens para a página atual
  let itemCount = 0;
  const paginatedData = groupedArray
    .map((year) => ({
      ...year,
      months: year.months
        .map((month) => {
          const startIdx = itemCount;
          const endIdx = startIdx + month.items.length;

          if (
            endIdx <= (currentPage - 1) * itemsPerPage ||
            startIdx >= currentPage * itemsPerPage
          ) {
            itemCount = endIdx;
            return { ...month, items: [] };
          }

          const pageStart = Math.max(
            0,
            (currentPage - 1) * itemsPerPage - startIdx,
          );
          const pageEnd = Math.min(
            month.items.length,
            currentPage * itemsPerPage - startIdx,
          );

          itemCount = endIdx;
          return {
            ...month,
            items: month.items.slice(pageStart, pageEnd),
          };
        })
        .filter((month) => month.items.length > 0),
    }))
    .filter((year) => year.months.length > 0);

  const formatMonth = (monthNum) => {
    return new Date(2000, parseInt(monthNum) - 1).toLocaleDateString("pt-BR", {
      month: "long",
    });
  };

  if (loading) return <Loading />;

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Finanças</h1>
          <Button
            variant="primary"
            onClick={() => navigate("/finance/new")}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Nova Transação
          </Button>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess("")}
          />
        )}

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <p className="text-gray-600 text-sm mb-1">Receitas</p>
              <p className="text-2xl font-bold text-green-600">
                R${" "}
                {(summary.income || 0).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </Card>
            <Card>
              <p className="text-gray-600 text-sm mb-1">Despesas</p>
              <p className="text-2xl font-bold text-red-600">
                R${" "}
                {(summary.expense || 0).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </Card>
            <Card>
              <p className="text-gray-600 text-sm mb-1">Total</p>
              <p
                className={`text-2xl font-bold ${(summary.total || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                R${" "}
                {(summary.total || 0).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </Card>
          </div>
        )}

        <Card>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              Nenhuma transação registrada
            </p>
          ) : (
            <div className="space-y-6">
              {paginatedData.map((year) => (
                <div
                  key={year.year}
                  className="border-b pb-6 last:border-b-0 last:pb-0"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    {year.year}
                  </h2>
                  <div className="space-y-4">
                    {year.months.map((month) => (
                      <div
                        key={month.month}
                        className="border-l-4 border-blue-500 pl-4"
                      >
                        <h3 className="text-lg font-semibold text-gray-700 capitalize mb-3">
                          {formatMonth(month.month)}
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="text-left p-3 font-semibold text-gray-700 text-sm">
                                  Tipo
                                </th>
                                <th className="text-left p-3 font-semibold text-gray-700 text-sm">
                                  Categoria
                                </th>
                                <th className="text-left p-3 font-semibold text-gray-700 text-sm">
                                  Valor
                                </th>
                                <th className="text-left p-3 font-semibold text-gray-700 text-sm">
                                  Data
                                </th>
                                <th className="text-right p-3 font-semibold text-gray-700 text-sm">
                                  Ações
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {month.items.map((tx) => (
                                <tr
                                  key={tx.id}
                                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                                >
                                  <td className="p-3">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        tx.type === "income"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {tx.type === "income"
                                        ? "Receita"
                                        : "Despesa"}
                                    </span>
                                  </td>
                                  <td className="p-3 text-gray-600 text-sm">
                                    {tx.category}
                                  </td>
                                  <td className="p-3 font-medium text-sm">
                                    {tx.type === "income" ? "+" : "-"} R${" "}
                                    {tx.amount.toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </td>
                                  <td className="p-3 text-gray-600 text-sm">
                                    {new Date(tx.date).toLocaleDateString(
                                      "pt-BR",
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedTransaction(tx);
                                        setDeleteModalOpen(true);
                                      }}
                                    >
                                      <Trash2
                                        size={18}
                                        className="text-red-600"
                                      />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Controles de Paginação */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-gray-600">
                    Página <span className="font-semibold">{currentPage}</span>{" "}
                    de <span className="font-semibold">{totalPages}</span> (
                    <span className="font-semibold">{totalItems}</span>{" "}
                    transações)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        <Modal
          isOpen={deleteModalOpen}
          title="Deletar Transação"
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          confirmText="Deletar"
        >
          <p className="text-gray-600">
            Tem certeza que deseja deletar esta transação?
          </p>
        </Modal>
      </div>
    </Layout>
  );
}
