import React from "react";
import { X } from "lucide-react";
import Button from "./Button";

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirmar",
  confirmVariant = "primary",
}) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      ></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">{children}</div>

        <div className="flex gap-3 p-6 border-t border-gray-200 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          {onConfirm && (
            <Button variant={confirmVariant} onClick={onConfirm}>
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
