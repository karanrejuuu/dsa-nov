'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Zap,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ProblemLink } from '@/components/ProblemLink';
import { getLevelInfo } from '@/lib/gameLogic';
import { Problem, ProblemStatus } from '@/types';
import { getMeme, MemeSelectionResult } from '@/lib/memeEngine';
import { MemeCard } from '@/components/MemeCard';

export const TodayView: React.FC = () => {
  const {
    state,
    realityStats,
    totalXP,
    currentStreak,
    focusTimerSeconds,
    isFocusTimerRunning,
    toggleFocusTimer,
    resetFocusTimer,
    problemSplitTimes,
    updateProblemStatus,
    requestSkipProblem,
    openProblem,
    completeDay,
    useStreakFreeze,
    likeCaption,
    hideCaption,
  } = useApp();

  const [expandedBacklog, setExpandedBacklog] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showDailyMeme, setShowDailyMeme] = useState(true);
  const [dailyMeme, setDailyMeme] = useState<MemeSelectionResult | null>(null);

  const currentDay = realityStats.currentDay;
  const levelInfo = getLevelInfo(totalXP);

  // Pick Daily Meme (keyed by day, 7-day no-repeat)
  useEffect(() => {
    const meme =
      getMeme('day_complete', state, { ignoreFrequency: true }) ||
      getMeme('landing', state, { ignoreFrequency: true });
    setDailyMeme(meme);
  }, [currentDay, state.settings.meme_intensity]);

  // Today's scheduled problems
  const todayProblems = state.problems.filter((p) => p.day === currentDay);

  // Backlog problems: earlier days not yet solved clean/hint/needed
  const backlogProblems = state.problems.filter((p) => {
    if (p.day >= currentDay) return false;
    const prog = state.progress[p.id];
    return !prog || !['solved_clean', 'solved_hint', 'needed_solution'].includes(prog.status);
  });

  // Today's revisits
  const todayRevisits = state.revisits.filter(
    (r) => r.scheduled_for_day === currentDay && !r.graduated
  );
  const revisitProblems = todayRevisits
    .map((r) => state.problems.find((p) => p.id === r.problem_id))
    .filter(Boolean) as Problem[];

  // Format 2-hour focus timer
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format problem split time
  const formatSplitTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s.toString().padStart(2, '0')}s`;
  };

  // Check if today can be completed
  const isDayCompleted = !!state.dayCompletions[currentDay]?.completed_at;
  const allTodayMarked =
    todayProblems.length > 0 &&
    todayProblems.every((p) => {
      const prog = state.progress[p.id];
      return prog && !['not_started', 'in_progress'].includes(prog.status);
    });

  const handleStartNotes = (p: Problem) => {
    setEditingNotesId(p.id);
    setNoteText(state.progress[p.id]?.notes || '');
  };

  const handleSaveNotes = (pId: number) => {
    updateProblemStatus(pId, state.progress[pId]?.status || 'not_started', noteText);
    setEditingNotesId(null);
  };

  const difficultyColors = {
    Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Hard: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="space-y-5 pb-16">
      {/* 4.1 Header: Day X of 45, Streak, XP Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
              45-DAY FAANG SPRINTS
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Day {currentDay}</span>
              <span className="text-slate-500 text-lg font-normal">/ 45</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-amber-400 font-bold text-sm">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>{currentStreak}d Streak</span>
            </div>

            {/* Rank / Level */}
            <div className="hidden xs:flex flex-col items-end">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Rank</span>
              <span className="text-xs font-bold text-cyan-400">{levelInfo.name}</span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
              <span>Level {levelInfo.level}: <strong className="text-white">{levelInfo.name}</strong></span>
            </span>
            <span className="text-cyan-400 font-bold">
              {totalXP} / {levelInfo.nextLevelXP} XP
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Honest Clean Rate Metric */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Honest Clean-Solve Rate:</span>
          <span className="font-mono font-bold text-slate-200">
            {realityStats.cleanRate}% clean ({realityStats.completedProblems} solved)
          </span>
        </div>
      </div>

      {/* Meme of the Day Card */}
      {dailyMeme && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
              <Smile className="w-4 h-4" />
              <span>MEME OF THE DAY (DAY {currentDay})</span>
            </div>
            <button
              onClick={() => setShowDailyMeme(!showDailyMeme)}
              className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>{showDailyMeme ? 'Collapse' : 'Expand'}</span>
              {showDailyMeme ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <AnimatePresence>
            {showDailyMeme && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-1"
              >
                <MemeCard
                  caption={dailyMeme.caption}
                  template={dailyMeme.template}
                  onLike={likeCaption}
                  onHide={hideCaption}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 2-Hour Focus Timer */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              2-Hour Focused Sprint Timer
            </div>
            <div className="text-2xl font-mono font-bold text-white tracking-wider">
              {formatTime(focusTimerSeconds)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={toggleFocusTimer}
            className={`flex-1 sm:flex-initial py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isFocusTimerRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20'
            }`}
          >
            {isFocusTimerRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Start Sprint</span>
              </>
            )}
          </button>

          <button
            onClick={resetFocusTimer}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset 2-Hour Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Catch-Up Banner (Unfinished Problems from Previous Days) */}
      {backlogProblems.length > 0 ? (
        <div className="bg-rose-500/10 border-2 border-rose-500/40 rounded-2xl p-4 text-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <span>Catch-up Required: {backlogProblems.length} Unfinished Problems</span>
                </div>
                <p className="text-xs text-rose-200/80 mt-0.5">
                  Rule 1: Today&apos;s mission always comes first, but backlog problems must be cleared before new days count toward your streak.
                </p>
              </div>
            </div>

            <button
              onClick={() => setExpandedBacklog(!expandedBacklog)}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 rounded bg-rose-500/20 flex items-center gap-1 cursor-pointer"
            >
              <span>{expandedBacklog ? 'Hide' : 'Review'}</span>
              {expandedBacklog ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {expandedBacklog && (
            <div className="mt-3 pt-3 border-t border-rose-500/20 space-y-2">
              {backlogProblems.map((prob) => (
                <div
                  key={prob.id}
                  className="bg-slate-900/80 rounded-xl p-2.5 flex items-center justify-between border border-slate-800"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono text-slate-400">Day {prob.day}</span>
                    <ProblemLink problem={prob} className="text-sm font-semibold text-white truncate" showIcon />
                  </div>
                  <button
                    onClick={() => openProblem(prob)}
                    className="text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold px-3 py-1 rounded-lg border border-rose-500/40 cursor-pointer flex-shrink-0"
                  >
                    Solve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Backlog: 0 problems</span>
          </div>
          <span className="text-slate-500 italic">Nothing owed. Suspicious.</span>
        </div>
      )}

      {/* Spaced Repetition Revisit Cards */}
      {revisitProblems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Spaced Repetition: Revisit Queue (+15 Bonus XP Clean)
            </h2>
          </div>

          <div className="grid gap-3">
            {revisitProblems.map((prob) => {
              const prog = state.progress[prob.id];
              return (
                <div
                  key={`revisit-${prob.id}`}
                  className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Revisit Active
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium border ${difficultyColors[prob.difficulty]}`}>
                          {prob.difficulty}
                        </span>
                      </div>
                      <ProblemLink problem={prob} className="text-base font-bold text-white" showIcon />
                      <p className="text-xs text-slate-400 mt-1">
                        Pattern: <span className="text-slate-300">{prob.node}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => openProblem(prob)}
                      className="py-2 px-3.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
                    >
                      <span>Re-solve</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's Mission Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Today&apos;s Mission ({todayProblems.length} Problems)
            </h2>
          </div>

          {isDayCompleted && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Day Completed
            </span>
          )}
        </div>

        {todayProblems.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            <p className="text-sm">Days 42-45 are designated for Redo Reviews and Mock Interview simulations.</p>
            <p className="text-xs text-cyan-400 mt-1">Check the Stats tab for mock interview countdown!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {todayProblems.map((prob) => {
              const prog = state.progress[prob.id];
              const status: ProblemStatus = prog?.status || 'not_started';
              const splitTime = problemSplitTimes[prob.id] || prog?.time_spent_seconds || 0;

              return (
                <div
                  key={prob.id}
                  className={`bg-slate-900/90 border rounded-2xl p-4 sm:p-5 transition-all shadow-md ${
                    status === 'solved_clean'
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : status === 'solved_hint'
                      ? 'border-amber-500/40 bg-amber-950/10'
                      : status === 'needed_solution'
                      ? 'border-rose-500/40 bg-rose-950/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top row: tags, LC #, title, Open LC button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                          LC #{prob.id}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium border ${difficultyColors[prob.difficulty]}`}>
                          {prob.difficulty}
                        </span>
                        <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                          {prob.node}
                        </span>
                        {splitTime > 0 && (
                          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            {formatSplitTime(splitTime)}
                          </span>
                        )}
                      </div>

                      <div className="pt-1">
                        <ProblemLink problem={prob} className="text-lg font-bold text-white" showIcon />
                      </div>
                    </div>

                    <button
                      onClick={() => openProblem(prob)}
                      className="w-full sm:w-auto py-2 px-4 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 cursor-pointer transition-all flex-shrink-0"
                    >
                      <span>Open on LeetCode</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Status Control Buttons */}
                  <div className="pt-3 border-t border-slate-800/80">
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                      Status:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => updateProblemStatus(prob.id, 'solved_clean')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          status === 'solved_clean'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 ring-2 ring-emerald-400/50'
                            : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-emerald-400'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Solved clean</span>
                      </button>

                      <button
                        onClick={() => updateProblemStatus(prob.id, 'solved_hint')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          status === 'solved_hint'
                            ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50'
                            : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-amber-400'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>With hint</span>
                      </button>

                      <button
                        onClick={() => updateProblemStatus(prob.id, 'needed_solution')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          status === 'needed_solution'
                            ? 'bg-rose-500 text-white border-rose-400 ring-2 ring-rose-400/50'
                            : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-rose-400'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Needed sol.</span>
                      </button>

                      <button
                        onClick={() => requestSkipProblem(prob.id)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          status === 'skipped'
                            ? 'bg-rose-950/40 text-rose-300 border-rose-500/60'
                            : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-rose-400'
                        }`}
                      >
                        <span>Skipped (0 XP)</span>
                      </button>
                    </div>
                  </div>

                  {/* Notes Field Preview / Edit */}
                  <div className="mt-3 pt-2 text-xs">
                    {editingNotesId === prob.id ? (
                      <div className="space-y-2 mt-1">
                        <textarea
                          rows={2}
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="What trick did I miss? (e.g. forgot two pointer bounds, hash map collision...)"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="px-2.5 py-1 text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNotes(prob.id)}
                            className="px-3 py-1 bg-cyan-500 text-slate-950 font-bold rounded-lg cursor-pointer"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="truncate max-w-[280px]">
                          {prog?.notes ? (
                            <span className="text-slate-300 italic">&ldquo;{prog.notes}&rdquo;</span>
                          ) : (
                            <span className="text-slate-500">No notes added yet</span>
                          )}
                        </span>
                        <button
                          onClick={() => handleStartNotes(prob)}
                          className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer font-medium"
                        >
                          {prog?.notes ? 'Edit note' : '+ Add trick note'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Complete Day Button */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
        <button
          onClick={() => completeDay(currentDay)}
          disabled={!allTodayMarked || isDayCompleted}
          className={`w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 transition-all shadow-xl ${
            isDayCompleted
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
              : allTodayMarked
              ? 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 text-slate-950 shadow-cyan-500/30 hover:shadow-cyan-500/50 scale-[1.01] cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>
            {isDayCompleted
              ? `Day ${currentDay} Locked In (+30 XP Claimed)`
              : allTodayMarked
              ? `Lock it in (+30 Bonus XP)`
              : `Mark All ${todayProblems.length} Problems to Lock in`}
          </span>
        </button>

        {/* Streak freeze helper */}
        {state.settings.streak_freezes_available > 0 && !isDayCompleted && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <span>Streak Freezes Available: {state.settings.streak_freezes_available}</span>
            <button
              onClick={() => useStreakFreeze(currentDay)}
              className="text-amber-400 hover:underline font-bold"
            >
              Use Freeze for Day {currentDay}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
