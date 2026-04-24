import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Save,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Info,
} from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Alert from "../../components/Common/Alert";
import Loading from "../../components/Common/Loading";
import { patientService } from "../../services/patientService";
import { appointmentService } from "../../services/appointmentService";
import { getPatientAge } from "../../utils/patient";

const HISTORY_PAGE_SIZE = 5;

const SPECIALTIES = [
  "Psicopedagogia",
  "Fonoaudiologia",
  "Psicologia",
  "Terapia Ocupacional",
];

const SPECIALTIES_BY_PATIENT_TYPE = {
  ABA: [
    "Psicopedagogia",
    "Fonoaudiologia",
    "Psicologia",
    "Terapia Ocupacional",
  ],
  TERAPIA_ADULTO: ["Psicologia"],
};

const SESSION_COUNT_BY_TYPE = {
  ABA: 10,
  TERAPIA_ADULTO: 4,
};

const MIN_SESSIONS_BY_TYPE = {
  ABA: 4,
  TERAPIA_ADULTO: 4,
};

const getSessionCount = (patient) => {
  const type = patient?.patient_type || "ABA";
  if (type.includes("TERAPIA_ADULTO"))
    return SESSION_COUNT_BY_TYPE.TERAPIA_ADULTO;
  return SESSION_COUNT_BY_TYPE.ABA;
};

const getMinSessions = (patient) => {
  const type = patient?.patient_type || "ABA";
  if (type.includes("TERAPIA_ADULTO"))
    return MIN_SESSIONS_BY_TYPE.TERAPIA_ADULTO;
  return MIN_SESSIONS_BY_TYPE.ABA;
};

const SPECIALTY_COLORS = {
  Psicopedagogia: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    badge: "bg-purple-500",
    light: "bg-purple-50",
  },
  Fonoaudiologia: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    badge: "bg-blue-500",
    light: "bg-blue-50",
  },
  Psicologia: {
    bg: "bg-green-100",
    text: "text-green-800",
    badge: "bg-green-500",
    light: "bg-green-50",
  },
  "Terapia Ocupacional": {
    bg: "bg-orange-100",
    text: "text-orange-800",
    badge: "bg-orange-500",
    light: "bg-orange-50",
  },
};

function SessionRow({ specialty, index, sessionItem, onToggle, onDateChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={`${specialty}-${index}`}
        checked={sessionItem?.checked || false}
        onChange={() => onToggle(specialty, index)}
        className="w-4 h-4 text-primary-600 rounded cursor-pointer"
      />
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        <label htmlFor={`${specialty}-${index}`} className="text-sm text-gray-700 cursor-pointer">
          Sessão {index + 1}
        </label>
        {sessionItem?.checked && (
          <input
            type="date"
            value={sessionItem?.date || ""}
            onChange={(e) => onDateChange(specialty, index, e.target.value)}
            className="text-xs px-2 py-1 border border-gray-300 rounded"
          />
        )}
      </div>
    </div>
  );
}
const SessionRowMemo = React.memo(SessionRow);

export default function SessionsPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const initializeSessions = (patient) => {
    const count = getSessionCount(patient);
    const buildArray = () =>
      Array(count)
        .fill(null)
        .map(() => ({ checked: false, date: "", id: null }));
    return {
      Psicopedagogia: buildArray(),
      Fonoaudiologia: buildArray(),
      Psicologia: buildArray(),
      "Terapia Ocupacional": buildArray(),
    };
  };

  const [sessions, setSessions] = useState(initializeSessions(null));
  // Ref para handlers estáveis lerem o estado mais recente sem re-criar a função
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;

  const [history, setHistory] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [specialtyPages, setSpecialtyPages] = useState({});
  const [expandedSpecialties, setExpandedSpecialties] = useState({});

  const mapHistoryItem = (item) => ({
    id: item.id,
    specialty: item.specialty,
    completed: item.completed,
    total: item.total,
    dates: Array.isArray(item.session_dates) ? item.session_dates : [],
    registeredAt: new Date(item.registered_at).toLocaleString("pt-BR"),
    registeredBy: item.registered_by_name,
  });

  const formatPatientAge = (birthDate) => {
    const age = getPatientAge(birthDate);
    return age === null ? "Idade indisponível" : `${age} anos`;
  };

  const getAvailableSpecialties = (patient) => {
    const patientType = patient?.patient_type || "ABA";
    if (patientType.includes("ABA")) {
      return SPECIALTIES_BY_PATIENT_TYPE["ABA"] || SPECIALTIES;
    }
    if (patientType.includes("TERAPIA_ADULTO")) {
      return SPECIALTIES_BY_PATIENT_TYPE["TERAPIA_ADULTO"] || SPECIALTIES;
    }
    return SPECIALTIES_BY_PATIENT_TYPE[patientType] || SPECIALTIES;
  };

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      setSessions(initializeSessions(selectedPatient));
      loadExistingSessions();
      loadSessionHistory(selectedPatient.id);
    } else {
      setHistory([]);
      setSelectedHistoryItem(null);
      setDeleteConfirmItem(null);
      setSpecialtyPages({});
    }
  }, [selectedPatient]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getAll();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Erro ao carregar pacientes");
    } finally {
      setLoading(false);
    }
  };

  const loadExistingSessions = async () => {
    if (!selectedPatient) return;

    try {
      const availableSpecialties = getAvailableSpecialties(selectedPatient);
      const sessionsData = {};

      for (const specialty of availableSpecialties) {
        const existingSessions =
          await appointmentService.getByPatientAndSpecialty(
            selectedPatient.id,
            specialty,
          );

        const defaultSessions = initializeSessions(selectedPatient)[specialty];
        const sortedExistingSessions = Array.isArray(existingSessions)
          ? [...existingSessions].sort(
              (a, b) => new Date(a.date) - new Date(b.date),
            )
          : [];

        sessionsData[specialty] = defaultSessions.map((session, index) => {
          const existingSession = sortedExistingSessions[index];
          return existingSession
            ? {
                checked: true,
                date: existingSession.date.split("T")[0],
                id: existingSession.id,
              }
            : session;
        });
      }

      setSessions(sessionsData);
    } catch (err) {
      console.error("Erro ao carregar sessões:", err);
      setSessions(initializeSessions(selectedPatient));
    }
  };

  const loadSessionHistory = async (patientId) => {
    try {
      const data = await appointmentService.getHistoryByPatient(patientId);
      setHistory(Array.isArray(data) ? data.map(mapHistoryItem) : []);
      setSpecialtyPages({});
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
      setError("Erro ao carregar histórico de atendimentos");
    }
  };

  const therapyPatients = patients.filter(
    (patient) => patient.patient_type !== "AVALIACAO_NEUROPSICOLOGICA",
  );

  const filteredPatients = therapyPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getSpecialtySessions = (specialty) => {
    if (Array.isArray(sessions[specialty])) {
      return sessions[specialty];
    }
    return initializeSessions(selectedPatient)[specialty] || [];
  };

  const handleSessionToggle = useCallback(async (specialty, index) => {
    if (!selectedPatient) {
      setError("Selecione um paciente");
      return;
    }

    const current = sessionsRef.current;
    const specialtySessions = Array.isArray(current[specialty])
      ? current[specialty]
      : initializeSessions(selectedPatient)[specialty] || [];
    const currentSession = specialtySessions[index];
    if (!currentSession) return;

    const newCheckedState = !currentSession.checked;
    const todayLocal = new Date();
    const today = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, "0")}-${String(todayLocal.getDate()).padStart(2, "0")}`;
    const defaultDate = currentSession.date || today;

    setSessions((prev) => {
      const arr = Array.isArray(prev[specialty]) ? prev[specialty] : initializeSessions(selectedPatient)[specialty] || [];
      const ns = [...arr];
      if (!ns[index]) return prev;
      ns[index] = { ...ns[index], checked: newCheckedState, date: newCheckedState ? defaultDate : ns[index].date };
      return { ...prev, [specialty]: ns };
    });

    if (newCheckedState) {
      try {
        const result = await appointmentService.createSingle({ patient_id: selectedPatient.id, specialty, date: defaultDate });
        setSessions((prev) => {
          const arr = Array.isArray(prev[specialty]) ? prev[specialty] : initializeSessions(selectedPatient)[specialty] || [];
          const ns = [...arr];
          if (!ns[index]) return prev;
          ns[index] = { ...ns[index], id: result.id };
          return { ...prev, [specialty]: ns };
        });
      } catch (err) {
        console.error("❌ Erro ao salvar sessão:", err);
        setSessions((prev) => {
          const arr = Array.isArray(prev[specialty]) ? prev[specialty] : initializeSessions(selectedPatient)[specialty] || [];
          const ns = [...arr];
          if (!ns[index]) return prev;
          ns[index] = { ...ns[index], checked: false };
          return { ...prev, [specialty]: ns };
        });
        setError(`Erro ao salvar sessão: ${err.message}`);
      }
    } else {
      try {
        if (currentSession.id) {
          await appointmentService.deleteSingle(currentSession.id);
          setSessions((prev) => {
            const arr = Array.isArray(prev[specialty]) ? prev[specialty] : initializeSessions(selectedPatient)[specialty] || [];
            const ns = [...arr];
            if (!ns[index]) return prev;
            ns[index] = { ...ns[index], id: null };
            return { ...prev, [specialty]: ns };
          });
        }
      } catch (err) {
        console.error("❌ Erro ao deletar sessão:", err);
        setSessions((prev) => {
          const arr = Array.isArray(prev[specialty]) ? prev[specialty] : initializeSessions(selectedPatient)[specialty] || [];
          const ns = [...arr];
          if (!ns[index]) return prev;
          ns[index] = { ...ns[index], checked: true };
          return { ...prev, [specialty]: ns };
        });
        setError(`Erro ao deletar sessão: ${err.message}`);
      }
    }
  }, [selectedPatient]);

  const handleSessionDateChange = useCallback(async (specialty, index, newDate) => {
    if (!newDate) return;
    const current = sessionsRef.current;
    const specialtySessions = Array.isArray(current[specialty])
      ? current[specialty]
      : initializeSessions(selectedPatient)[specialty] || [];
    const currentSession = specialtySessions[index];

    setSessions((prev) => {
      const arr = Array.isArray(prev[specialty]) ? prev[specialty] : initializeSessions(selectedPatient)[specialty] || [];
      const ns = [...arr];
      if (!ns[index]) return prev;
      ns[index] = { ...ns[index], date: newDate };
      return { ...prev, [specialty]: ns };
    });

    if (!currentSession?.checked) return;

    try {
      if (currentSession.id) {
        await appointmentService.updateDate(currentSession.id, newDate);
      } else {
        const result = await appointmentService.createSingle({ patient_id: selectedPatient.id, specialty, date: newDate });
        setSessions((prev) => {
          const arr = Array.isArray(prev[specialty]) ? prev[specialty] : initializeSessions(selectedPatient)[specialty] || [];
          const ns = [...arr];
          if (!ns[index]) return prev;
          ns[index] = { ...ns[index], id: result.id };
          return { ...prev, [specialty]: ns };
        });
      }
    } catch (err) {
      console.error("❌ Erro ao atualizar data da sessão:", err);
      setError(`Erro ao atualizar data: ${err.message}`);
    }
  }, [selectedPatient]);

  const countCompleted = (specialty) => {
    return getSpecialtySessions(specialty).filter((s) => s.checked).length;
  };

  const isSpecialtyComplete = (specialty) => {
    const completed = countCompleted(specialty);
    const sessionCount = getSessionCount(selectedPatient);
    const minSessions = getMinSessions(selectedPatient);
    return completed >= minSessions && completed <= sessionCount;
  };

  const getSpecialtyColor = (specialty) => {
    return SPECIALTY_COLORS[specialty] || SPECIALTY_COLORS.Psicopedagogia;
  };

  const handleSaveSessions = async (specialty) => {
    if (!selectedPatient) {
      setError("Selecione um paciente");
      return;
    }

    if (!isSpecialtyComplete(specialty)) {
      const min = getMinSessions(selectedPatient);
      setError(
        `Marque pelo menos ${min} sessões para gravar o histórico de ${specialty}`,
      );
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const checkedSessions = sessions[specialty].filter((s) => s.checked);

      if (checkedSessions.some((session) => !session.date)) {
        throw new Error(
          "Defina a data para todas as sessões marcadas antes de registrar o histórico.",
        );
      }

      const sessionsToCreate = checkedSessions.filter((session) => !session.id);
      const createdIds = [];

      for (const session of sessionsToCreate) {
        const result = await appointmentService.createSingle({
          patient_id: selectedPatient.id,
          specialty,
          date: session.date,
        });
        createdIds.push(result.id);
      }

      const sessionIds = checkedSessions
        .map((session) => session.id || createdIds.shift())
        .filter(Boolean);

      if (sessionIds.length !== checkedSessions.length) {
        throw new Error("Algumas sessões ainda não foram salvas corretamente");
      }

      await appointmentService.archiveHistory({
        patient_id: selectedPatient.id,
        specialty,
        session_ids: sessionIds,
        dates: checkedSessions.map((session) => session.date),
        total: getSessionCount(selectedPatient),
      });

      await Promise.all([
        loadExistingSessions(),
        loadSessionHistory(selectedPatient.id),
      ]);

      setSpecialtyPages((prev) => ({ ...prev, [specialty]: 1 }));
      setSuccess(`✅ Histórico de ${specialty} registrado com sucesso!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("❌ Erro ao registrar histórico:", err);
      setError(err.message || "Erro ao registrar histórico. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHistory = (item) => {
    setDeleteConfirmItem(item);
  };

  const confirmDeleteHistory = async () => {
    if (!deleteConfirmItem || !selectedPatient) return;

    try {
      await appointmentService.deleteHistory(deleteConfirmItem.id);
      await loadSessionHistory(selectedPatient.id);
      setDeleteConfirmItem(null);
    } catch (err) {
      console.error("Erro ao deletar histórico:", err);
      setError(err.message || "Erro ao deletar histórico");
    }
  };

  if (loading) return <Loading />;

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Agendamentos</h1>

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

        {/* Seletor de Paciente */}
        <Card className="mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar e Selecionar Paciente
            </label>
            <input
              type="text"
              placeholder="Digite o nome do paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          {searchTerm && filteredPatients.length > 0 && (
            <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto bg-white">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => {
                    setSelectedPatient(patient);
                    setSearchTerm("");
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 transition flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-800">{patient.name}</p>
                    <p className="text-xs text-gray-500">
                      {patient.health_plan} •{" "}
                      {formatPatientAge(patient.birth_date)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchTerm && filteredPatients.length === 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Nenhum paciente encontrado com {searchTerm}
              </p>
            </div>
          )}

          {!searchTerm && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ou escolha da lista
              </label>
              <select
                value={selectedPatient?.id || ""}
                onChange={(e) => {
                  const patient = therapyPatients.find(
                    (p) => p.id === parseInt(e.target.value),
                  );
                  setSelectedPatient(patient);
                }}
                className="input-field"
              >
                <option value="">-- Selecione um paciente --</option>
                {therapyPatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {formatPatientAge(patient.birth_date)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedPatient && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900">
                <strong>{selectedPatient.name}</strong> - Plano:{" "}
                {selectedPatient.health_plan} - Idade:{" "}
                {formatPatientAge(selectedPatient.birth_date)}
              </p>
              <button
                onClick={() => {
                  setSelectedPatient(null);
                  setSearchTerm("");
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Desselecionar
              </button>
            </div>
          )}
        </Card>

        {/* Grid de Especialidades */}
        {selectedPatient && (
          <>
            {/* Dicas ABA */}
            {selectedPatient?.patient_type?.includes("ABA") && (
              <details className="mb-4 bg-blue-50 border border-blue-200 rounded-lg">
                <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer select-none">
                  <Info size={16} className="text-blue-500 shrink-0" />
                  <span className="text-sm font-medium text-blue-800">
                    Dicas para emissão de guias
                  </span>
                </summary>
                <ul className="px-4 pb-3 pt-1 space-y-1.5 text-lg text-blue-700 list-disc list-inside">
                  <li>
                    Paciente 1x/semana → 2 sessões na guia equivalem a 1
                    atendimento. Checar quantas semanas no mês (ex: 4 semanas =
                    emitir 8 sessões).
                  </li>
                  <li>
                    Paciente 2x/semana → 1 sessão na guia equivale a 1
                    atendimento. Checar quantas semanas no mês (ex: 4 semanas =
                    emitir 8 sessões).
                  </li>
                </ul>
              </details>
            )}

            {/* Dicas Terapia Adulto */}
            {selectedPatient?.patient_type?.includes("TERAPIA_ADULTO") && (
              <details className="mb-4 bg-blue-50 border border-blue-200 rounded-lg">
                <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer select-none">
                  <Info size={16} className="text-blue-500 shrink-0" />
                  <span className="text-sm font-medium text-blue-800">
                    Dicas para emissão de guias
                  </span>
                </summary>
                <ul className="px-4 pb-3 pt-1 space-y-1.5 text-lg text-blue-700 list-disc list-inside">
                  <li>
                    A guia de terapia adulto com 10 quantidades representa 4
                    sessões. Sempre emitir a guia na última sessão para reservar
                    o horário para o paciente.
                  </li>
                </ul>
              </details>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {getAvailableSpecialties(selectedPatient).map((specialty) => (
                <Card key={specialty}>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {specialty}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {countCompleted(specialty)}/
                      {getSessionCount(selectedPatient)} sessões
                    </p>
                  </div>

                  <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                    {Array.from({ length: getSessionCount(selectedPatient) }).map((_, index) => (
                      <SessionRowMemo
                        key={index}
                        specialty={specialty}
                        index={index}
                        sessionItem={getSpecialtySessions(specialty)[index]}
                        onToggle={handleSessionToggle}
                        onDateChange={handleSessionDateChange}
                      />
                    ))}
                  </div>

                  <Button
                    variant={
                      isSpecialtyComplete(specialty) ? "primary" : "secondary"
                    }
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => handleSaveSessions(specialty)}
                    disabled={submitting || !isSpecialtyComplete(specialty)}
                  >
                    <Save size={18} />
                    Gravar Histórico
                  </Button>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Histórico de Atendimentos */}
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Histórico de Atendimentos ({history.length})
          </h2>

          {!selectedPatient ? (
            <p className="text-center text-gray-600 py-8">
              Selecione um paciente para visualizar o histórico
            </p>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              Nenhum histórico de atendimento
            </p>
          ) : (
            <div className="space-y-3">
              {SPECIALTIES.filter((s) =>
                history.some((item) => item.specialty === s),
              ).map((specialty) => {
                const specialtyItems = history.filter(
                  (item) => item.specialty === specialty,
                );
                const color = getSpecialtyColor(specialty);
                const currentPage = specialtyPages[specialty] || 1;
                const totalPages = Math.ceil(
                  specialtyItems.length / HISTORY_PAGE_SIZE,
                );
                const pageItems = specialtyItems.slice(
                  (currentPage - 1) * HISTORY_PAGE_SIZE,
                  currentPage * HISTORY_PAGE_SIZE,
                );
                const isExpanded = expandedSpecialties[specialty] !== false;

                return (
                  <div
                    key={specialty}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedSpecialties((prev) => ({
                          ...prev,
                          [specialty]: !isExpanded,
                        }))
                      }
                      className={`w-full flex items-center justify-between px-4 py-3 ${color.bg} hover:opacity-90 transition`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${color.badge}`}
                        />
                        <span className={`font-semibold ${color.text}`}>
                          {specialty}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full bg-white bg-opacity-60 ${color.text}`}
                        >
                          {specialtyItems.length} registro
                          {specialtyItems.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`${color.text} transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div>
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                              <th className="text-left px-4 py-2 text-sm font-semibold text-gray-600">
                                Sessões
                              </th>
                              <th className="text-left px-4 py-2 text-sm font-semibold text-gray-600">
                                Data de Registro
                              </th>
                              <th className="text-left px-4 py-2 text-sm font-semibold text-gray-600">
                                Registrado por
                              </th>
                              <th className="text-right px-4 py-2 text-sm font-semibold text-gray-600">
                                Ações
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageItems.map((item) => (
                              <tr
                                key={item.id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition"
                              >
                                <td className="px-4 py-3 text-gray-600">
                                  {item.completed} de {item.total} completas
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {item.registeredAt}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {item.registeredBy || "—"}
                                </td>
                                <td className="px-4 py-3 text-right flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedHistoryItem(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    📅 Ver Datas
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteHistory(item)}
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

                        {totalPages > 1 && (
                          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-500">
                              {(currentPage - 1) * HISTORY_PAGE_SIZE + 1}–
                              {Math.min(
                                currentPage * HISTORY_PAGE_SIZE,
                                specialtyItems.length,
                              )}{" "}
                              de {specialtyItems.length}
                            </p>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setSpecialtyPages((prev) => ({
                                    ...prev,
                                    [specialty]: currentPage - 1,
                                  }))
                                }
                                disabled={currentPage === 1}
                              >
                                <ChevronLeft size={16} />
                              </Button>
                              <span className="text-xs text-gray-600 px-1">
                                {currentPage}/{totalPages}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setSpecialtyPages((prev) => ({
                                    ...prev,
                                    [specialty]: currentPage + 1,
                                  }))
                                }
                                disabled={currentPage === totalPages}
                              >
                                <ChevronRight size={16} />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Modal de Confirmação de Deleção */}
        {deleteConfirmItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Confirmar exclusão
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja excluir o histórico de{" "}
                <strong>{deleteConfirmItem.specialty}</strong> registrado em{" "}
                <strong>{deleteConfirmItem.registeredAt}</strong>? Esta ação não
                pode ser desfeita.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteConfirmItem(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmDeleteHistory}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Excluir
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal de Datas Salvas */}
        {selectedHistoryItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full ${getSpecialtyColor(selectedHistoryItem.specialty).badge}`}
                  ></div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Datas - {selectedHistoryItem.specialty}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedHistoryItem(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Registrado em: {selectedHistoryItem.registeredAt}
              </p>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 mb-3">
                  Sessões Agendadas:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedHistoryItem.dates &&
                  selectedHistoryItem.dates.length > 0 ? (
                    selectedHistoryItem.dates.map((date, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${getSpecialtyColor(selectedHistoryItem.specialty).light} ${getSpecialtyColor(selectedHistoryItem.specialty).text} font-medium text-center`}
                      >
                        {new Date(date).toLocaleDateString("pt-BR", {
                          weekday: "short",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">Nenhuma data registrada</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedHistoryItem(null)}
                >
                  Fechar
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
