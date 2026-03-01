import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, Info, Lightbulb } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface StatDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stat: { id: string; subject: string; label?: string; A: number } | null;
  language: 'en' | 'id';
}

const STAT_DETAILS: Record<string, { en: { desc: string; tips: string }; id: { desc: string; tips: string } }> = {
  physical: {
    en: {
      desc: "Based on your completed physical training and workout missions.",
      tips: "Complete more 'STRONGER' path missions. Consistency in daily workouts boosts this significantly."
    },
    id: {
      desc: "Berdasarkan misi latihan fisik dan olahraga yang kamu selesaikan.",
      tips: "Selesaikan lebih banyak misi di jalur 'STRONGER'. Konsistensi olahraga harian sangat meningkatkan stat ini."
    }
  },
  discipline: {
    en: {
      desc: "Reflects your current day streak and consistency in logging in and completing tasks.",
      tips: "Don't break the streak! Log in every day and complete at least one mission to keep the fire burning."
    },
    id: {
      desc: "Mencerminkan streak harian dan konsistensi kamu dalam menyelesaikan tugas.",
      tips: "Jangan putus streak! Login setiap hari dan selesaikan minimal satu misi untuk menjaga api tetap menyala."
    }
  },
  mental: {
    en: {
      desc: "Derived from your mindfulness, meditation, and mental health missions.",
      tips: "Take time to breathe. Switch to the 'MENTAL HEALTH' path to focus on your inner peace."
    },
    id: {
      desc: "Didapat dari misi mindfulness, meditasi, dan kesehatan mental kamu.",
      tips: "Luangkan waktu untuk bernapas. Pindah ke jalur 'MENTAL HEALTH' untuk fokus pada kedamaian batin."
    }
  },
  ambition: {
    en: {
      desc: "Represents your overall drive, measured by total levels gained across all paths and badges earned.",
      tips: "Unlock more badges by completing weekly missions and exploring different paths to level up."
    },
    id: {
      desc: "Mewakili ambisi kamu, diukur dari total level di semua jalur dan lencana yang didapat.",
      tips: "Buka lebih banyak lencana dengan menyelesaikan misi mingguan dan jelajahi berbagai jalur."
    }
  },
  intellect: {
    en: {
      desc: "Based on your focus, deep work, and productivity missions completed.",
      tips: "Tackle deep work sessions and complete 'PRODUCTIVE' path missions to sharpen your mind."
    },
    id: {
      desc: "Berdasarkan misi fokus, kerja mendalam, dan produktivitas yang diselesaikan.",
      tips: "Lakukan sesi deep work dan selesaikan misi di jalur 'PRODUCTIVE' untuk mempertajam pikiran."
    }
  },
  social: {
    en: {
      desc: "Reflects your social interactions and extrovert missions completed.",
      tips: "Step out of your comfort zone. Engage in 'EXTROVERT' path missions to build connections."
    },
    id: {
      desc: "Mencerminkan interaksi sosial dan misi ekstrovert yang kamu selesaikan.",
      tips: "Keluar dari zona nyaman. Lakukan misi di jalur 'EXTROVERT' untuk membangun relasi."
    }
  }
};

export default function StatDetailModal({ isOpen, onClose, stat, language }: StatDetailModalProps) {
  // Generate mock trend data ending at the current score
  const trendData = useMemo(() => {
    if (!stat) return [];
    return Array.from({ length: 7 }, (_, i) => {
      // Create a realistic looking upward/stable trend
      const variance = Math.floor(Math.random() * 5);
      const dayScore = Math.max(0, stat.A - (6 - i) * 2 - variance);
      return { day: i, score: dayScore };
    });
  }, [stat]);

  if (!stat) return null;

  const details = STAT_DETAILS[stat.id]?.[language] || STAT_DETAILS.physical[language];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 pb-24 sm:pb-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-surface border border-white/10 rounded-3xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div>
                <h3 className="text-sm font-mono uppercase tracking-widest text-secondary mb-1">
                  {language === 'id' ? 'Detail Stat' : 'Stat Detail'}
                </h3>
                <div className="flex items-center space-x-3">
                  <h2 className="text-3xl font-display font-black tracking-tight text-primary">
                    {stat.label || stat.subject}
                  </h2>
                  <div className="bg-accent/20 text-accent px-3 py-1 rounded-lg font-mono font-bold text-xl border border-accent/30">
                    {stat.A}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto no-scrollbar space-y-8">
              {/* Chart Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <h4 className="font-bold text-sm">
                    {language === 'id' ? 'Progres 7 Hari Terakhir' : 'Last 7 Days Progress'}
                  </h4>
                </div>
                <div className="h-32 w-full bg-background/50 rounded-2xl p-4 border border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#F27D26" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#F27D26', strokeWidth: 2, stroke: '#141414' }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Explanation Section */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-blue-400 mb-1">
                      {language === 'id' ? 'Kenapa angkanya segini?' : 'Why is it this score?'}
                    </h4>
                    <p className="text-sm text-blue-100/80 leading-relaxed">
                      {details.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tips Section */}
              <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-accent mb-1">
                      {language === 'id' ? 'Tips Peningkatan' : 'Improvement Tips'}
                    </h4>
                    <p className="text-sm text-orange-100/80 leading-relaxed">
                      {details.tips}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
