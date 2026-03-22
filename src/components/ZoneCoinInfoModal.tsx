import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Store, Target } from 'lucide-react';
import { ZoneCoinIcon } from './ZoneCoinIcon';
import { UserState } from '../store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: UserState;
}

export default function ZoneCoinInfoModal({ isOpen, onClose, state }: Props) {
  if (!isOpen) return null;

  const isId = state.language === 'id';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-surface border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <ZoneCoinIcon className="w-7 h-7 text-amber-400" />
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-secondary" />
            </button>
          </div>

          <h2 className="text-2xl font-display font-bold text-primary mb-2">Zone Coins</h2>
          <p className="text-sm text-secondary mb-6">
            {isId
              ? 'Mata uang resmi di dalam The Zone. Kumpulkan untuk membeli berbagai item eksklusif.'
              : 'The official currency of The Zone. Collect them to buy exclusive items.'}
          </p>

          <div className="space-y-4">
            <div className="bg-background rounded-2xl p-4 border border-white/5">
              <h3 className="text-sm font-bold text-primary flex items-center mb-3">
                <Target className="w-4 h-4 text-accent mr-2" />
                {isId ? 'Cara Mendapatkan' : 'How to Earn'}
              </h3>
              <ul className="space-y-2 text-xs text-secondary">
                <li className="flex justify-between items-center">
                  <span>{isId ? 'Misi Harian' : 'Daily Missions'}</span>
                  <span className="font-bold text-amber-400">+20</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>{isId ? 'Misi Mingguan' : 'Weekly Missions'}</span>
                  <span className="font-bold text-amber-400">+50</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>{isId ? 'Misi Rutin/Lainnya' : 'Routine/Other Missions'}</span>
                  <span className="font-bold text-amber-400">+10</span>
                </li>
              </ul>
            </div>

            <div className="bg-background rounded-2xl p-4 border border-white/5">
              <h3 className="text-sm font-bold text-primary flex items-center mb-2">
                <Store className="w-4 h-4 text-accent mr-2" />
                {isId ? 'Kegunaan' : 'How to Use'}
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                {isId
                  ? 'Gunakan Zone Coins di Zone Store untuk membeli Potion (2x XP, 2x Coin), Streak Freeze, dan bingkai profil eksklusif.'
                  : 'Use Zone Coins in the Zone Store to buy Potions (2x XP, 2x Coin), Streak Freezes, and exclusive profile frames.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-xl font-bold bg-white/10 text-primary hover:bg-white/20 transition-colors"
          >
            {isId ? 'Mengerti' : 'Got it'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
