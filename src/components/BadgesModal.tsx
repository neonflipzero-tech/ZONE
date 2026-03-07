import React from 'react';
import { motion } from 'motion/react';
import { X, Trophy } from 'lucide-react';
import { BADGES } from '../store';

interface BadgesModalProps {
  badges: string[];
  language: 'en' | 'id';
  onClose: () => void;
  badgeIcons: Record<string, any>;
}

export default function BadgesModal({ badges, language, onClose, badgeIcons }: BadgesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-surface border border-white/10 rounded-3xl p-6 w-full max-w-md relative z-10 max-h-[80vh] flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-bold text-primary flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-accent" />
            {language === 'id' ? 'Koleksi Lencana' : 'Badge Collection'}
          </h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-secondary hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar flex-1 -mx-2 px-2">
          <div className="grid grid-cols-2 gap-3 pb-4">
            {BADGES.map((badgeDef) => {
              const isUnlocked = badges.includes(badgeDef.id);
              const Icon = badgeIcons[badgeDef.icon] || Trophy;
              
              return (
                <div 
                  key={badgeDef.id} 
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                    isUnlocked 
                      ? 'bg-gradient-to-b from-surface to-surface-hover border-accent/30 shadow-lg shadow-accent/5' 
                      : 'bg-surface/30 border-white/5 opacity-50 grayscale'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isUnlocked ? 'bg-accent/20' : 'bg-white/5'}`}>
                    <Icon className={`w-6 h-6 ${isUnlocked ? 'text-accent' : 'text-secondary'}`} />
                  </div>
                  <span className={`text-sm font-bold leading-tight mb-1 ${isUnlocked ? 'text-primary' : 'text-secondary'}`}>
                    {badgeDef.name[language]}
                  </span>
                  <span className="text-[10px] text-secondary leading-tight">
                    {badgeDef.desc[language]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
