'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Unlock,
  CheckCircle2,
  Swords,
  ChevronRight,
  X,
  Plus,
  Trash2,
  ExternalLink,
  Flame,
  Clock,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SKILL_TREE_NODES, SkillNodeData } from '@/data/skillTreeNodes';
import { getNodeSummaries, NodeStatusSummary } from '@/lib/gameLogic';
import { ProblemLink } from '@/components/ProblemLink';
import { soundManager } from '@/lib/sound';

export const SkillTreeView: React.FC = () => {
  const { state, openProblem, updateCheatSheet, recordBossFight, updateProblemStatus } = useApp();
  const [selectedNode, setSelectedNode] = useState<SkillNodeData | null>(null);

  // Boss Fight Timer state
  const [activeBossNodeKey, setActiveBossNodeKey] = useState<string | null>(null);
  const [bossTimerSeconds, setBossTimerSeconds] = useState(35 * 60);
  const [isBossTimerRunning, setIsBossTimerRunning] = useState(false);

  // Editable cheat sheet state
  const [cheatBullets, setCheatBullets] = useState<string[]>([]);
  const [newBulletText, setNewBulletText] = useState('');

  const nodeSummaries = getNodeSummaries(
    state.problems,
    state.progress,
    state.bossCompletions
  );

  // Sync cheat sheet when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      const stored = state.cheatSheets[selectedNode.key] || selectedNode.cheatSheet;
      setCheatBullets(stored);
    }
  }, [selectedNode, state.cheatSheets]);

  // Boss timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isBossTimerRunning && activeBossNodeKey) {
      interval = setInterval(() => {
        setBossTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsBossTimerRunning(false);
            soundManager.playBossAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBossTimerRunning, activeBossNodeKey]);

  const handleStartBossFight = (node: SkillNodeData) => {
    setActiveBossNodeKey(node.key);
    setBossTimerSeconds(node.bossProblem.timeLimitMinutes * 60);
    setIsBossTimerRunning(true);
    soundManager.playBossAlert();

    // Open Boss problem on LeetCode
    if (typeof window !== 'undefined') {
      window.open(node.bossProblem.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCompleteBossFight = (nodeKey: string, problemId: number) => {
    const timeTaken = 35 * 60 - bossTimerSeconds;
    recordBossFight(nodeKey, problemId, timeTaken, true);
    setIsBossTimerRunning(false);
    setActiveBossNodeKey(null);
  };

  const handleSaveCheatBullet = () => {
    if (!newBulletText.trim() || !selectedNode) return;
    const updated = [...cheatBullets, newBulletText.trim()];
    setCheatBullets(updated);
    updateCheatSheet(selectedNode.key, updated);
    setNewBulletText('');
  };

  const handleDeleteCheatBullet = (index: number) => {
    if (!selectedNode) return;
    const updated = cheatBullets.filter((_, i) => i !== index);
    setCheatBullets(updated);
    updateCheatSheet(selectedNode.key, updated);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Skill Tree Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
              PATTERN MASTERY PATHWAY
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">14 Core DSA Nodes</h1>
            <p className="text-xs text-slate-400 mt-1">
              All 14 pattern modules are unlocked and accessible. Dive into any topic anytime or follow the recommended sequence. Master each node with its 35-minute Boss Fight!
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-400">
              {nodeSummaries.filter((n) => n.state === 'Mastered').length} / 14
            </span>
            <div className="text-[10px] font-mono text-slate-500 uppercase">Mastered</div>
          </div>
        </div>
      </div>

      {/* Visual Pathway Nodes (Connected Path/Graph) */}
      <div className="relative pl-6 sm:pl-8 space-y-6">
        {/* Connecting Line */}
        <div className="absolute left-[23px] sm:left-[31px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-cyan-500 via-emerald-400 to-slate-800" />

        {SKILL_TREE_NODES.map((node, index) => {
          const summary = nodeSummaries[index];
          const isMastered = summary.state === 'Mastered';
          const isInProgress = summary.state === 'In progress';
          const isAvailable = summary.state === 'Available';

          return (
            <motion.div
              key={node.key}
              whileHover={{ scale: 1.01 }}
              onClick={() => {
                setSelectedNode(node);
                soundManager.playClick();
              }}
              className={`relative bg-slate-900 border rounded-2xl p-4 sm:p-5 transition-all shadow-md cursor-pointer ${
                isMastered
                  ? 'border-emerald-500/50 bg-emerald-950/15 shadow-emerald-500/10'
                  : isInProgress
                  ? 'border-cyan-500/50 bg-cyan-950/10 shadow-cyan-500/10'
                  : 'border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/40'
              }`}
            >
              {/* Connector Node Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                  isMastered
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 ring-4 ring-emerald-500/20'
                    : isInProgress
                    ? 'bg-cyan-500 border-cyan-400 text-slate-950 ring-4 ring-cyan-500/20'
                    : 'bg-slate-800 border-slate-600 text-slate-300'
                }`}
              >
                {isMastered ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span>{node.order}</span>
                )}
              </div>

              {/* Node Card Content */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      NODE {node.order}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono font-bold uppercase ${
                        isMastered
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isInProgress
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {summary.state}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{node.name}</span>
                    {isMastered && <Trophy className="w-4 h-4 text-emerald-400" />}
                  </h3>

                  <p className="text-xs text-slate-400">
                    {summary.solvedCount} of {summary.totalProblems} solved ({summary.solveRate}%)
                    {summary.bossFightCompleted && ' · ⚔️ Boss Defeated'}
                  </p>
                </div>

                {/* Progress Ring / Teaser */}
                <div className="flex items-center gap-4">
                  {/* Progress Percentage Circular Metric */}
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-white">
                      {summary.solveRate}%
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {summary.cleanRate}% clean
                    </div>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Node Detail Modal / Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-cyan-400">
                    Pattern {selectedNode.order} of 14
                  </span>
                  <h2 className="text-2xl font-black text-white mt-0.5">{selectedNode.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pattern "When to Use it" Cheat Sheet (Editable) */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-cyan-400">
                    Pattern Intuition Cheat Sheet (Editable)
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {cheatBullets.length} bullet rules
                  </span>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/80 space-y-2">
                  {cheatBullets.map((bullet, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 text-xs text-slate-200">
                      <div className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{bullet}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCheatBullet(i)}
                        className="text-slate-500 hover:text-rose-400 p-0.5 flex-shrink-0"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="pt-2 flex items-center gap-2 border-t border-slate-700/50">
                    <input
                      type="text"
                      placeholder="Add custom rule (e.g. When asking for subarray product, think prefix...)"
                      value={newBulletText}
                      onChange={(e) => setNewBulletText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveCheatBullet()}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={handleSaveCheatBullet}
                      className="px-2.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Boss Fight Challenge Section */}
              <div className="mt-6 bg-gradient-to-r from-purple-950/40 to-slate-900 border-2 border-purple-500/40 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded">
                        NODE BOSS FIGHT (35 MIN)
                      </span>
                      {state.bossCompletions[selectedNode.key]?.passed && (
                        <span className="text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded">
                          DEFEATED
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Swords className="w-4 h-4 text-purple-400" />
                      <span>LC #{selectedNode.bossProblem.id}: {selectedNode.bossProblem.title}</span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Timed 35-minute test. Beating the boss grants +50 XP and marks this pattern Mastered!
                    </p>
                  </div>

                  {activeBossNodeKey === selectedNode.key && isBossTimerRunning ? (
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-mono font-bold text-purple-400">
                        {formatTimer(bossTimerSeconds)}
                      </div>
                      <button
                        onClick={() =>
                          handleCompleteBossFight(selectedNode.key, selectedNode.bossProblem.id)
                        }
                        className="mt-1 px-3 py-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-lg cursor-pointer shadow-md"
                      >
                        I Beat the Boss!
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartBossFight(selectedNode)}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-500/25 flex-shrink-0 cursor-pointer"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>
                        {state.bossCompletions[selectedNode.key]?.passed
                          ? 'Re-attempt Boss'
                          : 'Fight Boss'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Problem List in this Node */}
              <div className="mt-6 space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300">
                  Node Problems ({selectedNode.expectedProblems} total)
                </h3>

                <div className="space-y-2.5">
                  {state.problems
                    .filter((p) => p.node_key === selectedNode.key)
                    .map((prob) => {
                      const prog = state.progress[prob.id];
                      const status = prog?.status || 'not_started';
                      const isClean = status === 'solved_clean';
                      const isHint = status === 'solved_hint';
                      const isSol = status === 'needed_solution';

                      return (
                        <div
                          key={prob.id}
                          className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3 space-y-2.5 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  isClean
                                    ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
                                    : isHint
                                    ? 'bg-amber-400 ring-2 ring-amber-400/30'
                                    : isSol
                                    ? 'bg-rose-400 ring-2 ring-rose-400/30'
                                    : 'bg-slate-600'
                                }`}
                              />
                              <span className="text-xs font-mono text-slate-400 flex-shrink-0">
                                Day {prob.day}
                              </span>
                              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded flex-shrink-0">
                                LC #{prob.id}
                              </span>
                              <ProblemLink
                                problem={prob}
                                className="text-sm font-semibold text-white truncate"
                                showIcon
                              />
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                              <span
                                className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                                  prob.difficulty === 'Easy'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : prob.difficulty === 'Medium'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                }`}
                              >
                                {prob.difficulty}
                              </span>

                              <button
                                onClick={() => openProblem(prob)}
                                className="text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <span>Open</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Quick Status Control */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-700/40 text-xs">
                            <span className="text-[11px] font-mono text-slate-400">
                              Status:{' '}
                              <strong
                                className={
                                  isClean
                                    ? 'text-emerald-400'
                                    : isHint
                                    ? 'text-amber-400'
                                    : isSol
                                    ? 'text-rose-400'
                                    : 'text-slate-500'
                                }
                              >
                                {isClean
                                  ? 'Solved Clean (+20 XP)'
                                  : isHint
                                  ? 'With Hint (+10 XP)'
                                  : isSol
                                  ? 'Needed Solution (+5 XP)'
                                  : 'Not Started'}
                              </strong>
                            </span>

                            <div className="flex items-center gap-1 text-[11px] font-mono">
                              <button
                                onClick={() => updateProblemStatus(prob.id, 'solved_clean')}
                                className={`px-2 py-0.5 rounded border cursor-pointer transition-all ${
                                  isClean
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-emerald-400'
                                }`}
                              >
                                Clean
                              </button>
                              <button
                                onClick={() => updateProblemStatus(prob.id, 'solved_hint')}
                                className={`px-2 py-0.5 rounded border cursor-pointer transition-all ${
                                  isHint
                                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-amber-400'
                                }`}
                              >
                                Hint
                              </button>
                              <button
                                onClick={() => updateProblemStatus(prob.id, 'needed_solution')}
                                className={`px-2 py-0.5 rounded border cursor-pointer transition-all ${
                                  isSol
                                    ? 'bg-rose-500 text-white border-rose-400 font-bold'
                                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-rose-400'
                                }`}
                              >
                                Sol.
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
