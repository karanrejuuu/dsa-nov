'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Lightbulb, BookOpen, RotateCcw, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const StuckNudgeModal: React.FC = () => {
  const { isStuckNudgeOpen, closeStuckNudge, activeProblem } = useApp();

  if (!isStuckNudgeOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl relative text-slate-100"
        >
          <button
            onClick={closeStuckNudge}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-400">
                STUCK PROTOCOL (25 MIN TRIGGER)
              </span>
              <h3 className="text-base font-bold text-white">
                Don't Burn Your 2-Hour Window
              </h3>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            You have spent 25 focused minutes on{' '}
            <span className="text-cyan-400 font-semibold">
              {activeProblem ? activeProblem.title : 'this problem'}
            </span>
            . Spending 90 minutes stuck on one problem kills momentum and causes burnout.
          </p>

          <div className="space-y-3 bg-slate-800/60 rounded-xl p-4 border border-slate-700/80 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <div className="text-xs text-slate-300">
                <span className="font-bold text-white block">Read 1 Hint / Look at Constraints</span>
                Check the LeetCode hint section or rethink the time complexity target.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <div className="text-xs text-slate-300">
                <span className="font-bold text-white block">If Still Stuck in 5 Min: Inspect Top Solution</span>
                Understand the pattern mechanism (why heap? why sliding window invariant?).
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <div className="text-xs text-slate-300">
                <span className="font-bold text-white block">Mark "Needed solution" & Re-solve Tomorrow</span>
                The spaced repetition queue will automatically test your retention at +1, +3, +7 days.
              </div>
            </div>
          </div>

          <button
            onClick={closeStuckNudge}
            className="w-full py-3 px-4 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer text-sm"
          >
            Got it, I'll Check Hint / Solution
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
