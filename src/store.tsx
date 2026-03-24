import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { sounds } from './utils/sounds';

export type PathType = 'PRODUCTIVE' | 'STRONGER' | 'EXTROVERT' | 'DISCIPLINE' | 'MENTAL_HEALTH' | 'OTHER';
export type MissionType = 'REGULAR' | 'DAILY' | 'WEEKLY' | 'ROUTINE' | 'BOSS';

export interface Mission {
  id: string;
  text: string;
  completed: boolean;
  type: MissionType;
  hasTimer?: boolean;
}

export function scaleMissionText(text: string, level: number): string {
  // Scaling factor: increases every 5 levels
  // Level 1-5: 1.0x
  // Level 6-10: 1.5x
  // Level 11-15: 2.0x, etc.
  const levelFactor = 1 + Math.floor((level - 1) / 5) * 0.5;
  
  return text.replace(/(\d+(?:[.,]\d+)?)/g, (match) => {
    const val = parseFloat(match.replace(',', '.'));
    
    // Don't scale if it's clearly a small count or a single item
    if (val <= 1) return match;
    
    // Don't scale if it looks like a year or a very large number already
    if (val > 1000) return match;

    const scaled = Math.round(val * levelFactor);
    return scaled.toString();
  });
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

export interface UnlockedItem {
  type: 'badge' | 'frame' | 'title';
  id: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  icon: string;
  read: boolean;
  timestamp: number;
}

export interface BossTask {
  id: string;
  text: string;
  completed: boolean;
  damage: number;
}

export interface BossState {
  isActive: boolean;
  topic: string | null;
  hp: number;
  maxHp: number;
  tasks: BossTask[];
  lastEncounterDate: string | null;
  status: 'pending_choice' | 'active' | 'defeated' | 'escaped';
}

export interface UserState {
  userId: string;
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
  dailyStats: Record<string, number>;
  dailyCategoryStats: Record<string, Record<string, number>>;
  unlockedFrames: string[];
  equippedFrame: string | null;
  titles: string[];
  equippedTitle: string | null;
  hasPromptedPfp: boolean;
  customMissions: Record<MissionType, string[]>;
  unlockedItemsQueue: UnlockedItem[];
  shareCount: number;
  isProfilePublic: boolean;
  missionsCompleted: number;
  notifications: Notification[];
  streakFreezes: number;
  lastStreakFreezeGiven: string | null;
  streakFreezeUsedToday: boolean;
  rivalId: string | null;
  beatenRivals: string[];
  zoneCoins: number;
  doubleXpPotions: number;
  doubleXpActiveUntil: string | null;
  doubleCoinPotions: number;
  doubleCoinActiveUntil: string | null;
  isPremium: boolean;
  baseStats: Record<string, number>;
  bossState?: BossState;
  notificationsEnabled: boolean;
  notificationTime: string;
}

export const RANKS = [
  { name: 'Bronze', minLevel: 1, color: 'text-amber-700', bg: 'bg-amber-700', hex: '#b45309' },
  { name: 'Silver', minLevel: 3, color: 'text-gray-300', bg: 'bg-gray-300', hex: '#d1d5db' },
  { name: 'Gold', minLevel: 6, color: 'text-amber-400', bg: 'bg-amber-400', hex: '#fbbf24' },
  { name: 'Platinum', minLevel: 10, color: 'text-cyan-400', bg: 'bg-cyan-400', hex: '#22d3ee' },
  { name: 'Diamond', minLevel: 15, color: 'text-blue-500', bg: 'bg-blue-500', hex: '#3b82f6' },
  { name: 'Master', minLevel: 21, color: 'text-purple-500', bg: 'bg-purple-500', hex: '#a855f7' },
  { name: 'Grandmaster', minLevel: 28, color: 'text-amber-300', bg: 'bg-amber-300', hex: '#fcd34d' },
  { name: 'Challenger', minLevel: 36, color: 'text-rose-500', bg: 'bg-rose-500', hex: '#f43f5e' },
  { name: 'Legend', minLevel: 43, color: 'text-emerald-400', bg: 'bg-emerald-400', hex: '#34d399' },
  { name: 'Mythic', minLevel: 50, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500', hex: '#d946ef' },
];

export const BADGES = [
  { id: 'FIRST_STEP', name: { en: 'First Step', id: 'Langkah Pertama' }, desc: { en: 'Complete your first mission', id: 'Selesaikan misi pertama' }, icon: 'Footprints' },
  { id: 'DOUBLE_TROUBLE', name: { en: 'Double Trouble', id: 'Masalah Ganda' }, desc: { en: 'Complete 2 missions in one day', id: 'Selesaikan 2 misi dalam satu hari' }, icon: 'Zap' },
  { id: 'TRIPLE_THREAT', name: { en: 'Triple Threat', id: 'Ancaman Tiga Kali Lipat' }, desc: { en: 'Complete 3 missions in one day', id: 'Selesaikan 3 misi dalam satu hari' }, icon: 'Flame' },
  { id: 'DEDICATED', name: { en: 'Dedicated', id: 'Berdedikasi' }, desc: { en: 'Complete 5 missions in total', id: 'Selesaikan 5 misi secara total' }, icon: 'Heart' },
  { id: 'TENACIOUS', name: { en: 'Tenacious', id: 'Gigih' }, desc: { en: 'Complete 10 missions in total', id: 'Selesaikan 10 misi secara total' }, icon: 'Shield' },
  { id: 'AFTERNOON_HUSTLE', name: { en: 'Afternoon Hustle', id: 'Pejuang Siang' }, desc: { en: 'Complete a mission between 12 PM and 5 PM', id: 'Selesaikan misi antara jam 12 siang dan 5 sore' }, icon: 'Sun' },
  { id: 'DISCIPLINED', name: { en: 'Disciplined', id: 'Disiplin' }, desc: { en: 'Complete all weekly missions', id: 'Selesaikan semua misi mingguan' }, icon: 'CheckCircle2' },
  { id: 'STREAK_3', name: { en: 'On Fire', id: 'Membara' }, desc: { en: 'Reach a 3-day streak', id: 'Capai 3 hari beruntun' }, icon: 'Flame' },
  { id: 'STREAK_7', name: { en: 'Unstoppable', id: 'Tak Terhentikan' }, desc: { en: 'Reach a 7-day streak', id: 'Capai 7 hari beruntun' }, icon: 'Zap' },
  { id: 'STREAK_30', name: { en: 'Legendary', id: 'Legendaris' }, desc: { en: 'Reach a 30-day streak', id: 'Capai 30 hari beruntun' }, icon: 'Crown' },
  { id: 'NIGHT_OWL', name: { en: 'Night Owl', id: 'Burung Hantu' }, desc: { en: 'Complete a mission after 10 PM', id: 'Selesaikan misi setelah jam 10 malam' }, icon: 'Moon' },
  { id: 'EARLY_BIRD', name: { en: 'Early Bird', id: 'Burung Pagi' }, desc: { en: 'Complete a mission before 7 AM', id: 'Selesaikan misi sebelum jam 7 pagi' }, icon: 'Sun' },
  { id: 'WEEKEND_WARRIOR', name: { en: 'Weekend Warrior', id: 'Pejuang Akhir Pekan' }, desc: { en: 'Complete a mission on the weekend', id: 'Selesaikan misi di akhir pekan' }, icon: 'Swords' },
  { id: 'LEVEL_10', name: { en: 'Veteran', id: 'Veteran' }, desc: { en: 'Reach Level 10', id: 'Capai Level 10' }, icon: 'Shield' },
  { id: 'LEVEL_25', name: { en: 'Master', id: 'Master' }, desc: { en: 'Reach Level 25', id: 'Capai Level 25' }, icon: 'Star' },
  { id: 'LEVEL_50', name: { en: 'Mythic', id: 'Mitos' }, desc: { en: 'Reach Level 50', id: 'Capai Level 50' }, icon: 'Crown' },
  { id: 'ELITE_ZONE', name: { en: 'Elite Zone', id: 'Elite Zone' }, desc: { en: 'The chosen one of the Zone', id: 'Yang terpilih dari Zone' }, icon: 'Crown', color: 'text-amber-400' },
];

export const TITLES = [
  { id: 'Newbie', name: { en: 'Newbie', id: 'Pemula' }, desc: { en: 'Just started the journey', id: 'Baru memulai perjalanan' }, specialColor: 'text-gray-300' },
  { id: 'The Early Bird', name: { en: 'The Early Bird', id: 'Burung Pagi' }, desc: { en: 'Active in the morning', id: 'Aktif di pagi hari' }, specialColor: 'text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]' },
  { id: 'Night Owl', name: { en: 'Night Owl', id: 'Burung Hantu' }, desc: { en: 'Active at night', id: 'Aktif di malam hari' }, specialColor: 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' },
  { id: 'Unstoppable', name: { en: 'Unstoppable', id: 'Tak Terhentikan' }, desc: { en: 'Reached a 5-day streak', id: 'Mencapai 5 hari beruntun' }, specialColor: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' },
  { id: 'Legend', name: { en: 'Legend', id: 'Legenda' }, desc: { en: 'Reached a 30-day streak', id: 'Mencapai 30 hari beruntun' }, specialColor: 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' },
  { id: 'Veteran', name: { en: 'Veteran', id: 'Veteran' }, desc: { en: 'Reached Level 10', id: 'Mencapai Level 10' }, specialColor: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' },
  { id: 'Master', name: { en: 'Master', id: 'Master' }, desc: { en: 'Reached Level 50', id: 'Mencapai Level 50' }, specialColor: 'text-fuchsia-500 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]' },
  { id: 'Rival Crusher', name: { en: 'Rival Crusher', id: 'Penghancur Rival' }, desc: { en: 'Surpassed your rival', id: 'Melampaui rivalmu' }, specialColor: 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]' },
  { id: 'OG', name: { en: 'OG', id: 'OG' }, desc: { en: 'First 100 users', id: '100 pengguna pertama' }, specialColor: 'bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' },
  { id: 'Supporter', name: { en: 'Supporter', id: 'Pendukung' }, desc: { en: 'Shared the app 5 times', id: 'Membagikan aplikasi 5 kali' }, specialColor: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]' },
  { id: 'Elite Zone', name: { en: 'Elite Zone', id: 'Elite Zone' }, desc: { en: 'The chosen one of the Zone', id: 'Yang terpilih dari Zone' }, specialColor: 'bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] font-black' },
];

export function getRankForLevel(level: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (level >= RANKS[i].minLevel) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

export function calculateOVR(state: UserState) {
  const getPathScore = (path: PathType, statKey: string) => {
    const p = state.chosenPath === path 
      ? { level: state.level, xp: state.xp } 
      : (state.pathProgress[path] || { level: 1, xp: 0 });
    const base = state.baseStats?.[statKey] || 0;
    return Math.floor(Math.min(99, 40 + base + (p.level * 1.5) + (p.xp / 100)));
  };

  const physical = getPathScore('STRONGER', 'physical');
  const mental = getPathScore('MENTAL_HEALTH', 'mental');
  const intellect = getPathScore('PRODUCTIVE', 'intellect');
  const social = getPathScore('EXTROVERT', 'social');
  const other = getPathScore('OTHER', 'other');
  
  // Discipline: streak
  const baseDiscipline = state.baseStats?.['discipline'] || 0;
  const discipline = Math.floor(Math.min(99, 40 + baseDiscipline + (state.streak * 1.5)));

  // Ambition: total levels across all paths + badges
  const baseAmbition = state.baseStats?.['ambition'] || 0;
  let totalLevels = state.level;
  Object.keys(state.pathProgress).forEach(k => {
    if (k !== state.chosenPath) {
      totalLevels += state.pathProgress[k as PathType]?.level || 1;
    }
  });
  const ambition = Math.floor(Math.min(99, 40 + baseAmbition + (totalLevels * 1.5) + (state.badges.length * 1.5)));

  // Weighted average (excluding 'other' from main OVR calculation as requested)
  let ovr = Math.floor((physical + discipline + mental + ambition + intellect + social) / 6);

  // Hardcode OVR 100 for zaiki
  const isZaiki = state.userId === 'zaikiwildan@gmail.com' || state.username.toLowerCase().includes('zaiki');
  if (isZaiki) {
    ovr = 100;
  }

  return {
    ovr,
    stats: {
      physical: isZaiki ? 100 : physical,
      discipline: isZaiki ? 100 : discipline,
      mental: isZaiki ? 100 : mental,
      ambition: isZaiki ? 100 : ambition,
      intellect: isZaiki ? 100 : intellect,
      social: isZaiki ? 100 : social,
      other: isZaiki ? 100 : other
    }
  };
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
  ],
  OTHER: [
    "Design your own destiny.",
    "Your path, your rules.",
    "Every step counts, no matter the direction."
  ]
};

export const createDefaultState = (username: string): UserState => ({
  userId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
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
  dailyStats: {},
  dailyCategoryStats: {},
  unlockedFrames: ['frame-default'],
  equippedFrame: null,
  titles: ['Newbie'],
  equippedTitle: 'Newbie',
  hasPromptedPfp: false,
  customMissions: {
    REGULAR: [],
    DAILY: [],
    WEEKLY: [],
    ROUTINE: [],
    BOSS: []
  },
  unlockedItemsQueue: [],
  shareCount: 0,
  isProfilePublic: true,
  missionsCompleted: 0,
  notifications: [],
  streakFreezes: 1,
  lastStreakFreezeGiven: new Date().toISOString().split('T')[0],
  streakFreezeUsedToday: false,
  rivalId: null,
  beatenRivals: [],
  zoneCoins: 0,
  doubleXpPotions: 0,
  doubleXpActiveUntil: null,
  doubleCoinPotions: 0,
  doubleCoinActiveUntil: null,
  isPremium: false,
  baseStats: {
    intellect: 0,
    physical: 0,
    social: 0,
    ambition: 0,
    discipline: 0,
    mental: 0,
    other: 0
  },
  bossState: {
    isActive: false,
    topic: null,
    hp: 0,
    maxHp: 0,
    tasks: [],
    lastEncounterDate: null,
    status: 'pending_choice'
  },
  notificationsEnabled: false,
  notificationTime: '09:00',
});

const PATH_MISSIONS: Record<PathType, Record<MissionType, string[]>> = {
  PRODUCTIVE: {
    REGULAR: [
      "Read a self-help article", "Organize your files for 5 minutes", "Plan your week for 15 minutes",
      "Write down 3 priorities for today", "Clear your email inbox for 10 minutes", "Declutter your workspace for 5 minutes",
      "Listen to an educational podcast", "Watch a tutorial on a new tool", "Brainstorm ideas for 10 minutes",
      "Review your monthly goals for 5 minutes", "Update your to-do list for 5 minutes", "Unsubscribe from 3 useless emails",
      "Organize your computer desktop for 5 minutes", "Read 1 chapter of a non-fiction book", "Plan your meals for 10 minutes",
      "Write a journal entry about your progress", "Delete unused apps from your phone", "Set a timer for 15 mins and focus on one task",
      "Review your budget for 15 minutes", "Spend 10 minutes creating a morning routine",
      "Write a quick summary of your day", "Delete 5 unnecessary files", "Organize your bookmarks for 5 minutes", 
      "Set a timer for 10 mins and clean", "Write down 3 things to do tomorrow", "Check your calendar for 5 minutes", 
      "Unsubscribe from 1 promotional text", "Clear your browser cache", "Read 1 article about productivity", 
      "Plan a reward for completing a task",
      "Update your passwords for 10 minutes", "Clear your downloads folder for 5 minutes", "Read 1 page of a book", 
      "Write down 1 idea", "Organize your phone apps for 5 minutes", "Delete 10 old photos", 
      "Set a new wallpaper", "Clean your keyboard for 2 minutes", "Wipe your monitor for 1 minute", 
      "Empty your physical trash bin", "Sort your mail for 5 minutes", "Pay a bill", 
      "Check your bank balance", "Write a thank you note", "Plan your weekend for 10 minutes", 
      "Review your subscriptions for 5 minutes", "Cancel 1 unused subscription", "Update your contacts for 10 minutes", 
      "Back up your phone", "Clean your wallet for 5 minutes"
    ],
    DAILY: [
      "30 minutes study focus", "Clean desk for 5 minutes", "Write tomorrow's goal",
      "Wake up at your target time", "Read for 20 minutes", "No phone for the first hour after waking up",
      "Complete your most important task first", "Drink a glass of water upon waking", "Review your daily schedule for 5 minutes",
      "Spend 10 minutes learning a language", "Write down one thing you learned today", "Do a 5-minute end-of-day review",
      "Spend 5 minutes preparing clothes for tomorrow", "Limit social media to 30 minutes", "Take a 15-minute screen break",
      "Practice typing for 10 minutes", "Listen to an audiobook during commute", "Keep your phone in another room while working",
      "Track your expenses for 5 minutes", "Do a 10-minute brain dump",
      "Listen to an inspiring talk for 15 minutes", "Spend 15 minutes planning", "Do 1 hour of focused work", 
      "Review your long-term goals for 10 minutes", "Write a reflection for 5 minutes",
      "Read 1 article (5 mins)", "Listen to 1 podcast episode (20 mins)", "Watch 1 educational video (10 mins)", 
      "Write 500 words (30 mins)", "Study for 20 minutes", "Review flashcards for 10 minutes", 
      "Practice a musical instrument for 10 mins", "Code for 30 mins", "Draw for 15 mins", 
      "Write down 3 things you accomplished", "Plan tomorrow's meals", "Drink green tea", 
      "Take a 5-minute stretch break", "Do 10 minutes of deep breathing", "Write down your top priority", 
      "Avoid multitasking for 1 hour", "Do 1 Pomodoro session (25 mins)", "Turn off phone for 30 mins", 
      "Read a newsletter (5 mins)", "Review your daily budget"
    ],
    WEEKLY: [
      "Read a book for 120 minutes", "Review weekly goals for 15 minutes", "Learn a new skill for 30 minutes",
      "Deep clean your room for 60 minutes", "Plan next week for 20 minutes", "Weekly financial review for 30 minutes",
      "Back up your computer files", "Clean out your fridge", "Wash your bed sheets",
      "Spend 2 hours on a personal project", "Listen to a 1-hour educational lecture", "Organize your digital photos for 30 minutes",
      "Update your resume for 60 minutes", "Meal prep for 120 minutes", "Evaluate last week for 15 minutes",
      "Organize your workspace for 30 minutes", "Review monthly budget for 20 minutes", "Plan a project for 30 minutes", 
      "Read 2 chapters of a book", "Weekly brain dump for 15 minutes",
      "Read 3 chapters of a book", "Study course for 60 minutes", "Write a blog post", 
      "Update LinkedIn for 30 minutes", "Network with 1 person", "Attend a webinar", 
      "Clean your car for 30 minutes", "Do all your laundry for 60 minutes", "Iron clothes for 20 minutes", 
      "Vacuum your room for 10 minutes", "Mop the floors for 15 minutes", "Clean the bathroom for 20 minutes", 
      "Organize your closet for 30 minutes", "Donate old clothes", "Plan a trip for 60 minutes", 
      "Review your monthly goals", "Set next month's goals for 20 minutes", "Create a vision board for 60 minutes", 
      "Read a biography", "Watch a documentary"
    ],
    ROUTINE: [],
    BOSS: []
  },
  STRONGER: {
    REGULAR: [
      "Do 10 squats", "Stretch for 5 minutes", "Hold a plank for 30 seconds",
      "Do 15 jumping jacks", "Do 10 lunges per leg", "Do 10 push-ups",
      "Do 20 calf raises", "Do a 1-minute wall sit", "Do 15 crunches",
      "Do 10 burpees", "Stretch your hamstrings for 2 minutes", "Do arm circles for 1 minute",
      "Do 20 high knees", "Do 15 glute bridges", "Do a 30-second side plank (each side)",
      "Do 10 tricep dips", "Do 20 mountain climbers", "Stretch your shoulders for 2 minutes",
      "Do 15 bicycle crunches", "Do 10 jump squats",
      "Do 20 jumping jacks", "Do 15 squats", "Hold a plank for 45 seconds", 
      "Stretch your back for 2 minutes", "Do 10 lunges", "Do 15 calf raises", 
      "Do 10 push-ups", "Do a 30-second wall sit", "Stretch your arms for 2 minutes", 
      "Do 20 high knees",
      "Do 10 shoulder taps", "Do 15 inchworms", "Do 20 butt kicks", 
      "Do 10 tuck jumps", "Do 15 dips", "Do 20 sit-ups", 
      "Do 10 Russian twists", "Do a 1-minute plank", "Do 15 leg raises", 
      "Do 20 flutter kicks", "Do 10 superman stretches", "Do 15 bird-dogs", 
      "Do 10 deadbugs", "Do 15 hip thrusts", "Do 20 donkey kicks", 
      "Do 15 fire hydrants", "Do 10 pistol squats", "Do 15 jump lunges", 
      "Do 20 box jumps", "Do 15 kettlebell swings"
    ],
    DAILY: [
      "20 push-ups", "Drink 2 liters of water", "Hold a wall sit for 60 seconds",
      "Walk 10,000 steps", "Eat 2 servings of vegetables", "Eat 1 serving of fruit",
      "Sleep for 8 hours", "Do a 15-minute workout", "Stretch for 10 minutes before bed",
      "Avoid sugary drinks", "Eat a high-protein breakfast", "Take the stairs instead of the elevator",
      "Do 50 squats throughout the day", "Do a 10-minute core workout", "Avoid processed foods",
      "Drink a glass of water before each meal", "Do a 5-minute mobility routine", "Stand up and walk every hour",
      "Eat a healthy snack", "Do 30 push-ups throughout the day",
      "Drink 3 liters of water", "Eat a healthy breakfast", "Do a 20-minute workout", 
      "Stretch for 10 minutes", "Walk 8,000 steps",
      "Drink 4 liters of water", "Eat 3 servings of vegetables", "Eat 2 servings of fruit", 
      "Get 9 hours of sleep", "Do a 30-minute workout", "Stretch for 15 minutes", 
      "Walk 12,000 steps", "Take a cold plunge", "Do a 10-minute HIIT", 
      "Do a 20-minute yoga", "Eat a healthy lunch", "Eat a healthy dinner", 
      "Avoid sugar for the day", "Avoid fried food", "Avoid alcohol", 
      "Drink a protein shake", "Take your vitamins", "Do 50 crunches", 
      "Do 50 lunges", "Do 50 jumping jacks"
    ],
    WEEKLY: [
      "Go for a 5km run", "Meal prep for 3 days", "Try a new workout for 30 minutes",
      "Do a 1-hour strength training session", "Go for a 1-hour hike or walk", "Do a 30-minute yoga session",
      "Try a new healthy recipe for 45 minutes", "Do a HIIT workout for 20 minutes", "Go swimming or cycling for 45 minutes",
      "Full-body stretch for 20 minutes", "Track your macros for 3 days", "Do 100 push-ups in one day",
      "Do 100 squats in one day", "Play a sport for 1 hour", "Do a 45-minute cardio session",
      "Do a 45-minute strength workout", "Go for a 30-minute run", "Try a new sport for 60 minutes", 
      "Meal prep for 5 days", "Do a 1-hour yoga session",
      "Go for a 10km run", "Do a 2-hour strength training", "Go for a 2-hour hike", 
      "Do a 1-hour yoga class", "Try a new sport for 1 hour", "Do a 1-hour Pilates class", 
      "Go rock climbing for 120 minutes", "Go for a 20km bike ride", "Swim for 1 hour", 
      "Play basketball for 1 hour", "Play tennis for 1 hour", "Play soccer for 1 hour", 
      "Do a martial arts class for 60 minutes", "Do a dance class for 60 minutes", "Do a CrossFit workout for 60 minutes", 
      "Meal prep for 7 days", "Track macros for 7 days", "Do 200 push-ups in one day", 
      "Do 200 squats in one day", "Run a 5k under 30 mins"
    ],
    ROUTINE: [],
    BOSS: []
  },
  EXTROVERT: {
    REGULAR: [
      "Smile at a stranger", "Ask a question", "Give a compliment",
      "Say good morning to someone", "Hold the door for someone", "Ask someone how their day is going",
      "Make small talk with a cashier", "Send a positive text to a friend", "Leave a nice comment on a post",
      "Introduce yourself to someone new", "Ask for a recommendation", "Share a funny story",
      "Offer help to someone", "Thank someone for their work", "Wave to a neighbor",
      "Ask someone about their hobbies", "Compliment someone's outfit", "Share a snack with someone",
      "Ask for directions or advice", "Tell a joke",
      "Send a meme to a friend", "Ask someone about their weekend", "Leave a positive review", 
      "Compliment a coworker", "Say thank you to someone", "Ask for a book recommendation", 
      "Share a song with a friend", "Ask someone how they are feeling", "Smile at 3 people", 
      "Send a voice note",
      "High-five a friend", "Hug a family member", "Send a funny video to a friend", 
      "Tag a friend in a meme", "Reply to a friend's story", "Leave a nice comment on a stranger's post", 
      "Ask someone for their opinion", "Share a personal story", "Listen to someone's story", 
      "Give someone a small gift", "Buy coffee for a coworker", "Hold the elevator for someone", 
      "Let someone go ahead of you in line", "Smile at a baby", "Pet a stranger's dog (with permission)", 
      "Ask someone about their day", "Tell someone you appreciate them", "Send a thank you email", 
      "Write a positive review for a local business", "Recommend a book to a friend"
    ],
    DAILY: [
      "Greet one person", "Start one chat", "Maintain eye contact for 10 seconds",
      "Call a family member for 15 minutes", "Text a friend you haven't spoken to recently", "Have a 5-minute conversation with a colleague",
      "Post something positive on social media", "Listen actively for 10 minutes", "Ask 3 open-ended questions today",
      "Express gratitude to someone", "Join a group conversation for 10 minutes", "Spend 10 minutes making plans",
      "Share your opinion in a meeting or class", "Give 2 genuine compliments", "Reply to 3 stories on social media",
      "Send a voice message to a friend", "Ask someone for feedback", "Share an interesting article with someone",
      "Talk to someone while waiting in line", "Remember and use someone's name",
      "Call a friend for 5 minutes", "Text 3 people", "Have a conversation with a stranger", 
      "Post a positive comment", "Ask an open-ended question",
      "Talk to 2 strangers", "Call a friend for 10 minutes", "FaceTime a family member", 
      "Have lunch with someone new", "Join a new online community", "Participate in a group chat", 
      "Send 5 positive messages", "Give 3 compliments", "Ask 5 open-ended questions", 
      "Share a win with a friend", "Share a struggle with a friend", "Ask for help with something", 
      "Offer help with something", "Introduce two people", "Plan a future hangout", 
      "Confirm a plan with a friend", "Send a calendar invite", "Follow up with someone", 
      "Check in on a sick friend", "Wish someone a happy birthday"
    ],
    WEEKLY: [
      "Attend a social event for 1 hour", "Call an old friend for 20 minutes", "Have a deep conversation for 30 minutes",
      "Go out for coffee for 45 minutes", "Host a get-together for 2 hours", "Join a meetup for 1 hour",
      "Volunteer for 2 hours", "Play with voice chat for 1 hour", "Spend 30 minutes in a public place",
      "Have lunch with someone for 30 minutes", "Attend a workshop for 1 hour", "Organize a movie night for 15 minutes",
      "Go to a networking event for 1 hour", "Video call a friend for 30 minutes", "Participate in a discussion for 20 minutes",
      "Attend a networking event", "Host a dinner for 2 hours", "Go to a meetup for 1 hour", 
      "Call a family member for 30 mins", "Volunteer for 3 hours",
      "Host a game night for 2 hours", "Host a potluck for 2 hours", "Go to a concert for 2 hours", 
      "Go to a comedy show for 1.5 hours", "Visit a museum for 2 hours", "Visit an art gallery for 1 hour", 
      "Attend a festival for 2 hours", "Join a sports league for 1 hour", "Take a group class for 1 hour", 
      "Go to a trivia night for 2 hours", "Go to a karaoke bar for 2 hours", "Organize a picnic for 20 minutes", 
      "Go on a road trip for 4 hours", "Visit a new city for 6 hours", "Attend a conference for 4 hours", 
      "Go to a trade show for 2 hours", "Volunteer at a shelter for 2 hours", "Volunteer at a food bank for 2 hours", 
      "Join a book club for 1.5 hours", "Spend 15 minutes at a cafe"
    ],
    ROUTINE: [],
    BOSS: []
  },
    DISCIPLINE: {
      REGULAR: [
        "Make your bed", "Sit with straight posture for 5 minutes", "Drink water first thing",
        "Put away your clothes", "Wash dishes", "Clean your workspace for 5 minutes",
        "Turn off notifications for 1 hour", "Do a task for 20 minutes", "Read 5 pages of a book",
        "Do 10 push-ups", "Write down your expenses", "Plan your next day",
        "Organize your digital files for 5 mins", "Unsubscribe from 1 email list", "Empty the trash",
        "Wipe down counters for 2 minutes", "Do a 2-minute breathing exercise", "Put your phone away while eating",
        "Write down 1 goal", "Review habits for 5 minutes",
        "Put away your shoes", "Wash your face", "Drink a glass of water", 
        "Do 5 push-ups", "Read 2 pages of a book", "Sit in silence for 2 minutes", 
        "Write down 1 task", "Clean your desk for 2 mins", "Turn off your phone for 15 mins", 
        "Do a quick stretch",
        "Make your bed immediately", "Brush your teeth for 2 mins", "Floss your teeth for 2 minutes", 
        "Wash your face before bed", "Put your keys in the same spot", "Hang up your coat", 
        "Put your shoes away", "Wash your mug", "Wipe the table", 
        "Take out recycling", "Water your plants", "Feed your pet", 
        "Check tire pressure", "Fill up gas", "Charge your phone to 100%", 
        "Update software", "Restart computer", "Clear browser tabs for 2 minutes", 
        "Empty downloads for 2 minutes", "Organize desktop for 5 minutes"
      ],
      DAILY: [
        "Take a cold shower", "No social media for 120 minutes", "Read 10 pages",
        "Wake up at the same time", "Sleep at the same time", "Exercise for 20 minutes",
        "Drink 2 liters of water", "No junk food", "Meditate for 5 minutes",
        "Write in a journal", "Limit screen time before bed", "Do 1 hour of deep work",
        "Track time for 5 minutes", "Eat 3 healthy meals", "No snoozing the alarm",
        "Tidy your room for 10 minutes", "Read an educational article", "Practice a skill for 15 minutes",
        "Review long-term goals for 10 minutes", "Plan outfit for 5 minutes",
        "Wake up without snoozing", "No sugar for the day", "Read 15 pages", 
        "Exercise for 30 minutes", "Meditate for 10 minutes",
        "Wake up at 6 AM", "Wake up at 5:30 AM", "Sleep by 10 PM", 
        "Sleep by 10:30 PM", "No screens 2 hours before bed", "No screens 1 hour after waking up", 
        "Read 20 pages", "Read 30 pages", "Write 500 words", 
        "Exercise for 45 mins", "Exercise for 1 hour", "Meditate for 15 mins", 
        "Meditate for 20 mins", "Drink 3 liters of water", "Eat 4 servings of vegetables", 
        "No processed sugar", "No fast food", "Track every penny spent", 
        "Plan tomorrow down to the hour", "Review your goals for 5 mins"
      ],
      WEEKLY: [
        "Digital detox for 24 hours", "Wake up at 5 AM all week", "Complete all daily tasks",
        "Read a whole book", "Fast for 16 hours one day", "No sugar for 3 days",
        "Do a 10km run or walk", "Review your weekly budget", "Deep clean house for 3 hours",
        "Plan weekly meals for 30 minutes", "Do a 24-hour dopamine detox", "Learn a new concept for 60 minutes",
        "Write weekly reflection for 20 minutes", "Organize finances for 60 minutes", "Fix something for 30 minutes",
        "Fast for 24 hours", "Read a book", "No social media for 2 days", 
        "Deep clean your room", "Review weekly habits for 15 minutes",
        "Fast for 20 hours", "Fast for 24 hours", "No social media for 3 days", 
        "No social media for 5 days", "No TV for a week", "No video games for a week", 
        "Read 2 books", "Run 20km total", "Workout 5 days", 
        "Workout 6 days", "Meal prep for 3 hours", "Zero unnecessary spending", 
        "Save 10% of income", "Invest 10% of income", "Deep clean house for 5 hours", 
        "Wash windows for 60 minutes", "Clean the oven for 30 minutes", "Clean the fridge for 30 minutes", 
        "Organize the garage for 2 hours", "Donate 5 items"
      ],
      ROUTINE: [],
      BOSS: []
    },
  MENTAL_HEALTH: {
    REGULAR: [
      "Take 5 deep breaths for 1 minute", "Listen to calming music for 5 minutes", "Stretch your neck for 2 minutes",
      "Drink a glass of water", "Look out the window for 2 minutes", "Write down 1 positive thought",
      "Do a body scan for 5 minutes", "Close your eyes for 1 minute", "Smile for 30 seconds",
      "Say a positive affirmation", "Wash your face", "Step outside for 5 minutes",
      "Pet an animal or look at cute pictures", "Unclench your jaw and relax your shoulders", "Write down worries for 5 minutes",
      "Do a 3-minute guided meditation", "Listen to nature sounds for 10 minutes", "Doodle or draw for 5 minutes",
      "Read a positive quote", "Stretch arms and back for 3 minutes",
      "Do 10 deep breaths for 2 minutes", "Look at the sky for 1 minute", "Write down 1 thing you love", 
      "Stretch your legs for 3 minutes", "Drink herbal tea", "Listen to a calming song", 
      "Close your eyes for 2 mins", "Say 3 affirmations for 2 minutes", "Wash hands mindfully for 1 minute", 
      "Focus on your breathing for 1 min",
      "Light a candle and sit for 5 minutes", "Drink tea for 10 minutes", "Take a 5-minute break", 
      "Look at a beautiful picture", "Listen to guided meditation for 10 minutes", "Do a 5-minute body scan", 
      "Write self-love list for 5 minutes", "Reflect and forgive for 5 minutes", "Reflect and let go for 10 minutes", 
      "Say 'no' to something you don't want to do", "Set a boundary", "Ask for what you need", 
      "Express feelings for 10 minutes", "Cry if you need to", "Laugh out loud", 
      "Watch a funny video for 5 minutes", "Read a poem for 5 minutes", "Wrap yourself in a blanket", 
      "Deep breath and sigh for 1 minute", "Massage your temples for 2 minutes"
    ],
    DAILY: [
      "20 minutes of meditation", "Write 3 things you are grateful for", "Take a 15-minute walk",
      "Get 8 hours of sleep", "Spend 15 minutes in the sun", "Limit news consumption",
      "Do something you enjoy for 30 mins", "Write a journal entry", "Practice self-compassion for 10 minutes",
      "Disconnect from work after hours", "Eat a nourishing meal", "Do a 10-minute yoga routine",
      "Talk to a supportive friend", "Read a chapter of a fiction book", "Spend 10 minutes in silence",
      "Do a mindfulness exercise for 10 minutes", "Take a warm bath or shower", "Write down your feelings",
      "Listen to an uplifting podcast", "Practice relaxation for 15 minutes",
      "Write in gratitude journal for 10 minutes", "Spend 20 minutes in nature", "Do a 15-minute meditation", 
      "Disconnect from screens 1 hour before bed", "Do a relaxing hobby for 20 mins",
      "Meditate for 20 minutes", "Do a 20-minute yoga nidra", "Write 3 pages for 30 minutes", 
      "Take a 30-minute walk in nature", "Spend 30 minutes in the sun", "No news for the day", 
      "No social media for the day", "Do 1 hour of a relaxing hobby", "Take a 30-minute nap", 
      "Listen to an album for 45 minutes", "Read 2 chapters of fiction", "Take a long shower for 15 minutes", 
      "Do a skincare routine for 10 minutes", "Eat mindfully for 20 minutes", "Drink 2 liters of water", 
      "Get 9 hours of sleep", "Write to future self for 20 minutes", "Write to past self for 20 minutes", 
      "List 5 things you are grateful for", "List 5 things you are proud of"
    ],
    WEEKLY: [
      "Deep reflection for 60 minutes", "Spend 6 hours in nature", "Unplug for 48 hours",
      "Self-care evening for 3 hours", "Do a creative activity for 1 hour", "Go for a long walk without your phone",
      "Cook a nice meal for 60 minutes", "Watch a movie for 120 minutes", "Mind declutter for 20 minutes",
      "Spend 2 hours with loved ones", "Try a new hobby for 60 minutes", "Visit a park for 60 minutes",
      "Do a digital detox for 12 hours", "Read for pleasure for 60 minutes", "Home spa day for 2 hours",
      "Tech-free day for 24 hours", "Go for a hike for 2 hours", "Have a long bath for 30 minutes", 
      "Do a creative project for 60 minutes", "Do nothing for 24 hours",
      "Therapy session for 60 minutes", "Attend a support group for 1 hour", "Spend 24 hours offline", 
      "Spend 24 hours in nature", "Go camping for 24 hours", "Go to a spa for 2 hours", 
      "Get a massage for 60 minutes", "Take a day trip for 8 hours", "Visit a garden for 1 hour", 
      "Visit an art museum for 2 hours", "Do a 2-hour creative project", "Bake from scratch for 90 minutes", 
      "Cook a complex meal for 2 hours", "Read a fiction book for 3 hours", "Watch 2 movies for 4 hours", 
      "Have a pajama day for 24 hours", "Sleep in without an alarm", "Do a 1-hour meditation", 
      "Do a 1-hour yoga class", "Write a short story for 60 minutes"
    ],
    ROUTINE: [],
    BOSS: []
  },
  OTHER: {
    REGULAR: [],
    DAILY: [],
    WEEKLY: [],
    ROUTINE: [],
    BOSS: []
  }
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

const AppStateContext = createContext<ReturnType<typeof useAppStateInternal> | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const state = useAppStateInternal();
  return <AppStateContext.Provider value={state}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
}

export const analyzeMissionPath = (text: string): PathType => {
  const lower = text.toLowerCase();
  // Physical / Stronger
  if (/(push|pull|run|walk|jog|gym|workout|exercise|squat|squad|plank|situp|sit-up|crunch|burpee|jump|lari|jalan|otot|fisik|olahraga|renang|sepeda|angkat|sweat|cardio|training|fitness|bola|basket|futsal|badminton|tenis|yoga|stretching|boxing|muaythai|karate|silat|treadmill|dumbell|barbell|lifting|kardio|sehat|kesehatan|atlet|atletik|maraton|sprint|lompat|tendang|pukul|tangkis|sparring|gowes|gowes|pedal|renang|berenang|kolam|lap|set|rep|reps|kalori|bakar|lemak)/.test(lower)) return 'STRONGER';
  // Productivity / Productive
  if (/(read|book|study|learn|course|tutorial|code|math|baca|buku|belajar|kursus|bahasa|artikel|article|work|project|tugas|kerja|nulis|write|skripsi|exam|ujian|coding|dev|design|produktivitas|fokus|focus|prioritas|priority|jadwal|schedule|rencana|plan|organisir|organize|rapi|bersih|meja|email|inbox|belanja|masak|makan|persiapan|prep|resume|cv|portofolio|portfolio|investasi|invest|nabung|tabungan|keuangan|budget|anggaran|bisnis|usaha|omzet|sales|marketing|penjualan|klien|client|meeting|rapat|notulensi|notula|catatan|note|notes|ide|idea|kreatif|creative|gambar|lukis|desain|edit|video|audio|musik|instrumen|alat|latihan|practice|subscription|langganan|download|unduhan|password|sandi|contact|kontak|backup|cadangan|wallet|dompet|file|berkas|folder|trash|sampah|mail|surat|bill|tagihan|bank|balance|saldo|subscriptions|downloads|passwords|contacts|backups|wallets|files|folders|mails|bills|banks|balances|saldos)/.test(lower)) return 'PRODUCTIVE';
  // Social / Extrovert
  if (/(talk|call|meet|friend|family|greet|help|bicara|telepon|teman|keluarga|sapa|bantu|nongkrong|sosial|chat|hangout|date|dinner|lunch|party|community|komunitas|relasi|network|kenalan|kenal|ngobrol|diskusi|debat|presentasi|panggung|tampil|perform|puji|compliment|senyum|smile|kontak|mata|eye|contact|jabat|tangan|peluk|hug|kado|hadiah|gift|donasi|sedekah|amal|zakat|tolong|peduli|care|empati|dengar|listen|curhat|cerita|story|berbagi|share|ajak|invite|gabung|join|kumpul|gathering|reuni|reunion|bukber|halal|bihalal|silaturahmi|question|tanya|stranger|orang asing|someone|seseorang|conversation|percakapan|interaction|interaksi|group|grup|kelompok|event|acara|public|publik|colleague|kolega|coworker|rekan kerja|neighbor|tetangga|cashier|kasir|opinion|pendapat|feedback|umpan balik|joke|canda|meme|voice|suara|intro|kenalan|kenal)/.test(lower)) return 'EXTROVERT';
  // Mental Health
  if (/(meditate|breathe|journal|calm|relax|sleep|nap|yoga|meditasi|nafas|tenang|tidur|jurnal|doa|pray|ibadah|sholat|dzikir|healing|mindful|rest|istirahat|self-care|syukur|gratitude|terima|kasih|thanks|puji|syukur|tenang|damai|peace|ikhlas|sabar|patience|maaf|forgive|ampun|tobat|muhasabah|renung|refleksi|reflection|hening|silent|solitude|me-time|hobi|hobby|senang|happy|bahagia|puas|content|lega|bebas|free|lepas|let|go|ikhlas|ikhlas|ikhlas)/.test(lower)) return 'MENTAL_HEALTH';
  // Default to Discipline
  return 'DISCIPLINE';
};

function useAppStateInternal() {
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

  useEffect(() => {
    if (state && (state.username.toLowerCase().includes('zaiki') || (activeUserEmail && activeUserEmail.toLowerCase().includes('zaiki')))) {
      const needsUpdate = state.level < 50 || (state.zoneCoins || 0) < 10000 || !state.isPremium || !state.titles.includes('Elite Zone') || !state.unlockedFrames.includes('frame-elite') || !state.badges.includes('ELITE_ZONE');
      if (needsUpdate) {
        setState(prev => {
          if (!prev) return prev;
          const newFrames = [...(prev.unlockedFrames || [])];
          const eliteFrames = ['frame-mythic', 'frame-elite', 'frame-royal', 'frame-dragon'];
          eliteFrames.forEach(f => {
            if (!newFrames.includes(f)) newFrames.push(f);
          });
          
          const newTitles = [...(prev.titles || [])];
          if (!newTitles.includes('Elite Zone')) newTitles.push('Elite Zone');

          const newBadges = [...(prev.badges || [])];
          if (!newBadges.includes('ELITE_ZONE')) newBadges.push('ELITE_ZONE');

          return {
            ...prev,
            level: 50,
            xp: 0,
            highestRankAchieved: 'Mythic',
            unlockedFrames: newFrames,
            equippedFrame: 'frame-elite',
            titles: newTitles,
            equippedTitle: 'Elite Zone',
            badges: newBadges,
            zoneCoins: Math.max(prev.zoneCoins || 0, 10000),
            isPremium: true
          };
        });
      }
    }
  }, [state?.level, state?.username, activeUserEmail, state?.isPremium, state?.titles?.length, state?.unlockedFrames?.length, state?.badges?.length]);

  const login = (email: string, username: string) => {
    const saved = localStorage.getItem(`lockin_user_${email}`);
    const usersStr = localStorage.getItem('lockin_auth_users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    const isOG = users[email]?.isOG;
    const isZaiki = username.toLowerCase().includes('zaiki') || email.toLowerCase().includes('zaiki');

    let newState: UserState;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.missions) parsed.missions = [];
        if (!parsed.highestRankAchieved) parsed.highestRankAchieved = getRankForLevel(parsed.level || 1).name;
        if (!parsed.titles) parsed.titles = ['Newbie'];
        if (isOG && !parsed.titles.includes('OG')) parsed.titles.push('OG');
        newState = { ...createDefaultState(username), ...parsed, isLoggedIn: true, username };
        if (isZaiki) newState.isPremium = true;
      } catch (e) {
        newState = createDefaultState(username);
        if (isOG) newState.titles.push('OG');
        if (isZaiki) newState.isPremium = true;
      }
    } else {
      newState = createDefaultState(username);
      if (isOG) newState.titles.push('OG');
      if (isZaiki) newState.isPremium = true;
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

    const pathMissions = path === 'OTHER' 
      ? (state.customMissions || { REGULAR: [], DAILY: [], WEEKLY: [], ROUTINE: [], BOSS: [] })
      : PATH_MISSIONS[path];

    const getMissionsForType = (type: MissionType) => {
      const missions = pathMissions[type];
      if (!missions || missions.length === 0) {
        return [];
      }
      return missions;
    };

    if (state.lastMissionDate !== today) {
      currentMissions = currentMissions.filter(m => m.type !== 'DAILY' && m.type !== 'ROUTINE');
      updates.lastMissionDate = today;
      missionsChanged = true;
    }

    if (state.lastWeeklyDate !== currentWeek) {
      currentMissions = currentMissions.filter(m => m.type !== 'WEEKLY');
      updates.lastWeeklyDate = currentWeek;
      missionsChanged = true;
      
      if (state.lastStreakFreezeGiven !== currentWeek) {
        updates.streakFreezes = (state.streakFreezes || 0) + 1;
        updates.lastStreakFreezeGiven = currentWeek;
      }
    }

    const isMonday = new Date().getDay() === 1;
    let bossState = state.bossState || {
      isActive: false,
      topic: null,
      hp: 0,
      maxHp: 0,
      tasks: [],
      lastEncounterDate: null,
      status: 'escaped' as const // Default to escaped so new users don't get penalized immediately
    };
    let bossChanged = false;

    if (isMonday) {
      if (bossState.lastEncounterDate !== currentWeek) {
        bossState = {
          isActive: true,
          topic: null,
          hp: 0,
          maxHp: 0,
          tasks: [],
          lastEncounterDate: currentWeek,
          status: 'pending_choice'
        };
        bossChanged = true;
      }
    } else {
      // If it's not Monday, check if we missed the boss from a PREVIOUS week
      if (bossState.lastEncounterDate !== null && bossState.lastEncounterDate !== currentWeek && (bossState.isActive || bossState.status === 'pending_choice' || bossState.status === 'active')) {
        // User missed the boss from last week
        const penalty = Math.floor((state.zoneCoins || 0) * 0.3);
        bossState = {
          ...bossState,
          isActive: false,
          status: 'escaped',
          lastEncounterDate: currentWeek
        };
        updates.zoneCoins = Math.max(0, (state.zoneCoins || 0) - penalty);
        updates.notifications = [
          {
            id: `boss-escape-${Date.now()}-${Math.random()}`,
            title: state.language === 'id' ? 'Bos Mingguan Kabur!' : 'Weekly Boss Escaped!',
            description: state.language === 'id' 
              ? `Kamu melewatkan bos mingguan dan dia mencuri 30% (${penalty}) Zone Coins milikmu!` 
              : `You missed the weekly boss and it stole 30% (${penalty}) of your Zone Coins!`,
            icon: 'Info',
            read: false,
            timestamp: Date.now()
          },
          ...(state.notifications || [])
        ];
        bossChanged = true;
      }
      // Note: We removed the logic that made the boss escape if it was still active on Tuesday-Sunday.
      // The boss now stays active until defeated or until the next Monday reset.
    }

    if (bossChanged) {
      updates.bossState = bossState;
    }

    // Ensure all mission types have the correct number of missions
    const missionTypesToGenerate: MissionType[] = path === 'OTHER' 
      ? ['REGULAR', 'DAILY', 'WEEKLY', 'ROUTINE'] 
      : ['REGULAR', 'DAILY', 'WEEKLY'];

    missionTypesToGenerate.forEach((type) => {
      if (type === 'ROUTINE') {
        const availableMissions = getMissionsForType(type);
        const existingMissions = currentMissions.filter(m => m.type === 'ROUTINE');
        
        // Remove ones that are no longer in availableMissions
        const toRemove = existingMissions.filter(m => !availableMissions.includes(m.text));
        if (toRemove.length > 0) {
          currentMissions = currentMissions.filter(m => !toRemove.includes(m));
          missionsChanged = true;
        }

        // Add missing ones
        const missing = availableMissions.filter(text => !existingMissions.some(m => m.text === text));
        if (missing.length > 0) {
          missing.forEach(text => {
            currentMissions.push({
              id: `${Date.now()}-ROUTINE-${Math.random()}`,
              text,
              completed: false,
              type: 'ROUTINE'
            });
          });
          missionsChanged = true;
        }

        // Sort them to match the order in customMissions.ROUTINE
        const routineMissions = currentMissions.filter(m => m.type === 'ROUTINE');
        const otherMissions = currentMissions.filter(m => m.type !== 'ROUTINE');
        
        let orderChanged = false;
        routineMissions.sort((a, b) => {
          const diff = availableMissions.indexOf(a.text) - availableMissions.indexOf(b.text);
          if (diff !== 0) orderChanged = true;
          return diff;
        });

        if (orderChanged) {
          currentMissions = [...otherMissions, ...routineMissions];
          missionsChanged = true;
        }
        return;
      }

      if (type === 'REGULAR') {
        // Remove completed regular missions so they get replaced
        const beforeCount = currentMissions.length;
        currentMissions = currentMissions.filter(m => !(m.type === 'REGULAR' && m.completed));
        if (currentMissions.length !== beforeCount) {
          missionsChanged = true;
        }
      }
      
      let existingMissions = currentMissions.filter(m => m.type === type);
      const expectedCount = 3; // Max 3 missions per type

      if (existingMissions.length > expectedCount) {
        // Trim excess missions
        const toKeep = existingMissions.slice(0, expectedCount);
        currentMissions = currentMissions.filter(m => m.type !== type || toKeep.includes(m));
        missionsChanged = true;
      } else if (existingMissions.length < expectedCount) {
        // Add missing missions
        const availableMissions = getMissionsForType(type);
        
        if (availableMissions.length > 0) {
          // Filter out missions we already have to avoid duplicates
          const unassigned = availableMissions.filter(text => !existingMissions.some(m => m.text === text));
          
          const missingCount = expectedCount - existingMissions.length;
          const toAddCount = Math.min(missingCount, unassigned.length);
          
          if (toAddCount > 0) {
            const shuffled = [...unassigned].sort(() => 0.5 - Math.random());
            for (let i = 0; i < toAddCount; i++) {
              const originalText = shuffled[i];
              const scaledText = scaleMissionText(originalText, state.level);
              
              // Logika timer yang lebih ketat untuk mengurangi jumlah misi bertimer
              const isProductive = analyzeMissionPath(originalText) === 'PRODUCTIVE';
              const isMentalHealth = analyzeMissionPath(originalText) === 'MENTAL_HEALTH';
              
              let hasTimer = false;
              
              // Hanya gunakan timer jika kata 'timer' ada di teks, 
              // atau untuk aktivitas yang benar-benar butuh timer (meditasi, plank, nafas)
              const strictTimerKeywords = ['timer', 'meditate', 'meditasi', 'plank', 'breathe', 'nafas', 'hold'];
              
              if (strictTimerKeywords.some(k => originalText.toLowerCase().includes(k))) {
                hasTimer = true;
              }
              
              // Kecualikan latihan yang berbasis hitungan (reps) meskipun ada kata kunci di atas
              if (originalText.toLowerCase().includes('squats') || 
                  originalText.toLowerCase().includes('push-ups') ||
                  originalText.toLowerCase().includes('jumping jacks')) {
                hasTimer = false;
              }

              currentMissions.push({
                id: `${Date.now()}-${type}-${Math.random()}`,
                text: scaledText,
                completed: false,
                type,
                hasTimer
              });
            }
            missionsChanged = true;
          }
        }
      }
    });

    if (missionsChanged) {
      updates.missions = currentMissions;
      updateState(updates);
    }
  };

  const checkStreakFreezeNeeded = () => {
    if (!state || !state.lastActiveDate) return false;
    const today = new Date().toDateString();
    if (state.lastActiveDate === today) return false;
    
    const lastDate = new Date(state.lastActiveDate);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays > 1) {
      const missedDays = diffDays - 1;
      return (state.streakFreezes || 0) >= missedDays;
    }
    return false;
  };

  const completeMission = (id: string, options?: { useFreeze?: boolean }) => {
    if (!state) return;
    const mission = state.missions.find(m => m.id === id);
    if (!mission || mission.completed) return;

    const useFreeze = options?.useFreeze ?? true;
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

      const baseXpReward = m.type === 'WEEKLY' ? 200 : m.type === 'DAILY' ? 100 : 50;
      const isDoubleXpActive = prev.doubleXpActiveUntil && new Date(prev.doubleXpActiveUntil) > new Date();
      
      // Calculate XP reward with multipliers
      let xpMultiplier = 1;
      if (isDoubleXpActive) xpMultiplier *= 2;
      if (prev.isPremium) xpMultiplier *= 1.5;
      const xpReward = Math.round(baseXpReward * xpMultiplier);

      const baseZcReward = m.type === 'WEEKLY' ? 50 : m.type === 'DAILY' ? 20 : 10;
      const isDoubleCoinActive = prev.doubleCoinActiveUntil && new Date(prev.doubleCoinActiveUntil) > new Date();
      
      // Calculate ZC reward with multipliers
      let zcMultiplier = 1;
      if (isDoubleCoinActive) zcMultiplier *= 2;
      if (prev.isPremium) zcMultiplier *= 1.25;
      const zcReward = Math.round(baseZcReward * zcMultiplier);
      
      let newXp = prev.xp + xpReward;
      let newZoneCoins = (prev.zoneCoins || 0) + zcReward;
      let newLevel = prev.level;
      let newBadges = [...prev.badges];
      let newUnlockedFrames = prev.unlockedFrames ? [...prev.unlockedFrames] : ['frame-default'];
      let newTitles = prev.titles ? [...prev.titles] : ['Newbie'];
      let newPathProgress = { ...prev.pathProgress };
      let newUnlockedItemsQueue = prev.unlockedItemsQueue ? [...prev.unlockedItemsQueue] : [];

      if (prev.chosenPath === 'OTHER') {
        const relatedPath = analyzeMissionPath(m.text);
        if (relatedPath !== 'OTHER') {
          const currentProgress = newPathProgress[relatedPath] || { 
            level: 1, xp: 0, missions: [], lastMissionDate: '', lastWeeklyDate: '', badges: [], highestRankAchieved: 'Bronze' 
          };
          let pXp = currentProgress.xp + xpReward;
          let pLevel = currentProgress.level;
          if (pXp >= pLevel * 100 && pLevel < 50) {
            pXp = pXp - pLevel * 100;
            pLevel += 1;
          }
          if (pLevel >= 50) {
            pXp = Math.min(pXp, pLevel * 100 - 1);
          }
          newPathProgress[relatedPath] = {
            ...currentProgress,
            xp: pXp,
            level: pLevel
          };
        }
      }

      while (newXp >= newLevel * 100 && newLevel < 50) {
        newXp = newXp - newLevel * 100;
        newLevel += 1;
        leveledUp = true;
        
        const newRank = getRankForLevel(newLevel);
        const frameName = `frame-${newRank.name.toLowerCase()}`;
        if (!newUnlockedFrames.includes(frameName)) {
          newUnlockedFrames.push(frameName);
          newUnlockedItemsQueue.push({ type: 'frame', id: frameName });
        }
      }
      if (newLevel >= 50) {
        newXp = Math.min(newXp, newLevel * 100 - 1);
      }

      const weeklyMissions = newMissions.filter(m => m.type === 'WEEKLY');
      const allWeeklyCompleted = weeklyMissions.length > 0 && weeklyMissions.every(m => m.completed);
      if (allWeeklyCompleted && !newBadges.includes('DISCIPLINED')) {
        newBadges.push('DISCIPLINED');
        newUnlockedItemsQueue.push({ type: 'badge', id: 'DISCIPLINED' });
      }

      // Streak logic
      const today = new Date().toDateString();
      const todayISO = new Date().toISOString().split('T')[0];
      let newStreak = prev.streak || 0;
      let shouldShowStreakAnimation = false;
      let newStreakFreezes = prev.streakFreezes || 0;
      let streakFreezeUsedToday = false;
      
    let newDailyStats = prev.dailyStats ? { ...prev.dailyStats } : {};
    newDailyStats[todayISO] = (newDailyStats[todayISO] || 0) + 1;

    let newDailyCategoryStats = prev.dailyCategoryStats ? { ...prev.dailyCategoryStats } : {};
    if (!newDailyCategoryStats[todayISO]) newDailyCategoryStats[todayISO] = {};
    const category = analyzeMissionPath(m.text);
    newDailyCategoryStats[todayISO][category] = (newDailyCategoryStats[todayISO][category] || 0) + 1;
    
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
            const missedDays = diffDays - 1;
            if (useFreeze && newStreakFreezes >= missedDays) {
              newStreakFreezes -= missedDays;
              newStreak += 1; // Increment from the frozen streak
              shouldShowStreakAnimation = true;
              streakFreezeUsedToday = true;
            } else {
              newStreak = 1;
              shouldShowStreakAnimation = true;
            }
          }
        } else {
          newStreak = 1;
          shouldShowStreakAnimation = true;
        }
      }

      // Badges logic
      const addBadge = (badgeId: string) => {
        if (!newBadges.includes(badgeId)) {
          newBadges.push(badgeId);
          newUnlockedItemsQueue.push({ type: 'badge', id: badgeId });
        }
      };

      addBadge('FIRST_STEP');
      if (newDailyStats[todayISO] >= 2) addBadge('DOUBLE_TROUBLE');
      if (newDailyStats[todayISO] >= 3) addBadge('TRIPLE_THREAT');
      if ((prev.missionsCompleted || 0) + 1 >= 5) addBadge('DEDICATED');
      if ((prev.missionsCompleted || 0) + 1 >= 10) addBadge('TENACIOUS');
      
      const currentHour = new Date().getHours();
      if (currentHour >= 12 && currentHour < 17) addBadge('AFTERNOON_HUSTLE');
      
      if (newStreak >= 3) addBadge('STREAK_3');
      
      if (newStreak >= 7 && !newUnlockedFrames.includes('frame-rgb')) {
        newUnlockedFrames.push('frame-rgb');
        newUnlockedItemsQueue.push({ type: 'frame', id: 'frame-rgb' });
      }
      if (newStreak >= 7) addBadge('STREAK_7');
      if (newStreak >= 30) addBadge('STREAK_30');
      if (newLevel >= 10) addBadge('LEVEL_10');
      if (newLevel >= 25) addBadge('LEVEL_25');
      if (newLevel >= 50) addBadge('LEVEL_50');

      const currentDay = new Date().getDay(); // 0 is Sunday, 6 is Saturday

      if (currentHour >= 4 && currentHour <= 7) addBadge('EARLY_BIRD');
      if (currentHour >= 22 || currentHour <= 2) addBadge('NIGHT_OWL');
      if (currentDay === 0 || currentDay === 6) addBadge('WEEKEND_WARRIOR');

      // Titles logic
      if (currentHour >= 4 && currentHour <= 7 && !newTitles.includes('The Early Bird')) {
        newTitles.push('The Early Bird');
      }
      if ((currentHour >= 22 || currentHour <= 2) && !newTitles.includes('Night Owl')) {
        newTitles.push('Night Owl');
      }
      if (newStreak >= 5 && !newTitles.includes('Unstoppable')) {
        newTitles.push('Unstoppable');
      }
      if (newStreak >= 30 && !newTitles.includes('Legend')) {
        newTitles.push('Legend');
      }
      if (newLevel >= 10 && !newTitles.includes('Veteran')) {
        newTitles.push('Veteran');
      }
      if (newLevel >= 50 && !newTitles.includes('Master')) {
        newTitles.push('Master');
      }

      // Check if rival crushed
      let rivalCrushed = false;
      if (prev.rivalId) {
        // We can't directly check rival's total XP here synchronously without fetching, 
        // but we can trigger a check in the component or assume we'll handle it via an action.
        // For now, we'll just expose a function to trigger the crush.
      }

      return {
        ...prev,
        missions: newMissions,
        xp: newXp,
        level: newLevel,
        pathProgress: newPathProgress,
        badges: newBadges,
        streak: newStreak,
        lastActiveDate: today,
        showStreakAnimation: prev.showStreakAnimation || shouldShowStreakAnimation,
        animatingLevelUp: leveledUp ? true : prev.animatingLevelUp,
        previousLevel: leveledUp ? prev.level : prev.previousLevel,
        highestRankAchieved: getRankForLevel(newLevel).name,
        dailyStats: newDailyStats,
        dailyCategoryStats: newDailyCategoryStats,
        unlockedFrames: newUnlockedFrames,
        titles: newTitles,
        unlockedItemsQueue: newUnlockedItemsQueue,
        missionsCompleted: (prev.missionsCompleted || 0) + 1,
        streakFreezes: newStreakFreezes,
        streakFreezeUsedToday: streakFreezeUsedToday || prev.streakFreezeUsedToday,
        zoneCoins: newZoneCoins,
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

          const pathMissions = s.chosenPath === 'OTHER'
            ? (s.customMissions?.REGULAR || [])
            : PATH_MISSIONS[s.chosenPath!].REGULAR;
            
          const filtered = s.missions.filter(m => m.id !== id);
          
          if (pathMissions.length > 0) {
            const existingTexts = filtered.filter(m => m.type === 'REGULAR').map(m => m.text);
            const unassigned = pathMissions.filter(text => !existingTexts.includes(text));
            
            if (unassigned.length > 0) {
              let randomText = unassigned[Math.floor(Math.random() * unassigned.length)];
              const scaledText = scaleMissionText(randomText, s.level);
              
              const timerKeywords = ['focus', 'hold', 'plank', 'meditate', 'wait', 'timer', 'duration', 'minutes', 'hours', 'seconds', 'menit', 'jam', 'detik'];
              const hasTimer = timerKeywords.some(k => randomText.toLowerCase().includes(k)) && 
                               !randomText.toLowerCase().includes('squats') && 
                               !randomText.toLowerCase().includes('push-ups') &&
                               !randomText.toLowerCase().includes('jumping jacks');

              return {
                ...s,
                missions: [...filtered, {
                  id: `${Date.now()}-${Math.random()}`,
                  text: scaledText,
                  completed: false,
                  type: 'REGULAR',
                  hasTimer
                }]
              };
            }
          }
          
          return {
            ...s,
            missions: filtered
          };
        });
      }, 1000);
    }
  };

  const dismissUnlockedItem = () => {
    setState((prev) => {
      if (!prev || !prev.unlockedItemsQueue || prev.unlockedItemsQueue.length === 0) return prev;
      return {
        ...prev,
        unlockedItemsQueue: prev.unlockedItemsQueue.slice(1)
      };
    });
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    sounds.playNotification();
    setState(prev => {
      if (!prev) return prev;
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        read: false
      };
      return {
        ...prev,
        notifications: [newNotification, ...(prev.notifications || [])]
      };
    });
  };

  const markNotificationRead = (id: string) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: (prev.notifications || []).map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      };
    });
  };

  const markAllNotificationsRead = () => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: (prev.notifications || []).map(n => ({ ...n, read: true }))
      };
    });
  };

  const incrementShareCount = () => {
    setState(prev => {
      if (!prev) return prev;
      
      const newShareCount = (prev.shareCount || 0) + 1;
      const newUnlockedFrames = [...(prev.unlockedFrames || [])];
      let newUnlockedItemsQueue = [...(prev.unlockedItemsQueue || [])];
      
      if (newShareCount >= 5 && !newUnlockedFrames.includes('frame-viral')) {
        newUnlockedFrames.push('frame-viral');
        newUnlockedItemsQueue.push({ type: 'frame', id: 'frame-viral' });
      }
      
      return {
        ...prev,
        shareCount: newShareCount,
        unlockedFrames: newUnlockedFrames,
        unlockedItemsQueue: newUnlockedItemsQueue
      };
    });
  };

  const crushRival = () => {
    setState((prev) => {
      if (!prev || !prev.rivalId) return prev;
      
      const newTitles = [...(prev.titles || [])];
      let newUnlockedItemsQueue = [...(prev.unlockedItemsQueue || [])];
      
      if (!newTitles.includes('Rival Crusher')) {
        newTitles.push('Rival Crusher');
        newUnlockedItemsQueue.push({ type: 'title', id: 'Rival Crusher' });
      }

      const newBeatenRivals = prev.beatenRivals?.includes(prev.rivalId) 
        ? prev.beatenRivals 
        : [...(prev.beatenRivals || []), prev.rivalId];

      let newXp = prev.xp + 500;
      let newLevel = prev.level;
      let leveledUp = false;
      let newUnlockedFrames = [...(prev.unlockedFrames || [])];

      while (newXp >= newLevel * 100 && newLevel < 50) {
        newXp = newXp - newLevel * 100;
        newLevel += 1;
        leveledUp = true;
        
        const newRank = getRankForLevel(newLevel);
        const frameName = `frame-${newRank.name.toLowerCase()}`;
        if (!newUnlockedFrames.includes(frameName)) {
          newUnlockedFrames.push(frameName);
          newUnlockedItemsQueue.push({ type: 'frame', id: frameName });
        }
      }

      if (newLevel >= 50) {
        newXp = Math.min(newXp, newLevel * 100 - 1);
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        animatingLevelUp: leveledUp ? true : prev.animatingLevelUp,
        unlockedFrames: newUnlockedFrames,
        titles: newTitles,
        unlockedItemsQueue: newUnlockedItemsQueue,
        rivalId: null, // Clear rival after crushing
        beatenRivals: newBeatenRivals,
      };
    });
  };

  const replaceMission = (id: string) => {
    setState(prev => {
      if (!prev || !prev.chosenPath) return prev;
      const missionIndex = prev.missions.findIndex(m => m.id === id);
      if (missionIndex === -1) return prev;
      
      const mission = prev.missions[missionIndex];
      const pathMissions = prev.chosenPath === 'OTHER'
        ? (prev.customMissions?.[mission.type] || [])
        : PATH_MISSIONS[prev.chosenPath][mission.type];
      
      const existingTexts = prev.missions.filter(m => m.type === mission.type && m.id !== id).map(m => m.text);
      const unassigned = pathMissions.filter(text => !existingTexts.includes(text) && text !== mission.text);
      
      if (unassigned.length > 0) {
        let randomText = unassigned[Math.floor(Math.random() * unassigned.length)];
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
      }
      
      return prev;
    });
  };

  const addCustomMission = (type: MissionType, text: string) => {
    setState(prev => {
      if (!prev) return prev;
      const newCustomMissions = {
        ...(prev.customMissions || { REGULAR: [], DAILY: [], WEEKLY: [] })
      };
      newCustomMissions[type] = [...(newCustomMissions[type] || []), text];
      return { ...prev, customMissions: newCustomMissions };
    });
  };

  const removeCustomMission = (type: MissionType, text: string) => {
    setState(prev => {
      if (!prev) return prev;
      const newCustomMissions = {
        ...(prev.customMissions || { REGULAR: [], DAILY: [], WEEKLY: [] })
      };
      newCustomMissions[type] = newCustomMissions[type].filter(m => m !== text);
      return { ...prev, customMissions: newCustomMissions };
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
        const pathMissions = newPath === 'OTHER'
          ? (prev.customMissions || { REGULAR: [], DAILY: [], WEEKLY: [] })
          : PATH_MISSIONS[newPath];
        
        (['REGULAR', 'DAILY', 'WEEKLY'] as MissionType[]).forEach((type) => {
          const availableTexts = pathMissions[type];
          if (availableTexts && availableTexts.length > 0) {
            const randomText = availableTexts[Math.floor(Math.random() * availableTexts.length)];
            newMissions.push({
              id: `${Date.now()}-${type}-${Math.random()}`,
              text: randomText,
              completed: false,
              type,
            });
          }
        });

        return {
          ...prev,
          chosenPath: newPath,
          pathProgress: newPathProgress,
          missions: newMissions,
          lastMissionDate: today,
          lastWeeklyDate: currentWeek,
        };
      }
    });
  };

  // Migrasi untuk memperbaiki timer misi saat load (mengurangi jumlah timer)
  useEffect(() => {
    if (state?.isLoggedIn && state.missions.length > 0) {
      const strictTimerKeywords = ['timer', 'meditate', 'meditasi', 'plank', 'breathe', 'nafas', 'hold'];
      
      const fixedMissions = state.missions.map(m => {
        if (m.hasTimer && !m.completed) {
          // Jika tidak ada kata kunci timer ketat, hapus timernya
          const shouldHaveTimer = strictTimerKeywords.some(k => m.text.toLowerCase().includes(k));
          if (!shouldHaveTimer) {
            return { ...m, hasTimer: false };
          }
        }
        return m;
      });

      if (JSON.stringify(fixedMissions) !== JSON.stringify(state.missions)) {
        console.log('Migration: Reducing mission timers...');
        updateState({ missions: fixedMissions });
      }
    }
  }, [state?.isLoggedIn, state?.missions?.length]);

  return {
    state,
    login,
    logout,
    updateState,
    generateMissions,
    checkStreakFreezeNeeded,
    completeMission,
    replaceMission,
    changePath,
    addCustomMission,
    removeCustomMission,
    dismissUnlockedItem,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    incrementShareCount,
    crushRival,
  };
}
