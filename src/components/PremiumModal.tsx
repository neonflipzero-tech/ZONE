import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Check, X, Loader2, AlertCircle } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'id';
}

export default function PremiumModal({ isOpen, onClose, language }: PremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));
      setError(language === 'id' ? 'Pembayaran In-App Google Play akan segera hadir!' : 'Google Play In-App Billing is coming soon!');
    } catch (err) {
      setError(language === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const features = language === 'id' ? [
    'Misi kustom tanpa batas (Unlimited)',
    'Badge eksklusif Premium',
    'Prioritas dukungan',
    'Mendukung pengembangan aplikasi'
  ] : [
    'Unlimited custom missions',
    'Exclusive Premium badge',
    'Priority support',
    'Support app development'
  ];

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
          className="relative w-full max-w-md bg-background border border-accent/20 rounded-3xl overflow-hidden shadow-2xl shadow-accent/10"
        >
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-accent/20 to-purple-500/20" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/70 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative pt-12 px-6 pb-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-purple-500 p-0.5 mb-4 shadow-lg shadow-accent/20">
              <div className="w-full h-full bg-background rounded-2xl flex items-center justify-center">
                <Crown className="w-10 h-10 text-accent" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-primary mb-2">LockIn Premium</h2>
            <p className="text-secondary text-sm mb-6">
              {language === 'id' 
                ? 'Tingkatkan batas misi kustom dan buka fitur eksklusif.' 
                : 'Upgrade your custom mission limits and unlock exclusive features.'}
            </p>

            <div className="w-full bg-surface/50 rounded-2xl p-4 mb-6 border border-white/5">
              <ul className="space-y-3 text-left">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <div className="mt-0.5 bg-accent/20 p-1 rounded-full">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    <span className="text-sm text-primary">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <div className="w-full p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-2 text-left">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-accent to-purple-500 text-white shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{language === 'id' ? 'Tingkatkan Sekarang - $4.99' : 'Upgrade Now - $4.99'}</span>
                </>
              )}
            </button>
            
            <p className="text-[10px] text-white/30 mt-4">
              {language === 'id' 
                ? 'Pembayaran akan diproses melalui Google Play. Sekali bayar untuk selamanya.' 
                : 'Payment will be processed via Google Play. One-time payment for lifetime access.'}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
