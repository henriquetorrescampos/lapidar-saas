import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Loading from "../../components/Common/Loading";
import Alert from "../../components/Common/Alert";
import Modal from "../../components/Common/Modal";
import { userService } from "../../services/userService";

export default function UsersList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await userService.delete(userToDelete.id);
      setUsers(users.filter((user) => user.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      setError("Erro ao deletar usuário");
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  if (loading) return <Loading />;

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Usuários</h1>
          <Button
            variant="primary"
            onClick={() => navigate("/users/new")}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Usuário
          </Button>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        <Card>
          {users.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              Nenhum usuário cadastrado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Nome
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Função
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Unidade
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="p-4 text-gray-800">{user.name}</td>
                      <td className="p-4 text-gray-600">{user.email}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{user.unit}</td>
                      <td className="p-4">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => openDeleteModal(user)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Exclusão"
        onConfirm={handleDelete}
        confirmText="Deletar"
        confirmVariant="danger"
      >
        <p className="mb-4">
          Tem certeza que deseja deletar o usuário{" "}
          <strong>{userToDelete?.name}</strong>? Esta ação não pode ser
          desfeita.
        </p>
      </Modal>
    </Layout>
  );
}
