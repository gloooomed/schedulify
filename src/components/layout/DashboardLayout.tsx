import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LogOut, User, GraduationCap, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-rose-500/20 text-rose-400',
  faculty: 'bg-blue-500/20 text-blue-400',
  student: 'bg-emerald-500/20 text-emerald-400',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : '?';

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-400" onClick={() => setMobileNav(!mobileNav)}>
              {mobileNav ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <GraduationCap size={22} className="text-blue-400" />
              <span className="text-white font-bold tracking-tight">Schedulify</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition">
              <Bell size={17} />
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/5 transition"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-white text-sm font-medium leading-none">{user?.first_name} {user?.last_name}</p>
                  <span className={`text-xs capitalize px-1.5 py-0.5 rounded-full ${ROLE_BADGE[user?.role ?? 'student']}`}>
                    {user?.role}
                  </span>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden md:block" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-44 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-slate-400 text-xs">Signed in as</p>
                      <p className="text-white text-sm font-medium truncate">{user?.first_name} {user?.last_name}</p>
                    </div>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-white/5 text-sm transition">
                      <User size={14} /> Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 text-sm transition"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {children}
        </motion.div>
      </main>
    </div>
  );
}