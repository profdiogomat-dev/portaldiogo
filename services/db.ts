import { User, Quiz, Question, Result, Attendance, Payment, Role, Subject, Attempt, Appointment } from '../types';
import { CloudSync } from './sync';

// Helper to generate IDs
const uid = () => Math.random().toString(36).substr(2, 9);

class MockDB {
  private get<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private set<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- INIT ---
  init() {
    const users = this.get<User>('users');
    const hasTeacher = users.some(u => u.role === Role.Teacher);
    if (!hasTeacher) {
      users.push({
        id: 'teacher-1',
        name: 'Administrador',
        username: 'profdiogo',
        password: 'poli0402',
        role: Role.Teacher,
        blocked: false
      });
      this.set('users', users);
    }
    if (CloudSync.enabled) {
      this.syncDown().catch(() => {});
    }
  }

  // --- USERS ---
  getUsers() { return this.get<User>('users'); }
  getUserById(id: string) { return this.get<User>('users').find(u => u.id === id); }
  createUser(user: Omit<User, 'id'>) {
    const users = this.get<User>('users');
    if (users.find(u => u.username === user.username)) throw new Error('Username already exists');
    const newUser = { ...user, id: uid(), grade: user.grade || 'OUTROS' };
    users.push(newUser);
    this.set('users', users);
    if (CloudSync.enabled) CloudSync.upsert('users', newUser);
    return newUser;
  }
  updateUser(id: string, data: Partial<User>) {
    const users = this.get<User>('users');
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return;
    users[idx] = { ...users[idx], ...data };
    this.set('users', users);
  }
  deleteUser(id: string) {
    let users = this.get<User>('users');
    users = users.filter(u => u.id !== id);
    this.set('users', users);
  }

  resetUsersAndQuizzes(username: string, password: string) {
    const newUsers: User[] = [
      {
        id: 'teacher-1',
        name: 'Administrador',
        username,
        password,
        role: Role.Teacher,
        blocked: false
      }
    ];
    this.set('users', newUsers);
    this.set('quizzes', []);
    this.set('questions', []);
  }

  // --- QUIZZES ---
  getQuizzes() { return this.get<Quiz>('quizzes'); }
  createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt'>) {
    const quizzes = this.get<Quiz>('quizzes');
    const newQuiz = { ...quiz, id: uid(), createdAt: new Date().toISOString() };
    quizzes.push(newQuiz);
    this.set('quizzes', quizzes);
    if (CloudSync.enabled) CloudSync.upsert('quizzes', newQuiz);
    return newQuiz;
  }
  deleteQuiz(id: string) {
    const quizzes = this.get<Quiz>('quizzes').filter(q => q.id !== id);
    this.set('quizzes', quizzes);
    // Cascade delete questions
    const questions = this.get<Question>('questions').filter(q => q.quizId !== id);
    this.set('questions', questions);
  }
  updateQuiz(id: string, data: Partial<Quiz>) {
    const list = this.get<Quiz>('quizzes');
    const idx = list.findIndex(q => q.id === id);
    if(idx > -1) {
        list[idx] = { ...list[idx], ...data };
        this.set('quizzes', list);
        if (CloudSync.enabled) CloudSync.upsert('quizzes', list[idx]);
    }
  }

  // --- QUESTIONS ---
  getAllQuestions() {
    return this.get<Question>('questions');
  }
  getQuestions(quizId: string) {
    return this.get<Question>('questions').filter(q => q.quizId === quizId);
  }
  createQuestion(q: Omit<Question, 'id'>) {
    const questions = this.get<Question>('questions');
    const newQ = { ...q, id: uid() };
    questions.push(newQ);
    this.set('questions', questions);
    if (CloudSync.enabled) CloudSync.upsert('questions', newQ);
    return newQ;
  }
  updateQuestion(id: string, data: Partial<Question>) {
     const list = this.get<Question>('questions');
     const idx = list.findIndex(q => q.id === id);
     if(idx > -1) {
         list[idx] = { ...list[idx], ...data };
         this.set('questions', list);
     }
  }
  deleteQuestion(id: string) {
      const list = this.get<Question>('questions').filter(q => q.id !== id);
      this.set('questions', list);
  }

  // --- RESULTS ---
  getResults(userId?: string) {
    const res = this.get<Result>('results');
    if (userId) return res.filter(r => r.userId === userId);
    return res;
  }
  getResultsByQuiz(quizId: string) {
    return this.get<Result>('results').filter(r => r.quizId === quizId);
  }
  saveResult(result: Omit<Result, 'id' | 'date'>) {
    const results = this.get<Result>('results');
    const newRes = { ...result, id: uid(), date: new Date().toISOString() };
    results.push(newRes);
    this.set('results', results);
    if (CloudSync.enabled) CloudSync.upsert('results', newRes);
  }

  // --- ATTEMPTS ---
  startAttempt(userId: string, quizId: string) {
    const attempts = this.get<Attempt>('attempts');
    const existing = attempts.find(a => a.userId === userId && a.quizId === quizId);
    if (existing) return existing;
    const att: Attempt = { id: uid(), userId, quizId, startedAt: new Date().toISOString(), lastIndex: 0, answers: {} };
    attempts.push(att);
    this.set('attempts', attempts);
    return att;
  }
  updateAttempt(attId: string, data: Partial<Attempt>) {
    const attempts = this.get<Attempt>('attempts');
    const idx = attempts.findIndex(a => a.id === attId);
    if (idx === -1) return;
    attempts[idx] = { ...attempts[idx], ...data } as Attempt;
    this.set('attempts', attempts);
  }
  finishAttempt(attId: string) {
    const attempts = this.get<Attempt>('attempts');
    const att = attempts.find(a => a.id === attId);
    if (!att) return;
    const filtered = attempts.filter(a => a.id !== attId);
    this.set('attempts', filtered);
    return att;
  }
  getAttemptsByQuiz(quizId: string) {
    return this.get<Attempt>('attempts').filter(a => a.quizId === quizId);
  }

  // --- EXTRAS ---
  getAttendance(userId: string) { return this.get<Attendance>('attendance').filter(a => a.userId === userId); }
  addAttendance(att: Omit<Attendance, 'id'>) {
    const list = this.get<Attendance>('attendance');
    list.push({ ...att, id: uid() });
    this.set('attendance', list);
    if (CloudSync.enabled) CloudSync.upsert('attendance', list[list.length-1]);
  }
  deleteAttendance(id: string) {
    const list = this.get<Attendance>('attendance');
    const next = list.filter(a => a.id !== id);
    this.set('attendance', next);
    if (CloudSync.enabled) CloudSync.remove('attendance', id);
  }

  getPayments(userId: string) { return this.get<Payment>('payments').filter(p => p.userId === userId); }
  addPayment(pay: Omit<Payment, 'id'>) {
    const list = this.get<Payment>('payments');
    list.push({ ...pay, id: uid() });
    this.set('payments', list);
    if (CloudSync.enabled) CloudSync.upsert('payments', list[list.length-1]);
  }
  deletePayment(id: string) {
    const list = this.get<Payment>('payments');
    const next = list.filter(p => p.id !== id);
    this.set('payments', next);
    if (CloudSync.enabled) CloudSync.remove('payments', id);
  }
  
  // --- APPOINTMENTS ---
  getAppointments(date?: string) {
    const list = this.get<Appointment>('appointments');
    if (!date) return list;
    return list.filter(a => a.dateTime.startsWith(date));
  }
  addAppointment(app: Omit<Appointment, 'id' | 'createdAt'>) {
    const list = this.get<Appointment>('appointments');
    const newApp = { ...app, id: uid(), createdAt: new Date().toISOString() };
    list.push(newApp);
    this.set('appointments', list);
    if (CloudSync.enabled) CloudSync.upsert('appointments', newApp);
    return newApp;
  }

  async syncDown() {
    const users = await CloudSync.list('users');
    if (users.length) this.set('users', users);
    const quizzes = await CloudSync.list('quizzes');
    if (quizzes.length) this.set('quizzes', quizzes);
    const questions = await CloudSync.list('questions');
    if (questions.length) this.set('questions', questions);
    const results = await CloudSync.list('results');
    if (results.length) this.set('results', results);
    const attempts = await CloudSync.list('attempts');
    if (attempts.length) this.set('attempts', attempts);
    const attendance = await CloudSync.list('attendance');
    if (attendance.length) this.set('attendance', attendance);
    const payments = await CloudSync.list('payments');
    if (payments.length) this.set('payments', payments);
    const appointments = await CloudSync.list('appointments');
    if (appointments.length) this.set('appointments', appointments);
  }

  async syncUp() {
    await CloudSync.bulkUpsert('users', this.get<User>('users'));
    await CloudSync.bulkUpsert('quizzes', this.get<Quiz>('quizzes'));
    await CloudSync.bulkUpsert('questions', this.get<Question>('questions'));
    await CloudSync.bulkUpsert('results', this.get<Result>('results'));
    await CloudSync.bulkUpsert('attempts', this.get<Attempt>('attempts'));
    await CloudSync.bulkUpsert('attendance', this.get<Attendance>('attendance'));
    await CloudSync.bulkUpsert('payments', this.get<Payment>('payments'));
    await CloudSync.bulkUpsert('appointments', this.get<Appointment>('appointments'));
  }
  
  // Backup/Restore
  exportDB() {
    return JSON.stringify(localStorage);
  }
  importDB(json: string) {
    const data = JSON.parse(json);
    localStorage.clear();
    for (const k in data) {
        localStorage.setItem(k, data[k]);
    }
  }

  mergeDB(json: string) {
    const incoming = JSON.parse(json);
    const mergeList = <T extends { id: string }>(key: string) => {
      const current: T[] = this.get<T>(key);
      const next: T[] = incoming[key] ? JSON.parse(incoming[key]) : [];
      const map = new Map<string, T>();
      current.forEach(i => map.set(i.id, i));
      next.forEach(i => map.set(i.id, i));
      this.set<T>(key, Array.from(map.values()));
    };
    mergeList<User>('users');
    mergeList<Quiz>('quizzes');
    mergeList<Question>('questions');
    mergeList<Result>('results');
    mergeList<Attendance>('attendance');
    mergeList<Payment>('payments');
    mergeList<Attempt>('attempts');
    mergeList<Appointment>('appointments');
  }
}

export const db = new MockDB();
db.init(); // Ensure default user
