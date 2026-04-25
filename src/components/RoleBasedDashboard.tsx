import { useAuth } from '../hooks/useAuth';
import AdminDashboard from '../pages/AdminDashboard';
import FacultyDashboard from '../pages/FacultyDashboard';
import StudentDashboard from '../pages/StudentDashboard';
import LoginForm from './auth/LoginForm';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const RoleBasedDashboard = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={36} className="text-blue-400 animate-spin mx-auto" />
          <p className="mt-4 text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'super_admin':
      case 'admin':
        return <AdminDashboard />;
      case 'faculty':
        return <FacultyDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return <LoginForm />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {renderDashboard()}
    </motion.div>
  );
};

export default RoleBasedDashboard;