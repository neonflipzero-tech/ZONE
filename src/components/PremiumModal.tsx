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
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('monthly');

  const getPrice = (planId: string) => {
    if (language === 'id') {
      switch (planId) {
        case 'monthly': return 'Rp 69.000';
        case 'yearly': return 'Rp 449.000';
        case 'lifetime': return 'Rp 749.000';
        default: return '';
      }
    } else {
      switch (planId) {
        case 'monthly': return '$4.99';
        case 'yearly': return '$29.99';
        case 'lifetime': return '$49.99';
        default: return '';
      }
    }
  };

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

  const plans = [
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
    'Analisis Progres Dinamis (Line Chart)',
    'Analisis Distribusi Fokus (Donut Chart)',
    'Misi kustom tanpa batas (Unlimited)',
    'Bingkai Profil Eksklusif "Elite"',
    'Lencana (Badge) Emas Premium',
    'Tema Profil Kustom (Neon/Dark)',
    'Mendukung pengembangan aplikasi'
  ] : [
    '+50% XP Boost',
    '+25% Coin Bonus',
    'Dynamic Progress Analysis (Line Chart)',
    'Focus Distribution Analysis (Donut Chart)',
    'Unlimited custom missions',
    'Exclusive "Elite" Profile Frames',
    'Premium Gold Badges',
    'Custom Profile Themes (Neon/Dark)',
    'Support app development'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          className="relative w-full max-w-md bg-background border border-accent/30 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)] max-h-[95vh] flex flex-col"
        >
          {/* Animated background glow */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-accent/30 via-purple-500/20 to-transparent pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute top-48 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors z-20 border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative flex-1 overflow-y-auto no-scrollbar pt-10 px-6 pb-8 flex flex-col items-center text-center">
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
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent via-rose-400 to-purple-600 p-0.5 mb-4 shadow-[0_0_30px_rgba(244,63,94,0.3)] shrink-0"
            >
              <div className="w-full h-full bg-background rounded-2xl flex items-center justify-center">
                <Crown className="w-8 h-8 text-accent" />
              </div>
            </motion.div>

            <div className="mb-6 shrink-0">
              <h2 className="text-2xl font-black text-primary mb-1 tracking-tighter uppercase italic">ZONE ELITE</h2>
              <div className="h-1 w-12 bg-accent mx-auto rounded-full mb-3" />
              <p className="text-secondary text-xs font-medium leading-relaxed px-4">
                {language === 'id' 
                  ? 'Buka potensi penuh dirimu. Jadilah bagian dari elit dan kuasai setiap zona.' 
                  : 'Unlock your full potential. Join the elite and dominate every zone.'}
              </p>
            </div>

            {/* Plan Selection */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 shrink-0">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id as any)}
                  className={`relative p-4 rounded-2xl border-2 transition-all text-left flex flex-col ${
                    selectedPlan === plan.id
                      ? 'bg-accent/10 border-accent shadow-[0_0_20px_rgba(242,125,38,0.2)]'
                      : 'bg-white/[0.03] border-white/5 hover:border-white/10'
                  }`}
                >
                  {selectedPlan === plan.id && (
                    <div className="absolute top-2 right-2 bg-accent rounded-full p-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className={`text-[10px] uppercase tracking-widest font-black mb-1 ${
                    selectedPlan === plan.id ? 'text-accent' : 'text-secondary'
                  }`}>
                    {plan.name}
                  </span>
                  <div className="flex items-baseline space-x-1 mb-1">
                    <span className="text-xl font-black text-primary tracking-tighter">{plan.price}</span>
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
                    <div className="flex-shrink-0 bg-accent/20 p-1.5 rounded-xl">
                      <Check className="w-3 h-3 text-accent" />
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

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="group relative w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-accent via-rose-500 to-purple-600 text-white shadow-[0_10px_30px_rgba(244,63,94,0.3)] hover:shadow-[0_15px_40px_rgba(244,63,94,0.5)] transition-all flex items-center justify-center space-x-3 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden shrink-0"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span className="relative uppercase italic tracking-tighter">
                    {language === 'id' 
                      ? `GABUNG ELITE - ${plans.find(p => p.id === selectedPlan)?.price}` 
                      : `JOIN ELITE - ${plans.find(p => p.id === selectedPlan)?.price}`}
                  </span>
                </>
              )}
            </button>
            
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
