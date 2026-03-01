import { useState, useEffect } from 'react';
import { sounds } from './utils/sounds';

export type PathType = 'PRODUCTIVE' | 'STRONGER' | 'EXTROVERT' | 'DISCIPLINE' | 'MENTAL_HEALTH' | 'OTHER';
export type MissionType = 'REGULAR' | 'DAILY' | 'WEEKLY' | 'ROUTINE';

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
  dailyStats: Record<string, number>;
  unlockedFrames: string[];
  equippedFrame: string | null;
  titles: string[];
  equippedTitle: string | null;
  hasPromptedPfp: boolean;
  customMissions: Record<MissionType, string[]>;
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

export function calculateOVR(state: UserState) {
  const getPathScore = (path: PathType) => {
    const p = state.chosenPath === path 
      ? { level: state.level, xp: state.xp } 
      : (state.pathProgress[path] || { level: 1, xp: 0 });
    return Math.floor(Math.min(99, 40 + (p.level * 1.5) + (p.xp / 100)));
  };

  const physical = getPathScore('STRONGER');
  const mental = getPathScore('MENTAL_HEALTH');
  const intellect = getPathScore('PRODUCTIVE');
  const social = getPathScore('EXTROVERT');
  const other = getPathScore('OTHER');
  
  // Discipline: streak
  const discipline = Math.floor(Math.min(99, 40 + (state.streak * 1.5)));

  // Ambition: total levels across all paths + badges
  let totalLevels = state.level;
  Object.keys(state.pathProgress).forEach(k => {
    if (k !== state.chosenPath) {
      totalLevels += state.pathProgress[k as PathType]?.level || 1;
    }
  });
  const ambition = Math.floor(Math.min(99, 40 + (totalLevels * 1.5) + (state.badges.length * 1.5)));

  // Weighted average (excluding 'other' from main OVR calculation as requested)
  const ovr = Math.floor((physical + discipline + mental + ambition + intellect + social) / 6);

  return {
    ovr,
    stats: {
      physical,
      discipline,
      mental,
      ambition,
      intellect,
      social,
      other
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
  unlockedFrames: ['frame-default'],
  equippedFrame: null,
  titles: ['Newbie'],
  equippedTitle: 'Newbie',
  hasPromptedPfp: false,
  customMissions: {
    REGULAR: [],
    DAILY: [],
    WEEKLY: [],
    ROUTINE: []
  }
});

const PATH_MISSIONS: Record<PathType, Record<MissionType, string[]>> = {
  PRODUCTIVE: {
    REGULAR: [
      "Read a self-help article", "Organize your files for 5 minutes", "Plan your week",
      "Write down 3 priorities for today", "Clear your email inbox", "Declutter your workspace",
      "Listen to an educational podcast", "Watch a tutorial on a new tool", "Brainstorm ideas for a project",
      "Review your monthly goals", "Update your to-do list", "Unsubscribe from 3 useless emails",
      "Organize your computer desktop", "Read 1 chapter of a non-fiction book", "Plan your meals for tomorrow",
      "Write a journal entry about your progress", "Delete unused apps from your phone", "Set a timer for 15 mins and focus on one task",
      "Review your budget", "Create a morning routine plan",
      "Write a quick summary of your day", "Delete 5 unnecessary files", "Organize your bookmarks", 
      "Set a timer for 10 mins and clean", "Write down 3 things to do tomorrow", "Check your calendar for the week", 
      "Unsubscribe from 1 promotional text", "Clear your browser cache", "Read 1 article about productivity", 
      "Plan a reward for completing a task",
      "Update your passwords", "Clear your downloads folder", "Read 1 page of a book", 
      "Write down 1 idea", "Organize your phone apps", "Delete 10 old photos", 
      "Set a new wallpaper", "Clean your keyboard", "Wipe your monitor", 
      "Empty your physical trash bin", "Sort your mail", "Pay a bill", 
      "Check your bank balance", "Write a thank you note", "Plan your weekend", 
      "Review your subscriptions", "Cancel 1 unused subscription", "Update your contacts", 
      "Back up your phone", "Clean your wallet"
    ],
    DAILY: [
      "30 minutes study focus", "Clean desk", "Write tomorrow's goal",
      "Wake up at your target time", "Read for 20 minutes", "No phone for the first hour after waking up",
      "Complete your most important task first", "Drink a glass of water upon waking", "Review your daily schedule",
      "Spend 10 minutes learning a language", "Write down one thing you learned today", "Do a 5-minute end-of-day review",
      "Prepare your clothes for tomorrow", "Limit social media to 30 minutes", "Take a 15-minute screen break",
      "Practice typing for 10 minutes", "Listen to an audiobook during commute", "Keep your phone in another room while working",
      "Track your expenses for the day", "Do a 10-minute brain dump",
      "Listen to an inspiring talk", "Spend 15 minutes planning", "Do 1 hour of focused work", 
      "Review your long-term goals", "Write a reflection for the day",
      "Read 1 article", "Listen to 1 podcast episode", "Watch 1 educational video", 
      "Write 500 words", "Study for 20 minutes", "Review flashcards", 
      "Practice a musical instrument for 10 mins", "Code for 30 mins", "Draw for 15 mins", 
      "Write down 3 things you accomplished", "Plan tomorrow's meals", "Drink green tea", 
      "Take a 5-minute stretch break", "Do 10 minutes of deep breathing", "Write down your top priority", 
      "Avoid multitasking for 1 hour", "Use the Pomodoro technique once", "Turn off phone for 30 mins", 
      "Read a newsletter", "Review your daily budget"
    ],
    WEEKLY: [
      "Read a book for 120 minutes", "Review weekly goals", "Learn a new skill",
      "Deep clean your room", "Plan the upcoming week's schedule", "Do a weekly financial review",
      "Back up your computer files", "Clean out your fridge", "Wash your bed sheets",
      "Spend 2 hours on a personal project", "Listen to a 1-hour educational lecture", "Organize your digital photos",
      "Update your resume or portfolio", "Meal prep for the week", "Evaluate last week's productivity",
      "Organize your physical workspace", "Review your monthly budget", "Plan a personal project", 
      "Read 2 chapters of a book", "Do a weekly brain dump",
      "Read 3 chapters of a book", "Complete an online course module", "Write a blog post", 
      "Update your LinkedIn profile", "Network with 1 person", "Attend a webinar", 
      "Clean your car", "Do all your laundry", "Iron your clothes", 
      "Vacuum your room", "Mop the floors", "Clean the bathroom", 
      "Organize your closet", "Donate old clothes", "Plan a trip", 
      "Review your monthly goals", "Set goals for next month", "Create a vision board", 
      "Read a biography", "Watch a documentary"
    ],
    ROUTINE: []
  },
  STRONGER: {
    REGULAR: [
      "Do 10 squats", "Stretch for 5 minutes", "Hold a plank for 30 seconds",
      "Do 15 jumping jacks", "Do 10 lunges per leg", "Do 10 push-ups",
      "Do 20 calf raises", "Do a 1-minute wall sit", "Do 15 crunches",
      "Do 10 burpees", "Stretch your hamstrings", "Do arm circles for 1 minute",
      "Do 20 high knees", "Do 15 glute bridges", "Do a 30-second side plank (each side)",
      "Do 10 tricep dips", "Do 20 mountain climbers", "Stretch your shoulders",
      "Do 15 bicycle crunches", "Do 10 jump squats",
      "Do 20 jumping jacks", "Do 15 squats", "Hold a plank for 45 seconds", 
      "Stretch your back", "Do 10 lunges", "Do 15 calf raises", 
      "Do 10 push-ups", "Do a 30-second wall sit", "Stretch your arms", 
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
      "20 push-ups", "Drink enough water", "Hold a wall sit for 60 seconds",
      "Walk 10,000 steps", "Eat 2 servings of vegetables", "Eat 1 serving of fruit",
      "Sleep for 8 hours", "Do a 15-minute workout", "Stretch before bed",
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
      "Go for a 5km run", "Meal prep for 3 days", "Try a new workout",
      "Do a 1-hour strength training session", "Go for a 1-hour hike or walk", "Do a 30-minute yoga session",
      "Try a new healthy recipe", "Do a HIIT workout", "Go swimming or cycling",
      "Do a full-body stretching routine", "Track your macros for 3 days", "Do 100 push-ups in one day",
      "Do 100 squats in one day", "Play a sport for 1 hour", "Do a 45-minute cardio session",
      "Do a 45-minute strength workout", "Go for a 30-minute run", "Try a new sport", 
      "Meal prep for 5 days", "Do a 1-hour yoga session",
      "Go for a 10km run", "Do a 2-hour strength training", "Go for a 2-hour hike", 
      "Do a 1-hour yoga class", "Try a new sport for 1 hour", "Do a 1-hour Pilates class", 
      "Go rock climbing", "Go for a 20km bike ride", "Swim for 1 hour", 
      "Play basketball for 1 hour", "Play tennis for 1 hour", "Play soccer for 1 hour", 
      "Do a martial arts class", "Do a dance class", "Do a CrossFit workout", 
      "Meal prep for 7 days", "Track macros for 7 days", "Do 200 push-ups in one day", 
      "Do 200 squats in one day", "Run a 5k under 30 mins"
    ],
    ROUTINE: []
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
      "Call a family member", "Text a friend you haven't spoken to recently", "Have a 5-minute conversation with a colleague",
      "Post something positive on social media", "Listen actively without interrupting", "Ask 3 open-ended questions today",
      "Express gratitude to someone", "Join a group conversation", "Make plans with a friend",
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
      "Attend a social event", "Call an old friend", "Have a deep conversation",
      "Go out for coffee with someone", "Host a small get-together", "Join a club or community meetup",
      "Volunteer for a local cause", "Play a multiplayer game with voice chat", "Go to a public place and talk to 3 people",
      "Have lunch with a coworker or classmate", "Attend a workshop or class", "Organize a movie night",
      "Go to a networking event", "Have a video call with a distant friend", "Participate in a group discussion",
      "Attend a networking event", "Host a dinner or lunch", "Go to a meetup", 
      "Call a family member for 30 mins", "Volunteer for an event",
      "Host a game night", "Host a potluck", "Go to a concert", 
      "Go to a comedy show", "Go to a museum with a friend", "Go to an art gallery", 
      "Attend a local festival", "Join a sports league", "Take a group class", 
      "Go to a trivia night", "Go to a karaoke bar", "Organize a picnic", 
      "Go on a road trip with friends", "Visit a new city with friends", "Attend a conference", 
      "Go to a trade show", "Volunteer at an animal shelter", "Volunteer at a food bank", 
      "Join a book club", "Start a conversation with a stranger at a cafe"
    ],
    ROUTINE: []
  },
  DISCIPLINE: {
    REGULAR: [
      "Make your bed", "Sit with straight posture for 5 minutes", "Drink water first thing",
      "Put away your clothes", "Wash your dishes immediately", "Clean your workspace",
      "Turn off notifications for 1 hour", "Do a task you've been procrastinating", "Read 5 pages of a book",
      "Do 10 push-ups", "Write down your expenses", "Plan your next day",
      "Organize your digital files for 5 mins", "Unsubscribe from 1 email list", "Empty the trash",
      "Wipe down your counters", "Do a 2-minute breathing exercise", "Put your phone away while eating",
      "Write down 1 goal", "Review your daily habits",
      "Put away your shoes", "Wash your face", "Drink a glass of water", 
      "Do 5 push-ups", "Read 2 pages of a book", "Sit in silence for 2 minutes", 
      "Write down 1 task", "Clean your desk for 2 mins", "Turn off your phone for 15 mins", 
      "Do a quick stretch",
      "Make your bed immediately", "Brush your teeth for 2 mins", "Floss your teeth", 
      "Wash your face before bed", "Put your keys in the same spot", "Hang up your coat", 
      "Put your shoes away", "Wash your coffee mug", "Wipe the table after eating", 
      "Take out the recycling", "Water your plants", "Feed your pet on time", 
      "Check your tire pressure", "Fill up your gas tank", "Charge your phone to 100%", 
      "Update your software", "Restart your computer", "Clear your browser tabs", 
      "Empty your downloads folder", "Organize your desktop icons"
    ],
    DAILY: [
      "Take a cold shower", "No social media for 120 minutes", "Read 10 pages",
      "Wake up at the same time", "Sleep at the same time", "Exercise for 20 minutes",
      "Drink 2 liters of water", "No junk food", "Meditate for 5 minutes",
      "Write in a journal", "Limit screen time before bed", "Do 1 hour of deep work",
      "Track your time for the day", "Eat 3 healthy meals", "No snoozing the alarm",
      "Keep your room tidy", "Read an educational article", "Practice a skill for 15 minutes",
      "Review your long-term goals", "Plan tomorrow's outfit",
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
      "Digital detox for 1 day", "Wake up at 5 AM all week", "Complete all daily tasks",
      "Read a whole book", "Fast for 16 hours one day", "No sugar for 3 days",
      "Do a 10km run or walk", "Review your weekly budget", "Deep clean your house",
      "Plan all meals for the week", "Do a 24-hour dopamine detox", "Learn a complex new concept",
      "Write a weekly reflection", "Organize your finances", "Fix something broken",
      "Fast for 24 hours", "Read a book", "No social media for 2 days", 
      "Deep clean your room", "Review your weekly habits",
      "Fast for 20 hours", "Fast for 24 hours", "No social media for 3 days", 
      "No social media for 5 days", "No TV for a week", "No video games for a week", 
      "Read 2 books", "Run 20km total", "Workout 5 days", 
      "Workout 6 days", "Meal prep all meals", "Zero unnecessary spending", 
      "Save 10% of income", "Invest 10% of income", "Deep clean the entire house", 
      "Wash all windows", "Clean the oven", "Clean the fridge", 
      "Organize the garage", "Donate 5 items"
    ],
    ROUTINE: []
  },
  MENTAL_HEALTH: {
    REGULAR: [
      "Take 5 deep breaths", "Listen to calming music for 5 minutes", "Stretch your neck",
      "Drink a glass of water", "Look out the window for 2 minutes", "Write down 1 positive thought",
      "Do a quick body scan", "Close your eyes for 1 minute", "Smile for 30 seconds",
      "Say a positive affirmation", "Wash your face", "Step outside for fresh air",
      "Pet an animal or look at cute pictures", "Unclench your jaw and relax your shoulders", "Write down what's bothering you",
      "Do a 3-minute guided meditation", "Listen to nature sounds", "Doodle or draw for 5 minutes",
      "Read a positive quote", "Stretch your arms and back",
      "Take 10 deep breaths", "Look at the sky for 1 minute", "Write down 1 thing you love", 
      "Stretch your legs", "Drink herbal tea", "Listen to a calming song", 
      "Close your eyes for 2 mins", "Say 3 positive affirmations", "Wash your hands mindfully", 
      "Focus on your breathing for 1 min",
      "Light a scented candle", "Drink a warm cup of tea", "Take a 5-minute break", 
      "Look at a beautiful picture", "Listen to a guided meditation", "Do a 5-minute body scan", 
      "Write down 3 things you love about yourself", "Forgive yourself for a mistake", "Let go of a grudge", 
      "Say 'no' to something you don't want to do", "Set a boundary", "Ask for what you need", 
      "Express your feelings", "Cry if you need to", "Laugh out loud", 
      "Watch a funny video", "Read a comforting poem", "Wrap yourself in a blanket", 
      "Take a deep breath and sigh", "Massage your temples"
    ],
    DAILY: [
      "10 minutes of meditation", "Write 3 things you are grateful for", "Take a 15-minute walk",
      "Get 8 hours of sleep", "Spend 15 minutes in the sun", "Limit news consumption",
      "Do something you enjoy for 30 mins", "Write a journal entry", "Practice self-compassion",
      "Disconnect from work after hours", "Eat a nourishing meal", "Do a 10-minute yoga routine",
      "Talk to a supportive friend", "Read a chapter of a fiction book", "Spend 10 minutes in silence",
      "Do a mindfulness exercise", "Take a warm bath or shower", "Write down your feelings",
      "Listen to an uplifting podcast", "Practice progressive muscle relaxation",
      "Write in a gratitude journal", "Spend 20 minutes in nature", "Do a 15-minute meditation", 
      "Disconnect from screens 1 hour before bed", "Do a relaxing hobby for 20 mins",
      "Meditate for 20 minutes", "Do a 20-minute yoga nidra", "Write 3 pages in a journal", 
      "Take a 30-minute walk in nature", "Spend 30 minutes in the sun", "No news for the day", 
      "No social media for the day", "Do 1 hour of a relaxing hobby", "Take a 30-minute nap", 
      "Listen to a whole album", "Read 2 chapters of fiction", "Take a long, hot shower", 
      "Do a skincare routine", "Eat a meal mindfully without screens", "Drink 2 liters of water", 
      "Get 9 hours of sleep", "Write a letter to your future self", "Write a letter to your past self", 
      "List 5 things you are grateful for", "List 5 things you are proud of"
    ],
    WEEKLY: [
      "Therapy or deep reflection", "Spend a day in nature", "Unplug for a weekend",
      "Have a self-care evening", "Do a creative activity for 1 hour", "Go for a long walk without your phone",
      "Cook a nice meal for yourself", "Watch your favorite movie", "Declutter your mind by writing everything down",
      "Spend quality time with loved ones", "Try a new relaxing hobby", "Visit a park or beach",
      "Do a digital detox for 12 hours", "Read a book for pleasure", "Have a spa day at home",
      "Have a tech-free day", "Go for a nature hike", "Have a long bath", 
      "Do a creative project", "Spend a day doing nothing",
      "Go to a therapy session", "Attend a support group", "Spend a whole day offline", 
      "Spend a whole day in nature", "Go camping", "Go to a spa", 
      "Get a massage", "Take a day trip", "Visit a botanical garden", 
      "Visit an art museum", "Do a 2-hour creative project", "Bake something from scratch", 
      "Cook a complex meal", "Read a whole fiction book", "Watch 2 movies", 
      "Have a pajama day", "Sleep in without an alarm", "Do a 1-hour meditation", 
      "Do a 1-hour yoga class", "Write a short story"
    ],
    ROUTINE: []
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

    const pathMissions = path === 'OTHER' 
      ? (state.customMissions || { REGULAR: [], DAILY: [], WEEKLY: [], ROUTINE: [] })
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
              currentMissions.push({
                id: `${Date.now()}-${type}-${Math.random()}`,
                text: shuffled[i],
                completed: false,
                type,
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

  const completeMission = (id: string) => {
    if (!state) return;
    const mission = state.missions.find(m => m.id === id);
    if (!mission || mission.completed) return;

    const isRegular = mission.type === 'REGULAR';
    let leveledUp = false;

    const analyzeMissionPath = (text: string): PathType => {
      const lower = text.toLowerCase();
      if (/(push|pull|run|walk|jog|gym|workout|exercise|squat|lari|jalan|otot|fisik|olahraga|renang|sepeda|angkat|sweat)/.test(lower)) return 'STRONGER';
      if (/(read|book|study|learn|course|tutorial|code|math|baca|buku|belajar|kursus|bahasa|artikel|article)/.test(lower)) return 'PRODUCTIVE';
      if (/(talk|call|meet|friend|family|greet|help|bicara|telepon|teman|keluarga|sapa|bantu|nongkrong|sosial|chat)/.test(lower)) return 'EXTROVERT';
      if (/(meditate|breathe|journal|calm|relax|sleep|nap|yoga|meditasi|nafas|tenang|tidur|jurnal|doa|pray)/.test(lower)) return 'MENTAL_HEALTH';
      return 'DISCIPLINE';
    };

    setState((prev) => {
      if (!prev) return prev;
      
      const missionIndex = prev.missions.findIndex(m => m.id === id);
      if (missionIndex === -1) return prev;
      const m = prev.missions[missionIndex];
      
      if (m.completed) return prev;

      let newMissions = [...prev.missions];
      newMissions[missionIndex] = { ...m, completed: true };

      const xpReward = m.type === 'WEEKLY' ? 200 : m.type === 'DAILY' ? 100 : 50;
      let newXp = prev.xp + xpReward;
      let newLevel = prev.level;
      let newBadges = [...prev.badges];
      let newUnlockedFrames = prev.unlockedFrames ? [...prev.unlockedFrames] : ['frame-default', 'frame-rgb'];
      let newTitles = prev.titles ? [...prev.titles] : ['Newbie'];
      let newPathProgress = { ...prev.pathProgress };

      if (prev.chosenPath === 'OTHER') {
        const relatedPath = analyzeMissionPath(m.text);
        if (relatedPath !== 'OTHER') {
          const currentProgress = newPathProgress[relatedPath] || { 
            level: 1, xp: 0, missions: [], lastMissionDate: '', lastWeeklyDate: '', badges: [], highestRankAchieved: 'Bronze' 
          };
          let pXp = currentProgress.xp + xpReward;
          let pLevel = currentProgress.level;
          if (pXp >= pLevel * 100) {
            pXp = pXp - pLevel * 100;
            pLevel += 1;
          }
          newPathProgress[relatedPath] = {
            ...currentProgress,
            xp: pXp,
            level: pLevel
          };
        }
      }

      if (newXp >= newLevel * 100) {
        newXp = newXp - newLevel * 100;
        newLevel += 1;
        leveledUp = true;
        
        const newRank = getRankForLevel(newLevel);
        const frameName = `frame-${newRank.name.toLowerCase()}`;
        if (!newUnlockedFrames.includes(frameName)) {
          newUnlockedFrames.push(frameName);
        }
      }

      const allMissionsCompleted = newMissions.every(m => m.completed);
      if (allMissionsCompleted && !newBadges.includes('DISCIPLINED')) {
        newBadges.push('DISCIPLINED');
      }

      // Streak logic
      const today = new Date().toDateString();
      const todayISO = new Date().toISOString().split('T')[0];
      let newStreak = prev.streak || 0;
      let shouldShowStreakAnimation = false;
      
      let newDailyStats = prev.dailyStats ? { ...prev.dailyStats } : {};
      newDailyStats[todayISO] = (newDailyStats[todayISO] || 0) + 1;
      
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

      // Titles logic
      const currentHour = new Date().getHours();
      
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
        unlockedFrames: newUnlockedFrames,
        titles: newTitles,
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
              return {
                ...s,
                missions: [...filtered, {
                  id: `${Date.now()}-${Math.random()}`,
                  text: randomText,
                  completed: false,
                  type: 'REGULAR'
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
        const pathMissions = newPath === 'OTHER'
          ? (prev.customMissions || { REGULAR: [], DAILY: [], WEEKLY: [] })
          : PATH_MISSIONS[newPath];
        
        (['REGULAR', 'DAILY', 'WEEKLY'] as MissionType[]).forEach((type) => {
          const availableTexts = pathMissions[type];
          if (availableTexts && availableTexts.length > 0) {
            const randomText = availableTexts[Math.floor(Math.random() * availableTexts.length)];
            newMissions.push({
              id: `${Date.now()}-${type}`,
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
    addCustomMission,
    removeCustomMission,
  };
}
