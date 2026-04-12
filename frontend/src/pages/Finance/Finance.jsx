import React, { useState } from "react";
import FinanceDashboard from "./FinanceDashboard";
import RevenueForm from "./RevenueForm";
import RevenueList from "./RevenueList";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";
import HealthPlansManager from "./HealthPlansManager";
import Layout from "../../components/Layout/Layout";

export default function Finance() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const tabs = [
    {
      id: "dashboard",
      label: "📊 Dashboard",
      icon: "📊",
      content: <FinanceDashboard key={refreshKey} />,
    },
    {
      id: "revenue",
      label: "💰 Receitas",
      icon: "💰",
      content: (
        <div className="space-y-6" key={refreshKey}>
          <RevenueForm onSuccess={handleSuccess} />
          <RevenueList key={refreshKey} />
        </div>
      ),
    },
    {
      id: "expense",
      label: "💸 Despesas",
      icon: "💸",
      content: (
        <div className="space-y-6" key={refreshKey}>
          <ExpenseForm onSuccess={handleSuccess} />
          <ExpenseList key={refreshKey} />
        </div>
      ),
    },
    {
      id: "plans",
      label: "🏥 Planos",
      icon: "🏥",
      content: (
        <HealthPlansManager key={refreshKey} onSuccess={handleSuccess} />
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Finanças</h1>

          {/* Tabs Navigation */}
          <div className="flex gap-2 border-b overflow-x-auto bg-white rounded-t-lg p-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-b-lg p-6">
            {tabs.find((tab) => tab.id === activeTab)?.content}
          </div>
        </div>
      </div>
    </Layout>
  );
}
