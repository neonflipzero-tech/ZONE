import { useState, useEffect } from 'react';

export type PathType = 'PRODUCTIVE' | 'STRONGER' | 'EXTROVERT' | 'DISCIPLINE' | 'MENTAL_HEALTH';
export type MissionType = 'REGULAR' | 'DAILY' | 'WEEKLY';

export interface Mission {
  id: string;
  text: string;
  completed: boolean;
  type: MissionType;
}

export interface UserState {
  username: string;
  profilePicture: string | null;
  isLoggedIn: boolean;
  onboardingCompleted: boolean;
  chosenPath: PathType | null;
  xp: number;
  level: number;
  missions: Mission[];
  lastMissionDate: string;
  badges: string[];
  highestRankAchieved: string;
}

export const RANKS = [
  { name: 'Bronze', minLevel: 1, color: 'text-amber-700', bg: 'bg-amber-700' },
  { name: 'Silver', minLevel: 3, color: 'text-gray-300', bg: 'bg-gray-300' },
  { name: 'Gold', minLevel: 6, color: 'text-yellow-400', bg: 'bg-yellow-400' },
  { name: 'Platinum', minLevel: 10, color: 'text-cyan-400', bg: 'bg-cyan-400' },
  { name: 'Diamond', minLevel: 15, color: 'text-blue-500', bg: 'bg-blue-500' },
  { name: 'Master', minLevel: 21, color: 'text-purple-500', bg: 'bg-purple-500' },
  { name: 'Grandmaster', minLevel: 28, color: 'text-red-500', bg: 'bg-red-500' },
  { name: 'Challenger', minLevel: 36, color: 'text-yellow-200', bg: 'bg-yellow-200' },
];

export function getRankForLevel(level: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (level >= RANKS[i].minLevel) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

export const PATH_QUOTES: Record<PathType, string[]> = {
  PRODUCTIVE: [
    "Focus on being productive instead of busy.",
    "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
    "The secret of getting ahead is getting started."
  ],
  STRONGER: [
    "No pain, no gain. Shut up and train.",
    "The hard days are the best because that's when champions are made.",
    "Strength does not come from physical capacity. It comes from an indomitable will."
  ],
  EXTROVERT: [
    "A comfort zone is a beautiful place, but nothing ever grows there.",
    "Every friend was once a stranger.",
    "Life shrinks or expands in proportion to one's courage."
  ],
  DISCIPLINE: [
    "Discipline is choosing between what you want now and what you want most.",
    "We must all suffer one of two things: the pain of discipline or the pain of regret.",
    "Success is nothing more than a few simple disciplines, practiced every day."
  ],
  MENTAL_HEALTH: [
    "Peace is the result of retraining your mind to process life as it is, rather than as you think it should be.",
    "You don't have to control your thoughts. You just have to stop letting them control you.",
    "Self-care is how you take your power back."
  ]
};

const createDefaultState = (username: string): UserState => ({
  username,
  profilePicture: null,
  isLoggedIn: true,
  onboardingCompleted: false,
  chosenPath: null,
  xp: 0,
  level: 1,
  missions: [],
  lastMissionDate: '',
  badges: [],
  highestRankAchieved: 'Bronze',
});

const PATH_MISSIONS: Record<PathType, Record<MissionType, string[]>> = {
  PRODUCTIVE: {
    REGULAR: ["Read a self-help article", "Organize your files", "Plan your week"],
    DAILY: ["30-minute study focus", "Clean desk", "Write tomorrow's goal"],
    WEEKLY: ["Read a book for 2 hours", "Review weekly goals", "Learn a new skill"]
  },
  STRONGER: {
    REGULAR: ["Do 10 squats", "Stretch for 5 mins", "Eat a healthy snack"],
    DAILY: ["20 push-ups", "Drink enough water", "Sleep before 11 PM"],
    WEEKLY: ["Go for a 5km run", "Meal prep for 3 days", "Try a new workout"]
  },
  EXTROVERT: {
    REGULAR: ["Smile at a stranger", "Ask a question", "Give a compliment"],
    DAILY: ["Greet one person", "Start one chat", "Maintain eye contact"],
    WEEKLY: ["Attend a social event", "Call an old friend", "Have a deep conversation"]
  },
  DISCIPLINE: {
    REGULAR: ["Make your bed", "Sit with straight posture", "Drink water first thing"],
    DAILY: ["Take a cold shower", "No social media for 2 hours", "Read 10 pages"],
    WEEKLY: ["Digital detox for 1 day", "Wake up at 5 AM all week", "Complete all daily tasks"]
  },
  MENTAL_HEALTH: {
    REGULAR: ["Take 5 deep breaths", "Listen to calming music", "Stretch your neck"],
    DAILY: ["10 minutes of meditation", "Write 3 things you are grateful for", "Take a 15-minute walk"],
    WEEKLY: ["Therapy or deep reflection", "Spend a day in nature", "Unplug for a weekend"]
  },
};

export function useAppState() {
  const [activeUserEmail, setActiveUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('lockin_active_user');
  });

  const [state, setState] = useState<UserState | null>(() => {
    const email = localStorage.getItem('lockin_active_user');
    if (email) {
      const saved = localStorage.getItem(`lockin_user_${email}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (!parsed.missions) parsed.missions = [];
          if (!parsed.highestRankAchieved) parsed.highestRankAchieved = getRankForLevel(parsed.level || 1).name;
          return { ...createDefaultState(parsed.username || email), ...parsed, isLoggedIn: true };
        } catch (e) {
          return createDefaultState(email);
        }
      }
      return createDefaultState(email);
    }
    return null;
  });

  useEffect(() => {
    if (activeUserEmail && state) {
      localStorage.setItem(`lockin_user_${activeUserEmail}`, JSON.stringify(state));
      localStorage.setItem('lockin_active_user', activeUserEmail);
    } else if (!activeUserEmail) {
      localStorage.removeItem('lockin_active_user');
    }
  }, [state, activeUserEmail]);

  const login = (email: string, username: string) => {
    const saved = localStorage.getItem(`lockin_user_${email}`);
    let newState: UserState;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.missions) parsed.missions = [];
        if (!parsed.highestRankAchieved) parsed.highestRankAchieved = getRankForLevel(parsed.level || 1).name;
        newState = { ...createDefaultState(username), ...parsed, isLoggedIn: true, username };
      } catch (e) {
        newState = createDefaultState(username);
      }
    } else {
      newState = createDefaultState(username);
    }
    setActiveUserEmail(email);
    setState(newState);
  };

  const logout = () => {
    setActiveUserEmail(null);
    setState(null);
  };

  const updateState = (updates: Partial<UserState>) => {
    setState((prev) => prev ? { ...prev, ...updates } : null);
  };

  const generateMissions = (path: PathType) => {
    if (!state) return;
    const today = new Date().toDateString();
    if (state.lastMissionDate !== today || state.missions.length === 0) {
      const newMissions: Mission[] = [];
      const pathMissions = PATH_MISSIONS[path];
      
      (['REGULAR', 'DAILY', 'WEEKLY'] as MissionType[]).forEach((type) => {
        pathMissions[type].forEach((text, index) => {
          newMissions.push({
            id: `${today}-${type}-${index}`,
            text,
            completed: false,
            type,
          });
        });
      });

      updateState({ missions: newMissions, lastMissionDate: today });
    }
  };

  const completeMission = (id: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const newMissions = prev.missions.map((m) =>
        m.id === id ? { ...m, completed: true } : m
      );
      
      const missionWasAlreadyCompleted = prev.missions.find(m => m.id === id)?.completed;
      
      if (missionWasAlreadyCompleted) return prev;

      let newXp = prev.xp + 50;
      let newLevel = prev.level;
      let newBadges = [...prev.badges];

      if (newXp >= newLevel * 100) {
        newXp = newXp - newLevel * 100;
        newLevel += 1;
      }

      // Check for badges
      const allMissionsCompleted = newMissions.every(m => m.completed);
      if (allMissionsCompleted && !newBadges.includes('DISCIPLINED')) {
        newBadges.push('DISCIPLINED');
      }

      return {
        ...prev,
        missions: newMissions,
        xp: newXp,
        level: newLevel,
        badges: newBadges,
      };
    });
  };

  return {
    state,
    login,
    logout,
    updateState,
    generateMissions,
    completeMission,
  };
}
