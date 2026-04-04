import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Shield, Zap, Trophy, X } from 'lucide-react';
import { useAppState, Mission } from '../store';

export const BossBattle: React.FC = () => {
  const { state, attackBoss } = useAppState();
  const boss = state?.bossState;

  if (!boss || !boss.isActive || boss.status !== 'active') return null;

  const hpPercentage = Math.max(0, Math.min(100, ((boss.hp || 0) / (boss.maxHp || 100)) * 100));
  const bossColor = boss.color || '#F43F5E';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[300] bg-background/95 backdrop-blur-xl flex flex-col p-6 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${bossColor}20` }}>
            <Swords className="w-6 h-6" style={{ color: bossColor }} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black tracking-tighter uppercase">
              {state?.language === 'id' ? 'WEEKLY BOSS' : 'WEEKLY BOSS'}
            </h2>
            <p className="text-xs font-mono text-secondary uppercase tracking-widest">
              {boss.topic} {state?.language === 'id' ? 'GUARDIAN' : 'GUARDIAN'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => useAppState.getState().updateState({ bossState: { ...boss, isActive: false } })}
          className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6 text-secondary" />
        </button>
      </div>

      {/* Boss Visual */}
      <div className="relative flex flex-col items-center mb-12">
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-48 h-48 relative"
        >
          <div className="absolute inset-0 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: `${bossColor}20` }} />
          <div className="relative w-full h-full rounded-full border-4 flex items-center justify-center bg-gradient-to-b from-white/5 to-transparent overflow-hidden" style={{ borderColor: `${bossColor}30` }}>
             <Zap className="w-24 h-24 animate-pulse" style={{ color: bossColor }} />
          </div>
        </motion.div>

        {/* HP Bar */}
        <div className="w-full max-w-md mt-10">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: bossColor }}>HP</span>
            <span className="text-xl font-display font-black">{Math.ceil(boss.hp || 0)}/{boss.maxHp}</span>
          </div>
          <div className="h-4 w-full bg-secondary/20 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${hpPercentage}%` }}
              className="h-full shadow-[0_0_20px_rgba(0,0,0,0.5)]"
              style={{ 
                background: `linear-gradient(to right, ${bossColor}, #ffffff40)`,
                boxShadow: `0 0 20px ${bossColor}80`
              }}
            />
          </div>
        </div>
      </div>

      {/* Boss Tasks */}
      <div className="flex-1 max-w-md mx-auto w-full">
        <h3 className="text-sm font-mono font-bold text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          {state?.language === 'id' ? 'SELESAIKAN MISI UNTUK MENYERANG' : 'COMPLETE MISSIONS TO ATTACK'}
        </h3>

        <div className="space-y-4">
          {boss.tasks?.map((task: Mission) => (
            <motion.button
              key={task.id}
              disabled={task.completed}
              onClick={() => attackBoss(task.id)}
              whileHover={!task.completed ? { scale: 1.02, x: 5 } : {}}
              whileTap={!task.completed ? { scale: 0.98 } : {}}
              className={`w-full p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                task.completed 
                ? 'bg-green-500/10 border-green-500/30 opacity-60' 
                : 'bg-white/5 border-white/10 hover:border-accent/50 hover:bg-accent/5'
              }`}
            >
              {task.completed && (
                <div className="absolute top-0 right-0 p-2">
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <Trophy className="w-3 h-3" />
                  </div>
                </div>
              )}
              <p className={`font-medium leading-tight ${task.completed ? 'line-through text-secondary' : 'text-primary'}`}>
                {task.text}
              </p>
              {!task.completed && (
                <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-accent font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  <Swords className="w-3 h-3" />
                  {state?.language === 'id' ? 'SERANG BOSS' : 'ATTACK BOSS'}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-[10px] font-mono text-secondary uppercase tracking-widest opacity-50">
          {state?.language === 'id' 
            ? 'Kalahkan boss untuk mendapatkan hadiah besar' 
            : 'Defeat the boss to earn massive rewards'}
        </p>
      </div>
    </motion.div>
  );
};
