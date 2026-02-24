import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PathType } from '../store';
import { ArrowRight } from 'lucide-react';

interface OnboardingScreenProps {
  onSelectPath: (path: PathType) => void;
}

const PATHS: { id: PathType; label: string; desc: string }[] = [
  { id: 'PRODUCTIVE', label: 'Become more productive', desc: 'Focus on work, study, and goals.' },
  { id: 'STRONGER', label: 'Become stronger', desc: 'Physical health and fitness.' },
  { id: 'EXTROVERT', label: 'Introvert → Extrovert', desc: 'Social skills and confidence.' },
  { id: 'DISCIPLINE', label: 'Better discipline', desc: 'Build unbreakable habits.' },
  { id: 'MENTAL_HEALTH', label: 'Better mental health', desc: 'Peace, mindfulness, and clarity.' },
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

export default function OnboardingScreen({ onSelectPath }: OnboardingScreenProps) {
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
    if (selectedPath) {
      onSelectPath(selectedPath);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
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
              <h2 className="text-4xl font-display font-bold leading-tight mb-4">Why are you<br/>doing this?</h2>
              <p className="text-secondary">Choose your path. We will tailor your daily missions to help you reach your goal.</p>
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
                    <h3 className="font-bold text-lg mb-1">{path.label}</h3>
                    <p className="text-sm text-secondary">{path.desc}</p>
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
              <h2 className="text-4xl font-display font-bold leading-tight mb-4">When are you<br/>most productive?</h2>
              <p className="text-secondary">We'll use this to schedule your daily missions.</p>
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
                    <h3 className="font-bold text-lg mb-1">{time.label}</h3>
                    <p className="text-sm text-secondary">{time.desc}</p>
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
              <h2 className="text-4xl font-display font-bold leading-tight mb-4">What bad habit<br/>do you want<br/>to break?</h2>
              <p className="text-secondary">We'll help you slowly leave this behind.</p>
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
                    <h3 className="font-bold text-lg mb-1">{habit.label}</h3>
                    <p className="text-sm text-secondary">{habit.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
