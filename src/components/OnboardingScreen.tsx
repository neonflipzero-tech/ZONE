import { motion } from 'motion/react';
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

export default function OnboardingScreen({ onSelectPath }: OnboardingScreenProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full px-6 pt-20 pb-10 bg-background overflow-y-auto no-scrollbar"
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
            onClick={() => onSelectPath(path.id)}
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
  );
}
