'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { TodayView } from '@/components/TodayView';
import { SkillTreeView } from '@/components/SkillTreeView';
import { RealityView } from '@/components/RealityView';
import { StatsView } from '@/components/StatsView';
import { BottomNav, MainTab } from '@/components/BottomNav';
import { ReturnModal } from '@/components/ReturnModal';
import { LevelUpModal } from '@/components/LevelUpModal';
import { StuckNudgeModal } from '@/components/StuckNudgeModal';
import { MemeEventModal } from '@/components/MemeEventModal';
import { SkipConfirmDialog } from '@/components/SkipConfirmDialog';
import { LandingHero } from '@/components/LandingHero';

export default function Home() {
  const [activeTab, setActiveTab] = useState<MainTab>('today');
  const [showLanding, setShowLanding] = useState<boolean | null>(null);

  const {
    realityStats,
    activeEventMeme,
    isEventMemeFullScreen,
    closeEventMeme,
    likeCaption,
    hideCaption,
    skipConfirmProblem,
    cancelSkipProblem,
    confirmSkipProblem,
  } = useApp();

  useEffect(() => {
    // Check if user has already visited/started
    const started = localStorage.getItem('dsa_quest_started_grind');
    if (started === 'true') {
      setShowLanding(false);
    } else {
      setShowLanding(true);
    }
  }, []);

  const handleStartGrind = () => {
    localStorage.setItem('dsa_quest_started_grind', 'true');
    setShowLanding(false);
  };

  // If still hydrating or showing landing page hero
  if (showLanding === true) {
    return <LandingHero onStartGrind={handleStartGrind} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => setShowLanding(true)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left"
            title="Click to view Landing Memes"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-xs shadow-md shadow-cyan-500/20">
              DQ
            </div>
            <span className="font-mono font-bold text-sm tracking-tight text-white">
              DSA QUEST
            </span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Target:</span>
            <span className="font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
              FAANG 2027
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-5">
        {activeTab === 'today' && <TodayView />}
        {activeTab === 'tree' && <SkillTreeView />}
        {activeTab === 'reality' && <RealityView />}
        {activeTab === 'stats' && <StatsView />}
      </main>

      {/* Bottom Tab Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        backlogCount={realityStats.backlogCount}
      />

      {/* Interactive Overlays */}
      <ReturnModal />
      <LevelUpModal />
      <StuckNudgeModal />

      {/* Meme Feedback Modal (Popup / Fullscreen) */}
      <MemeEventModal
        memeData={activeEventMeme}
        onClose={closeEventMeme}
        onLike={likeCaption}
        onHide={hideCaption}
        isFullScreen={isEventMemeFullScreen}
      />

      {/* Skip Confirmation Dialog (Harshest Roast Protocol) */}
      <SkipConfirmDialog
        problem={skipConfirmProblem}
        isOpen={!!skipConfirmProblem}
        onCancel={cancelSkipProblem}
        onConfirmSkip={confirmSkipProblem}
      />
    </div>
  );
}
