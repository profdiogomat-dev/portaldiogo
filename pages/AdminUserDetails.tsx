import React from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { User, Attendance, Payment, Result } from '../types';
import { Card, Button } from '../components/ui';

export const AdminUserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = React.useState<User | null>(null);
  const [attendance, setAttendance] = React.useState<Attendance[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [results, setResults] = React.useState<Result[]>([]);
  const [attDate, setAttDate] = React.useState('');
  const [attContent, setAttContent] = React.useState('');
  const [payAmount, setPayAmount] = React.useState('');
  const [payDate, setPayDate] = React.useState('');
  const [payMethod, setPayMethod] = React.useState('');
  const [payNotes, setPayNotes] = React.useState('');
  const [attStart, setAttStart] = React.useState('');
  const [attEnd, setAttEnd] = React.useState('');
  const [payStart, setPayStart] = React.useState('');
  const [payEnd, setPayEnd] = React.useState('');
  const [perfStart, setPerfStart] = React.useState('');
  const [perfEnd, setPerfEnd] = React.useState('');

  const load = () => {
    if (!id) return;
    const u = db.getUsers().find(x => x.id === id) || null;
    setUser(u);
    setAttendance(db.getAttendance(id));
    setPayments(db.getPayments(id));
    setResults(db.getResults(id));
  };

  React.useEffect(load, [id]);

  const addAtt = () => {
    if (!id || !attDate) return;
    db.addAttendance({ userId: id, date: attDate, content: attContent });
    setAttDate(''); setAttContent('');
    load();
  };

  const addPay = () => {
    if (!id || !payAmount || !payDate) return;
    db.addPayment({ userId: id, amount: Number(payAmount), date: payDate, method: payMethod, notes: payNotes });
    setPayAmount(''); setPayDate(''); setPayMethod(''); setPayNotes('');
    load();
  };

  const delAtt = (attId: string) => { db.deleteAttendance(attId); load(); };
  const delPay = (payId: string) => { db.deletePayment(payId); load(); };

  const exportCSV = (rows: any[], headers: string[], filename: string) => {
    const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) return <div className="p-6">Usuário não encontrado.</div>;

  const inRange = (d: string, start?: string, end?: string) => {
    if (!d) return false;
    const di = d.length > 10 ? d.slice(0,10) : d;
    if (start && di < start) return false;
    if (end && di > end) return false;
    return true;
  };

  const filteredAttendance = attendance.filter(a => inRange(a.date, attStart || undefined, attEnd || undefined));
  const filteredPayments = payments.filter(p => inRange(p.date, payStart || undefined, payEnd || undefined));
  const totalPayments = filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const quizzesById = new Map(db.getQuizzes().map(q => [q.id, q]));
  const filteredResults = results.filter(r => inRange(r.finishedAt || r.startedAt || '', perfStart || undefined, perfEnd || undefined));
  const performance = filteredResults.map(r => ({
    quizTitle: quizzesById.get(r.quizId)?.title || r.quizId,
    score: r.score,
    total: r.total,
    errors: (r.total - r.score),
    durationSec: r.durationSec,
    startedAt: r.startedAt,
    finishedAt: r.finishedAt,
  }));
  const totalTime = filteredResults.reduce((sum, r) => sum + (r.durationSec || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{user.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Frequência</h3>
            <div className="flex gap-2 items-center">
              <input type="date" className="border rounded h-9 px-2 text-sm" value={attStart} onChange={e => setAttStart(e.target.value)} />
              <span className="text-xs text-slate-500">até</span>
              <input type="date" className="border rounded h-9 px-2 text-sm" value={attEnd} onChange={e => setAttEnd(e.target.value)} />
              <Button variant="outline" onClick={() => exportCSV(filteredAttendance, ['date','content'], `frequencia-${user.name}.csv`)}>Exportar CSV</Button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input type="date" className="border rounded h-10 px-3" value={attDate} onChange={e => setAttDate(e.target.value)} />
              <input className="border rounded h-10 px-3 md:col-span-2" placeholder="Conteúdo da aula" value={attContent} onChange={e => setAttContent(e.target.value)} />
            </div>
            <div className="flex justify-end"><Button onClick={addAtt}>Salvar</Button></div>
            <div className="divide-y border rounded">
              {filteredAttendance.length === 0 && <div className="p-3 text-slate-500 text-sm">Nenhum registro.</div>}
              {filteredAttendance.map(a => (
                <div key={a.id} className="p-3 grid grid-cols-6 text-sm gap-2 items-center">
                  <span className="col-span-1">{a.date}</span>
                  <span className="col-span-4 text-slate-600">{a.content}</span>
                  <button onClick={() => delAtt(a.id)} className="text-red-600 hover:text-red-800 text-right">Excluir</button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pagamentos</h3>
            <div className="flex gap-2 items-center">
              <input type="date" className="border rounded h-9 px-2 text-sm" value={payStart} onChange={e => setPayStart(e.target.value)} />
              <span className="text-xs text-slate-500">até</span>
              <input type="date" className="border rounded h-9 px-2 text-sm" value={payEnd} onChange={e => setPayEnd(e.target.value)} />
              <Button variant="outline" onClick={() => exportCSV(filteredPayments, ['date','amount','method','notes'], `pagamentos-${user.name}.csv`)}>Exportar CSV</Button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <input type="number" className="border rounded h-10 px-3" placeholder="Valor" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
              <input type="date" className="border rounded h-10 px-3" value={payDate} onChange={e => setPayDate(e.target.value)} />
              <input className="border rounded h-10 px-3" placeholder="Método" value={payMethod} onChange={e => setPayMethod(e.target.value)} />
              <input className="border rounded h-10 px-3 md:col-span-2" placeholder="Notas" value={payNotes} onChange={e => setPayNotes(e.target.value)} />
            </div>
            <div className="flex justify-end"><Button onClick={addPay}>Salvar</Button></div>
            <div className="divide-y border rounded">
              {filteredPayments.length === 0 && <div className="p-3 text-slate-500 text-sm">Nenhum registro.</div>}
              {filteredPayments.map(p => (
                <div key={p.id} className="p-3 grid grid-cols-5 text-sm gap-2 items-center">
                  <span>{p.date}</span>
                  <span className="font-medium">R$ {Number(p.amount).toFixed(2)}</span>
                  <span className="text-slate-600">{p.method}</span>
                  <span className="text-slate-600">{p.notes}</span>
                  <button onClick={() => delPay(p.id)} className="text-red-600 hover:text-red-800 text-right">Excluir</button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Relatórios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="border rounded p-3">
            <div className="text-slate-500">Aulas registradas</div>
            <div className="text-2xl font-bold">{attendance.length}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-slate-500">Pagamentos (total)</div>
            <div className="text-2xl font-bold">R$ {totalPayments.toFixed(2)}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-slate-500">Último pagamento</div>
            <div className="text-2xl font-bold">{payments.length ? payments[payments.length-1].date : '-'}</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Desempenho em Listas</h3>
          <div className="flex gap-2 items-center">
            <input type="date" className="border rounded h-9 px-2 text-sm" value={perfStart} onChange={e => setPerfStart(e.target.value)} />
            <span className="text-xs text-slate-500">até</span>
            <input type="date" className="border rounded h-9 px-2 text-sm" value={perfEnd} onChange={e => setPerfEnd(e.target.value)} />
            <Button variant="outline" onClick={() => exportCSV(performance, ['quizTitle','score','total','errors','durationSec','startedAt','finishedAt'], `desempenho-${user.name}.csv`)}>Exportar CSV</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="border rounded p-3 text-sm">
            <div className="text-slate-500">Listas concluídas</div>
            <div className="text-2xl font-bold">{filteredResults.length}</div>
          </div>
          <div className="border rounded p-3 text-sm">
            <div className="text-slate-500">Tempo total de estudo</div>
            <div className="text-2xl font-bold">{Math.round(totalTime/60)} min</div>
          </div>
        </div>
        <div className="divide-y border rounded">
          {performance.length === 0 && <div className="p-3 text-slate-500 text-sm">Nenhum resultado.</div>}
          {performance.map((r, idx) => (
            <div key={idx} className="p-3 grid grid-cols-6 gap-2 text-sm items-center">
              <span className="col-span-2 font-medium">{r.quizTitle}</span>
              <span>{r.score}/{r.total}</span>
              <span className="text-red-600">Erros: {r.errors}</span>
              <span>Duração: {r.durationSec}s</span>
              <span className="text-slate-500">{r.finishedAt?.slice(0,10)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
