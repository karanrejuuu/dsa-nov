'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, HelpCircle, AlertCircle, Clock, Save, Edit3 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ProblemStatus } from '@/types';

export const ReturnModal: React.FC = () => {
  const { returnModalProblem, closeReturnModal, updateProblemStatus, state, problemSplitTimes } = useApp();

  const [selectedStatus, setSelectedStatus] = useState<ProblemStatus>('solved_clean');
  const [notes, setNotes] = useState('');
  const [timeTakenMinutes, setTimeTakenMinutes] = useState(20);
  const initializedProblemIdRef = useRef<number | null>(null);

  // Initialize form state ONLY once per opened problem (never overwrite while user is interacting!)
  useEffect(() => {
    if (returnModalProblem) {
      if (initializedProblemIdRef.current !== returnModalProblem.id) {
        initializedProblemIdRef.current = returnModalProblem.id;
        const existingProg = state.progress[returnModalProblem.id];
        const splitSeconds = problemSplitTimes[returnModalProblem.id] || 0;
        const initialMinutes = Math.max(5, Math.round(splitSeconds / 60)) || 15;

        setSelectedStatus(
          existingProg?.status && existingProg.status !== 'in_progress' && existingProg.status !== 'not_started'
            ? existingProg.status
            : 'solved_clean'
        );
        setNotes(existingProg?.notes || '');
        setTimeTakenMinutes(initialMinutes);
      }
    } else {
      initializedProblemIdRef.current = null;
    }
  }, [returnModalProblem?.id]);

  if (!returnModalProblem) return null;

  const handleSave = () => {
    updateProblemStatus(
      returnModalProblem.id,
      selectedStatus,
      notes,
      timeTakenMinutes * 60
    );
    closeReturnModal();
  };

  const difficultyColors = {
    Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Hard: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Back from LeetCode
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                <span>LC #{returnModalProblem.id}: {returnModalProblem.title}</span>
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-xs px-2 py-0.5 rounded border font-medium ${difficultyColors[returnModalProblem.difficulty]}`}>
                  {returnModalProblem.difficulty}
                </span>
                <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  {returnModalProblem.node}
                </span>
              </div>
            </div>
            <button
              onClick={closeReturnModal}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Selection */}
          <div className="mt-5 space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              How did the solve go? (Be Honest)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedStatus('solved_clean')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  selectedStatus === 'solved_clean'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold">Solved clean</div>
                  <div className="text-[11px] text-slate-400">100% XP (×1.0)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('solved_hint')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  selectedStatus === 'solved_hint'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold">Solved with hint</div>
                  <div className="text-[11px] text-slate-400">60% XP (+Revisit)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('needed_solution')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  selectedStatus === 'needed_solution'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300 ring-1 ring-rose-400'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold">Needed solution</div>
                  <div className="text-[11px] text-slate-400">30% XP (+Revisit)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('in_progress')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  selectedStatus === 'in_progress'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 ring-1 ring-sky-400'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Clock className="w-5 h-5 text-sky-400 flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold">Still working</div>
                  <div className="text-[11px] text-slate-400">Keep timer running</div>
                </div>
              </button>
            </div>
          </div>

          {/* Time Taken & Notes */}
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Time Taken (minutes)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={timeTakenMinutes}
                  onChange={(e) => setTimeTakenMinutes(Number(e.target.value))}
                  className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-center focus:outline-none focus:border-cyan-400"
                />
                <span className="text-xs text-slate-400">
                  Target: 20-35 min per Medium
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>What trick did I miss? (Optional note)</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. forgot monotonic stack ordering, missed corner case where array has duplicates..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={closeReturnModal}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Record & Update XP</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
