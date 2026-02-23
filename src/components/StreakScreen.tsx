import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame } from 'lucide-react';
import { sounds } from '../utils/sounds';

interface StreakScreenProps {
  streak: number;
  onContinue: () => void;
}

export default function StreakScreen({ streak, onContinue }: StreakScreenProps) {
  useEffect(() => {
    sounds.playLevelUp(); // Reuse level up sound for streak
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="absolute inset-0 z-50 bg-background flex flex-col items-center justify-center px-6 text-center"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.3, 0.1] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="w-[100vw] h-[100vw] rounded-full bg-orange-500/20 blur-[80px]"
          style={{ willChange: 'opacity' }}
        />
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-32 h-32 rounded-full bg-surface border border-white/10 flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/20 relative">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl"
          />
          <Flame className="w-16 h-16 text-orange-500 relative z-10" />
        </div>
        
        <h2 className="text-sm font-mono text-secondary uppercase tracking-[0.3em] mb-2">Streak Increased</h2>
        <div className="flex items-center space-x-4 mb-8">
          <h1 className="text-7xl font-display font-black tracking-tighter text-orange-500 drop-shadow-lg">
            {streak}
          </h1>
          <span className="text-3xl font-bold text-orange-500/50">Days</span>
        </div>

        <div className="bg-surface/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl max-w-sm mb-12">
          <p className="text-lg font-medium italic text-primary/90">"Consistency is the key to mastery. Keep the fire burning!"</p>
        </div>

        <button
          onClick={onContinue}
          className="w-full max-w-xs bg-orange-500 text-background font-bold py-4 rounded-xl hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20"
        >
          Keep Going
        </button>
      </motion.div>
    </motion.div>
  );
}
