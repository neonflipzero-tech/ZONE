import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UnlockedItem, BADGES } from '../store';
import { Lock, Trophy, Shield } from 'lucide-react';
import ProfileFrame from './ProfileFrame';

interface UnlockNotificationProps {
  item: UnlockedItem;
  onDismiss: () => void;
  language: 'en' | 'id';
}

export default function UnlockNotification({ item, onDismiss, language }: UnlockNotificationProps) {
  const [stage, setStage] = useState<'locked' | 'breaking' | 'revealed'>('locked');

  useEffect(() => {
    // Sequence:
    // 0-1s: Locked & shaking
    // 1-1.5s: Breaking (scaling up and fading out)
    // 1.5s+: Revealed
    const timer1 = setTimeout(() => setStage('breaking'), 1000);
    const timer2 = setTimeout(() => setStage('revealed'), 1300);
    const timer3 = setTimeout(() => onDismiss(), 4500); // Auto dismiss

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onDismiss]);

  let title = '';
  let subtitle = '';
  let content = null;

  if (item.type === 'badge') {
    const badge = BADGES.find(b => b.id === item.id);
    title = language === 'id' ? 'Lencana Baru Terbuka!' : 'New Badge Unlocked!';
    subtitle = badge ? badge.name[language] : item.id;
    content = (
      <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center border border-accent/50 shadow-[0_0_30px_rgba(242,125,38,0.5)]">
        <Trophy className="w-12 h-12 text-accent" />
      </div>
    );
  } else if (item.type === 'frame') {
    title = language === 'id' ? 'Bingkai Baru Terbuka!' : 'New Frame Unlocked!';
    subtitle = item.id.replace('frame-', '').toUpperCase();
    content = (
      <div className="w-24 h-24 relative flex items-center justify-center">
        <ProfileFrame frame={item.id} src={null} size="lg" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onDismiss} />
      
      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-auto" onClick={onDismiss}>
        <AnimatePresence mode="wait">
          {stage !== 'revealed' ? (
            <motion.div
              key="lock-container"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={
                stage === 'locked' 
                  ? { scale: 1, opacity: 1, rotate: [0, -10, 10, -10, 10, 0] } 
                  : { scale: 1, opacity: 1 }
              }
              transition={
                stage === 'locked'
                  ? { rotate: { repeat: Infinity, duration: 0.4 } }
                  : { duration: 0.3 }
              }
              className="relative w-40 h-40 flex items-center justify-center"
            >
              {/* Content behind the lock */}
              <div className="absolute inset-0 flex items-center justify-center opacity-50 scale-75 blur-[2px]">
                {content}
              </div>

              {/* The Lock shattering effect */}
              <motion.div
                animate={
                  stage === 'breaking' 
                    ? { scale: [1, 1.5, 2.5], opacity: [1, 0.8, 0], filter: ['blur(0px)', 'blur(4px)', 'blur(10px)'] }
                    : { scale: 1, opacity: 1 }
                }
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative z-10"
              >
                <Lock className="w-20 h-20 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="reveal"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-6">
                <motion.div 
                  className="absolute inset-0 bg-accent/30 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {content}
              </div>
              
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-display font-bold text-white mb-2 text-center drop-shadow-md"
              >
                {title}
              </motion.h2>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-accent font-mono font-bold tracking-widest uppercase text-center"
              >
                {subtitle}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 text-xs text-secondary font-mono"
              >
                {language === 'id' ? 'Ketuk untuk menutup' : 'Tap to dismiss'}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
