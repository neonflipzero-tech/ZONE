import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Lock, Shield, CheckCircle2 } from 'lucide-react';
import ProfileFrame from './ProfileFrame';
import { AppState } from '../store';

interface FramesModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  ovr: number;
}

const ALL_FRAMES = [
  'frame-default', 'frame-bronze', 'frame-silver', 'frame-gold', 'frame-platinum', 
  'frame-diamond', 'frame-master', 'frame-grandmaster', 'frame-challenger', 
  'frame-rgb', 'frame-neon', 'frame-fire', 'frame-cyberpunk', 'frame-hologram', 
  'frame-celestial', 'frame-void', 'frame-aurora', 'frame-radiant', 
  'frame-abyssal', 'frame-inferno', 'frame-ethereal', 'frame-omniscience'
];

export default function FramesModal({ isOpen, onClose, state, updateState, ovr }: FramesModalProps) {
  const [previewFrame, setPreviewFrame] = useState<string>(state.equippedFrame || 'frame-default');
  
  useEffect(() => {
    if (isOpen) {
      setPreviewFrame(state.equippedFrame || 'frame-default');
    }
  }, [isOpen, state.equippedFrame]);

  const isZaiki = state.username?.toLowerCase() === 'zaiki';
  const totalMissions = Object.values(state.dailyStats || {}).reduce((a, b) => a + b, 0);
  
  const checkUnlocked = (frame: string) => {
    const specialConditions: Record<string, boolean> = {
      'frame-rgb': state.streak >= 7,
      'frame-neon': totalMissions >= 50,
      'frame-fire': state.streak >= 30,
      'frame-cyberpunk': state.badges.length >= 5,
      'frame-hologram': totalMissions >= 100,
      'frame-celestial': ovr >= 80,
      'frame-void': state.level >= 20,
      'frame-aurora': state.streak >= 60,
      'frame-radiant': totalMissions >= 200,
      'frame-abyssal': totalMissions >= 666,
      'frame-inferno': state.streak >= 100,
      'frame-ethereal': ovr >= 95,
      'frame-omniscience': ovr >= 100,
    };
    return state.unlockedFrames?.includes(frame) || 
      frame === 'frame-default' || 
      isZaiki || 
      (specialConditions[frame] ?? false);
  };

  const getFrameDescription = (f: string) => {
    switch(f) {
      case 'frame-default': return state.language === 'id' ? 'Tersedia dari awal' : 'Available from start';
      case 'frame-bronze': return state.language === 'id' ? 'Capai Rank Bronze' : 'Reach Bronze Rank';
      case 'frame-silver': return state.language === 'id' ? 'Capai Rank Silver' : 'Reach Silver Rank';
      case 'frame-gold': return state.language === 'id' ? 'Capai Rank Gold' : 'Reach Gold Rank';
      case 'frame-platinum': return state.language === 'id' ? 'Capai Rank Platinum' : 'Reach Platinum Rank';
      case 'frame-diamond': return state.language === 'id' ? 'Capai Rank Diamond' : 'Reach Diamond Rank';
      case 'frame-master': return state.language === 'id' ? 'Capai Rank Master' : 'Reach Master Rank';
      case 'frame-grandmaster': return state.language === 'id' ? 'Capai Rank Grandmaster' : 'Reach Grandmaster Rank';
      case 'frame-challenger': return state.language === 'id' ? 'Capai Rank Challenger' : 'Reach Challenger Rank';
      case 'frame-rgb': return state.language === 'id' ? 'Capai 7 Hari Streak' : 'Reach 7 Day Streak';
      case 'frame-neon': return state.language === 'id' ? 'Selesaikan 50 Misi' : 'Complete 50 Missions';
      case 'frame-fire': return state.language === 'id' ? 'Capai 30 Hari Streak' : 'Reach 30 Day Streak';
      case 'frame-cyberpunk': return state.language === 'id' ? 'Kumpulkan 5 Lencana' : 'Earn 5 Badges';
      case 'frame-hologram': return state.language === 'id' ? 'Selesaikan 100 Misi' : 'Complete 100 Missions';
      case 'frame-celestial': return state.language === 'id' ? 'Capai OVR 80' : 'Reach 80 OVR';
      case 'frame-void': return state.language === 'id' ? 'Capai Level 20' : 'Reach Level 20';
      case 'frame-aurora': return state.language === 'id' ? 'Capai 60 Hari Streak' : 'Reach 60 Day Streak';
      case 'frame-radiant': return state.language === 'id' ? 'Selesaikan 200 Misi' : 'Complete 200 Missions';
      case 'frame-abyssal': return state.language === 'id' ? 'Selesaikan 666 Misi' : 'Complete 666 Missions';
      case 'frame-inferno': return state.language === 'id' ? 'Capai 100 Hari Streak' : 'Reach 100 Day Streak';
      case 'frame-ethereal': return state.language === 'id' ? 'Capai OVR 95' : 'Reach 95 OVR';
      case 'frame-omniscience': return state.language === 'id' ? 'Capai OVR 100 (Maksimal)' : 'Reach 100 OVR (Max)';
      default: return '';
    }
  };

  const handleEquip = () => {
    if (checkUnlocked(previewFrame)) {
      updateState({ equippedFrame: previewFrame === 'frame-default' ? null : previewFrame });
    }
  };

  const isPreviewEquipped = (state.equippedFrame === previewFrame) || (previewFrame === 'frame-default' && !state.equippedFrame);
  const isPreviewUnlocked = checkUnlocked(previewFrame);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-surface/50 backdrop-blur-md z-10">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6 text-primary" />
            </button>
            <h2 className="text-lg font-bold text-primary flex items-center">
              <Shield className="w-5 h-5 text-accent mr-2" />
              {state.language === 'id' ? 'Koleksi Bingkai' : 'Frame Collection'}
            </h2>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Preview Area */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center py-6 px-6 bg-gradient-to-b from-surface/80 to-background border-b border-white/5">
            <motion.div 
              key={previewFrame}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="mb-4"
            >
              <ProfileFrame frame={previewFrame} src={state.profilePicture} size="xl" />
            </motion.div>
            
            <div className="text-center mb-4">
              <h3 className="text-xl font-black text-primary font-display tracking-tight uppercase mb-1">
                {previewFrame.replace('frame-', '')}
              </h3>
              <p className="text-xs text-secondary/80 max-w-[250px] mx-auto">
                {getFrameDescription(previewFrame)}
              </p>
            </div>

            <button
              onClick={handleEquip}
              disabled={!isPreviewUnlocked || isPreviewEquipped}
              className={`w-full max-w-[250px] py-2.5 px-6 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                isPreviewEquipped 
                  ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                  : isPreviewUnlocked 
                    ? 'bg-accent text-white hover:bg-accent/90 shadow-[0_0_20px_rgba(242,125,38,0.3)]' 
                    : 'bg-surface border border-white/10 text-secondary cursor-not-allowed'
              }`}
            >
              {isPreviewEquipped ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{state.language === 'id' ? 'Sedang Dipakai' : 'Equipped'}</span>
                </>
              ) : isPreviewUnlocked ? (
                <span>{state.language === 'id' ? 'Gunakan Bingkai' : 'Equip Frame'}</span>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>{state.language === 'id' ? 'Terkunci' : 'Locked'}</span>
                </>
              )}
            </button>
          </div>

          {/* Grid Area */}
          <div className="flex-1 overflow-y-auto p-4 pb-safe">
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              {ALL_FRAMES.map(frame => {
                const isUnlocked = checkUnlocked(frame);
                const isEquipped = state.equippedFrame === frame || (frame === 'frame-default' && !state.equippedFrame);
                const isSelected = previewFrame === frame;

                return (
                  <button
                    key={frame}
                    onClick={() => setPreviewFrame(frame)}
                    className={`relative aspect-square rounded-2xl p-2 transition-all flex flex-col items-center justify-center gap-2 ${
                      isSelected ? 'bg-white/10 border-2 border-white/30 scale-105 z-10' : 
                      isEquipped ? 'bg-accent/10 border border-accent/50' : 
                      isUnlocked ? 'bg-surface border border-white/5 hover:border-white/20' : 
                      'bg-surface/30 border border-white/5 opacity-50'
                    }`}
                  >
                    <div className="scale-75 origin-center pointer-events-none">
                      <ProfileFrame frame={frame} src={state.profilePicture} size="md" />
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-primary font-bold truncate w-full text-center px-1">
                      {frame.replace('frame-', '')}
                    </span>
                    {!isUnlocked && <Lock className="absolute top-2 right-2 w-3 h-3 text-white/50" />}
                    {isEquipped && <div className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_rgba(242,125,38,1)]" />}
                  </button>
                );
              })}
            </div>
            <div className="h-8" /> {/* Extra padding at bottom */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
