# ⚔️ DSA Quest — 45-Day FAANG DSA Tracker

> Mobile-first, hosted single-source-of-truth web app for a 45-day, 120-problem DSA sprint aimed at Bangalore product companies and FAANG-level engineering interviews.

---

## ⚡ Key Highlights & Architecture

1. **Game Layer**:
   - XP system: Easy (+10), Medium (+25), Hard (+50) with multipliers (×1.0 clean, ×0.6 with hint, ×0.3 needed solution, 0 skipped).
   - Re-solving a revisit problem clean awards **+15 bonus XP**.
   - 7 Levels with names: *Rookie* → *Array Wrangler* → *Pointer Ninja* → *Graph Walker* → *DP Surgeon* → *Interview Ready* → *FAANG Bound*.
   - Consecutive day streaks with **1 streak freeze** earned per 7-day streak milestone.
   - Interactive 45-day matrix heatmap calendar.
   - Full-screen level up celebrations with synthesized audio and particle bursts.

2. **Daily Structure & Focus Timer**:
   - Every day tells you the exact 2-3 problems to do.
   - 2-hour sprint timer with per-problem split timing.
   - **25-minute stuck nudge protocol**: prompts you to check a hint, inspect solution, and queue for spaced re-solving tomorrow.
   - Unlocking & completion feedback with optimistic UI.

3. **Skill Tree (14 Nodes)**:
   - Unlock rule: A node unlocks when the preceding node is ≥ 70% solved.
   - Editable cheat sheets ("When to use it", 3-5 bullets) per pattern.
   - Each node features an endgame **Boss Fight** (35-minute timed challenge) that awards +50 XP and marks the node *Mastered*.

4. **Reality Check & Fear Protocol**:
   - Computes daily velocity, backlog count, and days behind (`(planned - done) / 2.7`).
   - Slipped projected finish date in red.
   - Escalating tone copy (1 day behind, 2-3 days, 5+ critical).
   - **Future You** P&L panel (numbers only, no fiction).
   - **Day in the Life at Age 30**: side-by-side comparison ("If you grinded DSA today" vs "If you skipped today and procrastinated").
   - Sunday Weekly Review protocol and 1-sentence commitment locker.

5. **Spaced Repetition & Weak Spots**:
   - Any problem marked `Solved with hint` or `Needed solution` is auto-scheduled to reappear at +1, +3, +7 days.
   - Patterns ranked by hint/solution leak rate.

6. **Click-Through Behavior & Return Modal**:
   - Global `<ProblemLink>` component opening LeetCode with `target="_blank"` and `rel="noopener noreferrer"`.
   - On click: records `opened_at`, increments `attempts`, sets status to `in_progress`, starts split timer.
   - On returning to app tab (`visibilitychange`/`focus`), opens the bottom sheet with honest status selection, time taken, and "What trick did I miss?" notes.

7. **PWA & Offline-First Support**:
   - Installable on mobile home screen (iOS & Android) with standalone manifest and service worker caching the app shell.
   - Works 100% offline with zero setup, with optional real-time Supabase cloud synchronization across laptop and phone.

---

## 🛠️ Repository Structure

```
dsa-quest/
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker for offline shell caching
│   ├── icon.svg            # Cyberpunk terminal SVG icon
│   ├── icon-192.png        # 192x192 PWA app icon
│   └── icon-512.png        # 512x512 PWA splash icon
├── src/
│   ├── app/
│   │   ├── globals.css     # Dark theme styles & safe-area paddings
│   │   ├── layout.tsx      # Root layout, PWA meta tags, AppProvider
│   │   └── page.tsx        # App entry point coordinating tabs
│   ├── components/
│   │   ├── BottomNav.tsx   # Mobile-first one-handed tab bar
│   │   ├── TodayView.tsx   # Today's mission, timer, backlog banner
│   │   ├── SkillTreeView.tsx # 14 nodes, unlock graph, cheat sheets, boss fights
│   │   ├── RealityView.tsx # Fear engine, Age 30 side-by-side, quotes
│   │   ├── StatsView.tsx   # Heatmap, revisits, weak spots, mocks, settings
│   │   ├── ProblemLink.tsx # Authoritative click-through link component
│   │   ├── ReturnModal.tsx # Back-from-LeetCode bottom sheet
│   │   ├── LevelUpModal.tsx # Fullscreen rank elevation celebration
│   │   └── StuckNudgeModal.tsx # 25-minute stuck nudge
│   ├── context/
│   │   └── AppContext.tsx  # Central state management & optimistic updates
│   ├── data/
│   │   ├── dsa-120-problems.json # 120 verified problems seed dataset
│   │   └── skillTreeNodes.ts     # 14 pattern nodes metadata & boss challenges
│   ├── lib/
│   │   ├── gameLogic.ts    # XP, rank tiers, streaks, node unlocks
│   │   ├── realityCheck.ts # Velocity calculations & Age 30 scenarios
│   │   ├── sound.ts        # Native Web Audio synthesizer effects
│   │   ├── storage.ts      # Local persistence & JSON export/import
│   │   └── supabase.ts     # Supabase client & multi-device sync
│   └── types/
│       └── index.ts        # TypeScript schemas & models
├── supabase/
│   ├── schema.sql          # Postgres schema with RLS policies
│   └── seed.sql            # Direct SQL seed script (120 problems)
├── scripts/
│   ├── seed.js             # Node seed & verification script
│   └── seed.ts             # TypeScript seed script
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🔑 Environment Variables

The app runs with local storage out of the box. To enable multi-device sync across your laptop and phone, add your Supabase project keys to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # optional for CLI seed script
```

---

## 🚀 Exact Steps to Run the Seed Script

1. **Option A: Direct SQL in Supabase Dashboard (Fastest)**
   - Open your Supabase Dashboard → **SQL Editor**.
   - Paste and run `supabase/schema.sql`.
   - Paste and run `supabase/seed.sql`.

2. **Option B: Node CLI Seed Script**
   ```bash
   cd dsa-quest
   npm run seed
   ```
   *Output confirmation:*
   ```text
   ================ SEED VERIFICATION RESULT ================
   Total Problems: 120
   Total Nodes: 14
   Difficulty Breakdown: Easy=25, Medium=86, Hard=9
   ==========================================================
   ```

---

## 💻 Local Development & Production Run

```bash
cd dsa-quest
npm install
npm run build
npm run start # runs on http://localhost:3000
```
