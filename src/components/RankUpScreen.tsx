import { useEffect } from 'react';
import { motion } from 'motion/react';
import { PathType, PATH_QUOTES } from '../store';
import { Trophy } from 'lucide-react';
import { sounds } from '../utils/sounds';

interface RankUpScreenProps {
  rankName: string;
  rankColor: string;
  path: PathType;
  onContinue: () => void;
}

export default function RankUpScreen({ rankName, rankColor, path, onContinue }: RankUpScreenProps) {
  const quotes = PATH_QUOTES[path];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  useEffect(() => {
    sounds.playRankUp();
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
            duration: 4, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="w-[100vw] h-[100vw] rounded-full bg-accent/20 blur-[80px]"
          style={{ willChange: 'opacity' }}
        />
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-24 h-24 rounded-full bg-surface border border-white/10 flex items-center justify-center mb-6 shadow-2xl shadow-accent/20">
          <Trophy className={`w-12 h-12 ${rankColor}`} />
        </div>
        
        <h2 className="text-sm font-mono text-secondary uppercase tracking-[0.3em] mb-2">Rank Up</h2>
        <h1 className={`text-6xl font-display font-black tracking-tighter mb-8 ${rankColor} drop-shadow-lg`}>
          {rankName}
        </h1>

        <div className="bg-surface/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl max-w-sm mb-12">
          <p className="text-lg font-medium italic text-primary/90">"{randomQuote}"</p>
        </div>

        <button
          onClick={onContinue}
          className="w-full max-w-xs bg-primary text-background font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Keep Going
        </button>
      </motion.div>
    </motion.div>
  );
}
