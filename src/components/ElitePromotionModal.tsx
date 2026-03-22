import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Check, X, Loader2, AlertCircle, Timer, Zap } from 'lucide-react';

interface ElitePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'id';
  isFlashSale?: boolean;
}

export default function ElitePromotionModal({ isOpen, onClose, language, isFlashSale = false }: ElitePromotionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>(isFlashSale ? 'monthly' : 'monthly');
  const [timeLeft, setTimeLeft] = useState(15);

  const getPrice = (planId: string, isFlash: boolean = false) => {
    if (language === 'id') {
      if (isFlash) return 'Rp 29.000';
      switch (planId) {
        case 'monthly': return 'Rp 69.000';
        case 'yearly': return 'Rp 449.000';
        case 'lifetime': return 'Rp 749.000';
        default: return '';
      }
    } else {
      if (isFlash) return '$1.99';
      switch (planId) {
        case 'monthly': return '$4.99';
        case 'yearly': return '$29.99';
        case 'lifetime': return '$49.99';
        default: return '';
      }
    }
  };

  const getOldPrice = (planId: string) => {
    if (language === 'id') {
      return 'Rp 79.000';
    } else {
      return '$4.99';
    }
  };

  useEffect(() => {
    if (isOpen && isFlashSale) {
      setTimeLeft(15);
    }
  }, [isOpen, isFlashSale]);

  useEffect(() => {
    if (isOpen && isFlashSale && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isFlashSale) {
      onClose();
    }
  }, [isOpen, isFlashSale, timeLeft, onClose]);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 3000));
      setError(language === 'id' ? 'Pembayaran In-App Google Play akan segera hadir!' : 'Google Play In-App Billing is coming soon!');
    } catch (err) {
      setError(language === 'id' ? 'Terjadi kesalahan' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const plans = isFlashSale ? [
    {
      id: 'monthly',
      name: language === 'id' ? 'Flash Sale Bulanan' : 'Monthly Flash Sale',
      price: getPrice('monthly', true),
      oldPrice: getOldPrice('monthly'),
      period: language === 'id' ? '/ bulan' : '/ month',
      desc: language === 'id' ? 'Penawaran terbatas! Hemat 60%' : 'Limited offer! Save 60%'
    }
  ] : [
    {
      id: 'monthly',
      name: language === 'id' ? 'Bulanan' : 'Monthly',
      price: getPrice('monthly'),
      period: language === 'id' ? '/ bulan' : '/ month',
      desc: language === 'id' ? 'Akses penuh setiap bulan' : 'Full access every month'
    },
    {
      id: 'yearly',
      name: language === 'id' ? 'Tahunan' : 'Yearly',
      price: getPrice('yearly'),
      period: language === 'id' ? '/ tahun' : '/ year',
      desc: language === 'id' ? 'Hemat 50% dibanding bulanan' : 'Save 50% vs monthly'
    },
    {
      id: 'lifetime',
      name: language === 'id' ? 'Seumur Hidup' : 'Lifetime',
      price: getPrice('lifetime'),
      period: language === 'id' ? 'Sekali bayar' : 'One-time',
      desc: language === 'id' ? 'Akses selamanya' : 'Access forever'
    }
  ];

  const features = language === 'id' ? [
    '+50% XP Boost',
    '+25% Bonus Koin',
    'Misi kustom tanpa batas (Unlimited)',
    'Bingkai Profil Eksklusif "Elite"',
    'Lencana (Badge) Emas Premium',
    'Tema Profil Kustom (Neon/Dark)',
    'Mendukung pengembangan aplikasi'
  ] : [
    '+50% XP Boost',
    '+25% Coin Bonus',
    'Unlimited custom missions',
    'Exclusive "Elite" Profile Frames',
    'Premium Gold Badges',
    'Custom Profile Themes (Neon/Dark)',
    'Support app development'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-xl"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 100 }}
          className={`relative w-full max-w-md bg-background border ${isFlashSale ? 'border-amber-400/50' : 'border-accent/30'} rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.25)] max-h-[95vh] flex flex-col`}
        >
          {/* Animated background glow */}
          <div className={`absolute top-0 left-0 right-0 h-48 bg-gradient-to-br ${isFlashSale ? 'from-amber-400/30 via-amber-500/20' : 'from-accent/30 via-purple-500/20'} to-transparent pointer-events-none`} />
          
          {isFlashSale && (
            <div className="absolute top-0 left-0 right-0 py-2 bg-amber-400 flex items-center justify-center space-x-2 z-30">
              <Zap className="w-4 h-4 text-black fill-black" />
              <Timer className="w-3 h-3 text-black" />
              <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">RARE FLASH SALE - {timeLeft}S LEFT</span>
              <Zap className="w-4 h-4 text-black fill-black" />
            </div>
          )}

          <div className="relative flex-1 overflow-y-auto no-scrollbar pt-12 px-6 pb-8 flex flex-col items-center text-center">
            <motion.div 
              animate={{ 
                rotateY: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${isFlashSale ? 'from-amber-400 via-amber-400 to-rose-600' : 'from-accent via-amber-400 to-purple-600'} p-0.5 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.3)] shrink-0`}
            >
              <div className="w-full h-full bg-background rounded-2xl flex items-center justify-center">
                <Crown className={`w-8 h-8 ${isFlashSale ? 'text-amber-400' : 'text-accent'}`} />
              </div>
            </motion.div>

            <div className="mb-6 shrink-0">
              <h2 className="text-2xl font-black text-primary mb-1 tracking-tighter uppercase italic">
                {isFlashSale ? (language === 'id' ? 'PENAWARAN LANGKA' : 'RARE OFFER') : 'ZONE ELITE'}
              </h2>
              <div className={`h-1 w-12 ${isFlashSale ? 'bg-amber-400' : 'bg-accent'} mx-auto rounded-full mb-3`} />
              <p className="text-secondary text-xs font-medium leading-relaxed px-4">
                {isFlashSale 
                  ? (language === 'id' 
                      ? 'Kesempatan sekali seumur hidup! Dapatkan akses Elite dengan harga termurah.' 
                      : 'Once in a lifetime chance! Get Elite access at the lowest price ever.')
                  : (language === 'id' 
                      ? 'Buka potensi penuh dirimu. Jadilah bagian dari elit dan kuasai setiap zona.' 
                      : 'Unlock your full potential. Join the elite and dominate every zone.')}
              </p>
            </div>

            {/* Plan Selection */}
            <div className={`w-full ${isFlashSale ? 'flex justify-center' : 'grid grid-cols-1 sm:grid-cols-3 gap-3'} mb-6 shrink-0`}>
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id as any)}
                  className={`relative p-4 rounded-2xl border-2 transition-all text-left flex flex-col ${isFlashSale ? 'w-full max-w-[240px]' : ''} ${
                    selectedPlan === plan.id
                      ? (isFlashSale ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]' : 'bg-accent/10 border-accent shadow-[0_0_20px_rgba(242,125,38,0.2)]')
                      : 'bg-white/[0.03] border-white/5 hover:border-white/10'
                  }`}
                >
                  {selectedPlan === plan.id && (
                    <div className={`absolute top-2 right-2 ${isFlashSale ? 'bg-amber-400' : 'bg-accent'} rounded-full p-0.5`}>
                      <Check className="w-3 h-3 text-black" />
                    </div>
                  )}
                  <span className={`text-[10px] uppercase tracking-widest font-black mb-1 ${
                    selectedPlan === plan.id ? (isFlashSale ? 'text-amber-400' : 'text-accent') : 'text-secondary'
                  }`}>
                    {plan.name}
                  </span>
                  <div className="flex items-baseline space-x-1 mb-1">
                    <span className="text-xl font-black text-primary tracking-tighter">{plan.price}</span>
                    {isFlashSale && plan.oldPrice && (
                      <span className="text-xs text-white/20 line-through font-mono">{plan.oldPrice}</span>
                    )}
                    <span className="text-[10px] text-secondary font-medium">{plan.period}</span>
                  </div>
                  <span className="text-[9px] text-secondary/60 font-medium leading-tight">{plan.desc}</span>
                </button>
              ))}
            </div>

            <div className="w-full bg-white/[0.03] rounded-3xl p-5 mb-6 border border-white/5 backdrop-blur-sm shrink-0">
              <ul className="grid grid-cols-1 gap-3 text-left">
                {features.map((feature, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className={`flex-shrink-0 ${isFlashSale ? 'bg-amber-400/20' : 'bg-accent/20'} p-1.5 rounded-xl`}>
                      <Check className={`w-3 h-3 ${isFlashSale ? 'text-amber-400' : 'text-accent'}`} />
                    </div>
                    <span className="text-[11px] font-bold text-primary/90 tracking-tight">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start space-x-3 text-left shrink-0"
              >
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-rose-400 leading-normal">{error}</p>
              </motion.div>
            )}

            <div className="w-full space-y-3 shrink-0">
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className={`group relative w-full py-4 rounded-2xl font-black text-lg ${isFlashSale ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-rose-600' : 'bg-gradient-to-r from-accent via-amber-500 to-purple-600'} text-white shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center space-x-3 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden`}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <span className="relative uppercase italic tracking-tighter">
                    {language === 'id' ? 'AMBIL PENAWARAN' : 'CLAIM OFFER'}
                  </span>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-xs text-white/30 hover:text-white/60 transition-colors uppercase tracking-[0.2em]"
              >
                {language === 'id' ? 'Mungkin nanti' : 'Maybe later'}
              </button>
            </div>
            
            <p className="text-[10px] font-bold text-white/20 mt-6 uppercase tracking-widest shrink-0">
              {language === 'id' 
                ? 'Google Play Secure • Batalkan Kapan Saja' 
                : 'Google Play Secure • Cancel Anytime'}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
