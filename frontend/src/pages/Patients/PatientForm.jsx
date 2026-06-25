import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Alert from "../../components/Common/Alert";
import Loading from "../../components/Common/Loading";
import { patientService } from "../../services/patientService";
import { employeeService } from "../../services/employeeService";
import { guideEmissionService } from "../../services/guideEmissionService";

const HEALTH_PLANS = [
  "CAIXA SAUDE",
  "GEAP SAUDE",
  "IAMESC",
  "IPASGO",
  "CASEMBRAPA",
  "CASSI",
  "PARTICULAR",
];

const CLINICAL_SPECIALTIES = [
  { value: "Psicologia", label: "Psicologia" },
  { value: "Fonoaudiologia", label: "Fonoaudiologia" },
  { value: "Psicopedagogia", label: "Psicopedagogia" },
  { value: "Terapia Ocupacional", label: "Terapia Ocupacional" },
  { value: "Psicomotricidade", label: "Psicomotricidade" },
  { value: "Fisioterapia", label: "Fisioterapia" },
];

// Mapeamento: especialidade clínica do paciente → especialidade do funcionário
const SPECIALTY_TO_EMPLOYEE_SPECIALTY = {
  "Psicologia": "PSICOLOGA",
  "Fonoaudiologia": "FONOAUDIOLOGA",
  "Psicopedagogia": "PSICOPEDAGOGA",
  "Terapia Ocupacional": "TERAPEUTA OCUPACIONAL",
  "Psicomotricidade": "TERAPEUTA OCUPACIONAL",
  "Fisioterapia": "TERAPEUTA OCUPACIONAL",
};

// Segunda a Sábado (0=Dom omitido)
const WEEK_DAYS = [
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

export default function PatientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    patient_type: [],
    specialties: [],
    specialty_professionals: {},
    health_plan: "",
    birth_date: "",
  });
  // schedules: { [specialty]: { [day]: number } } ex: { Psicologia: { 1: 1, 3: 2 } }
  const [schedules, setSchedules] = useState({});

  useEffect(() => {
    loadEmployees();
    if (id) {
      loadPatient();
    }
  }, [id]);

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getNames();
      setEmployees(Array.isArray(data) ? data : []);
    } catch {
      // silently ignore — dropdown ficará vazio
    }
  };

  const loadPatient = async () => {
    try {
      const [data, existingSchedules] = await Promise.all([
        patientService.getById(id),
        guideEmissionService.getPatientSchedules(id),
      ]);

      let parsedProfessionals = {};
      try {
        parsedProfessionals = data.specialty_professionals
          ? JSON.parse(data.specialty_professionals)
          : {};
      } catch {
        parsedProfessionals = {};
      }

      setFormData({
        name: data.name,
        patient_type: data.patient_type ? data.patient_type.split(",") : [],
        specialties: data.specialties
          ? data.specialties.split(",").filter(Boolean)
          : [],
        specialty_professionals: parsedProfessionals,
        health_plan: data.health_plan,
        birth_date: new Date(data.birth_date).toISOString().split("T")[0],
      });

      const schedulesMap = {};
      for (const s of existingSchedules) {
        if (!s.days) { schedulesMap[s.specialty] = {}; continue; }
        const entries = s.days.split(",").filter(Boolean);
        schedulesMap[s.specialty] = {};
        for (const entry of entries) {
          const [d, q] = entry.split(":").map(Number);
          if (!isNaN(d) && d > 0) {
            // qty representa sessões físicas por ocorrência; o ×2 para 1x/semana é regra do cálculo de guias
            schedulesMap[s.specialty][d] = isNaN(q) ? 1 : q;
          }
        }
      }
      setSchedules(schedulesMap);
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
        const updatedProfessionals = { ...prev.specialty_professionals };
        if (value === "AVALIACAO_NEUROPSICOLOGICA") {
          delete updatedProfessionals["Neuropsicologia"];
        }
        if (value === "TERAPIA_ADULTO") {
          delete updatedProfessionals["TerapiaAdulto"];
        }
        if (value === "ABA") {
          for (const cs of CLINICAL_SPECIALTIES) {
            delete updatedProfessionals[cs.value];
          }
        }
        return { ...prev, patient_type: current.filter((v) => v !== value), specialty_professionals: updatedProfessionals };
      }
      if (value === "ABA") {
        const updatedProfessionals = { ...prev.specialty_professionals };
        delete updatedProfessionals["TerapiaAdulto"];
        return {
          ...prev,
          patient_type: [...current.filter((v) => v !== "TERAPIA_ADULTO"), value],
          specialty_professionals: updatedProfessionals,
        };
      }
      if (value === "TERAPIA_ADULTO") {
        const updatedProfessionals = { ...prev.specialty_professionals };
        for (const cs of CLINICAL_SPECIALTIES) {
          delete updatedProfessionals[cs.value];
        }
        return {
          ...prev,
          patient_type: [...current.filter((v) => v !== "ABA"), value],
          specialty_professionals: updatedProfessionals,
        };
      }
      return { ...prev, patient_type: [...current, value] };
    });
  };

  const handleSpecialtyChange = (value) => {
    setFormData((prev) => {
      const has = prev.specialties.includes(value);
      const updatedSpecialties = has
        ? prev.specialties.filter((v) => v !== value)
        : [...prev.specialties, value];

      const updatedProfessionals = { ...prev.specialty_professionals };
      if (has) {
        delete updatedProfessionals[value];
      }

      return {
        ...prev,
        specialties: updatedSpecialties,
        specialty_professionals: updatedProfessionals,
      };
    });
  };

  const handleProfessionalChange = (specialty, employeeId) => {
    setFormData((prev) => {
      const updated = { ...prev.specialty_professionals };
      if (employeeId) {
        updated[specialty] = Number(employeeId);
      } else {
        delete updated[specialty];
      }
      return { ...prev, specialty_professionals: updated };
    });
  };

  const getEmployeesForSpecialty = (specialty) => {
    const employeeSpecialty = SPECIALTY_TO_EMPLOYEE_SPECIALTY[specialty];
    if (!employeeSpecialty) return employees;
    return employees.filter((e) => e.specialty === employeeSpecialty);
  };

  const handleScheduleDayToggle = (specialty, dayValue) => {
    setSchedules((prev) => {
      const current = prev[specialty] || {};
      if (current[dayValue]) {
        const updated = { ...current };
        delete updated[dayValue];
        return { ...prev, [specialty]: updated };
      }
      return { ...prev, [specialty]: { ...current, [dayValue]: 1 } };
    });
  };

  const handleScheduleDayQty = (specialty, dayValue, delta) => {
    setSchedules((prev) => {
      const current = prev[specialty] || {};
      const newQty = (current[dayValue] || 0) + delta;
      if (newQty <= 0) {
        const updated = { ...current };
        delete updated[dayValue];
        return { ...prev, [specialty]: updated };
      }
      return { ...prev, [specialty]: { ...current, [dayValue]: newQty } };
    });
  };

  const isCheckboxDisabled = (value) => {
    const current = formData.patient_type;
    if (value === "ABA" && current.includes("TERAPIA_ADULTO")) return true;
    if (value === "TERAPIA_ADULTO" && current.includes("ABA")) return true;
    return false;
  };

  const isABA = formData.patient_type.includes("ABA");
  const abaSpecialties = formData.specialties.filter((s) =>
    CLINICAL_SPECIALTIES.some((cs) => cs.value === s)
  );
  const showScheduleSection = isABA && abaSpecialties.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        patient_type: formData.patient_type.join(","),
        specialties: formData.specialties.join(","),
        specialty_professionals: JSON.stringify(formData.specialty_professionals),
      };

      let patientId = id;
      if (id) {
        await patientService.update(id, payload);
      } else {
        const created = await patientService.create(payload);
        patientId = created.id;
      }

      // Salvar agenda para especialidades ABA
      if (isABA && abaSpecialties.length > 0 && patientId) {
        const schedulesToSave = abaSpecialties.map((specialty) => ({
          specialty,
          days: Object.entries(schedules[specialty] || {})
            .filter(([, qty]) => qty > 0)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([day, qty]) => `${day}:${qty}`)
            .join(","),
        }));
        await guideEmissionService.upsertPatientSchedules(
          patientId,
          schedulesToSave
        );
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

            {formData.patient_type.includes("TERAPIA_ADULTO") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Psicóloga Responsável
                </label>
                <select
                  value={formData.specialty_professionals["TerapiaAdulto"] || ""}
                  onChange={(e) => handleProfessionalChange("TerapiaAdulto", e.target.value)}
                  className="input-field max-w-xs"
                >
                  <option value="">-- Selecione a profissional --</option>
                  {employees
                    .filter((e) => e.specialty === "PSICOLOGA")
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {formData.patient_type.includes("AVALIACAO_NEUROPSICOLOGICA") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Neuropsicologa Responsável
                </label>
                <select
                  value={formData.specialty_professionals["Neuropsicologia"] || ""}
                  onChange={(e) => handleProfessionalChange("Neuropsicologia", e.target.value)}
                  className="input-field max-w-xs"
                >
                  <option value="">-- Selecione a profissional --</option>
                  {employees
                    .filter((e) => e.specialty === "NEUROPSICOLOGA")
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {isABA && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidades Clínicas
                </label>
                <div className="space-y-3">
                  {CLINICAL_SPECIALTIES.map((option) => {
                    const isChecked = formData.specialties.includes(option.value);
                    const availableEmployees = getEmployeesForSpecialty(option.value);
                    return (
                      <div key={option.value} className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-2 text-gray-700 min-w-[160px]">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSpecialtyChange(option.value)}
                          />
                          {option.label}
                        </label>
                        {isChecked && (
                          <select
                            value={formData.specialty_professionals[option.value] || ""}
                            onChange={(e) => handleProfessionalChange(option.value, e.target.value)}
                            className="input-field max-w-xs"
                          >
                            <option value="">-- Selecione o profissional --</option>
                            {availableEmployees.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {showScheduleSection && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agenda por Especialidade
                </label>
                <p className="text-xs text-gray-400 mb-4">
                  Selecione os dias e quantas sessões o paciente realiza por dia. Paciente 1x/semana → cálculo de guia aplica ×2 automaticamente.
                </p>
                <div className="space-y-4">
                  {abaSpecialties.map((specialty) => (
                    <div key={specialty}>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        {specialty}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {WEEK_DAYS.map((day) => {
                          const qty = (schedules[specialty] || {})[day.value] || 0;
                          const selected = qty > 0;
                          return (
                            <div key={day.value} className="flex flex-col items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleScheduleDayToggle(specialty, day.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                  selected
                                    ? "bg-primary-600 text-white"
                                    : "bg-white border border-gray-300 text-gray-600 hover:border-primary-400"
                                }`}
                              >
                                {day.label}
                              </button>
                              {selected && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleScheduleDayQty(specialty, day.value, -1)}
                                    className="w-5 h-5 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-xs font-bold leading-none"
                                  >
                                    −
                                  </button>
                                  <span className="text-xs font-semibold w-5 text-center text-gray-700">
                                    {qty}×
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleScheduleDayQty(specialty, day.value, 1)}
                                    className="w-5 h-5 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-xs font-bold leading-none"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
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
