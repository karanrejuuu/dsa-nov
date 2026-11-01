'use client';

import React from 'react';
import { Calendar, GitFork, Skull, BarChart3 } from 'lucide-react';
import { soundManager } from '@/lib/sound';

export type MainTab = 'today' | 'tree' | 'reality' | 'stats';

interface BottomNavProps {
  activeTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
  backlogCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  backlogCount = 0,
}) => {
  const tabs = [
    { id: 'today', label: 'Today', icon: Calendar, badge: backlogCount > 0 ? backlogCount : null },
    { id: 'tree', label: 'Tree', icon: GitFork, badge: null },
    { id: 'reality', label: 'Reality', icon: Skull, badge: null },
    { id: 'stats', label: 'Stats', icon: BarChart3, badge: null },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-md pb-safe">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClick();
                onChangeTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer select-none ${
                isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2.5 bg-rose-500 text-white font-mono text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-950 animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] font-mono mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>

              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
