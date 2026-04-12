import React, { useState, useEffect } from "react";
import { Users, DollarSign } from "lucide-react";
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
    appointments: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);

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

      if (user?.role === "admin") {
        summary = await financeService.getSummary();
        balance = summary?.total || 0;
      }

      setStats({
        patients: patientsArray.length,
        patients_aba,
        patients_terapia_adulto,
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

          {user?.role === "admin" && (
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Balanço</p>
                  <p className="text-2xl font-bold text-gray-800">
                    R${" "}
                    {stats.balance?.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
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
      </div>
    </Layout>
  );
}
