import React from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { User, Attendance, Payment } from '../types';
import { Card, Button } from '../components/ui';

export const AdminUserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = React.useState<User | null>(null);
  const [attendance, setAttendance] = React.useState<Attendance[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [attDate, setAttDate] = React.useState('');
  const [attContent, setAttContent] = React.useState('');
  const [payAmount, setPayAmount] = React.useState('');
  const [payDate, setPayDate] = React.useState('');
  const [payMethod, setPayMethod] = React.useState('');
  const [payNotes, setPayNotes] = React.useState('');

  const load = () => {
    if (!id) return;
    const u = db.getUsers().find(x => x.id === id) || null;
    setUser(u);
    setAttendance(db.getAttendance(id));
    setPayments(db.getPayments(id));
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

  const exportCSV = (rows: any[], headers: string[], filename: string) => {
    const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) return <div className="p-6">Usuário não encontrado.</div>;

  const totalPayments = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{user.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Frequência</h3>
            <Button variant="outline" onClick={() => exportCSV(attendance, ['date','content'], `frequencia-${user.name}.csv`)}>Exportar CSV</Button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input type="date" className="border rounded h-10 px-3" value={attDate} onChange={e => setAttDate(e.target.value)} />
              <input className="border rounded h-10 px-3 md:col-span-2" placeholder="Conteúdo da aula" value={attContent} onChange={e => setAttContent(e.target.value)} />
            </div>
            <div className="flex justify-end"><Button onClick={addAtt}>Salvar</Button></div>
            <div className="divide-y border rounded">
              {attendance.length === 0 && <div className="p-3 text-slate-500 text-sm">Nenhum registro.</div>}
              {attendance.map(a => (
                <div key={a.id} className="p-3 flex justify-between text-sm">
                  <span>{a.date}</span>
                  <span className="text-slate-600">{a.content}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Pagamentos</h3>
            <Button variant="outline" onClick={() => exportCSV(payments, ['date','amount','method','notes'], `pagamentos-${user.name}.csv`)}>Exportar CSV</Button>
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
              {payments.length === 0 && <div className="p-3 text-slate-500 text-sm">Nenhum registro.</div>}
              {payments.map(p => (
                <div key={p.id} className="p-3 grid grid-cols-4 text-sm gap-2">
                  <span>{p.date}</span>
                  <span className="font-medium">R$ {Number(p.amount).toFixed(2)}</span>
                  <span className="text-slate-600">{p.method}</span>
                  <span className="text-slate-600">{p.notes}</span>
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
    </div>
  );
};
