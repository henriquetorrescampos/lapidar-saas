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
    const daily = salary / 30;
    const updated = salary - daily * absences;

    return {
      daily,
      updated,
    };
  }, [formData.salary, formData.absences]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const absencesDigits = value.replace(/\D/g, "");
    const normalizedAbsences =
      absencesDigits === "" ? "" : String(parseInt(absencesDigits, 10));

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "name"
          ? value.toUpperCase()
          : name === "salary"
            ? formatCurrencyInput(value)
            : name === "absences"
              ? normalizedAbsences
              : value,
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === "absences" && value === "") {
      setFormData((prev) => ({
        ...prev,
        absences: "0",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        salary: parseCurrencyInputToNumber(formData.salary),
        absences: parseInt(formData.absences || "0", 10),
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
                  Salário (R$)
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="R$ 1.000,00"
                  inputMode="numeric"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Quantidade de Falta
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

            <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Valor do Dia</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatCurrency(payrollPreview.daily)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Valor Atualizado</p>
                <p className="text-lg font-semibold text-gray-800">
                  {formatCurrency(payrollPreview.updated)}
                </p>
              </div>
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
