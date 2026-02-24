import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserState, getRankForLevel, PathType } from '../store';
import { Trophy, Flame, LogOut, Camera, User, Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface ProfileScreenProps {
  state: UserState;
  onLogout: () => void;
  updateState: (updates: Partial<UserState>) => void;
  changePath: (path: PathType) => void;
}

export default function ProfileScreen({ state, onLogout, updateState, changePath }: ProfileScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGoalDropdownOpen, setIsGoalDropdownOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmImage = () => {
    if (previewImage) {
      updateState({ profilePicture: previewImage });
      setPreviewImage(null);
    }
  };

  const cancelImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        <h1 className="text-2xl font-display font-bold tracking-tight mb-8">{state.language === 'id' ? 'Profil' : 'Profile'}</h1>
        
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
            <span className="text-sm text-secondary font-mono uppercase tracking-wider">• {state.language === 'id' ? 'Level' : 'Level'} {state.level}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="bg-surface border border-white/5 rounded-2xl p-5 flex items-center justify-between bg-gradient-to-br from-surface to-surface-hover">
            <div>
              <div className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-500">{state.xp} XP</div>
              <div className="text-xs text-secondary font-mono uppercase tracking-wider mt-1">{state.language === 'id' ? 'Total Pengalaman' : 'Total Experience'}</div>
            </div>
            <Flame className="w-10 h-10 text-accent" />
          </div>
        </div>

        {/* Badges */}
        <div className="mb-8">
          <h3 className="text-xl font-display font-bold mb-4">{state.language === 'id' ? 'Lencana' : 'Badges'}</h3>
          {state.badges.length === 0 ? (
            <div className="bg-surface border border-white/5 rounded-2xl p-8 text-center text-secondary">
              <Trophy className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{state.language === 'id' ? 'Selesaikan misi untuk mendapatkan lencana.' : 'Complete missions to earn badges.'}</p>
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
          <h3 className="text-xl font-display font-bold mb-4">{state.language === 'id' ? 'Pengaturan' : 'Settings'}</h3>
          <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
            {/* Goal Setting */}
            <div className="p-4 border-b border-white/5">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsGoalDropdownOpen(!isGoalDropdownOpen)}
              >
                <span className="font-bold">{state.language === 'id' ? 'Tujuan' : 'Goal'}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-secondary">{state.chosenPath?.replace('_', ' ')}</span>
                  {isGoalDropdownOpen ? <ChevronUp className="w-5 h-5 text-secondary" /> : <ChevronDown className="w-5 h-5 text-secondary" />}
                </div>
              </div>
              
              <AnimatePresence>
                {isGoalDropdownOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-2">
                      {(['PRODUCTIVE', 'STRONGER', 'EXTROVERT', 'DISCIPLINE', 'MENTAL_HEALTH'] as PathType[]).map(path => (
                        <button
                          key={path}
                          onClick={() => {
                            changePath(path);
                            setIsGoalDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                            state.chosenPath === path 
                              ? 'bg-primary/10 border-primary text-primary font-bold' 
                              : 'bg-background border-white/5 text-secondary hover:border-white/20 hover:text-primary'
                          }`}
                        >
                          {path.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language Setting */}
            <div className="p-4 flex items-center justify-between border-b border-white/5">
              <span className="font-bold">{state.language === 'id' ? 'Bahasa' : 'Language'}</span>
              <div className="flex bg-background rounded-lg p-1 border border-white/10">
                <button 
                  onClick={() => updateState({ language: 'en' })}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${state.language === 'en' ? 'bg-primary text-background' : 'text-secondary hover:text-primary'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => updateState({ language: 'id' })}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${state.language === 'id' ? 'bg-primary text-background' : 'text-secondary hover:text-primary'}`}
                >
                  ID
                </button>
              </div>
            </div>

            <button 
              onClick={onLogout}
              className="w-full p-4 flex items-center justify-between text-accent hover:bg-white/5 transition-colors"
            >
              <span className="font-bold">{state.language === 'id' ? 'Keluar' : 'Log Out'}</span>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Picture Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center px-6"
          >
            <h2 className="text-2xl font-display font-bold mb-8">{state.language === 'id' ? 'Sesuaikan Foto Profil' : 'Adjust Profile Picture'}</h2>
            <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-surface bg-surface flex items-center justify-center shadow-2xl shadow-accent/20 mb-8">
              <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex space-x-4 w-full max-w-xs">
              <button 
                onClick={cancelImage}
                className="flex-1 py-3 rounded-xl font-bold bg-surface text-primary border border-white/10 hover:bg-surface-hover transition-colors"
              >
                {state.language === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button 
                onClick={confirmImage}
                className="flex-1 py-3 rounded-xl font-bold bg-primary text-background hover:bg-gray-200 transition-colors"
              >
                {state.language === 'id' ? 'Simpan' : 'Save'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
