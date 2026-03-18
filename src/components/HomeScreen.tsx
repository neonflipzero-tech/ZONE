import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { UserState, MissionType, getRankForLevel, Mission, useAppState, TITLES } from '../store';
import { CheckCircle2, Circle, Flame, Trophy, User, Shield, Timer, Wand2, Bell, Zap, Skull, Swords, X, ArrowLeft, Target, Mountain, Star } from 'lucide-react';
import { ZoneCoinIcon } from './ZoneCoinIcon';
import { t } from '../utils/translations';
import { sounds } from '../utils/sounds';
import ProfileFrame from './ProfileFrame';
import CustomMissionsModal from './CustomMissionsModal';
import NotificationCenter from './NotificationCenter';
import ZoneCoinInfoModal from './ZoneCoinInfoModal';
import ZoneStoreModal from './ZoneStoreModal';
import { calculateOVR } from '../store';

interface HomeScreenProps {
  state: UserState;
  onCompleteMission: (id: string, options?: { useFreeze?: boolean }) => void;
  checkStreakFreezeNeeded: () => boolean;
  onReplaceMission: (id: string) => void;
  addCustomMission: (type: MissionType, text: string) => void;
  removeCustomMission: (type: MissionType, text: string) => void;
}

function extractDuration(text: string): number | null {
  // Hours: hours, hour, jam, jm, h
  const hoursMatch = text.match(/(\d+)\s*(hours?|jam|jm|h)/i);
  if (hoursMatch) return parseInt(hoursMatch[1], 10) * 3600;

  // Minutes: minutes, minute, mins, min, menit, mnt, minite, mnt, m
  const minutesMatch = text.match(/(\d+)\s*(minutes?|mins?|menit|mnt|minite|mnt|m)/i);
  if (minutesMatch) return parseInt(minutesMatch[1], 10) * 60;

  // Seconds: seconds, second, secs, sec, detik, dtk, s
  const secondsMatch = text.match(/(\d+)\s*(seconds?|secs?|detik|dtk|s)/i);
  if (secondsMatch) return parseInt(secondsMatch[1], 10);
  
  return null;
}

export default function HomeScreen({ state, onCompleteMission, checkStreakFreezeNeeded, onReplaceMission, addCustomMission, removeCustomMission }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<MissionType>('REGULAR');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCustomMissionsModalOpen, setIsCustomMissionsModalOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isCoinInfoModalOpen, setIsCoinInfoModalOpen] = useState(false);
  const [isZoneStoreModalOpen, setIsZoneStoreModalOpen] = useState(false);
  const [showVictoryAnimation, setShowVictoryAnimation] = useState(false);
  const [showStreakFreezeDialog, setShowStreakFreezeDialog] = useState(false);
  const [pendingMissionId, setPendingMissionId] = useState<string | null>(null);
  const { updateState } = useAppState();

  const hasCompletedQuestToday = state.lastActiveDate === new Date().toDateString();
  const streakColorClass = hasCompletedQuestToday ? "text-orange-500" : "text-gray-400";
  const streakBgClass = hasCompletedQuestToday 
    ? "from-orange-500/10 to-rose-500/10 border-orange-500/20 shadow-orange-500/10" 
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
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]); // Only depend on isTimerRunning to avoid clearing interval on every tick or parent re-render

  const handleMissionComplete = (missionId: string) => {
    if (checkStreakFreezeNeeded()) {
      setPendingMissionId(missionId);
      setShowStreakFreezeDialog(true);
    } else {
      onCompleteMission(missionId);
      handleCloseModal();
    }
  };

  const confirmStreakFreeze = (useFreeze: boolean) => {
    if (pendingMissionId) {
      onCompleteMission(pendingMissionId, { useFreeze });
      setPendingMissionId(null);
    }
    setShowStreakFreezeDialog(false);
    handleCloseModal();
  };

  useEffect(() => {
    if (isTimerRunning && timeLeft === 0) {
      setIsTimerRunning(false);
      if (selectedMission) {
        handleMissionComplete(selectedMission.id);
      }
    }
  }, [timeLeft, isTimerRunning, selectedMission, onCompleteMission]);

  const handleMissionClick = (mission: Mission) => {
    if (mission.completed) return;
    setSelectedMission(mission);
    const duration = extractDuration(mission.text);
    if (duration) {
      setTimeLeft(duration);
    } else {
      setTimeLeft(null);
    }
    setIsTimerRunning(false);
  };

  const handleCloseModal = () => {
    setSelectedMission(null);
    setIsTimerRunning(false);
    setTimeLeft(null);
  };

  const missions = state.missions || [];
  const displayedMissions = missions.filter(m => m.type === activeTab);
  const completedMissionsCount = displayedMissions.filter(m => m.completed).length;
  const totalMissions = displayedMissions.length;
  const progressPercentage = totalMissions === 0 ? 0 : (completedMissionsCount / totalMissions) * 100;

  const currentRank = getRankForLevel(state.level);
  const unreadNotificationsCount = (state.notifications || []).filter(n => !n.read).length;

  const isXpActive = state.doubleXpActiveUntil && new Date(state.doubleXpActiveUntil) > new Date();
  const isCoinActive = state.doubleCoinActiveUntil && new Date(state.doubleCoinActiveUntil) > new Date();
  const anyItemActive = isXpActive || isCoinActive;

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
    if (isMonday) {
      if (state.bossState && !state.bossState.isActive && state.chosenPath) {
        // Use setTimeout to avoid updating state during render
        setTimeout(() => {
          updateState({
            bossState: {
              ...state.bossState!,
              isActive: true,
              status: 'pending_choice',
              lastEncounterDate: null
            }
          });
        }, 0);
      }
    } else {
      // If not Monday, ensure boss is NOT active
      if (state.bossState?.isActive) {
        setTimeout(() => {
          updateState({
            bossState: {
              ...state.bossState!,
              isActive: false
            }
          });
        }, 0);
      }
    }
  }, [state.bossState?.isActive, state.chosenPath, updateState]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-background overflow-y-auto no-scrollbar pb-24 relative"
    >
      {/* Streak Freeze Notification Banner - Moved below header */}
      <AnimatePresence>
        {state.streakFreezeUsedToday && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-[88px] left-4 right-4 z-40 bg-blue-500/20 border border-blue-500/50 rounded-xl p-3 flex items-center space-x-3 backdrop-blur-md shadow-lg shadow-blue-500/10 mx-6 mt-2"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-sm font-medium text-blue-100">{t('home.streak_freeze.used', state.language)}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={`px-4 ${anyItemActive ? 'pt-10' : 'pt-14'} pb-4 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-30 border-b border-white/5`}>
        <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
          <div className="relative flex-shrink-0">
            <ProfileFrame frame={state.equippedFrame} src={state.profilePicture} size="sm" />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-background z-10 ${currentRank.bg}`}></div>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-display font-black tracking-tight truncate">ZONE</h1>
            <div className="flex items-center space-x-1 mt-0.5">
              <Shield className={`w-3 h-3 flex-shrink-0 ${currentRank.color}`} />
              <p className={`text-[9px] font-mono uppercase tracking-wider truncate ${currentRank.color}`}>{currentRank.name} • Lvl {state.level}</p>
            </div>
            {state.equippedTitle && (() => {
              const titleDef = TITLES.find(t => t.id === state.equippedTitle);
              return (
                <div className={`text-[8px] font-mono uppercase tracking-widest mt-0.5 inline-block truncate max-w-full ${titleDef?.specialColor || 'text-accent/80'}`}>
                  {titleDef?.name[state.language] || state.equippedTitle}
                </div>
              );
            })()}
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <div className="flex flex-col items-end gap-2">
            {/* Top Row: XP and Notification */}
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-1.5 bg-surface px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
                <span className="text-[10px] font-bold text-accent tracking-tight">{state.xp} XP</span>
              </div>
              <button 
                onClick={() => setIsNotificationCenterOpen(true)}
                className="p-1.5 bg-surface rounded-full border border-white/10 hover:bg-white/10 transition-colors relative"
              >
                <Bell className="w-4 h-4 text-secondary" />
                {unreadNotificationsCount > 0 && (
                  <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></div>
                )}
              </button>
            </div>

            {/* Bottom Row: Streak | Freeze | 2x */}
            <div className={`flex items-center space-x-2 bg-gradient-to-r ${streakBgClass} px-3 py-1.5 rounded-full border shadow-sm`}>
              <div className="flex items-center space-x-1">
                <Flame className={`w-3.5 h-3.5 ${streakColorClass}`} />
                <span className={`text-xs font-bold ${streakColorClass}`}>{state.streak || 0}</span>
              </div>
              
              {(state.streakFreezes || 0) > 0 && (
                <div className="flex items-center space-x-1 pl-2 border-l border-white/10" title="Streak Freeze">
                  <Shield className="w-3 h-3 text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-400">{state.streakFreezes}</span>
                </div>
              )}

              {anyItemActive && (
                <div className="flex items-center space-x-1 pl-2 border-l border-white/10" title="2x Boost Active">
                  <Zap className="w-3 h-3 text-purple-400" />
                  <span className="text-[10px] font-bold text-purple-400">2x</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Missions */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-display font-bold">{t('home.title', state.language)}</h3>
            <div className="flex items-center gap-3">
              {state.chosenPath === 'OTHER' && (
                <button 
                  onClick={() => setIsCustomMissionsModalOpen(true)}
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
            {(() => {
              const baseTabs = state.chosenPath === 'OTHER' 
                ? ['REGULAR', 'DAILY', 'WEEKLY', 'ROUTINE'] as MissionType[]
                : ['REGULAR', 'DAILY', 'WEEKLY'] as MissionType[];
              
              const isMonday = new Date().getDay() === 1;
              if (isMonday && (state.bossState?.isActive || state.bossState?.status === 'pending_choice')) {
                return [...baseTabs, 'BOSS' as MissionType];
              }
              return baseTabs;
            })().map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[70px] py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-colors ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-accent to-rose-600 text-white shadow-md' 
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {tab === 'BOSS' ? 'BOSS' : t(`home.tab.${tab.toLowerCase()}`, state.language)}
              </button>
            ))}
          </div>
          
          {/* Progress Bar */}
          {activeTab !== 'BOSS' && (
            <div className="h-1.5 w-full bg-surface rounded-full mb-6 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-accent to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          )}

          <div className="space-y-3">
            {activeTab === 'BOSS' ? null : displayedMissions.length === 0 ? (
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
                const isDoubleXpActive = state.doubleXpActiveUntil && new Date(state.doubleXpActiveUntil) > new Date();
                const xpReward = isDoubleXpActive ? baseXpReward * 2 : baseXpReward;
                
                // For ROUTINE missions, lock them if the previous one isn't completed
                const isRoutine = activeTab === 'ROUTINE';
                const firstUncompletedIndex = displayedMissions.findIndex(m => !m.completed);
                const isLocked = isRoutine && !mission.completed && firstUncompletedIndex !== -1 && index > firstUncompletedIndex;

                return (
                  <motion.div
                    key={`${mission.id || mission.text}-${index}`}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => !isLocked && handleMissionClick(mission)}
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
                      <span className={`font-medium block truncate ${mission.completed ? 'line-through text-secondary' : 'text-primary'}`}>
                        {mission.text}
                      </span>
                      {isLocked && (
                        <span className="text-[10px] font-mono text-rose-500">
                          {t('home.locked_mission', state.language)}
                        </span>
                      )}
                    </div>
                    {!mission.completed && !isLocked && (
                      <span className="ml-auto text-xs font-mono text-accent">+{xpReward} XP</span>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Mission Action Modal */}
      <AnimatePresence>
        {selectedMission && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-background flex flex-col px-6 py-12"
          >
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
              {timeLeft !== null ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-7xl sm:text-8xl font-mono font-black text-accent mb-8 tracking-tighter">
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
                  <p className="text-xl text-secondary mb-12 font-medium">
                    {isTimerRunning ? t('home.timer.keep_going', state.language) : t('home.timer.paused', state.language)}
                  </p>
                  
                  <div className="flex flex-col w-full space-y-4">
                    {isTimerRunning ? (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setIsTimerRunning(false);
                        }}
                        className="w-full py-5 rounded-2xl font-bold text-lg border-2 border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        {t('home.timer.stop', state.language)}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          sounds.playTick();
                          setIsTimerRunning(true);
                        }}
                        className="w-full py-5 rounded-2xl font-bold text-lg bg-primary text-background hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Timer className="w-6 h-6" />
                        <span>{timeLeft === extractDuration(selectedMission!.text) ? t('home.timer.start', state.language) : t('home.timer.resume', state.language)}</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setIsTimerRunning(false);
                        setTimeLeft(extractDuration(selectedMission!.text));
                      }}
                      className="w-full py-5 rounded-2xl font-bold text-lg bg-surface text-secondary border border-white/10 hover:bg-surface-hover hover:text-primary transition-colors"
                    >
                      {t('home.timer.reset', state.language)}
                    </button>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        onReplaceMission(selectedMission!.id);
                        handleCloseModal();
                      }}
                      className="w-full py-5 rounded-2xl font-bold text-lg bg-surface text-secondary border border-white/10 hover:bg-surface-hover hover:text-primary transition-colors"
                    >
                      {t('home.cant_do_it', state.language)}
                    </button>

                    <button
                      onClick={() => {
                        sounds.playCloseModal();
                        handleCloseModal();
                      }}
                      className="w-full py-5 rounded-2xl font-bold text-lg text-secondary hover:text-primary transition-colors"
                    >
                      {t('home.cancel', state.language)}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center space-x-3 mb-8">
                    <span className="px-4 py-2 bg-white/5 rounded-full text-sm font-mono text-secondary uppercase tracking-wider border border-white/10">
                      {selectedMission.type} MISSION
                    </span>
                    <span className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-mono font-bold border border-accent/20">
                      +{(() => {
                        const baseXp = selectedMission.type === 'WEEKLY' ? 200 : selectedMission.type === 'DAILY' ? 100 : 50;
                        const isDoubleXpActive = state.doubleXpActiveUntil && new Date(state.doubleXpActiveUntil) > new Date();
                        return isDoubleXpActive ? baseXp * 2 : baseXp;
                      })()} XP
                    </span>
                  </div>
                  
                  <h2 className="text-4xl sm:text-5xl font-display font-black mb-12 text-center leading-tight tracking-tight">
                    {selectedMission.text}
                  </h2>
                  
                  <div className="space-y-4 mt-auto">
                    <button
                      onClick={() => handleMissionComplete(selectedMission.id)}
                      className="w-full py-5 rounded-2xl font-bold text-lg bg-primary text-background hover:bg-gray-200 transition-colors shadow-xl shadow-primary/20"
                    >
                      {t('home.mission.start_complete', state.language)}
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
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeTab === 'BOSS' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 bg-black overflow-y-auto flex flex-col"
          >
            {/* Header with Close Button */}
            <div className="p-6 flex items-center sticky top-0 bg-black/80 backdrop-blur-md z-20 border-b border-white/5">
              <button 
                onClick={() => setActiveTab('REGULAR')} 
                className="p-2 bg-surface rounded-full hover:bg-surface-hover transition-colors border border-white/10 mr-4"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <h2 className="text-xl font-display font-bold text-rose-500 tracking-wider">
                {state.language === 'id' ? 'LAWAN BOS' : 'BOSS BATTLE'}
              </h2>
            </div>

            {/* Boss Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
              <div className="w-full max-w-2xl text-center py-12 px-6 bg-surface/50 rounded-3xl border border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.05)] relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-rose-500/10 blur-[60px] pointer-events-none" />
                
                <AnimatePresence>
                  {showVictoryAnimation && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-rose-500/30 blur-3xl rounded-full" />
                        <Trophy className="w-32 h-32 text-rose-400 drop-shadow-[0_0_30px_rgba(244,63,94,0.8)] mb-6 relative z-10" />
                      </motion.div>
                      <h2 className="text-4xl font-display font-black text-rose-400 mb-2 uppercase tracking-widest">
                        {state.language === 'id' ? 'Bos Dikalahkan!' : 'Boss Defeated!'}
                      </h2>
                      <p className="text-xl text-rose-200/80 font-bold">+500 Zone Coins</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {state.bossState?.status === 'pending_choice' ? (
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20">
                      <Swords className="w-10 h-10 text-rose-500" />
                    </div>
                    <h4 className="text-3xl font-display font-black mb-3 text-rose-500 tracking-tight">
                      {state.language === 'id' ? 'PILIH BOS' : 'CHOOSE BOSS'}
                    </h4>
                    <p className="text-base text-secondary mb-10 max-w-sm mx-auto">
                      {state.language === 'id' ? 'Pilih bos mingguanmu. Kalahkan sebelum hari Selasa!' : 'Choose your weekly boss. Defeat it before Tuesday!'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {['Productivity', 'Fitness', 'Learning', 'Mindfulness'].map(topic => (
                        <button
                          key={topic}
                          onClick={() => {
                            const bossTaskTemplates: Record<string, string[]> = {
                              'Productivity': [
                                'Clear your email inbox completely',
                                'Plan your entire week ahead',
                                'Complete a 2-hour deep work session',
                                'Organize your physical workspace',
                                'Review and update all your goals'
                              ],
                              'Fitness': [
                                'Do a 30-minute intense workout',
                                'Hit 10,000 steps today',
                                'Drink 3 liters of water',
                                'Do 50 push-ups',
                                'Stretch for 15 minutes'
                              ],
                              'Learning': [
                                'Read 2 chapters of a book',
                                'Watch an educational documentary',
                                'Practice a new skill for 1 hour',
                                'Listen to an informative podcast',
                                'Write a summary of what you learned'
                              ],
                              'Mindfulness': [
                                'Meditate for 20 minutes',
                                'Write down 5 things you are grateful for',
                                'Take a 30-minute walk without your phone',
                                'Do a digital detox for 4 hours',
                                'Practice deep breathing for 10 minutes'
                              ]
                            };
                            
                            const tasks = bossTaskTemplates[topic] || bossTaskTemplates['Productivity'];
                            
                            // Initialize boss
                            updateState({
                              bossState: {
                                ...state.bossState!,
                                isActive: true,
                                status: 'active',
                                topic,
                                hp: 5,
                                maxHp: 5,
                                tasks: tasks.map((text, i) => ({
                                  id: `boss-task-${Date.now()}-${i}`,
                                  text,
                                  completed: false,
                                  damage: 1
                                }))
                              }
                            });
                          }}
                          className="group p-6 rounded-2xl bg-surface border border-white/5 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all duration-300 flex flex-col items-center justify-center space-y-3"
                        >
                          <span className="text-lg font-bold text-primary group-hover:text-rose-400 transition-colors">{topic}</span>
                          <span className="text-sm font-medium text-secondary group-hover:text-rose-500/70 transition-colors">
                            {state.language === 'id' ? 'Lawan Bos' : 'Fight Boss'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-2xl font-display font-bold text-rose-500 uppercase tracking-tight">
                          {state.bossState?.topic} {state.language === 'id' ? 'BOS' : 'BOSS'}
                        </h4>
                        <p className="text-sm text-secondary">
                          {state.language === 'id' ? 'Kalahkan bos mingguan sebelum hari Selasa!' : 'Defeat the weekly boss before Tuesday!'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-rose-500 block mb-1">HP</span>
                        <span className="text-xl font-bold text-white">{state.bossState?.hp} / {state.bossState?.maxHp}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {state.bossState?.tasks.map((task, index) => (
                        <motion.div
                          key={`${task.id || index}-${index}`}
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => {
                            if (task.completed) return;
                            const newTasks = [...state.bossState!.tasks];
                            newTasks[index].completed = true;
                            const newHp = Math.max(0, (state.bossState?.hp || 0) - task.damage);
                            
                            if (newHp === 0) {
                              // Boss defeated
                              setShowVictoryAnimation(true);
                              
                              setTimeout(() => {
                                updateState({
                                  bossState: {
                                    ...state.bossState!,
                                    hp: 0,
                                    tasks: newTasks,
                                    status: 'defeated',
                                    isActive: false,
                                    lastEncounterDate: (() => {
                                      const d = new Date();
                                      d.setHours(0, 0, 0, 0);
                                      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
                                      const yearStart = new Date(d.getFullYear(), 0, 1);
                                      const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
                                      return `${d.getFullYear()}-W${weekNo}`;
                                    })()
                                  },
                                  zoneCoins: (state.zoneCoins || 0) + 500,
                                  notifications: [
                                    {
                                      id: `boss-defeated-${Date.now()}-${Math.random()}`,
                                      title: state.language === 'id' ? 'Bos Dikalahkan!' : 'Boss Defeated!',
                                      description: state.language === 'id' ? 'Kamu berhasil mengalahkan bos mingguan dan mendapatkan 500 Zone Coins!' : 'You defeated the weekly boss and earned 500 Zone Coins!',
                                      icon: 'Trophy',
                                      read: false
                                    },
                                    ...(state.notifications || [])
                                  ]
                                });
                                setShowVictoryAnimation(false);
                                setActiveTab('REGULAR');
                              }, 3000);
                            } else {
                              updateState({
                                bossState: {
                                  ...state.bossState!,
                                  hp: newHp,
                                  tasks: newTasks
                                }
                              });
                            }
                          }}
                          className={`group p-5 rounded-2xl flex items-center space-x-4 border transition-all duration-300 ${
                            task.completed 
                              ? 'bg-surface/30 border-white/5 opacity-50' 
                              : 'bg-gradient-to-br from-surface to-surface-hover border-rose-500/20 cursor-pointer hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-500/10'
                          }`}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-8 h-8 text-rose-500 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full border-2 border-rose-500/30 group-hover:border-rose-500 flex items-center justify-center shrink-0 transition-colors">
                              <div className="w-3 h-3 rounded-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className={`text-lg font-medium block truncate ${task.completed ? 'line-through text-secondary' : 'text-primary group-hover:text-rose-50 transition-colors'}`}>
                              {task.text}
                            </span>
                          </div>
                          {!task.completed && (
                            <span className="ml-auto text-sm font-mono font-bold text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                              {task.damage} DMG
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomMissionsModal
        isOpen={isCustomMissionsModalOpen}
        onClose={() => setIsCustomMissionsModalOpen(false)}
        state={state}
        addCustomMission={addCustomMission}
        removeCustomMission={removeCustomMission}
        initialTab={activeTab}
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
        ovr={calculateOVR(state).ovr}
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
    </motion.div>
  );
}
