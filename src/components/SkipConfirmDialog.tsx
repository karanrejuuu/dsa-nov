'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, AlertTriangle, X } from 'lucide-react';
import { Problem } from '@/types';

interface SkipConfirmDialogProps {
  problem: Problem | null;
  isOpen: boolean;
  onCancel: () => void;
  onConfirmSkip: () => void;
}

export const SkipConfirmDialog: React.FC<SkipConfirmDialogProps> = ({
  problem,
  isOpen,
  onCancel,
  onConfirmSkip,
}) => {
  if (!isOpen || !problem) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-sm bg-slate-900 border-2 border-rose-500/70 rounded-2xl p-5 shadow-[0_0_35px_rgba(244,63,94,0.3)] relative text-slate-100"
        >
          <button
            onClick={onCancel}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 text-rose-400 mb-2">
            <Skull className="w-6 h-6 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase">
              SKIP PROTOCOL TRIGGERED
            </span>
          </div>

          <h3 className="text-lg font-black text-white leading-tight">
            Skipping LC #{problem.id}: {problem.title}?
          </h3>

          <p className="text-xs text-rose-200/90 mt-2 leading-relaxed bg-rose-950/30 border border-rose-500/30 rounded-xl p-3">
            &ldquo;Skipping it? The interview will bring it back. Skip anyway?&rdquo;
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold font-mono">
            <button
              onClick={onCancel}
              className="py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-md transition-all text-center"
            >
              Fine, I&apos;ll do it
            </button>

            <button
              onClick={onConfirmSkip}
              className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-md transition-all text-center"
            >
              Yes, I&apos;m cooked
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
