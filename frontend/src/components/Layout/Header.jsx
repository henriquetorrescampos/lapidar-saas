import React from "react";
import { Menu } from "lucide-react";

export default function Header({ onMenuToggle }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onMenuToggle}
          className="md:hidden text-gray-700 hover:text-gray-900"
        >
          <Menu size={24} />
        </button>
        <div className="flex-1 md:flex-none"></div>
      </div>
    </header>
  );
}
