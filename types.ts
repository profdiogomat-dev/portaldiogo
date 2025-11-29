export enum Role {
  Teacher = 'teacher',
  Student = 'student'
}

export enum Subject {
  Math = 'math',
  Chem = 'chem'
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string; // stored hashed/plain in mock
  role: Role;
  grade?: string;
  phone?: string;
  email?: string;
  blocked: boolean;
  resetCode?: string;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  imageUrl?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  grade: string;
  subject: Subject;
  createdAt: string;
}

export interface Result {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  total: number;
  date: string;
  durationSec?: number;
  startedAt?: string;
  finishedAt?: string;
  details: {
    questionId: string;
    chosen: string;
    isCorrect: boolean;
  }[];
}

export interface Attempt {
  id: string;
  userId: string;
  quizId: string;
  startedAt: string;
  lastIndex: number;
  answers: Record<string, string>;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  content: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  date: string;
  method?: string;
  notes?: string;
}

// GRADE OPTIONS
export const GRADE_OPTIONS = {
  '6EF': '6º ano EF',
  '7EF': '7º ano EF',
  '8EF': '8º ano EF',
  '9EF': '9º ano EF',
  '1EM': '1ª série EM',
  '2EM': '2ª série EM',
  '3EM': '3ª série EM',
  'OUTROS': 'Outros / Não definido'
};

export const SUBJECT_LABELS = {
  [Subject.Math]: 'Matemática',
  [Subject.Chem]: 'Química'
};
