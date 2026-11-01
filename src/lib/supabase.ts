import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, ProblemProgress, DayCompletion, XPEvent, RevisitItem } from '@/types';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && anonKey) {
    try {
      supabaseClient = createClient(url, anonKey);
    } catch (e) {
      console.warn('Could not initialize Supabase client:', e);
    }
  }

  return supabaseClient;
}

export async function syncProgressToSupabase(progress: ProblemProgress): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('progress').upsert({
      problem_id: progress.problem_id,
      status: progress.status,
      notes: progress.notes,
      time_spent_seconds: progress.time_spent_seconds,
      attempts: progress.attempts,
      opened_at: progress.opened_at,
      solved_at: progress.solved_at,
      last_attempt_at: progress.last_attempt_at,
      user_id: 'me',
    });
    if (error) {
      console.warn('Supabase sync error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase sync failed (offline or unconfigured):', err);
    return false;
  }
}

export async function syncDayCompletionToSupabase(dayCompletion: DayCompletion): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('days').upsert({
      day_number: dayCompletion.day_number,
      completed_at: dayCompletion.completed_at,
      used_freeze: !!dayCompletion.used_freeze,
      user_id: 'me',
    });
    return !error;
  } catch (err) {
    console.warn('Supabase sync failed:', err);
    return false;
  }
}

export async function syncXPEventToSupabase(event: XPEvent): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('xp_events').upsert({
      id: event.id,
      problem_id: event.problem_id || null,
      amount: event.amount,
      reason: event.reason,
      created_at: event.created_at,
      user_id: 'me',
    });
    return !error;
  } catch (err) {
    return false;
  }
}

export async function pullCloudState(): Promise<Partial<AppState> | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const [progressRes, daysRes, xpRes, revisitsRes] = await Promise.all([
      supabase.from('progress').select('*').eq('user_id', 'me'),
      supabase.from('days').select('*').eq('user_id', 'me'),
      supabase.from('xp_events').select('*').eq('user_id', 'me'),
      supabase.from('revisits').select('*').eq('user_id', 'me'),
    ]);

    const progressMap: Record<number, ProblemProgress> = {};
    if (progressRes.data) {
      progressRes.data.forEach((row: any) => {
        progressMap[row.problem_id] = {
          problem_id: row.problem_id,
          status: row.status,
          notes: row.notes || '',
          time_spent_seconds: row.time_spent_seconds || 0,
          attempts: row.attempts || 0,
          opened_at: row.opened_at,
          solved_at: row.solved_at,
          last_attempt_at: row.last_attempt_at,
        };
      });
    }

    const dayCompletions: Record<number, DayCompletion> = {};
    if (daysRes.data) {
      daysRes.data.forEach((row: any) => {
        dayCompletions[row.day_number] = {
          day_number: row.day_number,
          completed_at: row.completed_at,
          used_freeze: row.used_freeze,
        };
      });
    }

    return {
      progress: progressMap,
      dayCompletions,
      xpEvents: (xpRes.data as XPEvent[]) || [],
      revisits: (revisitsRes.data as RevisitItem[]) || [],
    };
  } catch (err) {
    console.warn('Error pulling cloud state:', err);
    return null;
  }
}
