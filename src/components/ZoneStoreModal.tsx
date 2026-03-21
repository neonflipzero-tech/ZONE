import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Lock, Shield, Star, Store, Package, Zap, Snowflake, CheckCircle2, Users } from 'lucide-react';
import { ZoneCoinIcon } from './ZoneCoinIcon';
import ProfileFrame from './ProfileFrame';
import { UserState, TITLES } from '../store';
import { t } from '../utils/translations';
import { sounds } from '../utils/sounds';
import ZoneCoinInfoModal from './ZoneCoinInfoModal';

interface ZoneStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: UserState;
  ovr: number;
  updateState: (updates: Partial<UserState>) => void;
}

const ALL_FRAMES = [
  'frame-default', 'frame-bronze', 'frame-silver', 'frame-gold', 'frame-platinum', 
  'frame-diamond', 'frame-master', 'frame-grandmaster', 'frame-challenger', 'frame-legend', 'frame-mythic',
  'frame-rgb', 'frame-neon', 'frame-fire', 'frame-cyberpunk', 'frame-hologram', 
  'frame-celestial', 'frame-void', 'frame-aurora', 'frame-radiant', 
  'frame-abyssal', 'frame-inferno', 'frame-ethereal', 'frame-omniscience', 'frame-matrix', 'frame-viral',
  'frame-royal', 'frame-dragon', 'frame-elite'
];

const FRAME_COSTS: Record<string, number> = {
  'frame-royal': 500,
  'frame-dragon': 750,
  'frame-elite': 2000,
};

export default function ZoneStoreModal({ isOpen, onClose, state, ovr, updateState }: ZoneStoreModalProps) {
  const [activeTab, setActiveTab] = useState<'frames' | 'titles' | 'items'>('frames');
  const [previewFrame, setPreviewFrame] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [isCoinInfoModalOpen, setIsCoinInfoModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPreviewFrame(null);
      setPreviewTitle(null);
      setPurchaseSuccess(null);
    }
  }, [isOpen]);

  const handlePurchase = (cost: number, itemName: string, updateFn: () => void) => {
    if ((state.zoneCoins || 0) >= cost) {
      sounds.playPurchase();
      updateFn();
      setPurchaseSuccess(itemName);
      setTimeout(() => setPurchaseSuccess(null), 3000);
    } else {
      sounds.playError();
    }
  };

  const isZaiki = state.username?.toLowerCase() === 'zaiki';
  const totalMissions = Object.values(state.dailyStats || {}).reduce((a, b) => (a as number) + (b as number), 0) as number;
  
  const checkFrameUnlocked = (frame: string) => {
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

  const getTitleProgress = (titleId: string): { current: number, max: number } | null => {
    switch(titleId) {
      case 'Unstoppable': return { current: Math.min(state.streak, 5), max: 5 };
      case 'Legend': return { current: Math.min(state.streak, 30), max: 30 };
      case 'Veteran': return { current: Math.min(state.level, 10), max: 10 };
      case 'Master': return { current: Math.min(state.level, 50), max: 50 };
      case 'Supporter': return { current: Math.min(state.shareCount || 0, 5), max: 5 };
      default: return null;
    }
  };

  const lockedFrames = ALL_FRAMES.filter(f => !checkFrameUnlocked(f));
  const lockedTitles = TITLES.filter(t => !isZaiki && !state.titles.includes(t.id));

  if (!isOpen) return null;

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
              <Store className="w-5 h-5 text-accent mr-2" />
              {state.language === 'id' ? 'Toko Zona' : 'Zone Store'}
            </h2>
            <button 
              onClick={() => setIsCoinInfoModalOpen(true)}
              className="flex items-center space-x-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20 hover:scale-105 transition-transform cursor-pointer"
            >
              <ZoneCoinIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold text-yellow-400">{state.zoneCoins || 0}</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => { sounds.playClick(); setActiveTab('frames'); setPreviewFrame(null); setPreviewTitle(null); }}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${
                activeTab === 'frames' ? 'text-accent' : 'text-secondary hover:text-primary'
              }`}
            >
              <div className="flex items-center justify-center">
                <Shield className="w-4 h-4 mr-2" />
                {t('profile.profile_frames', state.language)}
              </div>
              {activeTab === 'frames' && (
                <motion.div layoutId="zoneStoreTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
            <button
              onClick={() => { sounds.playClick(); setActiveTab('titles'); setPreviewFrame(null); setPreviewTitle(null); }}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${
                activeTab === 'titles' ? 'text-accent' : 'text-secondary hover:text-primary'
              }`}
            >
              <div className="flex items-center justify-center">
                <Star className="w-4 h-4 mr-2" />
                {t('profile.titles', state.language)}
              </div>
              {activeTab === 'titles' && (
                <motion.div layoutId="zoneStoreTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
            <button
              onClick={() => { sounds.playClick(); setActiveTab('items'); setPreviewFrame(null); setPreviewTitle(null); }}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${
                activeTab === 'items' ? 'text-accent' : 'text-secondary hover:text-primary'
              }`}
            >
              <div className="flex items-center justify-center">
                <Package className="w-4 h-4 mr-2" />
                {state.language === 'id' ? 'Item' : 'Items'}
              </div>
              {activeTab === 'items' && (
                <motion.div layoutId="zoneStoreTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
          </div>

          {/* Preview Area */}
          {(previewFrame || previewTitle) && (
            <div className="flex-shrink-0 flex flex-col items-center justify-center py-6 px-6 bg-gradient-to-b from-surface/80 to-background border-b border-white/5">
              {activeTab === 'frames' && previewFrame && (
                <>
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
                    
                    {getFrameProgress(previewFrame) && (
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

                    {FRAME_COSTS[previewFrame] && (
                      <button
                        onClick={() => handlePurchase(FRAME_COSTS[previewFrame], previewFrame, () => {
                          updateState({
                            zoneCoins: (state.zoneCoins || 0) - FRAME_COSTS[previewFrame],
                            unlockedFrames: [...(state.unlockedFrames || []), previewFrame]
                          });
                        })}
                        disabled={(state.zoneCoins || 0) < FRAME_COSTS[previewFrame]}
                        className={`mt-4 w-full max-w-[200px] mx-auto py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                          (state.zoneCoins || 0) >= FRAME_COSTS[previewFrame] 
                            ? 'bg-accent text-background hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]' 
                            : 'bg-white/5 text-white/30 cursor-not-allowed'
                        }`}
                      >
                        <span>{state.language === 'id' ? 'Beli' : 'Buy'}</span>
                        <div className="flex items-center space-x-1">
                          <ZoneCoinIcon className="w-4 h-4" />
                          <span>{FRAME_COSTS[previewFrame]}</span>
                        </div>
                      </button>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'titles' && previewTitle && (() => {
                const titleDef = TITLES.find(t => t.id === previewTitle);
                if (!titleDef) return null;
                return (
                  <>
                    <motion.div 
                      key={previewTitle}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="mb-4"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-surface border border-white/10 flex items-center justify-center shadow-2xl">
                        <Star className={`w-10 h-10 ${titleDef.specialColor || 'text-primary'}`} />
                      </div>
                    </motion.div>
                    
                    <div className="text-center mb-4 w-full px-6">
                      <h3 className={`text-xl font-black font-display tracking-tight uppercase mb-1 ${titleDef.specialColor || 'text-primary'}`}>
                        {titleDef.name[state.language]}
                      </h3>
                      <p className="text-xs text-secondary/80 max-w-[250px] mx-auto">
                        {titleDef.desc[state.language]}
                      </p>
                      
                      {getTitleProgress(previewTitle) && (
                        <div className="mt-3 max-w-[250px] mx-auto">
                          <div className="flex justify-between text-[10px] font-mono text-secondary mb-1">
                            <span>{t('frames.progress', state.language)}</span>
                            <span>{getTitleProgress(previewTitle)!.current} / {getTitleProgress(previewTitle)!.max}</span>
                          </div>
                          <div className="w-full h-1.5 bg-background rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="h-full bg-accent transition-all"
                              style={{ width: `${(getTitleProgress(previewTitle)!.current / getTitleProgress(previewTitle)!.max) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Grid Area */}
          <div className="flex-1 overflow-y-auto p-4 pb-safe">
            {activeTab === 'frames' && (
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                {lockedFrames.length > 0 ? lockedFrames.map((frame, idx) => {
                  const isSelected = previewFrame === frame;

                  return (
                    <button
                      key={`locked-frame-${frame}-${idx}`}
                      onClick={() => setPreviewFrame(frame)}
                      className={`relative aspect-square rounded-2xl p-2 transition-all flex flex-col items-center justify-center gap-2 ${
                        isSelected ? 'bg-white/10 border-2 border-white/30 scale-105 z-10' : 
                        'bg-surface/30 border border-white/5 opacity-50'
                      }`}
                    >
                      <div className="scale-75 origin-center pointer-events-none">
                        <ProfileFrame frame={frame} src={state.profilePicture} size="md" />
                      </div>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-primary font-bold truncate w-full text-center px-1">
                        {frame.replace('frame-', '')}
                      </span>
                      <Lock className="absolute top-2 right-2 w-3 h-3 text-white/50" />
                    </button>
                  );
                }) : (
                  <div className="col-span-3 text-center py-10 text-secondary text-sm">
                    {state.language === 'id' ? 'Semua bingkai telah terbuka!' : 'All frames unlocked!'}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'titles' && (
              <div className="flex flex-col gap-2 max-w-md mx-auto">
                {lockedTitles.length > 0 ? lockedTitles.map((titleDef, idx) => {
                  const isSelected = previewTitle === titleDef.id;

                  return (
                    <button
                      key={`locked-title-${titleDef.id}-${idx}`}
                      onClick={() => setPreviewTitle(titleDef.id)}
                      className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                        isSelected ? 'bg-white/10 border border-white/30 scale-[1.02] z-10' : 
                        'bg-surface/30 border border-white/5 opacity-80'
                      }`}
                    >
                      <span className={`text-sm font-bold ${titleDef.specialColor || 'text-primary'}`}>
                        {titleDef.name[state.language]}
                      </span>
                      <Lock className="w-4 h-4 text-white/50" />
                    </button>
                  );
                }) : (
                  <div className="text-center py-10 text-secondary text-sm">
                    {state.language === 'id' ? 'Semua gelar telah terbuka!' : 'All titles unlocked!'}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'items' && (
              <div className="flex flex-col gap-3 max-w-md mx-auto">
                {/* 2x XP Potion */}
                <div className="p-4 rounded-2xl bg-surface/50 border border-white/10 flex flex-col">
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
                  </div>
                  <button
                    onClick={() => handlePurchase(100, '2x XP Potion', () => {
                      updateState({
                        zoneCoins: (state.zoneCoins || 0) - 100,
                        doubleXpPotions: (state.doubleXpPotions || 0) + 1
                      });
                    })}
                    disabled={(state.zoneCoins || 0) < 100}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                      (state.zoneCoins || 0) >= 100 
                        ? 'bg-accent text-background hover:bg-accent/90' 
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <span>{state.language === 'id' ? 'Beli' : 'Buy'}</span>
                    <div className="flex items-center space-x-1">
                      <ZoneCoinIcon className="w-4 h-4" />
                      <span>100</span>
                    </div>
                  </button>
                </div>

                {/* Streak Freeze */}
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
                  </div>
                  <button
                    onClick={() => handlePurchase(150, 'Streak Freeze', () => {
                      updateState({
                        zoneCoins: (state.zoneCoins || 0) - 150,
                        streakFreezes: (state.streakFreezes || 0) + 1
                      });
                    })}
                    disabled={(state.zoneCoins || 0) < 150}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                      (state.zoneCoins || 0) >= 150 
                        ? 'bg-accent text-background hover:bg-accent/90' 
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <span>{state.language === 'id' ? 'Beli' : 'Buy'}</span>
                    <div className="flex items-center space-x-1">
                      <ZoneCoinIcon className="w-4 h-4" />
                      <span>150</span>
                    </div>
                  </button>
                </div>

                {/* 2x Coin Potion */}
                <div className="p-4 rounded-2xl bg-surface/50 border border-white/10 flex flex-col">
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
                  </div>
                  <button
                    onClick={() => handlePurchase(200, '2x Coin Potion', () => {
                      updateState({
                        zoneCoins: (state.zoneCoins || 0) - 200,
                        doubleCoinPotions: (state.doubleCoinPotions || 0) + 1
                      });
                    })}
                    disabled={(state.zoneCoins || 0) < 200}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                      (state.zoneCoins || 0) >= 200 
                        ? 'bg-accent text-background hover:bg-accent/90' 
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    <span>{state.language === 'id' ? 'Beli' : 'Buy'}</span>
                    <div className="flex items-center space-x-1">
                      <ZoneCoinIcon className="w-4 h-4" />
                      <span>200</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
            <div className="h-8" /> {/* Extra padding at bottom */}
          </div>

          {/* Purchase Success Overlay */}
          <AnimatePresence>
            {purchaseSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[200] bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="mb-8"
                >
                  {activeTab === 'frames' ? (
                    <ProfileFrame frame={purchaseSuccess} src={state.profilePicture} size="2xl" />
                  ) : (
                    <div className="w-32 h-32 rounded-3xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
                      <CheckCircle2 className="w-16 h-16 text-green-400" />
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-3xl font-black text-primary font-display tracking-tight uppercase mb-2">
                    {state.language === 'id' ? 'PEMBELIAN BERHASIL!' : 'PURCHASE SUCCESS!'}
                  </h3>
                  <p className="text-secondary mb-8">
                    {state.language === 'id' 
                      ? `${purchaseSuccess.replace('frame-', '').toUpperCase()} telah ditambahkan ke inventori Anda.` 
                      : `${purchaseSuccess.replace('frame-', '').toUpperCase()} has been added to your inventory.`}
                  </p>
                  
                  <button
                    onClick={() => setPurchaseSuccess(null)}
                    className="px-8 py-3 bg-accent text-background rounded-xl font-bold hover:scale-105 active:scale-95 transition-transform"
                  >
                    {state.language === 'id' ? 'Lanjutkan' : 'Continue'}
                  </button>
                </motion.div>

                {/* Confetti-like particles */}
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={`confetti-${i}`}
                    initial={{ 
                      x: 0, 
                      y: 0, 
                      scale: 0 
                    }}
                    animate={{ 
                      x: (Math.random() - 0.5) * 400, 
                      y: (Math.random() - 0.5) * 400, 
                      scale: Math.random() * 1.5,
                      rotate: Math.random() * 360
                    }}
                    transition={{ 
                      duration: 1.5, 
                      ease: "easeOut" 
                    }}
                    className="absolute w-2 h-2 bg-accent rounded-full pointer-events-none"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
      
      <ZoneCoinInfoModal
        isOpen={isCoinInfoModalOpen}
        onClose={() => setIsCoinInfoModalOpen(false)}
        state={state}
      />
    </AnimatePresence>
  );
}
