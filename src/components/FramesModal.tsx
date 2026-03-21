import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Lock, Shield, CheckCircle2 } from 'lucide-react';
import ProfileFrame from './ProfileFrame';
import { UserState } from '../store';
import { t } from '../utils/translations';

interface FramesModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: UserState;
  updateState: (updates: Partial<UserState>) => void;
  ovr: number;
  onGoToInventory?: () => void;
}

const ALL_FRAMES = [
  'frame-default', 'frame-bronze', 'frame-silver', 'frame-gold', 'frame-platinum', 
  'frame-diamond', 'frame-master', 'frame-grandmaster', 'frame-challenger', 'frame-legend', 'frame-mythic',
  'frame-rgb', 'frame-neon', 'frame-fire', 'frame-cyberpunk', 'frame-hologram', 
  'frame-celestial', 'frame-void', 'frame-aurora', 'frame-radiant', 
  'frame-abyssal', 'frame-inferno', 'frame-ethereal', 'frame-omniscience', 'frame-matrix', 'frame-viral',
  'frame-royal', 'frame-dragon', 'frame-elite'
];

export default function FramesModal({ isOpen, onClose, state, updateState, ovr, onGoToInventory }: FramesModalProps) {
  const [previewFrame, setPreviewFrame] = useState<string>(state.equippedFrame || 'frame-default');
  
  useEffect(() => {
    if (isOpen) {
      setPreviewFrame(state.equippedFrame || 'frame-default');
    }
  }, [isOpen, state.equippedFrame]);

  const isZaiki = state.username?.toLowerCase() === 'zaiki';
  const totalMissions = Object.values(state.dailyStats || {}).reduce((a, b) => (a as number) + (b as number), 0) as number;
  
  const checkUnlocked = (frame: string) => {
    const specialConditions: Record<string, boolean> = {
      'frame-rgb': state.streak >= 7,
      'frame-neon': totalMissions >= 50,
      'frame-fire': (state.streak || 0) >= 30,
      'frame-cyberpunk': (state.badges?.length || 0) >= 5,
      'frame-hologram': totalMissions >= 100,
      'frame-celestial': ovr >= 80,
      'frame-void': (state.level || 0) >= 20,
      'frame-aurora': (state.streak || 0) >= 60,
      'frame-radiant': totalMissions >= 200,
      'frame-abyssal': totalMissions >= 666,
      'frame-inferno': (state.streak || 0) >= 100,
      'frame-ethereal': ovr >= 95,
      'frame-omniscience': ovr >= 100,
      'frame-matrix': totalMissions >= 100,
      'frame-viral': (state.shareCount || 0) >= 5,
    };
    return state.unlockedFrames?.includes(frame) || 
      frame === 'frame-default' || 
      isZaiki || 
      (specialConditions[frame] ?? false);
  };

  const getFrameDescription = (f: string) => {
    switch(f) {
      case 'frame-default': return t('frames.desc.default', state.language);
      case 'frame-bronze': return t('frames.desc.bronze', state.language);
      case 'frame-silver': return t('frames.desc.silver', state.language);
      case 'frame-gold': return t('frames.desc.gold', state.language);
      case 'frame-platinum': return t('frames.desc.platinum', state.language);
      case 'frame-diamond': return t('frames.desc.diamond', state.language);
      case 'frame-master': return t('frames.desc.master', state.language);
      case 'frame-grandmaster': return t('frames.desc.grandmaster', state.language);
      case 'frame-challenger': return t('frames.desc.challenger', state.language);
      case 'frame-legend': return t('frames.desc.legend', state.language);
      case 'frame-mythic': return t('frames.desc.mythic', state.language);
      case 'frame-rgb': return t('frames.desc.rgb', state.language);
      case 'frame-neon': return t('frames.desc.neon', state.language);
      case 'frame-fire': return t('frames.desc.fire', state.language);
      case 'frame-cyberpunk': return t('frames.desc.cyberpunk', state.language);
      case 'frame-hologram': return t('frames.desc.hologram', state.language);
      case 'frame-celestial': return t('frames.desc.celestial', state.language);
      case 'frame-void': return t('frames.desc.void', state.language);
      case 'frame-aurora': return t('frames.desc.aurora', state.language);
      case 'frame-radiant': return t('frames.desc.radiant', state.language);
      case 'frame-abyssal': return t('frames.desc.abyssal', state.language);
      case 'frame-inferno': return t('frames.desc.inferno', state.language);
      case 'frame-ethereal': return t('frames.desc.ethereal', state.language);
      case 'frame-omniscience': return t('frames.desc.omniscience', state.language);
      case 'frame-matrix': return t('frames.desc.matrix', state.language);
      case 'frame-viral': return t('frames.desc.viral', state.language);
      case 'frame-royal': return t('frames.desc.royal', state.language);
      case 'frame-dragon': return t('frames.desc.dragon', state.language);
      case 'frame-elite': return state.language === 'id' ? 'Bingkai Eksklusif Elite Zone' : 'Exclusive Elite Zone Frame';
      default: return '';
    }
  };

  const getFrameProgress = (f: string): { current: number, max: number } | null => {
    switch(f) {
      case 'frame-bronze': return { current: Math.min(state.level, 1), max: 1 };
      case 'frame-silver': return { current: Math.min(state.level, 3), max: 3 };
      case 'frame-gold': return { current: Math.min(state.level, 6), max: 6 };
      case 'frame-platinum': return { current: Math.min(state.level, 10), max: 10 };
      case 'frame-diamond': return { current: Math.min(state.level, 15), max: 15 };
      case 'frame-master': return { current: Math.min(state.level, 21), max: 21 };
      case 'frame-grandmaster': return { current: Math.min(state.level, 28), max: 28 };
      case 'frame-challenger': return { current: Math.min(state.level, 36), max: 36 };
      case 'frame-legend': return { current: Math.min(state.level, 43), max: 43 };
      case 'frame-mythic': return { current: Math.min(state.level || 0, 50), max: 50 };
      case 'frame-rgb': return { current: Math.min(state.streak || 0, 7), max: 7 };
      case 'frame-neon': return { current: Math.min(totalMissions, 50), max: 50 };
      case 'frame-fire': return { current: Math.min(state.streak || 0, 30), max: 30 };
      case 'frame-cyberpunk': return { current: Math.min(state.badges?.length || 0, 5), max: 5 };
      case 'frame-hologram': return { current: Math.min(totalMissions, 100), max: 100 };
      case 'frame-celestial': return { current: Math.min(ovr, 80), max: 80 };
      case 'frame-void': return { current: Math.min(state.level || 0, 20), max: 20 };
      case 'frame-aurora': return { current: Math.min(state.streak || 0, 60), max: 60 };
      case 'frame-radiant': return { current: Math.min(totalMissions, 200), max: 200 };
      case 'frame-abyssal': return { current: Math.min(totalMissions, 666), max: 666 };
      case 'frame-inferno': return { current: Math.min(state.streak || 0, 100), max: 100 };
      case 'frame-ethereal': return { current: Math.min(ovr, 95), max: 95 };
      case 'frame-omniscience': return { current: Math.min(ovr, 100), max: 100 };
      case 'frame-matrix': return { current: Math.min(totalMissions, 100), max: 100 };
      case 'frame-viral': return { current: Math.min(state.shareCount || 0, 5), max: 5 };
      default: return null;
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
              {t('frames.title', state.language)}
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
            
            <div className="text-center mb-4 w-full px-6">
              <h3 className="text-xl font-black text-primary font-display tracking-tight uppercase mb-1">
                {previewFrame.replace('frame-', '')}
              </h3>
              <p className="text-xs text-secondary/80 max-w-[250px] mx-auto">
                {getFrameDescription(previewFrame)}
              </p>
              
              {!isPreviewUnlocked && getFrameProgress(previewFrame) && (
                <div className="mt-3 max-w-[250px] mx-auto">
                  <div className="flex justify-between text-[10px] font-mono text-secondary mb-1">
                    <span>{t('frames.progress', state.language)}</span>
                    <span>{getFrameProgress(previewFrame)!.current} / {getFrameProgress(previewFrame)!.max}</span>
                  </div>
                  <div className="w-full h-1.5 bg-background rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-accent transition-all"
                      style={{ width: `${(getFrameProgress(previewFrame)!.current / getFrameProgress(previewFrame)!.max) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (isPreviewUnlocked) {
                  if (onGoToInventory) {
                    onGoToInventory();
                  } else {
                    handleEquip();
                  }
                }
              }}
              disabled={!isPreviewUnlocked}
              className={`w-full max-w-[250px] py-2.5 px-6 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                isPreviewEquipped 
                  ? 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white' 
                  : isPreviewUnlocked 
                    ? 'bg-accent text-white hover:bg-accent/90 shadow-[0_0_20px_var(--color-accent)]' 
                    : 'bg-surface border border-white/10 text-secondary cursor-not-allowed'
              }`}
            >
              {isPreviewEquipped ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{state.language === 'id' ? 'Pergi ke Inventori' : 'Go to Inventory'}</span>
                </>
              ) : isPreviewUnlocked ? (
                <span>{state.language === 'id' ? 'Pergi ke Inventori' : 'Go to Inventory'}</span>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>{t('frames.locked', state.language)}</span>
                </>
              )}
            </button>
          </div>

          {/* Grid Area */}
          <div className="flex-1 overflow-y-auto p-4 pb-safe">
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              {ALL_FRAMES.map((frame, idx) => {
                const isUnlocked = checkUnlocked(frame);
                const isEquipped = state.equippedFrame === frame || (frame === 'frame-default' && !state.equippedFrame);
                const isSelected = previewFrame === frame;

                return (
                  <button
                    key={`frame-${frame}-${idx}`}
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
                    {isEquipped && <div className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_var(--color-accent)]" />}
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
