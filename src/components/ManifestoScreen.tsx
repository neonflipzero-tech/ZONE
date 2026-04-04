import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Unlock } from 'lucide-react';

interface ManifestoScreenProps {
  onAccept: () => void;
  language: 'en' | 'id';
}

const ManifestoScreen: React.FC<ManifestoScreenProps> = ({ onAccept, language }) => {
  const isId = language === 'id';
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const HOLD_DURATION = 5000; // 5 seconds

  const startHold = () => {
    setIsHolding(true);
    startTimeRef.current = Date.now();
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
      
      if (progress < 100) {
        holdTimerRef.current = setTimeout(updateProgress, 16); // ~60fps
      } else {
        // Add a small delay so the user sees the bar at 100%
        setTimeout(() => {
          onAccept();
        }, 800);
      }
    };
    
    updateProgress();
  };

  const cancelHold = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center p-8 text-center overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Dynamic Background Particles when holding */}
      <AnimatePresence>
        {isHolding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: Math.random() * window.innerHeight,
                  scale: 0,
                  opacity: 0
                }}
                animate={{ 
                  y: [null, Math.random() * -200],
                  scale: [0, 1, 0],
                  opacity: [0, 0.5, 0]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2, 
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                className="absolute w-2 h-2 bg-accent rounded-full blur-sm"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: isHolding ? 1.05 : 1, 
          opacity: 1
        }}
        transition={{ 
          scale: { type: "spring", damping: 20 }
        }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(244,63,94,0.1)] relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-accent/20"
            animate={{ height: `${holdProgress}%` }}
            style={{ bottom: 0, top: 'auto' }}
          />
          <ShieldCheck className={`w-10 h-10 relative z-10 transition-colors ${holdProgress === 100 ? 'text-green-400' : 'text-accent'}`} />
        </div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl sm:text-5xl font-display font-black mb-8 leading-tight tracking-tighter text-primary uppercase"
        >
          {isId ? 'ZONE ADALAH REFLEKSI REALITAMU.' : 'ZONE IS A REFLECTION OF YOUR REALITY.'}
        </motion.h1>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-6 mb-12"
        >
          <p className="text-xl text-secondary font-medium leading-relaxed">
            {isId 
              ? 'Berbuat curang di sini, berarti kamu mencurangi masa depanmu sendiri.' 
              : 'Cheat here, and you cheat your future.'}
          </p>
          <p className="text-2xl text-primary font-bold">
            {isId 
              ? 'Apakah kamu siap untuk jujur pada dirimu sendiri?' 
              : 'Are you ready to be honest with yourself?'}
          </p>
        </motion.div>

        <div className="relative group">
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={startHold}
            onTouchEnd={cancelHold}
            className="w-full py-6 rounded-2xl bg-primary text-background font-black text-lg uppercase tracking-widest shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_25px_50px_rgba(255,255,255,0.15)] transition-all relative overflow-hidden select-none active:scale-95"
          >
            <motion.div 
              className="absolute inset-0 bg-accent/30"
              animate={{ width: `${holdProgress}%` }}
              style={{ left: 0 }}
            />
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isHolding ? <Unlock className="w-5 h-5 animate-pulse" /> : <Lock className="w-5 h-5" />}
              {isId ? 'SAYA MENERIMA TANTANGAN INI' : 'I ACCEPT THE CHALLENGE'}
            </span>
          </motion.button>
          
          <AnimatePresence>
            {isHolding && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-xl"
              >
                {isId ? 'KOMITMEN SEDANG DIPROSES...' : 'PROCESSING COMMITMENT...'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <p className="mt-6 text-[10px] font-mono text-secondary uppercase tracking-widest opacity-50">
          {isId ? 'Tindakan ini tidak dapat dibatalkan' : 'This action cannot be undone'}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ManifestoScreen;
