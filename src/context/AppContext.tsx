'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
import { soundManager } from '@/lib/sound';
import { syncProgressToSupabase, syncDayCompletionToSupabase, syncXPEventToSupabase } from '@/lib/supabase';

interface AppContextType {
  state: AppState;
  realityStats: RealityStats;
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
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [returnModalProblem, setReturnModalProblem] = useState<Problem | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ level: number; name: string } | null>(null);
  const [isStuckNudgeOpen, setIsStuckNudgeOpen] = useState(false);

  // Focus Timer: 2 hours default (7200 seconds)
  const [focusTimerSeconds, setFocusTimerSeconds] = useState(7200);
  const [isFocusTimerRunning, setIsFocusTimerRunning] = useState(false);
  const [problemSplitTimes, setProblemSplitTimes] = useState<Record<number, number>>({});

  const pendingProblemIdRef = useRef<number | null>(null);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    setIsClientMounted(true);
    setState(loadStoredState());
  }, []);

  // Sync sound setting
  useEffect(() => {
    soundManager.setEnabled(state.settings.sound_enabled);
  }, [state.settings.sound_enabled]);

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

  // Timer Tick: handles focus timer, split timers, and 25-minute stuck nudge
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isFocusTimerRunning) {
      interval = setInterval(() => {
        setFocusTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));

        if (activeProblem) {
          setProblemSplitTimes((prev) => {
            const current = (prev[activeProblem.id] || 0) + 1;
            // 25-minute stuck nudge check (1500 seconds)
            if (current === 1500) {
              setIsStuckNudgeOpen(true);
              soundManager.playBossAlert();
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

  // 8.1 Click-through behavior
  const openProblem = useCallback(
    (problem: Problem) => {
      soundManager.playClick();

      // Track return modal
      pendingProblemIdRef.current = problem.id;
      setActiveProblem(problem);
      setIsFocusTimerRunning(true);

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

      // Open LC in new tab
      if (typeof window !== 'undefined') {
        window.open(problem.url, '_blank', 'noopener,noreferrer');
      }
    },
    []
  );

  // Update Problem Status
  const updateProblemStatus = useCallback(
    (problemId: number, status: ProblemStatus, notes?: string, timeSpent?: number) => {
      const problem = state.problems.find((p) => p.id === problemId);
      if (!problem) return;

      const oldTotalXP = totalXP;
      const oldLevelInfo = getLevelInfo(oldTotalXP);

      const existingProg = state.progress[problemId];
      const now = new Date().toISOString();

      // Check if re-solving a revisit clean
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

        // XP Events
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

        // Revisits: auto-schedule at +1, +3, +7 days if solved with hint or needed solution
        let newRevisits = [...prev.revisits];
        if (status === 'solved_hint' || status === 'needed_solution') {
          const schedules = createRevisitSchedules(problemId, realityStats.currentDay);
          newRevisits.push(...schedules);
        } else if (status === 'solved_clean' && isRevisitProblem) {
          // Graduate active revisit
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

      // Feedback: sound + confetti + level up
      if (['solved_clean', 'solved_hint', 'needed_solution'].includes(status)) {
        soundManager.playSuccess();
        triggerConfetti('small');

        const newTotalXP = oldTotalXP + gainedXP;
        const newLevelInfo = getLevelInfo(newTotalXP);
        if (newLevelInfo.level > oldLevelInfo.level) {
          setLevelUpData({ level: newLevelInfo.level, name: newLevelInfo.name });
          soundManager.playLevelUp();
          triggerConfetti('large');
        }
      }
    },
    [state.problems, state.progress, state.revisits, totalXP, problemSplitTimes, realityStats.currentDay, triggerConfetti]
  );

  // Complete Day
  const completeDay = useCallback(
    (dayNumber: number): boolean => {
      // Check if all today's problems are marked (not not_started or in_progress)
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

      // Bonus XP for day completion
      const bonusXP: XPEvent = {
        id: `day-${dayNumber}-${Date.now()}`,
        amount: 30,
        reason: `Completed Day ${dayNumber} Mission!`,
        created_at: now,
      };

      setState((prev) => {
        // Calculate streak freeze earned per 7-day streak
        const currentFreezeCount = prev.settings.streak_freezes_available;
        const newStreakVal = currentStreak + 1;
        const awardedFreeze = newStreakVal % 7 === 0 ? 1 : 0;

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

      soundManager.playSuccess();
      triggerConfetti('large');
      return true;
    },
    [state.problems, state.progress, currentStreak, triggerConfetti]
  );

  // Use Streak Freeze
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

      soundManager.playSuccess();
    },
    [state.settings.streak_freezes_available]
  );

  // Update Problem URL (Section 8.1: editable in detail sheet if LC changes slug)
  const updateProblemUrl = useCallback((problemId: number, newUrl: string) => {
    setState((prev) => ({
      ...prev,
      problems: prev.problems.map((p) => (p.id === problemId ? { ...p, url: newUrl } : p)),
    }));
  }, []);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings,
      },
    }));
  }, []);

  // Update Cheat Sheet
  const updateCheatSheet = useCallback((nodeKey: string, bullets: string[]) => {
    setState((prev) => ({
      ...prev,
      cheatSheets: {
        ...prev.cheatSheets,
        [nodeKey]: bullets,
      },
    }));
  }, []);

  // Record Boss Fight Victory
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
        soundManager.playSuccess();
        triggerConfetti('large');
      }
    },
    [triggerConfetti]
  );

  // Record Mock Interview
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

      soundManager.playSuccess();
      triggerConfetti('large');
    },
    [triggerConfetti]
  );

  // Timer controls
  const toggleFocusTimer = useCallback(() => {
    setIsFocusTimerRunning((prev) => !prev);
    soundManager.playClick();
  }, []);

  const resetFocusTimer = useCallback(() => {
    setFocusTimerSeconds(7200);
    setIsFocusTimerRunning(false);
  }, []);

  // Modals
  const closeReturnModal = useCallback(() => setReturnModalProblem(null), []);
  const closeLevelUpModal = useCallback(() => setLevelUpData(null), []);
  const closeStuckNudge = useCallback(() => setIsStuckNudgeOpen(false), []);

  // Export / Import / Reset
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
