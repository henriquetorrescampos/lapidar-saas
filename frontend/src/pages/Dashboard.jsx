import React, { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  Eye,
  EyeOff,
  Brain,
  Mic,
  BookOpen,
  Hand,
  HeartPulse,
  Activity,
  Dumbbell,
} from "lucide-react";
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
    sp_psicologia: 0,
    sp_fonoaudiologia: 0,
    sp_terapia_ocupacional: 0,
    sp_psicopedagogia: 0,
    sp_psicomotricidade: 0,
    sp_fisioterapia: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const patients = await patientService.getAll();
      let summary = null;
      let balance = 0;

      // Contar somente pacientes ativos
      const patientsArray = (Array.isArray(patients) ? patients : []).filter(
        (p) => p.active !== false,
      );
      const patients_aba = patientsArray.filter((p) =>
        p.patient_type?.includes("ABA"),
      ).length;
      const patients_terapia_adulto = patientsArray.filter((p) =>
        p.patient_type?.includes("TERAPIA_ADULTO"),
      ).length;
      const patients_neuro = patientsArray.filter((p) =>
        p.patient_type?.includes("AVALIACAO_NEUROPSICOLOGICA"),
      ).length;

      const countSpecialty = (name) =>
        patientsArray.filter((p) =>
          (p.specialties || "")
            .split(",")
            .map((s) => s.trim())
            .includes(name),
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
        sp_psicologia: countSpecialty("Psicologia"),
        sp_fonoaudiologia: countSpecialty("Fonoaudiologia"),
        sp_terapia_ocupacional: countSpecialty("Terapia Ocupacional"),
        sp_psicopedagogia: countSpecialty("Psicopedagogia"),
        sp_psicomotricidade: countSpecialty("Psicomotricidade"),
        sp_fisioterapia: countSpecialty("Fisioterapia"),
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

        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Paciente por Especialidade
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Psicologia</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.sp_psicologia}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <HeartPulse size={32} className="text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Fonoaudiologia</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.sp_fonoaudiologia}
                </p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <Mic size={32} className="text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Terapia Ocupacional</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.sp_terapia_ocupacional}
                </p>
              </div>
              <div className="bg-orange-100 p-4 rounded-lg">
                <Hand size={32} className="text-orange-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Psicopedagogia</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.sp_psicopedagogia}
                </p>
              </div>
              <div className="bg-violet-100 p-4 rounded-lg">
                <BookOpen size={32} className="text-violet-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Psicomotricidade</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.sp_psicomotricidade}
                </p>
              </div>
              <div className="bg-pink-100 p-4 rounded-lg">
                <Activity size={32} className="text-pink-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Fisioterapia</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.sp_fisioterapia}
                </p>
              </div>
              <div className="bg-teal-100 p-4 rounded-lg">
                <Dumbbell size={32} className="text-teal-600" />
              </div>
            </div>
          </Card>
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
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                IPASGO
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <p className="text-base font-bold text-gray-700 mb-4">
              ℹ Em caso de questionamento sobre código de consulta: O código de
              consulta emitimos sempre para que a profissional realize a
              evolução do paciente
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <h3 className="font-semibold text-gray-800">
                    Terapia Adulto — Pacientes
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="py-3 pt-0">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Sessão padrão (40 min)
                    </span>
                    <div className="flex flex-wrap gap-2 items-center mt-2">
                      <span className="flex items-center gap-1.5">
                        <span className="bg-blue-50 border border-blue-200 text-blue-700 font-mono text-sm font-bold px-2.5 py-0.5 rounded">
                          5.00.00.47-0
                        </span>
                        <span className="text-sm font-bold text-gray-700">
                          ×8
                        </span>
                        <span className="text-gray-400 text-sm font-bold">
                          +
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="bg-blue-50 border border-blue-200 text-blue-700 font-mono text-sm font-bold px-2.5 py-0.5 rounded">
                          5.00.01.22-1
                        </span>
                        <span className="text-sm font-bold text-gray-700">
                          ×1
                        </span>
                      </span>
                      <span className="text-sm text-cyan-700 font-bold">
                        = 4 atendimentos
                      </span>
                    </div>
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2 italic">
                      Emitir sempre na última sessão para reservar o horário do
                      paciente
                    </p>
                  </div>
                  <div className="py-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Atendimento avulso
                    </span>
                    <div className="flex flex-wrap gap-2 items-center mt-2">
                      <span className="flex items-center gap-1.5">
                        <span className="bg-blue-50 border border-blue-200 text-blue-700 font-mono text-sm font-bold px-2.5 py-0.5 rounded">
                          5.00.00.47-0
                        </span>
                        <span className="text-sm font-bold text-gray-700">
                          ×2
                        </span>
                        <span className="text-gray-400 text-sm font-bold">
                          +
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="bg-blue-50 border border-blue-200 text-blue-700 font-mono text-sm font-bold px-2.5 py-0.5 rounded">
                          5.00.01.22-1
                        </span>
                        <span className="text-sm font-bold text-gray-700">
                          ×1
                        </span>
                      </span>
                      <span className="text-sm text-cyan-700 font-bold">
                        = 1 atendimento
                      </span>
                    </div>
                  </div>
                  <div className="py-3 pb-0">
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 italic">
                      Caso o paciente queira fazer 20 minutos, emitir{" "}
                      <strong>4 quantidades</strong>
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <h3 className="font-semibold text-gray-800">
                    Terapia ABA — Pacientes{" "}
                    <span className="text-indigo-600">
                      com autismo ou síndrome de down
                    </span>{" "}
                    (Código TEA)
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { freq: "1x/semana", qtd: 4 },
                    { freq: "2x/semana", qtd: 8 },
                  ].map(({ freq, qtd }) => (
                    <div
                      key={freq}
                      className="py-3 first:pt-0 flex items-center justify-between gap-3"
                    >
                      <span className="text-sm font-bold text-gray-800 min-w-[100px]">
                        {freq}
                      </span>
                      <span className="text-sm text-gray-600 flex-1">
                        1 qtd = 1 atendimento (40 min) — 4 semanas →
                      </span>
                      <span className="text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded whitespace-nowrap">
                        {qtd} quantidades
                      </span>
                    </div>
                  ))}
                  <div className="pt-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      Guia de consulta por especialidade
                    </p>
                    <div className="divide-y divide-gray-100">
                      {[
                        {
                          label: "Terapia Ocupacional (SOMENTE A ANAMNESE)",
                          code: "5.00.00.05-5",
                        },
                        {
                          label: "Fonoaudiologia (SOMENTE A ANAMNESE)",
                          code: "5.00.00.58-6",
                        },
                        {
                          label: "Psicologia (SOMENTE A ANAMNESE)",
                          code: "5.00.01.22-1",
                        },
                      ].map(({ label, code }) => (
                        <div
                          key={label}
                          className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                        >
                          <span className="text-sm font-bold text-gray-700">
                            {label}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="bg-blue-50 border border-blue-200 text-blue-700 font-mono text-sm font-bold px-2.5 py-0.5 rounded">
                              {code}
                            </span>
                            <span className="text-sm font-bold text-gray-700">
                              ×1
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-teal-500" />
                  <h3 className="font-semibold text-gray-800">
                    Terapia ABA e Terapia
                    Ocupacional/Fonoaudiologia/Fisioterapia — Pacientes{" "}
                    <span className="text-teal-600">
                      SEM AUTISMO - CRIANÇAS E ADULTOS
                    </span>
                  </h3>
                  <p className="text-sm font-semibold text-gray-600 mt-1">
                    ℹ Cada sessão de 40 min é composta por 2 blocos de 20 min —
                    portanto, 1 sessão = 2 quantidades na guia
                  </p>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    {
                      label: "Psicologia",
                      codes: [
                        { c: "5.00.00.47-0", q: 8 },
                        { c: "5.00.01.22-1", q: 1 },
                      ],
                      obs: null,
                    },
                    {
                      label: "Fonoaudiologia",
                      codes: [
                        { c: "6.00.20.01-6", q: 8 },
                        { c: "6.00.30.02-0", q: 4 },
                      ],
                      obs: null,
                    },
                    {
                      label: "Psicopedagogia",
                      codes: [
                        { c: "5.00.00.47-0", q: 8 },
                        { c: "5.00.01.22-1", q: 1 },
                      ],
                      obs: null,
                    },
                    {
                      label: "Terapia Ocupacional",
                      codes: [
                        { c: "5.00.00.47-0", q: 8 },
                        { c: "5.00.00.05-5", q: 1 },
                        { c: "2.01.03.63-8", q: 8 },
                      ],
                      obs: "O plano do IPASGO não disponibiliza o código de TO para todos os beneficiários. O procedimento labirintite é realizado dentro da sessão.",
                    },
                    {
                      label: "Fisioterapia",
                      codes: [
                        { c: "6.00.20.01-6", q: 8 },
                        { c: "6.00.30.02-0", q: 8 },
                        { c: "5.00.00.58-6", q: 1 },
                      ],
                      obs: null,
                    },
                  ].map(({ label, codes, obs }) => (
                    <div key={label} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <span className="text-sm font-bold text-gray-800 min-w-[150px]">
                          {label}
                        </span>
                        <div className="flex flex-wrap gap-2 flex-1">
                          {codes.map(({ c, q }, i) => (
                            <span key={c} className="flex items-center gap-1.5">
                              <span className="bg-blue-50 border border-blue-200 text-blue-700 font-mono text-sm font-bold px-2.5 py-0.5 rounded">
                                {c}
                              </span>
                              <span className="text-sm font-bold text-gray-700">
                                ×{q}
                              </span>
                              {i < codes.length - 1 && (
                                <span className="text-gray-400 text-sm font-bold">
                                  +
                                </span>
                              )}
                            </span>
                          ))}
                          <span className="text-sm text-teal-700 font-bold self-center">
                            = 4 atendimentos
                          </span>
                        </div>
                      </div>
                      {obs && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2 italic">
                          {obs}
                        </p>
                      )}
                    </div>
                  ))}
                  <div className="pt-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      Guia de consulta por especialidade
                    </p>
                    <div className="divide-y divide-gray-100">
                      {[
                        { label: "Terapia Ocupacional", code: "5.00.00.05-5" },
                        {
                          label: "Fonoaudiologia (SOMENTE A ANAMNESE)",
                          code: "5.00.00.58-6",
                        },
                        { label: "Psicologia", code: "5.00.01.22-1" },
                        { label: "Fisioterapia", code: "5.00.00.05-5" },
                      ].map(({ label, code }) => (
                        <div
                          key={label}
                          className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                        >
                          <span className="text-sm font-bold text-gray-700">
                            {label}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="bg-blue-50 border border-blue-200 text-blue-700 font-mono text-sm font-bold px-2.5 py-0.5 rounded">
                              {code}
                            </span>
                            <span className="text-sm font-bold text-gray-700">
                              ×1
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-violet-500" />
                  <h3 className="font-semibold text-gray-800">
                    Terapia Adulto Pacientes com autismo — Código TEA
                  </h3>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-gray-800 min-w-[100px]">
                    1x/semana
                  </span>
                  <span className="text-sm text-gray-600 flex-1">
                    2 qtd = 1 atendimento (20 + 20 = 40 min) — 4 semanas →
                  </span>
                  <span className="text-sm font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded whitespace-nowrap">
                    8 quantidades
                  </span>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <h3 className="font-semibold text-gray-800">
                    Avaliação Neuropsicológica
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="pb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Adulto e Criança
                    </span>
                    <div className="flex flex-wrap gap-2 items-center mt-2">
                      {[
                        { c: "6.00.20.01-6", q: 10 },
                        { c: "6.00.30.02-0", q: 10 },
                        { c: "5.00.01.22-1", q: 1 },
                      ].map(({ c, q }, i, arr) => (
                        <span key={c} className="flex items-center gap-1.5">
                          <span className="bg-blue-50 border border-blue-200 text-blue-700 font-mono text-sm font-bold px-2.5 py-0.5 rounded">
                            {c}
                          </span>
                          <span className="text-sm font-bold text-gray-700">
                            ×{q}
                          </span>
                          {i < arr.length - 1 && (
                            <span className="text-gray-400 text-sm font-bold">
                              +
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-gray-800">
                      Falta (devolutiva ou sessão)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="bg-blue-50 border border-blue-200 text-blue-700 font-mono text-sm font-bold px-2.5 py-0.5 rounded">
                        6.00.20.01-6
                      </span>
                      <span className="text-sm font-bold text-gray-700">
                        ×2
                      </span>
                    </span>
                  </div>
                </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <h3 className="font-semibold text-gray-800">
                    Avaliação Neuropsicológica
                  </h3>
                </div>
                <ul className="space-y-2 text-base text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-amber-500 font-bold mt-0.5">•</span>
                    <span>
                      Emitir código de{" "}
                      <strong>avaliação neuropsicológica</strong> — quantidade{" "}
                      <strong>8</strong> código{" "}
                      <span className="text-blue-600 font-semibold">
                        80010040
                      </span>
                      .
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500 font-bold mt-0.5">•</span>
                    <span>
                      Emitir <strong>1 guia de consulta</strong> código{" "}
                      <span className="text-blue-600 font-semibold">10030</span>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500 font-bold mt-0.5">•</span>
                    <span>
                      Emitir guia de <strong>sessão de psicologia</strong> —
                      quantidade <strong>4</strong> código{" "}
                      <span className="text-blue-600 font-semibold">
                        010016
                      </span>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500 font-bold mt-0.5">•</span>
                    <span>
                      <strong>Falta (devolutiva ou sessão):</strong> cobrar{" "}
                      <strong>2 quantidades</strong> do código{" "}
                      <span className="text-blue-600 font-semibold">
                        010016
                      </span>
                    </span>
                  </li>
                </ul>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <h3 className="font-semibold text-gray-800">
                    Terapia ABA Infantil ou Adulto (paciente com autismo)
                  </h3>
                </div>
                <ul className="space-y-2 text-base text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-green-500 font-bold mt-0.5">•</span>
                    <div className="flex flex-col gap-1">
                      <span>
                        Emitir código de <strong>ABA</strong> — cada sessão
                        equivale a <strong>1 atendimento</strong>
                      </span>
                      <span className="pl-3 text-gray-500">
                        ↳ Ou seja, <strong>4 atendimentos no mês</strong> ={" "}
                        <strong>4 quantidades</strong> na guia
                      </span>
                    </div>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
