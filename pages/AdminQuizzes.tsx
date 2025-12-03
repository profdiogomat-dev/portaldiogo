import React from 'react';
import { db } from '../services/db';
import { Quiz, Question, Subject, GRADE_OPTIONS, SUBJECT_LABELS } from '../types';
import { Button, Card, Input, Select, Modal, Badge } from '../components/ui';
import * as mammoth from 'mammoth';
import { Trash2, Plus, Edit, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = React.useState<Quiz[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<Quiz>>({ grade: 'OUTROS', subject: Subject.Math });
  
  // Import State
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [importText, setImportText] = React.useState('');
  const [importConfig, setImportConfig] = React.useState({ title: '', grade: 'OUTROS', subject: Subject.Math });
  const [files, setFiles] = React.useState<FileList | null>(null);
  const [isBatch, setIsBatch] = React.useState(false);
  const [progressOpen, setProgressOpen] = React.useState(false);
  const [progressQuizId, setProgressQuizId] = React.useState<string>('');

  // Edit Quiz State
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string>('');
  const [editData, setEditData] = React.useState<{ title: string; grade: string; subject: Subject }>({ title: '', grade: 'OUTROS', subject: Subject.Math });

  const load = () => setQuizzes(db.getQuizzes());
  React.useEffect(load, []);

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza? Isso apagará também os resultados.')) {
        db.deleteQuiz(id);
        load();
    }
  };

  const openEdit = (q: Quiz) => {
    setEditId(q.id);
    setEditData({ title: q.title, grade: q.grade, subject: q.subject });
    setIsEditOpen(true);
  };
  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editData.title || !editData.grade || !editData.subject) return;
    db.updateQuiz(editId, { title: editData.title, grade: editData.grade, subject: editData.subject });
    setIsEditOpen(false);
    setEditId('');
    load();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if(formData.title) {
        db.createQuiz({
            title: formData.title,
            description: formData.description || '',
            grade: formData.grade || 'OUTROS',
            subject: formData.subject || Subject.Math,
            createdBy: 'teacher-1'
        });
        setIsModalOpen(false);
        setFormData({ grade: 'OUTROS', subject: Subject.Math });
        load();
    }
  };

  const parseFromText = (text: string) => {
    // Basic parser based on the PHP logic
    const blocks = text.split(/\n-{3,}\n/);
    const questionsToImport: any[] = [];
    
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
            questionsToImport.push(q);
        }
    });

    if(questionsToImport.length > 0 && importConfig.title) {
        const newQuiz = db.createQuiz({
            title: importConfig.title,
            description: `Importado (${questionsToImport.length} questões)`,
            grade: importConfig.grade,
            subject: importConfig.subject as Subject,
            createdBy: 'teacher-1'
        });
        
        questionsToImport.forEach(q => {
            db.createQuestion({ ...q, quizId: newQuiz.id });
        });
        
        alert(`Sucesso! ${questionsToImport.length} questões importadas.`);
        setIsImportOpen(false);
        setImportText('');
        setFiles(null);
        load();
    } else {
        alert('Falha ao analisar o texto. Verifique o formato.');
    }
  };

  const readFileText = async (file: File) => {
    if (file.name.toLowerCase().endsWith('.docx')) {
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      return result.value;
    }
    return await file.text();
  };

  const parseAndImport = async () => {
    if (files && files.length > 0) {
      if (isBatch) {
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          const text = await readFileText(f);
          const title = f.name.replace(/\.(txt|docx)$/i, '');
          setImportConfig(prev => ({ ...prev, title }));
          parseFromText(text);
        }
        return;
      } else {
        const text = await readFileText(files[0]);
        parseFromText(text);
        return;
      }
    }
    parseFromText(importText);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Gerenciar Listas</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}><Upload size={18} className="mr-2"/> Importar</Button>
            <Button onClick={() => setIsModalOpen(true)}><Plus size={18} className="mr-2"/> Nova Lista</Button>
        </div>
      </div>

      <div className="grid gap-4">
        {quizzes.length === 0 && <Card className="p-8 text-center text-slate-500">Nenhuma lista criada.</Card>}
        {quizzes.map(q => (
            <Card key={q.id} className="p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                    <h3 className="font-semibold text-lg text-slate-900">{q.title}</h3>
                    <div className="flex gap-2 mt-1">
                        <Badge>{GRADE_OPTIONS[q.grade as keyof typeof GRADE_OPTIONS]}</Badge>
                        <Badge color={q.subject === Subject.Math ? 'blue' : 'purple'}>
                            {SUBJECT_LABELS[q.subject]}
                        </Badge>
                        <span className="text-xs text-slate-400 self-center ml-2">ID: {q.id}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link to={`/admin/quiz/${q.id}`}>
                        <Button variant="outline" className="h-9 px-3">Editar Questões</Button>
                    </Link>
                    <Button variant="outline" className="h-9 px-3" onClick={() => openEdit(q)}>
                        <Edit size={18} className="mr-2"/> Editar Lista
                    </Button>
                    <Button variant="ghost" className="h-9 px-3" onClick={() => { setProgressQuizId(q.id); setProgressOpen(true); }}>Progresso</Button>
                    <button onClick={() => handleDelete(q.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                        <Trash2 size={18} />
                    </button>
                </div>
            </Card>
        ))}
      </div>

      {/* CREATE MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Lista">
        <form onSubmit={handleCreate} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <Input value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="Ex: Equações de 1º Grau" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <Input value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Disciplina</label>
                    <Select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value as Subject})}>
                        <option value={Subject.Math}>Matemática</option>
                        <option value={Subject.Chem}>Química</option>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Série</label>
                    <Select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                        {Object.entries(GRADE_OPTIONS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                    </Select>
                </div>
            </div>
            <div className="flex justify-end pt-2">
                <Button type="submit">Criar</Button>
            </div>
        </form>
      </Modal>

      {/* IMPORT MODAL */}
      <Modal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} title="Importar Listas">
        <div className="space-y-4">
            <p className="text-xs text-slate-500">
                Suporte a formato de texto colado, arquivos <code>.txt</code> e <code>.docx</code>. Separe questões com <code>---</code>.
            </p>
            <Input 
                placeholder="Título da nova lista" 
                value={importConfig.title} 
                onChange={e => setImportConfig({...importConfig, title: e.target.value})} 
            />
            <div className="flex gap-2">
                 <Select value={importConfig.subject} onChange={e => setImportConfig({...importConfig, subject: e.target.value as Subject})}>
                    <option value={Subject.Math}>Matemática</option>
                    <option value={Subject.Chem}>Química</option>
                </Select>
                <Select value={importConfig.grade} onChange={e => setImportConfig({...importConfig, grade: e.target.value})}>
                    {Object.entries(GRADE_OPTIONS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </Select>
            </div>
                <div className="flex items-center gap-3">
                  <input type="file" multiple accept=".txt,.docx" onChange={e => setFiles(e.target.files)} />
                  <label className="text-sm flex items-center gap-2">
                    <input type="checkbox" checked={isBatch} onChange={e => setIsBatch(e.target.checked)} />
                    Importar cada arquivo como uma lista separada
                  </label>
                </div>
            <textarea 
                className="w-full h-48 border rounded-md p-2 text-sm font-mono"
                placeholder="Cole o conteúdo aqui..."
                value={importText}
                onChange={e => setImportText(e.target.value)}
            ></textarea>
            <div className="flex justify-end">
                <Button onClick={parseAndImport}>Processar e Criar</Button>
            </div>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Editar Lista">
        <form onSubmit={submitEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <Input value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Disciplina</label>
            <Select value={editData.subject} onChange={e => setEditData({ ...editData, subject: e.target.value as Subject })}>
              <option value={Subject.Math}>Matemática</option>
              <option value={Subject.Chem}>Química</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Série</label>
            <Select value={editData.grade} onChange={e => setEditData({ ...editData, grade: e.target.value })}>
              {Object.entries(GRADE_OPTIONS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
          <div className="flex justify-end pt-2 gap-2">
            <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={progressOpen} onClose={() => setProgressOpen(false)} title="Progresso da Lista">
        <div className="space-y-4">
          {progressQuizId && (
            <ProgressBody quizId={progressQuizId} />
          )}
        </div>
      </Modal>
    </div>
  );
};

const ProgressBody = ({ quizId }: { quizId: string }) => {
  const users = db.getUsers();
  const attempts = db.getAttemptsByQuiz(quizId);
  const results = db.getResultsByQuiz(quizId);
  const questions = db.getQuestions(quizId);
  const findUser = (id: string) => users.find(u => u.id === id)?.name || id;
  const tagIndex = new Map<string, { total: number; correct: number }>();
  results.forEach(r => {
    r.details.forEach(d => {
      const q = questions.find(q => q.id === d.questionId);
      const tags = q?.tags || [];
      tags.forEach(t => {
        const cur = tagIndex.get(t) || { total: 0, correct: 0 };
        cur.total += 1;
        if (d.isCorrect) cur.correct += 1;
        tagIndex.set(t, cur);
      });
    });
  });
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Em andamento</h3>
        {attempts.length === 0 && <div className="text-sm text-slate-500">Nenhum aluno em andamento.</div>}
        {attempts.map(a => (
          <Card key={a.id} className="p-4 flex justify-between items-center">
            <div>
              <div className="font-medium">{findUser(a.userId)}</div>
              <div className="text-xs text-slate-500">Início: {new Date(a.startedAt).toLocaleString()}</div>
            </div>
            <div className="text-sm">Última questão: {a.lastIndex + 1}</div>
            <div className="text-xs text-slate-500">Respondidas: {Object.keys(a.answers).length}</div>
          </Card>
        ))}
      </div>
      <div>
        <h3 className="font-semibold mb-2">Finalizados</h3>
        {results.length === 0 && <div className="text-sm text-slate-500">Nenhum resultado.</div>}
        {results.map(r => (
          <Card key={r.id} className="p-4">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{findUser(r.userId)}</div>
                <div className="text-xs text-slate-500">Data: {new Date(r.date).toLocaleString()}</div>
              </div>
              <div className="text-sm">{r.score}/{r.total}</div>
            </div>
            <div className="mt-2 text-xs text-slate-500">Duração: {r.durationSec ? r.durationSec + 's' : '-'}</div>
          </Card>
        ))}
      </div>
      <div>
        <h3 className="font-semibold mb-2">Resumo por Assunto</h3>
        {Array.from(tagIndex.entries()).length === 0 && (
          <div className="text-sm text-slate-500">Ainda sem tags nas questões.</div>
        )}
        {Array.from(tagIndex.entries()).map(([tag, stats]) => (
          <Card key={tag} className="p-3 flex justify-between items-center">
            <div className="text-sm font-medium">{tag}</div>
            <div className="text-sm">{stats.correct}/{stats.total}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};
