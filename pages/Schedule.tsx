import React from 'react';
import { Card, Button } from '../components/ui';
import { Calendar as CalendarIcon, Clock, ExternalLink } from 'lucide-react';

export const Schedule = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Agendar Aula</h1>
      <Card className="p-8 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="text-indigo-600" size={32} />
        </div>
        <h2 className="text-xl font-semibold mb-2">Google Calendar</h2>
        <p className="text-slate-500 mb-8">
            Verifique a disponibilidade e agende sua aula particular diretamente na nossa agenda do Google.
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

        <Button 
            onClick={() => window.open('https://calendar.google.com', '_blank')}
            className="w-full sm:w-auto gap-2"
        >
            <ExternalLink size={18} />
            Abrir Agenda
        </Button>
      </Card>
    </div>
  );
};