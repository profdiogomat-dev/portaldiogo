import React from 'react';
import { Card, Button, Input, Select } from '../components/ui';
import { Calendar as CalendarIcon, Clock, ExternalLink } from 'lucide-react';
import { db } from '../services/db';
import { Role } from '../types';

export const Schedule = () => {
  const [date, setDate] = React.useState('');
  const [slots, setSlots] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState('');
  const [userRole, setUserRole] = React.useState<Role | null>(null);
  const [userId, setUserId] = React.useState<string>('');

  React.useEffect(() => {
    const u = localStorage.getItem('currentUser');
    if (u) {
      const parsed = JSON.parse(u);
      setUserRole(parsed.role);
      setUserId(parsed.id);
    }
  }, []);

  const computeSlots = (d: string) => {
    if (!d) { setSlots([]); return; }
    const dt = new Date(d + 'T00:00:00');
    const day = dt.getDay();
    let hours: number[] = [];
    if (day >= 1 && day <= 5) {
      hours = [14,15,16,17,18,19,20];
    } else if (day === 6) {
      hours = [8,9,10,11,12];
    } else {
      hours = [];
    }
    const booked = db.getAppointments(d).map(a => a.dateTime.split('T')[1].slice(0,5));
    const available = hours
      .map(h => String(h).padStart(2,'0') + ':00')
      .filter(hh => !booked.includes(hh));
    setSlots(available);
  };

  const handleDateChange = (v: string) => {
    setDate(v);
    setSelected('');
    computeSlots(v);
  };

  const handleSchedule = () => {
    if (!date || !selected || !userId) return;
    const iso = `${date}T${selected}:00`;
    db.addAppointment({ userId, dateTime: iso, durationMin: 50 });
    const teacher = db.getUsers().find(u => u.role === Role.Teacher);
    const email = teacher?.email || 'prof@example.com';
    const subject = encodeURIComponent('Nova aula agendada');
    const body = encodeURIComponent(`Aluno: ${userId}\nData: ${date}\nHorário: ${selected}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    alert('Aula agendada. Você receberá confirmação por email.');
    setSelected('');
    computeSlots(date);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Agendar Aula</h1>
      <Card className="p-8 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarIcon className="text-indigo-600" size={32} />
        </div>
        <h2 className="text-xl font-semibold mb-2">Agendamento</h2>
        <p className="text-slate-500 mb-8">
          Selecione uma data para ver horários disponíveis. Duração: 50 minutos.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-8 text-left max-w-lg mx-auto">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2 mb-1 font-medium text-slate-700">
              <Clock size={16} /> Horários de Atendimento
            </div>
            <p className="text-sm text-slate-500">Seg - Sex: 14h - 20h</p>
            <p className="text-sm text-slate-500">Sáb: 08h - 12h</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2 mb-1 font-medium text-slate-700">
              <CalendarIcon size={16} /> Detalhes da Aula
            </div>
            <p className="text-sm text-slate-500">Duração: 50 minutos</p>
            <p className="text-sm text-slate-500">Modalidade: Online / Presencial</p>
          </div>
        </div>

        {userRole === Role.Teacher ? (
          <Button 
            onClick={() => window.open('https://calendar.google.com', '_blank')}
            className="w-full sm:w-auto gap-2"
          >
            <ExternalLink size={18} />
            Abrir Agenda
          </Button>
        ) : (
          <div className="space-y-4 text-left max-w-lg mx-auto">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <Input type="date" value={date} onChange={e => handleDateChange(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Horário</label>
              <Select value={selected} onChange={e => setSelected(e.target.value)}>
                <option value="">Selecione</option>
                {slots.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSchedule} disabled={!date || !selected}>Agendar</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
