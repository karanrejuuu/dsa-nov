'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  RotateCcw,
  AlertTriangle,
  Download,
  Upload,
  Swords,
  Timer,
  CheckCircle2,
  Star,
  Settings as SettingsIcon,
  RefreshCw,
  Flame,
  ExternalLink,
  Smile,
  Sliders,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ProblemLink } from '@/components/ProblemLink';
import { SKILL_TREE_NODES } from '@/data/skillTreeNodes';
import { MemeGallery } from '@/components/MemeGallery';
import { soundManager } from '@/lib/sound';
import { MemeIntensity } from '@/types';

export const StatsView: React.FC = () => {
  const {
    state,
    realityStats,
    totalXP,
    currentStreak,
    longestStreak,
    updateSettings,
    updateProblemStatus,
    recordMockInterview,
    exportData,
    importData,
    resetData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'heatmap' | 'revisits' | 'weakspots' | 'mocks' | 'memes' | 'settings'>('heatmap');

  // Mock interview state
  const [selectedMockDay, setSelectedMockDay] = useState<42 | 43 | 44 | 45>(44);
  const [mockTimerSeconds, setMockTimerSeconds] = useState(45 * 60);
  const [isMockTimerRunning, setIsMockTimerRunning] = useState(false);
  const [mockScores, setMockScores] = useState({
    approach_clarity: 4,
    edge_cases: 4,
    complexity_stated: 4,
    communication: 4,
    clean_code: 4,
    notes: '',
  });

  // Calculate pattern weak spots (patterns ranked by hint/solution rate)
  const patternStats = SKILL_TREE_NODES.map((node) => {
    const nodeProbs = state.problems.filter((p) => p.node_key === node.key);
    let attempted = 0;
    let hintOrSolution = 0;
    let clean = 0;

    nodeProbs.forEach((p) => {
      const prog = state.progress[p.id];
      if (prog && prog.status !== 'not_started') {
        attempted++;
        if (prog.status === 'solved_hint' || prog.status === 'needed_solution') {
          hintOrSolution++;
        }
        if (prog.status === 'solved_clean') {
          clean++;
        }
      }
    });

    const leakRate = attempted > 0 ? Math.round((hintOrSolution / attempted) * 100) : 0;
    return {
      key: node.key,
      name: node.name,
      order: node.order,
      attempted,
      clean,
      hintOrSolution,
      leakRate,
    };
  }).sort((a, b) => b.leakRate - a.leakRate);

  // Revisit Queue
  const activeRevisits = state.revisits.filter((r) => !r.graduated);

  // Mock interview timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isMockTimerRunning) {
      interval = setInterval(() => {
        setMockTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsMockTimerRunning(false);
            soundManager.playBossAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMockTimerRunning]);

  const handleStartMock = () => {
    setIsMockTimerRunning(true);
    setMockTimerSeconds(45 * 60);
    soundManager.playClick();
  };

  const handleSaveMockInterview = () => {
    recordMockInterview({
      day_number: (selectedMockDay >= 44 ? selectedMockDay : 44) as 44 | 45,
      completed: true,
      approach_clarity: mockScores.approach_clarity,
      edge_cases: mockScores.edge_cases,
      complexity_stated: mockScores.complexity_stated,
      communication: mockScores.communication,
      clean_code: mockScores.clean_code,
      notes: mockScores.notes,
    });
    setIsMockTimerRunning(false);
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsa-quest-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importData(content);
        if (ok) alert('Data successfully imported!');
        else alert('Failed to parse backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  const formatMockTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-mono font-bold">
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`py-2 px-3 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
            activeTab === 'heatmap'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          45-Day Heatmap
        </button>

        <button
          onClick={() => setActiveTab('revisits')}
          className={`py-2 px-3 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
            activeTab === 'revisits'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          Revisit Queue ({activeRevisits.length})
        </button>

        <button
          onClick={() => setActiveTab('weakspots')}
          className={`py-2 px-3 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
            activeTab === 'weakspots'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          Weak Spots
        </button>

        <button
          onClick={() => setActiveTab('mocks')}
          className={`py-2 px-3 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
            activeTab === 'mocks'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          Mocks (42-45)
        </button>

        <button
          onClick={() => setActiveTab('memes')}
          className={`py-2 px-3 rounded-xl border transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
            activeTab === 'memes'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <Smile className="w-3.5 h-3.5" />
          <span>Meme Grimoire</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2 px-3 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
            activeTab === 'settings'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          Settings & Sync
        </button>
      </div>

      {/* Tab 1: 45-Day Heatmap Calendar */}
      {activeTab === 'heatmap' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-cyan-400">
                SPRINT TRAJECTORY
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">45-Day Matrix</h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Streaks:</span>
              <span className="text-amber-400 font-bold">{currentStreak}d current</span>
              <span className="text-slate-600">/</span>
              <span className="text-emerald-400 font-bold">{longestStreak}d best</span>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-9 gap-2.5">
            {Array.from({ length: 45 }, (_, i) => i + 1).map((day) => {
              const isCompleted = !!state.dayCompletions[day]?.completed_at;
              const isPast = day < realityStats.currentDay;
              const isCurrent = day === realityStats.currentDay;
              const dayProbs = state.problems.filter((p) => p.day === day);
              const anySolved = dayProbs.some(
                (p) => state.progress[p.id]?.status && state.progress[p.id]?.status !== 'not_started'
              );

              return (
                <div
                  key={day}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-all ${
                    isCompleted
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400/40'
                      : anySolved
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : isPast
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-400'
                      : isCurrent
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold">D{day}</span>
                  <span className="text-[9px] mt-0.5">
                    {isCompleted ? '✓' : isPast ? '✗' : isCurrent ? 'NOW' : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-400" />
              <span>Done (Mission Cleared)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-400" />
              <span>Partial / Working</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-950/40 border border-rose-500" />
              <span>Missed (Backlog)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-400" />
              <span>Today</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Revisit Queue (Spaced Repetition) */}
      {activeTab === 'revisits' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[11px] font-mono font-bold uppercase text-amber-400">
              SPACED REPETITION ENGINE
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">Revisit Queue</h2>
            <p className="text-xs text-slate-400 mt-1">
              Problems solved with a hint or solution appear at +1, +3, +7 days. Re-solving clean graduates them and yields +15 bonus XP!
            </p>
          </div>

          {activeRevisits.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              No pending revisits! All hint/solution problems have graduated or none recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {activeRevisits.map((rev) => {
                const prob = state.problems.find((p) => p.id === rev.problem_id);
                if (!prob) return null;
                const prog = state.progress[prob.id];

                return (
                  <div
                    key={rev.id}
                    className="bg-slate-800/70 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          +{rev.interval_day} Day Interval (Due Day {rev.scheduled_for_day})
                        </span>
                        <span className="text-xs text-slate-400">{prob.difficulty}</span>
                      </div>
                      <ProblemLink
                        problem={prob}
                        className="text-sm font-bold text-white"
                        showIcon
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateProblemStatus(prob.id, 'solved_clean')}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                        title="Mark clean re-solve and graduate"
                      >
                        Graduated Clean
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Weak Spots */}
      {activeTab === 'weakspots' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[11px] font-mono font-bold uppercase text-rose-400">
              PATTERN LEAK ANALYSIS
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">Weak Spots Ranking</h2>
            <p className="text-xs text-slate-400 mt-1">
              Patterns ranked by hint & solution reliance. Focus extra reps on the top patterns to eliminate interview surprises.
            </p>
          </div>

          <div className="space-y-3">
            {patternStats.map((pat, idx) => (
              <div
                key={pat.key}
                className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-500 w-5">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{pat.name}</h4>
                    <span className="text-xs text-slate-400">
                      {pat.attempted} attempted · {pat.clean} clean · {pat.hintOrSolution} with hint/solution
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-mono font-bold ${
                      pat.leakRate > 40 ? 'text-rose-400' : pat.leakRate > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {pat.leakRate}% Leak
                  </span>
                  <div className="text-[10px] font-mono text-slate-500">Hint/Solution rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Mock & Review Days (42-45) */}
      {activeTab === 'mocks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[11px] font-mono font-bold uppercase text-purple-400">
              SIMULATION SUITE (DAYS 42 - 45)
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">Final Review & Mock Interviews</h2>
            <p className="text-xs text-slate-400 mt-1">
              Days 42-43 are redo reviews. Days 44-45 are 45-minute timed mock challenges evaluated across 5 interview dimensions.
            </p>
          </div>

          {/* Day selection */}
          <div className="flex items-center gap-2">
            {[42, 43, 44, 45].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedMockDay(d as 42 | 43 | 44 | 45)}
                className={`py-2 px-3.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                  selectedMockDay === d
                    ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/20'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                Day {d} {d <= 43 ? '(Redo)' : '(Mock)'}
              </button>
            ))}
          </div>

          {selectedMockDay <= 43 ? (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-xs text-slate-300 space-y-2">
              <h3 className="font-bold text-white text-sm">
                Day {selectedMockDay}: Redo All {selectedMockDay === 42 ? '"Needed solution"' : '"Solved with hint"'} Problems
              </h3>
              <p>
                Filter your completed problems and re-solve without glancing at solutions. This seals weak neural pathways.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 45-Min Mock Timer */}
              <div className="bg-slate-800/80 rounded-xl p-4 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-purple-300 uppercase">
                    Mock Interview Countdown
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {formatMockTime(mockTimerSeconds)}
                  </div>
                </div>

                <button
                  onClick={isMockTimerRunning ? () => setIsMockTimerRunning(false) : handleStartMock}
                  className="py-2 px-4 rounded-xl font-bold text-xs bg-purple-500 hover:bg-purple-400 text-white transition-colors cursor-pointer"
                >
                  {isMockTimerRunning ? 'Pause Mock' : 'Start 45m Mock'}
                </button>
              </div>

              {/* 5-Axis Self Review Form */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
                <h3 className="text-xs font-mono uppercase font-bold text-cyan-400">
                  FAANG 5-Axis Self-Review (1 to 5 Stars)
                </h3>

                {[
                  { key: 'approach_clarity', label: 'Approach Clarity & Intuition' },
                  { key: 'edge_cases', label: 'Edge Cases Handled' },
                  { key: 'complexity_stated', label: 'Time & Space Complexity Stated' },
                  { key: 'communication', label: 'Verbalizing Thoughts (Communication)' },
                  { key: 'clean_code', label: 'Clean, Idiomatic Python Code' },
                ].map((crit) => (
                  <div key={crit.key} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{crit.label}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() =>
                            setMockScores((prev) => ({
                              ...prev,
                              [crit.key]: star,
                            }))
                          }
                          className="p-1 text-amber-400 cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= (mockScores as any)[crit.key] ? 'fill-amber-400' : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSaveMockInterview}
                  className="w-full py-2.5 mt-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Save Mock Interview (+100 XP)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Meme Grimoire */}
      {activeTab === 'memes' && (
        <MemeGallery />
      )}

      {/* Tab 6: Settings & Sync */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[11px] font-mono font-bold uppercase text-cyan-400">
              CONFIG & MEME SETTINGS
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">Settings</h2>
          </div>

          {/* Configurable Start Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-slate-300 block">
              Sprint Start Date (Derives Day X & Behind Velocity)
            </label>
            <input
              type="date"
              value={state.settings.start_date}
              onChange={(e) => updateSettings({ start_date: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
            />
            <p className="text-[11px] text-slate-500">
              Change start date to test days behind and reality escalation copy.
            </p>
          </div>

          {/* Meme Intensity Selector */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <label className="text-xs font-mono font-bold uppercase text-slate-300 block">
              Meme Roast Intensity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'chill', label: 'Chill', desc: 'Hype only, gentle self' },
                { key: 'normal', label: 'Normal', desc: 'Balanced roasts & hype' },
                { key: 'savage', label: 'Savage', desc: 'Full roasts & cooked doom' },
              ].map((lvl) => {
                const isActive = (state.settings.meme_intensity || 'normal') === lvl.key;
                return (
                  <button
                    key={lvl.key}
                    onClick={() => updateSettings({ meme_intensity: lvl.key as MemeIntensity })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400 text-white ring-1 ring-cyan-400/50'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold block">{lvl.label}</span>
                    <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">{lvl.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meme Frequency Control */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-300 uppercase">Meme Occurrence Rate</span>
              <span className="text-cyan-400 font-bold">
                {Math.round((state.settings.meme_frequency ?? 0.85) * 100)}% of events
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={state.settings.meme_frequency ?? 0.85}
              onChange={(e) => updateSettings({ meme_frequency: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Set to ~85% so plain UI appears occasionally to keep meme drops punchy.
            </p>
          </div>

          {/* Audio Spec Status */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
            <div>
              <span className="font-bold text-white block">Sound Effects</span>
              <span className="text-slate-400">Silent mode strictly enforced per specification</span>
            </div>
            <span className="px-2.5 py-1 bg-slate-800 rounded-lg font-mono text-slate-400 border border-slate-700">
              Silent (Muted)
            </span>
          </div>

          {/* Streak Freeze Inventory */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <div>
              <span className="font-bold text-white block">Streak Freezes Earned</span>
              <span className="text-slate-400">1 earned per 7-day streak milestone</span>
            </div>
            <span className="font-mono font-bold text-amber-400 text-base">
              {state.settings.streak_freezes_available} available
            </span>
          </div>

          {/* Export / Import Data */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-300">
              Data Backup & Portability
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExport}
                className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export All Data (JSON)</span>
              </button>

              <label className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Import Backup</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>
            </div>
          </div>

          {/* Danger Zone: Reset Data */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all progress, streak, and XP?')) {
                  resetData();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-mono"
            >
              Reset all sprint progress to Day 1
            </button>

            <span className="text-[10px] font-mono text-slate-600">
              Templates via Imgflip
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
