import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Shield, Star, Package, CheckCircle2, Zap, Snowflake } from 'lucide-react';
import { ZoneCoinIcon } from './ZoneCoinIcon';
import { useAppState, isFrameUnlocked, TITLES, ALL_FRAMES } from '../store';
import ProfileFrame from './ProfileFrame';
import { t } from '../utils/translations';
import { sounds } from '../utils/sounds';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InventoryModal({ isOpen, onClose }: InventoryModalProps) {
  const { state, updateState } = useAppState();
  const [activeTab, setActiveTab] = useState<'frames' | 'titles' | 'items'>('frames');
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [coinTimeLeft, setCoinTimeLeft] = useState<string | null>(null);
  const [isUsing, setIsUsing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    const updateTimer = () => {
      const currentState = useAppState.getState().state;
      if (!currentState) return;
      const now = new Date().getTime();

      // XP Timer
      if (currentState.doubleXpActiveUntil) {
        const end = new Date(currentState.doubleXpActiveUntil).getTime();
        const diff = end - now;
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(null);
          updateState({ doubleXpActiveUntil: null });
        }
      } else {
        setTimeLeft(null);
      }

      // Coin Timer
      if (currentState.doubleCoinActiveUntil) {
        const end = new Date(currentState.doubleCoinActiveUntil).getTime();
        const diff = end - now;
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setCoinTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setCoinTimeLeft(null);
          updateState({ doubleCoinActiveUntil: null });
        }
      } else {
        setCoinTimeLeft(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isOpen, updateState]);

  if (!isOpen) return null;

  const isZaiki = state.username?.toLowerCase() === 'zaiki';
  const totalMissions = Object.values(state.dailyStats || {}).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0) as number;
  const ovr = Math.round(
    ((state.stats?.physical || 1) +
    (state.stats?.discipline || 1) +
    (state.stats?.mental || 1) +
    (state.stats?.ambition || 1) +
    (state.stats?.intellect || 1) +
    (state.stats?.social || 1)) / 6
  );

  const unlockedFrames = ALL_FRAMES.filter(f => isFrameUnlocked(f, state));
  const unlockedTitles = TITLES.filter(t => isZaiki || state.unlockedTitles.includes(t.id));

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
              <Package className="w-5 h-5 text-accent mr-2" />
              {state.language === 'id' ? 'Inventori' : 'Inventory'}
            </h2>
            <div className="w-10" />
          </div>

          {/* Use Animation Overlay */}
          <AnimatePresence>
            {isUsing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[110] bg-accent/20 backdrop-blur-md flex items-center justify-center pointer-events-none"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                  animate={{ 
                    scale: [0.5, 1.2, 1], 
                    opacity: 1,
                    rotate: 0
                  }}
                  className="flex flex-col items-center"
                >
                  <div className="bg-white text-accent p-6 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.5)] mb-4">
                    <CheckCircle2 className="w-16 h-16" strokeWidth={3} />
                  </div>
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white text-black px-6 py-2 rounded-full font-black text-xl uppercase italic shadow-xl"
                  >
                    {state.language === 'id' ? 'ITEM DIGUNAKAN!' : 'ITEM USED!'}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preview Area */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center py-6 px-6 bg-gradient-to-b from-surface/80 to-background border-b border-white/5">
            <div className="relative">
              <ProfileFrame frame={state.equippedFrame || 'frame-default'} src={state.profilePicture} size="lg" />
            </div>
            {state.equippedTitle && (() => {
              const titleDef = TITLES.find(t => t.id === state.equippedTitle);
              return (
                <div className="mt-4">
                  <div className={`text-sm font-bold uppercase tracking-widest inline-block ${titleDef?.specialColor || 'text-accent'}`}>
                    {titleDef?.name[state.language] || state.equippedTitle}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => { sounds.playClick(); setActiveTab('frames'); }}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${
                activeTab === 'frames' ? 'text-accent' : 'text-secondary hover:text-primary'
              }`}
            >
              <div className="flex items-center justify-center">
                <Shield className="w-4 h-4 mr-2" />
                {t('profile.profile_frames', state.language)}
              </div>
              {activeTab === 'frames' && (
                <motion.div layoutId="inventoryTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
            <button
              onClick={() => { sounds.playClick(); setActiveTab('titles'); }}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${
                activeTab === 'titles' ? 'text-accent' : 'text-secondary hover:text-primary'
              }`}
            >
              <div className="flex items-center justify-center">
                <Star className="w-4 h-4 mr-2" />
                {t('profile.titles', state.language)}
              </div>
              {activeTab === 'titles' && (
                <motion.div layoutId="inventoryTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
            <button
              onClick={() => { sounds.playClick(); setActiveTab('items'); }}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${
                activeTab === 'items' ? 'text-accent' : 'text-secondary hover:text-primary'
              }`}
            >
              <div className="flex items-center justify-center">
                <Package className="w-4 h-4 mr-2" />
                {state.language === 'id' ? 'Item' : 'Items'}
              </div>
              {activeTab === 'items' && (
                <motion.div layoutId="inventoryTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
          </div>

          {/* Grid Area */}
          <div className="flex-1 overflow-y-auto p-4 pb-safe">
            {activeTab === 'frames' && (
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <div className="grid grid-cols-3 gap-3">
                  {unlockedFrames.map((frame, idx) => {
                    const isEquipped = state.equippedFrame === frame || (frame === 'frame-default' && !state.equippedFrame);
                    return (
                      <button
                        key={`unlocked-frame-${frame}-${idx}`}
                        onClick={() => {
                          sounds.playEquip();
                          updateState({ equippedFrame: frame === 'frame-default' ? null : frame });
                        }}
                        className={`relative aspect-square rounded-2xl p-2 transition-all flex flex-col items-center justify-center gap-2 ${
                          isEquipped ? 'bg-accent/10 border border-accent/50' : 'bg-surface border border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="scale-75 origin-center pointer-events-none">
                          <ProfileFrame frame={frame} src={state.profilePicture} size="md" />
                        </div>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-primary font-bold truncate w-full text-center px-1">
                          {frame.replace('frame-', '')}
                        </span>
                        {isEquipped && <div className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_var(--color-accent)]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {activeTab === 'titles' && (
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <div className="flex flex-col gap-2">
                  {unlockedTitles.map((titleDef, idx) => {
                    const isEquipped = state.equippedTitle === titleDef.id;
                    return (
                      <button
                        key={`unlocked-title-${titleDef.id}-${idx}`}
                        onClick={() => {
                          sounds.playEquip();
                          updateState({ equippedTitle: titleDef.id });
                        }}
                        className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                          isEquipped ? 'bg-accent/10 border border-accent/50' : 'bg-surface border border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className={`text-sm font-bold inline-block ${titleDef.specialColor || 'text-primary'}`}>
                          {titleDef.name[state.language]}
                        </div>
                        {isEquipped && (
                          <span className="text-[10px] text-accent font-mono uppercase tracking-widest flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {t('profile.equipped', state.language)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div className="flex flex-col gap-3 max-w-md mx-auto">
                {((state.doubleXpPotions || 0) === 0 && (state.streakFreezes || 0) === 0 && (state.doubleCoinPotions || 0) === 0) ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-surface/50 border border-white/5 flex items-center justify-center mb-4">
                      <Package className="w-8 h-8 text-secondary" />
                    </div>
                    <p className="text-secondary font-medium">
                      {state.language === 'id' ? 'Belum ada item' : 'No items yet'}
                    </p>
                    <p className="text-xs text-white/30 mt-1">
                      {state.language === 'id' ? 'Beli item di Zone Store' : 'Buy items in the Zone Store'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 2x XP Potion */}
                    {(state.doubleXpPotions || 0) > 0 && (
                        <motion.div 
                          whileTap={{ scale: 0.98 }}
                          className="p-4 rounded-2xl bg-surface/50 border border-white/10 flex flex-col"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                <Zap className="w-6 h-6 text-purple-400" />
                              </div>
                              <div>
                                <h4 className="font-bold text-primary">2x XP Potion</h4>
                                <p className="text-xs text-secondary mt-0.5">
                                  {state.language === 'id' ? 'Gandakan XP selama 24 jam' : 'Double XP for 24 hours'}
                                </p>
                              </div>
                            </div>
                            <div className="bg-surface px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-primary">
                              x{state.doubleXpPotions || 0}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if ((state.doubleXpPotions || 0) > 0) {
                                sounds.playUseItem();
                                setIsUsing(true);
                                setTimeout(() => setIsUsing(false), 1500);
                                const now = new Date();
                                now.setHours(now.getHours() + 24);
                                updateState({
                                  doubleXpPotions: (state.doubleXpPotions || 0) - 1,
                                  doubleXpActiveUntil: now.toISOString()
                                });
                              }
                            }}
                            disabled={(state.doubleXpPotions || 0) === 0 || (state.doubleXpActiveUntil ? new Date(state.doubleXpActiveUntil) > new Date() : false)}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                              (state.doubleXpPotions || 0) > 0 && !(state.doubleXpActiveUntil ? new Date(state.doubleXpActiveUntil) > new Date() : false)
                                ? 'bg-purple-500 text-white hover:bg-purple-600' 
                                : 'bg-white/5 text-white/30 cursor-not-allowed'
                            }`}
                          >
                            <span>
                              {state.doubleXpActiveUntil && new Date(state.doubleXpActiveUntil) > new Date()
                                ? (state.language === 'id' ? `Aktif (${timeLeft})` : `Active (${timeLeft})`)
                                : (state.language === 'id' ? 'Gunakan' : 'Use')}
                            </span>
                          </button>
                        </motion.div>
                    )}

                    {/* Streak Freeze */}
                    {(state.streakFreezes || 0) > 0 && (
                      <div className="p-4 rounded-2xl bg-surface/50 border border-white/10 flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                              <Snowflake className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-bold text-primary">Streak Freeze</h4>
                              <p className="text-xs text-secondary mt-0.5">
                                {state.language === 'id' ? 'Lindungi streak Anda selama 1 hari' : 'Protect your streak for 1 day'}
                              </p>
                            </div>
                          </div>
                          <div className="bg-surface px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-primary">
                            x{state.streakFreezes || 0}
                          </div>
                        </div>
                        <div className="w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 bg-white/5 text-white/50">
                          <span>{state.language === 'id' ? 'Otomatis digunakan saat terlewat' : 'Automatically used when missed'}</span>
                        </div>
                      </div>
                    )}

                    {/* 2x Coin Potion */}
                    {(state.doubleCoinPotions || 0) > 0 && (
                      <motion.div 
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-2xl bg-surface/50 border border-white/10 flex flex-col"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                              <ZoneCoinIcon className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                              <h4 className="font-bold text-primary">2x Coin Potion</h4>
                              <p className="text-xs text-secondary mt-0.5">
                                {state.language === 'id' ? 'Gandakan Zone Coins selama 24 jam' : 'Double Zone Coins for 24 hours'}
                              </p>
                            </div>
                          </div>
                          <div className="bg-surface px-3 py-1 rounded-full border border-white/10 text-xs font-bold text-primary">
                            x{state.doubleCoinPotions || 0}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if ((state.doubleCoinPotions || 0) > 0) {
                              sounds.playUseItem();
                              setIsUsing(true);
                              setTimeout(() => setIsUsing(false), 1500);
                              const now = new Date();
                              now.setHours(now.getHours() + 24);
                              updateState({
                                doubleCoinPotions: (state.doubleCoinPotions || 0) - 1,
                                doubleCoinActiveUntil: now.toISOString()
                              });
                            }
                          }}
                          disabled={(state.doubleCoinPotions || 0) === 0 || (state.doubleCoinActiveUntil ? new Date(state.doubleCoinActiveUntil) > new Date() : false)}
                          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                            (state.doubleCoinPotions || 0) > 0 && !(state.doubleCoinActiveUntil ? new Date(state.doubleCoinActiveUntil) > new Date() : false)
                              ? 'bg-white text-black hover:bg-gray-200' 
                              : 'bg-white/5 text-white/30 cursor-not-allowed'
                          }`}
                        >
                          <span>
                            {state.doubleCoinActiveUntil && new Date(state.doubleCoinActiveUntil) > new Date()
                              ? (state.language === 'id' ? `Aktif (${coinTimeLeft})` : `Active (${coinTimeLeft})`)
                              : (state.language === 'id' ? 'Gunakan' : 'Use')}
                          </span>
                        </button>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            )}
            <div className="h-8" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
