import { useState, useEffect } from 'react';
import { sounds } from './utils/sounds';

export type PathType = 'PRODUCTIVE' | 'STRONGER' | 'EXTROVERT' | 'DISCIPLINE' | 'MENTAL_HEALTH';
export type MissionType = 'REGULAR' | 'DAILY' | 'WEEKLY';

export interface Mission {
  id: string;
  text: string;
  completed: boolean;
  type: MissionType;
}

export interface PathProgress {
  xp: number;
  level: number;
  missions: Mission[];
  lastMissionDate: string;
  lastWeeklyDate: string;
  badges: string[];
  highestRankAchieved: string;
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
  lastWeeklyDate: string;
  badges: string[];
  highestRankAchieved: string;
  language: 'en' | 'id';
  pathProgress: Partial<Record<PathType, PathProgress>>;
  streak: number;
  lastActiveDate: string | null;
  showStreakAnimation: boolean;
  animatingLevelUp: boolean;
  previousLevel: number;
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
  lastWeeklyDate: '',
  badges: [],
  highestRankAchieved: 'Bronze',
  language: 'en',
  pathProgress: {},
  streak: 0,
  lastActiveDate: null,
  showStreakAnimation: false,
  animatingLevelUp: false,
  previousLevel: 1,
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

export interface Post {
  id: string;
  author: string;
  authorImage: string | null;
  type: 'image' | 'video';
  url: string;
  caption: string;
  likes: number;
  createdAt: number;
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('lockin_global_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Default mock posts
    return [
      {
        id: '1',
        author: 'System',
        authorImage: null,
        type: 'image',
        url: 'https://picsum.photos/seed/lockin1/600/800',
        caption: 'Stay focused and keep grinding! 💪',
        likes: 42,
        createdAt: Date.now() - 86400000,
      }
    ];
  });

  const addPost = (post: Post) => {
    const newPosts = [post, ...posts];
    setPosts(newPosts);
    try {
      localStorage.setItem('lockin_global_posts', JSON.stringify(newPosts));
    } catch (e) {
      console.warn("Local storage quota exceeded, keeping posts in memory only");
      // If quota exceeded, try to keep only the latest 10 posts
      try {
        const trimmedPosts = newPosts.slice(0, 10);
        localStorage.setItem('lockin_global_posts', JSON.stringify(trimmedPosts));
        setPosts(trimmedPosts);
      } catch (e2) {
        console.error("Still exceeding quota after trimming");
      }
    }
  };

  const likePost = (id: string) => {
    const newPosts = posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p);
    setPosts(newPosts);
    try {
      localStorage.setItem('lockin_global_posts', JSON.stringify(newPosts));
    } catch (e) {
      console.warn("Local storage quota exceeded, keeping likes in memory only");
    }
  };

  return { posts, addPost, likePost };
}

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
          if (!parsed.pathProgress) parsed.pathProgress = {};
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
    
    // Get ISO week string
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const currentWeek = `${d.getFullYear()}-W${weekNo}`;

    let updates: Partial<UserState> = {};
    let currentMissions = [...state.missions];
    let missionsChanged = false;

    const pathMissions = PATH_MISSIONS[path];

    // Ensure all mission types have the correct number of missions
    (['REGULAR', 'DAILY', 'WEEKLY'] as MissionType[]).forEach((type) => {
      const existingMissions = currentMissions.filter(m => m.type === type);
      const expectedCount = pathMissions[type].length;

      if (existingMissions.length < expectedCount) {
        // Add missing missions
        const missingCount = expectedCount - existingMissions.length;
        for (let i = 0; i < missingCount; i++) {
          const randomText = pathMissions[type][Math.floor(Math.random() * pathMissions[type].length)];
          currentMissions.push({
            id: `${Date.now()}-${type}-${Math.random()}`,
            text: randomText,
            completed: false,
            type,
          });
        }
        missionsChanged = true;
      }
    });

    if (state.lastMissionDate !== today) {
      currentMissions = currentMissions.filter(m => m.type !== 'DAILY');
      PATH_MISSIONS[path].DAILY.forEach((text, index) => {
        currentMissions.push({
          id: `${today}-DAILY-${index}`,
          text,
          completed: false,
          type: 'DAILY',
        });
      });
      updates.lastMissionDate = today;
      missionsChanged = true;
    }

    if (state.lastWeeklyDate !== currentWeek) {
      currentMissions = currentMissions.filter(m => m.type !== 'WEEKLY');
      PATH_MISSIONS[path].WEEKLY.forEach((text, index) => {
        currentMissions.push({
          id: `${currentWeek}-WEEKLY-${index}`,
          text,
          completed: false,
          type: 'WEEKLY',
        });
      });
      updates.lastWeeklyDate = currentWeek;
      missionsChanged = true;
    }

    if (missionsChanged) {
      updates.missions = currentMissions;
      updateState(updates);
    }
  };

  const completeMission = (id: string) => {
    if (!state) return;
    const mission = state.missions.find(m => m.id === id);
    if (!mission || mission.completed) return;

    const isRegular = mission.type === 'REGULAR';
    let leveledUp = false;

    setState((prev) => {
      if (!prev) return prev;
      
      const missionIndex = prev.missions.findIndex(m => m.id === id);
      if (missionIndex === -1) return prev;
      const m = prev.missions[missionIndex];
      
      if (m.completed) return prev;

      let newMissions = [...prev.missions];
      newMissions[missionIndex] = { ...m, completed: true };

      let newXp = prev.xp + 50;
      let newLevel = prev.level;
      let newBadges = [...prev.badges];

      if (newXp >= newLevel * 100) {
        newXp = newXp - newLevel * 100;
        newLevel += 1;
        leveledUp = true;
      }

      const allMissionsCompleted = newMissions.every(m => m.completed);
      if (allMissionsCompleted && !newBadges.includes('DISCIPLINED')) {
        newBadges.push('DISCIPLINED');
      }

      // Streak logic
      const today = new Date().toDateString();
      let newStreak = prev.streak || 0;
      let shouldShowStreakAnimation = false;
      
      if (prev.lastActiveDate !== today) {
        if (prev.lastActiveDate) {
          const lastDate = new Date(prev.lastActiveDate);
          const currentDate = new Date(today);
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          
          if (diffDays === 1) {
            newStreak += 1;
            shouldShowStreakAnimation = true;
          } else if (diffDays > 1) {
            newStreak = 1;
            shouldShowStreakAnimation = true;
          }
        } else {
          newStreak = 1;
          shouldShowStreakAnimation = true;
        }
      }

      return {
        ...prev,
        missions: newMissions,
        xp: newXp,
        level: newLevel,
        badges: newBadges,
        streak: newStreak,
        lastActiveDate: today,
        showStreakAnimation: prev.showStreakAnimation || shouldShowStreakAnimation,
        animatingLevelUp: leveledUp ? true : prev.animatingLevelUp,
        previousLevel: leveledUp ? prev.level : prev.previousLevel,
      };
    });

    if (!leveledUp) {
      sounds.playMissionComplete();
    }

    if (isRegular) {
      setTimeout(() => {
        setState(s => {
          if (!s) return s;
          
          const hasCompletedMission = s.missions.some(m => m.id === id && m.completed);
          if (!hasCompletedMission) return s;

          const pathMissions = PATH_MISSIONS[s.chosenPath!].REGULAR;
          const randomText = pathMissions[Math.floor(Math.random() * pathMissions.length)];
          const filtered = s.missions.filter(m => m.id !== id);
          return {
            ...s,
            missions: [...filtered, {
              id: `${Date.now()}-${Math.random()}`,
              text: randomText,
              completed: false,
              type: 'REGULAR'
            }]
          };
        });
      }, 1000);
    }
  };

  const replaceMission = (id: string) => {
    setState(prev => {
      if (!prev || !prev.chosenPath) return prev;
      const missionIndex = prev.missions.findIndex(m => m.id === id);
      if (missionIndex === -1) return prev;
      
      const mission = prev.missions[missionIndex];
      const pathMissions = PATH_MISSIONS[prev.chosenPath][mission.type];
      
      let randomText = mission.text;
      if (pathMissions.length > 1) {
        while (randomText === mission.text) {
          randomText = pathMissions[Math.floor(Math.random() * pathMissions.length)];
        }
      }

      const newMissions = [...prev.missions];
      newMissions[missionIndex] = {
        ...mission,
        id: `${Date.now()}-${Math.random()}`,
        text: randomText,
      };

      return {
        ...prev,
        missions: newMissions,
      };
    });
  };

  const changePath = (newPath: PathType) => {
    setState(prev => {
      if (!prev) return prev;
      
      const currentPath = prev.chosenPath;
      const newPathProgress = { ...prev.pathProgress };
      
      // Save current path progress
      if (currentPath) {
        newPathProgress[currentPath] = {
          xp: prev.xp,
          level: prev.level,
          missions: prev.missions,
          lastMissionDate: prev.lastMissionDate,
          lastWeeklyDate: prev.lastWeeklyDate,
          badges: prev.badges,
          highestRankAchieved: prev.highestRankAchieved,
        };
      }

      // Load or initialize new path progress
      const savedProgress = newPathProgress[newPath];
      
      if (savedProgress) {
        return {
          ...prev,
          chosenPath: newPath,
          pathProgress: newPathProgress,
          xp: savedProgress.xp,
          level: savedProgress.level,
          missions: savedProgress.missions,
          lastMissionDate: savedProgress.lastMissionDate,
          lastWeeklyDate: savedProgress.lastWeeklyDate,
          badges: savedProgress.badges,
          highestRankAchieved: savedProgress.highestRankAchieved,
        };
      } else {
        // Initialize new path
        const today = new Date().toDateString();
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        const currentWeek = `${d.getFullYear()}-W${weekNo}`;

        const newMissions: Mission[] = [];
        const pathMissions = PATH_MISSIONS[newPath];
        
        (['REGULAR', 'DAILY', 'WEEKLY'] as MissionType[]).forEach((type) => {
          const availableTexts = pathMissions[type];
          const randomText = availableTexts[Math.floor(Math.random() * availableTexts.length)];
          newMissions.push({
            id: `${Date.now()}-${type}`,
            text: randomText,
            completed: false,
            type,
          });
        });

        return {
          ...prev,
          chosenPath: newPath,
          pathProgress: newPathProgress,
          xp: 0,
          level: 1,
          missions: newMissions,
          lastMissionDate: today,
          lastWeeklyDate: currentWeek,
          badges: [],
          highestRankAchieved: 'Bronze',
        };
      }
    });
  };

  return {
    state,
    login,
    logout,
    updateState,
    generateMissions,
    completeMission,
    replaceMission,
    changePath,
  };
}
