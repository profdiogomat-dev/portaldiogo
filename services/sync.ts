import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Quiz, Question, Result, Attempt, Attendance, Payment, Appointment } from '../types';

type TableMap = {
  users: User;
  quizzes: Quiz;
  questions: Question;
  results: Result;
  attempts: Attempt;
  attendance: Attendance;
  payments: Payment;
  appointments: Appointment;
};

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;
if (url && key) {
  client = createClient(url, key);
}

export const CloudSync = {
  enabled: !!client,

  async list<K extends keyof TableMap>(table: K): Promise<TableMap[K][]> {
    if (!client) return [] as TableMap[K][];
    const { data, error } = await client.from(table as string).select('*');
    if (error) return [] as TableMap[K][];
    return (data as TableMap[K][]) || [];
  },

  async upsert<K extends keyof TableMap>(table: K, row: TableMap[K]) {
    if (!client) return;
    await client.from(table as string).upsert(row as any, { onConflict: 'id' });
  },

  async bulkUpsert<K extends keyof TableMap>(table: K, rows: TableMap[K][]) {
    if (!client || rows.length === 0) return;
    await client.from(table as string).upsert(rows as any, { onConflict: 'id' });
  }
};

