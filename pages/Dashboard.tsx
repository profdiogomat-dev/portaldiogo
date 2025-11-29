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
  const [attUser, setAttUser] = React.useState<string>('');
  const [attDate, setAttDate] = React.useState('');
  const [attContent, setAttContent] = React.useState('');
  const [payUser, setPayUser] = React.useState<string>('');
  const [payAmount, setPayAmount] = React.useState('');
  const [payDate, setPayDate] = React.useState('');
  const [payMethod, setPayMethod] = React.useState('');
  const [payNotes, setPayNotes] = React.useState('');

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
        {user.role === Role.Teacher ? (
             <div className="flex gap-2">
               <Link to="/admin/quizzes"><Button variant="outline">Gerenciar Listas</Button></Link>
               <Link to="/admin/users"><Button>Gerenciar Alunos</Button></Link>
             </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/quizzes"><Button>Minhas Listas</Button></Link>
            <Link to="/schedule"><Button variant="outline">Agendar Aula</Button></Link>
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
        {user.role === Role.Teacher && (
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
        )}

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

      {user.role === Role.Teacher && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Registrar Frequência</h3>
            <div className="space-y-3">
              <select className="border rounded h-10 px-3" value={attUser} onChange={e => setAttUser(e.target.value)}>
                <option value="">Selecione o aluno</option>
                {db.getUsers().filter(u => u.role === Role.Student).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <input className="border rounded h-10 px-3" type="date" value={attDate} onChange={e => setAttDate(e.target.value)} />
              <textarea className="border rounded px-3 py-2 h-24" placeholder="Conteúdo da aula" value={attContent} onChange={e => setAttContent(e.target.value)} />
              <div className="flex justify-end">
                <Button onClick={() => {
                  if (!attUser || !attDate) return;
                  db.addAttendance({ userId: attUser, date: attDate, content: attContent });
                  setAttUser(''); setAttDate(''); setAttContent('');
                  alert('Frequência registrada');
                }}>Salvar</Button>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Registrar Pagamento</h3>
            <div className="space-y-3">
              <select className="border rounded h-10 px-3" value={payUser} onChange={e => setPayUser(e.target.value)}>
                <option value="">Selecione o aluno</option>
                {db.getUsers().filter(u => u.role === Role.Student).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <input className="border rounded h-10 px-3" type="number" placeholder="Valor" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
              <input className="border rounded h-10 px-3" type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
              <input className="border rounded h-10 px-3" placeholder="Método" value={payMethod} onChange={e => setPayMethod(e.target.value)} />
              <input className="border rounded h-10 px-3" placeholder="Notas" value={payNotes} onChange={e => setPayNotes(e.target.value)} />
              <div className="flex justify-end">
                <Button onClick={() => {
                  if (!payUser || !payAmount || !payDate) return;
                  db.addPayment({ userId: payUser, amount: Number(payAmount), date: payDate, method: payMethod, notes: payNotes });
                  setPayUser(''); setPayAmount(''); setPayDate(''); setPayMethod(''); setPayNotes('');
                  alert('Pagamento registrado');
                }}>Salvar</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="mt-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Contato</h3>
          <p className="text-sm">Prof Diogo Spera</p>
          <p className="text-sm">Celular: <a href="https://wa.me/5566992299439" target="_blank" rel="noreferrer" className="text-indigo-600">(66) 99229-9439</a></p>
          <p className="text-sm">Endereço: Av: Porto Alegre, 3414 - Centro Norte - Sorriso MT</p>
          <p className="text-sm"><a href="https://www.google.com/maps?q=Av.+Porto+Alegre,+3414+-+Centro+Norte+-+Sorriso,+MT" target="_blank" rel="noreferrer" className="text-indigo-600">Ver no Google Maps</a></p>
          <div className="mt-3 flex gap-3">
            <Link to="/quem-sou-eu" className="text-sm text-slate-700 underline">Quem sou eu</Link>
            <Link to="/privacidade" className="text-sm text-slate-700 underline">Políticas de Privacidade e Uso</Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
