'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MemeCard } from './MemeCard';
import { resolveMemeTemplate, getMeme } from '@/lib/memeEngine';
import { MemeSelectionResult } from '@/lib/memeEngine';

interface LandingHeroProps {
  onStartGrind: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStartGrind }) => {
  const { state } = useApp();
  const [heroMeme, setHeroMeme] = useState<MemeSelectionResult | null>(() => {
    return getMeme('landing', state, { ignoreFrequency: true });
  });

  const handleShuffle = () => {
    const next = getMeme('landing', state, { ignoreFrequency: true });
    if (next) setHeroMeme(next);
  };

  // 4 sample preview captions for marquee
  const previewCaptions = (state.memeCaptions || []).filter((c) =>
    ['solved_clean', 'skipped', 'behind_1', 'boss_win'].includes(c.event)
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 sm:p-6 max-w-md mx-auto">
      {/* Top Tagline */}
      <div className="w-full text-center pt-4 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase">
          <Flame className="w-3.5 h-3.5 fill-cyan-400" />
          <span>DSA QUEST 2027</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          45 days. 120 problems.
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400">
            Zero excuses (just memes).
          </span>
        </h1>

        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          Single source of truth for Bangalore product companies & FAANG technical rounds. Every solve, skip, and missed day gets captioned.
        </p>
      </div>

      {/* Hero Meme Card */}
      <div className="w-full my-4">
        {heroMeme && (
          <div className="space-y-2">
            <MemeCard
              caption={heroMeme.caption}
              template={heroMeme.template}
              showActions={false}
            />
            <div className="flex justify-center">
              <button
                onClick={handleShuffle}
                className="text-xs text-slate-400 hover:text-cyan-400 font-mono flex items-center gap-1 py-1 px-2 rounded cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Shuffle meme</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="w-full pb-6 space-y-3">
        <button
          onClick={onStartGrind}
          className="w-full py-4 px-6 rounded-2xl font-black text-base text-slate-950 bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 hover:from-cyan-300 hover:to-emerald-300 shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>Start The Grind</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-[11px] text-center font-mono text-slate-500">
          Templates via Imgflip · Silent mode active · PWA Installable
        </p>
      </div>
    </div>
  );
};
