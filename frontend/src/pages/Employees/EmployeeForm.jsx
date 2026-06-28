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

// "10:20" → 10.333...
function timeToDecimal(time) {
  const [h, m] = String(time || "0:0").split(":").map(Number);
  return (isNaN(h) ? 0 : h) + (isNaN(m) ? 0 : m / 60);
}

// 10.333 → "10:20"
function decimalToTime(decimal) {
  const num = Number(decimal) || 0;
  const h = Math.floor(num);
  const m = Math.round((num - h) * 60);
  return `${h}:${String(m).padStart(2, "0")}`;
}

function TimeInput({ value, onChange }) {
  const parts = String(value || "0:00").split(":");
  const h = parts[0] ?? "0";
  const m = parts[1] ?? "00";

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min="0"
        max="23"
        value={h}
        onChange={(e) => onChange(`${e.target.value}:${m}`)}
        className="input-field w-20 text-center"
        placeholder="0"
      />
      <span className="text-gray-500 font-medium">h</span>
      <input
        type="number"
        min="0"
        max="59"
        value={parseInt(m, 10)}
        onChange={(e) => onChange(`${h}:${String(e.target.value).padStart(2, "0")}`)}
        className="input-field w-20 text-center"
        placeholder="00"
      />
      <span className="text-gray-500 font-medium">min</span>
    </div>
  );
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
    full_days_per_week: "0",
    full_day_time: "10:00",
    full_day_absences: "0",
    partial_days_per_week: "0",
    partial_day_time: "4:00",
    partial_day_absences: "0",
    deducted_time: "0:00",
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
        full_days_per_week: String(data.full_days_per_week ?? 0),
        full_day_time: decimalToTime(data.full_day_hours ?? 10),
        full_day_absences: String(data.full_day_absences ?? 0),
        partial_days_per_week: String(data.partial_days_per_week ?? 0),
        partial_day_time: decimalToTime(data.partial_day_hours ?? 4),
        partial_day_absences: String(data.partial_day_absences ?? 0),
        deducted_time: decimalToTime(data.deducted_hours ?? 0),
      });
    } catch (err) {
      setError(err.message || "Erro ao carregar funcionário");
    } finally {
      setLoading(false);
    }
  };

  const payrollPreview = useMemo(() => {
    const salary = parseCurrencyInputToNumber(formData.salary);
    const fullDaysPerWeek = parseNumber(formData.full_days_per_week);
    const fullDayHours = timeToDecimal(formData.full_day_time);
    const fullDayAbsences = parseNumber(formData.full_day_absences);
    const partialDaysPerWeek = parseNumber(formData.partial_days_per_week);
    const partialDayHours = timeToDecimal(formData.partial_day_time);
    const partialDayAbsences = parseNumber(formData.partial_day_absences);
    const deductedHours = timeToDecimal(formData.deducted_time);

    const weeklyHours = fullDaysPerWeek * fullDayHours + partialDaysPerWeek * partialDayHours;
    const monthlyHours = weeklyHours * 4.33;
    const hourly = monthlyHours > 0 ? salary / monthlyHours : 0;
    const fullDay = hourly * fullDayHours;
    const partialDay = hourly * partialDayHours;
    const updated = salary - fullDayAbsences * fullDay - partialDayAbsences * partialDay - deductedHours * hourly;

    return { salary, hourly, fullDay, partialDay, updated, weeklyHours, monthlyHours, fullDayHours, partialDayHours, fullDayAbsences, partialDayAbsences, deductedHours };
  }, [
    formData.salary,
    formData.full_days_per_week,
    formData.full_day_time,
    formData.full_day_absences,
    formData.partial_days_per_week,
    formData.partial_day_time,
    formData.partial_day_absences,
    formData.deducted_time,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "full_day_absences" || name === "partial_day_absences") {
      const digits = value.replace(/\D/g, "");
      const normalized = digits === "" ? "" : String(parseInt(digits, 10));
      setFormData((prev) => ({ ...prev, [name]: normalized }));
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
    if ((name === "full_day_absences" || name === "partial_day_absences") && value === "") {
      setFormData((prev) => ({ ...prev, [name]: "0" }));
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
        full_days_per_week: parseInt(formData.full_days_per_week || "0", 10),
        full_day_hours: timeToDecimal(formData.full_day_time),
        full_day_absences: parseInt(formData.full_day_absences || "0", 10),
        partial_days_per_week: parseInt(formData.partial_days_per_week || "0", 10),
        partial_day_hours: timeToDecimal(formData.partial_day_time),
        partial_day_absences: parseInt(formData.partial_day_absences || "0", 10),
        deducted_hours: timeToDecimal(formData.deducted_time),
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
                  <TimeInput
                    value={formData.full_day_time}
                    onChange={(val) => setFormData((prev) => ({ ...prev, full_day_time: val }))}
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
                  <TimeInput
                    value={formData.partial_day_time}
                    onChange={(val) => setFormData((prev) => ({ ...prev, partial_day_time: val }))}
                  />
                </div>
                {parseNumber(formData.full_days_per_week) > 0 && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Faltas em Dias Completos
                    </label>
                    <input
                      type="text"
                      name="full_day_absences"
                      value={formData.full_day_absences}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="input-field"
                      inputMode="numeric"
                      placeholder="0"
                    />
                  </div>
                )}
                {parseNumber(formData.partial_days_per_week) > 0 && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Faltas em Dias Parciais
                    </label>
                    <input
                      type="text"
                      name="partial_day_absences"
                      value={formData.partial_day_absences}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="input-field"
                      inputMode="numeric"
                      placeholder="0"
                    />
                  </div>
                )}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Dedução de Horas
                  </label>
                  <TimeInput
                    value={formData.deducted_time}
                    onChange={(val) => setFormData((prev) => ({ ...prev, deducted_time: val }))}
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
                      Dia Inteiro ({formData.full_day_time.replace(":", "h")}min)
                    </td>
                    <td className="py-2 text-right font-semibold text-gray-800">
                      {formatCurrency(payrollPreview.fullDay)}
                    </td>
                  </tr>
                  {parseNumber(formData.partial_days_per_week) > 0 && (
                    <tr>
                      <td className="py-2 text-gray-500">
                        Dia Parcial ({formData.partial_day_time.replace(":", "h")}min)
                      </td>
                      <td className="py-2 text-right font-semibold text-gray-800">
                        {formatCurrency(payrollPreview.partialDay)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-300">
                    <td className="pt-3 font-semibold text-gray-700">
                      Valor Atualizado
                      {(payrollPreview.fullDayAbsences > 0 || payrollPreview.partialDayAbsences > 0 || payrollPreview.deductedHours > 0) && (
                        <span className="ml-1 font-normal text-gray-500">
                          {payrollPreview.fullDayAbsences > 0 && parseNumber(formData.full_days_per_week) > 0 && `${payrollPreview.fullDayAbsences} completa${payrollPreview.fullDayAbsences > 1 ? "s" : ""}`}
                          {payrollPreview.fullDayAbsences > 0 && parseNumber(formData.full_days_per_week) > 0 && (payrollPreview.partialDayAbsences > 0 || payrollPreview.deductedHours > 0) && ", "}
                          {payrollPreview.partialDayAbsences > 0 && parseNumber(formData.partial_days_per_week) > 0 && `${payrollPreview.partialDayAbsences} parcial${payrollPreview.partialDayAbsences > 1 ? "is" : ""}`}
                          {payrollPreview.partialDayAbsences > 0 && parseNumber(formData.partial_days_per_week) > 0 && payrollPreview.deductedHours > 0 && ", "}
                          {payrollPreview.deductedHours > 0 && `${formData.deducted_time.replace(":", "h")}min deduzida${payrollPreview.deductedHours !== 1 ? "s" : ""}`}
                        </span>
                      )}
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
