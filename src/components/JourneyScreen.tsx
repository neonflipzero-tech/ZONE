import { motion, AnimatePresence } from 'motion/react';
import { UserState, getRankForLevel, RANKS } from '../store';
import { Shield, Lock, Star, Check, User, Share2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ProfileFrame from './ProfileFrame';
import { shareContent, shareElementAsImage } from '../utils/share';

interface JourneyScreenProps {
  state: UserState;
  updateState: (updates: Partial<UserState>) => void;
}

export default function JourneyScreen({ state, updateState }: JourneyScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [displayLevelCharacter, setDisplayLevelCharacter] = useState(state.animatingLevelUp ? state.previousLevel : state.level);
  const [displayLevelPfp, setDisplayLevelPfp] = useState(state.animatingLevelUp ? state.previousLevel : state.level);
  const [showRankUpOverlay, setShowRankUpOverlay] = useState(false);
  
  const prevRank = getRankForLevel(state.previousLevel);
  const currentRank = getRankForLevel(state.level);
  const isRankUp = prevRank.name !== currentRank.name && state.animatingLevelUp;

  // Generate levels to show (current level + 10 future levels, and all past levels)
  const maxLevelToShow = Math.max(state.level + 10, 20);
  const levels = Array.from({ length: maxLevelToShow }, (_, i) => i + 1).reverse();

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];
    if (state.animatingLevelUp) {
      // Scroll to previous level
      const prevLevelElement = document.getElementById(`level-${state.previousLevel}`);
      if (prevLevelElement) {
        prevLevelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      const t1 = setTimeout(() => {
        // 1. Character moves
        setDisplayLevelCharacter(state.level);
        
        // Scroll to new level
        const currentLevelElement = document.getElementById(`level-${state.level}`);
        if (currentLevelElement) {
          currentLevelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        const t2 = setTimeout(() => {
          // 2. PFP moves
          setDisplayLevelPfp(state.level);

          if (isRankUp) {
            const t3 = setTimeout(() => {
              setShowRankUpOverlay(true);
              import('../utils/sounds').then(({ sounds }) => sounds.playLevelUp());
              
              const t4 = setTimeout(() => {
                setShowRankUpOverlay(false);
                updateState({ animatingLevelUp: false, previousLevel: state.level });
              }, 4000); // Show overlay for 4 seconds
              timers.push(t4);
            }, 1000);
            timers.push(t3);
          } else {
            const t3 = setTimeout(() => {
              // 3. Sound effect
              import('../utils/sounds').then(({ sounds }) => sounds.playLevelUp());
              updateState({ animatingLevelUp: false, previousLevel: state.level });
            }, 1000); // Wait for PFP to move
            timers.push(t3);
          }
        }, 1000); // Wait for character to move
        timers.push(t2);
      }, 1000); // Initial delay
      timers.push(t1);

      return () => {
        timers.forEach(clearTimeout);
      };
    } else {
      setDisplayLevelCharacter(state.level);
      setDisplayLevelPfp(state.level);
      setShowRankUpOverlay(false);
      
      // Initial scroll from bottom (level 1) to current level
      if (scrollRef.current) {
        // Scroll to the very bottom first (level 1)
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        
        // Then smoothly scroll up to the current level
        setTimeout(() => {
          const currentLevelElement = document.getElementById(`level-${state.level}`);
          if (currentLevelElement) {
            currentLevelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    }
  }, [state.animatingLevelUp, state.level, state.previousLevel, updateState, isRankUp]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-background overflow-y-auto no-scrollbar pb-24 relative"
      ref={scrollRef}
    >
      <div className="px-6 pt-12 pb-6 sticky top-0 bg-background/80 backdrop-blur-md z-20 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Journey Map</h1>
          <p className="text-secondary text-sm">Your path to greatness.</p>
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
            Skip Animation
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
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
                RANK UP!
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
                onClick={() => {
                  shareElementAsImage(
                    'rank-up-card',
                    'I Ranked Up!',
                    `I just reached ${currentRank.name} (Level ${state.level}) on ZONE! Join me and lock in.`
                  );
                }}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-full font-bold transition-colors backdrop-blur-md"
              >
                <Share2 className="w-5 h-5" />
                <span>Share Milestone</span>
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
            <div className="absolute top-[120px] bottom-[120px] left-1/2 -translate-x-1/2 w-2 z-0 flex flex-col justify-end">
              {/* Background Line */}
              <div className="absolute inset-0 bg-white/10 rounded-full" />
              
              {/* Progress Line (Pink) */}
              <motion.div 
                className="w-full bg-[#ec4899] rounded-full relative z-10"
                initial={{ height: 0 }}
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
            <div 
              key={level} 
              id={`level-${level}`}
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
                        className="w-24 h-24 drop-shadow-2xl filter drop-shadow-[0_10px_10px_rgba(242,125,38,0.5)]" 
                      />
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/40 rounded-full blur-sm -z-10" />
                    </div>
                  </motion.div>
                )}
                
                <div 
                  className={`w-16 h-16 flex items-center justify-center relative z-10 transition-all ${
                    isPfpHere 
                      ? 'scale-110' 
                      : isCompleted 
                        ? 'bg-accent border-accent/50 rounded-full border-4 shadow-xl' 
                        : 'bg-surface border-white/10 rounded-full border-4 shadow-xl'
                  } ${isMilestone && !isCompleted && !isPfpHere ? 'border-yellow-500/50' : ''}`}
                >
                  {isPfpHere ? (
                    <motion.div 
                      layoutId="pfp"
                      transition={{ type: "spring", stiffness: 50, damping: 15 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <ProfileFrame frame={state.equippedFrame} src={state.profilePicture} size="md" />
                    </motion.div>
                  ) : isCompleted ? (
                    <Check className="w-6 h-6 text-background" />
                  ) : isMilestone ? (
                    <Shield className="w-6 h-6 text-yellow-500/50" />
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
                    <div className="mt-1 flex items-center space-x-1 text-[10px] text-yellow-500/80 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20 w-max">
                      <Star className="w-3 h-3" />
                      <span>{state.language === 'id' ? 'Bingkai Baru!' : 'New Frame!'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
