'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Problem,
  ProblemProgress,
  ProblemStatus,
  UserSettings,
  DayCompletion,
  XPEvent,
  RevisitItem,
  BossCompletion,
  MockInterviewResult,
  AppState,
  MemeEventName,
  MemeTone,
  MemeCaption,
} from '@/types';
import {
  loadStoredState,
  saveStoredState,
  getInitialState,
  getDefaultStartDate,
  exportStateAsJSON,
  importStateFromJSON,
} from '@/lib/storage';
import {
  calculateProblemXP,
  getLevelInfo,
  createRevisitSchedules,
  calculateStreak,
  getNodeSummaries,
} from '@/lib/gameLogic';
import { computeRealityStats, RealityStats } from '@/lib/realityCheck';
import { getMeme, preloadMemeImages, MemeSelectionResult, resolveMemeTemplate } from '@/lib/memeEngine';
import { syncProgressToSupabase, syncDayCompletionToSupabase, syncXPEventToSupabase } from '@/lib/supabase';

interface AppContextType {
  state: AppState;
  realityStats: RealityStats;
  activeDay: number;
  calendarDay: number;
  setActiveDay: (day: number) => void;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  activeProblem: Problem | null;
  returnModalProblem: Problem | null;
  levelUpData: { level: number; name: string } | null;
  isStuckNudgeOpen: boolean;
  focusTimerSeconds: number;
  isFocusTimerRunning: boolean;
  problemSplitTimes: Record<number, number>;

  // Meme features
  activeEventMeme: MemeSelectionResult | null;
  isEventMemeFullScreen: boolean;
  triggerMeme: (event: MemeEventName, options?: { forceTone?: MemeTone; ignoreFrequency?: boolean; isFullScreen?: boolean }) => void;
  closeEventMeme: () => void;
  likeCaption: (captionId: string) => void;
  hideCaption: (captionId: string) => void;
  addCustomCaption: (caption: MemeCaption) => void;

  // Skip dialog
  skipConfirmProblem: Problem | null;
  requestSkipProblem: (problemId: number) => void;
  cancelSkipProblem: () => void;
  confirmSkipProblem: () => void;

  // Actions
  openProblem: (problem: Problem) => void;
  closeReturnModal: () => void;
  closeLevelUpModal: () => void;
  closeStuckNudge: () => void;
  updateProblemStatus: (
    problemId: number,
    status: ProblemStatus,
    notes?: string,
    timeSpent?: number
  ) => void;
  updateProblemUrl: (problemId: number, newUrl: string) => void;
  completeDay: (dayNumber: number) => boolean;
  useStreakFreeze: (dayNumber: number) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  updateCheatSheet: (nodeKey: string, bullets: string[]) => void;
  recordBossFight: (nodeKey: string, problemId: number, timeTakenSeconds: number, passed: boolean) => void;
  recordMockInterview: (result: MockInterviewResult) => void;
  toggleFocusTimer: () => void;
  resetFocusTimer: () => void;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  resetData: () => void;
  triggerConfetti: (burstSize?: 'small' | 'large') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(getInitialState);
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [returnModalProblem, setReturnModalProblem] = useState<Problem | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ level: number; name: string } | null>(null);
  const [isStuckNudgeOpen, setIsStuckNudgeOpen] = useState(false);

  // Focus Timer: 2 hours default (7200 seconds)
  const [focusTimerSeconds, setFocusTimerSeconds] = useState(7200);
  const [isFocusTimerRunning, setIsFocusTimerRunning] = useState(false);
  const [problemSplitTimes, setProblemSplitTimes] = useState<Record<number, number>>({});

  // Meme Modal State
  const [activeEventMeme, setActiveEventMeme] = useState<MemeSelectionResult | null>(null);
  const [isEventMemeFullScreen, setIsEventMemeFullScreen] = useState(false);

  // Skip Confirmation State
  const [skipConfirmProblem, setSkipConfirmProblem] = useState<Problem | null>(null);

  const pendingProblemIdRef = useRef<number | null>(null);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    setState(loadStoredState());
  }, []);

  // Persist state changes
  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  // Total XP computed from events
  const totalXP = state.xpEvents.reduce((sum, e) => sum + e.amount, 0);

  // Reality stats computed
  const solvedCount = Object.values(state.progress).filter((p) =>
    ['solved_clean', 'solved_hint', 'needed_solution'].includes(p.status)
  ).length;
  const cleanSolvedCount = Object.values(state.progress).filter(
    (p) => p.status === 'solved_clean'
  ).length;

  const realityStats = computeRealityStats(
    state.settings.start_date,
    state.problems.length,
    solvedCount,
    cleanSolvedCount
  );

  // Streak computed
  const { currentStreak, longestStreak } = calculateStreak(
    realityStats.currentDay,
    state.dayCompletions
  );

  // Active / Viewed Day State (allows advancing ahead or reviewing past days)
  const calendarDay = realityStats.currentDay;
  const [activeDayState, setActiveDayState] = useState<number | null>(null);

  // Load saved active day from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dsa_quest_active_day');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 45) {
          setActiveDayState(parsed);
        }
      }
    }
  }, []);

  // Compute default day: first incomplete day or calendar day
  const defaultDay = useMemo(() => {
    for (let d = 1; d <= 45; d++) {
      if (!state.dayCompletions[d]?.completed_at) {
        return d;
      }
    }
    return 45;
  }, [state.dayCompletions]);

  const activeDay = activeDayState ?? defaultDay;

  const setActiveDay = useCallback((day: number) => {
    const clamped = Math.max(1, Math.min(45, day));
    setActiveDayState(clamped);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dsa_quest_active_day', String(clamped));
    }
  }, []);

  // Confetti trigger
  const triggerConfetti = useCallback((burstSize: 'small' | 'large' = 'small') => {
    if (typeof window === 'undefined') return;
    if (burstSize === 'small') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#34d399', '#f59e0b', '#a855f7'],
      });
    } else {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#00ff88', '#ff0055', '#ffbe0b', '#7928ca'],
      });
    }
  }, []);

  // Trigger Meme Engine Helper
  const triggerMeme = useCallback(
    (
      event: MemeEventName,
      options?: { forceTone?: MemeTone; ignoreFrequency?: boolean; isFullScreen?: boolean }
    ) => {
      const selected = getMeme(event, state, options);
      if (!selected) return;

      setIsEventMemeFullScreen(!!options?.isFullScreen);
      setActiveEventMeme(selected);

      // Record in meme_events
      setState((prev) => {
        const now = new Date().toISOString();
        const newRecord = {
          id: `me-${Date.now()}`,
          caption_id: selected.caption.id,
          event,
          shown_at: now,
          liked: false,
          hidden: false,
        };

        const updatedCaptions = (prev.memeCaptions || []).map((c) =>
          c.id === selected.caption.id ? { ...c, times_shown: (c.times_shown || 0) + 1 } : c
        );

        return {
          ...prev,
          memeEvents: [newRecord, ...(prev.memeEvents || [])],
          memeCaptions: updatedCaptions,
        };
      });
    },
    [state]
  );

  const closeEventMeme = useCallback(() => {
    setActiveEventMeme(null);
    setIsEventMemeFullScreen(false);
  }, []);

  const likeCaption = useCallback((captionId: string) => {
    setState((prev) => ({
      ...prev,
      memeEvents: (prev.memeEvents || []).map((e) =>
        e.caption_id === captionId ? { ...e, liked: !e.liked } : e
      ),
    }));
  }, []);

  const hideCaption = useCallback((captionId: string) => {
    setState((prev) => ({
      ...prev,
      memeEvents: (prev.memeEvents || []).map((e) =>
        e.caption_id === captionId ? { ...e, hidden: true } : e
      ),
    }));
    closeEventMeme();
  }, [closeEventMeme]);

  const addCustomCaption = useCallback((caption: MemeCaption) => {
    setState((prev) => ({
      ...prev,
      memeCaptions: [caption, ...(prev.memeCaptions || [])],
    }));
  }, []);

  // Timer Tick: handles focus timer, split timers, and 25-minute stuck nudge
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isFocusTimerRunning) {
      interval = setInterval(() => {
        setFocusTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));

        if (activeProblem) {
          setProblemSplitTimes((prev) => {
            const current = (prev[activeProblem.id] || 0) + 1;
            if (current === 1500) {
              setIsStuckNudgeOpen(true);
            }
            return { ...prev, [activeProblem.id]: current };
          });
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusTimerRunning, activeProblem]);

  // Window Focus / Visibility Change: Return Bottom Sheet Trigger
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pendingProblemIdRef.current) {
        const pId = pendingProblemIdRef.current;
        const problem = state.problems.find((p) => p.id === pId);
        if (problem) {
          setReturnModalProblem(problem);
        }
        pendingProblemIdRef.current = null;
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [state.problems]);

  // 8.1 Click-through behavior & Image Preloading
  const openProblem = useCallback(
    (problem: Problem) => {
      pendingProblemIdRef.current = problem.id;
      setActiveProblem(problem);
      setIsFocusTimerRunning(true);

      // Preload next likely meme images (solved, hint, solution, skipped)
      const likelyEvents: MemeEventName[] = ['solved_clean', 'solved_hint', 'needed_solution', 'skipped'];
      const urlsToPreload: string[] = [];
      likelyEvents.forEach((ev) => {
        const candidate = getMeme(ev, state, { ignoreFrequency: true });
        if (candidate?.template?.url) {
          urlsToPreload.push(candidate.template.url);
        }
      });
      preloadMemeImages(urlsToPreload);

      setState((prev) => {
        const existing = prev.progress[problem.id];
        const isNotStarted = !existing || existing.status === 'not_started';
        const now = new Date().toISOString();

        const updatedProgress: ProblemProgress = {
          problem_id: problem.id,
          status: isNotStarted ? 'in_progress' : existing.status,
          notes: existing?.notes || '',
          time_spent_seconds: existing?.time_spent_seconds || 0,
          attempts: (existing?.attempts || 0) + 1,
          opened_at: existing?.opened_at || now,
          last_attempt_at: now,
        };

        const next = {
          ...prev,
          progress: {
            ...prev.progress,
            [problem.id]: updatedProgress,
          },
        };

        syncProgressToSupabase(updatedProgress);
        return next;
      });

      if (typeof window !== 'undefined') {
        window.open(problem.url, '_blank', 'noopener,noreferrer');
      }
    },
    [state]
  );

  // Skip Confirmation Flow
  const requestSkipProblem = useCallback((problemId: number) => {
    const prob = state.problems.find((p) => p.id === problemId);
    if (prob) {
      setSkipConfirmProblem(prob);
    }
  }, [state.problems]);

  const cancelSkipProblem = useCallback(() => {
    setSkipConfirmProblem(null);
  }, []);

  const confirmSkipProblem = useCallback(() => {
    if (!skipConfirmProblem) return;
    const pId = skipConfirmProblem.id;
    setSkipConfirmProblem(null);

    // Apply skip status
    updateProblemStatus(pId, 'skipped');
  }, [skipConfirmProblem]);

  // Update Problem Status
  const updateProblemStatus = useCallback(
    (problemId: number, status: ProblemStatus, notes?: string, timeSpent?: number) => {
      const problem = state.problems.find((p) => p.id === problemId);
      if (!problem) return;

      const oldTotalXP = totalXP;
      const oldLevelInfo = getLevelInfo(oldTotalXP);
      const existingProg = state.progress[problemId];
      const now = new Date().toISOString();

      const isRevisitProblem = state.revisits.some(
        (r) => r.problem_id === problemId && !r.graduated
      );
      const isCleanRevisit = isRevisitProblem && status === 'solved_clean';
      const gainedXP = calculateProblemXP(problem.difficulty, status, isCleanRevisit);

      setState((prev) => {
        const newTimeSpent =
          timeSpent !== undefined
            ? timeSpent
            : (existingProg?.time_spent_seconds || 0) + (problemSplitTimes[problemId] || 0);

        const updatedProgress: ProblemProgress = {
          problem_id: problemId,
          status,
          notes: notes !== undefined ? notes : existingProg?.notes || '',
          time_spent_seconds: newTimeSpent,
          attempts: Math.max(1, existingProg?.attempts || 1),
          opened_at: existingProg?.opened_at || now,
          solved_at: ['solved_clean', 'solved_hint', 'needed_solution'].includes(status)
            ? now
            : existingProg?.solved_at,
          last_attempt_at: now,
        };

        const newXpEvents = [...prev.xpEvents];
        if (gainedXP > 0) {
          const xpEvt: XPEvent = {
            id: `xp-${problemId}-${Date.now()}`,
            problem_id: problemId,
            amount: gainedXP,
            reason: `${status.replace('_', ' ')}: LC #${problem.id} ${problem.title}`,
            created_at: now,
          };
          newXpEvents.push(xpEvt);
          syncXPEventToSupabase(xpEvt);
        }

        let newRevisits = [...prev.revisits];
        if (status === 'solved_hint' || status === 'needed_solution') {
          const schedules = createRevisitSchedules(problemId, realityStats.currentDay);
          newRevisits.push(...schedules);
        } else if (status === 'solved_clean' && isRevisitProblem) {
          newRevisits = newRevisits.map((r) =>
            r.problem_id === problemId ? { ...r, graduated: true } : r
          );
        }

        const next = {
          ...prev,
          progress: {
            ...prev.progress,
            [problemId]: updatedProgress,
          },
          xpEvents: newXpEvents,
          revisits: newRevisits,
        };

        syncProgressToSupabase(updatedProgress);
        return next;
      });

      // Feedback & Memes
      if (status === 'solved_clean') {
        triggerConfetti('small');
        triggerMeme('solved_clean', { forceTone: 'hype' });
      } else if (status === 'solved_hint') {
        triggerMeme('solved_hint', { forceTone: 'self' });
      } else if (status === 'needed_solution') {
        triggerMeme('needed_solution', { forceTone: 'self' });
      } else if (status === 'skipped') {
        // Harshest roast meme!
        triggerMeme('skipped', { forceTone: 'roast', ignoreFrequency: true });
      }

      // Level-up moment
      const newTotalXP = oldTotalXP + gainedXP;
      const newLevelInfo = getLevelInfo(newTotalXP);
      if (newLevelInfo.level > oldLevelInfo.level) {
        setLevelUpData({ level: newLevelInfo.level, name: newLevelInfo.name });
        triggerConfetti('large');
        triggerMeme('level_up', { forceTone: 'hype', ignoreFrequency: true, isFullScreen: true });
      }
    },
    [state.problems, state.progress, state.revisits, totalXP, problemSplitTimes, realityStats.currentDay, triggerConfetti, triggerMeme]
  );

  // Complete Day
  const completeDay = useCallback(
    (dayNumber: number): boolean => {
      const dayProblems = state.problems.filter((p) => p.day === dayNumber);
      const allMarked = dayProblems.every((p) => {
        const prog = state.progress[p.id];
        return prog && !['not_started', 'in_progress'].includes(prog.status);
      });

      if (!allMarked) {
        return false;
      }

      const now = new Date().toISOString();
      const dayCompletion: DayCompletion = {
        day_number: dayNumber,
        completed_at: now,
        used_freeze: false,
      };

      const bonusXP: XPEvent = {
        id: `day-${dayNumber}-${Date.now()}`,
        amount: 30,
        reason: `Completed Day ${dayNumber} Mission!`,
        created_at: now,
      };

      const newStreakVal = currentStreak + 1;
      const awardedFreeze = newStreakVal % 7 === 0 ? 1 : 0;

      setState((prev) => {
        const currentFreezeCount = prev.settings.streak_freezes_available;
        const next = {
          ...prev,
          dayCompletions: {
            ...prev.dayCompletions,
            [dayNumber]: dayCompletion,
          },
          xpEvents: [...prev.xpEvents, bonusXP],
          settings: {
            ...prev.settings,
            streak_freezes_available: currentFreezeCount + awardedFreeze,
          },
        };

        syncDayCompletionToSupabase(dayCompletion);
        syncXPEventToSupabase(bonusXP);
        return next;
      });

      triggerConfetti('large');

      // Advance to next day if not day 45
      if (dayNumber < 45) {
        setActiveDay(dayNumber + 1);
      }

      // Streak milestone checks
      if ([3, 7, 14, 21, 30].includes(newStreakVal)) {
        triggerMeme(`streak_${newStreakVal}` as MemeEventName, {
          forceTone: 'hype',
          ignoreFrequency: true,
          isFullScreen: true,
        });
      } else if (dayNumber >= calendarDay && dayNumber < 45) {
        triggerMeme('ahead', { forceTone: 'hype', ignoreFrequency: true });
      } else {
        triggerMeme('day_complete', { forceTone: 'hype', ignoreFrequency: true });
      }

      return true;
    },
    [state.problems, state.progress, currentStreak, triggerConfetti, triggerMeme, setActiveDay, calendarDay]
  );

  const useStreakFreeze = useCallback(
    (dayNumber: number) => {
      if (state.settings.streak_freezes_available <= 0) return;

      const now = new Date().toISOString();
      const freezeCompletion: DayCompletion = {
        day_number: dayNumber,
        completed_at: now,
        used_freeze: true,
      };

      setState((prev) => ({
        ...prev,
        dayCompletions: {
          ...prev.dayCompletions,
          [dayNumber]: freezeCompletion,
        },
        settings: {
          ...prev.settings,
          streak_freezes_available: Math.max(0, prev.settings.streak_freezes_available - 1),
        },
      }));
    },
    [state.settings.streak_freezes_available]
  );

  const updateProblemUrl = useCallback((problemId: number, newUrl: string) => {
    setState((prev) => ({
      ...prev,
      problems: prev.problems.map((p) => (p.id === problemId ? { ...p, url: newUrl } : p)),
    }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings,
      },
    }));
  }, []);

  const updateCheatSheet = useCallback((nodeKey: string, bullets: string[]) => {
    setState((prev) => ({
      ...prev,
      cheatSheets: {
        ...prev.cheatSheets,
        [nodeKey]: bullets,
      },
    }));
  }, []);

  const recordBossFight = useCallback(
    (nodeKey: string, problemId: number, timeTakenSeconds: number, passed: boolean) => {
      const now = new Date().toISOString();
      const completion: BossCompletion = {
        node_key: nodeKey,
        problem_id: problemId,
        time_taken_seconds: timeTakenSeconds,
        passed,
        completed_at: now,
      };

      const bossXP: XPEvent = {
        id: `boss-${nodeKey}-${Date.now()}`,
        amount: passed ? 50 : 10,
        reason: passed ? `Defeated Boss Fight: ${nodeKey}!` : `Attempted Boss Fight: ${nodeKey}`,
        created_at: now,
      };

      setState((prev) => ({
        ...prev,
        bossCompletions: {
          ...prev.bossCompletions,
          [nodeKey]: completion,
        },
        xpEvents: [...prev.xpEvents, bossXP],
      }));

      if (passed) {
        triggerConfetti('large');
        triggerMeme('boss_win', { forceTone: 'hype', ignoreFrequency: true, isFullScreen: true });
      } else {
        triggerMeme('boss_lose', { forceTone: 'self', ignoreFrequency: true });
      }
    },
    [triggerConfetti, triggerMeme]
  );

  const recordMockInterview = useCallback(
    (result: MockInterviewResult) => {
      const now = new Date().toISOString();
      const mockXP: XPEvent = {
        id: `mock-${result.day_number}-${Date.now()}`,
        amount: 100,
        reason: `Completed Mock Interview Day ${result.day_number}!`,
        created_at: now,
      };

      setState((prev) => ({
        ...prev,
        mockInterviews: {
          ...prev.mockInterviews,
          [result.day_number]: {
            ...result,
            completed_at: now,
          },
        },
        xpEvents: [...prev.xpEvents, mockXP],
      }));

      triggerConfetti('large');
      triggerMeme('mock_day', { forceTone: 'self', ignoreFrequency: true });
    },
    [triggerConfetti, triggerMeme]
  );

  const toggleFocusTimer = useCallback(() => {
    setIsFocusTimerRunning((prev) => !prev);
  }, []);

  const resetFocusTimer = useCallback(() => {
    setFocusTimerSeconds(7200);
    setIsFocusTimerRunning(false);
  }, []);

  const closeReturnModal = useCallback(() => setReturnModalProblem(null), []);
  const closeLevelUpModal = useCallback(() => setLevelUpData(null), []);
  const closeStuckNudge = useCallback(() => setIsStuckNudgeOpen(false), []);

  const exportData = useCallback(() => exportStateAsJSON(state), [state]);

  const importData = useCallback((jsonStr: string) => {
    try {
      const imported = importStateFromJSON(jsonStr);
      setState(imported);
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetData = useCallback(() => {
    const init = {
      ...state,
      progress: {},
      dayCompletions: {},
      xpEvents: [],
      revisits: [],
      bossCompletions: {},
      mockInterviews: {},
      settings: {
        start_date: getDefaultStartDate(),
        daily_target: 3,
        streak_freezes_available: 0,
        sound_enabled: false,
        weekly_commitment: '',
        meme_intensity: 'normal' as const,
        meme_frequency: 0.85,
        show_gallery: true,
      },
    };
    setState(init);
    saveStoredState(init);
  }, [state]);

  return (
    <AppContext.Provider
      value={{
        state,
        realityStats,
        activeDay,
        calendarDay,
        setActiveDay,
        totalXP,
        currentStreak,
        longestStreak,
        activeProblem,
        returnModalProblem,
        levelUpData,
        isStuckNudgeOpen,
        focusTimerSeconds,
        isFocusTimerRunning,
        problemSplitTimes,
        activeEventMeme,
        isEventMemeFullScreen,
        triggerMeme,
        closeEventMeme,
        likeCaption,
        hideCaption,
        addCustomCaption,
        skipConfirmProblem,
        requestSkipProblem,
        cancelSkipProblem,
        confirmSkipProblem,
        openProblem,
        closeReturnModal,
        closeLevelUpModal,
        closeStuckNudge,
        updateProblemStatus,
        updateProblemUrl,
        completeDay,
        useStreakFreeze,
        updateSettings,
        updateCheatSheet,
        recordBossFight,
        recordMockInterview,
        toggleFocusTimer,
        resetFocusTimer,
        exportData,
        importData,
        resetData,
        triggerConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
