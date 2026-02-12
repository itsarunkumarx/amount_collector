
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import UserLoginPage from './pages/auth/UserLoginPage';
import SignupPage from './pages/auth/SignupPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import TeamLoginPage from './pages/auth/TeamLoginPage';
import PortalSelectionPage from './pages/auth/PortalSelectionPage';
import DashboardLayout from './components/layout/DashboardLayout';

import DashboardHome from './pages/dashboard/DashboardHome';
import CasesPage from './pages/dashboard/CasesPage';
import UsersPage from './pages/dashboard/UsersPage';
import AlertsPage from './pages/dashboard/AlertsPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import CalculatorPage from './pages/dashboard/CalculatorPage';
import WorkerManagementPage from './pages/dashboard/WorkerManagementPage';
import TransactionListPage from './pages/dashboard/TransactionListPage';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import CollectionPage from './pages/worker/CollectionPage';
import AdminUserManagement from './pages/admin/AdminUserManagement';
// const DashboardHome = () => <div className="p-4"><h2 className="text-2xl font-serif text-royal-gold">Welcome to Royal Dashboard</h2></div>;

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen text-royal-gold">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>

            <Route path="/login" element={<PortalSelectionPage />} />
            <Route path="/user/login" element={<UserLoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/team/login" element={<TeamLoginPage />} />

            <Route path="/" element={<LandingPage />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />
              <Route path="cases" element={<CasesPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="calculator" element={<CalculatorPage />} />
              <Route path="workers" element={<WorkerManagementPage />} />
              <Route path="transactions" element={<TransactionListPage />} />
              <Route path="worker-dashboard" element={<WorkerDashboard />} />
              <Route path="collect/:id" element={<CollectionPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="admin/users" element={<AdminUserManagement />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
