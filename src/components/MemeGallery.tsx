'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Heart, EyeOff, Sparkles, Plus, Image as ImageIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MemeCard } from './MemeCard';
import { resolveMemeTemplate } from '@/lib/memeEngine';
import { AddMemeModal } from './AddMemeModal';
import { MemeCaption } from '@/types';

export const MemeGallery: React.FC = () => {
  const { state, likeCaption, hideCaption, addCustomCaption } = useApp();
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const triggeredCaptionIds = new Set(state.memeEvents.map((e) => e.caption_id));
  const likedCaptionIds = new Set(
    state.memeEvents.filter((e) => e.liked).map((e) => e.caption_id)
  );

  const captions = state.memeCaptions || [];

  const events = [
    'all',
    'solved_clean',
    'solved_hint',
    'needed_solution',
    'skipped',
    'day_complete',
    'ahead',
    'behind_1',
    'behind_3',
    'behind_5plus',
    'streak_milestone',
    'level_up',
    'boss_win',
    'boss_lose',
    'mock_day',
    'revisit_due',
    'landing',
  ];

  const filteredCaptions =
    selectedEventFilter === 'all'
      ? captions
      : captions.filter((c) => c.event === selectedEventFilter);

  const unlockedCount = captions.filter((c) => triggeredCaptionIds.has(c.id)).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">
            TRADING CARDS COLLECTION
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">Meme Grimoire</h2>
          <p className="text-xs text-slate-400 mt-1">
            Unlocked: <strong className="text-emerald-400">{unlockedCount}</strong> / {captions.length} cards
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="py-2 px-3.5 bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom</span>
        </button>
      </div>

      {/* Event Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-mono font-bold">
        {events.map((ev) => (
          <button
            key={ev}
            onClick={() => setSelectedEventFilter(ev)}
            className={`py-1.5 px-3 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
              selectedEventFilter === ev
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {ev.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredCaptions.map((caption) => {
          const isUnlocked = triggeredCaptionIds.has(caption.id);
          const template = resolveMemeTemplate(caption.template_name);

          if (isUnlocked) {
            return (
              <MemeCard
                key={caption.id}
                caption={caption}
                template={template}
                onLike={likeCaption}
                onHide={hideCaption}
                isLiked={likedCaptionIds.has(caption.id)}
              />
            );
          }

          // Locked Silhouette Card
          return (
            <div
              key={caption.id}
              className="bg-slate-900/60 border-2 border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2.5 min-h-[220px] relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>

              <div className="text-xs font-mono font-bold text-slate-300">
                🔒 Locked Trading Card
              </div>

              <div className="text-[11px] text-slate-500 max-w-[200px]">
                {caption.event === 'skipped'
                  ? 'Skip a problem to unlock this brutal roast... or don\'t.'
                  : caption.event === 'solved_clean'
                  ? 'Solve a problem clean in one shot to unlock.'
                  : caption.event === 'behind_3'
                  ? 'Fall 3 days behind to awaken this card.'
                  : caption.event === 'boss_win'
                  ? 'Defeat a 35-minute boss fight to unlock.'
                  : `Trigger the "${caption.event.replace('_', ' ')}" event to collect.`}
              </div>

              <span className="text-[9px] font-mono text-slate-600 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Hint: {caption.template_name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer credit */}
      <div className="text-center pt-4 text-[11px] font-mono text-slate-500">
        Templates via Imgflip Public API · Non-commercial personal study tool
      </div>

      <AddMemeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveCaption={addCustomCaption}
      />
    </div>
  );
};
