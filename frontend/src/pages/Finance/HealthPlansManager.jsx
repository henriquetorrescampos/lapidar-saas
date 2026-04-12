import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/api";
import Card from "../../components/Common/Card";
import Alert from "../../components/Common/Alert";
import Loading from "../../components/Common/Loading";
import Modal from "../../components/Common/Modal";

export default function HealthPlansManager({ onSuccess }) {
  const api = useApi();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/finance/health-plan");
      setPlans(data);
    } catch (err) {
      setError(err.message || "Erro ao carregar planos");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      setError(null);
      await api.delete(`/finance/health-plan/${planId}`);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchPlans();
      setDeleteModal({ isOpen: false, id: null });
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Erro ao deletar plano");
    }
  };

  const openDeleteModal = (planId) => {
    setDeleteModal({ isOpen: true, id: planId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null });
  };

  const confirmDelete = () => {
    if (deleteModal.id) {
      handleDeletePlan(deleteModal.id);
    }
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    if (!newPlanName.trim()) {
      setError("Nome do plano é obrigatório");
      return;
    }

    try {
      setError(null);
      await api.post("/finance/health-plan", { name: newPlanName });
      setSuccess(true);
      setNewPlanName("");
      setShowForm(false);
      setTimeout(() => setSuccess(false), 3000);
      fetchPlans();
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Erro ao criar plano");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Formulário para adicionar plano */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Planos de Saúde</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showForm ? "Cancelar" : "+ Novo Plano"}
          </button>
        </div>

        {error && <Alert type="error" message={error} />}
        {success && (
          <Alert type="success" message="Plano criado com sucesso!" />
        )}

        {showForm && (
          <form onSubmit={handleAddPlan} className="mb-4 space-y-3">
            <input
              type="text"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="Ex:Bradesco Saúde, Particular"
              className="w-full px-4 py-2 border rounded"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
            >
              Adicionar Plano
            </button>
          </form>
        )}
      </Card>

      {/* Lista de planos */}
      <Card>
        {plans.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum plano de saúde cadastrado
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="border rounded-lg p-4 hover:shadow-lg transition flex justify-between items-center"
              >
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <button
                  onClick={() => openDeleteModal(plan.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Deletar
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Confirmar Exclusão"
        onConfirm={confirmDelete}
        confirmText="Deletar"
        confirmVariant="danger"
      >
        <p className="text-gray-700">
          Tem certeza que deseja remover este plano de saúde? Esta ação não pode
          ser desfeita.
        </p>
      </Modal>
    </div>
  );
}
