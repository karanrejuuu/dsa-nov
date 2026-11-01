import { Problem, ProblemProgress, ProblemStatus, UserSettings, DayCompletion, RevisitItem } from '@/types';
import { SKILL_TREE_NODES, SkillNodeData } from '@/data/skillTreeNodes';

export interface LevelInfo {
  level: number;
  name: string;
  minXP: number;
  nextLevelXP: number;
  currentLevelXP: number;
  neededLevelXP: number;
  progressPercent: number;
  isMaxLevel: boolean;
}

export const LEVELS = [
  { level: 1, name: 'Rookie', minXP: 0, nextLevelXP: 100 },
  { level: 2, name: 'Array Wrangler', minXP: 100, nextLevelXP: 300 },
  { level: 3, name: 'Pointer Ninja', minXP: 300, nextLevelXP: 650 },
  { level: 4, name: 'Graph Walker', minXP: 650, nextLevelXP: 1200 },
  { level: 5, name: 'DP Surgeon', minXP: 1200, nextLevelXP: 1900 },
  { level: 6, name: 'Interview Ready', minXP: 1900, nextLevelXP: 2700 },
  { level: 7, name: 'FAANG Bound', minXP: 2700, nextLevelXP: 3500 },
];

export function calculateProblemXP(difficulty: 'Easy' | 'Medium' | 'Hard', status: ProblemStatus, isCleanRevisit: boolean = false): number {
  if (status === 'skipped' || status === 'not_started' || status === 'in_progress') {
    return 0;
  }

  let base = 10;
  if (difficulty === 'Medium') base = 25;
  if (difficulty === 'Hard') base = 50;

  let multiplier = 1.0;
  if (status === 'solved_hint') multiplier = 0.6;
  if (status === 'needed_solution') multiplier = 0.3;

  let xp = Math.round(base * multiplier);
  if (isCleanRevisit && status === 'solved_clean') {
    xp += 15; // Re-solving a revisit problem clean gives +15 bonus
  }

  return xp;
}

export function getLevelInfo(totalXP: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    const lvl = LEVELS[i];
    if (totalXP >= lvl.minXP) {
      const isMax = i === LEVELS.length - 1;
      const currentLevelXP = totalXP - lvl.minXP;
      const neededLevelXP = lvl.nextLevelXP - lvl.minXP;
      const progressPercent = isMax ? 100 : Math.min(100, Math.round((currentLevelXP / neededLevelXP) * 100));

      return {
        level: lvl.level,
        name: lvl.name,
        minXP: lvl.minXP,
        nextLevelXP: lvl.nextLevelXP,
        currentLevelXP,
        neededLevelXP,
        progressPercent,
        isMaxLevel: isMax,
      };
    }
  }

  return {
    level: 1,
    name: 'Rookie',
    minXP: 0,
    nextLevelXP: 100,
    currentLevelXP: totalXP,
    neededLevelXP: 100,
    progressPercent: Math.min(100, Math.round((totalXP / 100) * 100)),
    isMaxLevel: false,
  };
}

export type NodeState = 'Locked' | 'Available' | 'In progress' | 'Mastered';

export interface NodeStatusSummary {
  nodeKey: string;
  name: string;
  order: number;
  totalProblems: number;
  solvedCount: number;
  cleanCount: number;
  hintCount: number;
  solutionCount: number;
  solveRate: number; // 0 to 100
  cleanRate: number;
  state: NodeState;
  unlockRequirementText?: string;
  bossFightCompleted: boolean;
}

export function getNodeSummaries(
  problems: Problem[],
  progressMap: Record<number, ProblemProgress>,
  bossCompletions: Record<string, { passed: boolean }>
): NodeStatusSummary[] {
  const result: NodeStatusSummary[] = [];

  for (let i = 0; i < SKILL_TREE_NODES.length; i++) {
    const nodeData = SKILL_TREE_NODES[i];
    const nodeProblems = problems.filter((p) => p.node_key === nodeData.key);
    const total = nodeProblems.length || nodeData.expectedProblems;

    let solvedCount = 0;
    let cleanCount = 0;
    let hintCount = 0;
    let solutionCount = 0;

    nodeProblems.forEach((p) => {
      const prog = progressMap[p.id];
      if (prog) {
        if (['solved_clean', 'solved_hint', 'needed_solution'].includes(prog.status)) {
          solvedCount++;
        }
        if (prog.status === 'solved_clean') cleanCount++;
        if (prog.status === 'solved_hint') hintCount++;
        if (prog.status === 'needed_solution') solutionCount++;
      }
    });

    const solveRate = total > 0 ? (solvedCount / total) * 100 : 0;
    const cleanRate = solvedCount > 0 ? (cleanCount / solvedCount) * 100 : 0;
    const bossPassed = !!bossCompletions[nodeData.key]?.passed;

    let state: NodeState = 'Locked';
    let unlockRequirementText: string | undefined;

    if (i === 0) {
      // First node is unlocked by default
      if (solvedCount === 0) state = 'Available';
      else if (solveRate >= 70 && bossPassed) state = 'Mastered';
      else state = 'In progress';
    } else {
      const prevNode = result[i - 1];
      const prevUnlocked = prevNode && prevNode.solveRate >= 70;

      if (!prevUnlocked) {
        state = 'Locked';
        unlockRequirementText = `Unlocks at 70% of ${prevNode ? prevNode.name : 'previous pattern'}`;
      } else {
        if (solvedCount === 0) state = 'Available';
        else if (solveRate >= 70 && bossPassed) state = 'Mastered';
        else state = 'In progress';
      }
    }

    result.push({
      nodeKey: nodeData.key,
      name: nodeData.name,
      order: nodeData.order,
      totalProblems: total,
      solvedCount,
      cleanCount,
      hintCount,
      solutionCount,
      solveRate: Math.round(solveRate),
      cleanRate: Math.round(cleanRate),
      state,
      unlockRequirementText,
      bossFightCompleted: bossPassed,
    });
  }

  return result;
}

export function calculateStreak(
  currentDayIndex: number,
  dayCompletions: Record<number, DayCompletion>
): { currentStreak: number; longestStreak: number; freezableDays: number } {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let day = 1; day <= 45; day++) {
    const isCompleted = !!dayCompletions[day]?.completed_at;
    if (isCompleted) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      if (day < currentDayIndex) {
        tempStreak = 0;
      }
    }
  }

  // Calculate consecutive streak looking back from currentDayIndex or currentDayIndex - 1
  let checkDay = currentDayIndex;
  // If current day is not yet completed, check if streak from yesterday is still intact
  if (!dayCompletions[checkDay]?.completed_at) {
    checkDay = currentDayIndex - 1;
  }

  while (checkDay >= 1 && dayCompletions[checkDay]?.completed_at) {
    currentStreak++;
    checkDay--;
  }

  return {
    currentStreak,
    longestStreak,
    freezableDays: Math.floor(currentStreak / 7),
  };
}

export function createRevisitSchedules(problemId: number, currentDay: number): RevisitItem[] {
  const now = new Date().toISOString();
  return [
    {
      id: `${problemId}-1-${Date.now()}`,
      problem_id: problemId,
      interval_day: 1,
      scheduled_for_day: currentDay + 1,
      graduated: false,
      created_at: now,
    },
    {
      id: `${problemId}-3-${Date.now()}`,
      problem_id: problemId,
      interval_day: 3,
      scheduled_for_day: currentDay + 3,
      graduated: false,
      created_at: now,
    },
    {
      id: `${problemId}-7-${Date.now()}`,
      problem_id: problemId,
      interval_day: 7,
      scheduled_for_day: currentDay + 7,
      graduated: false,
      created_at: now,
    },
  ];
}
