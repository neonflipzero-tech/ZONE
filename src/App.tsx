import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAppState, PathType, getRankForLevel } from './store';
import LoginScreen from './components/LoginScreen';
import OnboardingScreen from './components/OnboardingScreen';
import HomeScreen from './components/HomeScreen';
import ProfileScreen from './components/ProfileScreen';
import RankUpScreen from './components/RankUpScreen';
import { Home, User } from 'lucide-react';

type Tab = 'home' | 'profile';

export default function App() {
  const { 
    state, 
    login,
    logout,
    updateState, 
    generateMissions, 
    completeMission
  } = useAppState();

  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    if (state?.isLoggedIn && state?.onboardingCompleted && state?.chosenPath) {
      generateMissions(state.chosenPath);
    }
  }, [state?.isLoggedIn, state?.onboardingCompleted, state?.chosenPath]);

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
  } else {
    content = (
      <>
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'home' ? (
              <motion.div key="home" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <HomeScreen 
                  state={state} 
                  onCompleteMission={completeMission} 
                />
              </motion.div>
            ) : (
              <motion.div key="profile" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProfileScreen 
                  state={state}
                  onLogout={logout}
                  updateState={updateState}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-white/5 pb-safe z-50">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto px-6">
            <button 
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${activeTab === 'home' ? 'text-primary' : 'text-secondary hover:text-primary/70'}`}
            >
              <Home className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">Home</span>
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${activeTab === 'profile' ? 'text-primary' : 'text-secondary hover:text-primary/70'}`}
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
