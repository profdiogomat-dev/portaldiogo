import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Quiz, Question } from '../types';
import { Button, Card, Input, Textarea, Select, Modal } from '../components/ui';
import { ArrowLeft, Plus, Save, Trash2, Upload, Image as ImageIcon, FileDown } from 'lucide-react';
import { parsePdfQuestions } from '../services/pdf';

export const AdminQuizEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = React.useState<Quiz | null>(null);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  
  // Edit/Create State
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<Partial<Question>>({
    options: { A: '', B: '', C: '', D: '' },
    correctOption: 'A'
  });

  // Import State
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [importText, setImportText] = React.useState('');
  const [pdfPreview, setPdfPreview] = React.useState<any[]>([]);
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);

  const load = () => {
    if (id) {
      const q = db.getQuizzes().find(x => x.id === id);
      if (q) {
        setQuiz(q);
        setQuestions(db.getQuestions(id));
      }
    }
  };

  React.useEffect(load, [id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if(!id || !formData.text || !formData.options?.A || !formData.options?.B) {
        alert("Preencha o enunciado e pelo menos as opções A e B.");
        return;
    }

    const questionData: any = {
        quizId: id,
        text: formData.text,
        options: formData.options,
        correctOption: formData.correctOption,
        explanation: formData.explanation || '',
        imageUrl: formData.imageUrl || ''
    };

    if(editingId) {
        db.updateQuestion(editingId, questionData);
    } else {
        db.createQuestion(questionData);
    }

    resetForm();
    load();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
        options: { A: '', B: '', C: '', D: '' },
        correctOption: 'A',
        text: '',
        explanation: '',
        imageUrl: ''
    });
  };

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setFormData(q);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (qid: string) => {
    if(confirm('Apagar esta questão?')) {
        db.deleteQuestion(qid);
        load();
    }
  };

  const handleImport = () => {
    if(!id) return;
    const blocks = importText.split(/\n-{3,}\n/);
    let count = 0;
    
    blocks.forEach(block => {
        const lines = block.trim();
        if(!lines) return;
        
        const q: any = { options: {} };
        const qMatch = lines.match(/PERGUNTA:\s*(.+)/i);
        if(qMatch) q.text = qMatch[1].trim();
        
        ['A','B','C','D'].forEach(opt => {
            const match = lines.match(new RegExp(`\n${opt}\\)\\s*(.+)`, 'i'));
            if(match) q.options[opt] = match[1].trim();
        });

        const correctMatch = lines.match(/CORRETA:\s*([ABCD])/i);
        if(correctMatch) q.correctOption = correctMatch[1].toUpperCase();

        const expMatch = lines.match(/EXPLICACAO:\s*(.+)/is);
        if(expMatch) q.explanation = expMatch[1].trim();

        if(q.text && q.options.A && q.options.B && q.correctOption) {
            db.createQuestion({ ...q, quizId: id });
            count++;
        }
    });
    
    alert(`Importadas ${count} questões.`);
    setIsImportOpen(false);
    setImportText('');
    load();
  };

  const handlePdfPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPdfFile(file);
    setPdfPreview([]);
    if (!file || !id) return;
    const parsed = await parsePdfQuestions(file);
    setPdfPreview(parsed);
  };
  const importPdfParsed = () => {
    if (!id || pdfPreview.length === 0) return;
    let count = 0;
    pdfPreview.forEach((q: any) => {
      if (q.text && q.options?.A && q.options?.B) {
        db.createQuestion({ quizId: id, text: q.text, options: q.options, correctOption: q.correctOption || 'A', explanation: '', imageUrl: q.imageUrl || '' });
        count++;
      }
    });
    alert(`Importadas ${count} questões do PDF.`);
    setIsImportOpen(false);
    setPdfFile(null);
    setPdfPreview([]);
    load();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!quiz) return <div className="p-8">Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/admin/quizzes')}>
                    <ArrowLeft size={18} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
                    <p className="text-slate-500 text-sm">Gerenciando {questions.length} questões</p>
                </div>
            </div>
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                <Upload size={18} className="mr-2"/> Importar
            </Button>
        </div>

        {/* Editor Form */}
        <Card className="p-6 border-indigo-200 shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    {editingId ? <><EditIcon/> Editando Questão</> : <><Plus/> Nova Questão</>}
                </h2>
                {editingId && <Button variant="ghost" onClick={resetForm} className="text-xs">Cancelar Edição</Button>}
            </div>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-slate-700">Enunciado</label>
                    <Textarea 
                        required
                        value={formData.text || ''} 
                        onChange={e => setFormData({...formData, text: e.target.value})} 
                        placeholder="Digite a pergunta aqui..."
                    />
                </div>
                
                {/* Image Upload Mock */}
                <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Imagem (Opcional)</label>
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-slate-50 text-sm text-slate-700">
                            <ImageIcon size={16}/> Escolher arquivo
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                        {formData.imageUrl && (
                            <div className="flex items-center gap-2">
                                <img src={formData.imageUrl} alt="Preview" className="h-10 w-10 object-cover rounded border" />
                                <button type="button" onClick={() => setFormData({...formData, imageUrl: ''})} className="text-xs text-red-500">Remover</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(['A','B','C','D'] as const).map(opt => (
                        <div key={opt}>
                            <label className="text-xs font-bold text-slate-500 mb-1 block">Opção {opt}</label>
                            <Input 
                                value={formData.options?.[opt] || ''} 
                                onChange={e => setFormData({
                                    ...formData, 
                                    options: { ...formData.options!, [opt]: e.target.value }
                                })}
                                required={opt === 'A' || opt === 'B'}
                            />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Correta</label>
                        <Select 
                            value={formData.correctOption} 
                            onChange={e => setFormData({...formData, correctOption: e.target.value as any})}
                        >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </Select>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-slate-700">Explicação (Opcional)</label>
                        <Input 
                            value={formData.explanation || ''} 
                            onChange={e => setFormData({...formData, explanation: e.target.value})} 
                            placeholder="Aparece após responder..."
                        />
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <Button type="submit" className="gap-2">
                        <Save size={18} /> Salvar Questão
                    </Button>
                </div>
            </form>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
            {questions.length === 0 && <p className="text-center text-slate-500 py-8">Nenhuma questão adicionada ainda.</p>}
            {questions.map((q, idx) => (
                <Card key={q.id} className="p-4 flex gap-4 hover:border-indigo-300 transition-colors group">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                        {idx + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                            <p className="font-medium text-slate-900 line-clamp-2">{q.text}</p>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(q)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><EditIcon size={16}/></button>
                                <button onClick={() => handleDelete(q.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        {q.imageUrl && <img src={q.imageUrl} className="h-16 object-contain border rounded bg-slate-50" alt="Questão" />}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                            {Object.entries(q.options).map(([k, v]) => (
                                <div key={k} className={k === q.correctOption ? "text-emerald-700 font-medium" : ""}>
                                    <span className="font-bold text-xs mr-1">{k})</span> {v}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            ))}
        </div>

        {/* Import Modal */}
        <Modal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} title="Importar para esta lista">
            <div className="space-y-4">
                <p className="text-xs text-slate-500">
                    Cole as questões abaixo. Separe com <code>---</code>.
                </p>
                <Textarea 
                    className="h-64 font-mono text-xs"
                    value={importText}
                    onChange={e => setImportText(e.target.value)}
                    placeholder={`PERGUNTA: Quanto é 2+2?\nA) 3\nB) 4\nC) 5\nD) 6\nCORRETA: B\n---`}
                />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-slate-50 text-sm text-slate-700">
                      <FileDown size={16}/> PDF
                      <input type="file" className="hidden" accept="application/pdf" onChange={handlePdfPick} />
                    </label>
                    {pdfFile && <span className="text-xs text-slate-500">{pdfFile.name}</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleImport}>Processar</Button>
                    <Button variant="outline" onClick={importPdfParsed} disabled={!pdfPreview.length}>Importar PDF</Button>
                  </div>
                </div>
                {pdfPreview.length > 0 && (
                  <div className="border rounded p-3 max-h-64 overflow-auto text-xs">
                    {pdfPreview.slice(0,10).map((q, i) => (
                      <div key={i} className="mb-2">
                        <div className="font-medium">{String(q.text || '').slice(0,200)}</div>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(q.options || {}).map(([k,v]) => (
                            <div key={k}><span className="font-bold mr-1">{k})</span>{String(v || '').slice(0,120)}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
        </Modal>
    </div>
  );
};

const EditIcon = ({size}:{size?:number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size||24} height={size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
