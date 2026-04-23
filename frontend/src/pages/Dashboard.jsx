import React, { useState, useEffect } from "react";
import { Users, DollarSign, Eye, EyeOff, Brain } from "lucide-react";
import Layout from "../components/Layout/Layout";
import Card from "../components/Common/Card";
import Loading from "../components/Common/Loading";
import { patientService } from "../services/patientService";
import { financeService } from "../services/financeService";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    patients_aba: 0,
    patients_terapia_adulto: 0,
    patients_neuro: 0,
    appointments: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const patients = await patientService.getAll();
      let summary = null;
      let balance = 0;

      // Contar pacientes por tipo
      const patientsArray = Array.isArray(patients) ? patients : [];
      const patients_aba = patientsArray.filter((p) =>
        p.patient_type?.includes("ABA"),
      ).length;
      const patients_terapia_adulto = patientsArray.filter((p) =>
        p.patient_type?.includes("TERAPIA_ADULTO"),
      ).length;
      const patients_neuro = patientsArray.filter((p) =>
        p.patient_type?.includes("AVALIACAO_NEUROPSICOLOGICA"),
      ).length;

      if (user?.role === "admin") {
        summary = await financeService.getSummary();
        balance = summary?.total || 0;
      }

      setStats({
        patients: patientsArray.length,
        patients_aba,
        patients_terapia_adulto,
        patients_neuro,
        appointments: 0,
        balance,
      });
    } catch (err) {
      // Erro silenciosamente tratado
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pacientes ABA</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.patients_aba}
                </p>
              </div>
              <div className="bg-indigo-100 p-4 rounded-lg">
                <Users size={32} className="text-indigo-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">
                  Pacientes Terapia Adulto
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.patients_terapia_adulto}
                </p>
              </div>
              <div className="bg-cyan-100 p-4 rounded-lg">
                <Users size={32} className="text-cyan-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">
                  Avaliação Neuropsicológica
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.patients_neuro}
                </p>
              </div>
              <div className="bg-amber-100 p-4 rounded-lg">
                <Brain size={32} className="text-amber-600" />
              </div>
            </div>
          </Card>

          {user?.role === "admin" && (
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-gray-600 text-sm">Balanço</p>
                    <button
                      type="button"
                      onClick={() => setShowBalance((v) => !v)}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      showBalance
                        ? stats.balance >= 0
                          ? "text-green-600"
                          : "text-red-600"
                        : "text-gray-800"
                    }`}
                  >
                    {showBalance
                      ? `R$ ${stats.balance?.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}`
                      : "R$ ••••••"}
                  </p>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg">
                  <DollarSign size={32} className="text-purple-600" />
                </div>
              </div>
            </Card>
          )}
        </div>

        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Bem-vindo!</h2>
          <p className="text-gray-600">
            Olá, {user?.name}! Bem-vindo ao sistema da clínica Lapidar.
          </p>
        </Card>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Guia de Emissão de Guias
          </h2>

          {/* IPASGO */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                IPASGO
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <h3 className="font-semibold text-gray-800">
                    Terapia Adulto
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-cyan-500 font-bold mt-0.5">•</span>
                    <span>
                      <strong>10 quantidades</strong> na guia ={" "}
                      <strong>4 sessões</strong>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-500 font-bold mt-0.5">•</span>
                    <span>
                      Emitir sempre na <strong>última sessão</strong> para
                      reservar o horário do paciente
                    </span>
                  </li>
                </ul>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <h3 className="font-semibold text-gray-800">
                    Terapia ABA Infantil (até 18 anos de idade) - Código TEA
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-indigo-500 font-bold mt-0.5">•</span>
                    <span>
                      <strong>1x/semana:</strong> 2 sessões na guia = 1
                      atendimento. Ex: 4 semanas → emitir{" "}
                      <strong>8 quantidades</strong>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-500 font-bold mt-0.5">•</span>
                    <span>
                      <strong>2x/semana:</strong> 1 sessão na guia = 1
                      atendimento. Ex: 4 semanas → emitir{" "}
                      <strong>8 quantidades</strong>
                    </span>
                  </li>
                </ul>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-violet-500" />
                  <h3 className="font-semibold text-gray-800">
                    Terapia Adulto ABA - Código TEA
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-violet-500 font-bold mt-0.5">•</span>
                    <span>
                      <strong>1x/semana:</strong> 2 sessões na guia = 1
                      atendimento/semana. Ex: 4 semanas → emitir{" "}
                      <strong>8 quantidades</strong>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-500 font-bold mt-0.5">•</span>
                    <span>
                      <strong>2x/semana:</strong> 2 sessões na guia = 1
                      atendimento/semana. Ex: 4 semanas → emitir{" "}
                      <strong>8 quantidades</strong>
                    </span>
                  </li>
                </ul>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <h3 className="font-semibold text-gray-800">
                    Avaliação Neuropsicológica
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-amber-500 font-bold mt-0.5">•</span>
                    <span>
                      <strong>Criança:</strong> emitir código TEA (10
                      quantidades de terapia)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500 font-bold mt-0.5">•</span>
                    <div className="flex flex-col gap-1">
                      <span>
                        <strong>Adulto:</strong> emitir código de{" "}
                        <strong>terapia adulto</strong> (10 quantidades)
                      </span>
                      <span className="pl-3 text-gray-500">
                        ↳ <strong>Mês seguinte:</strong> emitir mais 10
                        quantidades de terapia adulto para contemplar a
                        avaliação neuropsicológica
                      </span>
                    </div>
                  </li>
                </ul>
              </Card>
            </div>
          </div>

          {/* IAMESC */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                IAMESC
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <Card>
              <p className="text-sm text-gray-400 italic">
                Informações sobre emissão de guias IAMESC serão adicionadas em
                breve.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
