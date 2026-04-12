import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PatientsList from "./pages/Patients/PatientsList";
import PatientForm from "./pages/Patients/PatientForm";
import PatientView from "./pages/Patients/PatientView";
import UsersList from "./pages/Users/UsersList";
import UserForm from "./pages/Users/UserForm";
import Finance from "./pages/Finance/Finance";
import FinanceForm from "./pages/Finance/FinanceForm";
import EmployeesList from "./pages/Employees/EmployeesList";
import EmployeeForm from "./pages/Employees/EmployeeForm";
import EmployeeDocuments from "./pages/Employees/EmployeeDocuments";
import SessionsPage from "./pages/Appointments/SessionsPage";
import NeuroSchedulePage from "./pages/NeuroSchedule/NeuroSchedulePage";
import ProtectedRoute from "./pages/ProtectedRoute";

function App() {
  return (
    <BrowserRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Patients */}
          <Route
            path="/patients"
            element={
              <ProtectedRoute requiredRole={["admin", "user"]}>
                <PatientsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/new"
            element={
              <ProtectedRoute requiredRole={["admin", "user"]}>
                <PatientForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute requiredRole={["admin", "user"]}>
                <PatientView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id/edit"
            element={
              <ProtectedRoute requiredRole={["admin", "user"]}>
                <PatientForm />
              </ProtectedRoute>
            }
          />

          {/* Appointments */}
          <Route
            path="/appointments"
            element={
              <ProtectedRoute requiredRole={["admin", "user"]}>
                <SessionsPage />
              </ProtectedRoute>
            }
          />

          {/* Neuro Schedule */}
          <Route
            path="/neuro-schedule"
            element={
              <ProtectedRoute requiredRole={["admin", "user"]}>
                <NeuroSchedulePage />
              </ProtectedRoute>
            }
          />

          {/* Users */}
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <UsersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/new"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <UserForm />
              </ProtectedRoute>
            }
          />

          {/* Finance */}
          <Route
            path="/finance"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <Finance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/new"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <FinanceForm />
              </ProtectedRoute>
            }
          />

          {/* Employees */}
          <Route
            path="/employees"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <EmployeesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees/new"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <EmployeeForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees/:id/edit"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <EmployeeForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees/:id/documents"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <EmployeeDocuments />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
