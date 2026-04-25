import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import GatewayPage from './pages/GatewayPage';
import LoginForm from './components/auth/LoginForm';
import SetupWizard from './pages/SetupWizard';
import VendorDashboard from './pages/VendorDashboard';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import { configStore } from './lib/config/store';
import { Loader2 } from 'lucide-react';

const Spinner = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <Loader2 size={32} className="text-blue-400 animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const LoginRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  // If college not configured yet, send back to gateway
  if (!configStore.isReady()) return <Navigate to="/" replace />;
  return <LoginForm />;
};

function AppRoutes() {
  const location = useLocation();

  // Vendor console is always accessible — gated by vendor code in the UI
  if (location.pathname === '/vendor') return <VendorDashboard />;

  return (
    <Routes>
      {/* Gateway — first screen for everyone */}
      <Route path="/" element={<GatewayPage />} />

      {/* Login — only accessible after college is configured */}
      <Route path="/login" element={<LoginRoute />} />

      {/* Setup wizard — gated by vendor access code inside the component */}
      <Route path="/setup" element={<SetupWizard onComplete={() => window.location.replace('/login')} />} />

      {/* Protected dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><RoleBasedDashboard /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
            success: { style: { background: '#0f2e1e', borderColor: '#22c55e', color: '#86efac' } },
            error: { style: { background: '#2e0f0f', borderColor: '#ef4444', color: '#fca5a5' } },
          }}
        />
      </Router>
    </AuthProvider>
  );
}
