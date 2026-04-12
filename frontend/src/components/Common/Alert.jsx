import React from "react";
import { AlertCircle, CheckCircle, XCircle, Info, X } from "lucide-react";

export default function Alert({ type = "info", title, message, onClose }) {
  const typeConfig = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: CheckCircle,
      iconColor: "text-green-600",
      titleColor: "text-green-800",
      messageColor: "text-green-700",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: XCircle,
      iconColor: "text-red-600",
      titleColor: "text-red-800",
      messageColor: "text-red-700",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: AlertCircle,
      iconColor: "text-yellow-600",
      titleColor: "text-yellow-800",
      messageColor: "text-yellow-700",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: Info,
      iconColor: "text-blue-600",
      titleColor: "text-blue-800",
      messageColor: "text-blue-700",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} border ${config.border} rounded-lg p-4 flex items-start gap-4`}
    >
      <Icon className={`${config.iconColor} flex-shrink-0 mt-0.5`} size={20} />
      <div className="flex-1">
        {title && (
          <h3 className={`font-semibold ${config.titleColor} mb-1`}>{title}</h3>
        )}
        {message && <p className={config.messageColor}>{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
