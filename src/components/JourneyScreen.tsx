import React, { useEffect, useRef, useState, useLayoutEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserState, getRankForLevel, RANKS, useAppState } from '../store';
import { Shield, Lock, Star, Check, User, Share2, Zap, Crown } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ProfileFrame from './ProfileFrame';
import { shareContent, shareElementAsImage } from '../utils/share';
import { t } from '../utils/translations';

interface JourneyScreenProps {
  state: UserState;
  updateState: (updates: Partial<UserState>) => void;
}

const JourneyScreen = ({ state, updateState }: JourneyScreenProps) => {
  if (!state) return null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const incrementShareCount = useAppState(s => s.incrementShareCount);
  const [displayLevelCharacter, setDisplayLevelCharacter] = useState(state.animatingLevelUp ? state.previousLevel : state.level);
  const [displayLevelPfp, setDisplayLevelPfp] = useState(state.animatingLevelUp ? state.previousLevel : state.level);
  const [showRankUpOverlay, setShowRankUpOverlay] = useState(false);
  
  const prevRank = useMemo(() => getRankForLevel(state.previousLevel), [state.previousLevel]);
  const currentRank = useMemo(() => getRankForLevel(state.level), [state.level]);
  const isRankUp = useMemo(() => prevRank.name !== currentRank.name && state.animatingLevelUp, [prevRank.name, currentRank.name, state.animatingLevelUp]);
  
  // Generate levels to show (at least up to max level 50, or current level + 5)
  const levels = useMemo(() => {
    const maxLevelToShow = Math.min(50, Math.max(50, state.level + 5));
    return Array.from({ length: maxLevelToShow }, (_, i) => i + 1).reverse();
  }, [state.level]);

  const hasScrolledRef = useRef(false);

  // 1. Instant jump to bottom before first paint
  useLayoutEffect(() => {
    if (scrollRef.current && !state.animatingLevelUp && !hasScrolledRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight + 5000;
    }
  }, [state.animatingLevelUp]);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];
    
    if (state.animatingLevelUp) {
      // ... existing level up animation logic ...
      const prevLevelElement = document.getElementById(`level-${state.previousLevel}`);
      if (prevLevelElement) {
        prevLevelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      const t1 = setTimeout(() => {
        setDisplayLevelCharacter(state.level);
        const currentLevelElement = document.getElementById(`level-${state.level}`);
        if (currentLevelElement) {
          currentLevelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        const t2 = setTimeout(() => {
          setDisplayLevelPfp(state.level);
          if (isRankUp) {
            const t3 = setTimeout(() => {
              setShowRankUpOverlay(true);
              import('../utils/sounds').then(({ sounds }) => sounds.playLevelUp());
              const t4 = setTimeout(() => {
                setShowRankUpOverlay(false);
                updateState({ animatingLevelUp: false, previousLevel: state.level });
              }, 1500);
              timers.push(t4);
            }, 800);
            timers.push(t3);
          } else {
            const t3 = setTimeout(() => {
              import('../utils/sounds').then(({ sounds }) => sounds.playLevelUp());
              updateState({ animatingLevelUp: false, previousLevel: state.level });
            }, 800);
            timers.push(t3);
          }
        }, 800);
        timers.push(t2);
      }, 800);
      timers.push(t1);
    } else {
      setDisplayLevelCharacter(state.level);
      setDisplayLevelPfp(state.level);
      setShowRankUpOverlay(false);
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [state.animatingLevelUp, state.level, state.previousLevel, updateState, isRankUp]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => {
        // Trigger scroll animation after entrance animation
        if (!state.animatingLevelUp) {
          const container = scrollRef.current;
          if (container) {
            const targetElement = document.getElementById(`level-${state.level}`);
            if (targetElement) {
              const targetRect = targetElement.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              const targetScrollTop = container.scrollTop + (targetRect.top - containerRect.top) - (containerRect.height / 2) + (targetRect.height / 2);
              
              container.scrollTo({ 
                top: targetScrollTop, 
                behavior: 'smooth' 
              });
            }
          }
        }
      }}
      className="flex flex-col h-full bg-background overflow-y-auto no-scrollbar pb-24 relative"
      ref={scrollRef}
    >
      <div className="px-6 pt-12 pb-6 sticky top-0 bg-background/80 backdrop-blur-md z-20 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">
            {t('journey.title', state.language)}
          </h1>
          <p className="text-secondary text-sm">
            {t('journey.subtitle', state.language)}
          </p>
        </div>
        {state.animatingLevelUp && (
          <button 
            onClick={() => {
              setDisplayLevelCharacter(state.level);
              setDisplayLevelPfp(state.level);
              setShowRankUpOverlay(false);
              updateState({ animatingLevelUp: false, previousLevel: state.level });
            }}
            className="bg-surface border border-white/10 px-4 py-2 rounded-full text-xs font-bold text-primary hover:bg-surface-hover transition-colors"
          >
            {t('journey.skip', state.language)}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showRankUpOverlay && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
          >
            <div id="rank-up-card" className="text-center flex flex-col items-center p-8 rounded-3xl relative">
              <div
                className="absolute w-96 h-96 bg-accent/20 rounded-full blur-3xl -z-10 animate-pulse"
              />
              <Shield className={`w-32 h-32 mb-8 ${currentRank.color} drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]`} />
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-display font-black mb-4 tracking-tight"
              >
                {t('journey.rank_up', state.language)}
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`text-2xl font-mono uppercase tracking-widest ${currentRank.color} mb-8`}
              >
                {currentRank.name}
              </motion.p>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                onClick={async () => {
                  const success = await shareElementAsImage(
                    'rank-up-card',
                    'I Ranked Up!',
                    `I just reached ${currentRank.name} (Level ${state.level}) on ZONE! Join me and lock in.`
                  );
                  if (success) {
                    incrementShareCount();
                  }
                }}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-full font-bold transition-colors backdrop-blur-md"
              >
                <Share2 className="w-5 h-5" />
                <span>{t('journey.share_milestone', state.language)}</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full max-w-sm mx-auto py-10 px-4 flex flex-col items-center">
        {/* The Path Line */}
        {(() => {
          const reversedLevels = [...levels].reverse();
          const currentIndex = reversedLevels.findIndex(l => l === displayLevelPfp);
          const progress = currentIndex >= 0 ? currentIndex / (levels.length - 1) : 0;

          return (
            <div className="absolute top-[80px] bottom-[80px] left-1/2 -translate-x-1/2 w-2 z-0 flex flex-col justify-end">
              {/* Background Line */}
              <div className="absolute inset-0 bg-white/10 rounded-full" />
              
              {/* Progress Line (Pink) */}
              <motion.div 
                className="w-full bg-[#ec4899] rounded-full relative z-10"
                initial={state.animatingLevelUp ? { height: 0 } : { height: `${progress * 100}%` }}
                animate={{ height: `${progress * 100}%` }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                style={{ boxShadow: '0 0 15px #ec4899, 0 0 30px #ec4899' }}
              />
            </div>
          );
        })()}

        {levels.map((level, index) => {
          const isCharacterHere = level === displayLevelCharacter;
          const isPfpHere = level === displayLevelPfp;
          const isCompleted = level < displayLevelPfp;
          const isLocked = level > displayLevelPfp;
          
          const rankForLevel = getRankForLevel(level);
          const isMilestone = RANKS.some(r => r.minLevel === level);

          return (
            <motion.div 
              key={level} 
              id={`level-${level}`}
              initial={{ opacity: 1, y: 0 }}
              className="relative w-full flex items-center justify-center my-12 z-10"
            >
              {/* Node */}
              <div 
                className="relative flex items-center justify-center"
                style={{ width: '64px' }}
              >
                {isPfpHere && (
                  <motion.div 
                    layoutId="glow"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute w-20 h-20 bg-accent/20 rounded-full blur-xl"
                  />
                )}

                {/* The Character Standing on the current node */}
                {isCharacterHere && (
                  <motion.div 
                    layoutId="character"
                    initial={{ y: -10 }}
                    animate={{ y: [-10, -20, -10] }}
                    transition={{ 
                      y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                      layout: { type: "spring", stiffness: 50, damping: 15 }
                    }}
                    className="absolute -top-20 z-30 pointer-events-none"
                  >
                    <div className="relative">
                      <img 
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${state.username}&backgroundColor=transparent`} 
                        alt="Character" 
                        className="w-24 h-24 drop-shadow-2xl filter drop-shadow-[0_10px_10px_rgba(244,63,94,0.5)]" 
                      />
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/40 rounded-full blur-sm -z-10" />
                    </div>
                  </motion.div>
                )}
                
                <div 
                  className={`w-16 h-16 flex items-center justify-center relative z-10 transition-all rounded-full ${
                    isPfpHere 
                      ? 'scale-110' 
                      : isCompleted 
                        ? 'bg-accent border-accent/50 border-4 shadow-xl' 
                        : 'bg-surface border-4 shadow-xl'
                  }`}
                  style={
                    isMilestone && !isCompleted && !isPfpHere 
                      ? { borderColor: `${rankForLevel.hex}80` } 
                      : !isCompleted && !isPfpHere 
                        ? { borderColor: 'rgba(255,255,255,0.1)' } 
                        : {}
                  }
                >
                  {isPfpHere ? (
                    <motion.div 
                      layoutId="pfp"
                      transition={{ type: "spring", stiffness: 50, damping: 15 }}
                      className="w-full h-full flex items-center justify-center rounded-full overflow-hidden"
                    >
                      <ProfileFrame frame={state.equippedFrame} src={state.profilePicture} size="md" />
                    </motion.div>
                  ) : isCompleted ? (
                    <Check className="w-6 h-6 text-background" />
                  ) : isMilestone ? (
                    rankForLevel.name === 'Mythic' ? (
                      <Crown className="w-6 h-6" style={{ color: `${rankForLevel.hex}80` }} />
                    ) : (
                      <Shield className="w-6 h-6" style={{ color: `${rankForLevel.hex}80` }} />
                    )
                  ) : (
                    <Lock className="w-5 h-5 text-secondary/50" />
                  )}
                </div>

                {/* Level Label */}
                <div className={`absolute ${level % 2 === 0 ? 'right-20' : 'left-20'} whitespace-nowrap`}>
                  <div className={`font-bold text-lg ${isPfpHere ? 'text-accent' : isCompleted ? 'text-primary' : 'text-secondary'}`}>
                    Level {level}
                  </div>
                  {isMilestone && (
                    <div className={`text-xs font-mono uppercase tracking-wider ${isPfpHere || isCompleted ? rankForLevel.color : 'text-secondary/50'}`}>
                      {rankForLevel.name}
                    </div>
                  )}
                  {isMilestone && (
                    <div 
                      className="mt-1 flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full border w-max"
                      style={{ 
                        color: rankForLevel.hex, 
                        backgroundColor: `${rankForLevel.hex}1A`, 
                        borderColor: `${rankForLevel.hex}33` 
                      }}
                    >
                      <Star className="w-3 h-3" />
                      <span>{t('journey.new_frame', state.language)}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default React.memo(JourneyScreen);
