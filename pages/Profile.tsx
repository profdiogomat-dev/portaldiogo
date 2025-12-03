import React from 'react';
import { Card, Button } from '../components/ui';
import { db } from '../services/db';
import { User, SUBJECT_LABELS } from '../types';

export const Profile = () => {
  const [user, setUser] = React.useState<User | null>(null);
  const [recommended, setRecommended] = React.useState<any[]>([]);
  const [results, setResults] = React.useState<any[]>([]);
  const [totalTime, setTotalTime] = React.useState<number>(0);

  React.useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      const all = db.getQuizzes();
      const rec = u.grade ? all.filter(q => q.grade === u.grade || q.grade === 'OUTROS') : all;
      setRecommended(rec.slice(0,6));
      const res = db.getResults(u.id);
      setResults(res.slice(-5).reverse());
      setTotalTime(res.reduce((sum, r) => sum + (r.durationSec || 0), 0));
    }
  }, []);

  if (!user) return <div className="p-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Meu Perfil</h1>

      <Card className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-lg font-semibold">{user.name}</div>
            <div className="text-sm text-slate-500">Série: {user.grade || 'OUTROS'}</div>
          </div>
          <div className="text-sm text-slate-600">Tempo total de estudo: {Math.round(totalTime/60)} min</div>
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Listas recomendadas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommended.map((q) => (
            <Card key={q.id} className="p-4 flex flex-col gap-2">
              <div className="font-medium">{q.title}</div>
              <div className="text-xs text-slate-500">{SUBJECT_LABELS[q.subject]}</div>
              <Button variant="outline" className="text-xs h-8" onClick={() => window.location.hash = `#/quiz/${q.id}`}>Estudar</Button>
            </Card>
          ))}
          {recommended.length === 0 && (
            <Card className="p-4 text-sm text-slate-500">Nenhuma recomendação.</Card>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Últimos resultados</h2>
        <div className="grid gap-2">
          {results.length === 0 && <Card className="p-4 text-sm text-slate-500">Sem resultados.</Card>}
          {results.map(r => (
            <Card key={r.id} className="p-4 flex justify-between items-center">
              <div>
                <div className="font-medium">{db.getQuizzes().find(q => q.id === r.quizId)?.title || r.quizId}</div>
                <div className="text-xs text-slate-500">{new Date(r.date).toLocaleString()}</div>
              </div>
              <div className="text-sm">{r.score}/{r.total}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
