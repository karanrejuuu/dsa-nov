export interface RealityStats {
  currentDay: number;
  plannedProblems: number;
  completedProblems: number;
  backlogCount: number;
  daysBehind: number;
  projectedFinishDate: string;
  targetFinishDate: string;
  paceNeeded: number;
  currentPacePerDay: number;
  cleanRate: number;
  escalationCopy: {
    badge: string;
    headline: string;
    subtext: string;
    severity: 'green' | 'amber' | 'red' | 'critical';
  };
  futureYou: {
    currentPace: {
      finishDate: string;
      solvedCount: number;
      verdict: string;
    };
    targetPace: {
      finishDate: string;
      solvedCount: number;
      verdict: string;
    };
  };
}

export const FEAR_QUOTES = [
  {
    quote: "A year from now you will wish you had started today.",
    author: "Karen Lamb"
  },
  {
    quote: "The graveyard is the richest place on earth, full of hopes and dreams that were never realized.",
    author: "Les Brown"
  },
  {
    quote: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln"
  },
  {
    quote: "While you are sleeping or scrolling reels, your batchmate in Bangalore is writing his 4th dynamic programming solution of the evening.",
    author: "Placement Reality Check"
  },
  {
    quote: "There are two types of pain you will go through in life: the pain of discipline and the pain of regret. Discipline weighs ounces, while regret weighs tons.",
    author: "Jim Rohn"
  },
  {
    quote: "FAANG doesn't care about your college GPA or your excuses. When the interviewer shares a blank CoderPad, only your muscle memory speaks.",
    author: "Bangalore Interview Bar"
  },
  {
    quote: "Procrastination is the arrogant assumption that God owes you another chance tomorrow.",
    author: "Anonymous"
  }
];

export const AGE_30_SCENARIOS = {
  didToday: {
    title: "Age 30: If you grinded DSA every day & crushed FAANG",
    lifestyle: "Senior Staff Engineer / Tech Lead at Google / Uber Bangalore or Remote US",
    timeline: [
      {
        time: "08:30 AM",
        desc: "Wake up naturally without panic alarms in your spacious sunlit 3BHK high-rise overlooking Bangalore's eastern skyline. Zero debt, house fully funded."
      },
      {
        time: "10:15 AM",
        desc: "Cab or short drive to premium campus in Bellandur / Outer Ring Road. Morning coffee with principal architects debating high-throughput distributed systems."
      },
      {
        time: "01:00 PM",
        desc: "Catered gourmet lunch. A notification dings: quarterly RSU stock grant vested — ₹22,00,000 added to portfolio. Total CTC ₹85L - 1.2 Cr."
      },
      {
        time: "03:30 PM",
        desc: "Conducting mock interview for incoming interns. You command total technical respect; your pull request reviews shape core architecture."
      },
      {
        time: "06:00 PM",
        desc: "Shut laptop clean. Evening gym session, dinner reservations at Indiranagar with spouse, booking flights for two-week vacation to Kyoto."
      },
      {
        time: "10:30 PM",
        desc: "Deep, tranquil sleep knowing your future is secured, your parents receive world-class private healthcare, and you reached the top of your craft."
      }
    ]
  },
  skippedToday: {
    title: "Age 30: If you skipped today and made excuses",
    lifestyle: "Senior Associate Maintenance Engineer at Service WITCH Company",
    timeline: [
      {
        time: "07:00 AM",
        desc: "Wake up dreading existence in a cramped, noisy PG flat in Marathahalli. Choked throat from pollution during 1.5-hour crowded bus crawl in traffic."
      },
      {
        time: "09:30 AM",
        desc: "Punch biometric clock in a claustrophobic cubicle farm. Toxic team lead glares at you because you were 4 minutes late."
      },
      {
        time: "01:00 PM",
        desc: "Eating a lukewarm tiffin box alone in a damp cafeteria. Looking at your salary slip: ₹38,000 in hand after 4 years of service. Zero stock options."
      },
      {
        time: "04:30 PM",
        desc: "Begging for a 4% appraisal while copy-pasting XML config files in a 14-year-old banking monolith. You never learned graphs or DP, so switching companies feels impossible."
      },
      {
        time: "08:45 PM",
        desc: "Manager slaps your desk demanding weekend support because an offshore onshore client filed a ticket. You can't say no because you have EMIs and no savings."
      },
      {
        time: "11:45 PM",
        desc: "Lying awake in bed staring at LinkedIn. You see your college benchmate just bought an apartment in Singapore after joining Meta. Sinking, suffocating pit of regret knowing you had 45 free days in college and threw it away for reels."
      }
    ]
  }
};

export function computeRealityStats(
  startDateStr: string,
  totalProblemsCount: number = 120,
  solvedCount: number,
  cleanSolvedCount: number,
  currentDate?: Date
): RealityStats {
  const start = new Date(startDateStr);
  const now = currentDate || (typeof window !== 'undefined' ? new Date() : new Date(startDateStr));

  // Diff in calendar days
  const diffTime = now.getTime() - start.getTime();
  const dayIndex = Math.max(1, Math.min(45, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1));

  // Day target pacing: 120 problems across 41 solving days (~2.92 problems/day)
  // At current day:
  const plannedProblems = Math.min(totalProblemsCount, Math.round(dayIndex * 2.8));
  const backlogCount = Math.max(0, plannedProblems - solvedCount);
  const daysBehind = Number((backlogCount / 2.7).toFixed(1));

  // Current pace: problems solved per day
  const daysPassed = Math.max(1, dayIndex);
  const currentPacePerDay = Number((solvedCount / daysPassed).toFixed(2));

  // Remaining problems
  const remainingProblems = Math.max(0, totalProblemsCount - solvedCount);

  // Remaining days till Day 45
  const remainingTargetDays = Math.max(1, 45 - dayIndex);

  // Pace needed to finish by Day 45
  const paceNeeded = Number((remainingProblems / remainingTargetDays).toFixed(1));

  // Target finish date (start date + 45 days)
  const targetFinish = new Date(start);
  targetFinish.setDate(targetFinish.getDate() + 45);
  const targetFinishDate = targetFinish.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Projected finish date at current pace
  let projectedFinishDate = targetFinishDate;
  if (currentPacePerDay > 0) {
    const daysNeededAtCurrentPace = Math.ceil(remainingProblems / currentPacePerDay);
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + daysNeededAtCurrentPace);
    projectedFinishDate = projectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } else {
    projectedFinishDate = 'Never (Zero Pace)';
  }

  // Clean rate
  const cleanRate = solvedCount > 0 ? Math.round((cleanSolvedCount / solvedCount) * 100) : 0;

  // Escalating copy by days behind
  let escalationCopy: RealityStats['escalationCopy'];
  if (daysBehind <= 0.3) {
    escalationCopy = {
      badge: 'ON TARGET',
      headline: 'FAANG Momentum Active',
      subtext: 'You are on track. Maintain this exact velocity every single day and the bar is yours.',
      severity: 'green'
    };
  } else if (daysBehind <= 1.2) {
    escalationCopy = {
      badge: '1 DAY BEHIND',
      headline: 'You missed yesterday. 3 problems, gone.',
      subtext: 'Do them first, then today\'s. Bangalore placement season does not wait for anyone.',
      severity: 'amber'
    };
  } else if (daysBehind <= 3.5) {
    escalationCopy = {
      badge: `${Math.round(daysBehind)} DAYS BEHIND`,
      headline: `You're ${Math.round(daysBehind)} days behind. At this pace you finish on ${projectedFinishDate}, not ${targetFinishDate}.`,
      subtext: 'Placement drives and FAANG hiring freezes don\'t shift dates for you. Every skipped problem is a rejection email in disguise.',
      severity: 'red'
    };
  } else {
    escalationCopy = {
      badge: 'CRITICAL WARNING: 5+ DAYS BEHIND',
      headline: 'You\'re not behind, you\'re quitting slowly.',
      subtext: 'You have two choices right now: pick up your laptop and solve your backlog today, or accept the 4 LPA service company desk at age 30.',
      severity: 'critical'
    };
  }

  // Future You numbers
  const projectedSolvedAt45 = Math.min(120, Math.round(solvedCount + currentPacePerDay * remainingTargetDays));
  const readinessVerdict =
    projectedSolvedAt45 >= 115
      ? 'FAANG / Tier-1 Ready'
      : projectedSolvedAt45 >= 80
      ? 'Bangalore Mid-Tier Startups'
      : 'At Risk: High Service Rejection Rate';

  return {
    currentDay: dayIndex,
    plannedProblems,
    completedProblems: solvedCount,
    backlogCount,
    daysBehind,
    projectedFinishDate,
    targetFinishDate,
    paceNeeded,
    currentPacePerDay,
    cleanRate,
    escalationCopy,
    futureYou: {
      currentPace: {
        finishDate: projectedFinishDate,
        solvedCount: projectedSolvedAt45,
        verdict: readinessVerdict
      },
      targetPace: {
        finishDate: targetFinishDate,
        solvedCount: 120,
        verdict: 'FAANG / Top Bangalore Product Level'
      }
    }
  };
}
