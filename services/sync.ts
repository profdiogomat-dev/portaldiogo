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
try {
  if (url && key && /^https?:\/\//.test(url)) {
    client = createClient(url, key);
  }
} catch (_) {
  client = null;
}

export const CloudSync = {
  enabled: !!client,
  lastError: null as string | null,

  async list<K extends keyof TableMap>(table: K): Promise<TableMap[K][]> {
    if (!client) return [] as TableMap[K][];
    const { data, error } = await client.from(table as string).select('*');
    if (error) { CloudSync.lastError = error.message; return [] as TableMap[K][]; }
    return (data as TableMap[K][]) || [];
  },

  async upsert<K extends keyof TableMap>(table: K, row: TableMap[K]) {
    if (!client) return;
    const { error } = await client.from(table as string).upsert(row as any, { onConflict: 'id' });
    if (error) CloudSync.lastError = error.message;
  },

  async bulkUpsert<K extends keyof TableMap>(table: K, rows: TableMap[K][]) {
    if (!client || rows.length === 0) return;
    const { error } = await client.from(table as string).upsert(rows as any, { onConflict: 'id' });
    if (error) CloudSync.lastError = error.message;
  },

  async ping(): Promise<{ ok: boolean; usersCount?: number; error?: string }> {
    if (!client) return { ok: false, error: 'Cliente não inicializado. Verifique variáveis VITE_SUPABASE_URL/KEY.' };
    const { data, error } = await client.from('users').select('id', { count: 'exact', head: true });
    if (error) { CloudSync.lastError = error.message; return { ok: false, error: error.message }; }
    return { ok: true, usersCount: (data as any)?.length || undefined };
  }
  ,
  async count(table: keyof TableMap): Promise<number> {
    if (!client) return 0;
    const { count, error } = await client.from(table as string).select('*', { count: 'exact', head: true });
    if (error) { CloudSync.lastError = error.message; return 0; }
    return count || 0;
  },
  async status() {
    const tables: (keyof TableMap)[] = ['users','quizzes','questions','results','attempts','attendance','payments','appointments'];
    const result: Record<string, number> = {};
    for (const t of tables) {
      result[t] = await CloudSync.count(t);
    }
    return result;
  }
};
