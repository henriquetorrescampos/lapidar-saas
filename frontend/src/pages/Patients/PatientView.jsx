import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2 } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Loading from "../../components/Common/Loading";
import Alert from "../../components/Common/Alert";
import { patientService } from "../../services/patientService";
import { guideEmissionService } from "../../services/guideEmissionService";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEK_DAYS = [1, 2, 3, 4, 5, 6];

const SPECIALTY_COLORS = {
  Psicologia: "bg-green-100 text-green-700",
  Fonoaudiologia: "bg-sky-100 text-sky-700",
  "Terapia Ocupacional": "bg-orange-100 text-orange-700",
  Psicopedagogia: "bg-violet-100 text-violet-700",
  Psicomotricidade: "bg-pink-100 text-pink-700",
  Fisioterapia: "bg-teal-100 text-teal-700",
};

const SPECIALTY_DAY_ACTIVE = {
  Psicologia: "bg-green-500 text-white",
  Fonoaudiologia: "bg-sky-500 text-white",
  "Terapia Ocupacional": "bg-orange-500 text-white",
  Psicopedagogia: "bg-violet-500 text-white",
  Psicomotricidade: "bg-pink-500 text-white",
  Fisioterapia: "bg-teal-500 text-white",
};

export default function PatientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    try {
      const [data, schedulesData] = await Promise.all([
        patientService.getById(id),
        guideEmissionService.getPatientSchedules(id),
      ]);
      setPatient(data);
      setSchedules(schedulesData);
    } catch (err) {
      setError("Erro ao carregar paciente");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (!patient)
    return (
      <Layout>
        <Alert type="error" message="Paciente não encontrado" />
      </Layout>
    );

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/patients")}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">{patient.name}</h1>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate(`/patients/${patient.id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit2 size={20} />
            Editar
          </Button>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Nome
              </label>
              <p className="text-lg text-gray-900">{patient.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Plano de Saúde
              </label>
              <p className="text-lg text-gray-900">{patient.health_plan}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Data de Nascimento
              </label>
              <p className="text-lg text-gray-900">
                {new Date(patient.birth_date).toLocaleDateString("pt-BR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Idade
              </label>
              <p className="text-lg text-gray-900">
                {Math.floor(
                  (new Date() - new Date(patient.birth_date)) /
                    (365.25 * 24 * 60 * 60 * 1000),
                )}{" "}
                anos
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Especialidades
              </label>
              <div className="flex flex-wrap gap-2">
                {(patient.patient_type || "").split(",").filter(Boolean).map((type) => {
                  const labels = {
                    ABA: "ABA",
                    TERAPIA_ADULTO: "Terapia Adulto",
                    AVALIACAO_NEUROPSICOLOGICA: "Avaliação Neuropsicológica",
                  };
                  return (
                    <span
                      key={type}
                      className="inline-block rounded-full bg-primary-100 px-3 py-1 text-lg font-medium text-primary-800"
                    >
                      {labels[type] || type}
                    </span>
                  );
                })}
              </div>
            </div>

            {schedules.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-3">
                  Agenda por Especialidade
                </label>
                <div className="flex flex-col gap-3">
                  {schedules.map((s) => {
                    const activeDays = (s.days || "").split(",").map(Number).filter((d) => !isNaN(d));
                    return (
                      <div key={s.specialty} className="flex items-center gap-3 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${SPECIALTY_COLORS[s.specialty] || "bg-gray-100 text-gray-600"}`}>
                          {s.specialty}
                        </span>
                        <div className="flex gap-1">
                          {WEEK_DAYS.map((d) => (
                            <span
                              key={d}
                              className={`text-xs px-2 py-1 rounded-md font-semibold transition-colors ${
                                activeDays.includes(d)
                                  ? SPECIALTY_DAY_ACTIVE[s.specialty] || "bg-primary-600 text-white"
                                  : "text-gray-300"
                              }`}
                            >
                              {DAY_LABELS[d]}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
