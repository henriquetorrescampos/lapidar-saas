import React from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const baseClass =
    "inline-flex items-center justify-center font-medium transition duration-200 rounded-lg";

  const variantClass = {
    primary: "bg-primary-600 text-white hover:bg-primary-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-primary-600 hover:bg-primary-50",
  };

  const sizeClass = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
