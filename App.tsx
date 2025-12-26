import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import TrainingPage from './pages/TrainingPage';
import SimulationPage from './pages/SimulationPage';
import AboutPage from './pages/AboutPage';
import DocumentPage from './pages/DocumentPage';
import IntegrationsPage from './pages/IntegrationsPage';
import ReportingPage from './pages/ReportingPage';
import { OrganizationPage } from './pages/OrganizationPage';
import TalentPage from './pages/TalentPage';
import EmployeePersonalSpace from './pages/EmployeePersonalSpace';
import ApprovalsPage from './pages/ApprovalsPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import { FloatingAssistant } from './components/ai/FloatingAssistant';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';
import type { Employee } from './types';

export type Page =
  'dashboard' |
  'organization' |
  'talent' |
  'training' |
  'simulation' |
  'documents' |
  'integrations' |
  'reporting' |
  'approvals' |
  'admin' |
  'about';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f2b]">
        <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Admin-only route wrapper
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Main app content with layout
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);

  // Get current page from pathname
  const getCurrentPage = (): Page => {
    const path = location.pathname.slice(1) || 'dashboard';
    return path as Page;
  };

  const setCurrentPage = (page: Page) => {
    navigate(`/${page === 'dashboard' ? '' : page}`);
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    navigate(`/organization/employee/${employee.id}`);
  };

  const handleBackToList = () => {
    setSelectedEmployee(null);
    navigate('/organization');
  };

  return (
    <div className="h-screen bg-[#0a0f2b] text-gray-200 font-sans relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] pointer-events-none" />

      <Layout currentPage={getCurrentPage()} setCurrentPage={setCurrentPage}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard setCurrentPage={setCurrentPage} />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/organization" element={<OrganizationPage onViewEmployee={handleViewEmployee} />} />
            <Route
              path="/organization/employee/:id"
              element={
                selectedEmployee
                  ? <EmployeePersonalSpace employee={selectedEmployee} onBack={handleBackToList} />
                  : <Navigate to="/organization" replace />
              }
            />
            <Route path="/talent" element={<TalentPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/documents" element={<DocumentPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/reporting" element={<ReportingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </Layout>

      <FloatingAssistant />
    </div>
  );
};

// Root App component
const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f2b]">
        <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        } />
        <Route path="/*" element={
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;