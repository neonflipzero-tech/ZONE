import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Shield, Zap, Trophy, X } from 'lucide-react';
import { useAppState, getTodayISO, PathType } from '../store';
import { t } from '../utils/translations';

export const BossEncounter: React.FC = () => {
  const { state, triggerBoss } = useAppState();
  const boss = state?.bossState;
  const lang = state?.language || 'en';

  // Show if it's Monday
  const today = new Date();
  const isMonday = today.getDay() === 1;
  const todayISO = getTodayISO();
  
  // Only show on Monday and if not encountered today
  const isAvailable = isMonday && boss?.lastEncounterDate !== todayISO && boss?.status === 'idle';
  const isOngoing = isMonday && boss?.status === 'active' && !boss?.isActive;

  if (!isAvailable && !isOngoing) return null;

  const bossColor = boss?.color || '#F43F5E';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group mb-8"
      style={{ background: `linear-gradient(to bottom right, ${bossColor}, #4c0519)` }}
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
        <Swords className="w-24 h-24 text-white -rotate-12" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono font-bold text-white uppercase tracking-widest border border-white/10">
            {t('boss.event', lang)}
          </div>
          <div className="bg-amber-500 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-white uppercase tracking-widest animate-pulse">
            {isOngoing ? t('boss.ongoing', lang) : t('boss.live', lang)}
          </div>
        </div>

        <h3 className="text-2xl font-display font-black text-white mb-2 tracking-tighter uppercase leading-tight">
          {isOngoing 
            ? t('boss.continue', lang)
            : t('boss.appeared', lang)}
        </h3>
        <p className="text-white/80 text-sm mb-6 max-w-[80%] leading-relaxed font-medium">
          {isOngoing
            ? t('boss.hp', lang, { hp: Math.ceil(boss?.hp || 0) })
            : t('boss.reward_desc', lang)}
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (isOngoing) {
              useAppState.getState().updateState({ bossState: { ...boss!, isActive: true } });
            } else {
              triggerBoss();
            }
          }}
          className="bg-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
          style={{ color: bossColor }}
        >
          <Swords className="w-4 h-4" />
          {isOngoing 
            ? t('boss.return', lang)
            : t('boss.face', lang)}
        </motion.button>
      </div>
    </motion.div>
  );
};
