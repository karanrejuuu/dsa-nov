'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const LevelUpModal: React.FC = () => {
  const { levelUpData, closeLevelUpModal, totalXP } = useApp();

  if (!levelUpData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/50 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(6,182,212,0.3)] relative overflow-hidden"
        >
          {/* Neon Glow Accents */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Trophy Badge */}
          <motion.div
            initial={{ rotate: -15, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', damping: 12 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-xl flex items-center justify-center mb-5"
          >
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>
          </motion.div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-2">
            LEVEL UP ACHIEVED
          </span>

          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Level {levelUpData.level}
          </h2>

          <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent mt-1 mb-4">
            {levelUpData.name}
          </div>

          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Your algorithmic problem-solving intuition has ascended. You are building the exact muscle memory required for Tier-1 Bangalore & FAANG technical rounds.
          </p>

          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 mb-6 flex items-center justify-around text-xs font-mono">
            <div>
              <div className="text-slate-400">Total XP</div>
              <div className="text-cyan-400 font-bold text-base">{totalXP} XP</div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div>
              <div className="text-slate-400">Current Rank</div>
              <div className="text-emerald-400 font-bold text-base">{levelUpData.name}</div>
            </div>
          </div>

          <button
            onClick={closeLevelUpModal}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue Quest</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
