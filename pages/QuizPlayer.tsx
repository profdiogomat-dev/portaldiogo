import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Quiz, Question } from '../types';
import { Button, Card, cn } from '../components/ui';
import { Check, X, ArrowRight, ArrowLeft } from 'lucide-react';

export const QuizPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = React.useState<Quiz | null>(null);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [mode, setMode] = React.useState<'simulated' | 'step'>('simulated');
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [stepFeedback, setStepFeedback] = React.useState<{isCorrect: boolean, show: boolean}>({ isCorrect: false, show: false });
  const [submitted, setSubmitted] = React.useState(false);
  const [score, setScore] = React.useState(0);

  React.useEffect(() => {
    if (id) {
      const q = db.getQuizzes().find(x => x.id === id);
      if (q) {
        setQuiz(q);
        setQuestions(db.getQuestions(id));
      }
    }
  }, [id]);

  if (!quiz) return <div className="p-8 text-center">Carregando lista...</div>;

  const currentQ = questions[currentIdx];
  const total = questions.length;
  const progress = ((currentIdx + 1) / total) * 100;

  const handleSelect = (option: string) => {
    if (submitted) return;
    if (mode === 'step' && stepFeedback.show) return; // Lock if showing feedback

    setAnswers(prev => ({ ...prev, [currentQ.id]: option }));
  };

  const checkStep = () => {
    const chosen = answers[currentQ.id];
    if (!chosen) return;
    const isCorrect = chosen === currentQ.correctOption;
    setStepFeedback({ show: true, isCorrect });
  };

  const nextQuestion = () => {
    setStepFeedback({ show: false, isCorrect: false });
    if (currentIdx < total - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
        finishQuiz();
    }
  };

  const finishQuiz = () => {
    let s = 0;
    questions.forEach(q => {
        if (answers[q.id] === q.correctOption) s++;
    });
    setScore(s);
    setSubmitted(true);
    // Save Result
    const userJson = localStorage.getItem('currentUser');
    if(userJson) {
        const u = JSON.parse(userJson);
        db.saveResult({
            userId: u.id,
            quizId: quiz.id,
            score: s,
            total: total,
            details: questions.map(q => ({
                questionId: q.id,
                chosen: answers[q.id] || '',
                isCorrect: answers[q.id] === q.correctOption
            }))
        });
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-8 text-center space-y-4">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-3xl">🎉</div>
          <h2 className="text-2xl font-bold text-slate-900">Resultado Final</h2>
          <p className="text-slate-600">Você acertou <strong className="text-indigo-600 text-xl">{score}</strong> de {total} questões.</p>
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
            <div className="bg-indigo-600 h-full" style={{ width: `${(score/total)*100}%` }}></div>
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" onClick={() => navigate('/quizzes')}>Voltar para Listas</Button>
            <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
          </div>
        </Card>

        <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-800 px-1">Gabarito</h3>
            {questions.map((q, idx) => {
                const chosen = answers[q.id];
                const correct = q.correctOption;
                const isCorrect = chosen === correct;
                return (
                    <Card key={q.id} className={cn("p-4 border-l-4", isCorrect ? "border-l-emerald-500" : "border-l-red-500")}>
                        <div className="flex gap-3">
                            <span className="font-bold text-slate-400">#{idx+1}</span>
                            <div className="flex-1">
                                <p className="font-medium mb-2">{q.text}</p>
                                <div className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {Object.entries(q.options).map(([key, val]) => (
                                        <div key={key} className={cn(
                                            "px-3 py-2 rounded border",
                                            key === correct ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                                            (key === chosen && !isCorrect) ? "bg-red-50 border-red-200 text-red-800" : "border-slate-100 text-slate-500"
                                        )}>
                                            <span className="font-bold mr-2">{key})</span> {val}
                                        </div>
                                    ))}
                                </div>
                                {q.explanation && !isCorrect && (
                                    <div className="mt-3 p-3 bg-slate-50 rounded text-sm text-slate-600">
                                        <strong>Explicação:</strong> {q.explanation}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                )
            })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/quizzes')} className="text-slate-500 gap-2 pl-0">
                <ArrowLeft size={16}/> Sair
            </Button>
            <div className="flex gap-2">
                <span className={cn("px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors border", mode === 'simulated' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600')} onClick={() => setMode('simulated')}>Simulado</span>
                <span className={cn("px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors border", mode === 'step' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600')} onClick={() => setMode('step')}>Passo a passo</span>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full mb-6">
            <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Question Card */}
        <Card className="p-6 md:p-8 min-h-[400px] flex flex-col">
            <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-bold text-indigo-600 tracking-wider uppercase">Questão {currentIdx + 1}</span>
                    <span className="text-xs text-slate-400">{questions.length - currentIdx - 1} restantes</span>
                </div>
                
                <h3 className="text-lg md:text-xl font-medium text-slate-900 mb-6 leading-relaxed">
                    {currentQ.text}
                </h3>
                {currentQ.imageUrl && (
                    <img src={currentQ.imageUrl} alt="Questão" className="mb-6 max-h-64 rounded-lg object-contain border" />
                )}

                <div className="space-y-3">
                    {Object.entries(currentQ.options).map(([key, val]) => {
                        const isSelected = answers[currentQ.id] === key;
                        let stateClass = "border-slate-200 hover:border-indigo-300 hover:bg-slate-50";
                        
                        // Style logic for Step Mode Feedback
                        if (mode === 'step' && stepFeedback.show) {
                            if (key === currentQ.correctOption) stateClass = "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500";
                            else if (isSelected && key !== currentQ.correctOption) stateClass = "border-red-500 bg-red-50 ring-1 ring-red-500";
                            else stateClass = "opacity-50 border-slate-100";
                        } else if (isSelected) {
                            stateClass = "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600";
                        }

                        return (
                            <div 
                                key={key}
                                onClick={() => handleSelect(key)}
                                className={cn(
                                    "p-4 rounded-lg border cursor-pointer transition-all flex items-center gap-3",
                                    stateClass
                                )}
                            >
                                <div className={cn(
                                    "w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold",
                                    isSelected || (mode === 'step' && stepFeedback.show && key === currentQ.correctOption) 
                                        ? "bg-white border-transparent shadow-sm" 
                                        : "bg-slate-100 text-slate-500 border-slate-200"
                                )}>
                                    {key}
                                </div>
                                <span className="text-slate-700">{val}</span>
                                {mode === 'step' && stepFeedback.show && key === currentQ.correctOption && <Check size={16} className="text-emerald-600 ml-auto" />}
                                {mode === 'step' && stepFeedback.show && isSelected && key !== currentQ.correctOption && <X size={16} className="text-red-600 ml-auto" />}
                            </div>
                        )
                    })}
                </div>

                {/* Feedback Box (Step Mode) */}
                {mode === 'step' && stepFeedback.show && (
                    <div className={cn("mt-6 p-4 rounded-lg text-sm", stepFeedback.isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800")}>
                        <p className="font-bold mb-1">{stepFeedback.isCorrect ? "Correto! 🎉" : "Incorreto"}</p>
                        {currentQ.explanation && <p>{currentQ.explanation}</p>}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100">
                <Button variant="outline" onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}>
                    Anterior
                </Button>

                {mode === 'step' && !stepFeedback.show ? (
                    <Button onClick={checkStep} disabled={!answers[currentQ.id]}>
                        Conferir
                    </Button>
                ) : (
                    <Button onClick={nextQuestion} className="gap-2">
                        {currentIdx === total - 1 ? (mode === 'simulated' ? 'Finalizar Simulado' : 'Ver Resultados') : 'Próxima'}
                        <ArrowRight size={16} />
                    </Button>
                )}
            </div>
        </Card>
    </div>
  );
};