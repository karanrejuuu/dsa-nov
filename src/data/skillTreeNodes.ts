export interface SkillNodeData {
  key: string;
  name: string;
  order: number;
  expectedProblems: number;
  icon: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  cheatSheet: string[];
  bossProblem: {
    id: number;
    title: string;
    slug: string;
    url: string;
    difficulty: 'Medium' | 'Hard';
    timeLimitMinutes: number;
  };
}

export const SKILL_TREE_NODES: SkillNodeData[] = [
  {
    key: 'arrays-hashing',
    name: 'Arrays & Hashing',
    order: 1,
    expectedProblems: 10,
    icon: 'Hash',
    color: '#38bdf8', // sky-400
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    borderColor: 'border-sky-500',
    cheatSheet: [
      'Use Hash Map for O(1) lookups to trade space for time (e.g. Two Sum complements).',
      'Prefix sums allow O(1) range sum queries after O(n) preprocessing.',
      'Frequency counting array or hash table for anagrams and duplicate detections.',
      'For in-place array manipulation, consider prefix/suffix products without division.'
    ],
    bossProblem: {
      id: 41,
      title: 'First Missing Positive',
      slug: 'first-missing-positive',
      url: 'https://leetcode.com/problems/first-missing-positive/',
      difficulty: 'Hard',
      timeLimitMinutes: 35
    }
  },
  {
    key: 'two-pointers',
    name: 'Two Pointers',
    order: 2,
    expectedProblems: 8,
    icon: 'ChevronsLeftRight',
    color: '#34d399', // emerald-400
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500',
    cheatSheet: [
      'Opposite ends: for sorted arrays (Two Sum II, 3Sum) or palindromes.',
      'Fast & Slow: for cycle detection, middle of list, or in-place removals.',
      'Container with Most Water: move the pointer with the shorter height to search for larger area.',
      'Trapping Rain Water: keep leftMax and rightMax bounds to calculate trapped water per index.'
    ],
    bossProblem: {
      id: 16,
      title: '3Sum Closest',
      slug: '3sum-closest',
      url: 'https://leetcode.com/problems/3sum-closest/',
      difficulty: 'Medium',
      timeLimitMinutes: 35
    }
  },
  {
    key: 'sliding-window',
    name: 'Sliding Window',
    order: 3,
    expectedProblems: 8,
    icon: 'MoveHorizontal',
    color: '#f43f5e', // rose-500
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    borderColor: 'border-rose-500',
    cheatSheet: [
      'Fixed window size: slide right, add incoming element, drop outgoing element (e.g. max sum subarray of size k).',
      'Dynamic window size: expand right to satisfy condition, contract left to minimize or restore validity.',
      'String matching / anagrams: maintain frequency counter and track matching character count.',
      'Monotonic deque optimization: maintains min/max in O(1) amortized for sliding window maximum.'
    ],
    bossProblem: {
      id: 480,
      title: 'Sliding Window Median',
      slug: 'sliding-window-median',
      url: 'https://leetcode.com/problems/sliding-window-median/',
      difficulty: 'Hard',
      timeLimitMinutes: 35
    }
  },
  {
    key: 'stack',
    name: 'Stack',
    order: 4,
    expectedProblems: 8,
    icon: 'Layers',
    color: '#a78bfa', // purple-400
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderColor: 'border-purple-500',
    cheatSheet: [
      'LIFO structure: ideal for nested structures, parentheses matching, and expression evaluation.',
      'Monotonic Stack: find Next Greater Element / Previous Smaller Element in O(N).',
      'Histogram largest rectangle: store indices with increasing heights; pop and calculate area when smaller height appears.',
      'Keep state transitions or multipliers when decoding nested strings or calculator expressions.'
    ],
    bossProblem: {
      id: 85,
      title: 'Maximal Rectangle',
      slug: 'maximal-rectangle',
      url: 'https://leetcode.com/problems/maximal-rectangle/',
      difficulty: 'Hard',
      timeLimitMinutes: 35
    }
  },
  {
    key: 'binary-search',
    name: 'Binary Search',
    order: 5,
    expectedProblems: 8,
    icon: 'Search',
    color: '#38bdf8', // sky-400
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    borderColor: 'border-sky-500',
    cheatSheet: [
      'Template: low <= high or low < high; avoid integer overflow with mid = low + (high - low) // 2.',
      'Binary Search on Answer / Feasibility: when answer range is monotonic (e.g. Koko Bananas, Capacity to Ship Packages).',
      'Rotated Sorted Array: at least one half is always sorted! Identify which half is sorted and check if target falls in it.',
      'Find peak / boundary: compare mid with mid + 1 to decide slope direction.'
    ],
    bossProblem: {
      id: 81,
      title: 'Search in Rotated Sorted Array II',
      slug: 'search-in-rotated-sorted-array-ii',
      url: 'https://leetcode.com/problems/search-in-rotated-sorted-array-ii/',
      difficulty: 'Medium',
      timeLimitMinutes: 35
    }
  },
  {
    key: 'linked-list',
    name: 'Linked List',
    order: 6,
    expectedProblems: 8,
    icon: 'GitCommit',
    color: '#2dd4bf', // teal-400
    badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    borderColor: 'border-teal-500',
    cheatSheet: [
      'Always use a Dummy Head (`dummy = ListNode(0)`) to eliminate edge cases for head removals/insertions.',
      'Reverse in-place: prev, curr, next pointers loop (`next_node = curr.next; curr.next = prev; prev = curr; curr = next_node`).',
      'Fast and Slow pointers (Floyd Cycle): detect cycles and find starting node of loop.',
      'LRU Cache: combine Double Linked List for O(1) removal/append with Hash Map for O(1) key lookups.'
    ],
    bossProblem: {
      id: 23,
      title: 'Merge k Sorted Lists',
      slug: 'merge-k-sorted-lists',
      url: 'https://leetcode.com/problems/merge-k-sorted-lists/',
      difficulty: 'Hard',
      timeLimitMinutes: 35
    }
  },
  {
    key: 'trees',
    name: 'Trees',
    order: 7,
    expectedProblems: 12,
    icon: 'FolderTree',
    color: '#4ade80', // green-400
    badgeBg: 'bg-green-500/10 text-green-400 border-green-500/30',
    borderColor: 'border-green-500',
    cheatSheet: [
      'DFS (Recursion): bottom-up tree DP (diameter, max path sum) returns info to parent, updates global max.',
      'BFS (Queue): level-order traversals, shortest path in unweighted trees, right-side views.',
      'BST properties: in-order traversal produces strictly ascending sorted order; LCA found by values comparison.',
      'Construct tree from traversals: Preorder gives root, Inorder splits left and right subtrees.'
    ],
    bossProblem: {
      id: 297,
      title: 'Serialize and Deserialize Binary Tree',
      slug: 'serialize-and-deserialize-binary-tree',
      url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',
      difficulty: 'Hard',
      timeLimitMinutes: 35
    }
  },
  {
    key: 'heap',
    name: 'Heap / Priority Queue',
    order: 8,
    expectedProblems: 6,
    icon: 'TrendingUp',
    color: '#fbbf24', // amber-400
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderColor: 'border-amber-500',
    cheatSheet: [
      'Python `heapq` is a min-heap by default. Push negative values for max-heap.',
      'Top K elements: maintain min-heap of size K for K largest; peek gives K-th largest in O(N log K).',
      'Two Heaps pattern: max-heap for lower half, min-heap for upper half for continuous stream median.',
      'Greedy scheduling: priority queue to track earliest available time slots or coolest task timers.'
    ],
    bossProblem: {
      id: 253,
      title: 'Meeting Rooms II',
      slug: 'meeting-rooms-ii',
      url: 'https://leetcode.com/problems/meeting-rooms-ii/',
      difficulty: 'Medium',
      timeLimitMinutes: 35
    }
  },
  {
    key: 'backtracking',
    name: 'Backtracking',
    order: 9,
    expectedProblems: 10,
    icon: 'Undo2',
    color: '#fb923c', // orange-400
    badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    borderColor: 'border-orange-500',
    cheatSheet: [
      'Standard template: Choose -> Explore (recurse) -> Unchoose (backtrack state/pop).',
      'Duplicates pruning: sort array first; skip `if i > start and nums[i] == nums[i-1]: continue`.',
      'Combination Sum vs Permutations: use `start_index` for combinations/subsets; use `visited` set for permutations.',
      'N-Queens & Grid: track column, diag (r+c), and anti-diag (r-c) attacks in O(1) sets.'
    ],
    bossProblem: {
      id: 37,
      title: 'Sudoku Solver',
      slug: 'sudoku-solver',
      url: 'https://leetcode.com/problems/sudoku-solver/',
      difficulty: 'Hard',
      timeLimitMinutes: 35
    }
  },
  {
    key: 'graphs',
    name: 'Graphs',
    order: 10,
    expectedProblems: 12,
    icon: 'Network',
    color: '#818cf8', // indigo-400
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    borderColor: 'border-indigo-500',
    cheatSheet: [
      'Grid graphs (Islands/Oranges): in-place marking or visited set with 4-directional moves `[(0,1),(0,-1),(1,0),(-1,0)]`.',
      'Topological Sort (Kahn algorithm / in-degree array): cycle detection and prerequisite ordering (Course Schedule).',
      'Union-Find (Disjoint Set Union with path compression & rank): dynamic connectivity and cycle detection in undirected graphs.',
      'Dijkstra Algorithm: shortest path with non-negative edge weights using priority queue `(dist, node)`.'
    ],
    bossProblem: {
      id: 778,
      title: 'Swim in Rising Water',
      slug: 'swim-in-rising-water',
      url: 'https://leetcode.com/problems/swim-in-rising-water/',
      difficulty: 'Hard',
      timeLimitMinutes: 35
    }
  },
  {
    key: 'dp-1d',
    name: 'Dynamic Programming 1D',
    order: 11,
    expectedProblems: 12,
    icon: 'Cpu',
    color: '#e879f9', // fuchsia-400
    badgeBg: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
    borderColor: 'border-fuchsia-500',
    cheatSheet: [
      'Identify subproblem: what does `dp[i]` represent? (e.g. max profit, min steps, count ways).',
      'Transition formula: build from previous states (e.g. `dp[i] = dp[i-1] + dp[i-2]`).',
      'Base cases & boundary conditions: initialize carefully (e.g. `dp[0] = 0`, infinity for min).',
      'Space optimization: if state only depends on last 1 or 2 steps, reduce space from O(N) to O(1) variables.'
    ],
    bossProblem: {
      id: 32,
      title: 'Longest Valid Parentheses',
      slug: 'longest-valid-parentheses',
      url: 'https://leetcode.com/problems/longest-valid-parentheses/',
      difficulty: 'Hard',
      timeLimitMinutes: 35
    }
  },
  {
    key: 'dp-2d',
    name: 'Dynamic Programming 2D',
    order: 12,
    expectedProblems: 6,
    icon: 'Grid',
    color: '#c084fc', // purple-400
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderColor: 'border-purple-500',
    cheatSheet: [
      'Two strings comparison (LCS, Edit Distance): `dp[i][j]` compares `s1[i-1]` and `s2[j-1]`.',
      'Grid paths: `dp[i][j] = dp[i-1][j] + dp[i][j-1]` with obstacle handling.',
      'Knapsack 0/1 vs Unbounded: iterate backwards for 0/1 to reuse items at most once; forwards for unbounded.',
      'State machine DP: multiple states like Buy, Sell, Cooldown for stock problems.'
    ],
    bossProblem: {
      id: 115,
      title: 'Distinct Subsequences',
      slug: 'distinct-subsequences',
      url: 'https://leetcode.com/problems/distinct-subsequences/',
      difficulty: 'Hard',
      timeLimitMinutes: 35
    }
  },
  {
    key: 'greedy-intervals',
    name: 'Greedy & Intervals',
    order: 13,
    expectedProblems: 8,
    icon: 'Split',
    color: '#facc15', // yellow-400
    badgeBg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    borderColor: 'border-yellow-500',
    cheatSheet: [
      'Interval scheduling: always sort intervals! By start time (merging) or end time (non-overlapping max count).',
      'Merge Intervals: maintain `current_interval`; if `next.start <= current.end`, update `current.end = max(current.end, next.end)`.',
      'Greedy choice property: local optimum leads to global optimum (e.g. Jump Game max reach).',
      'Kadane Algorithm: reset current sum to 0 if it dips below 0.'
    ],
    bossProblem: {
      id: 646,
      title: 'Maximum Length of Pair Chain',
      slug: 'maximum-length-of-pair-chain',
      url: 'https://leetcode.com/problems/maximum-length-of-pair-chain/',
      difficulty: 'Medium',
      timeLimitMinutes: 35
    }
  },
  {
    key: 'tries-bits',
    name: 'Tries & Bits',
    order: 14,
    expectedProblems: 4,
    icon: 'Binary',
    color: '#38bdf8', // sky-400
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    borderColor: 'border-sky-500',
    cheatSheet: [
      'Trie Node: `children = {}` or array of 26, `is_end_of_word = False`. Fast prefix search in O(word_length).',
      'Wildcard search in Trie: recursively explore all branches when character is `.`.',
      'XOR properties: `x ^ x = 0`, `x ^ 0 = x`. Useful for finding single duplicate or single non-duplicate.',
      'Bit tricks: `n & (n - 1)` clears lowest set bit (Brian Kernighan count); `n & -n` isolates lowest set bit.'
    ],
    bossProblem: {
      id: 212,
      title: 'Word Search II',
      slug: 'word-search-ii',
      url: 'https://leetcode.com/problems/word-search-ii/',
      difficulty: 'Hard',
      timeLimitMinutes: 35
    }
  }
];
