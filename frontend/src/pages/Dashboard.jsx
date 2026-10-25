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
            <p className="text-sm text-gray-500 italic mb-4">
              ℹ O código de consulta emitimos sempre para que a profissional realize a evolução do paciente
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <h3 className="font-semibold text-gray-800">
                    Terapia Adulto — Pacientes{" "}
                  </h3>
                </div>
                <ul className="space-y-2 text-base text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-cyan-500 font-bold mt-0.5">•</span>
                    <span>
                      Utilizar código{" "}
                      <span className="text-blue-600 font-semibold">
                        5.00.00.47-0
                      </span>{" "}
                      (<strong>8 quantidades</strong>) +{" "}
                      <span className="text-blue-600 font-semibold">
                        5.00.01.22-1
                      </span>{" "}
                      (<strong>1 quantidade</strong>) — representa{" "}
                      <strong>
                        4 atendimentos 40 minutos = (20 minutos + 20 minutos)
                      </strong>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-500 font-bold mt-0.5">•</span>
                    <span>
                      <strong>8 quantidades</strong> na guia ={" "}
                      <strong>
                        4 atendimentos 40 minutos = (20 minutos + 20 minutos)
                      </strong>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-500 font-bold mt-0.5">•</span>
                    <span>
                      Emitir sempre na <strong>última sessão</strong> para
                      reservar o horário do paciente
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-500 font-bold mt-0.5">•</span>
                    <span>
                      Para atendimentos avulsos (de acordo com a
                      disponibilidade) será <strong>2 quantidades</strong> do
                      código{" "}
                      <span className="text-blue-600 font-semibold">
                        6.00.20.01-6
                      </span>{" "}
                      ou{" "}
                      <span className="text-blue-600 font-semibold">
                        6.00.30.02-0
                      </span>{" "}
                      código{" "}
                      <span className="text-blue-600 font-semibold">
                        6.00.20.01-6
                      </span>{" "}
                      + <strong>1 quantidade</strong>{" "}
                      <span className="text-blue-600 font-semibold">
                        5.00.01.22-1
                      </span>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-500 font-bold mt-0.5">ℹ</span>
                    <span className="text-sm text-gray-500 italic">
                      <strong className="not-italic">Obs:</strong> Caso o
                      paciente questione e queira fazer 20 minutos, nós fazemos
                      sem problema. Aí é para emitir{" "}
                      <strong className="not-italic">4 quantidades</strong>.
                    </span>
                  </li>
                </ul>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <h3 className="font-semibold text-gray-800">
                    Terapia ABA — Pacientes{" "}
                    <span className="text-indigo-600">
                      com autismo ou sindrome de down
                    </span>{" "}
                    (Código TEA)
                  </h3>
                </div>
                <ul className="space-y-2 text-base text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-indigo-500 font-bold mt-0.5">•</span>
                    <span>
                      <strong>1x/semana:</strong> 1 quantidade na guia = 1
                      atendimento (40 min). Ex: 4 semanas → emitir{" "}
                      <strong>4 quantidades</strong>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-500 font-bold mt-0.5">•</span>
                    <span>
                      <strong>2x/semana:</strong> 1 quantidade na guia = 1
                      atendimento (40 min). Ex: 4 semanas → emitir{" "}
                      <strong>8 quantidades</strong>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-500 font-bold mt-0.5">ℹ</span>
                    <span className="text-sm text-gray-500 italic">
                      <strong className="not-italic">Obs:</strong> Emitir guia
                      de consulta de acordo com a especialidade:{" "}
                      <strong className="not-italic">
                        Terapia Ocupacional
                      </strong>
                      : 1 quantidade{" "}
                      <span className="text-blue-600 font-semibold not-italic">
                        5.00.00.05-5
                      </span>{" "}
                      — <strong className="not-italic">Fonoaudiologia</strong>:
                      1 quantidade{" "}
                      <span className="text-blue-600 font-semibold not-italic">
                        5.00.00.58-6
                      </span>{" "}
                      — <strong className="not-italic">Psicologia</strong>: 1
                      quantidade{" "}
                      <span className="text-blue-600 font-semibold not-italic">
                        5.00.01.22-1
                      </span>
                    </span>
                  </li>
                </ul>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-teal-500" />
                  <h3 className="font-semibold text-gray-800">
                    Terapia ABA e Terapia
                    Ocupacional/Fonoaudiologia/Fisioterapia — Pacientes{" "}
                    <span className="text-teal-600">
                      SEM AUTISMO - CRIANÇAS E ADULTOS
                    </span>
                  </h3>
                </div>
                <ul className="space-y-2 text-base text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-teal-500 font-bold mt-0.5">•</span>
                    <span>
                      Psicologia: Utilizar código{" "}
                      <span className="text-blue-600 font-semibold">
                        5.00.00.47-0
                      </span>{" "}
                      (<strong>8 quantidades</strong>) +{" "}
                      <span className="text-blue-600 font-semibold">
                        5.00.01.22-1
                      </span>{" "}
                      (<strong>1 quantidade</strong>) — representa{" "}
                      <strong>
                        4 atendimentos 40 minutos = (20 minutos + 20 minutos)
                      </strong>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-500 font-bold mt-0.5">•</span>
                    <span>
                      Fonoaudiologia: Utilizar código{" "}
                      <span className="text-blue-600 font-semibold">
                        6.00.20.01-6
                      </span>{" "}
                      (<strong>8 quantidades</strong>) +{" "}
                      <span className="text-blue-600 font-semibold">
                        6.00.30.02-0
                      </span>{" "}
                      (<strong>8 quantidade</strong>) — representa{" "}
                      <span className="text-blue-600 font-semibold">
                        5.00.00.58-6
                      </span>{" "}
                      (<strong>1 quantidade</strong>) — representa{" "}
                      <strong>
                        4 atendimentos 40 minutos = (20 minutos + 20 minutos) Os
                        dois códigos são procedimentos que a Fono realiza dentro
                        da sessão
                      </strong>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-500 font-bold mt-0.5">•</span>
                    <span>
                      Psicopedagogia: Utilizar código{" "}
                      <span className="text-blue-600 font-semibold">
                        5.00.00.47-0
                      </span>{" "}
                      (<strong>8 quantidades</strong>) +{" "}
                      <span className="text-blue-600 font-semibold">
                        5.00.01.22-1
                      </span>{" "}
                      (<strong>1 quantidade</strong>) — representa{" "}
                      <strong>
                        4 atendimentos 40 minutos = (20 minutos + 20 minutos)
                      </strong>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-500 font-bold mt-0.5">•</span>
                    <span>
                      Terapia Ocupacional: Utilizar código{" "}
                      <span className="text-blue-600 font-semibold">
                        5.00.00.47-0
                      </span>{" "}
                      (<strong>8 quantidades</strong>) +{" "}
                      <span className="text-blue-600 font-semibold">
                        5.00.00.05-5
                      </span>{" "}
                      (<strong>1 quantidade</strong>){" "}
                      <span className="text-blue-600 font-semibold">
                        2.01.03.63-8
                      </span>{" "}
                      (<strong>8 quantidade</strong>) — representa{" "}
                      <strong>
                        4 atendimentos 40 minutos = (20 minutos + 20 minutos)
                      </strong>
                      <span className="text-gray-400 text-sm">
                        (o plano do IPASGO não disponibiliza o código de Terapia
                        Ocupacional para todos os beneficiários - O procedimento
                        labirintite é um procedimento que a TO realiza na
                        sessão)
                      </span>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-teal-500 font-bold mt-0.5">•</span>
                    <span>
                      Fisioterapia: Utilizar código{" "}
                      <span className="text-blue-600 font-semibold">
                        5.00.00.47-0
                      </span>{" "}
                      (<strong>8 quantidades</strong>) +{" "}
                      <span className="text-blue-600 font-semibold">
                        2.01.03.63-8
                      </span>{" "}
                      (<strong>8 quantidades</strong>) +{" "}
                      <span className="text-blue-600 font-semibold">
                        5.00.00.05-5
                      </span>{" "}
                      (<strong>1 quantidade</strong>) — representa{" "}
                      <strong>
                        4 atendimentos 40 minutos = (20 minutos + 20 minutos)
                      </strong>
                      <span className="text-gray-400 text-sm">
                        (ainda estamos em processo de adicionar os códigos de
                        Fisioterapia no nosso sistema do IPASGO)
                      </span>
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
                <ul className="space-y-2 text-base text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-violet-500 font-bold mt-0.5">•</span>
                    <span>
                      <strong>1x/semana:</strong> 1 quantidade na guia = 1
                      atendimento/semana (40 min). Ex: 4 semanas → emitir{" "}
                      <strong>4 quantidades</strong>
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
                <ul className="space-y-2 text-base text-gray-600">
                  <li className="flex gap-2">
                    <span className="text-amber-500 font-bold mt-0.5">•</span>
                    <span>
                      <strong>Adulto e Criança:</strong> emitir códigos{" "}
                      <span className="text-blue-600 font-semibold">
                        6.00.20.01-6
                      </span>{" "}
                      (<strong>10 quantidades</strong>) +{" "}
                      <span className="text-blue-600 font-semibold">
                        6.00.30.02-0
                      </span>{" "}
                      (<strong>10 quantidades</strong>){" "}
                      <span className="text-blue-600 font-semibold">
                        5.00.01.22-1
                      </span>{" "}
                      (<strong>+ 1 quantidade</strong>)
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500 font-bold mt-0.5">•</span>
                    <span>
                      <strong>Falta (devolutiva ou sessão):</strong> emitir{" "}
                      <strong>2 quantidades</strong> do código{" "}
                      <span className="text-blue-600 font-semibold">
                        6.00.20.01-6
                      </span>
                    </span>
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
