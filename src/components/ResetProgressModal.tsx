import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ResetProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  language: 'en' | 'id';
}

export default function ResetProgressModal({ isOpen, onClose, onConfirm, language }: ResetProgressModalProps) {
  const [step, setStep] = useState(1);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCountdown(5);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 3 && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleConfirm = () => {
    if (countdown === 0) {
      onConfirm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-sm bg-surface border border-red-500/30 rounded-3xl p-6 shadow-2xl shadow-red-500/10"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-display font-black text-white mb-2">
              {language === 'id' ? 'Hapus Semua Progres?' : 'Reset All Progress?'}
            </h2>
            
            {step === 1 && (
              <p className="text-secondary text-sm">
                {language === 'id' 
                  ? 'Apakah kamu yakin ingin menghapus semua progres? Ini akan mereset level, XP, lencana, dan bingkai kamu ke awal.' 
                  : 'Are you sure you want to delete all progress? This will reset your level, XP, badges, and frames to the beginning.'}
              </p>
            )}

            {step === 2 && (
              <p className="text-red-400 text-sm font-bold">
                {language === 'id' 
                  ? 'PERINGATAN TERAKHIR! Aksi ini TIDAK BISA dibatalkan. Semua usahamu akan hilang selamanya. Yakin?' 
                  : 'FINAL WARNING! This action CANNOT be undone. All your hard work will be lost forever. Are you really sure?'}
              </p>
            )}

            {step === 3 && (
              <p className="text-red-500 text-sm font-bold animate-pulse">
                {language === 'id' 
                  ? 'Menghapus data dalam...' 
                  : 'Deleting data in...'}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-xl bg-red-500/20 text-red-500 font-bold hover:bg-red-500/30 transition-colors"
              >
                {language === 'id' ? 'Ya, Lanjutkan' : 'Yes, Continue'}
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={countdown > 0}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  countdown > 0 
                    ? 'bg-surface border border-white/10 text-secondary cursor-not-allowed' 
                    : 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                }`}
              >
                {countdown > 0 
                  ? (language === 'id' ? `Tunggu ${countdown} detik...` : `Wait ${countdown} seconds...`)
                  : (language === 'id' ? 'HAPUS SEKARANG' : 'DELETE NOW')}
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
            >
              {language === 'id' ? 'Batal' : 'Cancel'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
