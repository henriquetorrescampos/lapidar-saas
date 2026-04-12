import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2 } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Loading from "../../components/Common/Loading";
import Alert from "../../components/Common/Alert";
import { patientService } from "../../services/patientService";

export default function PatientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    try {
      const data = await patientService.getById(id);
      setPatient(data);
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
                {(patient.patient_type || "").split(",").map((type) => {
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
          </div>
        </Card>
      </div>
    </Layout>
  );
}
