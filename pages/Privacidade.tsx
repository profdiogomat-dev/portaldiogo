import React from 'react';
import { Card } from '../components/ui';

export const Privacidade = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Políticas de Privacidade e Uso</h1>
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Resumo</h2>
        <p className="text-sm text-slate-700">
          Este portal coleta e utiliza dados estritamente necessários para funcionamento
          acadêmico e agendamento de aulas. As práticas seguem a legislação brasileira
          aplicável, incluindo a Lei Geral de Proteção de Dados Pessoais (LGPD).
        </p>
        <h3 className="font-medium">Dados coletados</h3>
        <ul className="list-disc ml-5 text-sm text-slate-700">
          <li>Identificação básica: nome, usuário, série.</li>
          <li>Contato opcional: e-mail e telefone.</li>
          <li>Uso acadêmico: listas, questões, tentativas, resultados e agendamentos.</li>
        </ul>
        <h3 className="font-medium">Finalidade</h3>
        <ul className="list-disc ml-5 text-sm text-slate-700">
          <li>Organizar conteúdo e atividades por série.</li>
          <li>Registrar desempenho para feedback pedagógico.</li>
          <li>Agendar e gerenciar aulas.</li>
        </ul>
        <h3 className="font-medium">Bases legais (LGPD)</h3>
        <ul className="list-disc ml-5 text-sm text-slate-700">
          <li>Execução de contrato/prestação de serviços educacionais.</li>
          <li>Legítimo interesse para melhoria do serviço, sem prejuízo à privacidade.</li>
          <li>Consentimento quando aplicável, especialmente em comunicações.</li>
        </ul>
        <h3 className="font-medium">Compartilhamento</h3>
        <p className="text-sm text-slate-700">
          Os dados são armazenados em provedores de nuvem confiáveis. Não há
          venda ou compartilhamento indevido. O acesso é restrito ao professor
          e, quando necessário, aos próprios alunos para suas atividades.
        </p>
        <h3 className="font-medium">Segurança</h3>
        <p className="text-sm text-slate-700">
          Medidas técnicas e administrativas são adotadas para proteger informações.
          O acesso administrativo é limitado. Funcionalidades públicas não expõem
          dados sensíveis de alunos.
        </p>
        <h3 className="font-medium">Direitos do titular</h3>
        <ul className="list-disc ml-5 text-sm text-slate-700">
          <li>Acesso, correção e exclusão de dados pessoais.</li>
          <li>Portabilidade quando aplicável.</li>
          <li>Revogação de consentimento e oposição ao tratamento.</li>
        </ul>
        <h3 className="font-medium">Contato do responsável</h3>
        <p className="text-sm text-slate-700">
          Prof Diogo Spera — WhatsApp: <a href="https://wa.me/5566992299439" target="_blank" rel="noreferrer" className="text-indigo-600">(66) 99229-9439</a>
        </p>
      </Card>
    </div>
  );
};
