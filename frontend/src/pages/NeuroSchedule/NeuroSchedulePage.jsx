import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Loading from "../../components/Common/Loading";
import Alert from "../../components/Common/Alert";
import Modal from "../../components/Common/Modal";
import { neuroScheduleService } from "../../services/neuroScheduleService";

const MONTHS = [
  { value: "", label: "Todos os meses" },
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "pendente", label: "Pendente" },
  { value: "atrasado", label: "Atrasado" },
  { value: "proximo_mes", label: "Próximo mês" },
  { value: "em_dia", label: "Em dia" },
];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

function formatDeadline(dateStr) {
  const d = new Date(dateStr);
  const month = d.toLocaleString("pt-BR", { month: "long" });
  const year = d.getFullYear();
  return `${month.charAt(0).toUpperCase() + month.slice(1)}/${year}`;
}

function computeDisplayStatus(schedule) {
  const now = new Date();
  const deadline = new Date(schedule.deadline);

  if (schedule.status === "em_dia") return "em_dia";

  // Atrasado: prazo já passou
  if (now > deadline) return "atrasado";

  // Próximo mês: prazo é no mês seguinte ao atual
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  if (deadline >= nextMonthStart && deadline <= nextMonthEnd)
    return "proximo_mes";

  return "pendente";
}

function getNextMonthStart(dateStr) {
  const d = new Date(dateStr);
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

function canMarkEmDia(schedule) {
  if (schedule.status === "em_dia") return false;
  const now = new Date();
  // Libera somente a partir do 1º dia do mês seguinte ao cadastro
  const nextMonth = getNextMonthStart(schedule.date);
  return now >= nextMonth;
}

const STATUS_CONFIG = {
  atrasado: {
    label: "Atrasado",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: AlertTriangle,
    iconColor: "text-red-500",
  },
  proximo_mes: {
    label: "Próximo mês",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: CalendarClock,
    iconColor: "text-orange-500",
  },
  em_dia: {
    label: "Em dia",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: CheckCircle2,
    iconColor: "text-green-500",
  },
  pendente: {
    label: "Pendente",
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    icon: CalendarClock,
    iconColor: "text-gray-500",
  },
};

const PAGE_SIZE = 10;

export default function NeuroSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Aba ativa: "pendentes" ou "concluidos"
  const [activeTab, setActiveTab] = useState("pendentes");

  // Filtros
  const currentYear = new Date().getFullYear();
  const [filterYear, setFilterYear] = useState(String(currentYear));
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchName, setSearchName] = useState("");

  // Paginação server-side
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Stats do servidor
  const [stats, setStats] = useState({
    totalPendentes: 0,
    totalConcluidos: 0,
    totalAtrasados: 0,
    totalProximoMes: 0,
  });

  // Modal confirmação
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Debounce para busca por nome
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchName), 300);
    return () => clearTimeout(timer);
  }, [searchName]);

  // Reset página ao trocar filtros ou aba
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterYear, filterMonth, filterStatus, debouncedSearch]);

  // Carregar dados do servidor quando filtros/página mudam
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        tab: activeTab,
        year: filterYear,
        page: String(currentPage),
        limit: String(PAGE_SIZE),
      };
      if (filterMonth) filters.month = filterMonth;
      if (filterStatus && activeTab === "pendentes")
        filters.displayStatus = filterStatus;
      if (debouncedSearch) filters.search = debouncedSearch;

      const result = await neuroScheduleService.getAll(filters);
      setSchedules(Array.isArray(result.data) ? result.data : []);
      setTotalItems(result.total || 0);
      setTotalPages(result.totalPages || 1);
      if (result.stats) setStats(result.stats);
    } catch (err) {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    filterYear,
    filterMonth,
    filterStatus,
    debouncedSearch,
    currentPage,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkEmDia = async () => {
    if (!selectedSchedule) return;
    setError("");
    try {
      await neuroScheduleService.updateStatus(selectedSchedule.id, "em_dia");
      setSuccess("Status atualizado para Em dia");
      setConfirmModal(false);
      setSelectedSchedule(null);
      await loadData();
    } catch (err) {
      setError(err.error || err.message || "Erro ao atualizar status");
    }
  };

  const yearOptions = [];
  for (let y = currentYear - 2; y <= currentYear + 2; y++) {
    yearOptions.push(y);
  }

  const statusFilterOptions = STATUS_OPTIONS.filter(
    (s) => s.value !== "em_dia",
  );

  if (loading) return <Loading />;

  return (
    <Layout>
      <div>
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-800">
            Painel de Procedimentos
          </h1>
          <p className="text-gray-500 mt-1">
            Acompanhe os procedimentos pendentes dos seus pacientes
          </p>
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

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border-2 border-blue-100 bg-blue-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Users size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pendentes</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalPendentes}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border-2 border-red-100 bg-red-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Atrasados</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.totalAtrasados}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border-2 border-orange-100 bg-orange-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <CalendarClock size={24} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Próximo Mês</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalProximoMes}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border-2 border-green-100 bg-green-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalConcluidos}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("pendentes")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === "pendentes"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Pendentes ({stats.totalPendentes})
          </button>
          <button
            onClick={() => setActiveTab("concluidos")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === "concluidos"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Concluídos ({stats.totalConcluidos})
          </button>
        </div>

        {/* Filtros */}
        <Card>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente:
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano:
              </label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="input-field w-32"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mês:
              </label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="input-field w-48"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            {activeTab === "pendentes" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-field w-40"
                >
                  {statusFilterOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>

        {/* Tabela */}
        <div className="mt-6">
          <Card>
            {schedules.length === 0 ? (
              <p className="text-center text-gray-600 py-8">
                Nenhum agendamento encontrado
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-4 font-semibold text-gray-700">
                          Paciente
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-700">
                          Data
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-700">
                          Prazo
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-700">
                          Status
                        </th>
                        {activeTab === "pendentes" && (
                          <th className="text-left p-4 pl-8 font-semibold text-gray-700">
                            Ações
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((schedule) => {
                        const displayStatus = computeDisplayStatus(schedule);
                        const config = STATUS_CONFIG[displayStatus];
                        const StatusIcon = config.icon;
                        const canMark = canMarkEmDia(schedule);

                        return (
                          <tr
                            key={schedule.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition"
                          >
                            <td className="p-4 text-gray-800">
                              {schedule.patient?.name}
                            </td>
                            <td className="p-4 text-gray-600">
                              {formatDate(schedule.date)}
                            </td>
                            <td className="p-4 text-gray-600">
                              {formatDeadline(schedule.deadline)}
                            </td>
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium ${config.bg} ${config.text} ${config.border}`}
                              >
                                <StatusIcon
                                  size={14}
                                  className={config.iconColor}
                                />
                                {config.label}
                              </span>
                            </td>
                            {activeTab === "pendentes" && (
                              <td className="p-4 pl-8">
                                <div className="flex items-center gap-2">
                                  <div className="relative group">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedSchedule(schedule);
                                        setConfirmModal(true);
                                      }}
                                      disabled={!canMark}
                                    >
                                      <CheckCircle2
                                        size={22}
                                        className={
                                          canMark
                                            ? "text-green-600"
                                            : "text-gray-300"
                                        }
                                      />
                                    </Button>
                                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                      {canMark
                                        ? "Clique para concluir o atendimento"
                                        : `Disponível a partir de ${formatDate(getNextMonthStart(schedule.date))}`}
                                    </span>
                                  </div>
                                  {!canMark && (
                                    <span className="text-xs text-gray-400">
                                      Disponível em{" "}
                                      {formatDate(
                                        getNextMonthStart(schedule.date),
                                      )}
                                    </span>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 mt-2">
                    <p className="text-sm text-gray-600">
                      Mostrando {(currentPage - 1) * PAGE_SIZE + 1}-
                      {Math.min(currentPage * PAGE_SIZE, totalItems)} de{" "}
                      {totalItems}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft size={18} />
                      </Button>
                      <span className="text-sm text-gray-700">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight size={18} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
        {/* Modal Confirmar Conclusão */}
        <Modal
          isOpen={confirmModal}
          onClose={() => {
            setConfirmModal(false);
            setSelectedSchedule(null);
          }}
          title="Confirmar Conclusão"
          onConfirm={handleMarkEmDia}
          confirmText="Confirmar"
        >
          <p className="text-gray-600">
            Deseja marcar a avaliação de{" "}
            <strong>{selectedSchedule?.patient?.name}</strong> como concluída?
          </p>
        </Modal>
      </div>
    </Layout>
  );
}
