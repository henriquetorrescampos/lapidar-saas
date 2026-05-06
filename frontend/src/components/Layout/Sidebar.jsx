import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  BadgeDollarSign,
  LogOut,
  X,
  Brain,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showLogo, setShowLogo] = useState(true);

  const menuItems = [
    {
      label: "Dashboard",
      icon: Home,
      path: "/dashboard",
      roles: ["admin", "user"],
    },
    {
      label: "Pacientes",
      icon: Users,
      path: "/patients",
      roles: ["admin", "user"],
    },
    {
      label: "Agendamentos Terapia",
      icon: Calendar,
      path: "/appointments",
      roles: ["admin", "user"],
    },
    {
      label: "Agendamento Avaliação Neuro",
      icon: Brain,
      path: "/neuro-schedule",
      roles: ["admin", "user"],
    },
    {
      label: "Emissão de Guias",
      icon: ClipboardList,
      path: "/guide-emission",
      roles: ["admin", "user"],
    },
    {
      label: "Funcionários",
      icon: BadgeDollarSign,
      path: "/employees",
      roles: ["admin"],
    },
    { label: "Usuários", icon: Users, path: "/users", roles: ["admin"] },
    { label: "Finanças", icon: DollarSign, path: "/finance", roles: ["admin"] },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => user?.role && item.roles.includes(user.role),
  );

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-700 text-white transition-transform duration-300 md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-end mb-3 md:hidden">
            <button onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>
          {showLogo ? (
            <img
              src="/lapidar-logo-fundo-branco.png"
              alt="Lapidar Clínica Multidisciplinar"
              className="w-full object-contain max-h-[80px]"
              onError={() => setShowLogo(false)}
            />
          ) : (
            <h1 className="text-2xl font-bold">Lapidar</h1>
          )}
        </div>

        <nav className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${
                  isActive(item.path)
                    ? "bg-primary-600 text-white"
                    : "text-primary-100 hover:bg-primary-600"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-primary-600">
          <p className="text-sm text-primary-100 mb-4">
            Olá, <strong>{user?.name}</strong>
          </p>
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-primary-100 hover:bg-primary-600 transition duration-200"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}
