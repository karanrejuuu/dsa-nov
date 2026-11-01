'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Skull,
  AlertTriangle,
  Flame,
  Calendar,
  Clock,
  TrendingDown,
  TrendingUp,
  Quote,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Send,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { FEAR_QUOTES, AGE_30_SCENARIOS } from '@/lib/realityCheck';

export const RealityView: React.FC = () => {
  const { realityStats, state, updateSettings } = useApp();
  const [weeklyCommitmentInput, setWeeklyCommitmentInput] = useState(
    state.settings.weekly_commitment || ''
  );
  const [hasSavedCommitment, setHasSavedCommitment] = useState(false);

  // Pick quote based on day
  const quoteIndex = (realityStats.currentDay - 1) % FEAR_QUOTES.length;
  const currentQuote = FEAR_QUOTES[quoteIndex];

  const handleSaveCommitment = () => {
    if (!weeklyCommitmentInput.trim()) return;
    updateSettings({ weekly_commitment: weeklyCommitmentInput.trim() });
    setHasSavedCommitment(true);
    setTimeout(() => setHasSavedCommitment(false), 3000);
  };

  const isBehind = realityStats.daysBehind > 0.3;

  return (
    <div className="space-y-6 pb-20">
      {/* Escalating Reality Banner */}
      <div
        className={`border-2 rounded-2xl p-5 shadow-xl transition-all ${
          realityStats.escalationCopy.severity === 'critical'
            ? 'bg-rose-950/40 border-rose-500 shadow-rose-900/30'
            : realityStats.escalationCopy.severity === 'red'
            ? 'bg-rose-950/30 border-rose-500/70 shadow-rose-900/20'
            : realityStats.escalationCopy.severity === 'amber'
            ? 'bg-amber-950/30 border-amber-500/70 shadow-amber-900/20'
            : 'bg-emerald-950/20 border-emerald-500/40 shadow-emerald-900/20'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          {isBehind ? (
            <Skull className="w-5 h-5 text-rose-400 animate-pulse" />
          ) : (
            <Sparkles className="w-5 h-5 text-emerald-400" />
          )}
          <span
            className={`text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded ${
              isBehind
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {realityStats.escalationCopy.badge}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
          {realityStats.escalationCopy.headline}
        </h2>

        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          {realityStats.escalationCopy.subtext}
        </p>

        {isBehind && (
          <div className="mt-4 pt-3 border-t border-rose-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <span className="text-rose-300 font-bold">
              Required pace to finish Day 45: {realityStats.paceNeeded} problems/day
            </span>
            <span className="text-slate-400">
              Current velocity: {realityStats.currentPacePerDay} / day
            </span>
          </div>
        )}
      </div>

      {/* Numerical Reality Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
          <div className="text-[10px] font-mono uppercase text-slate-400">Planned vs Done</div>
          <div className="text-lg font-bold text-white mt-1">
            {realityStats.completedProblems} <span className="text-xs text-slate-500">/ {realityStats.plannedProblems}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
            {realityStats.backlogCount > 0 ? (
              <span className="text-rose-400 font-bold">-{realityStats.backlogCount} backlog</span>
            ) : (
              <span className="text-emerald-400 font-bold">On target</span>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
          <div className="text-[10px] font-mono uppercase text-slate-400">Days Behind</div>
          <div
            className={`text-lg font-bold mt-1 font-mono ${
              realityStats.daysBehind > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {realityStats.daysBehind} days
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
            (backlog ÷ 2.7)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
          <div className="text-[10px] font-mono uppercase text-slate-400">Projected Finish</div>
          <div
            className={`text-sm font-bold mt-1 truncate ${
              isBehind ? 'text-rose-400' : 'text-emerald-400'
            }`}
            title={realityStats.projectedFinishDate}
          >
            {realityStats.projectedFinishDate}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            Target: Day 45
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
          <div className="text-[10px] font-mono uppercase text-slate-400">Pace Needed</div>
          <div className="text-lg font-bold text-cyan-400 mt-1 font-mono">
            {realityStats.paceNeeded} / day
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
            Next {45 - realityStats.currentDay} days
          </div>
        </div>
      </div>

      {/* 4.5 "Future You" Panel: Numbers Only, No Fiction */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-cyan-400 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>&ldquo;Future You&rdquo; Projection (Pace P&L)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Current Pace Column */}
          <div
            className={`rounded-xl p-4 border ${
              isBehind
                ? 'bg-rose-950/20 border-rose-500/40'
                : 'bg-slate-800/60 border-slate-700/80'
            }`}
          >
            <div className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center justify-between">
              <span>If You Keep Current Pace ({realityStats.currentPacePerDay}/day)</span>
              {isBehind && <TrendingDown className="w-4 h-4 text-rose-400" />}
            </div>

            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Finish Date:</span>
                <span className={isBehind ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                  {realityStats.futureYou.currentPace.finishDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Solved by Day 45:</span>
                <span className={isBehind ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                  {realityStats.futureYou.currentPace.solvedCount} / 120
                </span>
              </div>
              <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center">
                <span className="text-slate-400">Placement Bar:</span>
                <span className="text-xs font-bold text-amber-400">
                  {realityStats.futureYou.currentPace.verdict}
                </span>
              </div>
            </div>
          </div>

          {/* Target Pace Column */}
          <div className="rounded-xl p-4 border bg-emerald-950/20 border-emerald-500/40">
            <div className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center justify-between">
              <span>If You Hit Daily Target (120/120)</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Finish Date:</span>
                <span className="text-emerald-300 font-bold">
                  {realityStats.futureYou.targetPace.finishDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Solved by Day 45:</span>
                <span className="text-emerald-300 font-bold">
                  120 / 120 (100% Curriculum)
                </span>
              </div>
              <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center">
                <span className="text-slate-400">Placement Bar:</span>
                <span className="text-xs font-bold text-emerald-400">
                  {realityStats.futureYou.targetPace.verdict}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BRUTAL "Day in the Life at Age 30" Side-by-Side (User Explicit Request) */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-5 shadow-2xl">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-[11px] font-mono font-bold tracking-widest text-rose-400 uppercase">
            FEAR PROTOCOL: THE FORK IN THE ROAD
          </span>
          <h2 className="text-2xl font-black text-white mt-1">
            Your Day in the Life at Age 30
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Every problem you skip today has compound interest. Read both sides carefully before opening YouTube or Instagram.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT: If you did this today */}
          <div className="bg-emerald-950/20 border-2 border-emerald-500/40 rounded-xl p-5 space-y-4">
            <div className="border-b border-emerald-500/30 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400">
                PATH A: DISCIPLINE PAID
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {AGE_30_SCENARIOS.didToday.title}
              </h3>
              <p className="text-xs text-emerald-300 font-mono mt-1">
                Role: {AGE_30_SCENARIOS.didToday.lifestyle}
              </p>
            </div>

            <div className="space-y-3">
              {AGE_30_SCENARIOS.didToday.timeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex-shrink-0">
                    {item.time}
                  </span>
                  <span className="text-slate-300 leading-relaxed">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: If you didn't do this today (Brutally Bad) */}
          <div className="bg-rose-950/25 border-2 border-rose-500/60 rounded-xl p-5 space-y-4">
            <div className="border-b border-rose-500/30 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-rose-400">
                PATH B: EXCUSES WON
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {AGE_30_SCENARIOS.skippedToday.title}
              </h3>
              <p className="text-xs text-rose-300 font-mono mt-1">
                Role: {AGE_30_SCENARIOS.skippedToday.lifestyle}
              </p>
            </div>

            <div className="space-y-3">
              {AGE_30_SCENARIOS.skippedToday.timeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex-shrink-0">
                    {item.time}
                  </span>
                  <span className="text-slate-300 leading-relaxed">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Brutal Fear Quote Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
        <Quote className="w-16 h-16 text-slate-800 absolute -right-2 -bottom-2 pointer-events-none opacity-40" />
        <div className="relative z-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-2">
            DAILY PILL OF DISCIPLINE
          </span>
          <blockquote className="text-base sm:text-lg font-bold text-slate-100 italic leading-snug">
            &ldquo;{currentQuote.quote}&rdquo;
          </blockquote>
          <div className="text-xs font-mono text-slate-400 mt-2">— {currentQuote.author}</div>
        </div>
      </div>

      {/* Sunday Weekly Review Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase text-cyan-400">
              WEEKLY REVIEW PROTOCOL
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">Sunday Honest Verdict</h3>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
            Week {Math.ceil(realityStats.currentDay / 7)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block">Clean Solve Rate</span>
            <span className="text-base font-bold text-white mt-0.5 block">
              {realityStats.cleanRate}%
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 block">Total Solved</span>
            <span className="text-base font-bold text-cyan-400 mt-0.5 block">
              {realityStats.completedProblems} / 120
            </span>
          </div>
        </div>

        {/* Required 1-sentence commitment for next week */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-mono font-bold uppercase text-slate-300 block">
            Required 1-Sentence Commitment For Next Week:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. I will solve all 3 Daily DP problems before 9:00 PM without opening Instagram."
              value={weeklyCommitmentInput}
              onChange={(e) => setWeeklyCommitmentInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleSaveCommitment}
              className="py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Commit</span>
            </button>
          </div>
          {hasSavedCommitment && (
            <p className="text-[11px] text-emerald-400 font-mono">
              ✓ Commitment locked in. Hold yourself accountable.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
