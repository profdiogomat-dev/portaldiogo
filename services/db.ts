import { User, Quiz, Question, Result, Attendance, Payment, Role, Subject, Attempt, Appointment } from '../types';

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
    const setupDone = localStorage.getItem('setupDone');
    if (!setupDone) {
      this.resetUsersAndQuizzes('profdiogo', 'poli0402');
      localStorage.setItem('setupDone', 'true');
    }
  }

  // --- USERS ---
  getUsers() { return this.get<User>('users'); }
  getUserById(id: string) { return this.get<User>('users').find(u => u.id === id); }
  createUser(user: Omit<User, 'id'>) {
    const users = this.get<User>('users');
    if (users.find(u => u.username === user.username)) throw new Error('Username already exists');
    const newUser = { ...user, id: uid() };
    users.push(newUser);
    this.set('users', users);
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
  }

  getPayments(userId: string) { return this.get<Payment>('payments').filter(p => p.userId === userId); }
  addPayment(pay: Omit<Payment, 'id'>) {
    const list = this.get<Payment>('payments');
    list.push({ ...pay, id: uid() });
    this.set('payments', list);
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
    return newApp;
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
}

export const db = new MockDB();
db.init(); // Ensure default user
