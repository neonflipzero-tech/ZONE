import React, { useState, useEffect } from 'react';
import { create } from 'zustand';
import { sounds } from './utils/sounds';
import { auth, googleProvider, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { getDoc, doc, setDoc } from 'firebase/firestore';

import { MISSION_TRANSLATIONS } from './utils/missionTranslations';

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
  replaceMission: (id: string) => void;
  changePath: (path: PathType) => void;
  addCustomMission: (type: MissionType, text: string) => void;
  removeCustomMission: (type: MissionType, text: string) => void;
  dismissUnlockedItem: () => void;
  addNotification: (notif: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  incrementShareCount: () => void;
  crushRival: () => void;
  dismissCrushedAnimation: () => void;
  triggerBoss: () => void;
  attackBoss: (taskId: string) => void;
  defeatBoss: () => void;
  escapeBoss: () => void;
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setActiveUserEmail(user.email);
        const saved = localStorage.getItem(`lockin_user_${user.email}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            // Ensure userId matches Firebase Auth UID for Firestore permissions
            if (user.uid && parsed.userId !== user.uid) {
              parsed.userId = user.uid;
              localStorage.setItem(`lockin_user_${user.email}`, JSON.stringify(parsed));
            }
            // Migration: remove timers from missions that don't strictly require them
            if (parsed.missions) {
              parsed.missions = parsed.missions.map((m: any) => ({
                ...m,
                hasTimer: extractDuration(m.originalText || m.text) !== null
              }));
            }
            // Auto-grant Elite to Zaiki if not already set
            if (!parsed.isPremium && user.email === 'zaikiwildan@gmail.com') {
              parsed.isPremium = true;
            }
            
            // Check for boss expiration
            const today = getTodayISO();
            
            // Check for streak reset
            if (parsed.lastActiveDate) {
              const lastDate = new Date(parsed.lastActiveDate);
              const todayDate = new Date(today);
              const diff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
              
              if (diff > 1) {
                // Streak broken!
                if ((parsed.streakFreezes || 0) > 0) {
                  parsed.streakFreezes -= 1;
                  // Streak saved by freeze!
                  if (!parsed.notifications) parsed.notifications = [];
                  parsed.notifications.unshift({
                    id: Math.random().toString(36).substring(2, 9),
                    title: parsed.language === 'id' ? 'STREAK DISELAMATKAN!' : 'STREAK SAVED!',
                    description: parsed.language === 'id' 
                      ? 'Streak-mu diselamatkan oleh Streak Freeze!' 
                      : 'Your streak was saved by a Streak Freeze!',
                    icon: 'Shield',
                    read: false,
                    timestamp: Date.now()
                  });
                } else {
                  parsed.streak = 0;
                  if (!parsed.notifications) parsed.notifications = [];
                  parsed.notifications.unshift({
                    id: Math.random().toString(36).substring(2, 9),
                    title: parsed.language === 'id' ? 'STREAK TERPUTUS' : 'STREAK BROKEN',
                    description: parsed.language === 'id' 
                      ? 'Kamu melewatkan satu hari. Streak kembali ke 0.' 
                      : 'You missed a day. Streak reset to 0.',
                    icon: 'Flame',
                    read: false,
                    timestamp: Date.now()
                  });
                }
              }
            }

            // Check for boss expiration - only if week has changed
            const now = new Date();
            const currentWeek = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
            
            if (parsed.bossState && parsed.bossState.status === 'active') {
              const lastEncounter = parsed.bossState.lastEncounterDate ? new Date(parsed.bossState.lastEncounterDate) : null;
              const lastWeek = lastEncounter ? Math.floor(lastEncounter.getTime() / (7 * 24 * 60 * 60 * 1000)) : currentWeek;
              
              if (lastWeek < currentWeek) {
                // Boss escaped because the week ended!
                parsed.bossState.status = 'escaped';
                parsed.bossState.isActive = false;
                parsed.xp = Math.max(0, (parsed.xp || 0) - 500);
                parsed.totalXp = Math.max(0, (parsed.totalXp || 0) - 500);
                parsed.zoneCoins = Math.max(0, (parsed.zoneCoins || 0) - 100);
                
                if (!parsed.notifications) parsed.notifications = [];
                parsed.notifications.unshift({
                  id: Math.random().toString(36).substring(2, 9),
                  title: parsed.language === 'id' ? 'BOSS KABUR!' : 'BOSS ESCAPED!',
                  description: parsed.language === 'id' 
                    ? 'Minggu telah berakhir. Boss melarikan diri dan mencuri 500 XP & 100 ZoneCoins!' 
                    : 'The week has ended. The boss escaped and stole 500 XP & 100 ZoneCoins!',
                  icon: 'Skull',
                  read: false,
                  timestamp: Date.now()
                });
  
                // External Notification
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification(parsed.language === 'id' ? 'BOSS KABUR!' : 'BOSS ESCAPED!', {
                    body: parsed.language === 'id' 
                      ? 'Minggu telah berakhir. Boss melarikan diri!' 
                      : 'The week has ended. The boss escaped!',
                    icon: '/favicon.ico'
                  });
                }
              }
            }

            setState(parsed);
          } catch (e) {
            console.error("Error parsing saved state:", e);
          }
        } else {
          const newState = createDefaultState(user.displayName || 'User', user.email);
          newState.userId = user.uid;
          setState(newState);
          localStorage.setItem(`lockin_user_${user.email}`, JSON.stringify(newState));
        }
      }
      setAuthReady(true);
    });
    return unsubscribe;
  },

  updateState: (updates) => {
    const { state, activeUserEmail } = get();
    if (!state || !activeUserEmail) return;

    // Check for unlocks before applying updates
    const newUnlockedItems = [...(state.unlockedItemsQueue || [])];
    
    // 1. Check for Level Up Unlocks (Frames)
    if (updates.level && updates.level > state.level) {
      for (let lvl = state.level + 1; lvl <= updates.level; lvl++) {
        const rank = RANKS.find(r => r.minLevel === lvl);
        if (rank) {
          const frameId = `frame-${rank.name.toLowerCase()}`;
          if (!state.unlockedFrames?.includes(frameId)) {
            newUnlockedItems.push({ type: 'frame', id: frameId });
          }
        }
      }
    }

    // 2. Check for Streak Unlocks
    if (updates.streak && updates.streak > state.streak) {
      if (updates.streak === 7 && !state.unlockedFrames?.includes('frame-rgb')) newUnlockedItems.push({ type: 'frame', id: 'frame-rgb' });
      if (updates.streak === 30 && !state.unlockedFrames?.includes('frame-fire')) newUnlockedItems.push({ type: 'frame', id: 'frame-fire' });
      if (updates.streak === 60 && !state.unlockedFrames?.includes('frame-aurora')) newUnlockedItems.push({ type: 'frame', id: 'frame-aurora' });
      if (updates.streak === 100 && !state.unlockedFrames?.includes('frame-inferno')) newUnlockedItems.push({ type: 'frame', id: 'frame-inferno' });
    }

    // 3. Check for Mission Count Unlocks
    if (updates.missionsCompleted && updates.missionsCompleted > state.missionsCompleted) {
      if (updates.missionsCompleted === 50 && !state.unlockedFrames?.includes('frame-neon')) newUnlockedItems.push({ type: 'frame', id: 'frame-neon' });
      if (updates.missionsCompleted === 100 && !state.unlockedFrames?.includes('frame-hologram')) newUnlockedItems.push({ type: 'frame', id: 'frame-hologram' });
      if (updates.missionsCompleted === 200 && !state.unlockedFrames?.includes('frame-radiant')) newUnlockedItems.push({ type: 'frame', id: 'frame-radiant' });
      if (updates.missionsCompleted === 666 && !state.unlockedFrames?.includes('frame-abyssal')) newUnlockedItems.push({ type: 'frame', id: 'frame-abyssal' });
    }

    // 4. Check for Rank Up
    if (updates.level && updates.level > state.level) {
      const oldRank = RANKS.slice().reverse().find(r => state.level >= r.minLevel);
      const newRank = RANKS.slice().reverse().find(r => updates.level >= r.minLevel);
      if (newRank && oldRank && newRank.name !== oldRank.name) {
        newUnlockedItems.push({ type: 'rank', id: newRank.name });
      }
    }

    if (newUnlockedItems.length > (state.unlockedItemsQueue?.length || 0)) {
      updates.unlockedItemsQueue = newUnlockedItems;
    }

    // Auto-grant Elite to Zaiki if not already set
    if (!state.isPremium && (activeUserEmail === 'zaikiwildan@gmail.com' || state.username.toLowerCase().includes('zaiki'))) {
      updates.isPremium = true;
    }

    const newState = { ...state, ...updates };
    set({ state: newState });
    localStorage.setItem(`lockin_user_${activeUserEmail}`, JSON.stringify(newState));

    // Sync to Firestore if available
    if (db && newState.userId) {
      const userRef = doc(db, 'users', newState.userId);
      // Calculate OVR for storage
      const ovrData = calculateOVR(newState, activeUserEmail);
      setDoc(userRef, { 
        ...newState, 
        ovr: ovrData.ovr,
        stats: ovrData.stats,
        lastUpdated: Date.now() 
      }, { merge: true }).catch(err => {
        console.error("Error syncing to Firestore:", err);
      });
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
        
        // Check if user exists locally or in Firestore
        const localSaved = localStorage.getItem(`lockin_user_${email}`);
        let existsInFirestore = false;
        
        if (db) {
          try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
              existsInFirestore = true;
            }
          } catch (e) {
            console.error("Error checking firestore user:", e);
          }
        }

        if (!localSaved && !existsInFirestore) {
          // Check if this is the dev account (bypass)
          if (email !== 'zaikiwildan@gmail.com') {
            await signOut(auth);
            throw new Error(localStorage.getItem('lockin_language') === 'id' ? 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.' : 'Account not found. Please sign up first.');
          }
        }

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
    const types: MissionType[] = ['REGULAR', 'DAILY', 'WEEKLY'];
    
    types.forEach(type => {
      const pool = PATH_MISSIONS[path][type];
      const count = 3;
      
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
        missions.push({
          id: Math.random().toString(36).substring(2, 9),
          text: translateMissionText(scaleMissionText(text, state.level), state.language),
          originalText: text,
          completed: false,
          type,
          hasTimer: extractDuration(text) !== null
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
    const { state, updateState, addNotification } = get();
    if (!state) return;

    const mission = state.missions.find(m => m.id === id);
    if (!mission || mission.completed) return;

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
      const pool = PATH_MISSIONS[state.chosenPath || 'PRODUCTIVE']['REGULAR'];
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
        
        const newMissionsToAdd = selectedTexts.map(text => ({
          id: Math.random().toString(36).substring(2, 9),
          text: translateMissionText(scaleMissionText(text, state.level), state.language),
          originalText: text,
          completed: false,
          type: 'REGULAR' as const,
          hasTimer: extractDuration(text) !== null
        }));
        
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
      integrityPenalty += 10;
      isPenaltyTriggered = true;
      const msg = state.language === 'id'
        ? "Memproses... Kamu yakin sudah melakukan ini? Dirimu di masa depan sedang mengawasi."
        : "Processing... Are you sure you did this? Your future self is watching.";
      
      addNotification({
        title: state.language === 'id' ? "Peringatan Integritas" : "Integrity Warning",
        description: msg,
        icon: 'AlertCircle'
      });
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

    // Integrity Score Logic
    let newIntegrityScore = Math.max(0, state.integrityScore - integrityPenalty);
    let newConsecutiveCleanMissions = isPenaltyTriggered ? 0 : state.consecutiveCleanMissions + 1;
    
    if (newConsecutiveCleanMissions >= 5) {
      newIntegrityScore = Math.min(100, newIntegrityScore + 5);
      newConsecutiveCleanMissions = 0;
    }

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

    if (animatingLevelUp) {
      sounds.playLevelUp();
    } else {
      sounds.playMissionComplete();
    }

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
      integrityPenalty += 10; // Reduced from 20
      isPenaltyTriggered = true;
      
      const msg = state.language === 'id'
        ? "Neural Overheat. Tarik napas. Progres nyata bukanlah balapan."
        : "Neural Overheat. Take a breath. Real progress isn't a race.";
      
      addNotification({
        title: state.language === 'id' ? "Limit Terdeteksi" : "Limit Detected",
        description: msg,
        icon: 'Zap'
      });
    }

    if (recentCompletions.length > 5) {
      burstLockUntil = now + 15000; // Longer lock for repeated spam
      integrityPenalty += 5; // Reduced from 10
      isPenaltyTriggered = true;
    }

    if (recentCompletions.length >= 7) {
      const msg = state.language === 'id' 
        ? "Aktivitas Abnormal Terdeteksi. Pertumbuhan OVR-mu terlihat buatan. Apakah kamu membangun kerajaan palsu?"
        : "Abnormal Activity Detected. Your OVR growth looks artificial. Are you building a fake empire?";
      
      addNotification({
        title: state.language === 'id' ? "Peringatan Sistem" : "System Warning",
        description: msg,
        icon: 'AlertCircle'
      });

      // Browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Lock In", { body: msg });
      } else if ("Notification" in window && Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("Lock In", { body: msg });
          }
        });
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
    
    if (newMissionsCompleted === 1 && !newBadges.includes('FIRST_STEP')) {
      newBadges.push('FIRST_STEP');
      newUnlockedItems.push({ type: 'badge', id: 'FIRST_STEP' });
    }

    // Update mission affinity (increase weight for completed category)
    const newMissionAffinity = { ...state.missionAffinity };
    const currentAffinity = newMissionAffinity[category] || 1.0;
    newMissionAffinity[category] = Math.min(5.0, currentAffinity + 0.1); // Max weight 5.0

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
      zoneCoins: newCoins,
      badges: newBadges,
      unlockedItemsQueue: newUnlockedItems,
      missionAffinity: newMissionAffinity,
      showStreakAnimation: newStreak > state.streak
    });
  },

  replaceMission: (id) => {
    const { state, updateState } = get();
    if (!state || state.zoneCoins < 50) return;

    const mission = state.missions.find(m => m.id === id);
    if (!mission || mission.completed) return;

    const pool = PATH_MISSIONS[state.chosenPath || 'PRODUCTIVE'][mission.type];
    const filteredPool = pool.filter(t => !state.missions.some(m => m.originalText === t));
    const newText = filteredPool[Math.floor(Math.random() * filteredPool.length)];

    const newMissions = state.missions.map(m => 
      m.id === id ? {
        ...m,
        id: Math.random().toString(36).substring(2, 9),
        text: translateMissionText(scaleMissionText(newText, state.level), state.language),
        originalText: newText,
        hasTimer: extractDuration(newText) !== null
      } : m
    );

    // Update mission affinity (decrease weight for skipped category)
    const category = analyzeMissionPath(mission.originalText || mission.text);
    const currentAffinity = state.missionAffinity?.[category] || 1.0;
    const newAffinity = Math.max(0.1, currentAffinity - 0.2); // Min weight 0.1

    updateState({
      missions: newMissions,
      zoneCoins: state.zoneCoins - 50,
      missionAffinity: {
        ...state.missionAffinity,
        [category]: newAffinity
      }
    });
  },

  changePath: (path) => {
    const { state, updateState, generateMissions } = get();
    if (!state) return;

    if (state.chosenPath) {
      const currentProgress: PathProgress = {
        xp: state.xp,
        level: state.level,
        missions: state.missions,
        lastMissionDate: state.lastMissionDate,
        lastWeeklyDate: state.lastWeeklyDate,
        badges: state.badges,
        highestRankAchieved: state.highestRankAchieved
      };
      
      const newPathProgress = { ...state.pathProgress, [state.chosenPath]: currentProgress };
      const savedProgress = state.pathProgress[path];

      if (savedProgress) {
        updateState({
          chosenPath: path,
          xp: savedProgress.xp,
          level: savedProgress.level,
          missions: savedProgress.missions,
          lastMissionDate: savedProgress.lastMissionDate,
          lastWeeklyDate: savedProgress.lastWeeklyDate,
          pathProgress: newPathProgress
        });
      } else {
        updateState({
          chosenPath: path,
          xp: 0,
          level: 1,
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
    const current = state.customMissions[type] || [];
    updateState({
      customMissions: {
        ...state.customMissions,
        [type]: [...current, text]
      }
    });
  },

  removeCustomMission: (type, text) => {
    const { state, updateState } = get();
    if (!state) return;
    const current = state.customMissions[type] || [];
    updateState({
      customMissions: {
        ...state.customMissions,
        [type]: current.filter(t => t !== text)
      }
    });
  },

  dismissUnlockedItem: () => {
    const { state, updateState } = get();
    if (!state) return;
    updateState({
      unlockedItemsQueue: state.unlockedItemsQueue.slice(1)
    });
  },

  addNotification: (notif) => {
    const { state, updateState } = get();
    if (!state) return;
    const newNotif: Notification = {
      ...notif,
      id: Math.random().toString(36).substring(2, 9),
      read: false,
      timestamp: Date.now()
    };
    updateState({
      notifications: [newNotif, ...state.notifications].slice(0, 50)
    });
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

  triggerBoss: () => {
    const { state, updateState } = get();
    if (!state) return;
    
    const todayISO = getTodayISO();
    
    // Generate tasks for the boss
    const pool = PATH_MISSIONS[state.chosenPath || 'DISCIPLINE']?.WEEKLY || PATH_MISSIONS.DISCIPLINE.WEEKLY;
    const selected = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);
    
    const bossTasks = selected.map((text, i) => ({
      id: `boss-task-${Date.now()}-${i}`,
      text,
      completed: false,
      type: 'WEEKLY' as MissionType,
      path: state.chosenPath || 'DISCIPLINE'
    }));
    
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
      sounds.playMissionComplete();
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
    if (Notification.permission === 'granted') {
      new Notification(state.language === 'id' ? 'BOSS KABUR!' : 'BOSS ESCAPED!', {
        body: state.language === 'id' 
          ? `Boss melarikan diri dan mencuri ${penaltyXp} XP & ${penaltyCoins} ZoneCoins!` 
          : `The boss escaped and stole ${penaltyXp} XP & ${penaltyCoins} ZoneCoins!`,
        icon: '/favicon.ico'
      });
    }
  },

  requestNotificationPermission: () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
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

export type PathType = 'PRODUCTIVE' | 'STRONGER' | 'EXTROVERT' | 'DISCIPLINE' | 'MENTAL_HEALTH' | 'OTHER';
export type MissionType = 'REGULAR' | 'DAILY' | 'WEEKLY' | 'ROUTINE';

export interface Mission {
  id: string;
  text: string;
  originalText?: string; // The base English text from PATH_MISSIONS
  completed: boolean;
  type: MissionType;
  hasTimer?: boolean;
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
  const minutesMatch = text.match(/(\d+(?:[.,]\d+)?)[\s-]*(minutes?|mins?|min|menit|mnt)\b/i);
  if (minutesMatch) return parseFloat(minutesMatch[1].replace(',', '.')) * 60;

  // Seconds: seconds, second, secs, sec, detik, dtk, dkt
  const secondsMatch = text.match(/(\d+(?:[.,]\d+)?)[\s-]*(seconds?|second|secs?|sec|detik|dtk|dkt)\b/i);
  if (secondsMatch) return parseFloat(secondsMatch[1].replace(',', '.'));

  return null;
}

export function translateMissionText(text: string, lang: 'en' | 'id'): string {
  if (lang === 'en') return text;
  return MISSION_TRANSLATIONS[text] || text;
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
  type: 'badge' | 'frame' | 'title' | 'rank';
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
  customMissions: Record<MissionType, string[]>;
  unlockedItemsQueue: UnlockedItem[];
  shareCount: number;
  isProfilePublic: boolean;
  missionsCompleted: number;
  manifestoAccepted?: boolean;
  notifications: Notification[];
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
  lastRestNotificationTime: number;
  recentCompletions?: number[]; // Timestamps of recent completions
  burstLockUntil?: number; // Timestamp until which mission completion is locked
  integrityScore: number;
  consecutiveCleanMissions: number;
  baseStats: Record<string, number>;
  stats?: Record<string, number>;
  notificationsEnabled: boolean;
  notificationTime: string;
  preferredChartType?: 'bar' | 'line';
  activeTab: MissionType;
  bossState?: BossState;
  missionAffinity: Record<PathType, number>;
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

  // Hardcode OVR 100 for Elite users (Zaiki)
  const isElite = state.isPremium || activeUserEmail === 'zaikiwildan@gmail.com' || state.userId === 'zaikiwildan@gmail.com';
  if (isElite) {
    ovr = 100;
  }

  return {
    ovr,
    stats: {
      physical: isElite ? 100 : physical,
      discipline: isElite ? 100 : discipline,
      mental: isElite ? 100 : mental,
      ambition: isElite ? 100 : ambition,
      intellect: isElite ? 100 : intellect,
      social: isElite ? 100 : social,
      other: isElite ? 100 : other
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

export const createDefaultState = (username: string, email?: string, uid?: string): UserState => {
  const isZaiki = email === 'zaikiwildan@gmail.com';
  
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
    unlockedTitles: ['Newbie'],
    equippedTitle: 'Newbie',
    hasPromptedPfp: false,
    customMissions: {
      REGULAR: [],
      DAILY: [],
      WEEKLY: [],
      ROUTINE: []
    },
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
    isPremium: isZaiki,
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
      intellect: 0,
      physical: 0,
      social: 0,
      ambition: 0,
      discipline: 0,
      mental: 0,
      other: 0
    },
    stats: {
      intellect: 0,
      physical: 0,
      social: 0,
      ambition: 0,
      discipline: 0,
      mental: 0,
      other: 0
    },
    notificationsEnabled: false,
    notificationTime: '09:00',
    preferredChartType: 'bar',
    activeTab: 'REGULAR',
    missionAffinity: {
      PRODUCTIVE: 1.0,
      STRONGER: 1.0,
      EXTROVERT: 1.0,
      DISCIPLINE: 1.0,
      MENTAL_HEALTH: 1.0,
      OTHER: 1.0
    }
  };
};

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
    ROUTINE: []
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
    ROUTINE: []
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
      ROUTINE: []
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

