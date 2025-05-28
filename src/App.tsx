import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import BoardsPage from "./pages/BoardsPage";
import OrganizationSettingsPage from "./pages/OrganizationSettingsPage";
import BoardViewPage from "./components/BoardViewPage";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return user ? <Navigate to="/" /> : <>{children}</>;
};

const AppWithRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/register"
            element={
              <AuthRoute>
                <RegisterPage />
              </AuthRoute>
            }
          />
          <Route
            path="/login"
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthRoute>
                <ForgotPasswordPage />
              </AuthRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizations"
            element={
              <ProtectedRoute>
                <OrganizationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizations/:organizationId"
            element={
              <ProtectedRoute>
                <BoardsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizations/:organizationId/settings"
            element={
              <ProtectedRoute>
                <OrganizationSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/boards/:boardId"
            element={
              <ProtectedRoute>
                <BoardViewPage />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to login or dashboard */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* 404 - Not found */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Main App component
const App: React.FC = () => {
  return <AppWithRouter />;
};

export default App;
