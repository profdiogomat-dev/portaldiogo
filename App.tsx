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
import { User, Role, SUBJECT_LABELS } from './types';
import { Button, Card } from './components/ui';
import { CloudSync } from './services/sync';

// Mock list page for students
const StudentQuizzes: React.FC<{ user: User }> = ({ user }) => {
    const compute = () => {
        const all = db.getQuizzes();
        if (!user.grade) return all;
        const filtered = all.filter(q => q.grade === user.grade || q.grade === 'OUTROS');
        return filtered.length ? filtered : all;
    };
    const [quizzes, setQuizzes] = React.useState(compute());
    React.useEffect(() => { setQuizzes(compute()); }, [user.grade]);
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Listas de Exercícios</h1>
            {quizzes.length === 0 ? (
                <Card className="p-6">
                    <p className="text-slate-600 text-sm">Nenhuma lista disponível para sua série.</p>
                </Card>
            ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.map(q => (
                    <Card key={q.id} className="p-6 hover:shadow-lg transition-shadow border-t-4 border-t-indigo-500 cursor-pointer">
                        <h3 className="font-bold text-lg mb-2">{q.title}</h3>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{q.description || 'Sem descrição.'}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded text-slate-600">{SUBJECT_LABELS[q.subject]}</span>
                            <Button onClick={() => window.location.hash = `#/quiz/${q.id}`} variant="outline" className="text-xs h-8">Começar</Button>
                        </div>
                    </Card>
                ))}
            </div>
            )}
        </div>
    )
}

// Simple Admin User Placeholder
const AdminUsers = () => {
    const [users, setUsers] = React.useState(db.getUsers());
    const [file, setFile] = React.useState<File | null>(null);
    const [syncEnabled, setSyncEnabled] = React.useState(CloudSync.enabled);
    const [cloudInfo, setCloudInfo] = React.useState('');
    const [cloudUsers, setCloudUsers] = React.useState<User[]>([]);
    const deleteUser = (id: string) => {
        if(confirm('Remover usuário?')) {
            db.deleteUser(id);
            setUsers(db.getUsers());
        }
    }
    const handleGrade = (id: string, grade: string) => {
        db.updateUser(id, { grade });
        setUsers(db.getUsers());
    };

    const exportDB = () => {
        const data = db.exportDB();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portal-backup.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const importMerge = async () => {
        if (!file) return;
        const text = await file.text();
        db.mergeDB(text);
        setUsers(db.getUsers());
        alert('Dados mesclados. Usuários e listas sincronizados.');
    };

    const syncDown = async () => {
        await db.syncDown();
        setUsers(db.getUsers());
        alert('Sincronização: dados baixados da nuvem.');
    };
    const syncUp = async () => {
        await db.syncUp();
        alert('Sincronização: dados enviados à nuvem.');
    };

    const testConnection = async () => {
        const res = await CloudSync.ping();
        if (!res.ok) {
            setCloudInfo(`Falha na conexão: ${res.error || CloudSync.lastError || 'erro desconhecido'}`);
            return;
        }
        const data = await CloudSync.list('users');
        setCloudUsers(data as any);
        setCloudInfo(`Conexão OK. Users na nuvem: ${data.length}`);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
            <div className="flex gap-2">
                <Button onClick={exportDB}>Exportar Dados</Button>
                <input type="file" accept="application/json" onChange={e => setFile(e.target.files?.[0] || null)} />
                <Button variant="outline" onClick={importMerge} disabled={!file}>Importar/Mesclar</Button>
                {syncEnabled && (
                  <>
                    <Button onClick={syncDown}>Sync Down</Button>
                    <Button variant="outline" onClick={syncUp}>Sync Up</Button>
                    <Button variant="outline" onClick={testConnection}>Testar Conexão</Button>
                  </>
                )}
            </div>
            {syncEnabled && (
              <div className="mt-3 text-sm">
                <div className="p-3 bg-slate-50 border rounded">
                  <div><strong>Status:</strong> {CloudSync.lastError ? `Erro: ${CloudSync.lastError}` : 'Sem erros registrados'}</div>
                  {cloudInfo && <div className="mt-2">{cloudInfo}</div>}
                </div>
                {cloudUsers.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-50 border rounded">
                    <div className="font-medium mb-2">Prévia de usuários da nuvem</div>
                    <ul className="list-disc ml-5">
                      {cloudUsers.slice(0,5).map(u => (
                        <li key={u.id}>{u.username} — {u.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Série</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{u.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {u.role === Role.Student ? (
                                        <select value={u.grade || 'OUTROS'} onChange={e => handleGrade(u.id, e.target.value)} className="border rounded px-2 py-1 text-sm">
                                            <option value="6EF">6º ano EF</option>
                                            <option value="7EF">7º ano EF</option>
                                            <option value="8EF">8º ano EF</option>
                                            <option value="9EF">9º ano EF</option>
                                            <option value="1EM">1ª série EM</option>
                                            <option value="2EM">2ª série EM</option>
                                            <option value="3EM">3ª série EM</option>
                                            <option value="OUTROS">Outros / Não definido</option>
                                        </select>
                                    ) : (
                                        '-'
                                    )}
                                </td>
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
          <Route path="/quizzes" element={<StudentQuizzes user={user} />} />
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
