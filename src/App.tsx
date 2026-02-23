import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAppState, PathType, getRankForLevel } from './store';
import LoginScreen from './components/LoginScreen';
import OnboardingScreen from './components/OnboardingScreen';
import HomeScreen from './components/HomeScreen';
import ProfileScreen from './components/ProfileScreen';
import RankUpScreen from './components/RankUpScreen';
import RankScreen from './components/RankScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import StreakScreen from './components/StreakScreen';
import JourneyScreen from './components/JourneyScreen';
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
    changePath
  } = useAppState();

  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    if (state?.isLoggedIn && state?.onboardingCompleted && state?.chosenPath) {
      generateMissions(state.chosenPath);
    }
  }, [state?.isLoggedIn, state?.onboardingCompleted, state?.chosenPath]);

  useEffect(() => {
    if (state?.animatingLevelUp) {
      setActiveTab('journey');
    }
  }, [state?.animatingLevelUp]);

  const handleLogin = (email: string, username: string) => {
    login(email, username);
  };

  const handleSelectPath = (path: PathType) => {
    updateState({ chosenPath: path, onboardingCompleted: true });
  };

  // Check for rank up
  const currentRank = state ? getRankForLevel(state.level) : null;
  const showRankUp = state && currentRank && currentRank.name !== state.highestRankAchieved;

  const handleDismissRankUp = () => {
    if (currentRank) {
      updateState({ highestRankAchieved: currentRank.name });
    }
  };

  const handleDismissStreak = () => {
    updateState({ showStreakAnimation: false });
  };

  // Render logic
  let content;

  if (!state || !state.isLoggedIn) {
    content = <LoginScreen onLogin={handleLogin} />;
  } else if (!state.onboardingCompleted) {
    content = <OnboardingScreen onSelectPath={handleSelectPath} />;
  } else if (showRankUp && state.chosenPath) {
    content = (
      <RankUpScreen 
        key="rankup"
        rankName={currentRank.name}
        rankColor={currentRank.color}
        path={state.chosenPath}
        onContinue={handleDismissRankUp}
      />
    );
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
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div key="home" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <HomeScreen 
                  state={state} 
                  onCompleteMission={completeMission} 
                  onReplaceMission={replaceMission}
                />
              </motion.div>
            )}
            {activeTab === 'leaderboard' && (
              <motion.div key="leaderboard" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LeaderboardScreen state={state} />
              </motion.div>
            )}
            {activeTab === 'journey' && (
              <motion.div key="journey" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <JourneyScreen state={state} updateState={updateState} />
              </motion.div>
            )}
            {activeTab === 'rank' && (
              <motion.div key="rank" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RankScreen state={state} />
              </motion.div>
            )}
            {activeTab === 'profile' && (
              <motion.div key="profile" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-white/5 pb-safe z-50">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
            <button 
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${activeTab === 'home' ? 'text-primary' : 'text-secondary hover:text-primary/70'}`}
            >
              <Target className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">Missions</span>
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${activeTab === 'leaderboard' ? 'text-accent' : 'text-secondary hover:text-accent/70'}`}
            >
              <BarChart2 className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">Global</span>
            </button>
            <button 
              onClick={() => setActiveTab('journey')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${activeTab === 'journey' ? 'text-orange-500' : 'text-secondary hover:text-orange-500/70'}`}
            >
              <Map className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">Journey</span>
            </button>
            <button 
              onClick={() => setActiveTab('rank')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${activeTab === 'rank' ? 'text-primary' : 'text-secondary hover:text-primary/70'}`}
            >
              <Trophy className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">Rank</span>
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${activeTab === 'profile' ? 'text-primary' : 'text-secondary hover:text-primary/70'}`}
            >
              <User className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">Profile</span>
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
