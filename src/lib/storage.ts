import { Problem, ProblemProgress, ProblemStatus, UserSettings, DayCompletion, XPEvent, RevisitItem, BossCompletion, MockInterviewResult, AppState } from '@/types';
import rawProblems from '@/data/dsa-120-problems.json';
import { SKILL_TREE_NODES } from '@/data/skillTreeNodes';
import { getDefaultMemeCaptions } from './memeEngine';

const STORAGE_KEY = 'dsa_quest_app_state_v2';

export const DEFAULT_STATIC_START_DATE = '2026-11-01';

export function getDefaultStartDate(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_STATIC_START_DATE;
  }
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getInitialState(): AppState {
  const defaultCheatSheets: Record<string, string[]> = {};
  SKILL_TREE_NODES.forEach((node) => {
    defaultCheatSheets[node.key] = [...node.cheatSheet];
  });

  return {
    problems: rawProblems as Problem[],
    progress: {},
    dayCompletions: {},
    xpEvents: [],
    revisits: [],
    bossCompletions: {},
    mockInterviews: {},
    settings: {
      start_date: DEFAULT_STATIC_START_DATE,
      daily_target: 3,
      streak_freezes_available: 0,
      sound_enabled: false,
      weekly_commitment: '',
      meme_intensity: 'normal',
      meme_frequency: 0.85,
      show_gallery: true,
    },
    cheatSheets: defaultCheatSheets,
    memeCaptions: getDefaultMemeCaptions(),
    memeEvents: [],
  };
}

export function loadStoredState(): AppState {
  if (typeof window === 'undefined') {
    return getInitialState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init = {
        ...getInitialState(),
        settings: {
          ...getInitialState().settings,
          start_date: getDefaultStartDate(),
        },
      };
      saveStoredState(init);
      return init;
    }
    const parsed = JSON.parse(raw) as Partial<AppState>;

    const state: AppState = {
      problems: rawProblems as Problem[],
      progress: parsed.progress || {},
      dayCompletions: parsed.dayCompletions || {},
      xpEvents: parsed.xpEvents || [],
      revisits: parsed.revisits || [],
      bossCompletions: parsed.bossCompletions || {},
      mockInterviews: parsed.mockInterviews || {},
      settings: {
        start_date: parsed.settings?.start_date || getDefaultStartDate(),
        daily_target: parsed.settings?.daily_target || 3,
        streak_freezes_available: parsed.settings?.streak_freezes_available ?? 0,
        sound_enabled: false, // Strictly silent
        weekly_commitment: parsed.settings?.weekly_commitment || '',
        meme_intensity: parsed.settings?.meme_intensity || 'normal',
        meme_frequency: parsed.settings?.meme_frequency ?? 0.85,
        show_gallery: parsed.settings?.show_gallery ?? true,
      },
      cheatSheets: {
        ...getInitialState().cheatSheets,
        ...(parsed.cheatSheets || {}),
      },
      memeCaptions:
        parsed.memeCaptions && parsed.memeCaptions.length > 0
          ? parsed.memeCaptions
          : getDefaultMemeCaptions(),
      memeEvents: parsed.memeEvents || [],
      customTemplates: parsed.customTemplates || [],
    };
    return state;
  } catch (err) {
    console.error('Failed to load local storage state:', err);
    return getInitialState();
  }
}

export function saveStoredState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save to local storage:', err);
  }
}

export function exportStateAsJSON(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importStateFromJSON(jsonStr: string): AppState {
  const parsed = JSON.parse(jsonStr) as Partial<AppState>;
  const state: AppState = {
    problems: rawProblems as Problem[],
    progress: parsed.progress || {},
    dayCompletions: parsed.dayCompletions || {},
    xpEvents: parsed.xpEvents || [],
    revisits: parsed.revisits || [],
    bossCompletions: parsed.bossCompletions || {},
    mockInterviews: parsed.mockInterviews || {},
    settings: {
      start_date: parsed.settings?.start_date || getDefaultStartDate(),
      daily_target: parsed.settings?.daily_target || 3,
      streak_freezes_available: parsed.settings?.streak_freezes_available ?? 0,
      sound_enabled: false,
      weekly_commitment: parsed.settings?.weekly_commitment || '',
      meme_intensity: parsed.settings?.meme_intensity || 'normal',
      meme_frequency: parsed.settings?.meme_frequency ?? 0.85,
      show_gallery: parsed.settings?.show_gallery ?? true,
    },
    cheatSheets: parsed.cheatSheets || getInitialState().cheatSheets,
    memeCaptions: parsed.memeCaptions || getDefaultMemeCaptions(),
    memeEvents: parsed.memeEvents || [],
  };
  saveStoredState(state);
  return state;
}
