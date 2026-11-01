'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Skull,
  TrendingDown,
  TrendingUp,
  Clock,
  Sparkles,
  Quote,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { FEAR_QUOTES, AGE_30_SCENARIOS } from '@/lib/realityCheck';
import { getMeme, MemeSelectionResult } from '@/lib/memeEngine';
import { MemeCard } from '@/components/MemeCard';

export const RealityView: React.FC = () => {
  const { realityStats, state, updateSettings, likeCaption, hideCaption } = useApp();
  const [realitySection, setRealitySection] = useState<'age30' | 'pace' | 'review'>('age30');
  const [age30Path, setAge30Path] = useState<'b' | 'a' | 'both'>('b');
  const [weeklyCommitmentInput, setWeeklyCommitmentInput] = useState(
    state.settings.weekly_commitment || ''
  );
  const [hasSavedCommitment, setHasSavedCommitment] = useState(false);

  // Pick quote based on day
  const quoteIndex = (realityStats.currentDay - 1) % FEAR_QUOTES.length;
  const currentQuote = FEAR_QUOTES[quoteIndex];

  const daysBehind = realityStats.daysBehind;
  const isSevereBehind = daysBehind >= 7;

  // Reality Check Meme: sits on top of the hard numbers
  // 7+ days switches completely to gentle self-deprecating tone per spec
  const realityMeme = useMemo(() => {
    if (daysBehind >= 7) {
      return (
        getMeme('behind_7plus', state, { ignoreFrequency: true, forceTone: 'self' }) ||
        getMeme('behind_3', state, { ignoreFrequency: true, forceTone: 'self' })
      );
    } else if (daysBehind >= 5) {
      return getMeme('behind_5plus', state, { ignoreFrequency: true });
    } else if (daysBehind >= 3) {
      return getMeme('behind_3', state, { ignoreFrequency: true });
    } else if (daysBehind >= 1) {
      return getMeme('behind_1', state, { ignoreFrequency: true });
    } else {
      return getMeme('day_complete', state, { ignoreFrequency: true, forceTone: 'hype' });
    }
  }, [daysBehind, state.settings.meme_intensity]);

  const handleStartRecovery = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    updateSettings({ start_date: todayStr });
  };

  const handleSaveCommitment = () => {
    if (!weeklyCommitmentInput.trim()) return;
    updateSettings({ weekly_commitment: weeklyCommitmentInput.trim() });
    setHasSavedCommitment(true);
    setTimeout(() => setHasSavedCommitment(false), 3000);
  };

  const isBehind = realityStats.daysBehind > 0.3;

  return (
    <div className="space-y-4 pb-20">
      {/* 0. Reality Check Meme (Prominent on Top) */}
      {realityMeme && (
        <div className="space-y-2">
          <MemeCard
            caption={realityMeme.caption}
            template={realityMeme.template}
            onLike={likeCaption}
            onHide={hideCaption}
          />

          {/* Gentle Recovery Callout for 7+ Days Behind */}
          {isSevereBehind && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 text-center space-y-2"
            >
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>We don&apos;t talk about last week</span>
              </div>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                No guilt, no lectures. Reset your timeline to today, lower the daily burden, and pick up 1 problem now.
              </p>
              <button
                onClick={handleStartRecovery}
                className="py-2 px-5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-400/20 hover:scale-[1.02] cursor-pointer transition-all"
              >
                Start Recovery
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* 1. Hard Data Severity Banner (Directly Below Meme) */}
      <div
        className={`border-2 rounded-2xl p-4 sm:p-5 shadow-lg transition-all ${
          realityStats.escalationCopy.severity === 'critical'
            ? 'bg-rose-950/40 border-rose-500 shadow-rose-900/30'
            : realityStats.escalationCopy.severity === 'red'
            ? 'bg-rose-950/30 border-rose-500/70 shadow-rose-900/20'
            : realityStats.escalationCopy.severity === 'amber'
            ? 'bg-amber-950/30 border-amber-500/70 shadow-amber-900/20'
            : 'bg-emerald-950/20 border-emerald-500/40 shadow-emerald-900/20'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            {isBehind ? (
              <Skull className="w-4 h-4 text-rose-400 animate-pulse" />
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-400" />
            )}
            <span
              className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                isBehind
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {realityStats.escalationCopy.badge}
            </span>
          </div>

          <span className="text-xs font-mono font-bold text-slate-300">
            {realityStats.completedProblems} / {realityStats.plannedProblems} Planned
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
          {realityStats.escalationCopy.headline}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
          {realityStats.escalationCopy.subtext}
        </p>

        {isBehind && (
          <div className="mt-3 pt-2.5 border-t border-rose-500/20 flex items-center justify-between text-xs font-mono">
            <span className="text-rose-300 font-bold">
              Pace needed: {realityStats.paceNeeded}/day
            </span>
            <span className="text-slate-400">
              Current: {realityStats.currentPacePerDay}/day
            </span>
          </div>
        )}
      </div>

      {/* 2. Top Navigation Tabs (Declutters Page) */}
      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono font-bold">
        <button
          onClick={() => setRealitySection('age30')}
          className={`flex-1 py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
            realitySection === 'age30'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          💀 Age 30 Fork
        </button>

        <button
          onClick={() => setRealitySection('pace')}
          className={`flex-1 py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
            realitySection === 'pace'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📊 Pace & Future
        </button>

        <button
          onClick={() => setRealitySection('review')}
          className={`flex-1 py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
            realitySection === 'review'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📝 Review & Quote
        </button>
      </div>

      {/* SECTION 1: AGE 30 SIMULATOR (BREATHABLE & DRAMATIC) */}
      {realitySection === 'age30' && (
        <div className="space-y-3">
          {/* Path Toggle Pills */}
          <div className="flex items-center justify-between gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setAge30Path('b')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                age30Path === 'b'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>💀 Path B: Skipped</span>
            </button>

            <button
              onClick={() => setAge30Path('a')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                age30Path === 'a'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🏆 Path A: FAANG</span>
            </button>

            <button
              onClick={() => setAge30Path('both')}
              className={`py-2 px-3 rounded-lg text-xs font-mono transition-all cursor-pointer hidden xs:block ${
                age30Path === 'both'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Compare
            </button>
          </div>

          {/* PATH B: If You Skipped Today (Full Width, Visceral, High Contrast) */}
          {(age30Path === 'b' || age30Path === 'both') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-950/20 border-2 border-rose-500/60 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5"
            >
              <div className="border-b border-rose-500/30 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400">
                    PATH B: EXCUSES WON
                  </span>
                  <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/40">
                    Age 30 Reality
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  {AGE_30_SCENARIOS.skippedToday.title}
                </h3>
                <p className="text-xs text-rose-300 font-mono mt-0.5">
                  Role: {AGE_30_SCENARIOS.skippedToday.lifestyle}
                </p>
              </div>

              {/* Timeline Items (Full Width, Breathable) */}
              <div className="space-y-2.5">
                {AGE_30_SCENARIOS.skippedToday.timeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/80 border border-rose-900/40 rounded-xl p-3 flex items-start gap-3"
                  >
                    <span className="font-mono font-bold text-[11px] text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 flex-shrink-0 mt-0.5">
                      {item.time}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* PATH A: If You Grinded DSA (Full Width, Motivating, Prestigious) */}
          {(age30Path === 'a' || age30Path === 'both') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-950/20 border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5"
            >
              <div className="border-b border-emerald-500/30 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                    PATH A: DISCIPLINE PAID
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                    Age 30 Reality
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  {AGE_30_SCENARIOS.didToday.title}
                </h3>
                <p className="text-xs text-emerald-300 font-mono mt-0.5">
                  Role: {AGE_30_SCENARIOS.didToday.lifestyle}
                </p>
              </div>

              {/* Timeline Items (Full Width, Breathable) */}
              <div className="space-y-2.5">
                {AGE_30_SCENARIOS.didToday.timeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/80 border border-emerald-900/40 rounded-xl p-3 flex items-start gap-3"
                  >
                    <span className="font-mono font-bold text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 flex-shrink-0 mt-0.5">
                      {item.time}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* SECTION 2: PACE & FUTURE YOU (CLEAN & METRIC-DRIVEN) */}
      {realitySection === 'pace' && (
        <div className="space-y-4">
          {/* 4 Metric Chips */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">Planned vs Done</div>
              <div className="text-base font-bold text-white mt-0.5">
                {realityStats.completedProblems} <span className="text-xs text-slate-500">/ {realityStats.plannedProblems}</span>
              </div>
              <div className="text-[10px] mt-0.5 font-mono">
                {realityStats.backlogCount > 0 ? (
                  <span className="text-rose-400 font-bold">-{realityStats.backlogCount} backlog</span>
                ) : (
                  <span className="text-emerald-400 font-bold">On target</span>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">Days Behind</div>
              <div
                className={`text-base font-bold mt-0.5 font-mono ${
                  realityStats.daysBehind > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {realityStats.daysBehind} days
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                (backlog ÷ 2.7)
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">Projected Finish</div>
              <div
                className={`text-sm font-bold mt-0.5 truncate ${
                  isBehind ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {realityStats.projectedFinishDate}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                Target: {realityStats.targetFinishDate}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[10px] font-mono uppercase text-slate-400">Pace Needed</div>
              <div className="text-base font-bold text-cyan-400 mt-0.5 font-mono">
                {realityStats.paceNeeded} / day
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                For next {45 - realityStats.currentDay} days
              </div>
            </div>
          </div>

          {/* Future You Side-by-Side Comparison (Numbers Only) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-mono uppercase font-bold text-cyan-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>&ldquo;Future You&rdquo; Projection (P&L)</span>
            </h3>

            <div className="space-y-3">
              {/* Current Velocity Outcome */}
              <div
                className={`rounded-xl p-3.5 border ${
                  isBehind
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-slate-800/60 border-slate-700/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                  <span>If You Keep Current Pace ({realityStats.currentPacePerDay}/day)</span>
                  {isBehind && <TrendingDown className="w-4 h-4 text-rose-400" />}
                </div>

                <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Finish Date</span>
                    <span className={`font-bold block mt-0.5 ${isBehind ? 'text-rose-400' : 'text-slate-200'}`}>
                      {realityStats.futureYou.currentPace.finishDate}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Solved @ D45</span>
                    <span className={`font-bold block mt-0.5 ${isBehind ? 'text-rose-400' : 'text-slate-200'}`}>
                      {realityStats.futureYou.currentPace.solvedCount} / 120
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Tier</span>
                    <span className="font-bold text-amber-400 block mt-0.5 truncate text-[11px]">
                      {realityStats.futureYou.currentPace.verdict}
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Velocity Outcome */}
              <div className="rounded-xl p-3.5 border bg-emerald-950/20 border-emerald-500/40">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
                  <span>If You Hit Daily Target (120/120)</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Finish Date</span>
                    <span className="text-emerald-300 font-bold block mt-0.5">
                      {realityStats.futureYou.targetPace.finishDate}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Solved @ D45</span>
                    <span className="text-emerald-300 font-bold block mt-0.5">
                      120 / 120
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Tier</span>
                    <span className="font-bold text-emerald-400 block mt-0.5 truncate text-[11px]">
                      FAANG Level
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SUNDAY REVIEW & DISCIPLINE QUOTE */}
      {realitySection === 'review' && (
        <div className="space-y-4">
          {/* Sunday Weekly Review Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">
                  SUNDAY VERDICT
                </span>
                <h3 className="text-base font-bold text-white">Weekly Review</h3>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
                Week {Math.ceil(realityStats.currentDay / 7)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 text-center">
                <span className="text-slate-400 text-[10px] block">Honest Clean Solve Rate</span>
                <span className="text-base font-bold text-white mt-0.5 block">
                  {realityStats.cleanRate}%
                </span>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 text-center">
                <span className="text-slate-400 text-[10px] block">Curriculum Solved</span>
                <span className="text-base font-bold text-cyan-400 mt-0.5 block">
                  {realityStats.completedProblems} / 120
                </span>
              </div>
            </div>

            {/* 1-Sentence Commitment Locker */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-mono font-bold uppercase text-slate-300 block">
                Required Commitment For Next Week:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Finish all 3 DP problems daily before dinner."
                  value={weeklyCommitmentInput}
                  onChange={(e) => setWeeklyCommitmentInput(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleSaveCommitment}
                  className="py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  <Send className="w-3 h-3" />
                  <span>Lock</span>
                </button>
              </div>
              {hasSavedCommitment && (
                <p className="text-[10px] text-emerald-400 font-mono">
                  ✓ Commitment locked in. Hold yourself accountable.
                </p>
              )}
            </div>
          </div>

          {/* Daily Discipline Quote */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <Quote className="w-12 h-12 text-slate-800 absolute -right-1 -bottom-1 pointer-events-none opacity-40" />
            <div className="relative z-10 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                DAILY PILL OF DISCIPLINE
              </span>
              <blockquote className="text-sm sm:text-base font-bold text-slate-100 italic leading-snug">
                &ldquo;{currentQuote.quote}&rdquo;
              </blockquote>
              <div className="text-xs font-mono text-slate-400">— {currentQuote.author}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
