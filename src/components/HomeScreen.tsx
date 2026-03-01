import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { UserState, MissionType, getRankForLevel, Mission } from '../store';
import { CheckCircle2, Circle, Flame, Trophy, User, Shield, Timer, Wand2 } from 'lucide-react';
import { t } from '../utils/translations';
import { sounds } from '../utils/sounds';
import ProfileFrame from './ProfileFrame';
import CustomMissionsModal from './CustomMissionsModal';

interface HomeScreenProps {
  state: UserState;
  onCompleteMission: (id: string) => void;
  onReplaceMission: (id: string) => void;
  addCustomMission: (type: MissionType, text: string) => void;
  removeCustomMission: (type: MissionType, text: string) => void;
}

function extractDuration(text: string): number | null {
  const secondsMatch = text.match(/(\d+)\s*seconds?/i);
  if (secondsMatch) return parseInt(secondsMatch[1], 10);
  
  const minutesMatch = text.match(/(\d+)\s*minutes?/i);
  if (minutesMatch) return parseInt(minutesMatch[1], 10) * 60;
  
  return null;
}

export default function HomeScreen({ state, onCompleteMission, onReplaceMission, addCustomMission, removeCustomMission }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<MissionType>('REGULAR');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCustomMissionsModalOpen, setIsCustomMissionsModalOpen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            return 0;
          }
          sounds.playTick();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]); // Only depend on isTimerRunning to avoid clearing interval on every tick or parent re-render

  useEffect(() => {
    if (isTimerRunning && timeLeft === 0) {
      setIsTimerRunning(false);
      if (selectedMission) {
        onCompleteMission(selectedMission.id);
        setSelectedMission(null);
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-background overflow-y-auto no-scrollbar pb-24"
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <ProfileFrame frame={state.equippedFrame} src={state.profilePicture} size="sm" />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-background z-10 ${currentRank.bg}`}></div>
          </div>
          <div>
            <h1 className="text-xl font-display font-black tracking-tight">ZONE</h1>
            <div className="flex items-center space-x-1 mt-0.5">
              <Shield className={`w-3 h-3 ${currentRank.color}`} />
              <p className={`text-xs font-mono uppercase tracking-wider ${currentRank.color}`}>{currentRank.name} • Lvl {state.level}</p>
            </div>
            {state.equippedTitle && (
              <p className="text-[10px] font-mono uppercase tracking-widest text-accent/80 mt-0.5">{state.equippedTitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-gradient-to-r from-orange-500/10 to-rose-500/10 px-3 py-1.5 rounded-full border border-orange-500/20 shadow-sm shadow-orange-500/10">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-500">{state.streak || 0}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-gradient-to-r from-surface to-surface-hover px-3 py-1.5 rounded-full border border-white/10 shadow-sm shadow-accent/5">
            <span className="text-sm font-bold text-accent">{state.xp} XP</span>
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
                  title={state.language === 'id' ? 'Atur Misi Kustom' : 'Manage Custom Missions'}
                >
                  <Wand2 className="w-4 h-4" />
                </button>
              )}
              <span className="text-sm text-secondary font-mono">{completedMissionsCount}/{totalMissions}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-surface rounded-xl p-1 mb-6 border border-white/5 overflow-x-auto no-scrollbar">
            {(state.chosenPath === 'OTHER' 
              ? ['REGULAR', 'DAILY', 'WEEKLY', 'ROUTINE'] as MissionType[]
              : ['REGULAR', 'DAILY', 'WEEKLY'] as MissionType[]
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[70px] py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-colors ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-accent to-rose-600 text-white shadow-md' 
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {tab === 'ROUTINE' ? (state.language === 'id' ? 'Rutinitas' : 'Routine') : t(`home.tab.${tab.toLowerCase()}`, state.language)}
              </button>
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-surface rounded-full mb-6 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-accent to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          <div className="space-y-3">
            {displayedMissions.length === 0 ? (
              <div className="text-center py-12 px-4 bg-surface/50 rounded-2xl border border-white/5">
                <Wand2 className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
                <h4 className="text-lg font-bold mb-2">
                  {state.language === 'id' ? 'Belum ada misi' : 'No missions yet'}
                </h4>
                <p className="text-sm text-secondary mb-6 max-w-[250px] mx-auto">
                  {state.language === 'id' 
                    ? `Tambahkan misi kustom ${activeTab.toLowerCase()} untuk mulai mendapatkan XP.` 
                    : `Add custom ${activeTab.toLowerCase()} missions to start earning XP.`}
                </p>
                <button
                  onClick={() => setIsCustomMissionsModalOpen(true)}
                  className="px-6 py-3 bg-accent text-background rounded-xl font-bold text-sm hover:bg-accent/90 transition-colors"
                >
                  {state.language === 'id' ? 'Tambah Misi' : 'Add Missions'}
                </button>
              </div>
            ) : (
              displayedMissions.map((mission, index) => {
                const xpReward = mission.type === 'WEEKLY' ? 200 : mission.type === 'DAILY' ? 100 : 50;
                
                // For ROUTINE missions, lock them if the previous one isn't completed
                const isRoutine = activeTab === 'ROUTINE';
                const firstUncompletedIndex = displayedMissions.findIndex(m => !m.completed);
                const isLocked = isRoutine && !mission.completed && firstUncompletedIndex !== -1 && index > firstUncompletedIndex;

                return (
                  <motion.div
                    key={mission.id}
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
                          {state.language === 'id' ? 'Terkunci (Selesaikan misi sebelumnya)' : 'Locked (Complete previous)'}
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
              <div className="flex items-center justify-center space-x-3 mb-8">
                <span className="px-4 py-2 bg-white/5 rounded-full text-sm font-mono text-secondary uppercase tracking-wider border border-white/10">
                  {selectedMission.type} MISSION
                </span>
                <span className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-mono font-bold border border-accent/20">
                  +{selectedMission.type === 'WEEKLY' ? 200 : selectedMission.type === 'DAILY' ? 100 : 50} XP
                </span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-display font-black mb-12 text-center leading-tight tracking-tight">
                {selectedMission.text}
              </h2>
              
              <div className="space-y-4 mt-auto">
                {timeLeft !== null ? (
                  isTimerRunning ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="text-6xl font-mono font-bold text-accent mb-4">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </div>
                      <p className="text-secondary">{t('home.timer.keep_going', state.language)}</p>
                      <button
                        onClick={() => setIsTimerRunning(false)}
                        className="mt-8 px-8 py-3 rounded-full border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors font-bold"
                      >
                        {t('home.timer.stop', state.language)}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsTimerRunning(true)}
                      className="w-full py-5 rounded-2xl font-bold text-lg bg-primary text-background hover:bg-gray-200 transition-colors shadow-xl shadow-primary/20 flex items-center justify-center space-x-2"
                    >
                      <Timer className="w-6 h-6" />
                      <span>{t('home.timer.start', state.language)}</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      onCompleteMission(selectedMission.id);
                      handleCloseModal();
                    }}
                    className="w-full py-5 rounded-2xl font-bold text-lg bg-primary text-background hover:bg-gray-200 transition-colors shadow-xl shadow-primary/20"
                  >
                    {t('home.mission.start_complete', state.language)}
                  </button>
                )}
                
                {!isTimerRunning && (
                  <>
                    <button
                      onClick={() => {
                        onReplaceMission(selectedMission.id);
                        handleCloseModal();
                      }}
                      className="w-full py-5 rounded-2xl font-bold text-lg bg-surface text-secondary border border-white/10 hover:bg-surface-hover hover:text-primary transition-colors"
                    >
                      {state.language === 'id' ? 'Saya tidak bisa melakukannya' : "I can't do it"}
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="w-full py-5 rounded-2xl font-bold text-lg text-secondary hover:text-primary transition-colors"
                    >
                      {state.language === 'id' ? 'Batal' : 'Cancel'}
                    </button>
                  </>
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
      />
    </motion.div>
  );
}
