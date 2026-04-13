import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { UserState, MissionType, getRankForLevel, Mission, useAppState, TITLES, analyzeMissionPath, extractDuration, getTodayISO } from '../store';
import { CheckCircle2, Circle, Flame, User, Shield, Timer, Wand2, Bell, Zap, X, ArrowLeft, Target, Mountain, Star, Store, Dumbbell, BookOpen, Wind, Award, Lock, ChevronRight } from 'lucide-react';
import { ZoneCoinIcon } from './ZoneCoinIcon';
import { t } from '../utils/translations';
import { sounds } from '../utils/sounds';
import { getMissionDetails } from '../utils/missionDetails';
import { NotificationService } from '../services/NotificationService';
import ProfileFrame from './ProfileFrame';
import CustomMissionsModal from './CustomMissionsModal';
import NotificationCenter from './NotificationCenter';
import ZoneCoinInfoModal from './ZoneCoinInfoModal';
import ZoneStoreModal from './ZoneStoreModal';
import { calculateOVR, getIntegrityRating } from '../store';
import { BossEncounter } from './BossEncounter';
import { BossBattle } from './BossBattle';
import IntegrityExplanationModal from './IntegrityExplanationModal';

interface HomeScreenProps {
  state: UserState;
  onCompleteMission: (id: string, options?: { useFreeze?: boolean }) => void;
  checkStreakFreezeNeeded: () => boolean;
  onReplaceMission: (id: string) => void;
  addCustomMission: (type: MissionType, text: string) => void;
  removeCustomMission: (type: MissionType, text: string) => void;
  isFlashSale?: boolean;
}

const MissionCard = React.memo(({ mission, index, activeTab, state, handleMissionClick, xpReward, isDoubleXpActive, isDoubleCoinActive, coinReward }: { 
  mission: Mission & { isLocked: boolean }, 
  index: number, 
  activeTab: MissionType, 
  state: UserState, 
  handleMissionClick: any,
  xpReward: number,
  isDoubleXpActive: boolean,
  isDoubleCoinActive: boolean,
  coinReward: number
}) => {
  const isLocked = mission.isLocked;

  return (
    <motion.div
      key={`${mission.id || mission.text}-${index}`}
      id={`mission-card-${mission.id}`}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => {
        if (!isLocked) {
          sounds.playClick();
          handleMissionClick(mission);
        }
      }}
      className={`p-4 rounded-2xl flex items-center space-x-4 border transition-all ${
        mission.completed 
          ? 'bg-surface/30 border-white/5 opacity-50' 
          : isLocked
            ? 'bg-surface/10 border-white/5 opacity-40 cursor-not-allowed grayscale'
            : 'bg-gradient-to-br from-surface to-surface-hover border-white/10 cursor-pointer hover:border-white/30 hover:shadow-lg hover:shadow-accent/5'
      }`}
    >
      {mission.completed ? (
        <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
      ) : (
        <Circle className={`w-6 h-6 shrink-0 ${isLocked ? 'text-secondary/30' : 'text-secondary'}`} />
      )}
      <div className="flex-1 min-w-0">
        <span className={`font-medium block break-words leading-snug ${mission.completed ? 'line-through text-secondary' : 'text-primary'}`}>
          {mission.text}
        </span>
        {isLocked && (
          <span className="text-[10px] font-mono text-rose-500">
            {t('home.locked_mission', state.language)}
          </span>
        )}
      </div>
      {!mission.completed && !isLocked && (
        <div className="ml-auto flex flex-col items-end space-y-0.5">
          <div className="flex items-center space-x-1">
            {isDoubleXpActive && (
              <div className="flex items-center bg-purple-500/20 px-1 rounded text-[10px] font-bold text-purple-400 animate-pulse border border-purple-500/30">
                <Zap className="w-2.5 h-2.5 mr-0.5" />
                2x
              </div>
            )}
            <span className="text-xs font-mono text-accent">+{xpReward} XP</span>
          </div>
          {isDoubleCoinActive && (
            <div className="flex items-center space-x-1">
              <div className="flex items-center bg-yellow-500/20 px-1 rounded text-[10px] font-bold text-yellow-400 animate-pulse border border-yellow-500/30">
                <ZoneCoinIcon className="w-2.5 h-2.5 mr-0.5" />
                2x
              </div>
              <span className="text-[10px] font-mono text-yellow-500">+{coinReward} ZC</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
});

const HomeScreen = ({ state, onCompleteMission, checkStreakFreezeNeeded, onReplaceMission, addCustomMission, removeCustomMission, isFlashSale = false }: HomeScreenProps) => {
  const activeUserEmail = useAppState(s => s.activeUserEmail);
  const updateState = useAppState(s => s.updateState);
  const updateMissionProgress = useAppState(s => s.updateMissionProgress);
  const activeTab = state.activeTab || 'REGULAR';
  const setActiveTab = (tab: MissionType) => {
    sounds.playClick();
    updateState({ activeTab: tab });
  };

  useEffect(() => {
    if (state.activeTab === 'ROUTINE' && state.chosenPath !== 'OTHER') {
      updateState({ activeTab: 'REGULAR' });
    }
  }, [state.activeTab, state.chosenPath, updateState]);

  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const selectedMission = useMemo(() => {
    if (!selectedMissionId) return null;
    return state.missions.find(m => m.id === selectedMissionId) || 
           state.bossState?.tasks?.find(m => m.id === selectedMissionId) || 
           null;
  }, [selectedMissionId, state.missions, state.bossState?.tasks]);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCustomMissionsModalOpen, setIsCustomMissionsModalOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isIntegrityHelpOpen, setIsIntegrityHelpOpen] = useState(false);
  const [isCoinInfoModalOpen, setIsCoinInfoModalOpen] = useState(false);
  const [isZoneStoreModalOpen, setIsZoneStoreModalOpen] = useState(false);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const [completionRewards, setCompletionRewards] = useState<{ type: 'badge' | 'level' | 'none', value?: string | number }[]>([]);
  const [preCompletionStats, setPreCompletionStats] = useState<{ level: number, badgesCount: number } | null>(null);
  const [showStreakFreezeDialog, setShowStreakFreezeDialog] = useState(false);
  const [potionToast, setPotionToast] = useState<{ message: string, type: 'xp' | 'coin' } | null>(null);
  const exitNotifSentRef = useRef(false);

  const requestNotificationPermission = useAppState(s => s.requestNotificationPermission);
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const confirmStreakFreeze = (confirmed: boolean) => {
    if (confirmed && selectedMission) {
      onCompleteMission(selectedMission.id, { useFreeze: true });
    }
    setShowStreakFreezeDialog(false);
    handleCloseModal();
  };

  // Detect rewards after state updates from mission completion

  // Detect rewards after state updates from mission completion
  useEffect(() => {
    if (preCompletionStats && state) {
      const rewards: { type: 'badge' | 'level' | 'none', value?: string | number }[] = [];
      
      const currentLevel = state.level || 1;
      if (currentLevel > preCompletionStats.level) {
        rewards.push({ type: 'level', value: currentLevel });
      }
      
      const currentBadges = Array.isArray(state.badges) ? state.badges : [];
      if (currentBadges.length > preCompletionStats.badgesCount) {
        // Get all new badges
        const newBadges = currentBadges.slice(preCompletionStats.badgesCount);
        newBadges.forEach(badge => {
          rewards.push({ type: 'badge', value: badge });
        });
      }

      setCompletionRewards(rewards);
      setPreCompletionStats(null);
      setShowCompletionOverlay(true);
      
      // Trigger fireworks with Amber Rose theme
      try {
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#F43F5E', '#F43F5E', '#ffffff'],
            zIndex: 1000
          });
        }
      } catch (e) {
        console.error("Confetti failed to launch", e);
      }
    }
  }, [state?.level, state?.badges?.length, preCompletionStats]);

  useEffect(() => {
    if (state?.isLoggedIn) {
      const { checkAllTitles } = useAppState.getState();
      checkAllTitles();
      const interval = setInterval(() => {
        const { checkAllTitles: check } = useAppState.getState();
        check();
      }, 60000); // Check every minute for time-based titles
      return () => clearInterval(interval);
    }
  }, [state?.isLoggedIn]);

  if (!state) return null;

  const hasCompletedQuestToday = state.lastActiveDate === getTodayISO();
  const streakColorClass = hasCompletedQuestToday ? "text-orange-500" : "text-gray-400";
  const streakBgClass = hasCompletedQuestToday 
    ? "from-orange-500/10 to-orange-600/10 border-orange-500/20 shadow-orange-500/10" 
    : "from-gray-500/10 to-gray-600/10 border-gray-500/20 shadow-gray-500/10";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        sounds.playTick();
        setTimeLeft(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            return 0;
          }
          const next = prev - 1;
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Handle visibility change for exit notification
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Send immediate comfortable notification only once per session
        if (!exitNotifSentRef.current) {
          NotificationService.notifyExitImmediate(state.language);
          exitNotifSentRef.current = true;
        }
        // Always schedule delayed motivational notification when leaving
        NotificationService.scheduleExitDelayed(state.language, !!state.rivalId);
      } else {
        // Cancel delayed notification if user returns
        NotificationService.cancelExitDelayed();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.language]);

  const handleMissionComplete = (missionId: string) => {
    // Capture state before completion to detect rewards in useEffect
    setPreCompletionStats({
      level: state.level || 1,
      badgesCount: (state.badges || []).length
    });

    try {
      onCompleteMission(missionId);
      setShowCompletionOverlay(true);
      handleCloseModal();
    } catch (e) {
      console.error("Failed to complete mission", e);
      handleCloseModal();
    }
  };

  useEffect(() => {
    if (isTimerRunning && timeLeft === 0) {
      setIsTimerRunning(false);
      sounds.playTing();
    }
  }, [timeLeft, isTimerRunning]);

  const [burstLockRemaining, setBurstLockRemaining] = useState<number>(0);

  useEffect(() => {
    if (!state.burstLockUntil) {
      setBurstLockRemaining(0);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((state.burstLockUntil! - Date.now()) / 1000));
      setBurstLockRemaining(remaining);
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [state.burstLockUntil]);

  const isBurstLocked = burstLockRemaining > 0;
  const [showOverheatAnim, setShowOverheatAnim] = useState(false);
  const [overheatMotivation, setOverheatMotivation] = useState('');
  const [hasPlayedOverheatSound, setHasPlayedOverheatSound] = useState(false);

  useEffect(() => {
    if (isBurstLocked) {
      setShowOverheatAnim(true);
      if (!hasPlayedOverheatSound) {
        sounds.playOverheat();
        setHasPlayedOverheatSound(true);
      }
      if (!overheatMotivation) {
        const randomIdx = Math.floor(Math.random() * 5) + 1;
        setOverheatMotivation(t(`home.overheat.motivation.${randomIdx}`, state.language));
      }
    } else {
      setShowOverheatAnim(false);
      setOverheatMotivation('');
      setHasPlayedOverheatSound(false);
    }
  }, [isBurstLocked, state.language, hasPlayedOverheatSound, overheatMotivation]);

  const handleMissionClick = (mission: Mission) => {
    if (mission.completed) return;
    sounds.playClick();
    if (isBurstLocked) {
      sounds.playError();
      return;
    }
    setSelectedMissionId(mission.id);
    
    const duration = extractDuration(mission.text) || extractDuration(mission.originalText || '');
    // Show timer if duration is found OR hasTimer is explicitly true
    const shouldHaveTimer = mission.hasTimer === true || duration !== null;

    if (shouldHaveTimer) {
      setTimeLeft(duration || 60); // Default to 60s if duration can't be parsed but hasTimer is true
    } else {
      setTimeLeft(null);
    }
    setIsTimerRunning(false);
  };

  const formatPotionTime = (until: string | null) => {
    if (!until) return '';
    const diff = new Date(until).getTime() - Date.now();
    if (diff <= 0) return '';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const [potionTimeRemaining, setPotionTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!potionToast) return;
    
    const updateTime = () => {
      const currentState = useAppState.getState().state;
      if (!currentState) return;
      
      const until = potionToast.type === 'xp' ? currentState.doubleXpActiveUntil : currentState.doubleCoinActiveUntil;
      const time = formatPotionTime(until);
      if (time) {
        setPotionTimeRemaining(time);
      } else {
        setPotionToast(null);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [potionToast]);

  const handlePotionClick = (type: 'xp' | 'coin') => {
    sounds.playClick();
    const until = type === 'xp' ? state.doubleXpActiveUntil : state.doubleCoinActiveUntil;
    const time = formatPotionTime(until);
    if (time) {
      setPotionTimeRemaining(time);
      setPotionToast({ message: '', type }); // message is no longer used directly
    }
  };

  const [longPressProgress, setLongPressProgress] = useState(0);
  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const longPressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const startLongPress = (missionId: string) => {
    setLongPressProgress(0);
    const startTime = Date.now();
    const duration = 3000; // 3 seconds

    longPressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setLongPressProgress(progress);
      if (progress >= 100) {
        if (longPressIntervalRef.current) clearInterval(longPressIntervalRef.current);
      }
    }, 50);

    longPressTimerRef.current = setTimeout(() => {
      handleMissionComplete(missionId);
      setLongPressProgress(0);
      if (longPressIntervalRef.current) clearInterval(longPressIntervalRef.current);
    }, duration);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    if (longPressIntervalRef.current) clearInterval(longPressIntervalRef.current);
    setLongPressProgress(0);
  };

  const handleCloseModal = useCallback(() => {
    setSelectedMissionId(null);
    setIsTimerRunning(false);
    setTimeLeft(null);
    setLongPressProgress(0);
  }, []);

  const missions = state.missions || [];
  
  const { displayedMissions, completedMissionsCount, totalMissions, progressPercentage } = useMemo(() => {
    const filtered = missions.filter(m => m.type === activeTab);
    const completed = filtered.filter(m => m.completed).length;
    const total = filtered.length;
    const progress = total === 0 ? 0 : (completed / total) * 100;
    return {
      displayedMissions: filtered,
      completedMissionsCount: completed,
      totalMissions: total,
      progressPercentage: progress
    };
  }, [missions, activeTab]);

  const currentRank = useMemo(() => getRankForLevel(state.level), [state.level]);
  const unreadNotificationsCount = useMemo(() => (state.notifications || []).filter(n => !n.read).length, [state.notifications]);

  const isXpActive = useMemo(() => state.doubleXpActiveUntil && new Date(state.doubleXpActiveUntil) > new Date(), [state.doubleXpActiveUntil]);
  const isCoinActive = useMemo(() => state.doubleCoinActiveUntil && new Date(state.doubleCoinActiveUntil) > new Date(), [state.doubleCoinActiveUntil]);
  const anyItemActive = useMemo(() => isXpActive || isCoinActive, [isXpActive, isCoinActive]);

  // Clear streak freeze notification after 5 seconds
  useEffect(() => {
    if (state.streakFreezeUsedToday) {
      const timer = setTimeout(() => {
        updateState({ streakFreezeUsedToday: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.streakFreezeUsedToday, updateState]);

  useEffect(() => {
    const isMonday = new Date().getDay() === 1;
    const isZaiki = state.username?.toLowerCase().includes('zaiki') || (activeUserEmail && activeUserEmail.toLowerCase().includes('zaiki')) || state.isPremium;
    
    if (!isMonday && !isZaiki) {
      // If not Monday and not Zaiki, ensure boss is NOT active
    }
  }, [state.chosenPath, state.username, activeUserEmail, updateState]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-background overflow-y-auto no-scrollbar pb-24 relative"
    >
      {/* Neural Overheat Animation Overlay */}
      <AnimatePresence>
        {showOverheatAnim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-rose-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full" />
              <div className="relative w-32 h-32 rounded-3xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.4)]">
                <Zap className="w-16 h-16 text-rose-500 animate-pulse" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-xs w-full"
            >
              <h2 className="text-4xl font-black text-rose-500 font-display tracking-tighter uppercase mb-4 italic">
                {t('home.overheat.title', state.language)}
              </h2>
              <div className="h-1 w-24 bg-rose-500/30 mx-auto mb-6 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="h-full w-full bg-rose-500"
                />
              </div>
              <p className="text-xl text-rose-100 font-medium leading-tight mb-8">
                {overheatMotivation}
              </p>
              
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 mb-8">
                <p className="text-xs font-mono text-rose-500/60 uppercase tracking-widest mb-2">
                  System Cooldown
                </p>
                <div className="text-4xl font-mono font-black text-rose-500">
                  {burstLockRemaining}s
                </div>
              </div>

              <button
                onClick={() => setShowOverheatAnim(false)}
                className="w-full py-4 rounded-xl bg-rose-500 text-black font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
              >
                {t('home.continue', state.language)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Freeze Notification Banner - Moved below header */}
      <AnimatePresence>
        {state.streakFreezeUsedToday && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-[88px] left-4 right-4 z-40 bg-blue-500/20 border border-blue-500/50 rounded-xl p-3 flex items-center space-x-3 backdrop-blur-sm shadow-lg shadow-blue-500/10 mx-6 mt-2"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-sm font-medium text-blue-100">{t('home.streak_freeze.used', state.language)}</p>
          </motion.div>
        )}
        {isBurstLocked && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-[88px] left-4 right-4 z-40 bg-rose-500/20 border border-rose-500/50 rounded-xl p-3 flex items-center space-x-3 backdrop-blur-sm shadow-lg shadow-rose-500/10 mx-6 mt-2"
          >
            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-rose-400 animate-pulse" />
            </div>
            <p className="text-sm font-medium text-rose-100 flex-1">
              {t('home.neural_overheat', state.language, { seconds: burstLockRemaining })}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mission Completion Overlay */}
      <AnimatePresence>
        {showCompletionOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-background/98 flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="mb-8"
            >
              <div className="w-32 h-32 rounded-3xl bg-green-500/20 flex items-center justify-center border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-xs w-full"
            >
              <motion.h3 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-3xl font-black text-primary font-display tracking-tight uppercase mb-2"
              >
                {t('home.mission_complete', state.language)}
              </motion.h3>
              <p className="text-secondary mb-8">
                {t('home.mission_complete_desc', state.language)}
              </p>

              {/* Rewards Section */}
              <AnimatePresence>
                {completionRewards.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 mb-8"
                  >
                    <div className="text-[10px] font-mono text-secondary uppercase tracking-[0.2em] mb-2">
                      {t('home.rewards_earned', state.language)}
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                      {completionRewards.map((reward, idx) => (
                        <motion.div
                          key={`reward-${reward.type}-${idx}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + idx * 0.1, type: "spring" }}
                          className="bg-surface border border-white/10 rounded-2xl p-4 flex flex-col items-center min-w-[100px]"
                        >
                          {reward.type === 'level' ? (
                            <>
                              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                                <Zap className="w-5 h-5 text-accent" />
                              </div>
                              <div className="text-xs font-mono text-secondary uppercase">Level Up</div>
                              <div className="text-xl font-display font-black text-primary">LVL {reward.value}</div>
                            </>
                          ) : (
                            <>
                              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                                <Award className="w-5 h-5 text-purple-400" />
                              </div>
                              <div className="text-xs font-mono text-secondary uppercase">Badge</div>
                              <div className="text-sm font-bold text-primary truncate max-w-[80px]">
                                {String(reward.value).replace(/_/g, ' ')}
                              </div>
                            </>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button
                onClick={() => {
                  setShowCompletionOverlay(false);
                  setCompletionRewards([]);
                  handleCloseModal();
                }}
                className="w-full py-4 bg-accent text-black font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-accent/20"
              >
                {t('home.continue', state.language)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b border-white/5">
        <div className="px-3 pt-3 pb-3 flex justify-between items-start">
          <div className="flex items-center space-x-3 min-w-0 flex-1 mr-1 mt-0.5">
            <div className="relative flex-shrink-0">
              <ProfileFrame frame={state.equippedFrame} src={state.profilePicture} size="md" />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background z-10 ${currentRank.bg}`}></div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-display font-black tracking-tight truncate">ZONE</h1>
                <button 
                  onClick={() => {
                    sounds.playClick();
                    setIsIntegrityHelpOpen(true);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black border border-white/10 ${getIntegrityRating(state.integrityScore).glow}`}
                  style={{ color: getIntegrityRating(state.integrityScore).color, backgroundColor: `${getIntegrityRating(state.integrityScore).color}10` }}
                >
                  {getIntegrityRating(state.integrityScore).letter}
                </button>
              </div>
              <div className="flex items-center space-x-1.5 mt-1 min-w-0">
                <Shield className={`w-3.5 h-3.5 flex-shrink-0 ${currentRank.color}`} />
                <div className={`text-[12px] font-mono uppercase tracking-tight min-w-0 flex-1 flex items-center ${currentRank.color}`}>
                  <span className="truncate font-bold">{currentRank.name}</span>
                  <span className="mx-1 flex-shrink-0 opacity-40">•</span>
                  <span className="flex-shrink-0 whitespace-nowrap font-bold">LVL {state.level}</span>
                </div>
              </div>
              {state.equippedTitle && (() => {
                const titleDef = TITLES.find(t => t.id === state.equippedTitle);
                return (
                  <div className={`text-[9px] font-mono uppercase tracking-tighter mt-1 inline-block truncate max-w-full ${titleDef?.specialColor || 'text-accent/80'}`}>
                    {titleDef?.name[state.language] || state.equippedTitle}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2 flex-shrink-0">
            {/* Top Row: XP and Notification */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 bg-surface px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
                <span className="text-[10px] font-bold text-accent tracking-tight">{state.xp} XP</span>
              </div>
              <button 
                onClick={() => {
                  sounds.playClick();
                  setIsNotificationCenterOpen(true);
                }}
                className="p-1.5 bg-surface rounded-full border border-white/10 hover:bg-white/10 transition-colors relative"
              >
                <Bell className="w-4 h-4 text-secondary" />
                {unreadNotificationsCount > 0 && (
                  <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-rose-500 rounded-full border border-surface"></div>
                )}
              </button>
            </div>

            {/* Bottom Row: Streak and Streak Freeze */}
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 bg-gradient-to-r ${streakBgClass} px-2.5 py-1 rounded-full border shadow-sm`}>
                <Flame className={`w-3.5 h-3.5 ${streakColorClass}`} />
                <span className={`text-xs font-bold ${streakColorClass}`}>{state.streak || 0}</span>
              </div>
              {(state.streakFreezes || 0) > 0 && (
                <div className="flex items-center space-x-1 bg-surface px-2 py-1 rounded-full border border-white/10 shadow-sm" title="Streak Freeze">
                  <Shield className="w-3 h-3 text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-400">{state.streakFreezes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Potions Row - Only shown if there are active potions or elite boosts */}
        {( isXpActive || isCoinActive || state.isPremium ) && (
          <div className="px-4 pb-3">
            <div className="flex items-center justify-center space-x-3 bg-surface/30 px-4 py-1.5 rounded-xl border border-white/5 shadow-sm w-full overflow-x-auto no-scrollbar">
              {isXpActive && (
                <button 
                  onClick={() => handlePotionClick('xp')}
                  className="flex items-center space-x-1 shrink-0 hover:bg-white/5 px-2 py-0.5 rounded-lg transition-colors" 
                  title="Double XP Active"
                >
                  <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span className="text-xs font-bold text-purple-400">2x XP</span>
                </button>
              )}

              {isCoinActive && (
                <button 
                  onClick={() => handlePotionClick('coin')}
                  className="flex items-center space-x-1 shrink-0 hover:bg-white/5 px-2 py-0.5 rounded-lg transition-colors" 
                  title="Double Coin Active"
                >
                  <ZoneCoinIcon className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                  <span className="text-xs font-bold text-yellow-400">2x ZC</span>
                </button>
              )}

              {state.isPremium && (
                <div className="flex items-center space-x-2 shrink-0" title="Elite Boosts Active">
                  <span className="text-[10px] font-black text-emerald-400 tracking-tighter">+50% XP</span>
                  <span className="text-[10px] font-black text-rose-400 tracking-tighter">+25% ZC</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 space-y-8">
        <BossEncounter />
        
        {/* Potion Modal Overlay */}
        <AnimatePresence>
          {potionToast && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[600] flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setPotionToast(null)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-xs bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl text-center"
              >
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center border ${
                  potionToast.type === 'xp' ? 'bg-purple-500/20 border-purple-500/30' : 'bg-yellow-500/20 border-yellow-500/30'
                }`}>
                  {potionToast.type === 'xp' ? (
                    <Zap className="w-8 h-8 text-purple-400 animate-pulse" />
                  ) : (
                    <ZoneCoinIcon className="w-8 h-8 text-yellow-400 animate-pulse" />
                  )}
                </div>
                
                <h3 className="text-xl font-black text-primary font-display tracking-tight uppercase mb-2">
                  {potionToast.type === 'xp' ? '2x XP Boost' : '2x Coin Boost'}
                </h3>
                
                <div className="bg-background/50 rounded-2xl p-4 border border-white/5 mb-6">
                  <p className="text-secondary text-xs uppercase tracking-widest font-bold mb-1">
                    {state.language === 'id' ? 'Sisa Waktu' : 'Time Remaining'}
                  </p>
                  <p className={`text-2xl font-mono font-bold ${potionToast.type === 'xp' ? 'text-purple-400' : 'text-yellow-400'}`}>
                    {potionTimeRemaining}
                  </p>
                </div>

                <button
                  onClick={() => setPotionToast(null)}
                  className="w-full py-4 rounded-2xl bg-primary text-background font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {state.language === 'id' ? 'Mantap' : 'Got it'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <BossBattle onMissionClick={handleMissionClick} />
        
        {/* Missions */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-display font-bold">{t('home.title', state.language)}</h3>
            <div className="flex items-center gap-3">
              {state.chosenPath === 'OTHER' && (
                <button 
                  onClick={() => {
                    sounds.playClick();
                    setIsCustomMissionsModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-surface border border-white/10 hover:bg-white/10 transition-colors text-accent"
                  title={t('home.manage_custom_missions', state.language)}
                >
                  <Wand2 className="w-4 h-4" />
                </button>
              )}
              {activeTab !== 'REGULAR' && (
                <span className="text-sm text-secondary font-mono">{completedMissionsCount}/{totalMissions}</span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-surface rounded-xl p-1 mb-6 border border-white/5 overflow-x-auto no-scrollbar">
            {['REGULAR', 'DAILY', 'WEEKLY', 'ROUTINE'].filter(tab => tab !== 'ROUTINE' || state.chosenPath === 'OTHER').map((tab) => (
              <button
                key={tab}
                id={`tab-${tab.toLowerCase()}`}
                onClick={() => {
                  sounds.playClick();
                  setActiveTab(tab as MissionType);
                }}
                className={`flex-1 min-w-[70px] py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-colors ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-accent to-rose-600 text-white shadow-md' 
                    : 'text-secondary hover:text-primary'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>{t(`home.tab.${tab.toLowerCase()}`, state.language)}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Progress Bar */}
          {activeTab !== 'REGULAR' && (
            <div className="h-1.5 w-full bg-surface rounded-full mb-6 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-accent to-rose-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          )}

          <div className="space-y-3">
            {displayedMissions.length === 0 ? (
              <div className="text-center py-12 px-4 bg-surface/50 rounded-2xl border border-white/5">
                <Wand2 className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
                <h4 className="text-lg font-bold mb-2">
                  {t('home.no_missions_yet', state.language)}
                </h4>
                <p className="text-sm text-secondary mb-6 max-w-[250px] mx-auto">
                  {t('home.add_custom_missions', state.language).replace('{tab}', activeTab.toLowerCase())}
                </p>
                <button
                  onClick={() => setIsCustomMissionsModalOpen(true)}
                  className="px-6 py-3 bg-accent text-background rounded-xl font-bold text-sm hover:bg-accent/90 transition-colors"
                >
                  {t('home.add_missions', state.language)}
                </button>
              </div>
            ) : (
              displayedMissions.map((mission, index) => {
                const baseXpReward = mission.type === 'WEEKLY' ? 200 : mission.type === 'DAILY' ? 100 : 50;
                const baseCoinReward = mission.type === 'WEEKLY' ? 100 : mission.type === 'DAILY' ? 50 : 20;
                
                const isDoubleXpActive = state.doubleXpActiveUntil && new Date(state.doubleXpActiveUntil) > new Date();
                const isDoubleCoinActive = state.doubleCoinActiveUntil && new Date(state.doubleCoinActiveUntil) > new Date();
                
                let xpReward = isDoubleXpActive ? baseXpReward * 2 : baseXpReward;
                let coinReward = isDoubleCoinActive ? baseCoinReward * 2 : baseCoinReward;
                
                if (state.isPremium) {
                  xpReward = Math.floor(xpReward * 1.5);
                }
                
                const isRoutine = activeTab === 'ROUTINE';
                const firstUncompletedIndex = displayedMissions.findIndex(m => !m.completed);
                const isLocked = isRoutine && !mission.completed && firstUncompletedIndex !== -1 && index > firstUncompletedIndex;

                return (
                  <MissionCard 
                    key={`${mission.id || mission.text}-${index}`}
                    mission={{...mission, isLocked}}
                    index={index}
                    activeTab={activeTab}
                    state={state}
                    handleMissionClick={handleMissionClick}
                    xpReward={xpReward}
                    isDoubleXpActive={!!isDoubleXpActive}
                    isDoubleCoinActive={!!isDoubleCoinActive}
                    coinReward={coinReward}
                  />
                );
              })
            )}
          </div>
        </section>
      </div>

      <CustomMissionsModal
        isOpen={isCustomMissionsModalOpen}
        onClose={() => setIsCustomMissionsModalOpen(false)}
        state={state}
        addCustomMission={addCustomMission}
        removeCustomMission={removeCustomMission}
        initialTab={activeTab}
        isFlashSale={isFlashSale}
      />

      <NotificationCenter 
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />

      <ZoneCoinInfoModal
        isOpen={isCoinInfoModalOpen}
        onClose={() => setIsCoinInfoModalOpen(false)}
        state={state}
      />

      <ZoneStoreModal
        isOpen={isZoneStoreModalOpen}
        onClose={() => setIsZoneStoreModalOpen(false)}
        state={state}
        ovr={state ? calculateOVR(state).ovr : 44}
        updateState={updateState}
      />

      <AnimatePresence>
        {showStreakFreezeDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Flame className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">{t('home.streak_freeze.title', state.language)}</h3>
              <p className="text-primary/70 text-center mb-6">
                {t('home.streak_freeze.desc', state.language)}
              </p>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => confirmStreakFreeze(true)}
                  className="w-full py-3 rounded-xl font-bold bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  {t('home.streak_freeze.use', state.language)}
                </button>
                <button
                  onClick={() => confirmStreakFreeze(false)}
                  className="w-full py-3 rounded-xl font-bold bg-white/5 text-primary hover:bg-white/10 transition-colors"
                >
                  {t('home.streak_freeze.cancel', state.language)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <IntegrityExplanationModal 
        isOpen={isIntegrityHelpOpen} 
        onClose={() => setIsIntegrityHelpOpen(false)} 
        language={state.language} 
      />

      {/* Mission Action Modal */}
      <AnimatePresence>
        {selectedMission && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[500] bg-background flex flex-col"
          >
            <button 
              onClick={() => setSelectedMissionId(null)}
              className="absolute top-6 right-6 z-[510] p-2 bg-surface/80 backdrop-blur-sm border border-white/10 rounded-full text-secondary hover:text-primary transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex-1 overflow-y-auto px-6 py-12">
              <div className="min-h-full flex flex-col justify-center max-w-md mx-auto w-full py-8">
                <h2 className="text-3xl sm:text-4xl font-display font-black mb-6 text-center leading-tight tracking-tight">
                  {selectedMission.text}
                </h2>

              {(() => {
                const isBossTask = selectedMission.id.startsWith('boss-task-');
                if (!isBossTask) return null;
                
                const details = getMissionDetails(selectedMission.originalText || selectedMission.text);
                if (!details) return null;
                return (
                  <div className="mb-8 p-4 bg-surface/50 border border-white/5 rounded-2xl overflow-hidden">
                    <p className="text-sm text-primary/80 mb-4 leading-relaxed italic">
                      {details.description[state.language] || details.description.en}
                    </p>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-accent/60">
                        {state.language === 'id' ? 'TIPS NEURAL' : 'NEURAL TIPS'}
                      </h4>
                      <ul className="space-y-1.5">
                        {(details.tips[state.language] || details.tips.en).map((tip, i) => (
                          <li key={i} className="text-xs text-secondary flex items-start">
                            <span className="text-accent mr-2 mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}

              {timeLeft !== null ? (
                <div className="flex flex-col items-center mb-12">
                  <div className="text-7xl sm:text-8xl font-mono font-black text-accent mb-4 tracking-tighter">
                    {timeLeft >= 3600 ? (
                      <>
                        {Math.floor(timeLeft / 3600)}:
                        {Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')}:
                        {(timeLeft % 60).toString().padStart(2, '0')}
                      </>
                    ) : (
                      <>
                        {Math.floor(timeLeft / 60)}:
                        {(timeLeft % 60).toString().padStart(2, '0')}
                      </>
                    )}
                  </div>
                  <p className="text-xl text-secondary mb-8 font-medium">
                    {isTimerRunning ? t('home.timer.keep_going', state.language) : t('home.timer.paused', state.language)}
                  </p>
                  
                  <div className="flex gap-4 w-full">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="flex-1 py-5 rounded-2xl font-bold text-lg bg-primary text-background shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                    >
                      {isTimerRunning ? t('home.timer.pause', state.language) : t('home.timer.resume', state.language)}
                    </button>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        const duration = extractDuration(selectedMission.text) || extractDuration(selectedMission.originalText) || 60;
                        setTimeLeft(duration);
                        setIsTimerRunning(false);
                      }}
                      className="flex-1 py-5 rounded-2xl font-bold text-lg bg-surface text-secondary border border-white/10 transition-colors"
                    >
                      {t('home.timer.reset', state.language)}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {selectedMission.goal !== undefined && (
                    <div className="w-full mb-12">
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-xs font-mono font-bold text-secondary uppercase tracking-widest opacity-50">Neural Progress</span>
                        <span className="text-3xl font-display font-black text-rose-500">
                          {selectedMission.progress || 0}
                          <span className="text-xl text-secondary opacity-30 mx-1">/</span>
                          {selectedMission.goal}
                        </span>
                      </div>
                      <div className={`h-4 w-full bg-surface rounded-full overflow-hidden border mb-8 relative transition-all duration-500 ${
                        selectedMission.progress! >= selectedMission.goal! 
                          ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
                          : 'border-white/5'
                      }`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((selectedMission.progress || 0) / selectedMission.goal) * 100}%` }}
                          className={`h-full transition-colors duration-500 ${
                            selectedMission.progress! >= selectedMission.goal! ? 'bg-rose-500' : 'bg-rose-500/80'
                          }`}
                          style={{ 
                            boxShadow: selectedMission.progress! >= selectedMission.goal! 
                              ? '0 0 20px rgba(244,63,94,0.6)' 
                              : '0 0 10px rgba(244,63,94,0.2)' 
                          }}
                          transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        />
                        {selectedMission.progress! >= selectedMission.goal! && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-white/20"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 5, 10].map(inc => (
                          <button
                            key={inc}
                            onClick={() => updateMissionProgress(selectedMission.id, inc)}
                            className="group relative py-4 rounded-2xl bg-surface border border-white/10 font-mono font-black text-xl text-secondary hover:text-rose-500 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all active:scale-95"
                          >
                            <span className="relative z-10">+{inc}</span>
                            <div className="absolute inset-0 rounded-2xl bg-rose-500/0 group-hover:bg-rose-500/5 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div className="space-y-4 mt-auto">
                <button
                  onMouseDown={() => !isBurstLocked && (timeLeft === null || timeLeft === 0) && (selectedMission.goal === undefined || selectedMission.progress === selectedMission.goal) && startLongPress(selectedMission.id)}
                  onMouseUp={cancelLongPress}
                  onMouseLeave={cancelLongPress}
                  onTouchStart={() => !isBurstLocked && (timeLeft === null || timeLeft === 0) && (selectedMission.goal === undefined || selectedMission.progress === selectedMission.goal) && startLongPress(selectedMission.id)}
                  onTouchEnd={cancelLongPress}
                  disabled={isBurstLocked || (timeLeft !== null && timeLeft > 0) || (selectedMission.goal !== undefined && selectedMission.progress! < selectedMission.goal!)}
                  className={`relative w-full py-5 rounded-2xl font-bold text-lg overflow-hidden transition-all shadow-xl ${
                    isBurstLocked || (timeLeft !== null && timeLeft > 0) || (selectedMission.goal !== undefined && selectedMission.progress! < selectedMission.goal!)
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-primary text-background shadow-primary/20 active:scale-[0.98] shadow-white/10'
                  } shadow-white/10`}
                >
                  <motion.div 
                    className="absolute inset-0 bg-accent/40"
                    style={{ width: `${longPressProgress}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                  <span className="relative z-10">
                    {isBurstLocked 
                      ? (state.language === 'id' ? 'Neural Overheat' : 'Neural Overheat')
                      : longPressProgress > 0 
                        ? (state.language === 'id' ? 'Tahan...' : 'Holding...') 
                        : (timeLeft === 0 || (selectedMission.goal !== undefined && selectedMission.progress === selectedMission.goal)
                            ? (state.language === 'id' ? 'Selesaikan Misi' : 'Complete Mission')
                            : t('home.mission.start_complete', state.language)) + (state.language === 'id' ? ' (Tahan 3d)' : ' (Hold 3s)')}
                  </span>
                </button>
                
                <button
                  onClick={() => {
                    onReplaceMission(selectedMission.id);
                    handleCloseModal();
                  }}
                  className="w-full py-5 rounded-2xl font-bold text-lg bg-surface text-secondary border border-white/10 hover:bg-surface-hover hover:text-primary transition-colors"
                >
                  {t('home.cant_do_it', state.language)}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="w-full py-5 rounded-2xl font-bold text-lg text-secondary hover:text-primary transition-colors"
                >
                  {t('home.cancel', state.language)}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default React.memo(HomeScreen);
