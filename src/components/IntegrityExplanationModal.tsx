import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Info, AlertTriangle, RefreshCw } from 'lucide-react';
import { t } from '../utils/translations';

interface IntegrityExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'id';
}

export default function IntegrityExplanationModal({ isOpen, onClose, language }: IntegrityExplanationModalProps) {
  if (!isOpen) return null;

  const ranks = [
    { rank: 'S', color: '#00ffff', text: t('integrity.explanation.rank_s', language) },
    { rank: 'A', color: '#00ff00', text: t('integrity.explanation.rank_a', language) },
    { rank: 'B', color: '#ffff00', text: t('integrity.explanation.rank_b', language) },
    { rank: 'C', color: '#ff6600', text: t('integrity.explanation.rank_c', language) },
    { rank: 'D', color: '#ff0000', text: t('integrity.explanation.rank_d', language) },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-surface border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
        >
          {/* Background Decoration */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex justify-between items-start mb-6 relative">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-display font-black tracking-tight uppercase italic">{t('integrity.explanation.title', language)}</h3>
                <p className="text-[10px] text-secondary font-mono uppercase tracking-widest">System Protocol</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5 text-secondary" />
            </button>
          </div>

          <div className="space-y-6 relative overflow-y-auto max-h-[60vh] no-scrollbar pr-2">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex items-start space-x-3">
                <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <p className="text-sm text-secondary leading-relaxed">
                  {t('integrity.explanation.desc', language)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-3 h-3" />
                Integrity Ranks
              </h4>
              <div className="space-y-2">
                {ranks.map((r) => (
                  <div key={r.rank} className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl shrink-0"
                      style={{ color: r.color, backgroundColor: `${r.color}10`, border: `1px solid ${r.color}20` }}
                    >
                      {r.rank}
                    </div>
                    <span className="text-xs text-primary font-medium leading-tight">{r.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <RefreshCw className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-emerald-400 leading-relaxed">
                    {t('integrity.explanation.how_to_recover', language)}
                  </p>
                </div>
              </div>

              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-rose-400 leading-relaxed">
                    {t('integrity.explanation.penalty', language)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/5 flex justify-center">
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-accent text-background rounded-xl font-bold text-sm hover:bg-accent/90 transition-all active:scale-95"
            >
              UNDERSTOOD
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
