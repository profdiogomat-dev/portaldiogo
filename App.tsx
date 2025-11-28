import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { QuizPlayer } from './pages/QuizPlayer';
import { AdminQuizzes } from './pages/AdminQuizzes';
import { AdminQuizEditor } from './pages/AdminQuizEditor';
import { Schedule } from './pages/Schedule';
import { Layout } from './components/Layout';
import { db } from './services/db';
import { User, Role } from './types';
import { Button, Card } from './components/ui';

// Mock list page for students
const StudentQuizzes = () => {
    const [quizzes, setQuizzes] = React.useState(db.getQuizzes());
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Listas de Exercícios</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.map(q => (
                    <Card key={q.id} className="p-6 hover:shadow-lg transition-shadow border-t-4 border-t-indigo-500 cursor-pointer">
                        <h3 className="font-bold text-lg mb-2">{q.title}</h3>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{q.description || 'Sem descrição.'}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded text-slate-600">{q.subject === 'math' ? 'Matemática' : 'Química'}</span>
                            <Button onClick={() => window.location.hash = `#/quiz/${q.id}`} variant="outline" className="text-xs h-8">Começar</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

// Simple Admin User Placeholder
const AdminUsers = () => {
    const [users, setUsers] = React.useState(db.getUsers());
    const deleteUser = (id: string) => {
        if(confirm('Remover usuário?')) {
            db.deleteUser(id);
            setUsers(db.getUsers());
        }
    }
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{u.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {u.role !== Role.Teacher && <button onClick={() => deleteUser(u.id)} className="text-red-600 hover:text-red-900">Excluir</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function App() {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('currentUser', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  if (!user) {
    return (
        <HashRouter>
            <Routes>
                <Route path="*" element={<Login onLogin={handleLogin} />} />
            </Routes>
        </HashRouter>
    );
  }

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          
          {/* Student Routes */}
          <Route path="/quizzes" element={<StudentQuizzes />} />
          <Route path="/quiz/:id" element={<QuizPlayer />} />
          <Route path="/schedule" element={<Schedule />} />
          
          {/* Admin Routes */}
          {user.role === Role.Teacher && (
            <>
                <Route path="/admin/quizzes" element={<AdminQuizzes />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/quiz/:id" element={<AdminQuizEditor />} />
            </>
          )}

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;