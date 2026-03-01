import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAppState, PathType, getRankForLevel } from './store';
import LoginScreen from './components/LoginScreen';
import OnboardingScreen from './components/OnboardingScreen';
import HomeScreen from './components/HomeScreen';
import ProfileScreen from './components/ProfileScreen';
import RankScreen from './components/RankScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import StreakScreen from './components/StreakScreen';
import JourneyScreen from './components/JourneyScreen';
import PfpPromptModal from './components/PfpPromptModal';
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
    removeCustomMission
  } = useAppState();

  const [activeTab, setActiveTab] = useState<Tab>('home');
  const activeTabRef = useRef<Tab>(activeTab);
  const preAnimationTabRef = useRef<Tab | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);

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
    if (state?.isLoggedIn && state?.onboardingCompleted && state?.chosenPath) {
      generateMissions(state.chosenPath);
    }
  }, [state?.isLoggedIn, state?.onboardingCompleted, state?.chosenPath, state?.customMissions]);

  useEffect(() => {
    if (state?.isLoggedIn && state?.username) {
      try {
        const savedLeaderboard = localStorage.getItem('lockin_global_leaderboard');
        let users = savedLeaderboard ? JSON.parse(savedLeaderboard) : [
          { username: 'Zaiki', level: 100, xp: 99999, equippedFrame: 'frame-omniscience', equippedTitle: 'The Creator', profilePicture: null },
          { username: 'ProGamer', level: 42, xp: 15000, equippedFrame: 'frame-abyssal', equippedTitle: 'Grind Master', profilePicture: null },
          { username: 'Newbie', level: 5, xp: 1200, equippedFrame: 'frame-bronze', equippedTitle: 'Newbie', profilePicture: null },
        ];
        
        const userIndex = users.findIndex((u: any) => u.username === state.username);
        const userData = {
          username: state.username,
          level: state.level,
          xp: state.xp,
          equippedFrame: state.equippedFrame,
          equippedTitle: state.equippedTitle,
          profilePicture: state.profilePicture,
          lastActive: Date.now()
        };

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
  }, [state?.level, state?.xp, state?.equippedFrame, state?.equippedTitle, state?.profilePicture, state?.username, state?.isLoggedIn]);

  useEffect(() => {
    if (state?.animatingLevelUp) {
      preAnimationTabRef.current = activeTabRef.current;
      setActiveTab('journey');
    } else if (state?.animatingLevelUp === false && preAnimationTabRef.current) {
      setActiveTab(preAnimationTabRef.current);
      preAnimationTabRef.current = null;
    }
  }, [state?.animatingLevelUp]);

  const handleLogin = (email: string, username: string) => {
    login(email, username);
  };

  const handleSelectPath = (path: PathType) => {
    updateState({ chosenPath: path, onboardingCompleted: true });
  };

  const handleDismissStreak = () => {
    updateState({ showStreakAnimation: false });
  };

  // Render logic
  let content;

  if (isAppLoading) {
    content = (
      <div className="flex flex-col items-center justify-center h-full bg-black space-y-12 p-6 text-center">
        {/* Core Logo - Solid, no bounce, no spin */}
        <div className="relative flex flex-col items-center">
          <div className="flex items-center text-5xl md:text-6xl font-display font-black text-white tracking-[0.2em] ml-[0.2em]">
            <span>Z</span>
            <Target className="w-10 h-10 md:w-12 md:h-12 text-white mx-1" strokeWidth={3} />
            <span>NE</span>
          </div>
          
          {/* Elegant sleek loading line */}
          <div className="w-full max-w-[160px] h-[2px] bg-white/10 mt-8 relative overflow-hidden rounded-full">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-white rounded-full"
              initial={{ width: "0%", x: "-100%" }}
              animate={{ width: "100%", x: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
            />
          </div>
        </div>

        {/* Subtitle */}
        <div className="flex flex-col items-center space-y-3">
          <motion.h2 
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-sm font-display font-bold text-white tracking-[0.4em] ml-[0.4em]"
          >
            SYNCING
          </motion.h2>
          <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.2em] ml-[0.2em]">
            Establishing Connection...
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
                  changePath={changePath}
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
