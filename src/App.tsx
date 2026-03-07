import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAppState, PathType, getRankForLevel, calculateOVR } from './store';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import LoginScreen from './components/LoginScreen';
import OnboardingScreen from './components/OnboardingScreen';
import HomeScreen from './components/HomeScreen';
import ProfileScreen from './components/ProfileScreen';
import RankScreen from './components/RankScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import StreakScreen from './components/StreakScreen';
import JourneyScreen from './components/JourneyScreen';
import PfpPromptModal from './components/PfpPromptModal';
import UnlockNotification from './components/UnlockNotification';
import { Target, Trophy, User, BarChart2, Map } from 'lucide-react';

type Tab = 'home' | 'leaderboard' | 'journey' | 'rank' | 'profile';

export default function App() {
  const { 
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
    dismissUnlockedItem,
    addNotification
  } = useAppState();

  const [activeTab, setActiveTab] = useState<Tab>('home');
  const activeTabRef = useRef<Tab>(activeTab);
  const preAnimationTabRef = useRef<Tab | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isChangingGoal, setIsChangingGoal] = useState(false);

  useEffect(() => {
    // Simulate initial app load
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (state?.isLoggedIn && state?.onboardingCompleted && state?.chosenPath && !isChangingGoal) {
      generateMissions(state.chosenPath);
    }
  }, [state?.isLoggedIn, state?.onboardingCompleted, state?.chosenPath, state?.customMissions, isChangingGoal]);

  useEffect(() => {
    if (state?.isLoggedIn && state?.username && state?.userId) {
      const totalXp = 50 * state.level * (state.level - 1) + state.xp;
      const userData = {
        userId: state.userId,
        username: state.username,
        level: state.level,
        xp: state.xp,
        totalXp: totalXp,
        equippedFrame: state.equippedFrame,
        equippedTitle: state.equippedTitle,
        profilePicture: state.profilePicture,
        streak: state.streak || 0,
        badgesCount: state.badges?.length || 0,
        framesCount: state.unlockedFrames?.length || 0,
        missionsCompleted: state.missionsCompleted || 0,
        isProfilePublic: state.isProfilePublic !== false,
        ovr: calculateOVR(state).ovr,
        stats: calculateOVR(state).stats,
        lastActive: Date.now()
      };

      // Sync to Firebase if configured
      if (db) {
        const timeout = setTimeout(() => {
          setDoc(doc(db, 'users', state.userId), userData, { merge: true }).catch((e: any) => {
            if (e?.code === 'unavailable' || e?.message?.includes('offline')) {
              console.warn("Client is offline, skipping user data sync.");
            } else {
              console.error("Error syncing user data:", e);
            }
          });
        }, 2000);
        return () => clearTimeout(timeout);
      }

      // Fallback to localStorage for local dev without Firebase
      try {
        const savedLeaderboard = localStorage.getItem('lockin_global_leaderboard');
        let users = savedLeaderboard ? JSON.parse(savedLeaderboard) : [
          { userId: 'zaiki-123', username: 'Zaiki', level: 100, xp: 99999, equippedFrame: 'frame-omniscience', equippedTitle: 'The Creator', profilePicture: 'https://picsum.photos/seed/zaiki/200/200' },
          { userId: 'progamer-123', username: 'ProGamer', level: 42, xp: 15000, equippedFrame: 'frame-abyssal', equippedTitle: 'Grind Master', profilePicture: 'https://picsum.photos/seed/progamer/200/200' },
          { userId: 'newbie-123', username: 'Newbie', level: 5, xp: 1200, equippedFrame: 'frame-bronze', equippedTitle: 'Newbie', profilePicture: 'https://picsum.photos/seed/newbie/200/200' },
        ];
        
        const userIndex = users.findIndex((u: any) => u.userId === state.userId || u.username === state.username);

        if (userIndex >= 0) {
          users[userIndex] = { ...users[userIndex], ...userData };
        } else {
          users.push(userData);
        }

        // Sort by level and xp
        users.sort((a: any, b: any) => {
          if (b.level !== a.level) return b.level - a.level;
          return b.xp - a.xp;
        });

        localStorage.setItem('lockin_global_leaderboard', JSON.stringify(users.slice(0, 50)));
      } catch (err) {
        console.error('Failed to sync leaderboard to localStorage:', err);
      }
    }
  }, [state?.level, state?.xp, state?.equippedFrame, state?.equippedTitle, state?.profilePicture, state?.username, state?.isLoggedIn, state?.userId, state?.streak, state?.badges?.length, state?.unlockedFrames?.length, state?.missionsCompleted, state?.isProfilePublic]);

  const [isLevelUpAnimationComplete, setIsLevelUpAnimationComplete] = useState(true);

  // Update Notification Check
  useEffect(() => {
    if (state?.isLoggedIn) {
      const updateKey = 'lockin_update_v1_1';
      const hasSeenUpdate = localStorage.getItem(updateKey);
      
      if (!hasSeenUpdate) {
        addNotification({
          title: state.language === 'id' ? 'Update Baru!' : 'New Update!',
          description: state.language === 'id' 
            ? '• Reset Progress: Sekarang kamu bisa reset progres dari Settings.\n• Journey Map: Level maksimal sekarang dibatasi sampai 50 (Mythic).\n• Onboarding: Tambahan layar konfirmasi sebelum masuk ke ZONE.\n• Focus Timer: Tampilan timer misi sekarang penuh di layar.'
            : '• Reset Progress: You can now reset progress from Settings.\n• Journey Map: Max level correctly capped at 50 (Mythic).\n• Onboarding: Added a final confirmation step before entering the ZONE.\n• Focus Timer: Mission timer now takes over the screen.',
          icon: 'Zap'
        });
        localStorage.setItem(updateKey, 'true');
      }
    }
  }, [state?.isLoggedIn]);

  // Rival Notification Check
  useEffect(() => {
    const checkRival = async () => {
      if (state?.isLoggedIn && state?.rivalId) {
        let rivalData = null;
        if (db) {
          try {
            const docRef = doc(db, 'users', state.rivalId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              rivalData = docSnap.data();
            }
          } catch (e: any) {
            if (e?.code === 'unavailable' || e?.message?.includes('offline')) {
              console.warn("Client is offline, skipping rival check from Firestore.");
            } else {
              console.error("Error checking rival for notifications", e);
            }
          }
        }

        if (!rivalData) {
          const savedLeaderboard = localStorage.getItem('lockin_global_leaderboard');
          if (savedLeaderboard) {
            try {
              const users = JSON.parse(savedLeaderboard);
              const localRival = users.find((u: any) => u.userId === state.rivalId);
              if (localRival) {
                rivalData = localRival;
              }
            } catch (e) {
              console.error("Error parsing local leaderboard", e);
            }
          }
        }

        if (rivalData) {
          const lastRivalLevel = localStorage.getItem(`lockin_last_rival_level_${state.rivalId}`);
          
          if (lastRivalLevel && parseInt(lastRivalLevel) < rivalData.level) {
            addNotification({
              title: 'Rival Level Up!',
              description: `${rivalData.username} baru naik ke Level ${rivalData.level} — kamu masih Level ${state.level}`,
              icon: 'Swords'
            });
          } else if (rivalData.level > state.level && !lastRivalLevel) {
             addNotification({
              title: 'Rival Ahead!',
              description: `${rivalData.username} ada di Level ${rivalData.level} — kamu masih Level ${state.level}`,
              icon: 'Swords'
            });
          }
          
          localStorage.setItem(`lockin_last_rival_level_${state.rivalId}`, rivalData.level.toString());
        }
      }
    };
    
    // Check once on load
    if (state?.isLoggedIn) {
      checkRival();
    }
  }, [state?.isLoggedIn, state?.rivalId]);

  useEffect(() => {
    if (state?.animatingLevelUp) {
      preAnimationTabRef.current = activeTabRef.current;
      setActiveTab('journey');
      setIsLevelUpAnimationComplete(false);
    } else if (state?.animatingLevelUp === false && preAnimationTabRef.current) {
      setActiveTab(preAnimationTabRef.current);
      preAnimationTabRef.current = null;
      setIsLevelUpAnimationComplete(true);
    }
  }, [state?.animatingLevelUp]);

  const handleLogin = (email: string, username: string) => {
    login(email, username);
  };

  const handleSelectPath = (path: PathType) => {
    updateState({ chosenPath: path, onboardingCompleted: true });
  };

  const handleChangeGoal = (path: PathType) => {
    setIsChangingGoal(true);
    setTimeout(() => {
      changePath(path);
      setIsChangingGoal(false);
    }, 2000);
  };

  const handleDismissStreak = () => {
    updateState({ showStreakAnimation: false });
  };

  // Render logic
  let content;

  if (isAppLoading || isChangingGoal) {
    content = (
      <div className="flex flex-col items-center justify-center h-full bg-black space-y-10 p-6 text-center">
        {/* Bullseye Segmented Animation */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Outer dashed ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-white/20"
          />
          {/* Middle dashed ring (spins opposite) */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 rounded-full border-[3px] border-dashed border-white/40"
          />
          {/* Inner dashed ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-6 rounded-full border-2 border-dashed border-white/60"
          />
          {/* Center pulsing core */}
          <motion.div
            animate={{ scale: [0.7, 1.2, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-3 h-3 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)]"
          />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center space-y-3">
          <motion.h2 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-2xl font-display font-black text-white tracking-[0.3em] ml-[0.3em]"
          >
            ZONE
          </motion.h2>
          <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.2em] ml-[0.2em]">
            {isChangingGoal ? 'RECALIBRATING GOAL...' : 'ESTABLISHING CONNECTION...'}
          </p>
        </div>
      </div>
    );
  } else if (!state || !state.isLoggedIn) {
    content = <LoginScreen onLogin={handleLogin} />;
  } else if (!state.onboardingCompleted) {
    content = <OnboardingScreen onSelectPath={handleSelectPath} />;
  } else if (state.showStreakAnimation) {
    content = (
      <StreakScreen 
        key="streak"
        streak={state.streak}
        onContinue={handleDismissStreak}
      />
    );
  } else {
    content = (
      <>
        {state.unlockedItemsQueue && state.unlockedItemsQueue.length > 0 && isLevelUpAnimationComplete && (
          <UnlockNotification 
            item={state.unlockedItemsQueue[0]} 
            onDismiss={dismissUnlockedItem} 
            language={state.language}
          />
        )}
        <div className="flex-1 relative overflow-hidden bg-black">
          <AnimatePresence>
            {activeTab === 'home' && (
              <motion.div key="home" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <HomeScreen 
                  state={state} 
                  onCompleteMission={completeMission} 
                  onReplaceMission={replaceMission}
                  addCustomMission={addCustomMission}
                  removeCustomMission={removeCustomMission}
                />
              </motion.div>
            )}
            {activeTab === 'leaderboard' && (
              <motion.div key="leaderboard" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LeaderboardScreen state={state} />
              </motion.div>
            )}
            {activeTab === 'journey' && (
              <motion.div key="journey" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <JourneyScreen state={state} updateState={updateState} />
              </motion.div>
            )}
            {activeTab === 'rank' && (
              <motion.div key="rank" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RankScreen state={state} />
              </motion.div>
            )}
            {activeTab === 'profile' && (
              <motion.div key="profile" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProfileScreen 
                  state={state}
                  onLogout={logout}
                  updateState={updateState}
                  changePath={handleChangeGoal}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!state.hasPromptedPfp && !state.profilePicture && (
            <PfpPromptModal 
              language={state.language} 
              onComplete={(croppedImage) => {
                if (croppedImage) {
                  updateState({ profilePicture: croppedImage, hasPromptedPfp: true });
                } else {
                  updateState({ hasPromptedPfp: true });
                }
              }} 
            />
          )}
        </AnimatePresence>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-white/5 pb-safe z-50">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
            <button 
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${activeTab === 'home' ? 'text-primary' : 'text-secondary hover:text-primary/70'}`}
            >
              <Target className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{state?.language === 'id' ? 'Misi' : 'Missions'}</span>
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${activeTab === 'leaderboard' ? 'text-accent' : 'text-secondary hover:text-accent/70'}`}
            >
              <BarChart2 className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{state?.language === 'id' ? 'Peringkat' : 'Global'}</span>
            </button>
            <button 
              onClick={() => setActiveTab('journey')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${activeTab === 'journey' ? 'text-orange-500' : 'text-secondary hover:text-orange-500/70'}`}
            >
              <Map className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{state?.language === 'id' ? 'Perjalanan' : 'Journey'}</span>
            </button>
            <button 
              onClick={() => setActiveTab('rank')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${activeTab === 'rank' ? 'text-primary' : 'text-secondary hover:text-primary/70'}`}
            >
              <Trophy className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{state?.language === 'id' ? 'Pangkat' : 'Rank'}</span>
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${activeTab === 'profile' ? 'text-primary' : 'text-secondary hover:text-primary/70'}`}
            >
              <User className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{state?.language === 'id' ? 'Profil' : 'Profile'}</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="w-full h-screen bg-background text-primary flex justify-center overflow-hidden">
      {/* Mobile container constraint for web view */}
      <div className="w-full max-w-md h-full relative flex flex-col shadow-2xl bg-background border-x border-white/5">
        <AnimatePresence>
          {content}
        </AnimatePresence>
      </div>
    </div>
  );
}
