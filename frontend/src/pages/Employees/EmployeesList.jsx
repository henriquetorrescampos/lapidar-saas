import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Loading from "../../components/Common/Loading";
import Alert from "../../components/Common/Alert";
import Modal from "../../components/Common/Modal";
import { employeeService } from "../../services/employeeService";

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

export default function EmployeesList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const consolidatedPayroll = useMemo(() => {
    return employees.reduce(
      (total, employee) => total + Number(employee.updated_value || 0),
      0,
    );
  }, [employees]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;

    try {
      await employeeService.delete(employeeToDelete.id);
      setSuccess("Funcionário deletado com sucesso");
      setEmployees((prev) =>
        prev.filter((employee) => employee.id !== employeeToDelete.id),
      );
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    } catch (err) {
      setError(err.message || "Erro ao deletar funcionário");
    }
  };

  if (loading) return <Loading />;

  return (
    <Layout>
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Funcionários</h1>
            <p className="text-sm text-gray-500">
              Clique no nome do funcionário para gerenciar documentos.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate("/employees/new")}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Funcionário
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
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Folha de Pagamento Consolidada
            </p>
            <p className="text-3xl font-bold text-primary-700">
              {formatCurrency(consolidatedPayroll)}
            </p>
          </div>
        </Card>

        <Card>
          {employees.length === 0 ? (
            <p className="py-8 text-center text-gray-600">
              Nenhum funcionário cadastrado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Nome
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Especialidade
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Salário
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Faltas
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Valor Diário
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Valor Atualizado
                    </th>
                    <th className="p-4 text-right font-semibold text-gray-700">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >
                      <td className="p-4 text-gray-800">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/employees/${employee.id}/documents`)
                          }
                          className="font-medium text-primary-700 hover:underline"
                        >
                          {employee.name}
                        </button>
                      </td>
                      <td className="p-4 text-gray-600">
                        {employee.specialty}
                      </td>
                      <td className="p-4 text-gray-600">
                        {formatCurrency(employee.salary)}
                      </td>
                      <td className="p-4 text-gray-600">{employee.absences}</td>
                      <td className="p-4 text-gray-600">
                        {formatCurrency(employee.daily_value)}
                      </td>
                      <td className="p-4 text-gray-600">
                        {formatCurrency(employee.updated_value)}
                      </td>
                      <td className="space-x-2 p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/employees/${employee.id}/edit`)
                          }
                        >
                          <Edit2 size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEmployeeToDelete(employee);
                            setShowDeleteModal(true);
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
          )}
        </Card>

        <Modal
          isOpen={showDeleteModal}
          title="Excluir Funcionário"
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          confirmText="Excluir"
          confirmVariant="danger"
        >
          <p className="text-gray-600">
            Tem certeza que deseja excluir o funcionário{" "}
            <strong>{employeeToDelete?.name}</strong>?
          </p>
        </Modal>
      </div>
    </Layout>
  );
}
