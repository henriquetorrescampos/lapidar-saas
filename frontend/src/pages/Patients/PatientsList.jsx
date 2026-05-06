import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Loading from "../../components/Common/Loading";
import Alert from "../../components/Common/Alert";
import Modal from "../../components/Common/Modal";
import { patientService } from "../../services/patientService";
import { getPatientAge } from "../../utils/patient";

const ITEMS_PER_PAGE = 10;

export default function PatientsList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHealthPlan, setFilterHealthPlan] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

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

  const handleDelete = async () => {
    try {
      await patientService.delete(selectedPatient.id);
      setSuccess("Paciente deletado com sucesso");
      setDeleteModalOpen(false);
      loadPatients();
    } catch (err) {
      setError("Erro ao deletar paciente");
    }
  };

  const healthPlans = [...new Set(patients.map((p) => p.health_plan).filter(Boolean))].sort();

  const SPECIALTIES = [
    { value: "ABA", label: "ABA" },
    { value: "TERAPIA_ADULTO", label: "Terapia Adulto" },
    { value: "AVALIACAO_NEUROPSICOLOGICA", label: "Avaliação Neuropsicológica" },
  ];

  const filteredPatients = patients.filter((patient) => {
    const matchesName = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = !filterHealthPlan || patient.health_plan === filterHealthPlan;
    const matchesSpecialty = !filterSpecialty || (patient.patient_type || "").includes(filterSpecialty);
    return matchesName && matchesPlan && matchesSpecialty;
  });

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  if (loading) return <Loading />;

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Pacientes</h1>
          <Button
            variant="primary"
            onClick={() => navigate("/patients/new")}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Paciente
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

        <Card>
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar por nome
              </label>
              <input
                type="text"
                placeholder="Digite o nome do paciente..."
                value={searchTerm}
                onChange={(e) => handleFilterChange(setSearchTerm)(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plano de Saúde
              </label>
              <select
                value={filterHealthPlan}
                onChange={(e) => handleFilterChange(setFilterHealthPlan)(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {healthPlans.map((plan) => (
                  <option key={plan} value={plan}>{plan}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidade
              </label>
              <select
                value={filterSpecialty}
                onChange={(e) => handleFilterChange(setFilterSpecialty)(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                {SPECIALTIES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          {(searchTerm || filterHealthPlan || filterSpecialty) && (
            <p className="text-sm text-gray-500 mb-4">
              {filteredPatients.length} paciente(s) encontrado(s)
            </p>
          )}

          {filteredPatients.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              {searchTerm
                ? "Nenhum paciente encontrado com esse nome"
                : "Nenhum paciente cadastrado"}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 font-semibold text-gray-700">
                        Nome
                      </th>
                      <th className="text-left p-4 font-semibold text-gray-700">
                        Plano
                      </th>
                      <th className="text-left p-4 font-semibold text-gray-700">
                        Idade
                      </th>
                      <th className="text-left p-4 font-semibold text-gray-700">
                        Especialidades
                      </th>
                      <th className="text-right p-4 font-semibold text-gray-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPatients.map((patient) => (
                      <tr
                        key={patient.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="p-4 text-gray-800">{patient.name}</td>
                        <td className="p-4 text-gray-600">
                          {patient.health_plan}
                        </td>
                        <td className="p-4 text-gray-600">
                          {getPatientAge(patient.birth_date)} anos
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap gap-1">
                              {(patient.patient_type || "")
                                .split(",")
                                .filter(Boolean)
                                .map((type) => {
                                  const labels = {
                                    ABA: "ABA",
                                    TERAPIA_ADULTO: "Terapia Adulto",
                                    AVALIACAO_NEUROPSICOLOGICA: "Avaliação Neuro",
                                  };
                                  const colors = {
                                    ABA: "bg-blue-100 text-blue-800",
                                    TERAPIA_ADULTO: "bg-purple-100 text-purple-800",
                                    AVALIACAO_NEUROPSICOLOGICA: "bg-green-100 text-green-800",
                                  };
                                  return (
                                    <span
                                      key={type}
                                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[type] || "bg-gray-100 text-gray-800"}`}
                                    >
                                      {labels[type] || type}
                                    </span>
                                  );
                                })}
                            </div>
                            {patient.specialties && (
                              <div className="flex flex-wrap gap-1">
                                {patient.specialties
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                                  .map((s) => {
                                    const colors = {
                                      Psicologia: "bg-green-50 text-green-700",
                                      Fonoaudiologia: "bg-sky-50 text-sky-700",
                                      "Terapia Ocupacional": "bg-orange-50 text-orange-700",
                                      Psicopedagogia: "bg-violet-50 text-violet-700",
                                    };
                                    return (
                                      <span
                                        key={s}
                                        className={`inline-block rounded-full px-2 py-0.5 text-xs ${colors[s] || "bg-gray-50 text-gray-600"}`}
                                      >
                                        {s}
                                      </span>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/patients/${patient.id}`)}
                          >
                            <Eye size={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/patients/${patient.id}/edit`)
                            }
                          >
                            <Edit2 size={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Controles de Paginação */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Mostrando {startIndex + 1} a{" "}
                    {Math.min(endIndex, filteredPatients.length)} de{" "}
                    {filteredPatients.length} pacientes
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      ← Anterior
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-1 rounded-lg transition ${
                            currentPage === i + 1
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Próxima →
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        <Modal
          isOpen={deleteModalOpen}
          title="Deletar Paciente"
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          confirmText="Deletar"
        >
          <p className="text-gray-600">
            Tem certeza que deseja deletar o paciente{" "}
            <strong>{selectedPatient?.name}</strong>?
          </p>
        </Modal>
      </div>
    </Layout>
  );
}
