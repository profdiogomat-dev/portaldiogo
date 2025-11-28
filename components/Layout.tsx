import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, BookOpen, Users, BarChart2, Settings, Home, Menu, X, Database, Calendar } from 'lucide-react';
import { Role, User } from '../types';
import { cn } from './ui';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const teacherLinks = [
    { href: '/', label: 'Início', icon: Home },
    { href: '/admin/quizzes', label: 'Listas & Questões', icon: BookOpen },
    { href: '/admin/users', label: 'Alunos & Turmas', icon: Users },
    { href: '/schedule', label: 'Agendar Aula', icon: Calendar },
    { href: '/admin/tools', label: 'Ferramentas', icon: Database },
  ];

  const studentLinks = [
    { href: '/', label: 'Início', icon: Home },
    { href: '/quizzes', label: 'Listas de Exercícios', icon: BookOpen },
    { href: '/schedule', label: 'Agendar Aula', icon: Calendar },
    { href: '/profile', label: 'Meu Perfil', icon: Settings },
  ];

  const links = user.role === Role.Teacher ? teacherLinks : studentLinks;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white fixed inset-y-0 z-10">
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Portal da Turma
          </span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 h-16 bg-white border-b flex items-center justify-between px-4">
        <span className="text-lg font-bold text-indigo-700">Portal</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
           {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-10 bg-white pt-16 md:hidden px-4 pb-8 space-y-2">
            {links.map((link) => (
                <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block p-3 rounded-lg bg-slate-50 font-medium text-slate-800"
                >
                    {link.label}
                </Link>
            ))}
             <button
                onClick={onLogout}
                className="w-full text-left p-3 rounded-lg bg-red-50 text-red-700 font-medium mt-4"
            >
                Sair
            </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:pl-64 pt-16 md:pt-0">
        <div className="mx-auto max-w-6xl p-4 md:p-8">
            {children}
        </div>
      </main>
    </div>
  );
};