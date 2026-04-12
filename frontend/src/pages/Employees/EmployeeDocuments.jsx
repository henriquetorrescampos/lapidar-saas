import React, { useEffect, useState } from "react";
import { ArrowLeft, Upload, Download, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Alert from "../../components/Common/Alert";
import Loading from "../../components/Common/Loading";
import Modal from "../../components/Common/Modal";
import { employeeService } from "../../services/employeeService";

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export default function EmployeeDocuments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeeData, documentsData] = await Promise.all([
        employeeService.getById(id),
        employeeService.getDocuments(id),
      ]);
      setEmployee(employeeData);
      setDocuments(Array.isArray(documentsData) ? documentsData : []);
    } catch (err) {
      setError(err.message || "Erro ao carregar documentos");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedFile) {
      setError("Selecione um arquivo para anexar");
      return;
    }

    try {
      setUploading(true);
      await employeeService.uploadDocument(id, selectedFile, documentType);
      setSuccess("Documento anexado com sucesso");
      setSelectedFile(null);
      await loadData();
    } catch (err) {
      setError(err.message || "Erro ao anexar documento");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      await employeeService.deleteDocument(id, documentToDelete.id);
      setSuccess("Documento excluído com sucesso");
      setDocuments((prev) =>
        prev.filter((doc) => doc.id !== documentToDelete.id),
      );
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    } catch (err) {
      setError(err.message || "Erro ao excluir documento");
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
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Documentos do Funcionário
            </h1>
            <p className="mt-1 text-xl font-bold uppercase tracking-wide text-primary-700">
              {employee?.name}
            </p>
          </div>
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
          <form onSubmit={handleUpload} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Anexar Documento
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tipo do Documento
                </label>
                <input
                  type="text"
                  value={documentType}
                  onChange={(e) =>
                    setDocumentType(e.target.value.toUpperCase())
                  }
                  className="input-field uppercase"
                  placeholder="EX: DOCUMENTO PESSOAL"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Arquivo (PDF, PNG, JPG)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="input-field"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Upload size={18} />
              {uploading ? "Enviando..." : "Anexar"}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Arquivos Anexados
          </h2>

          {documents.length === 0 ? (
            <p className="py-8 text-center text-gray-600">
              Nenhum documento anexado
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Tipo
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Nome do Arquivo
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Tamanho
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">
                      Data
                    </th>
                    <th className="p-4 text-right font-semibold text-gray-700">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr
                      key={document.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="p-4 text-gray-800">
                        {document.document_type || "OUTROS"}
                      </td>
                      <td className="p-4 text-gray-600">
                        {document.original_name}
                      </td>
                      <td className="p-4 text-gray-600">
                        {formatFileSize(document.size_bytes)}
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(document.created_at).toLocaleString("pt-BR")}
                      </td>
                      <td className="space-x-2 p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={async () => {
                            try {
                              await employeeService.downloadDocument(
                                id,
                                document,
                              );
                            } catch (err) {
                              setError(
                                err.message || "Erro ao baixar documento",
                              );
                            }
                          }}
                        >
                          <Download size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setDocumentToDelete(document);
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
          title="Excluir Documento"
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          confirmText="Excluir"
          confirmVariant="danger"
        >
          <p className="text-gray-600">
            Tem certeza que deseja excluir o arquivo{" "}
            <strong>{documentToDelete?.original_name}</strong>?
          </p>
        </Modal>
      </div>
    </Layout>
  );
}
