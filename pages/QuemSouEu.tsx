import React from 'react';
import { Card } from '../components/ui';

export const QuemSouEu = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quem sou eu</h1>
      <Card className="p-6 space-y-4">
        <div className="prose prose-slate max-w-none text-sm">
          <p>
            Sou o professor Diogo, bacharel e licenciado em Química, com pós-graduação em MBA em Petróleo e Gás Natural, e atuo há 16 anos como docente no Ensino Fundamental II e Ensino Médio. Ao longo dessa trajetória, tive a oportunidade de trabalhar com diferentes faixas etárias e realidades escolares, o que me trouxe experiência sólida na área de exatas e um olhar atento às necessidades individuais de cada aluno. Atualmente, sou professor no Colégio Regina Coeli, onde sigo aprimorando minha prática pedagógica e meu compromisso com a educação de qualidade.
          </p>
          <p>
            Minha metodologia de trabalho é dinâmica, tecnológica e ativa, sempre buscando envolver o estudante no processo de aprendizagem de forma participativa e significativa. Trabalho com acompanhamento educacional individualizado, focado tanto na recuperação de defasagens curriculares quanto no aperfeiçoamento dos conteúdos, reforçando a base para que o aluno ganhe confiança e autonomia. Atuo na preparação para vestibulares, Programa de Avaliação Seriada (PAS), ENEM e demais processos seletivos, sempre com planejamento estruturado e metas claras.
          </p>
          <p>
            Os atendimentos são realizados em sala própria, em um ambiente seguro, tranquilo e confortável, pensado para favorecer a concentração e o aprendizado. Ofereço flexibilidade de horários, buscando conciliar a rotina escolar e familiar dos estudantes, para que o estudo se torne parte natural do dia a dia, e não apenas uma obrigação. Meu objetivo é caminhar ao lado do aluno e da família, construindo juntos um percurso acadêmico mais leve, eficiente e cheio de oportunidades.
          </p>
        </div>
        <div className="text-sm">
          <div>Contato: Prof Diogo Spera</div>
          <div>
            WhatsApp: <a href="https://wa.me/5566992299439" target="_blank" rel="noreferrer" className="text-indigo-600">(66) 99229-9439</a>
          </div>
          <div>Endereço: Av: Porto Alegre, 3414 - Centro Norte - Sorriso MT</div>
          <div>
            <a href="https://www.google.com/maps?q=Av.+Porto+Alegre,+3414+-+Centro+Norte+-+Sorriso,+MT" target="_blank" rel="noreferrer" className="text-indigo-600">
              Ver no Google Maps
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};
