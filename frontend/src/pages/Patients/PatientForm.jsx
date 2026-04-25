import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Alert from "../../components/Common/Alert";
import Loading from "../../components/Common/Loading";
import { patientService } from "../../services/patientService";

const HEALTH_PLANS = [
  "CAIXA SAUDE",
  "GEAP SAUDE",
  "IAMESC",
  "IPASGO",
  "CASEMBRAPA",
  "CASSI",
  "PARTICULAR",
];

export default function PatientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    patient_type: [],
    specialties: [],
    health_plan: "",
    birth_date: "",
  });

  const CLINICAL_SPECIALTIES = [
    { value: "Psicologia", label: "Psicologia" },
    { value: "Fonoaudiologia", label: "Fonoaudiologia" },
    { value: "Psicopedagogia", label: "Psicopedagogia" },
    { value: "Terapia Ocupacional", label: "Terapia Ocupacional" },
  ];

  useEffect(() => {
    if (id) {
      loadPatient();
    }
  }, [id]);

  const loadPatient = async () => {
    try {
      const data = await patientService.getById(id);
      setFormData({
        name: data.name,
        patient_type: data.patient_type ? data.patient_type.split(",") : [],
        specialties: data.specialties ? data.specialties.split(",").filter(Boolean) : [],
        health_plan: data.health_plan,
        birth_date: new Date(data.birth_date).toISOString().split("T")[0],
      });
    } catch (err) {
      setError("Erro ao carregar paciente");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "name" ? value.toUpperCase() : value,
    }));
  };

  const handleCheckboxChange = (value) => {
    setFormData((prev) => {
      const current = prev.patient_type;
      const has = current.includes(value);

      if (has) {
        return { ...prev, patient_type: current.filter((v) => v !== value) };
      }

      // Se estamos adicionando ABA, remover TERAPIA_ADULTO
      if (value === "ABA") {
        return {
          ...prev,
          patient_type: [
            ...current.filter((v) => v !== "TERAPIA_ADULTO"),
            value,
          ],
        };
      }
      // Se estamos adicionando TERAPIA_ADULTO, remover ABA
      if (value === "TERAPIA_ADULTO") {
        return {
          ...prev,
          patient_type: [...current.filter((v) => v !== "ABA"), value],
        };
      }

      return { ...prev, patient_type: [...current, value] };
    });
  };

  const handleSpecialtyChange = (value) => {
    setFormData((prev) => {
      const has = prev.specialties.includes(value);
      return {
        ...prev,
        specialties: has
          ? prev.specialties.filter((v) => v !== value)
          : [...prev.specialties, value],
      };
    });
  };

  const isCheckboxDisabled = (value) => {
    const current = formData.patient_type;
    if (value === "ABA" && current.includes("TERAPIA_ADULTO")) return true;
    if (value === "TERAPIA_ADULTO" && current.includes("ABA")) return true;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        patient_type: formData.patient_type.join(","),
        specialties: formData.specialties.join(","),
      };

      if (id) {
        await patientService.update(id, payload);
      } else {
        await patientService.create(payload);
      }
      navigate("/patients");
    } catch (err) {
      setError(err.message || "Erro ao salvar paciente");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Layout>
      <div>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/patients")}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">
            {id ? "Editar Paciente" : "Novo Paciente"}
          </h1>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Paciente
              </label>
              <div className="flex flex-wrap gap-6">
                {[
                  { value: "ABA", label: "ABA" },
                  { value: "TERAPIA_ADULTO", label: "Terapia Adulto" },
                  {
                    value: "AVALIACAO_NEUROPSICOLOGICA",
                    label: "Avaliação Neuropsicológica",
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-2 ${
                      isCheckboxDisabled(option.value)
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.patient_type.includes(option.value)}
                      onChange={() => handleCheckboxChange(option.value)}
                      disabled={isCheckboxDisabled(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {formData.patient_type.some((t) => t === "ABA" || t === "TERAPIA_ADULTO") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidades Clínicas
                </label>
                <div className="flex flex-wrap gap-6">
                  {CLINICAL_SPECIALTIES.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-gray-700">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(option.value)}
                        onChange={() => handleSpecialtyChange(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plano de Saúde
              </label>
              <select
                name="health_plan"
                value={formData.health_plan}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">-- Selecione um plano --</option>
                {HEALTH_PLANS.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento
              </label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate("/patients")}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
