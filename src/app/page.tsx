'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TodayView } from '@/components/TodayView';
import { SkillTreeView } from '@/components/SkillTreeView';
import { RealityView } from '@/components/RealityView';
import { StatsView } from '@/components/StatsView';
import { BottomNav, MainTab } from '@/components/BottomNav';
import { ReturnModal } from '@/components/ReturnModal';
import { LevelUpModal } from '@/components/LevelUpModal';
import { StuckNudgeModal } from '@/components/StuckNudgeModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<MainTab>('today');
  const { realityStats } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-xs shadow-md shadow-cyan-500/20">
              DQ
            </div>
            <span className="font-mono font-bold text-sm tracking-tight text-white">
              DSA QUEST
            </span>
          </div>

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
    </div>
  );
}
