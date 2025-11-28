import React from 'react';
import { User, Role, Quiz } from '../types';
import { db } from '../services/db';
import { Card, Badge, Button } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FileText, CheckCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = ({ user }: { user: User }) => {
  const [stats, setStats] = React.useState({ users: 0, quizzes: 0, questions: 0, attempts: 0 });
  const [recentQuizzes, setRecentQuizzes] = React.useState<Quiz[]>([]);

  React.useEffect(() => {
    setStats({
      users: db.getUsers().filter(u => u.role === Role.Student).length,
      quizzes: db.getQuizzes().length,
      questions: db.getAllQuestions().length,
      attempts: db.getResults().length
    });
    const quizzes = db.getQuizzes();
    // sort by id desc roughly translates to recent in our mock
    setRecentQuizzes(quizzes.slice(-4).reverse());
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </Card>
  );

  // Mock data for the chart
  const data = [
    { name: 'Seg', attempts: 4 },
    { name: 'Ter', attempts: 7 },
    { name: 'Qua', attempts: 2 },
    { name: 'Qui', attempts: 10 },
    { name: 'Sex', attempts: 5 },
    { name: 'Sab', attempts: 3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Olá, {user.name} 👋</h1>
            <p className="text-slate-500">
                {user.role === Role.Teacher
                ? 'Aqui está o resumo da sua turma hoje.'
                : 'Pronto para aprender algo novo?'}
            </p>
        </div>
        {user.role === Role.Teacher && (
             <div className="flex gap-2">
                 <Link to="/admin/quizzes"><Button variant="outline">Gerenciar Listas</Button></Link>
                 <Link to="/admin/users"><Button>Gerenciar Alunos</Button></Link>
             </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Alunos" value={stats.users} icon={Users} color="bg-blue-500" />
        <StatCard title="Listas Ativas" value={stats.quizzes} icon={FileText} color="bg-indigo-500" />
        <StatCard title="Questões" value={stats.questions} icon={CheckCircle} color="bg-emerald-500" />
        <StatCard title="Tentativas" value={stats.attempts} icon={TrendingUp} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section - Visible mostly to teachers or for general usage stats */}
        <Card className="lg:col-span-2 p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Atividade Recente</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="attempts" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Quizzes Side */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Últimas Listas</h3>
          <div className="space-y-4">
            {recentQuizzes.length === 0 ? (
                <p className="text-slate-500 text-sm">Nenhuma lista encontrada.</p>
            ) : (
                recentQuizzes.map(q => (
                    <div key={q.id} className="flex items-start justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                        <div>
                            <p className="font-medium text-slate-900 line-clamp-1">{q.title}</p>
                            <div className="flex gap-2 mt-1">
                                <Badge color="blue">{q.grade}</Badge>
                                <Badge color={q.subject === 'math' ? 'purple' : 'green'}>
                                    {q.subject === 'math' ? 'Mat' : 'Qui'}
                                </Badge>
                            </div>
                        </div>
                        <Link to={user.role === Role.Teacher ? `/admin/quiz/${q.id}` : `/quiz/${q.id}`}>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <TrendingUp size={16} />
                            </Button>
                        </Link>
                    </div>
                ))
            )}
            <Link to={user.role === Role.Teacher ? "/admin/quizzes" : "/quizzes"} className="block mt-4">
                <Button variant="outline" className="w-full text-xs">Ver Todas</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};