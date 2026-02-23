import { motion } from 'motion/react';
import { UserState, getRankForLevel, RANKS } from '../store';
import { Shield, Lock, Star, Check, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface JourneyScreenProps {
  state: UserState;
  updateState: (updates: Partial<UserState>) => void;
}

export default function JourneyScreen({ state, updateState }: JourneyScreenProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [displayLevelCharacter, setDisplayLevelCharacter] = useState(state.animatingLevelUp ? state.previousLevel : state.level);
  const [displayLevelPfp, setDisplayLevelPfp] = useState(state.animatingLevelUp ? state.previousLevel : state.level);
  
  // Generate levels to show (current level + 10 future levels, and all past levels)
  const maxLevelToShow = Math.max(state.level + 10, 20);
  const levels = Array.from({ length: maxLevelToShow }, (_, i) => i + 1).reverse();

  useEffect(() => {
    if (state.animatingLevelUp) {
      // Scroll to previous level
      const prevLevelElement = document.getElementById(`level-${state.previousLevel}`);
      if (prevLevelElement) {
        prevLevelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      const timer1 = setTimeout(() => {
        // 1. Character moves
        setDisplayLevelCharacter(state.level);
        
        // Scroll to new level
        const currentLevelElement = document.getElementById(`level-${state.level}`);
        if (currentLevelElement) {
          currentLevelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        const timer2 = setTimeout(() => {
          // 2. PFP moves
          setDisplayLevelPfp(state.level);

          const timer3 = setTimeout(() => {
            // 3. Sound effect
            import('../utils/sounds').then(({ sounds }) => sounds.playLevelUp());
            updateState({ animatingLevelUp: false, previousLevel: state.level });
          }, 1000); // Wait for PFP to move
        }, 1000); // Wait for character to move
      }, 1000); // Initial delay

      return () => {
        clearTimeout(timer1);
      };
    } else {
      setDisplayLevelCharacter(state.level);
      setDisplayLevelPfp(state.level);
      const currentLevelElement = document.getElementById(`level-${state.level}`);
      if (currentLevelElement) {
        currentLevelElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [state.animatingLevelUp, state.level, state.previousLevel, updateState]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-background overflow-y-auto no-scrollbar pb-24 relative"
      ref={scrollRef}
    >
      <div className="px-6 pt-12 pb-6 sticky top-0 bg-background/80 backdrop-blur-md z-20">
        <h1 className="text-2xl font-display font-bold tracking-tight">Journey Map</h1>
        <p className="text-secondary text-sm">Your path to greatness.</p>
      </div>

      <div className="relative w-full max-w-sm mx-auto py-10 px-4 flex flex-col items-center">
        {/* The Path Line */}
        <div className="absolute top-0 bottom-0 w-2 bg-surface border-x border-white/5 left-1/2 -translate-x-1/2 z-0 rounded-full" />
        
        {/* Active Path Line (up to current level) */}
        <div 
          className="absolute bottom-0 w-2 bg-gradient-to-t from-accent to-orange-500 left-1/2 -translate-x-1/2 z-0 rounded-full transition-all duration-1000"
          style={{ 
            height: `${((displayLevelPfp) / maxLevelToShow) * 100}%`,
            maxHeight: '100%'
          }} 
        />

        {levels.map((level, index) => {
          const isCharacterHere = level === displayLevelCharacter;
          const isPfpHere = level === displayLevelPfp;
          const isCompleted = level < displayLevelPfp;
          const isLocked = level > displayLevelPfp;
          
          // Alternate sides
          const isLeft = level % 2 === 0;
          const rankForLevel = getRankForLevel(level);
          const isMilestone = RANKS.some(r => r.minLevel === level);

          return (
            <div 
              key={level} 
              id={`level-${level}`}
              className={`relative w-full flex items-center justify-center my-6 z-10 ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Spacer for alternating layout */}
              <div className="w-1/2" />

              {/* Node */}
              <div className="relative flex items-center justify-center">
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
                  className={`w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-xl relative z-10 transition-all ${
                    isPfpHere 
                      ? 'bg-surface border-accent shadow-accent/20 scale-110' 
                      : isCompleted 
                        ? 'bg-accent border-accent/50' 
                        : 'bg-surface border-white/10'
                  } ${isMilestone && !isCompleted && !isPfpHere ? 'border-yellow-500/50' : ''}`}
                >
                  {isPfpHere ? (
                    <motion.div 
                      layoutId="pfp"
                      transition={{ type: "spring", stiffness: 50, damping: 15 }}
                      className="w-full h-full rounded-full overflow-hidden p-1 bg-surface"
                    >
                      {state.profilePicture ? (
                        <img src={state.profilePicture} alt="You" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <User className="w-6 h-6 text-accent m-auto mt-3" />
                      )}
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
                <div className={`absolute ${isLeft ? 'right-20' : 'left-20'} whitespace-nowrap`}>
                  <div className={`font-bold text-lg ${isPfpHere ? 'text-accent' : isCompleted ? 'text-primary' : 'text-secondary'}`}>
                    Level {level}
                  </div>
                  {isMilestone && (
                    <div className={`text-xs font-mono uppercase tracking-wider ${isPfpHere || isCompleted ? rankForLevel.color : 'text-secondary/50'}`}>
                      {rankForLevel.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Spacer */}
              <div className="w-1/2" />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
