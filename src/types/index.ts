export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type ProblemStatus =
  | 'not_started'
  | 'in_progress'
  | 'solved_clean'
  | 'solved_hint'
  | 'needed_solution'
  | 'skipped';

export interface Problem {
  id: number;
  title: string;
  slug: string;
  url: string;
  difficulty: Difficulty;
  node_order: number;
  node: string;
  node_key: string;
  day: number;
  order_in_day: number;
}

export interface ProblemProgress {
  problem_id: number;
  status: ProblemStatus;
  notes: string;
  time_spent_seconds: number;
  attempts: number;
  opened_at?: string;
  solved_at?: string;
  last_attempt_at?: string;
}

export type MemeTone = 'hype' | 'self' | 'roast';
export type MemeIntensity = 'chill' | 'normal' | 'savage';

export type MemeEventName =
  | 'solved_clean'
  | 'solved_hint'
  | 'needed_solution'
  | 'skipped'
  | 'day_complete'
  | 'early_start'
  | 'behind_1'
  | 'behind_3'
  | 'behind_5plus'
  | 'behind_7plus'
  | 'streak_3'
  | 'streak_7'
  | 'streak_14'
  | 'streak_21'
  | 'streak_30'
  | 'level_up'
  | 'boss_win'
  | 'boss_lose'
  | 'mock_day'
  | 'revisit_due'
  | 'landing';

export interface MemeTemplate {
  imgflip_id: string;
  name: string;
  url: string;
  cached_url?: string;
  box_count: number;
  whitelisted: boolean;
}

export interface MemeCaption {
  id: string;
  event: MemeEventName;
  template_name: string;
  lines: string[];
  tone: MemeTone;
  enabled: boolean;
  created_by: 'system' | 'user';
  times_shown: number;
}

export interface MemeEventRecord {
  id: string;
  caption_id: string;
  event: MemeEventName;
  shown_at: string;
  liked: boolean;
  hidden: boolean;
}

export interface UserSettings {
  start_date: string; // YYYY-MM-DD
  daily_target: number;
  streak_freezes_available: number;
  sound_enabled: boolean;
  weekly_commitment?: string;
  meme_intensity: MemeIntensity; // 'chill' | 'normal' | 'savage'
  meme_frequency: number; // default 0.85
  show_gallery: boolean; // default true
}

export interface DayCompletion {
  day_number: number;
  completed_at: string;
  used_freeze?: boolean;
}

export interface XPEvent {
  id: string;
  problem_id?: number;
  amount: number;
  reason: string;
  created_at: string;
}

export interface RevisitItem {
  id: string;
  problem_id: number;
  interval_day: 1 | 3 | 7;
  scheduled_for_day: number;
  graduated: boolean;
  created_at: string;
}

export interface BossCompletion {
  node_key: string;
  problem_id: number;
  time_taken_seconds: number;
  passed: boolean;
  completed_at: string;
}

export interface MockInterviewResult {
  day_number: 44 | 45;
  completed: boolean;
  approach_clarity: number; // 1-5
  edge_cases: number; // 1-5
  complexity_stated: number; // 1-5
  communication: number; // 1-5
  clean_code: number; // 1-5
  notes: string;
  completed_at?: string;
}

export interface AppState {
  problems: Problem[];
  progress: Record<number, ProblemProgress>;
  dayCompletions: Record<number, DayCompletion>;
  xpEvents: XPEvent[];
  revisits: RevisitItem[];
  bossCompletions: Record<string, BossCompletion>;
  mockInterviews: Record<number, MockInterviewResult>;
  settings: UserSettings;
  cheatSheets: Record<string, string[]>;
  memeCaptions: MemeCaption[];
  memeEvents: MemeEventRecord[];
  customTemplates?: MemeTemplate[];
}
