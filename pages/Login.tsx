import React from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Role, GRADE_OPTIONS } from '../types';
import { Input, Button, Select } from '../components/ui';
import { BookOpen, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

export const Login = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = React.useState(false);
  const [error, setError] = React.useState('');
  
  // Login State
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Register State
  const [regData, setRegData] = React.useState({ name: '', username: '', password: '', grade: 'OUTROS' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = db.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        if(user.blocked) { setError('Acesso bloqueado. Entre em contato com o professor.'); return; }
        onLogin(user);
        navigate('/');
    } else {
        setError('Usuário ou senha incorretos.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if(!regData.name || !regData.username || !regData.password) {
        setError("Preencha todos os campos.");
        return;
    }
    try {
        db.createUser({
            ...regData,
            role: Role.Student,
            blocked: false
        });
        alert('Conta criada com sucesso! Faça login para continuar.');
        setIsRegister(false);
        setError('');
        // Pre-fill login
        setUsername(regData.username);
        setPassword('');
    } catch (err: any) {
        setError(err.message || "Erro ao criar usuário.");
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-[600px]">
            
            {/* Left Column: Visual & Branding */}
            <div className="hidden md:flex md:w-1/2 bg-indigo-600 relative flex-col justify-between p-12 text-white overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                     <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full bg-white blur-3xl"></div>
                     <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-purple-500 blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <BookOpen size={24} className="text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-wide">Portal da Turma</span>
                    </div>
                    <h1 className="text-4xl font-extrabold leading-tight mb-4">
                        Aprenda,<br/>Pratique e<br/>Evolua.
                    </h1>
                    <p className="text-indigo-100 text-lg max-w-sm leading-relaxed">
                        Sua plataforma completa para dominar Matemática e Química com listas interativas e feedback em tempo real.
                    </p>
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                        <CheckCircle2 className="text-emerald-300" />
                        <span className="font-medium">Correção Automática</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                        <TrendingUp className="text-blue-300" />
                        <span className="font-medium">Acompanhe seu Progresso</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                        <Sparkles className="text-amber-300" />
                        <span className="font-medium">Modo Simulado & Estudo</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white relative">
                <div className="max-w-md mx-auto w-full">
                    <div className="mb-8 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">
                            {isRegister ? 'Criar Conta' : 'Bem-vindo(a)'}
                        </h2>
                        <p className="text-slate-500">
                            {isRegister 
                                ? 'Preencha seus dados para começar a estudar.' 
                                : 'Digite suas credenciais para acessar a plataforma.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r shadow-sm animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {isRegister ? (
                        <form onSubmit={handleRegister} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Nome Completo</label>
                                <Input placeholder="Ex: João Silva" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} className="bg-slate-50 border-slate-200 focus:bg-white h-11" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Usuário</label>
                                    <Input placeholder="Login" value={regData.username} onChange={e => setRegData({...regData, username: e.target.value})} className="bg-slate-50 border-slate-200 focus:bg-white h-11" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Série</label>
                                    <Select value={regData.grade} onChange={e => setRegData({...regData, grade: e.target.value})} className="bg-slate-50 border-slate-200 focus:bg-white h-11">
                                        {Object.entries(GRADE_OPTIONS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Senha</label>
                                <Input type="password" placeholder="••••••••" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} className="bg-slate-50 border-slate-200 focus:bg-white h-11" />
                            </div>

                            <Button className="w-full h-12 text-base shadow-lg shadow-indigo-200 mt-2">Cadastrar</Button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Usuário</label>
                                <Input placeholder="Digite seu login" value={username} onChange={e => setUsername(e.target.value)} className="bg-slate-50 border-slate-200 focus:bg-white h-11" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-sm font-semibold text-slate-700">Senha</label>
                                    <span className="text-xs text-indigo-600 cursor-pointer hover:underline">Esqueceu?</span>
                                </div>
                                <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="bg-slate-50 border-slate-200 focus:bg-white h-11" />
                            </div>

                            <Button className="w-full h-12 text-base shadow-lg shadow-indigo-200 mt-2">Entrar</Button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-sm">
                            {isRegister ? 'Já possui uma conta?' : 'Ainda não tem acesso?'}
                            <button 
                                onClick={toggleMode} 
                                className="ml-2 font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                            >
                                {isRegister ? 'Fazer Login' : 'Criar Cadastro'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
