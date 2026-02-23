import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { UserState, getRankForLevel } from '../store';
import { Trophy, Flame, LogOut, Camera, User, Shield } from 'lucide-react';

interface ProfileScreenProps {
  state: UserState;
  onLogout: () => void;
  updateState: (updates: Partial<UserState>) => void;
}

export default function ProfileScreen({ state, onLogout, updateState }: ProfileScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateState({ profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const currentRank = getRankForLevel(state.level);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-background overflow-y-auto no-scrollbar pb-24"
    >
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-display font-bold tracking-tight mb-8">Profile</h1>
        
        {/* Profile Picture & Username */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-surface bg-surface flex items-center justify-center shadow-lg shadow-accent/10">
              {state.profilePicture ? (
                <img src={state.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-secondary" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 bg-accent text-white p-2 rounded-full shadow-lg border-2 border-background">
              <Camera className="w-4 h-4" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <h2 className="mt-4 text-2xl font-bold font-display">{state.username}</h2>
          <div className="flex items-center space-x-2 mt-2">
            <Shield className={`w-4 h-4 ${currentRank.color}`} />
            <span className={`text-sm font-bold ${currentRank.color}`}>{currentRank.name}</span>
            <span className="text-sm text-secondary font-mono uppercase tracking-wider">• Level {state.level}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="bg-surface border border-white/5 rounded-2xl p-5 flex items-center justify-between bg-gradient-to-br from-surface to-surface-hover">
            <div>
              <div className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500">{state.xp} XP</div>
              <div className="text-xs text-secondary font-mono uppercase tracking-wider mt-1">Total Experience</div>
            </div>
            <Flame className="w-10 h-10 text-accent" />
          </div>
        </div>

        {/* Path Info */}
        <div className="bg-surface border border-white/5 rounded-2xl p-5 mb-8">
          <h3 className="text-sm text-secondary font-mono uppercase tracking-wider mb-2">Chosen Path</h3>
          <div className="text-xl font-bold text-primary">{state.chosenPath?.replace('_', ' ')}</div>
        </div>

        {/* Badges */}
        <div className="mb-8">
          <h3 className="text-xl font-display font-bold mb-4">Badges</h3>
          {state.badges.length === 0 ? (
            <div className="bg-surface border border-white/5 rounded-2xl p-8 text-center text-secondary">
              <Trophy className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Complete missions to earn badges.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {state.badges.map((badge, i) => (
                <div key={i} className="bg-surface border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center aspect-square bg-gradient-to-b from-surface to-surface-hover">
                  <Trophy className="w-8 h-8 text-accent mb-2" />
                  <span className="text-xs font-bold leading-tight">{badge}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div>
          <h3 className="text-xl font-display font-bold mb-4">Settings</h3>
          <button 
            onClick={onLogout}
            className="w-full bg-surface hover:bg-surface-hover border border-white/5 rounded-2xl p-4 flex items-center justify-between text-accent transition-colors"
          >
            <span className="font-bold">Log Out</span>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
