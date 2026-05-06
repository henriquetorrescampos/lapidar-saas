import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Search,
  X,
} from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Common/Card";
import Loading from "../../components/Common/Loading";
import { guideEmissionService } from "../../services/guideEmissionService";

const PAGE_SIZE = 10;

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const SPECIALTY_COLORS = {
  Psicologia: "bg-green-100 text-green-700",
  Fonoaudiologia: "bg-blue-100 text-blue-700",
  "Terapia Ocupacional": "bg-orange-100 text-orange-700",
  Psicopedagogia: "bg-violet-100 text-violet-700",
};

const ALL_SPECIALTIES = [
  "Psicologia",
  "Fonoaudiologia",
  "Terapia Ocupacional",
  "Psicopedagogia",
];

function formatDays(days) {
  if (!days) return "Sem agenda";
  return days.split(",").map(Number).map((d) => DAY_NAMES[d]).join(", ");
}

export default function GuideEmissionPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [emissions, setEmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const [search, setSearch] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await guideEmissionService.getEmissions(month, year);
      setEmissions(data);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  // Reset página ao mudar filtros ou mês
  useEffect(() => { setCurrentPage(1); }, [search, filterSpecialty, filterStatus, month, year]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  async function handleToggle(item) {
    const key = `${item.patient_id}-${item.specialty}`;
    setToggling(key);
    try {
      await guideEmissionService.toggle(item.patient_id, item.specialty, month, year);
      setEmissions((prev) =>
        prev.map((e) =>
          e.patient_id === item.patient_id && e.specialty === item.specialty
            ? { ...e, emitted: !e.emitted, emitted_at: !e.emitted ? new Date().toISOString() : null }
            : e
        )
      );
    } finally {
      setToggling(null);
    }
  }

  // Stats baseados em TODOS os dados (sem filtro)
  const emitted = emissions.filter((e) => e.emitted).length;
  const pending = emissions.length - emitted;

  // Filtro client-side
  const filtered = useMemo(() => {
    return emissions.filter((item) => {
      if (search && !item.patient_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterSpecialty && item.specialty !== filterSpecialty) return false;
      if (filterStatus === "emitted" && !item.emitted) return false;
      if (filterStatus === "pending" && item.emitted) return false;
      return true;
    });
  }, [emissions, search, filterSpecialty, filterStatus]);

  // Agrupar por paciente
  const allGrouped = useMemo(() => {
    return filtered.reduce((acc, item) => {
      if (!acc[item.patient_id]) {
        acc[item.patient_id] = { id: item.patient_id, name: item.patient_name, items: [] };
      }
      acc[item.patient_id].items.push(item);
      return acc;
    }, {});
  }, [filtered]);

  const groupedList = Object.values(allGrouped);
  const totalPatients = groupedList.length;
  const totalPages = Math.max(1, Math.ceil(totalPatients / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageGroups = groupedList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasActiveFilter = search || filterSpecialty || filterStatus !== "all";

  function clearFilters() {
    setSearch("");
    setFilterSpecialty("");
    setFilterStatus("all");
  }

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Emissão de Guias</h1>
        <p className="text-gray-500 text-sm mb-8">
          Controle mensal de emissão de guias para pacientes ABA
        </p>

        {/* Navegação de mês */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-700 min-w-[180px] text-center">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <p className="text-sm text-gray-500">Emitidas</p>
            <p className="text-3xl font-bold text-green-600">{emitted}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Pendentes</p>
            <p className="text-3xl font-bold text-amber-500">{pending}</p>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 py-2 text-sm"
            />
          </div>

          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="input-field py-2 text-sm min-w-[180px]"
          >
            <option value="">Todas as especialidades</option>
            {ALL_SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field py-2 text-sm min-w-[140px]"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="emitted">Emitidas</option>
          </select>

          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <X size={14} />
              Limpar filtros
            </button>
          )}
        </div>

        {loading ? (
          <Loading />
        ) : emissions.length === 0 ? (
          <Card>
            <div className="flex items-center gap-3 text-gray-400 py-4">
              <AlertCircle size={24} />
              <p>Nenhum paciente ABA com especialidades encontrado. Configure a agenda dos pacientes no cadastro.</p>
            </div>
          </Card>
        ) : groupedList.length === 0 ? (
          <Card>
            <div className="flex items-center gap-3 text-gray-400 py-4">
              <Search size={24} />
              <p>Nenhum resultado para os filtros aplicados.</p>
            </div>
          </Card>
        ) : (
          <>
            <div className="space-y-6">
              {pageGroups.map((group) => (
                <Card key={group.id}>
                  <h3 className="font-bold text-gray-800 text-lg mb-4">{group.name}</h3>
                  <div className="space-y-3">
                    {group.items.map((item) => {
                      const key = `${item.patient_id}-${item.specialty}`;
                      const isToggling = toggling === key;
                      const noSchedule = !item.schedule_days;

                      return (
                        <div
                          key={key}
                          className={`flex items-center justify-between p-3 rounded-lg border transition ${
                            item.emitted ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              onClick={() => handleToggle(item)}
                              disabled={isToggling}
                              className="shrink-0 text-gray-400 hover:text-green-600 transition disabled:opacity-50"
                            >
                              {item.emitted ? (
                                <CheckCircle size={24} className="text-green-500" />
                              ) : (
                                <Circle size={24} />
                              )}
                            </button>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    SPECIALTY_COLORS[item.specialty] || "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {item.specialty}
                                </span>
                                {noSchedule && (
                                  <span className="text-xs text-amber-500 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Sem agenda configurada
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {noSchedule
                                  ? "Configure os dias na edição do paciente"
                                  : `${formatDays(item.schedule_days)} — ${item.quantity} sessões`}
                              </p>
                            </div>
                          </div>

                          {item.emitted && item.emitted_at && (
                            <span className="text-xs text-gray-400 shrink-0">
                              Emitida em {new Date(item.emitted_at).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <p className="text-sm text-gray-500">
                  {totalPatients} paciente{totalPatients !== 1 ? "s" : ""} encontrado{totalPatients !== 1 ? "s" : ""} —
                  página {safePage} de {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                        page === safePage
                          ? "bg-primary-600 text-white"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
