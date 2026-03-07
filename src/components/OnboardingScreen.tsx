import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PathType } from '../store';
import { ArrowRight, ChevronLeft } from 'lucide-react';

import { t } from '../utils/translations';

interface OnboardingScreenProps {
  onSelectPath: (path: PathType) => void;
  language: 'en' | 'id';
}

const PATHS: { id: PathType; label: string; desc: string }[] = [
  { id: 'PRODUCTIVE', label: 'Become more productive', desc: 'Focus on work, study, and goals.' },
  { id: 'STRONGER', label: 'Become stronger', desc: 'Physical health and fitness.' },
  { id: 'EXTROVERT', label: 'Introvert → Extrovert', desc: 'Social skills and confidence.' },
  { id: 'DISCIPLINE', label: 'Better discipline', desc: 'Build unbreakable habits.' },
  { id: 'MENTAL_HEALTH', label: 'Better mental health', desc: 'Peace, mindfulness, and clarity.' },
  { id: 'OTHER', label: 'Other (Custom)', desc: 'Create your own custom missions.' },
];

const PRODUCTIVITY_TIMES = [
  { id: 'morning', label: 'Morning', desc: '5:00 AM - 10:00 AM' },
  { id: 'afternoon', label: 'Afternoon', desc: '11:00 AM - 3:00 PM' },
  { id: 'evening', label: 'Evening', desc: '4:00 PM - 9:00 PM' },
  { id: 'night', label: 'Night', desc: '10:00 PM onwards' },
];

const BAD_HABITS = [
  { id: 'procrastination', label: 'Procrastination', desc: 'Putting things off until the last minute.' },
  { id: 'doomscrolling', label: 'Doomscrolling', desc: 'Endless scrolling on social media.' },
  { id: 'bad_diet', label: 'Poor Diet', desc: 'Junk food and too much sugar.' },
  { id: 'lack_of_sleep', label: 'Lack of Sleep', desc: 'Staying up late for no reason.' },
];

export default function OnboardingScreen({ onSelectPath, language }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [selectedPath, setSelectedPath] = useState<PathType | null>(null);

  const handleSelectPath = (path: PathType) => {
    setSelectedPath(path);
    setStep(1);
  };

  const handleSelectTime = () => {
    setStep(2);
  };

  const handleSelectHabit = () => {
    setStep(3);
  };

  const handleEnterZone = () => {
    if (selectedPath) {
      onSelectPath(selectedPath);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {step > 0 && step < 3 && (
        <button 
          onClick={handleBack}
          className="absolute top-6 left-6 z-10 p-2 bg-surface border border-white/10 rounded-full text-secondary hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full px-6 pt-20 pb-10 overflow-y-auto no-scrollbar"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-4xl font-display font-bold leading-tight mb-4">{t('onboarding.title', language)}</h2>
              <p className="text-secondary">{t('onboarding.subtitle', language)}</p>
            </motion.div>

            <div className="space-y-3 flex-1">
              {PATHS.map((path, index) => (
                <motion.button
                  key={path.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => handleSelectPath(path.id)}
                  className="w-full text-left bg-surface hover:bg-surface-hover p-5 rounded-2xl flex items-center justify-between group transition-all border border-white/5"
                >
                  <div>
                    <h3 className="font-bold text-lg mb-1">{t(`onboarding.path.${path.id.toLowerCase()}`, language)}</h3>
                    <p className="text-sm text-secondary">{t(`onboarding.path.${path.id.toLowerCase()}.desc`, language)}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full px-6 pt-20 pb-10 overflow-y-auto no-scrollbar"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-4xl font-display font-bold leading-tight mb-4">{t('onboarding.time.title', language)}</h2>
              <p className="text-secondary">{t('onboarding.time.subtitle', language)}</p>
            </motion.div>

            <div className="space-y-3 flex-1">
              {PRODUCTIVITY_TIMES.map((time, index) => (
                <motion.button
                  key={time.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={handleSelectTime}
                  className="w-full text-left bg-surface hover:bg-surface-hover p-5 rounded-2xl flex items-center justify-between group transition-all border border-white/5"
                >
                  <div>
                    <h3 className="font-bold text-lg mb-1">{t(`onboarding.time.${time.id}`, language)}</h3>
                    <p className="text-sm text-secondary">{t(`onboarding.time.${time.id}.desc`, language)}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full px-6 pt-20 pb-10 overflow-y-auto no-scrollbar"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-4xl font-display font-bold leading-tight mb-4">{t('onboarding.habit.title', language)}</h2>
              <p className="text-secondary">{t('onboarding.habit.subtitle', language)}</p>
            </motion.div>

            <div className="space-y-3 flex-1">
              {BAD_HABITS.map((habit, index) => (
                <motion.button
                  key={habit.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={handleSelectHabit}
                  className="w-full text-left bg-surface hover:bg-surface-hover p-5 rounded-2xl flex items-center justify-between group transition-all border border-white/5"
                >
                  <div>
                    <h3 className="font-bold text-lg mb-1">{t(`onboarding.habit.${habit.id}`, language)}</h3>
                    <p className="text-sm text-secondary">{t(`onboarding.habit.${habit.id}.desc`, language)}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center justify-start pt-32 h-full px-6 text-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-4xl font-display font-black leading-tight mb-4 tracking-tight">
                {t('onboarding.ready.title', language)}
              </h2>
              <p className="text-secondary text-lg max-w-xs mx-auto">
                {t('onboarding.ready.subtitle', language)}
              </p>
            </motion.div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={handleEnterZone}
              className="w-full max-w-xs py-5 rounded-2xl font-bold text-lg bg-primary text-background hover:bg-gray-200 transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-2 group"
            >
              <span>{t('onboarding.enter_zone', language)}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
