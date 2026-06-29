import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Alert from "../../components/Common/Alert";
import Loading from "../../components/Common/Loading";
import { waitingListService } from "../../services/waitingListService";
import { employeeService } from "../../services/employeeService";

const DAYS_OF_WEEK = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const ALL_SPECIALTIES = [
  { value: "Psicologia", label: "Psicologia", employeeSpecialty: "PSICOLOGA" },
  { value: "Fonoaudiologia", label: "Fonoaudiologia", employeeSpecialty: "FONOAUDIOLOGA" },
  { value: "Psicopedagogia", label: "Psicopedagogia", employeeSpecialty: "PSICOPEDAGOGA" },
  { value: "Terapia Ocupacional", label: "Terapia Ocupacional", employeeSpecialty: "TERAPEUTA OCUPACIONAL" },
  { value: "Psicomotricidade", label: "Psicomotricidade", employeeSpecialty: "TERAPEUTA OCUPACIONAL" },
  { value: "Fisioterapia", label: "Fisioterapia", employeeSpecialty: "TERAPEUTA OCUPACIONAL" },
  { value: "Terapia Adulto", label: "Terapia Adulto", employeeSpecialty: "PSICOLOGA" },
  { value: "Avaliação Neuropsicológica", label: "Avaliação Neuropsicológica", employeeSpecialty: "NEUROPSICOLOGA" },
];

const EMPTY_FORM = {
  name: "",
  phone: "",
  specialty: "",
  professional_id: "",
  day_of_week: "",
  desired_time: "",
  notes: "",
};

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function WaitingListPage() {
  const [list, setList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    Promise.all([loadList(), loadEmployees()]).finally(() => setLoading(false));
  }, []);

  const loadList = async () => {
    try {
      const data = await waitingListService.getAll();
      setList(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getNames();
      setEmployees(data);
    } catch {
      // silencia: lista de profissionais é opcional
    }
  };

  const getEmployeesForSpecialty = (specialtyValue) => {
    const spec = ALL_SPECIALTIES.find((s) => s.value === specialtyValue);
    if (!spec) return [];
    return employees.filter((e) => e.specialty === spec.employeeSpecialty);
  };

  const getProfessionalName = (professionalId) => {
    if (!professionalId) return null;
    const emp = employees.find((e) => e.id === Number(professionalId));
    return emp ? emp.name : null;
  };

  const openNew = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (entry) => {
    setFormData({
      name: entry.name,
      phone: entry.phone,
      specialty: entry.specialty || "",
      professional_id: entry.professional_id ? String(entry.professional_id) : "",
      day_of_week: entry.day_of_week,
      desired_time: entry.desired_time,
      notes: entry.notes || "",
    });
    setEditingId(entry.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: formatPhone(value) }));
      return;
    }
    if (name === "specialty") {
      // resetar profissional ao trocar especialidade
      setFormData((prev) => ({ ...prev, specialty: value, professional_id: "" }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        professional_id: formData.professional_id ? Number(formData.professional_id) : null,
      };
      if (editingId) {
        const updated = await waitingListService.update(editingId, payload);
        setList((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
      } else {
        const created = await waitingListService.create(payload);
        setList((prev) => [...prev, created]);
      }
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remover este paciente da lista de espera?")) return;
    setDeletingId(id);
    try {
      await waitingListService.delete(id);
      setList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEmployees = getEmployeesForSpecialty(formData.specialty);

  if (loading) return <Loading />;

  return (
    <Layout>
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Lista de Espera</h1>
            <p className="mt-1 text-sm text-gray-500">
              {list.length} {list.length === 1 ? "paciente" : "pacientes"} na fila
            </p>
          </div>
          <Button variant="primary" onClick={openNew}>
            <Plus size={18} className="mr-1" />
            Adicionar
          </Button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError("")} />}

        {list.length === 0 ? (
          <Card>
            <p className="py-12 text-center text-gray-400">
              Nenhum paciente na lista de espera.
            </p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="pb-3 pr-4">#</th>
                    <th className="pb-3 pr-4">Nome</th>
                    <th className="pb-3 pr-4">Celular</th>
                    <th className="pb-3 pr-4">Especialidade</th>
                    <th className="pb-3 pr-4">Profissional</th>
                    <th className="pb-3 pr-4">Dia</th>
                    <th className="pb-3 pr-4">Horário</th>
                    <th className="pb-3 pr-4">Observações</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list.map((entry, index) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="py-3 pr-4 text-gray-400 font-medium">{index + 1}</td>
                      <td className="py-3 pr-4 font-medium text-gray-800">{entry.name}</td>
                      <td className="py-3 pr-4 text-gray-600">{entry.phone}</td>
                      <td className="py-3 pr-4 text-gray-600">{entry.specialty || "—"}</td>
                      <td className="py-3 pr-4 text-gray-600">
                        {getProfessionalName(entry.professional_id) || "—"}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{entry.day_of_week}</td>
                      <td className="py-3 pr-4 text-gray-600">{entry.desired_time}</td>
                      <td className="py-3 pr-4 text-gray-500 max-w-xs truncate">
                        {entry.notes || "—"}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => openEdit(entry)}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-primary-600"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            disabled={deletingId === entry.id}
                            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {editingId ? "Editar Paciente" : "Novo Paciente na Fila"}
                </h2>
                <button onClick={closeModal} className="rounded p-1 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Nome do paciente"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Celular
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="(62) 99999-9999"
                    inputMode="numeric"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Especialidade
                    </label>
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Selecione</option>
                      {ALL_SPECIALTIES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Profissional
                    </label>
                    <select
                      name="professional_id"
                      value={formData.professional_id}
                      onChange={handleChange}
                      className="input-field"
                      disabled={!formData.specialty || filteredEmployees.length === 0}
                    >
                      <option value="">
                        {!formData.specialty
                          ? "Selecione a especialidade"
                          : filteredEmployees.length === 0
                          ? "Nenhum profissional"
                          : "Selecione"}
                      </option>
                      {filteredEmployees.map((emp) => (
                        <option key={emp.id} value={String(emp.id)}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Dia da Semana
                    </label>
                    <select
                      name="day_of_week"
                      value={formData.day_of_week}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="">Selecione</option>
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Horário Desejado
                    </label>
                    <input
                      type="time"
                      name="desired_time"
                      value={formData.desired_time}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Observações <span className="text-gray-400">(opcional)</span>
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Ex: prefere tarde, convênio Unimed..."
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <Button variant="secondary" type="button" onClick={closeModal}>
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit" disabled={submitting}>
                    {submitting ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
