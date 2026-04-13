import React, { useState, useEffect } from 'react';
import { create } from 'zustand';
import { sounds } from './utils/sounds';
import { NotificationService } from './services/NotificationService';
import { auth, googleProvider, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { getDoc, doc, setDoc } from 'firebase/firestore';

import { MISSION_TRANSLATIONS } from './utils/missionTranslations';

// Helper to remove undefined values for Firestore
export const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  
  const sanitized: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      sanitized[key] = sanitizeForFirestore(obj[key]);
    }
  });
  return sanitized;
};

// ... (keep types and helper functions)

export interface AppStore {
  state: UserState | null;
  activeUserEmail: string | null;
  isAuthReady: boolean;
  login: (email: string, username: string, uid?: string) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateState: (updates: Partial<UserState>) => void;
  generateMissions: (path: PathType) => void;
  checkStreakFreezeNeeded: () => boolean;
  completeMission: (id: string, options?: { useFreeze?: boolean }) => void;
  updateMissionProgress: (id: string, increment: number) => void;
  replaceMission: (id: string) => void;
  changePath: (path: PathType) => void;
  addCustomMission: (type: MissionType, text: string) => void;
  removeCustomMission: (type: MissionType, text: string) => void;
  clearCustomMissions: () => void;
  dismissUnlockedItem: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'read' | 'timestamp'>, options?: { silent?: boolean }) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  incrementShareCount: () => void;
  crushRival: () => void;
  dismissCrushedAnimation: () => void;
  checkBossReset: () => void;
  triggerBoss: () => void;
  attackBoss: (taskId: string) => void;
  defeatBoss: () => void;
  escapeBoss: () => void;
  checkAllTitles: () => void;
  requestNotificationPermission: () => void;
  setAuthReady: (ready: boolean) => void;
  setActiveUserEmail: (email: string | null) => void;
  setState: (state: UserState | null) => void;
  appOpenTime: number;
  init: () => () => void;
}

export const useAppState = create<AppStore>((set, get) => ({
  state: null,
  activeUserEmail: localStorage.getItem('lockin_active_user'),
  isAuthReady: false,

  setAuthReady: (ready) => set({ isAuthReady: ready }),
  setActiveUserEmail: (email) => {
    if (email) localStorage.setItem('lockin_active_user', email);
    else localStorage.removeItem('lockin_active_user');
    set({ activeUserEmail: email });
  },
  appOpenTime: Date.now(),
  setState: (state) => set({ state }),

  init: () => {
    const { setAuthReady, setActiveUserEmail, setState } = get();
    if (!auth) {
      console.warn("Firebase Auth not initialized. Running in local mode.");
      setAuthReady(true);
      return () => {};
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const email = user.email;
        const uid = user.uid;
        const username = user.displayName || email.split('@')[0];

        setActiveUserEmail(email);
        const saved = localStorage.getItem(`lockin_user_${email}`);
        
        if (saved) {
          try {
            let parsed = JSON.parse(saved);
            
            if (!parsed || typeof parsed !== 'object') {
              throw new Error("Invalid state in local storage");
            }

            // Data Reset Logic: Reset everyone except Zaiki if version is old
            if (parsed.dataVersion !== 2 && email !== 'zaikiwildan@gmail.com') {
              parsed = createDefaultState(username, email, uid);
              setState(parsed);
              localStorage.setItem(`lockin_user_${email}`, JSON.stringify(parsed));
              return;
            }

            // Ensure Zaiki has the latest version without resetting
            if (email === 'zaikiwildan@gmail.com' && parsed.dataVersion !== 2) {
              parsed.dataVersion = 2;
              localStorage.setItem(`lockin_user_${email}`, JSON.stringify(parsed));
            }

            // Ensure userId matches Firebase Auth UID for Firestore permissions
            if (uid && parsed.userId !== uid) {
              parsed.userId = uid;
              localStorage.setItem(`lockin_user_${email}`, JSON.stringify(parsed));
            }
            
            // Auto-grant Elite to Zaiki
            if (email === 'zaikiwildan@gmail.com' || username.toLowerCase().includes('zaiki')) {
              parsed.isPremium = true;
              if (!parsed.badges.includes('ELITE_ZONE')) {
                parsed.badges.push('ELITE_ZONE');
              }
            }

            // Migration: ensure pathProgress exists
            if (!parsed.pathProgress) parsed.pathProgress = {};
            if (!parsed.titles) parsed.titles = [];
            if (!parsed.unlockedTitles) parsed.unlockedTitles = [];
            
            // Migration: ensure missionsCompleted is synced with dailyStats if it's 0
            if (!parsed.missionsCompleted && parsed.dailyStats) {
              parsed.missionsCompleted = Object.values(parsed.dailyStats).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
            }

            // Migration: ensure highestRankAchieved is set
            if (!parsed.highestRankAchieved) {
              parsed.highestRankAchieved = getRankForLevel(parsed.level).name;
            }
            
            // Auto-grant OG title to Zaiki
            if (email === 'zaikiwildan@gmail.com' && !parsed.unlockedTitles.includes('OG')) {
              parsed.unlockedTitles.push('OG');
            }

            setState(parsed);
            get().checkAllTitles();
          } catch (e) {
            console.error("Error parsing saved state:", e);
            setState(null);
          }
        } else {
          // Try to fetch from Firestore if local storage is empty
          if (db && uid) {
            try {
              const userDoc = await getDoc(doc(db, 'users', uid));
              if (userDoc.exists()) {
                const firestoreData = userDoc.data() as UserState;
                // Ensure the state shows they are logged in
                setState({
                  ...firestoreData,
                  isLoggedIn: true
                });
                localStorage.setItem(`lockin_user_${email}`, JSON.stringify(firestoreData));
                get().checkAllTitles();
                return;
              }
            } catch (e) {
              console.error("Error fetching user from Firestore:", e);
            }
          }

          const newState = createDefaultState(username, email, uid);
          setState(newState);
          localStorage.setItem(`lockin_user_${email}`, JSON.stringify(newState));
          get().checkAllTitles();
        }
      } else {
        setActiveUserEmail(null);
        setState(null);
      }
      setAuthReady(true);
    });
    return unsubscribe;
  },

  updateState: (updates) => {
    const { state, activeUserEmail } = get();
    if (!state || !activeUserEmail) return;

    // Check for unlocks before applying updates - merge with existing updates if any
    const newUnlockedItems = [...(updates.unlockedItemsQueue || state.unlockedItemsQueue || [])];
    
    // 1. Check for Level Up Unlocks (Frames)
    const newUnlockedFrames = [...(updates.unlockedFrames || state.unlockedFrames || [])];
    const newUnlockedTitles = [...(updates.unlockedTitles || state.unlockedTitles || [])];
    const newBadges = [...(updates.badges || state.badges || [])];

    if (updates.level && updates.level > state.level) {
      for (let lvl = state.level + 1; lvl <= updates.level; lvl++) {
        const rank = RANKS.find(r => r.minLevel === lvl);
        if (rank) {
          const frameId = `frame-${rank.name.toLowerCase()}`;
          if (!newUnlockedFrames.includes(frameId)) {
            newUnlockedFrames.push(frameId);
            newUnlockedItems.push({ type: 'frame', id: frameId });
          }
        }
      }
    }

    // 2. Check for Streak Unlocks
    if (updates.streak && updates.streak > state.streak) {
      const streakUnlocks: Record<number, string> = { 7: 'frame-rgb', 30: 'frame-fire', 60: 'frame-aurora', 100: 'frame-inferno' };
      const frameId = streakUnlocks[updates.streak];
      if (frameId && !newUnlockedFrames.includes(frameId)) {
        newUnlockedFrames.push(frameId);
        newUnlockedItems.push({ type: 'frame', id: frameId });
      }
    }

    // 3. Check for Mission Count Unlocks
    if (updates.missionsCompleted && updates.missionsCompleted > state.missionsCompleted) {
      const missionUnlocks: Record<number, string> = { 50: 'frame-neon', 100: 'frame-hologram', 200: 'frame-radiant', 666: 'frame-abyssal' };
      const frameId = missionUnlocks[updates.missionsCompleted];
      if (frameId && !newUnlockedFrames.includes(frameId)) {
        newUnlockedFrames.push(frameId);
        newUnlockedItems.push({ type: 'frame', id: frameId });
      }
    }

    // 4. Check for Rank Up
    if (updates.level && updates.level > state.level) {
      const oldRank = RANKS.slice().reverse().find(r => state.level >= r.minLevel);
      const newRank = RANKS.slice().reverse().find(r => updates.level >= r.minLevel);
      if (newRank && oldRank && newRank.name !== oldRank.name) {
        newUnlockedItems.push({ type: 'rank', id: newRank.name });
      }
    }

    // 5. Auto-grant Elite to Zaiki if not already set
    const isZaiki = activeUserEmail === 'zaikiwildan@gmail.com' || state.username.toLowerCase().includes('zaiki');
    if (isZaiki) {
      if (!state.isPremium) {
        updates.isPremium = true;
      }
      if (!newBadges.includes('ELITE_ZONE')) {
        newBadges.push('ELITE_ZONE');
        newUnlockedItems.push({ type: 'badge', id: 'ELITE_ZONE' });
      }
    }

    if (newUnlockedFrames.length > (state.unlockedFrames?.length || 0)) {
      updates.unlockedFrames = newUnlockedFrames;
    }
    if (newUnlockedTitles.length > (state.unlockedTitles?.length || 0)) {
      updates.unlockedTitles = newUnlockedTitles;
    }
    if (newBadges.length > (state.badges?.length || 0)) {
      updates.badges = newBadges;
    }

    if (newUnlockedItems.length > (state.unlockedItemsQueue?.length || 0)) {
      updates.unlockedItemsQueue = newUnlockedItems;
    }

    const ovrData = calculateOVR({ ...state, ...updates }, activeUserEmail);
    const newState = { ...state, ...updates, ovr: ovrData.ovr, stats: ovrData.stats };
    set({ state: newState });
    localStorage.setItem(`lockin_user_${activeUserEmail}`, JSON.stringify(newState));

      // Sync to Firestore if available - optimized with debounce/delay
      if (db && newState.userId) {
        const userRef = doc(db, 'users', newState.userId);
        const dataToSync = sanitizeForFirestore({ 
          ...newState, 
          lastUpdated: Date.now() 
        });
        
        // Use a global timeout to debounce Firestore writes
        if ((window as any)._firestoreSyncTimeout) {
          clearTimeout((window as any)._firestoreSyncTimeout);
        }
        
        (window as any)._firestoreSyncTimeout = setTimeout(() => {
          setDoc(userRef, dataToSync, { merge: true }).catch(err => {
            console.error("Error syncing to Firestore:", err);
          });
        }, 1000); // 1 second debounce
      }
    },

  login: async (email, username, uid) => {
    const { setActiveUserEmail, setState } = get();
    setActiveUserEmail(email);
    
    // Check for OG Title logic
    let isOg = false;
    if (db && email !== 'zaikiwildan@gmail.com') {
      try {
        const ogRef = doc(db, 'system', 'og_counter_v2');
        const ogDoc = await getDoc(ogRef);
        let count = 0;
        if (ogDoc.exists()) {
          count = ogDoc.data().count || 0;
        }
        
        if (count < 100) {
          // Check if this user already has it in firestore
          if (uid) {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists() && userDoc.data().unlockedTitles?.includes('OG')) {
              isOg = true;
            } else if (!userDoc.exists() || !userDoc.data().unlockedTitles?.includes('OG')) {
              // Increment and grant
              await setDoc(ogRef, { count: count + 1 }, { merge: true });
              isOg = true;
            }
          }
        }
      } catch (e) {
        console.error("Error checking OG counter:", e);
      }
    }

    const saved = localStorage.getItem(`lockin_user_${email}`);
    if (saved) {
      let parsed = JSON.parse(saved);

      // Data Reset Logic: Reset everyone except Zaiki if version is old
      if (parsed.dataVersion !== 2 && email !== 'zaikiwildan@gmail.com') {
        parsed = createDefaultState(username, email, uid);
        if (isOg && !parsed.unlockedTitles.includes('OG')) {
          parsed.unlockedTitles.push('OG');
          parsed.unlockedItemsQueue.push({ type: 'title', id: 'OG' });
        }
        setState(parsed);
        localStorage.setItem(`lockin_user_${email}`, JSON.stringify(parsed));
        return;
      }

      // Ensure Zaiki has the latest version without resetting
      if (email === 'zaikiwildan@gmail.com' && parsed.dataVersion !== 2) {
        parsed.dataVersion = 2;
        localStorage.setItem(`lockin_user_${email}`, JSON.stringify(parsed));
      }

      // Ensure userId matches Firebase Auth UID for Firestore permissions
      if (uid && parsed.userId !== uid) {
        parsed.userId = uid;
        localStorage.setItem(`lockin_user_${email}`, JSON.stringify(parsed));
      }
      
      // Auto-grant Elite to Zaiki
      if (!parsed.isPremium && (email === 'zaikiwildan@gmail.com' || username.toLowerCase().includes('zaiki'))) {
        parsed.isPremium = true;
      }

      if (isOg && !parsed.unlockedTitles?.includes('OG')) {
        parsed.unlockedTitles = [...(parsed.unlockedTitles || []), 'OG'];
        parsed.unlockedItemsQueue = [...(parsed.unlockedItemsQueue || []), { type: 'title', id: 'OG' }];
      }

      setState(parsed);
    } else {
      // Try to fetch from Firestore if local storage is empty
      if (db) {
        try {
          // If we have a UID, use it. Otherwise, we might need to query by email if we were using a real DB.
          // For now, let's try to find the user by a consistent ID if possible.
          const docId = uid || email.replace(/[.@]/g, '_'); 
          const userDoc = await getDoc(doc(db, 'users', docId));
          
          if (userDoc.exists()) {
            const firestoreData = userDoc.data() as UserState;
            // Ensure the state shows they are logged in and onboarding is done if it was done before
            setState({
              ...firestoreData,
              isLoggedIn: true
            });
            localStorage.setItem(`lockin_user_${email}`, JSON.stringify(firestoreData));
            return;
          }
        } catch (e) {
          console.error("Error fetching user from Firestore:", e);
        }
      }

      const newState = createDefaultState(username, email, uid);
      if (isOg && !newState.unlockedTitles.includes('OG')) {
        newState.unlockedTitles.push('OG');
        newState.unlockedItemsQueue.push({ type: 'title', id: 'OG' });
      }
      setState(newState);
      localStorage.setItem(`lockin_user_${email}`, JSON.stringify(newState));
    }
  },

  loginWithGoogle: async () => {
    const { login } = get();
    if (!auth) {
      console.error("Firebase Auth not initialized.");
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user && result.user.email) {
        const email = result.user.email;
        const uid = result.user.uid;
        
        // Allow automatic sign up with Google
        login(email, result.user.displayName || 'User', uid);
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error("Error signing in with Google:", error);
      throw error;
    }
  },

  logout: async () => {
    const { setActiveUserEmail, setState } = get();
    await signOut(auth);
    setActiveUserEmail(null);
    setState(null);
  },

  generateMissions: (path) => {
    const { state, updateState } = get();
    if (!state) return;

    const missions: Mission[] = [];
    const types: MissionType[] = (['REGULAR', 'DAILY', 'WEEKLY', 'ROUTINE'] as MissionType[]).filter(t => t !== 'ROUTINE' || path === 'OTHER');
    
    types.forEach(type => {
      const typePool = PATH_MISSIONS[path]?.[type] || [];
      const customKey = `${path}_${type}`;
      const customPool = state.customMissions[customKey] || [];
      const pool = [...typePool, ...customPool];
      
      if (pool.length === 0) return;

      const count = type === 'ROUTINE' ? pool.length : 3;
      
      // Calculate weights for each mission in the pool
      const weightedPool = pool.map(text => {
        const category = analyzeMissionPath(text);
        const weight = state.missionAffinity?.[category] || 1.0;
        return { text, weight };
      });

      // Weighted random selection
      const selected: string[] = [];
      const tempPool = [...weightedPool];
      
      for (let i = 0; i < count && tempPool.length > 0; i++) {
        const totalWeight = tempPool.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let j = 0; j < tempPool.length; j++) {
          random -= tempPool[j].weight;
          if (random <= 0) {
            selected.push(tempPool[j].text);
            tempPool.splice(j, 1);
            break;
          }
        }
      }

      selected.forEach(text => {
        // Don't scale custom missions - they are already specific to the user
        const isCustom = customPool.includes(text);
        const completionCount = state.missionCompletionCounts?.[text] || 0;
        const scaledText = isCustom ? text : scaleMissionText(text, state.level, completionCount);
        const goal = extractGoal(scaledText);
        missions.push({
          id: Math.random().toString(36).substring(2, 9),
          text: translateMissionText(scaledText, state.language),
          originalText: text,
          completed: false,
          type,
          hasTimer: extractDuration(text) !== null,
          goal: goal,
          progress: goal ? 0 : undefined
        });
      });
    });

    updateState({
      missions,
      lastMissionDate: new Date().toISOString().split('T')[0],
      lastWeeklyDate: new Date().toISOString().split('T')[0],
      chosenPath: path
    });
  },

  checkStreakFreezeNeeded: () => {
    const { state, updateState } = get();
    if (!state || !state.lastActiveDate) return false;

    const today = getTodayISO();
    const lastDate = state.lastActiveDate;
    
    const last = new Date(lastDate);
    const curr = new Date(today);
    const diffTime = Math.abs(curr.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1 && state.streakFreezes > 0 && !state.streakFreezeUsedToday) {
      updateState({
        streakFreezes: state.streakFreezes - 1,
        streakFreezeUsedToday: true,
        lastActiveDate: today
      });
      return true;
    }
    return false;
  },

  completeMission: (id, options) => {
    const { state, updateState, addNotification, attackBoss } = get();
    if (!state) return;

    let mission = state.missions.find(m => m.id === id);
    let isBossTask = false;

    if (!mission && state.bossState?.tasks) {
      mission = state.bossState.tasks.find(m => m.id === id);
      isBossTask = true;
    }

    if (!mission || mission.completed) return;

    // Play sound immediately for better responsiveness
    const isLevelingUp = (state.xp + (mission.type === 'WEEKLY' ? 200 : (mission.type === 'DAILY' ? 100 : 50))) >= (state.level * 100);
    if (isLevelingUp || mission.type === 'WEEKLY') {
      sounds.playLevelUp();
    } else {
      sounds.playMissionComplete();
    }

    // Burst Limit Check
    const now = Date.now();
    let integrityPenalty = 0;
    let isPenaltyTriggered = false;

    if (state.burstLockUntil && now < state.burstLockUntil) {
      return;
    }

    let newMissions = state.missions.map(m => 
      m.id === id ? { ...m, completed: true } : m
    );

    // Auto-replace regular missions immediately so there's always a fresh stream
    if (mission.type === 'REGULAR') {
      const path = state.chosenPath || 'PRODUCTIVE';
      const typePool = PATH_MISSIONS[path]?.['REGULAR'] || [];
      const customKey = `${path}_REGULAR`;
      const customPool = state.customMissions[customKey] || [];
      const pool = [...typePool, ...customPool];
      const currentMissions = state.missions.map(m => m.originalText);
      const filteredPool = pool.filter(t => !currentMissions.includes(t));
      
      // Ensure we have 3 regular missions at all times
      const otherRegularMissions = newMissions.filter(m => m.type === 'REGULAR' && m.id !== id && !m.completed);
      const needed = 3 - otherRegularMissions.length;
      
      if (needed > 0 && filteredPool.length > 0) {
        const selectedTexts: string[] = [];
        const tempPool = [...filteredPool];
        for (let i = 0; i < needed && tempPool.length > 0; i++) {
          const idx = Math.floor(Math.random() * tempPool.length);
          selectedTexts.push(tempPool[idx]);
          tempPool.splice(idx, 1);
        }
        
        const newMissionsToAdd = selectedTexts.map(text => {
          const isCustom = customPool.includes(text);
          const scaledText = isCustom ? text : scaleMissionText(text, state.level);
          const goal = extractGoal(scaledText);
          return {
            id: Math.random().toString(36).substring(2, 9),
            text: translateMissionText(scaledText, state.language),
            originalText: text,
            completed: false,
            type: 'REGULAR' as const,
            hasTimer: extractDuration(text) !== null,
            goal: goal,
            progress: goal ? 0 : undefined
          };
        });
        
        // Remove the completed one and add the new ones
        newMissions = [
          ...newMissions.filter(m => m.id !== id),
          ...newMissionsToAdd
        ];
      }
    }

    let xpGain = mission.type === 'WEEKLY' ? 200 : (mission.type === 'DAILY' ? 100 : 50);
    let coinGain = mission.type === 'WEEKLY' ? 100 : (mission.type === 'DAILY' ? 50 : 20);

    // Elite Bonus (50% XP)
    if (state.isPremium) {
      xpGain = Math.floor(xpGain * 1.5);
    }

    // The 2-Second Rule
    const appOpenTime = get().appOpenTime;
    if (now - appOpenTime < 2000) {
      xpGain = 1; // Minimal XP
      coinGain = 1; // Minimal Coins
      integrityPenalty += 10;
      isPenaltyTriggered = true;
      
      addNotification({
        title: JSON.stringify({ key: 'integrity.explanation.title' }),
        description: JSON.stringify({ key: 'integrity.explanation.desc' }),
        icon: 'AlertCircle'
      }, { silent: true });
    }

    if (state.doubleXpActiveUntil && new Date(state.doubleXpActiveUntil) > new Date()) {
      xpGain *= 2;
    }
    if (state.doubleCoinActiveUntil && new Date(state.doubleCoinActiveUntil) > new Date()) {
      coinGain *= 2;
    }

    const newXp = state.xp + xpGain;
    const newTotalXp = state.totalXp + xpGain;
    const newCoins = state.zoneCoins + coinGain;
    const newMissionsCompleted = state.missionsCompleted + 1;

    let newLevel = state.level;
    let currentXp = newXp;
    let animatingLevelUp = false;
    let previousLevel = state.level;

    // Multi-level up logic
    while (newLevel < 50 && currentXp >= newLevel * 100) {
      currentXp -= newLevel * 100;
      newLevel += 1;
      animatingLevelUp = true;
    }

    const currentRank = getRankForLevel(newLevel);
    const highestRank = getRankForLevel(state.level); // Previous highest rank
    const newHighestRankAchieved = (RANKS.findIndex(r => r.name === currentRank.name) > RANKS.findIndex(r => r.name === state.highestRankAchieved))
      ? currentRank.name
      : state.highestRankAchieved;

    const today = getTodayISO();
    let newStreak = state.streak;
    if (state.lastActiveDate !== today) {
      newStreak += 1;
    }

    // Abnormal Activity Detection
    const oneMinuteAgo = now - 60000;
    const recentCompletions = (state.recentCompletions || []).filter(t => t > oneMinuteAgo);
    recentCompletions.push(now);
    
    let burstLockUntil = state.burstLockUntil || 0;
    if (recentCompletions.length === 5) {
      burstLockUntil = now + 10000; // 10 seconds lock
      integrityPenalty += 15; // Increased from 10
      isPenaltyTriggered = true;
      
      addNotification({
        title: JSON.stringify({ key: 'home.overheat.title' }),
        description: JSON.stringify({ key: `home.overheat.motivation.${Math.floor(Math.random() * 5) + 1}` }),
        icon: 'Zap'
      }, { silent: true });
    }

    if (recentCompletions.length > 5) {
      burstLockUntil = now + 15000; // Longer lock for repeated spam
      integrityPenalty += 10; // Increased from 5
      isPenaltyTriggered = true;
    }

    if (recentCompletions.length >= 7) {
      const msg = state.language === 'id' 
        ? "Aktivitas Abnormal Terdeteksi. Pertumbuhan OVR-mu terlihat buatan."
        : "Abnormal Activity Detected. Your OVR growth looks artificial.";

      addNotification({
        title: JSON.stringify({ key: 'integrity.explanation.title' }),
        description: JSON.stringify({ key: 'integrity.explanation.desc' }),
        icon: 'AlertCircle'
      }, { silent: true });

      // Browser notification
      if (typeof window !== 'undefined' && "Notification" in window && (Notification as any).permission === "granted") {
        try {
          new Notification("Lock In", { body: msg });
        } catch (e) {
          console.warn('External notification failed:', e);
        }
      } else if (typeof window !== 'undefined' && "Notification" in window && (Notification as any).permission !== "denied") {
        try {
          const promise = Notification.requestPermission();
          if (promise && typeof promise.then === 'function') {
            promise.then(permission => {
              if (permission === "granted") {
                new Notification("Lock In", { body: msg });
              }
            }).catch(() => {});
          } else {
            // Fallback for older browsers that use callback
            Notification.requestPermission((permission) => {
              if (permission === "granted") {
                new Notification("Lock In", { body: msg });
              }
            });
          }
        } catch (e) {
          console.warn('Notification permission request failed:', e);
        }
      }
    }

    // Update daily stats for charts
    const newDailyStats = { ...state.dailyStats };
    newDailyStats[today] = (newDailyStats[today] || 0) + 1;

    const category = analyzeMissionPath(mission.originalText || mission.text);
    
    // Immutable update for dailyCategoryStats
    const newDailyCategoryStats = { ...state.dailyCategoryStats };
    newDailyCategoryStats[today] = {
      ...(newDailyCategoryStats[today] || {}),
      [category]: ((newDailyCategoryStats[today]?.[category]) || 0) + 1
    };

    const newBadges = [...state.badges];
    const newUnlockedItems = [...state.unlockedItemsQueue];
    
    const checkBadge = (badgeId: string, condition: boolean) => {
      if (condition && !newBadges.includes(badgeId)) {
        newBadges.push(badgeId);
        newUnlockedItems.push({ type: 'badge', id: badgeId });
      }
    };

    checkBadge('FIRST_STEP', newMissionsCompleted === 1);
    checkBadge('DOUBLE_TROUBLE', newDailyStats[today] >= 2);
    checkBadge('TRIPLE_THREAT', newDailyStats[today] >= 3);
    checkBadge('DEDICATED', newMissionsCompleted >= 5);
    checkBadge('TENACIOUS', newMissionsCompleted >= 10);
    
    const nowDate = new Date();
    const hour = nowDate.getHours();
    checkBadge('AFTERNOON_HUSTLE', hour >= 12 && hour < 17);
    checkBadge('NIGHT_OWL', hour >= 22 || hour < 4);
    checkBadge('EARLY_BIRD', hour >= 4 && hour < 7);
    
    const day = nowDate.getDay();
    checkBadge('WEEKEND_WARRIOR', day === 0 || day === 6);
    
    checkBadge('STREAK_3', newStreak >= 3);
    checkBadge('STREAK_7', newStreak >= 7);
    checkBadge('STREAK_30', newStreak >= 30);
    
    checkBadge('LEVEL_10', newLevel >= 10);
    checkBadge('LEVEL_25', newLevel >= 25);
    checkBadge('LEVEL_50', newLevel >= 50);
    checkBadge('ELITE_ZONE', state.isPremium);
    
    const allWeeklyCompleted = newMissions.filter(m => m.type === 'WEEKLY').length > 0 && 
                               newMissions.filter(m => m.type === 'WEEKLY').every(m => m.completed);
    
    if (allWeeklyCompleted || (isBossTask && state.bossState?.tasks?.every((t: Mission) => t.completed || t.id === id))) {
      checkBadge('DISCIPLINED', true);
    }

    // Title Acquisition Logic
    const newUnlockedTitles = [...(state.unlockedTitles || [])];
    const checkTitle = (titleId: string, condition: boolean) => {
      if (condition && !newUnlockedTitles.includes(titleId)) {
        newUnlockedTitles.push(titleId);
        newUnlockedItems.push({ type: 'title', id: titleId });
      }
    };

    checkTitle('The Early Bird', hour >= 4 && hour < 7);
    checkTitle('Night Owl', hour >= 21 || hour < 4); // Start at 9 PM instead of 10 PM
    checkTitle('Unstoppable', newStreak >= 5);
    checkTitle('Legend', newStreak >= 30);
    checkTitle('Veteran', newLevel >= 10);
    checkTitle('Master', newLevel >= 50);
    checkTitle('Elite Zone', state.isPremium);
    if (state.shareCount >= 5) checkTitle('Supporter', true);
    if (state.beatenRivals && state.beatenRivals.length > 0) checkTitle('Rival Crusher', true);

    // Update mission affinity (increase weight for completed category)
    const newMissionAffinity = { ...state.missionAffinity };
    const currentAffinity = newMissionAffinity[category] || 1.0;
    newMissionAffinity[category] = Math.min(5.0, currentAffinity + 0.1); // Max weight 5.0

    // Update specific mission completion counts for dynamic difficulty
    const newMissionCompletionCounts = { ...(state.missionCompletionCounts || {}) };
    if (mission.originalText) {
      newMissionCompletionCounts[mission.originalText] = (newMissionCompletionCounts[mission.originalText] || 0) + 1;
    }

    // Integrity Score Logic (Calculated at the end to catch all penalties)
    let newIntegrityScore = Math.max(0, state.integrityScore - integrityPenalty);
    let newConsecutiveCleanMissions = isPenaltyTriggered ? 0 : state.consecutiveCleanMissions + 1;
    
    // Recovery: 3 clean missions = +5 integrity
    if (newConsecutiveCleanMissions >= 3) {
      newIntegrityScore = Math.min(100, newIntegrityScore + 5);
      newConsecutiveCleanMissions = 0;
    }

    updateState({
      missions: newMissions,
      xp: currentXp,
      totalXp: newTotalXp,
      level: newLevel,
      animatingLevelUp,
      previousLevel,
      streak: newStreak,
      lastActiveDate: today,
      recentCompletions,
      burstLockUntil,
      integrityScore: newIntegrityScore,
      consecutiveCleanMissions: newConsecutiveCleanMissions,
      dailyStats: newDailyStats,
      dailyCategoryStats: newDailyCategoryStats,
      missionsCompleted: newMissionsCompleted,
      highestRankAchieved: newHighestRankAchieved,
      zoneCoins: newCoins,
      badges: newBadges,
      unlockedTitles: newUnlockedTitles,
      unlockedItemsQueue: newUnlockedItems,
      missionAffinity: newMissionAffinity,
      missionCompletionCounts: newMissionCompletionCounts,
      showStreakAnimation: newStreak > state.streak
    });

    if (isBossTask) {
      get().attackBoss(id);
    }
  },

  replaceMission: (id) => {
    const { state, updateState, addNotification } = get();
    if (!state) return;

    let mission = state.missions.find(m => m.id === id);
    let isBossTask = false;

    if (!mission && state.bossState?.tasks) {
      mission = state.bossState.tasks.find(m => m.id === id);
      isBossTask = true;
    }

    if (!mission || mission.completed) return;

    const missionType = mission.type;
    const path = state.chosenPath || 'PRODUCTIVE';
    const typePool = PATH_MISSIONS[path]?.[missionType] || [];
    const customKey = `${path}_${missionType}`;
    const customPool = state.customMissions[customKey] || [];
    const pool = [...typePool, ...customPool];
    
    // Filter out missions already present in current missions or boss tasks
    const currentMissions = [
      ...state.missions.map(m => m.originalText),
      ...(state.bossState?.tasks?.map(m => m.originalText) || [])
    ];
    let filteredPool = pool.filter(t => !currentMissions.includes(t));
    
    // If filtered pool is empty but pool has items, just pick any from pool except the current one
    if (filteredPool.length === 0 && pool.length > 1) {
      filteredPool = pool.filter(t => t !== mission.originalText);
    }

    if (filteredPool.length === 0) {
      addNotification({
        title: state.language === 'id' ? "Tidak Ada Misi" : "No Missions Available",
        description: state.language === 'id' 
          ? "Tidak ada misi lain yang tersedia untuk diganti." 
          : "No other missions available to replace with.",
        icon: 'Info'
      });
      return;
    }
    
    const newText = filteredPool[Math.floor(Math.random() * filteredPool.length)];
    const isCustom = customPool.includes(newText);
    const completionCount = state.missionCompletionCounts?.[newText] || 0;
    const scaledText = isCustom ? newText : scaleMissionText(newText, state.level, completionCount);
    const translatedText = translateMissionText(scaledText, state.language);
    const goal = extractGoal(scaledText);

    if (isBossTask) {
      const newBossTasks = state.bossState!.tasks!.map(m => 
        m.id === id ? {
          ...m,
          id: Math.random().toString(36).substring(2, 9),
          text: translatedText,
          originalText: newText,
          hasTimer: extractDuration(newText) !== null,
          goal: goal,
          progress: goal ? 0 : undefined
        } : m
      );
      updateState({
        bossState: {
          ...state.bossState!,
          tasks: newBossTasks
        }
      });
    } else {
      const newMissions = state.missions.map(m => 
        m.id === id ? {
          ...m,
          id: Math.random().toString(36).substring(2, 9),
          text: translatedText,
          originalText: newText,
          hasTimer: extractDuration(newText) !== null,
          goal: goal,
          progress: goal ? 0 : undefined
        } : m
      );

      // Update mission affinity (decrease weight for skipped category)
      const category = analyzeMissionPath(mission.originalText || mission.text);
      const currentAffinity = state.missionAffinity?.[category] || 1.0;
      const newAffinity = Math.max(0.1, currentAffinity - 0.2); // Min weight 0.1

      updateState({
        missions: newMissions,
        missionAffinity: {
          ...state.missionAffinity,
          [category]: newAffinity
        }
      });
    }
  },

  updateMissionProgress: (id, increment) => {
    const { state, updateState, completeMission } = get();
    if (!state) return;

    let mission = state.missions.find(m => m.id === id);
    let isBossTask = false;

    if (!mission && state.bossState?.tasks) {
      mission = state.bossState.tasks.find(m => m.id === id);
      isBossTask = true;
    }

    if (!mission || mission.completed || mission.goal === undefined) return;

    const currentProgress = mission.progress || 0;
    const newProgress = Math.min(mission.goal, currentProgress + increment);
    
    // Prevent redundant updates if progress hasn't changed
    if (newProgress === currentProgress) return;

    if (isBossTask) {
      const newBossTasks = state.bossState!.tasks!.map(m => 
        m.id === id ? { ...m, progress: newProgress } : m
      );
      updateState({
        bossState: {
          ...state.bossState!,
          tasks: newBossTasks
        }
      });
    } else {
      const newMissions = state.missions.map(m => 
        m.id === id ? { ...m, progress: newProgress } : m
      );
      updateState({ missions: newMissions });
    }

    if (newProgress >= mission.goal) {
      // Don't auto-complete, user must hold button
      sounds.playTing();
    } else {
      sounds.playTing();
    }
  },

  changePath: (path) => {
    const { state, updateState, generateMissions } = get();
    if (!state) return;

    if (state.chosenPath) {
      const currentProgress: PathProgress = {
        missions: state.missions,
        lastMissionDate: state.lastMissionDate,
        lastWeeklyDate: state.lastWeeklyDate,
      };
      
      const newPathProgress = { ...state.pathProgress, [state.chosenPath]: currentProgress };
      const savedProgress = state.pathProgress[path];

      if (savedProgress) {
        updateState({
          chosenPath: path,
          missions: savedProgress.missions,
          lastMissionDate: savedProgress.lastMissionDate,
          lastWeeklyDate: savedProgress.lastWeeklyDate,
          pathProgress: newPathProgress
        });
      } else {
        updateState({
          chosenPath: path,
          pathProgress: newPathProgress
        });
        generateMissions(path);
      }
    } else {
      updateState({ chosenPath: path });
      generateMissions(path);
    }
  },

  addCustomMission: (type, text) => {
    const { state, updateState } = get();
    if (!state) return;
    if (type === 'ROUTINE' && state.chosenPath !== 'OTHER') return;
    
    const path = state.chosenPath || 'DISCIPLINE';
    const key = `${path}_${type}`;
    const current = state.customMissions[key] || [];
    const newCustomMissions = {
      ...state.customMissions,
      [key]: [...current, text]
    };

    const goal = extractGoal(text);
    const newMission = {
      id: Math.random().toString(36).substring(2, 9),
      text: translateMissionText(text, state.language),
      originalText: text,
      completed: false,
      type,
      hasTimer: extractDuration(text) !== null,
      goal: goal,
      progress: goal ? 0 : undefined
    };

    let newMissions = [...state.missions];
    if (type === 'ROUTINE') {
      newMissions.push(newMission);
    } else {
      const missionsOfType = newMissions.filter(m => m.type === type);
      if (missionsOfType.length < 3) {
        newMissions.push(newMission);
      } else {
        // Replace the oldest completed mission of this type first
        let indexToReplace = newMissions.findIndex(m => m.type === type && m.completed);
        // If no completed ones, replace the oldest one of this type
        if (indexToReplace === -1) {
          indexToReplace = newMissions.findIndex(m => m.type === type);
        }
        
        if (indexToReplace !== -1) {
          newMissions[indexToReplace] = newMission;
        }
      }
    }

    updateState({
      customMissions: newCustomMissions,
      missions: newMissions
    });
  },

  removeCustomMission: (type, text) => {
    const { state, updateState } = get();
    if (!state) return;
    const path = state.chosenPath || 'DISCIPLINE';
    const key = `${path}_${type}`;
    const current = state.customMissions[key] || [];
    const newCustomMissions = {
      ...state.customMissions,
      [key]: current.filter(t => t !== text)
    };

    const newMissions = state.missions.filter(m => !(m.originalText === text && m.type === type && !m.completed));

    updateState({
      customMissions: newCustomMissions,
      missions: newMissions
    });
  },

  clearCustomMissions: () => {
    const { state, updateState } = get();
    if (!state) return;
    updateState({ customMissions: {} });
  },

  dismissUnlockedItem: () => {
    const { state, updateState } = get();
    if (!state) return;
    updateState({
      unlockedItemsQueue: state.unlockedItemsQueue.slice(1)
    });
  },

  addNotification: (notif, options) => {
    const { state, updateState } = get();
    if (!state) return;
    
    // Check for uniqueId to prevent duplicates
    if (notif.uniqueId && state.shownNotifications?.includes(notif.uniqueId)) {
      return;
    }

    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substring(2, 9),
      read: false,
      timestamp: Date.now()
    };

    const newShownNotifications = notif.uniqueId 
      ? [...(state.shownNotifications || []), notif.uniqueId]
      : (state.shownNotifications || []);

    updateState({
      notifications: [newNotif, ...state.notifications].slice(0, 50),
      shownNotifications: newShownNotifications
    });

    // Play notification sound if not silent
    if (!options?.silent) {
      sounds.playNotification();
    }

    // Send native notification if enabled
    if (state.notificationsEnabled) {
      NotificationService.sendNotification(notif.title, notif.description);
    }
  },

  markNotificationRead: (id) => {
    const { state, updateState } = get();
    if (!state) return;
    updateState({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    });
  },

  markAllNotificationsRead: () => {
    const { state, updateState } = get();
    if (!state) return;
    updateState({
      notifications: state.notifications.map(n => ({ ...n, read: true }))
    });
  },

  incrementShareCount: () => {
    const { state, updateState } = get();
    if (!state) return;
    updateState({ shareCount: state.shareCount + 1 });
  },

  checkBossReset: () => {
    const { state, updateState } = get();
    if (!state || !state.bossState) return;
    
    const today = new Date();
    const isMonday = today.getDay() === 1;
    
    // If it's not Monday and boss is active, reset it to idle
    if (!isMonday && state.bossState.status === 'active') {
      updateState({
        bossState: {
          ...state.bossState,
          status: 'idle',
          isActive: false,
          tasks: []
        }
      });
    }
  },
  
  triggerBoss: () => {
    const { state, updateState } = get();
    if (!state) return;
    
    const todayISO = getTodayISO();
    
    // Generate tasks for the boss
    const pool = PATH_MISSIONS[state.chosenPath || 'DISCIPLINE']?.WEEKLY || PATH_MISSIONS.DISCIPLINE.WEEKLY;
    const selected = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);
    
    const bossTasks = selected.map((text, i) => {
      const completionCount = state.missionCompletionCounts?.[text] || 0;
      const scaledText = scaleMissionText(text, state.level, completionCount);
      const goal = extractGoal(scaledText);
      return {
        id: `boss-task-${Date.now()}-${i}`,
        text: translateMissionText(scaledText, state.language),
        originalText: text,
        completed: false,
        type: 'WEEKLY' as MissionType,
        path: state.chosenPath || 'DISCIPLINE',
        goal: goal,
        progress: goal ? 0 : undefined
      };
    });
    
    // Weekly color logic
    const colors = ['#F43F5E', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6'];
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const bossColor = colors[weekNumber % colors.length];
    
    updateState({
      bossState: {
        status: 'active',
        topic: state.chosenPath || 'DISCIPLINE',
        isActive: true,
        lastEncounterDate: todayISO,
        hp: 100,
        maxHp: 100,
        tasks: bossTasks,
        color: bossColor
      }
    });
  },

  attackBoss: (taskId: string) => {
    const { state, updateState, defeatBoss } = get();
    if (!state || !state.bossState || !state.bossState.tasks) return;
    
    const task = state.bossState.tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;
    
    const updatedTasks = state.bossState.tasks.map(t => 
      t.id === taskId ? { ...t, completed: true } : t
    );
    
    const damage = 34; // 3 tasks = 102 damage
    const newHp = Math.max(0, (state.bossState.hp || 100) - damage);
    
    updateState({
      bossState: {
        ...state.bossState,
        tasks: updatedTasks,
        hp: newHp,
        status: newHp <= 0 ? 'defeated' : 'active'
      }
    });
    
    if (newHp <= 0) {
      defeatBoss();
    }
  },

  defeatBoss: () => {
    const { state, updateState, addNotification } = get();
    if (!state) return;
    
    // Decreased rewards as requested
    const rewardXp = 1500;
    const rewardCoins = 600;
    
    addNotification({
      title: state.language === 'id' ? 'BOSS DIKALAHKAN!' : 'BOSS DEFEATED!',
      description: state.language === 'id' 
        ? `Kamu mendapatkan ${rewardXp} XP dan ${rewardCoins} ZoneCoins!` 
        : `You earned ${rewardXp} XP and ${rewardCoins} ZoneCoins!`,
      icon: 'Swords'
    });
    
    const newTotalXp = state.totalXp + rewardXp;
    const newCoins = state.zoneCoins + rewardCoins;
    
    let newLevel = state.level;
    let newXp = state.xp + rewardXp;
    let animatingLevelUp = false;
    let previousLevel = state.level;

    // Multi-level up logic
    while (newLevel < 50 && newXp >= newLevel * 100) {
      newXp -= newLevel * 100;
      newLevel += 1;
      animatingLevelUp = true;
    }

    if (animatingLevelUp) {
      sounds.playLevelUp();
    } else {
      sounds.playVictory();
    }
    
    updateState({
      xp: newXp,
      totalXp: newTotalXp,
      level: newLevel,
      animatingLevelUp,
      previousLevel,
      zoneCoins: newCoins,
      bossState: {
        ...state.bossState!,
        status: 'defeated',
        isActive: false
      }
    });
  },

  escapeBoss: () => {
    const { state, updateState, addNotification } = get();
    if (!state || !state.bossState || state.bossState.status !== 'active') return;
    
    const penaltyXp = 500;
    const penaltyCoins = 100;
    
    addNotification({
      title: state.language === 'id' ? 'BOSS KABUR!' : 'BOSS ESCAPED!',
      description: state.language === 'id' 
        ? `Boss melarikan diri dan mencuri ${penaltyXp} XP & ${penaltyCoins} ZoneCoins!` 
        : `The boss escaped and stole ${penaltyXp} XP & ${penaltyCoins} ZoneCoins!`,
      icon: 'Skull'
    });
    
    updateState({
      xp: Math.max(0, state.xp - penaltyXp),
      totalXp: Math.max(0, state.totalXp - penaltyXp),
      zoneCoins: Math.max(0, state.zoneCoins - penaltyCoins),
      bossState: {
        ...state.bossState,
        status: 'escaped',
        isActive: false
      }
    });

    // External Notification
    if (typeof window !== 'undefined' && 'Notification' in window && (Notification as any).permission === 'granted') {
      try {
        new Notification(state.language === 'id' ? 'BOSS KABUR!' : 'BOSS ESCAPED!', {
          body: state.language === 'id' 
            ? `Boss melarikan diri dan mencuri ${penaltyXp} XP & ${penaltyCoins} ZoneCoins!` 
            : `The boss escaped and stole ${penaltyXp} XP & ${penaltyCoins} ZoneCoins!`,
          icon: '/favicon.ico'
        });
      } catch (e) {
        console.warn('External notification failed:', e);
      }
    }
  },

  checkAllTitles: () => {
    const { state, updateState } = get();
    if (!state) return;

    const newUnlockedTitles = [...(state.unlockedTitles || [])];
    const newUnlockedItems = [...(state.unlockedItemsQueue || [])];
    const now = new Date();
    const hour = now.getHours();

    const checkTitle = (titleId: string, condition: boolean) => {
      if (condition && !newUnlockedTitles.includes(titleId)) {
        newUnlockedTitles.push(titleId);
        newUnlockedItems.push({ type: 'title', id: titleId });
      }
    };

    checkTitle('The Early Bird', hour >= 4 && hour < 7);
    checkTitle('Night Owl', hour >= 21 || hour < 4); // Start at 9 PM instead of 10 PM
    checkTitle('Unstoppable', state.streak >= 5);
    checkTitle('Legend', state.streak >= 30);
    checkTitle('Veteran', state.level >= 10);
    checkTitle('Master', state.level >= 50);
    checkTitle('Elite Zone', state.isPremium);
    if (state.shareCount >= 5) checkTitle('Supporter', true);
    if (state.beatenRivals && state.beatenRivals.length > 0) checkTitle('Rival Crusher', true);

    if (newUnlockedTitles.length !== (state.unlockedTitles || []).length) {
      updateState({
        unlockedTitles: newUnlockedTitles,
        titles: newUnlockedTitles,
        unlockedItemsQueue: newUnlockedItems
      });
    }
  },

  requestNotificationPermission: () => {
    if (typeof window !== 'undefined' && 'Notification' in window && (Notification as any).permission === 'default') {
      try {
        Notification.requestPermission();
      } catch (e) {
        console.warn('Notification permission request failed:', e);
      }
    }
  },

  crushRival: () => {
    const { state, updateState } = get();
    if (!state || !state.rivalId) return;
    
    // We keep the rivalData for the animation, but clear the rivalId
    updateState({
      beatenRivals: [...state.beatenRivals, state.rivalId],
      rivalId: null,
      zoneCoins: state.zoneCoins + 500,
      showCrushedAnimation: true,
      // rivalData is already set by the App.tsx effect before calling this
    });
  },
  dismissCrushedAnimation: () => {
    const { updateState } = get();
    updateState({ 
      showCrushedAnimation: false,
      rivalData: null 
    });
  }
}));

export type PathType = 'PRODUCTIVE' | 'STRONGER' | 'SOCIAL' | 'DISCIPLINE' | 'MENTAL_HEALTH' | 'OTHER';
export type MissionType = 'REGULAR' | 'DAILY' | 'WEEKLY' | 'ROUTINE';

export interface Mission {
  id: string;
  text: string;
  originalText?: string; // The base English text from PATH_MISSIONS
  completed: boolean;
  type: MissionType;
  hasTimer?: boolean;
  progress?: number;
  goal?: number;
}

export function getTodayISO(): string {
  // Use local date to avoid UTC midnight issues
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function extractDuration(text: string): number | null {
  // Use word boundaries and allow hyphens/spaces to avoid false positives
  // Hours: hours, hour, jam, jm
  const hoursMatch = text.match(/(\d+(?:[.,]\d+)?)[\s-]*(hours?|jam|jm)\b/i);
  if (hoursMatch) return parseFloat(hoursMatch[1].replace(',', '.')) * 3600;

  // Minutes: minutes, minute, mins, min, menit, mnt
  const minutesMatch = text.match(/(\d+(?:[.,]\d+)?)[\s-]*(minutes?|minute|mins?|min|menit|mnt)\b/i);
  if (minutesMatch) return parseFloat(minutesMatch[1].replace(',', '.')) * 60;

  // Seconds: seconds, second, secs, sec, detik, dtk, dkt
  const secondsMatch = text.match(/(\d+(?:[.,]\d+)?)[\s-]*(seconds?|second|secs?|sec|detik|dtk|dkt)\b/i);
  if (secondsMatch) return parseFloat(secondsMatch[1].replace(',', '.'));

  return null;
}

export function extractGoal(text: string): number | undefined {
  // If it has a timer, we don't use a progress bar
  if (extractDuration(text)) return undefined;

  // Look for numbers in the text
  const match = text.match(/(\d+(?:[.,]\d+)?)/);
  if (match) {
    const val = parseFloat(match[1].replace(',', '.'));
    // Only treat as goal if > 1 to avoid "1 book" being a progress mission
    // But the user wants ALL non-timer missions to have a bar, so we return val if > 0
    if (val > 0) return val;
  }
  
  // No number found, return undefined so no progress bar is shown
  return undefined;
}

export function translateMissionText(text: string, lang: 'en' | 'id'): string {
  if (lang === 'en') return text;
  return MISSION_TRANSLATIONS[text] || text;
}

export function scaleMissionText(text: string, level: number, completionCount: number = 0): string {
  // Global scaling factor: increases slightly every 10 levels
  const baseFactor = 1 + Math.floor((level - 1) / 10) * 0.2;
  
  // Specific scaling factor: increases significantly every 5 completions of this specific mission
  const completionFactor = Math.floor(completionCount / 5) * 0.5;
  
  const totalFactor = baseFactor + completionFactor;
  
  return text.replace(/(\d+(?:[.,]\d+)?)/g, (match) => {
    const val = parseFloat(match.replace(',', '.'));
    
    // Don't scale if it's clearly a small count or a single item
    if (val <= 1) return match;
    
    // Don't scale if it looks like a year or a very large number already
    if (val > 1000) return match;

    const scaled = Math.round(val * totalFactor);
    return scaled.toString();
  });
}

export interface PathProgress {
  missions: Mission[];
  lastMissionDate: string;
  lastWeeklyDate: string;
}

export interface UnlockedItem {
  type: 'badge' | 'frame' | 'title' | 'rank';
  id: string;
}

export interface AppNotification {
  id: string;
  uniqueId?: string;
  title: string;
  description: string;
  icon: string;
  read: boolean;
  timestamp: number;
}

export interface BossState {
  status: 'idle' | 'pending_choice' | 'active' | 'defeated' | 'escaped';
  topic: string | null;
  isActive: boolean;
  lastEncounterDate: string | null;
  hp?: number;
  maxHp?: number;
  tasks?: Mission[];
  color?: string;
}

export interface UserState {
  dataVersion?: number;
  userId: string;
  username: string;
  profilePicture: string | null;
  isLoggedIn: boolean;
  onboardingCompleted: boolean;
  chosenPath: PathType | null;
  xp: number;
  totalXp: number;
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
  unlockedTitles: string[];
  equippedTitle: string | null;
  hasPromptedPfp: boolean;
  customMissions: Record<string, string[]>; // Key is path_type (e.g., PRODUCTIVE_REGULAR)
  unlockedItemsQueue: UnlockedItem[];
  shareCount: number;
  isProfilePublic: boolean;
  missionsCompleted: number;
  manifestoAccepted?: boolean;
  notifications: AppNotification[];
  streakFreezes: number;
  lastStreakFreezeGiven: string | null;
  streakFreezeUsedToday: boolean;
  rivalId: string | null;
  beatenRivals: string[];
  rivalData: any | null;
  showCrushedAnimation: boolean;
  zoneCoins: number;
  doubleXpPotions: number;
  doubleXpActiveUntil: string | null;
  doubleCoinPotions: number;
  doubleCoinActiveUntil: string | null;
  isPremium: boolean;
  shownNotifications: string[];
  lastRestNotificationTime: number;
  recentCompletions?: number[]; // Timestamps of recent completions
  burstLockUntil?: number; // Timestamp until which mission completion is locked
  integrityScore: number;
  consecutiveCleanMissions: number;
  baseStats: Record<string, number>;
  stats?: Record<string, number>;
  ovr?: number;
  notificationsEnabled: boolean;
  notificationTime: string;
  preferredChartType?: 'bar' | 'line';
  activeTab: MissionType;
  bossState?: BossState;
  missionAffinity: Record<PathType, number>;
  missionCompletionCounts: Record<string, number>;
  streakFreezesUsed?: number;
}

export const ALL_FRAMES = [
  'frame-default', 'frame-bronze', 'frame-silver', 'frame-gold', 'frame-platinum', 
  'frame-diamond', 'frame-master', 'frame-grandmaster', 'frame-challenger', 'frame-legend', 'frame-mythic', 
  'frame-rgb', 'frame-neon', 'frame-fire', 'frame-cyberpunk', 'frame-hologram', 
  'frame-celestial', 'frame-void', 'frame-aurora', 'frame-radiant', 
  'frame-abyssal', 'frame-inferno', 'frame-ethereal', 'frame-omniscience', 'frame-matrix', 'frame-viral',
  'frame-royal', 'frame-glitch', 'frame-elite'
];

export function isFrameUnlocked(frame: string, state: UserState): boolean {
  if (!state) return false;
  
  const isZaiki = state.username?.toLowerCase() === 'zaiki';
  const totalMissions = Object.values(state.dailyStats || {}).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0) as number;
  const ovr = Math.round(
    ((state.stats?.physical || 1) +
    (state.stats?.discipline || 1) +
    (state.stats?.mental || 1) +
    (state.stats?.ambition || 1) +
    (state.stats?.intellect || 1) +
    (state.stats?.social || 1)) / 6
  );

  const specialConditions: Record<string, boolean> = {
    'frame-bronze': state.level >= 1,
    'frame-silver': state.level >= 3,
    'frame-gold': state.level >= 6,
    'frame-platinum': state.level >= 10,
    'frame-diamond': state.level >= 15,
    'frame-master': state.level >= 21,
    'frame-grandmaster': state.level >= 28,
    'frame-challenger': state.level >= 36,
    'frame-legend': state.level >= 43,
    'frame-mythic': state.level >= 50,
    'frame-rgb': state.streak >= 7,
    'frame-neon': totalMissions >= 50,
    'frame-fire': state.streak >= 30,
    'frame-cyberpunk': (state.badges?.length || 0) >= 5,
    'frame-hologram': totalMissions >= 100,
    'frame-celestial': ovr >= 80,
    'frame-void': state.level >= 20,
    'frame-aurora': state.streak >= 60,
    'frame-radiant': totalMissions >= 200,
    'frame-abyssal': totalMissions >= 666,
    'frame-inferno': state.streak >= 100,
    'frame-ethereal': ovr >= 95,
    'frame-omniscience': ovr >= 100,
    'frame-matrix': totalMissions >= 100,
    'frame-viral': (state.shareCount || 0) >= 5,
    'frame-elite': state.isPremium,
  };

  return state.unlockedFrames?.includes(frame) || 
    frame === 'frame-default' || 
    isZaiki || 
    (specialConditions[frame] ?? false);
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

export function getIntegrityRating(score: number) {
  if (score >= 90) return { letter: 'S', label: 'Supreme', color: '#00FFFF', glow: 'shadow-[0_0_15px_#00FFFF]' };
  if (score >= 75) return { letter: 'A', label: 'Honest', color: '#39FF14', glow: 'shadow-[0_0_15px_#39FF14]' };
  if (score >= 50) return { letter: 'B', label: 'Average', color: '#FFFFFF', glow: 'shadow-[0_0_15px_#FFFFFF]' };
  if (score >= 25) return { letter: 'C', label: 'Suspicious', color: '#FFD300', glow: 'shadow-[0_0_15px_#FFD300]' };
  return { letter: 'D', label: 'Dishonest', color: '#FF3131', glow: 'shadow-[0_0_15px_#FF3131] animate-pulse' };
}

export function calculateOVR(state: UserState, activeUserEmail?: string | null) {
  if (!state) return { ovr: 44, stats: { physical: 40, discipline: 40, mental: 40, ambition: 40, intellect: 40, social: 40, other: 40 } };

  const getPathScore = (path: PathType, statKey: string) => {
    // Level and XP are now global
    const level = Number(state.level) || 1;
    const xp = Number(state.xp) || 0;
    
    // Ensure numeric values to prevent NaN
    const base = Number(state.baseStats?.[statKey]) || 0;
    
    return Math.floor(Math.min(99, 40 + base + (level * 1.5) + (xp / 100)));
  };

  const physical = getPathScore('STRONGER', 'physical');
  const mental = getPathScore('MENTAL_HEALTH', 'mental');
  const intellect = getPathScore('PRODUCTIVE', 'intellect');
  const social = getPathScore('SOCIAL', 'social');
  const other = getPathScore('OTHER', 'other');
  
  // Discipline: streak
  const baseDiscipline = Number(state.baseStats?.['discipline']) || 0;
  const streak = Number(state.streak) || 0;
  const discipline = Math.floor(Math.min(99, 40 + baseDiscipline + (streak * 1.5)));

  // Ambition: level + badges
  const baseAmbition = Number(state.baseStats?.['ambition']) || 0;
  const totalLevels = Number(state.level) || 1;
  const badgesCount = Array.isArray(state.badges) ? state.badges.length : 0;
  const ambition = Math.floor(Math.min(99, 40 + baseAmbition + (totalLevels * 1.5) + (badgesCount * 1.5)));

  // Weighted average (excluding 'other' from main OVR calculation as requested)
  let ovr = Math.floor((physical + discipline + mental + ambition + intellect + social) / 6);

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
  SOCIAL: [
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

export const createDefaultState = (username: string, email?: string, uid?: string): UserState => {
  const isZaiki = email === 'zaikiwildan@gmail.com' || username.toLowerCase().includes('zaiki');
  
  return {
    dataVersion: 2,
    userId: uid || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)),
    username,
    profilePicture: null,
    isLoggedIn: true,
    onboardingCompleted: false,
    chosenPath: null,
    xp: 0,
    totalXp: 0,
    level: 1,
    missions: [],
    lastMissionDate: '',
    lastWeeklyDate: '',
    badges: isZaiki ? ['ELITE_ZONE'] : [],
    isPremium: isZaiki,
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
    unlockedTitles: ['Newbie'],
    equippedTitle: 'Newbie',
    hasPromptedPfp: false,
    customMissions: {},
    unlockedItemsQueue: [],
    shareCount: 0,
    isProfilePublic: true,
    missionsCompleted: 0,
    manifestoAccepted: false,
    notifications: [],
    streakFreezes: 1,
    lastStreakFreezeGiven: getTodayISO(),
    streakFreezeUsedToday: false,
    rivalId: null,
    beatenRivals: [],
    rivalData: null,
    showCrushedAnimation: false,
    zoneCoins: 0,
    doubleXpPotions: 0,
    doubleXpActiveUntil: null,
    doubleCoinPotions: 0,
    doubleCoinActiveUntil: null,
    shownNotifications: [],
    lastRestNotificationTime: 0,
    recentCompletions: [],
    burstLockUntil: 0,
    integrityScore: 90,
    consecutiveCleanMissions: 0,
    bossState: {
      status: 'idle',
      topic: null,
      isActive: false,
      lastEncounterDate: null
    },
    baseStats: {
      intellect: 3,
      physical: 3,
      social: 3,
      ambition: 3,
      discipline: 4,
      mental: 3,
      other: 3
    },
    stats: {
      intellect: 3,
      physical: 3,
      social: 3,
      ambition: 3,
      discipline: 4,
      mental: 3,
      other: 3
    },
    notificationsEnabled: false,
    notificationTime: '09:00',
    preferredChartType: 'bar',
    activeTab: 'REGULAR',
    missionAffinity: {
      PRODUCTIVE: 1.0,
      STRONGER: 1.0,
      SOCIAL: 1.0,
      DISCIPLINE: 1.0,
      MENTAL_HEALTH: 1.0,
      OTHER: 1.0
    },
    missionCompletionCounts: {}
  };
};

const PATH_MISSIONS: Record<PathType, Record<MissionType, string[]>> = {
  PRODUCTIVE: {
    REGULAR: [
      "Read a self-help article", "Organize your files", "Plan your week",
      "Write down 3 priorities for today", "Clear your email inbox", "Declutter your workspace",
      "Listen to an educational podcast", "Watch a tutorial on a new tool", "Brainstorm ideas",
      "Review your monthly goals", "Update your to-do list", "Unsubscribe from 3 useless emails",
      "Organize your computer desktop", "Read 1 chapter of a non-fiction book", "Plan your meals",
      "Write a journal entry about your progress", "Delete unused apps from your phone", "Focus on one task for 15 minutes",
      "Review your budget", "Create a morning routine",
      "Write a quick summary of your day", "Delete 5 unnecessary files", "Organize your bookmarks", 
      "Clean your room", "Write down 3 things to do tomorrow", "Check your calendar", 
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
      "Spend 10 minutes learning a language", "Write down one thing you learned today", "Do a end-of-day review",
      "Prepare clothes for tomorrow", "Limit social media to 30 minutes", "Take a 15-minute screen break",
      "Practice typing", "Listen to an audiobook during commute", "Keep your phone in another room while working",
      "Track your expenses", "Do a brain dump",
      "Listen to an inspiring talk", "Spend 15 minutes planning", "Do 1 hour of focused work", 
      "Review your long-term goals", "Write a reflection",
      "Read 1 article", "Listen to 1 podcast episode", "Watch 1 educational video", 
      "Write 500 words", "Study for 20 minutes", "Review flashcards", 
      "Practice a musical instrument", "Code for 30 mins", "Draw for 15 mins", 
      "Write down 3 things you accomplished", "Plan tomorrow's meals", "Drink green tea", 
      "Take a stretch break", "Do 10 minutes of deep breathing", "Write down your top priority", 
      "Avoid multitasking for 1 hour", "Do 1 Pomodoro session (25 mins)", "Turn off phone for 30 mins", 
      "Read a newsletter", "Review your daily budget"
    ],
    WEEKLY: [
      "Read a book for 120 minutes", "Review weekly goals", "Learn a new skill",
      "Deep clean your room", "Plan next week", "Weekly financial review",
      "Back up your computer files", "Clean out your fridge", "Wash your bed sheets",
      "Spend 2 hours on a personal project", "Listen to a 1-hour educational lecture", "Organize your digital photos",
      "Update your resume", "Meal prep", "Evaluate last week",
      "Organize your workspace", "Review monthly budget", "Plan a project", 
      "Read 2 chapters of a book", "Weekly brain dump",
      "Read 3 chapters of a book", "Study course for 60 minutes", "Write a blog post", 
      "Update LinkedIn", "Network with 1 person", "Attend a webinar", 
      "Clean your car", "Do all your laundry", "Iron clothes", 
      "Vacuum your room", "Mop the floors", "Clean the bathroom", 
      "Organize your closet", "Donate old clothes", "Plan a trip", 
      "Review your monthly goals", "Set next month's goals", "Create a vision board", 
      "Read a biography", "Watch a documentary"
    ],
    ROUTINE: []
  },
  STRONGER: {
    REGULAR: [
      "Do 10 squats", "Stretch", "Hold a plank for 30 seconds",
      "Do 15 jumping jacks", "Do 10 lunges per leg", "Do 10 push-ups",
      "Do 20 calf raises", "Do a 1-minute wall sit", "Do 15 crunches",
      "Do 10 burpees", "Stretch your hamstrings", "Do arm circles",
      "Do 20 high knees", "Do 15 glute bridges", "Do a 30-second side plank (each side)",
      "Do 10 tricep dips", "Do 20 mountain climbers", "Stretch your shoulders",
      "Do 15 bicycle crunches", "Do 10 jump squats",
      "Do 15 squats", "Hold a plank for 45 seconds", 
      "Stretch your back", "Do 10 lunges", "Do 15 calf raises", 
      "Do a 30-second wall sit", "Stretch your arms", 
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
      "Sleep for 8 hours", "Do a 15-minute workout", "Stretch before bed",
      "Avoid sugary drinks", "Eat a high-protein breakfast", "Take the stairs",
      "Do 50 squats throughout the day", "Do a 10-minute core workout", "Avoid processed foods",
      "Drink a glass of water before each meal", "Do a mobility routine", "Stand up and walk every hour",
      "Eat a healthy snack", "Do 30 push-ups throughout the day",
      "Drink 3 liters of water", "Eat a healthy breakfast", "Do a 20-minute workout", 
      "Walk 8,000 steps",
      "Drink 4 liters of water", "Eat 3 servings of vegetables", "Eat 2 servings of fruit", 
      "Get 9 hours of sleep", "Do a 30-minute workout", "Stretch", 
      "Walk 12,000 steps", "Take a cold plunge", "Do a 10-minute HIIT", 
      "Do a 20-minute yoga", "Eat a healthy lunch", "Eat a healthy dinner", 
      "Avoid sugar for the day", "Avoid fried food", "Avoid alcohol", 
      "Drink a protein shake", "Take your vitamins", "Do 50 crunches", 
      "Do 50 lunges", "Do 50 jumping jacks"
    ],
    WEEKLY: [
      "Go for a 5km run", "Meal prep for 3 days", "Try a new workout",
      "Do a 1-hour strength training session", "Go for a 1-hour hike or walk", "Do a 30-minute yoga session",
      "Try a new healthy recipe", "Do a HIIT workout for 20 minutes", "Go swimming or cycling",
      "Full-body stretch", "Track your macros for 3 days", "Do 100 push-ups in one day",
      "Do 100 squats in one day", "Play a sport for 1 hour", "Do a 45-minute cardio session",
      "Do a 45-minute strength workout", "Go for a 30-minute run", "Try a new sport", 
      "Meal prep for 5 days", "Do a 1-hour yoga session",
      "Go for a 10km run", "Do a 2-hour strength training", "Go for a 2-hour hike", 
      "Do a 1-hour yoga class", "Do a 1-hour Pilates class", 
      "Go rock climbing", "Go for a 20km bike ride", "Swim for 1 hour", 
      "Play basketball for 1 hour", "Play tennis for 1 hour", "Play soccer for 1 hour", 
      "Do a martial arts class", "Do a dance class", "Do a CrossFit workout", 
      "Meal prep for 7 days", "Track macros for 7 days", "Do 200 push-ups in one day", 
      "Do 200 squats in one day", "Run a 5k under 30 mins"
    ],
    ROUTINE: []
  },
  SOCIAL: {
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
      "Post something positive on social media", "Listen actively", "Ask 3 open-ended questions today",
      "Express gratitude to someone", "Join a group conversation", "Spend 10 minutes making plans",
      "Share your opinion in a meeting or class", "Give 2 genuine compliments", "Reply to 3 stories on social media",
      "Send a voice message to a friend", "Ask someone for feedback", "Share an interesting article",
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
      "Attend a social event", "Call an old friend for 20 minutes", "Have a deep conversation for 30 minutes",
      "Go out for coffee", "Host a get-together", "Join a meetup",
      "Volunteer for 2 hours", "Play with voice chat for 1 hour", "Spend 30 minutes in a public place",
      "Have lunch with someone", "Attend a workshop", "Organize a movie night",
      "Go to a networking event", "Video call a friend for 30 minutes", "Participate in a discussion",
      "Attend a networking event", "Host a dinner", "Go to a meetup", 
      "Call a family member for 30 mins", "Volunteer for 3 hours",
      "Host a game night", "Host a potluck", "Go to a concert", 
      "Go to a comedy show", "Visit a museum", "Visit an art gallery", 
      "Attend a festival", "Join a sports league", "Take a group class", 
      "Go to a trivia night", "Go to a karaoke bar", "Organize a picnic", 
      "Go on a road trip", "Visit a new city", "Attend a conference", 
      "Go to a trade show", "Volunteer at a shelter", "Volunteer at a food bank", 
      "Join a book club", "Spend 15 minutes at a cafe"
    ],
    ROUTINE: []
  },
    DISCIPLINE: {
      REGULAR: [
        "Make your bed", "Sit with straight posture", "Drink water first thing",
        "Put away your clothes", "Wash dishes", "Clean your workspace",
        "Turn off notifications for 1 hour", "Do a task for 20 minutes", "Read 5 pages of a book",
        "Do 10 push-ups", "Write down your expenses", "Plan your next day",
        "Organize your digital files", "Unsubscribe from 1 email list", "Empty the trash",
        "Wipe down counters", "Do a 2-minute breathing exercise", "Put your phone away while eating",
        "Write down 1 goal", "Review habits",
        "Put away your shoes", "Wash your face", "Drink a glass of water", 
        "Do 5 push-ups", "Read 2 pages of a book", "Sit in silence for 2 minutes", 
        "Write down 1 task", "Clean your desk", "Turn off your phone for 15 mins", 
        "Do a quick stretch",
        "Make your bed immediately", "Brush your teeth", "Floss your teeth", 
        "Wash your face before bed", "Put your keys in the same spot", "Hang up your coat", 
        "Put your shoes away", "Wash your mug", "Wipe the table", 
        "Take out recycling", "Water your plants", "Feed your pet", 
        "Check tire pressure", "Fill up gas", "Charge your phone to 100%", 
        "Update software", "Restart computer", "Clear browser tabs", 
        "Empty downloads", "Organize desktop"
      ],
      DAILY: [
        "Take a cold shower", "No social media for 120 minutes", "Read 10 pages",
        "Wake up at the same time", "Sleep at the same time", "Exercise for 20 minutes",
        "Drink 2 liters of water", "No junk food", "Meditate for 5 minutes",
        "Write in a journal", "Limit screen time before bed", "Do 1 hour of deep work",
        "Track time", "Eat 3 healthy meals", "No snoozing the alarm",
        "Tidy your room", "Read an educational article", "Practice a skill for 15 minutes",
        "Review long-term goals", "Plan outfit",
        "Wake up without snoozing", "No sugar for the day", "Read 15 pages", 
        "Exercise for 30 minutes", "Meditate for 10 minutes",
        "Wake up at 6 AM", "Wake up at 5:30 AM", "Sleep by 10 PM", 
        "Sleep by 10:30 PM", "No screens 2 hours before bed", "No screens 1 hour after waking up", 
        "Read 20 pages", "Read 30 pages", "Write 500 words", 
        "Exercise for 45 mins", "Exercise for 1 hour", "Meditate for 15 mins", 
        "Meditate for 20 mins", "Drink 3 liters of water", "Eat 4 servings of vegetables", 
        "No processed sugar", "No fast food", "Track every penny spent", 
        "Plan tomorrow down to the hour", "Review your goals"
      ],
      WEEKLY: [
        "Digital detox for 24 hours", "Wake up at 5 AM all week", "Complete all daily tasks",
        "Read a whole book", "Fast for 16 hours one day", "No sugar for 3 days",
        "Do a 10km run or walk", "Review your weekly budget", "Deep clean house",
        "Plan weekly meals", "Do a 24-hour dopamine detox", "Learn a new concept for 60 minutes",
        "Write weekly reflection", "Organize finances", "Fix something",
        "Fast for 24 hours", "Read a book", "No social media for 2 days", 
        "Deep clean your room", "Review weekly habits",
        "Fast for 20 hours", "Fast for 24 hours", "No social media for 3 days", 
        "No social media for 5 days", "No TV for a week", "No video games for a week", 
        "Read 2 books", "Run 20km total", "Workout 5 days", 
        "Workout 6 days", "Meal prep", "Zero unnecessary spending", 
        "Save 10% of income", "Invest 10% of income", "Deep clean house", 
        "Wash windows", "Clean the oven", "Clean the fridge", 
        "Organize the garage", "Donate 5 items"
      ],
      ROUTINE: []
    },
  MENTAL_HEALTH: {
    REGULAR: [
      "Take 5 deep breaths", "Listen to calming music", "Stretch your neck",
      "Drink a glass of water", "Look out the window", "Write down 1 positive thought",
      "Do a body scan for 5 minutes", "Close your eyes for 1 minute", "Smile for 30 seconds",
      "Say a positive affirmation", "Wash your face", "Step outside",
      "Pet an animal or look at cute pictures", "Unclench your jaw and relax your shoulders", "Write down worries",
      "Do a 3-minute guided meditation", "Listen to nature sounds for 10 minutes", "Doodle or draw",
      "Read a positive quote", "Stretch arms and back",
      "Do 10 deep breaths", "Look at the sky for 1 minute", "Write down 1 thing you love", 
      "Stretch your legs", "Drink herbal tea", "Listen to a calming song", 
      "Close your eyes", "Say 3 affirmations", "Wash hands mindfully", 
      "Focus on your breathing",
      "Light a candle and sit", "Drink tea", "Take a break", 
      "Look at a beautiful picture", "Listen to guided meditation for 10 minutes", "Do a body scan", 
      "Write self-love list", "Reflect and forgive", "Reflect and let go", 
      "Say 'no' to something you don't want to do", "Set a boundary", "Ask for what you need", 
      "Express feelings", "Cry if you need to", "Laugh out loud", 
      "Watch a funny video", "Read a poem", "Wrap yourself in a blanket", 
      "Deep breath and sigh", "Massage your temples"
    ],
    DAILY: [
      "20 minutes of meditation", "Write 3 things you are grateful for", "Take a 15-minute walk",
      "Get 8 hours of sleep", "Spend 15 minutes in the sun", "Limit news consumption",
      "Do something you enjoy for 30 mins", "Write a journal entry", "Practice self-compassion",
      "Disconnect from work after hours", "Eat a nourishing meal", "Do a 10-minute yoga routine",
      "Talk to a supportive friend", "Read a chapter of a fiction book", "Spend 10 minutes in silence",
      "Do a mindfulness exercise", "Take a warm bath or shower", "Write down your feelings",
      "Listen to an uplifting podcast", "Practice relaxation for 15 minutes",
      "Write in gratitude journal", "Spend 20 minutes in nature", "Do a 15-minute meditation", 
      "Disconnect from screens 1 hour before bed", "Do a relaxing hobby",
      "Meditate for 20 minutes", "Do a 20-minute yoga nidra", "Write 3 pages", 
      "Take a 30-minute walk in nature", "Spend 30 minutes in the sun", "No news for the day", 
      "No social media for the day", "Do 1 hour of a relaxing hobby", "Take a 30-minute nap", 
      "Listen to an album for 45 minutes", "Read 2 chapters of fiction", "Take a long shower", 
      "Do a skincare routine", "Eat mindfully", "Drink 2 liters of water", 
      "Get 9 hours of sleep", "Write to future self", "Write to past self", 
      "List 5 things you are grateful for", "List 5 things you are proud of"
    ],
    WEEKLY: [
      "Deep reflection for 60 minutes", "Spend 6 hours in nature", "Unplug for 48 hours",
      "Self-care evening for 3 hours", "Do a creative activity for 1 hour", "Go for a long walk without your phone",
      "Cook a nice meal", "Watch a movie for 120 minutes", "Mind declutter",
      "Spend 2 hours with loved ones", "Try a new hobby", "Visit a park",
      "Do a digital detox for 12 hours", "Read for pleasure for 60 minutes", "Home spa day for 2 hours",
      "Tech-free day for 24 hours", "Go for a hike for 2 hours", "Have a long bath", 
      "Do a creative project for 60 minutes", "Do nothing for 24 hours",
      "Therapy session for 60 minutes", "Attend a support group for 1 hour", "Spend 24 hours offline", 
      "Spend 24 hours in nature", "Go camping for 24 hours", "Go to a spa for 2 hours", 
      "Get a massage for 60 minutes", "Take a day trip for 8 hours", "Visit a garden for 1 hour", 
      "Visit an art museum for 2 hours", "Do a 2-hour creative project", "Bake from scratch for 90 minutes", 
      "Cook a complex meal for 2 hours", "Read a fiction book for 3 hours", "Watch 2 movies for 4 hours", 
      "Have a pajama day for 24 hours", "Sleep in without an alarm", "Do a 1-hour meditation", 
      "Do a 1-hour yoga class", "Write a short story for 60 minutes"
    ],
    ROUTINE: []
  },
  OTHER: {
    REGULAR: [],
    DAILY: [],
    WEEKLY: [],
    ROUTINE: []
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

export const analyzeMissionPath = (text: string): PathType => {
  const lower = text.toLowerCase();
  
  // Mental Health - Moved up and expanded keywords
  if (/(meditate|breathe|breath|journal|calm|relax|sleep|nap|yoga|meditasi|nafas|tenang|tidur|jurnal|doa|pray|ibadah|sholat|dzikir|healing|mindful|rest|istirahat|self-care|syukur|gratitude|terima|kasih|thanks|puji|ikhlas|sabar|patience|maaf|forgive|ampun|tobat|muhasabah|renung|refleksi|reflection|hening|silent|solitude|me-time|hobi|hobby|senang|happy|bahagia|puas|content|lega|bebas|free|lepas|let|go|water|air|minum|window|jendela|outside|luar|animal|hewan|kucing|anjing|doodle|quote|kutipan|sky|langit|tea|teh|bath|mandi|shower|news|berita|social media|sosmed|offline|detox|therapy|terapi|spa|massage|pijat|garden|taman|museum|smile|senyum|laugh|tertawa|santai|affirmation|afirmasi|thought|pikiran|feeling|perasaan|emotion|emosi|mental|jiwa|batin|rohani)/.test(lower)) return 'MENTAL_HEALTH';

  // Physical / Stronger
  if (/(push|pull|run|walk|jog|gym|workout|exercise|squat|plank|situp|sit-up|crunch|burpee|jump|lari|jalan|otot|fisik|olahraga|renang|sepeda|angkat|sweat|cardio|training|fitness|bola|basket|futsal|badminton|tenis|stretching|boxing|muaythai|karate|silat|treadmill|dumbell|barbell|lifting|kardio|sehat|kesehatan|atlet|atletik|maraton|sprint|lompat|tendang|pukul|tangkis|sparring|gowes|pedal|kolam|lap|set|rep|reps|kalori|bakar|lemak)/.test(lower)) return 'STRONGER';
  
  // Productivity / Productive
  if (/(read|book|study|learn|course|tutorial|code|math|baca|buku|belajar|kursus|bahasa|artikel|article|work|project|tugas|kerja|nulis|write|skripsi|exam|ujian|coding|dev|design|produktivitas|fokus|focus|prioritas|priority|jadwal|schedule|rencana|plan|organisir|organize|rapi|bersih|meja|email|inbox|belanja|masak|makan|persiapan|prep|resume|cv|portofolio|portfolio|investasi|invest|nabung|tabungan|keuangan|budget|anggaran|bisnis|usaha|omzet|sales|marketing|penjualan|klien|client|meeting|rapat|notulensi|notula|catatan|note|notes|ide|idea|kreatif|creative|gambar|lukis|desain|edit|video|audio|musik|instrumen|alat|latihan|practice|subscription|langganan|download|unduhan|password|sandi|contact|kontak|backup|cadangan|wallet|dompet|file|berkas|folder|trash|sampah|mail|surat|bill|tagihan|bank|balance|saldo|bake|panggang|cook)/.test(lower)) return 'PRODUCTIVE';
  
  // Social / Extrovert
  if (/(talk|call|meet|friend|family|greet|help|bicara|telepon|teman|keluarga|sapa|bantu|nongkrong|sosial|chat|hangout|date|dinner|lunch|party|community|komunitas|relasi|network|kenalan|kenal|ngobrol|diskusi|debat|presentasi|panggung|tampil|perform|compliment|kontak|mata|eye|contact|jabat|tangan|peluk|hug|kado|hadiah|gift|donasi|sedekah|amal|zakat|tolong|peduli|care|empati|dengar|listen|curhat|cerita|story|berbagi|share|ajak|invite|gabung|join|kumpul|gathering|reuni|reunion|bukber|halal|bihalal|silaturahmi|question|tanya|stranger|orang asing|someone|seseorang|conversation|percakapan|interaction|interaksi|group|grup|kelompok|event|acara|public|publik|colleague|kolega|coworker|rekan kerja|neighbor|tetangga|cashier|kasir|opinion|pendapat|feedback|umpan balik|joke|canda|meme|voice|suara|intro)/.test(lower)) return 'SOCIAL';
  
  // Default to Discipline
  return 'DISCIPLINE';
};

