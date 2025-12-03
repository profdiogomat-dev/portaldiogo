import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Quiz, Question, Subject } from '../types';
import { Button, Card, Input, Textarea, Select, Modal } from '../components/ui';
import { ArrowLeft, Plus, Save, Trash2, Upload, Image as ImageIcon } from 'lucide-react';

export const AdminQuizEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = React.useState<Quiz | null>(null);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  
  // Edit/Create State
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<Partial<Question>>({
    options: { A: '', B: '', C: '', D: '' },
    optionsHtml: {},
    correctOption: 'A',
    tags: [],
    type: 'alternativas',
    textHtml: ''
  });

  // Import State
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [importText, setImportText] = React.useState('');
  const [isBaseOpen, setIsBaseOpen] = React.useState(false);
  const [baseHtml, setBaseHtml] = React.useState('');
  

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

  const stripHtml = (html: string) => html ? html.replace(/<[^>]+>/g, '').replace(/\s+/g,' ').trim() : '';

  const RichEditor: React.FC<{ value?: string; onChange: (html: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const fileRef = React.useRef<HTMLInputElement>(null);
    React.useEffect(() => { if (ref.current) ref.current.innerHTML = value || ''; }, [value]);
    const exec = (cmd: string, arg?: string) => { document.execCommand(cmd, false, arg); onChange(ref.current?.innerHTML || ''); };
    const insertTable = () => { document.execCommand('insertHTML', false, '<table border="1" style="border-collapse:collapse;width:100%"><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></table>'); onChange(ref.current?.innerHTML || ''); };
    const triggerImage = () => { fileRef.current?.click(); };
    const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => { document.execCommand('insertImage', false, r.result as string); onChange(ref.current?.innerHTML || ''); };
      r.readAsDataURL(f);
      e.target.value = '';
    };
    const isEmpty = !stripHtml(value || '');
    const previewRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      const el = previewRef.current;
      if ((window as any).MathJax && (window as any).MathJax.typesetPromise && el) {
        (window as any).MathJax.typesetPromise([el]).catch(() => {});
      }
    }, [value]);
    return (
      <div className="relative">
        <div className="flex gap-2 mb-2">
          <Button type="button" variant="outline" onClick={() => exec('bold')}>B</Button>
          <Button type="button" variant="outline" onClick={() => exec('italic')}>I</Button>
          <Button type="button" variant="outline" onClick={() => exec('underline')}>U</Button>
          <Button type="button" variant="outline" onClick={() => exec('strikeThrough')}>S</Button>
          <Button type="button" variant="outline" onClick={() => exec('subscript')}>Sub</Button>
          <Button type="button" variant="outline" onClick={() => exec('superscript')}>Sup</Button>
          <Button type="button" variant="outline" onClick={() => exec('justifyLeft')}>⟸</Button>
          <Button type="button" variant="outline" onClick={() => exec('justifyCenter')}>⇔</Button>
          <Button type="button" variant="outline" onClick={() => exec('justifyRight')}>⟹</Button>
          <Button type="button" variant="outline" onClick={() => exec('justifyFull')}>≡</Button>
          <Button type="button" variant="outline" onClick={insertTable}>Tabela</Button>
          <Button type="button" variant="outline" onClick={triggerImage}>Imagem</Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
        </div>
        {isEmpty && placeholder && (
          <div className="absolute left-2 top-[52px] text-slate-400 pointer-events-none select-none">{placeholder}</div>
        )}
        <div
          ref={ref}
          className="min-h-28 border rounded p-2 bg-white"
          contentEditable
          onInput={() => onChange(ref.current?.innerHTML || '')}
        />
        <div ref={previewRef} className="mt-2 text-sm text-slate-600">
          <div className="font-medium mb-1">Prévia</div>
          <div dangerouslySetInnerHTML={{ __html: value || '' }} />
        </div>
      </div>
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (formData.type === 'alternativas') {
      if (!formData.textHtml || !formData.optionsHtml?.A || !formData.optionsHtml?.B) { alert('Preencha o enunciado e pelo menos as opções A e B.'); return; }
    } else {
      if (!formData.textHtml) { alert('Preencha o enunciado.'); return; }
    }

    const questionData: any = {
        quizId: id,
        text: stripHtml(formData.textHtml || ''),
        textHtml: formData.textHtml || '',
        options: {
          A: stripHtml(formData.optionsHtml?.A || ''),
          B: stripHtml(formData.optionsHtml?.B || ''),
          C: stripHtml(formData.optionsHtml?.C || ''),
          D: stripHtml(formData.optionsHtml?.D || ''),
        },
        optionsHtml: formData.optionsHtml || {},
        correctOption: formData.correctOption,
        explanation: formData.explanation || '',
        imageUrl: formData.imageUrl || '',
        tags: (formData.tags || []),
        type: formData.type,
        answerPlaceholder: formData.answerPlaceholder || ''
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
        optionsHtml: {},
        correctOption: 'A',
        text: '',
        textHtml: '',
        explanation: '',
        imageUrl: '',
        tags: [],
        type: 'alternativas',
        answerPlaceholder: ''
    });
  };

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setFormData({
      ...q,
      textHtml: q.textHtml || q.text,
      optionsHtml: q.optionsHtml || q.options,
      type: q.type || 'alternativas'
    });
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
                <div className="flex items-center justify-between">
                  <Button type="button" onClick={() => setIsBaseOpen(true)}>Adicionar texto base</Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Formato de resposta:</span>
                    <div className="flex gap-1">
                      <Button type="button" variant={formData.type === 'alternativas' ? 'outline' : 'ghost'} onClick={() => setFormData({...formData, type: 'alternativas'})}>Com Alternativas</Button>
                      <Button type="button" variant={formData.type === 'discursiva' ? 'outline' : 'ghost'} onClick={() => setFormData({...formData, type: 'discursiva'})}>Discursiva</Button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Enunciado</label>
                  <RichEditor value={formData.textHtml || ''} onChange={(html) => setFormData({...formData, textHtml: html})} placeholder="Digite o enunciado aqui" />
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

                {formData.type === 'alternativas' && (
                  <div id="alternativas-container" className="space-y-4">
                    {(['A','B','C','D'] as const).map(opt => (
                      <div key={opt} className="alternativa flex items-start gap-3">
                        <div className="alternativa-label mt-1">
                          <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">{opt}</span>
                        </div>
                        <div className="alternativa-editor flex-1">
                          <RichEditor value={formData.optionsHtml?.[opt] || ''} placeholder={`Digite a alternativa ${opt} aqui`} onChange={(html) => setFormData({
                            ...formData,
                            optionsHtml: { ...(formData.optionsHtml || {}), [opt]: html },
                            options: { ...(formData.options || { A:'',B:'',C:'',D:'' }), [opt]: stripHtml(html) }
                          })} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {formData.type === 'alternativas' && (
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
                  )}
                  <div>
                    <label className="text-sm font-medium text-slate-700">Explicação (Opcional)</label>
                    <Input 
                      value={formData.explanation || ''} 
                      onChange={e => setFormData({...formData, explanation: e.target.value})} 
                      placeholder="Aparece após responder..."
                    />
                  </div>
                </div>

                {formData.type === 'discursiva' && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Resposta discursiva (placeholder)</label>
                    <Input value={formData.answerPlaceholder || ''} onChange={e => setFormData({...formData, answerPlaceholder: e.target.value})} placeholder="Digite aqui" />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-slate-700">Assuntos (tags, separado por vírgula)</label>
                  <Input 
                    value={(formData.tags || []).join(', ')}
                    onChange={e => {
                      const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setFormData({...formData, tags: arr});
                    }}
                    placeholder="ex: Frações, Equações, Química Geral"
                  />
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
                            <div className="font-medium text-slate-900 line-clamp-2" dangerouslySetInnerHTML={{ __html: q.textHtml || q.text }} />
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(q)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><EditIcon size={16}/></button>
                              <button onClick={() => handleDelete(q.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        {q.imageUrl && <img src={q.imageUrl} className="h-16 object-contain border rounded bg-slate-50" alt="Questão" />}
                        {q.type !== 'discursiva' && (
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                            {(['A','B','C','D'] as const).map(k => (
                              <div key={k} className={k === q.correctOption ? "text-emerald-700 font-medium" : ""}>
                                <span className="font-bold text-xs mr-1">{k})</span>
                                <span dangerouslySetInnerHTML={{ __html: (q.optionsHtml && q.optionsHtml[k]) || q.options[k] }} />
                              </div>
                            ))}
                          </div>
                        )}
                        {q.tags && q.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {q.tags.map(t => (
                              <span key={t} className="text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200">{t}</span>
                            ))}
                          </div>
                        )}
                    </div>
                </Card>
            ))}
        </div>

        {/* Import Modal (Texto) */}
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
                <div className="flex justify-end">
                  <Button onClick={handleImport}>Processar</Button>
                </div>
            </div>
        </Modal>

        <Modal isOpen={isBaseOpen} onClose={() => setIsBaseOpen(false)} title="Texto base da questão">
          <div className="space-y-4">
            <RichEditor value={baseHtml} onChange={setBaseHtml} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBaseOpen(false)}>Fechar</Button>
              <Button onClick={() => { setFormData({ ...formData, textHtml: (baseHtml || '') + (formData.textHtml || '') }); setIsBaseOpen(false); }}>Aplicar ao enunciado</Button>
            </div>
          </div>
        </Modal>
    </div>
  );
};

const EditIcon = ({size}:{size?:number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size||24} height={size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
