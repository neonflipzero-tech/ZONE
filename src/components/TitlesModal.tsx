import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Lock, CheckCircle2, Award } from 'lucide-react';
import { TITLES, UserState } from '../store';

interface TitlesModalProps {
  state: UserState;
  onClose: () => void;
  updateState: (updates: Partial<UserState>) => void;
}

export default function TitlesModal({ state, onClose, updateState }: TitlesModalProps) {
  const [previewTitle, setPreviewTitle] = useState<string>(state.equippedTitle || 'Newbie');

  useEffect(() => {
    setPreviewTitle(state.equippedTitle || 'Newbie');
  }, [state.equippedTitle]);

  const isZaiki = state.username?.toLowerCase() === 'zaiki';

  const handleEquip = () => {
    if (isZaiki || state.titles.includes(previewTitle)) {
      updateState({ equippedTitle: previewTitle });
    }
  };

  const getProgress = (titleId: string): { current: number, max: number } | null => {
    switch (titleId) {
      case 'Unstoppable': return { current: Math.min(state.streak, 5), max: 5 };
      case 'Legend': return { current: Math.min(state.streak, 30), max: 30 };
      case 'Veteran': return { current: Math.min(state.level, 10), max: 10 };
      case 'Master': return { current: Math.min(state.level, 50), max: 50 };
      case 'Supporter': return { current: Math.min(state.shareCount || 0, 5), max: 5 };
      default: return null;
    }
  };

  const isPreviewEquipped = state.equippedTitle === previewTitle;
  const isPreviewUnlocked = isZaiki || state.titles.includes(previewTitle);
  const previewTitleDef = TITLES.find(t => t.id === previewTitle);
  const progress = getProgress(previewTitle);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-surface/50 backdrop-blur-md z-10">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-primary" />
        </button>
        <h2 className="text-lg font-bold text-primary flex items-center">
          <Award className="w-5 h-5 text-accent mr-2" />
          {state.language === 'id' ? 'Koleksi Gelar' : 'Title Collection'}
        </h2>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Preview Area */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center py-8 px-6 bg-gradient-to-b from-surface/80 to-background border-b border-white/5">
        <motion.div 
          key={previewTitle}
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="mb-6 flex flex-col items-center"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/20"></div>
            <span className={`text-xs font-display font-bold uppercase tracking-[0.2em] ${previewTitleDef?.specialColor || 'text-accent'}`}>
              {previewTitleDef?.name[state.language]}
            </span>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/20"></div>
          </div>
          <h2 className="text-3xl font-black font-display tracking-tight text-white/50">{state.username}</h2>
        </motion.div>
        
        <div className="text-center mb-6 w-full px-6">
          <p className="text-sm text-secondary/80 max-w-[280px] mx-auto">
            {previewTitleDef?.desc[state.language]}
          </p>
          
          {!isPreviewUnlocked && progress && (
            <div className="mt-4 max-w-[250px] mx-auto">
              <div className="flex justify-between text-[10px] font-mono text-secondary mb-1">
                <span>{state.language === 'id' ? 'Progres' : 'Progress'}</span>
                <span>{progress.current} / {progress.max}</span>
              </div>
              <div className="w-full h-1.5 bg-background rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-accent transition-all"
                  style={{ width: `${(progress.current / progress.max) * 100}%` }}
                />
              </div>
            </div>
          )}
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
            <span>{state.language === 'id' ? 'Gunakan Gelar' : 'Equip Title'}</span>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              <span>{state.language === 'id' ? 'Terkunci' : 'Locked'}</span>
            </>
          )}
        </button>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-safe">
        <div className="flex flex-col gap-3 max-w-md mx-auto">
          {TITLES.map((titleDef) => {
            const isUnlocked = isZaiki || state.titles.includes(titleDef.id);
            const isEquipped = state.equippedTitle === titleDef.id;
            const isSelected = previewTitle === titleDef.id;
            
            return (
              <button 
                key={titleDef.id} 
                onClick={() => setPreviewTitle(titleDef.id)}
                className={`text-left border rounded-xl p-4 flex items-center justify-between transition-all ${
                  isSelected ? 'bg-white/10 border-white/30 scale-[1.02] z-10' :
                  isUnlocked 
                    ? isEquipped
                      ? 'bg-accent/10 border-accent/50'
                      : 'bg-surface border-white/5 hover:border-white/20' 
                    : 'bg-surface/30 border-white/5 opacity-50 grayscale'
                }`}
              >
                <div>
                  <div className={`text-base font-bold leading-tight mb-1 ${isUnlocked ? (titleDef.specialColor || 'text-primary') : 'text-secondary'}`}>
                    {titleDef.name[state.language]}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-secondary">
                    {!isUnlocked ? (state.language === 'id' ? 'Terkunci' : 'Locked') : 
                     isEquipped ? (state.language === 'id' ? 'Dipakai' : 'Equipped') : 
                     (state.language === 'id' ? 'Tersedia' : 'Available')}
                  </div>
                </div>
                {!isUnlocked && <Lock className="w-4 h-4 text-white/30" />}
                {isEquipped && <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_rgba(242,125,38,1)]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
