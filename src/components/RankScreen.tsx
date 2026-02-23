import { motion } from 'motion/react';
import { UserState, getRankForLevel, RANKS } from '../store';
import { Shield, Trophy, Flame } from 'lucide-react';

interface RankScreenProps {
  state: UserState;
}

export default function RankScreen({ state }: RankScreenProps) {
  const currentRank = getRankForLevel(state.level);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-background overflow-y-auto no-scrollbar pb-24"
    >
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-display font-bold tracking-tight mb-8">Rank & Progress</h1>

        {/* Current Rank Card */}
        <div className="bg-surface border border-white/5 rounded-3xl p-8 mb-8 relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-accent/10 to-transparent pointer-events-none" />
          
          <div className="w-32 h-32 rounded-full bg-background border-4 border-surface flex items-center justify-center mb-6 relative z-10 shadow-2xl shadow-accent/20">
            <Trophy className={`w-16 h-16 ${currentRank.color}`} />
          </div>
          
          <h2 className={`text-3xl font-display font-black tracking-tighter mb-2 ${currentRank.color} drop-shadow-md`}>
            {currentRank.name}
          </h2>
          <p className="text-secondary font-mono uppercase tracking-widest text-sm mb-6">
            Level {state.level}
          </p>

          <div className="w-full">
            <div className="flex justify-between text-xs font-mono text-secondary mb-2">
              <span>{state.xp} XP</span>
              <span>{state.level * 100} XP</span>
            </div>
            <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className="h-full bg-gradient-to-r from-accent to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${(state.xp / (state.level * 100)) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-surface border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-2">
              <Flame className="w-5 h-5 text-accent" />
            </div>
            <span className="text-2xl font-bold">{state.missions.filter(m => m.completed).length}</span>
            <span className="text-xs text-secondary uppercase tracking-wider">Missions Done</span>
          </div>
          <div className="bg-surface border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-2xl font-bold">{state.highestRankAchieved}</span>
            <span className="text-xs text-secondary uppercase tracking-wider">Highest Rank</span>
          </div>
        </div>

        {/* Rank List */}
        <div>
          <h3 className="text-xl font-display font-bold mb-4">All Ranks</h3>
          <div className="space-y-3">
            {RANKS.map((rank, index) => {
              const isCurrent = currentRank.name === rank.name;
              const isUnlocked = state.level >= rank.minLevel;
              
              return (
                <div 
                  key={rank.name}
                  className={`p-4 rounded-2xl flex items-center space-x-4 border transition-all ${
                    isCurrent 
                      ? 'bg-gradient-to-r from-surface to-surface-hover border-accent/30 shadow-lg shadow-accent/5' 
                      : isUnlocked
                        ? 'bg-surface border-white/10'
                        : 'bg-surface/30 border-white/5 opacity-50 grayscale'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isUnlocked ? rank.bg + '/20' : 'bg-white/5'}`}>
                    <Shield className={`w-6 h-6 ${isUnlocked ? rank.color : 'text-secondary'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${isUnlocked ? 'text-primary' : 'text-secondary'}`}>{rank.name}</h4>
                    <p className="text-xs text-secondary font-mono">Unlocks at Lvl {rank.minLevel}</p>
                  </div>
                  {isCurrent && (
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">Current</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
