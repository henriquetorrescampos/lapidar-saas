import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loading from "../components/Common/Loading";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, token } = useAuth();

  if (loading) return <Loading />;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
