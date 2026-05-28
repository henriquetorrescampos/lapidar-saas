import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Alert from "../../components/Common/Alert";
import Loading from "../../components/Common/Loading";
import { employeeService } from "../../services/employeeService";

const SPECIALTIES = [
  "RECEPCIONISTA",
  "FONOAUDIOLOGA",
  "PSICOLOGA",
  "NEUROPSICOLOGA",
  "TERAPEUTA OCUPACIONAL",
  "FISIOTERAPEUTA",
  "NUTRICIONISTA",
  "PSICOPEDAGOGA",
  "ESTAGIÁRIA",
  "AUXILIAR DE SERVIÇOS GERAIS",
];

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parseCurrencyInputToNumber(value) {
  const digitsOnly = String(value || "").replace(/\D/g, "");
  if (!digitsOnly) return 0;
  return Number(digitsOnly) / 100;
}

function formatCurrencyInput(value) {
  const digitsOnly = String(value || "").replace(/\D/g, "");
  if (!digitsOnly) return "";
  return formatCurrency(Number(digitsOnly) / 100);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    salary: "",
    absences: "0",
    full_days_per_week: "0",
    full_day_hours: "10",
    partial_days_per_week: "0",
    partial_day_hours: "4",
  });

  useEffect(() => {
    if (id) {
      loadEmployee();
    }
  }, [id]);

  const loadEmployee = async () => {
    try {
      const data = await employeeService.getById(id);
      setFormData({
        name: String(data.name || "").toUpperCase(),
        specialty: data.specialty,
        salary: formatCurrency(data.salary),
        absences: String(data.absences ?? 0),
        full_days_per_week: String(data.full_days_per_week ?? 0),
        full_day_hours: String(data.full_day_hours ?? 10),
        partial_days_per_week: String(data.partial_days_per_week ?? 0),
        partial_day_hours: String(data.partial_day_hours ?? 4),
      });
    } catch (err) {
      setError(err.message || "Erro ao carregar funcionário");
    } finally {
      setLoading(false);
    }
  };

  const payrollPreview = useMemo(() => {
    const salary = parseCurrencyInputToNumber(formData.salary);
    const absences = parseNumber(formData.absences);
    const fullDaysPerWeek = parseNumber(formData.full_days_per_week);
    const fullDayHours = parseNumber(formData.full_day_hours);
    const partialDaysPerWeek = parseNumber(formData.partial_days_per_week);
    const partialDayHours = parseNumber(formData.partial_day_hours);

    const weeklyHours = fullDaysPerWeek * fullDayHours + partialDaysPerWeek * partialDayHours;
    const monthlyHours = weeklyHours * 4.33;
    const hourly = monthlyHours > 0 ? salary / monthlyHours : 0;
    const fullDay = hourly * fullDayHours;
    const partialDay = hourly * partialDayHours;
    const updated = salary - absences * fullDay;

    return { salary, hourly, fullDay, partialDay, updated, weeklyHours, monthlyHours, fullDayHours, partialDayHours };
  }, [
    formData.salary,
    formData.absences,
    formData.full_days_per_week,
    formData.full_day_hours,
    formData.partial_days_per_week,
    formData.partial_day_hours,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "absences") {
      const digits = value.replace(/\D/g, "");
      const normalized = digits === "" ? "" : String(parseInt(digits, 10));
      setFormData((prev) => ({ ...prev, absences: normalized }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "name"
          ? value.toUpperCase()
          : name === "salary"
            ? formatCurrencyInput(value)
            : value,
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "absences" && value === "") {
      setFormData((prev) => ({ ...prev, absences: "0" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        specialty: formData.specialty,
        salary: parseCurrencyInputToNumber(formData.salary),
        absences: parseInt(formData.absences || "0", 10),
        full_days_per_week: parseInt(formData.full_days_per_week || "0", 10),
        full_day_hours: parseNumber(formData.full_day_hours),
        partial_days_per_week: parseInt(formData.partial_days_per_week || "0", 10),
        partial_day_hours: parseNumber(formData.partial_day_hours),
      };

      if (id) {
        await employeeService.update(id, payload);
      } else {
        await employeeService.create(payload);
      }

      navigate("/employees");
    } catch (err) {
      setError(err.message || "Erro ao salvar funcionário");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Layout>
      <div>
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/employees")}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">
            {id ? "Editar Funcionário" : "Novo Funcionário"}
          </h1>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field uppercase"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Especialidade
              </label>
              <select
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">SELECIONE A ESPECIALIDADE</option>
                {SPECIALTIES.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Salário Mensal (R$)
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="R$ 5.000,00"
                  inputMode="numeric"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Quantidade de Faltas
                </label>
                <input
                  type="text"
                  name="absences"
                  value={formData.absences}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="input-field"
                  inputMode="numeric"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
                Carga Horária Semanal
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Dias Completos/semana
                  </label>
                  <input
                    type="number"
                    name="full_days_per_week"
                    value={formData.full_days_per_week}
                    onChange={handleChange}
                    className="input-field"
                    min="0"
                    max="7"
                    step="1"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Horas líquidas/dia completo
                  </label>
                  <input
                    type="number"
                    name="full_day_hours"
                    value={formData.full_day_hours}
                    onChange={handleChange}
                    className="input-field"
                    min="0"
                    max="24"
                    step="any"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Dias Parciais/semana
                  </label>
                  <input
                    type="number"
                    name="partial_days_per_week"
                    value={formData.partial_days_per_week}
                    onChange={handleChange}
                    className="input-field"
                    min="0"
                    max="7"
                    step="1"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Horas/dia parcial
                  </label>
                  <input
                    type="number"
                    name="partial_day_hours"
                    value={formData.partial_day_hours}
                    onChange={handleChange}
                    className="input-field"
                    min="0"
                    max="24"
                    step="any"
                    placeholder="4"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tabela de Referência
              </p>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 text-gray-500">Horas semanais</td>
                    <td className="py-2 text-right font-medium text-gray-700">
                      {payrollPreview.weeklyHours.toFixed(1)}h
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">Horas mensais (× 4,33)</td>
                    <td className="py-2 text-right font-medium text-gray-700">
                      {payrollPreview.monthlyHours.toFixed(2)}h
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">Mensal</td>
                    <td className="py-2 text-right font-semibold text-gray-800">
                      {formatCurrency(payrollPreview.salary)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">Hora de trabalho</td>
                    <td className="py-2 text-right font-semibold text-gray-800">
                      {formatCurrency(payrollPreview.hourly)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-500">
                      Dia Inteiro ({payrollPreview.fullDayHours}h)
                    </td>
                    <td className="py-2 text-right font-semibold text-gray-800">
                      {formatCurrency(payrollPreview.fullDay)}
                    </td>
                  </tr>
                  {parseNumber(formData.partial_days_per_week) > 0 && (
                    <tr>
                      <td className="py-2 text-gray-500">
                        Dia Parcial ({payrollPreview.partialDayHours}h)
                      </td>
                      <td className="py-2 text-right font-semibold text-gray-800">
                        {formatCurrency(payrollPreview.partialDay)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-300">
                    <td className="pt-3 font-semibold text-gray-700">
                      Valor Atualizado
                      {parseNumber(formData.absences) > 0 &&
                        ` (${formData.absences} falta${parseNumber(formData.absences) > 1 ? "s" : ""})`}
                    </td>
                    <td className="pt-3 text-right text-base font-bold text-primary-700">
                      {formatCurrency(payrollPreview.updated)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate("/employees")}
              >
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
