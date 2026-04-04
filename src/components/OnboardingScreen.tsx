import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PathType } from '../store';
import { ArrowRight, ChevronLeft, Zap, Shield, Brain, Target, BookOpen, Users, Share2, Package, Star, Store, ChevronRight } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

import { t } from '../utils/translations';
import { sounds } from '../utils/sounds';

import { analyzeOnboardingAnswers } from '../services/GeminiService';

interface OnboardingScreenProps {
  onSelectPath: (path: PathType, baseStats: Record<string, number>) => void;
  language: 'en' | 'id';
}

interface Question {
  id: string;
  title: string;
  text: string;
  options: {
    id: string;
    label: string;
    effect?: Record<string, number>;
    path?: PathType;
  }[];
  hasOther?: boolean;
  otherPlaceholder?: string;
  example?: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'morning',
    title: 'onboarding.q1.title',
    text: 'onboarding.q1.text',
    options: [
      { id: 'a', label: 'onboarding.q1.a', effect: { intellect: 5 } },
      { id: 'b', label: 'onboarding.q1.b', effect: { physical: 5 } },
      { id: 'c', label: 'onboarding.q1.c', effect: { social: 5 } },
    ],
    hasOther: true,
    otherPlaceholder: 'onboarding.q1.other',
    example: 'onboarding.q1.example'
  },
  {
    id: 'archetype',
    title: 'onboarding.q2.title',
    text: 'onboarding.q2.text',
    options: [
      { id: 'a', label: 'onboarding.q2.a', effect: { ambition: 5 } },
      { id: 'b', label: 'onboarding.q2.b', effect: { discipline: 5 } },
      { id: 'c', label: 'onboarding.q2.c', effect: { mental: 5 } },
    ],
    hasOther: true,
    otherPlaceholder: 'onboarding.q2.other',
    example: 'onboarding.q2.example'
  },
  {
    id: 'energy',
    title: 'onboarding.q3.title',
    text: 'onboarding.q3.text',
    options: [
      { id: 'a', label: 'onboarding.q3.a', effect: { social: 5 } },
      { id: 'b', label: 'onboarding.q3.b', effect: { intellect: 5 } },
      { id: 'c', label: 'onboarding.q3.c', effect: { mental: 5 } },
    ],
    hasOther: true,
    otherPlaceholder: 'onboarding.q3.other',
    example: 'onboarding.q3.example'
  },
  {
    id: 'pressure',
    title: 'onboarding.q4.title',
    text: 'onboarding.q4.text',
    options: [
      { id: 'a', label: 'onboarding.q4.a', effect: { discipline: 5 } },
      { id: 'b', label: 'onboarding.q4.b', effect: { ambition: 5 } },
      { id: 'c', label: 'onboarding.q4.c', effect: { discipline: -5 } },
    ],
    hasOther: true,
    otherPlaceholder: 'onboarding.q4.other',
    example: 'onboarding.q4.example'
  },
  {
    id: 'path',
    title: 'onboarding.q5.title',
    text: 'onboarding.q5.text',
    options: [
      { id: 'a', label: 'onboarding.q5.a', path: 'STRONGER' },
      { id: 'b', label: 'onboarding.q5.b', path: 'DISCIPLINE' },
      { id: 'c', label: 'onboarding.q5.c', path: 'MENTAL_HEALTH' },
    ],
    hasOther: true,
    otherPlaceholder: 'onboarding.q5.other',
    example: 'onboarding.q5.example'
  }
];

export default function OnboardingScreen({ onSelectPath, language }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [baseStats, setBaseStats] = useState<Record<string, number>>({
    intellect: 0,
    physical: 0,
    social: 0,
    ambition: 0,
    discipline: 0,
    mental: 0
  });
  const [selectedPath, setSelectedPath] = useState<PathType | null>(null);
  const [otherValue, setOtherValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showOVR, setShowOVR] = useState(false);
  const [showPathSelection, setShowPathSelection] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const handleSelectOption = (option: typeof QUESTIONS[0]['options'][0]) => {
    sounds.playClick();
    setAnswers(prev => [...prev, `${QUESTIONS[step].text}: ${option.label}`]);
    
    if (option.effect) {
      setBaseStats(prev => {
        const next = { ...prev };
        Object.entries(option.effect!).forEach(([stat, value]) => {
          next[stat] = (next[stat] || 0) + value;
        });
        return next;
      });
    }

    if (option.path) {
      setSelectedPath(option.path);
    }

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      setOtherValue('');
    } else {
      startAnalysis();
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setStep(QUESTIONS.length);
    
    // AI Analysis
    const analysis = await analyzeOnboardingAnswers(answers, language);
    
    if (analysis) {
      setBaseStats(analysis.statAdjustments);
      setSelectedPath(analysis.suggestedPath);
      setAiFeedback(analysis.feedback);
    }
    
    setIsAnalyzing(false);
    setShowOVR(true);
    sounds.playSuccess();
  };

  const handleOtherSubmit = () => {
    if (!otherValue.trim()) return;
    sounds.playClick();
    setAnswers(prev => [...prev, `${QUESTIONS[step].text}: ${otherValue}`]);
    
    if (step === QUESTIONS.length - 1) {
      setSelectedPath('OTHER');
    }

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      setOtherValue('');
    } else {
      startAnalysis();
    }
  };

  const handleContinueFromOVR = () => {
    sounds.playClick();
    setShowOVR(false);
    setShowPathSelection(true);
  };

  const handleFinalPathSelect = (path: PathType) => {
    sounds.playClick();
    setSelectedPath(path);
  };

  const handleEnterZone = () => {
    if (selectedPath) {
      sounds.playVictory();
      onSelectPath(selectedPath, baseStats);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setOtherValue('');
    }
  };

  const getRecommendation = (): PathType => {
    const scores = {
      STRONGER: baseStats.physical,
      DISCIPLINE: baseStats.discipline + baseStats.ambition,
      MENTAL_HEALTH: baseStats.mental,
      PRODUCTIVE: baseStats.intellect,
      EXTROVERT: baseStats.social
    };
    
    let bestPath: PathType = 'DISCIPLINE';
    let maxScore = -Infinity;
    
    Object.entries(scores).forEach(([path, score]) => {
      if (score > maxScore) {
        maxScore = score;
        bestPath = path as PathType;
      }
    });
    
    return bestPath;
  };

  const currentQuestion = QUESTIONS[step];
  const recommendedPath = getRecommendation();
  const ovr = Math.floor((baseStats.physical + baseStats.discipline + baseStats.mental + baseStats.ambition + baseStats.intellect + baseStats.social) / 6) + 40;

  const radarData = [
    { id: 'physical', subject: t('profile.stat.physical', language), A: baseStats.physical + 40, fullMark: 99 },
    { id: 'discipline', subject: t('profile.stat.discipline', language), A: baseStats.discipline + 40, fullMark: 99 },
    { id: 'mental', subject: t('profile.stat.mental', language), A: baseStats.mental + 40, fullMark: 99 },
    { id: 'ambition', subject: t('profile.stat.ambition', language), A: baseStats.ambition + 40, fullMark: 99 },
    { id: 'intellect', subject: t('profile.stat.intellect', language), A: baseStats.intellect + 40, fullMark: 99 },
    { id: 'social', subject: t('profile.stat.social', language), A: baseStats.social + 40, fullMark: 99 },
  ];

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {step > 0 && step < QUESTIONS.length && (
        <button 
          onClick={handleBack}
          className="absolute top-6 left-6 z-10 p-2 bg-surface border border-white/10 rounded-full text-secondary hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      <AnimatePresence mode="wait">
        {isAnalyzing && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full bg-black space-y-10 p-6 text-center"
          >
            {/* Bullseye Segmented Animation */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Outer dashed ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-white/20"
              />
              {/* Middle dashed ring (spins opposite) */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                className="absolute inset-3 rounded-full border-[3px] border-dashed border-white/40"
              />
              {/* Inner dashed ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-6 rounded-full border-2 border-dashed border-white/60"
              />
              {/* Center pulsing core */}
              <motion.div
                animate={{ scale: [0.7, 1.2, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-3 h-3 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)]"
              />
            </div>

            {/* Text */}
            <div className="flex flex-col items-center space-y-3">
              <motion.h2 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-2xl font-display font-black text-white tracking-[0.3em] ml-[0.3em]"
              >
                ZONE
              </motion.h2>
              <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.2em] ml-[0.2em]">
                {t('onboarding.analyzing', language).toUpperCase()}
              </p>
            </div>
          </motion.div>
        )}

        {showOVR && (
          <motion.div
            key="ovr_reveal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col h-full px-6 pt-20 pb-10 overflow-y-auto no-scrollbar"
          >
            <div className="text-center mb-8">
              {aiFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-2xl text-accent text-sm italic"
                >
                  "{aiFeedback}"
                </motion.div>
              )}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-accent font-mono text-xs uppercase tracking-widest mb-2">Profile Established</h3>
                <h2 className="text-4xl font-display font-black mb-4 tracking-tighter">YOUR INITIAL OVR</h2>
              </motion.div>
            </div>

            {/* OVR Stats Radar Chart - Replicated from ProfileScreen */}
            <div className="mb-8">
              <div className="bg-surface/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center">
                <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
                
                <div className="relative w-full aspect-square max-w-[340px]">
                  {/* OVR Number in Center */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="flex flex-col items-center justify-center bg-[#0a0a0a] w-16 h-16 rounded-full border border-white/10 shadow-lg shadow-orange-500/20">
                      <span className="text-[10px] font-mono text-secondary leading-none">OVR</span>
                      <span className="text-2xl font-display font-black text-[#F43F5E] leading-none mt-1">{ovr}</span>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                      <PolarGrid gridType="polygon" stroke="rgba(249, 115, 22, 0.4)" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={(props: any) => {
                          const { payload, x, y, textAnchor, stroke, radius } = props;
                          const getStatColorHex = (subject: string) => {
                            const lowerSubject = subject.toLowerCase();
                            if (lowerSubject.includes('fisik') || lowerSubject.includes('physical')) return '#ef4444'; // Red
                            if (lowerSubject.includes('disiplin') || lowerSubject.includes('discipline')) return '#3b82f6'; // Blue
                            if (lowerSubject.includes('mental')) return '#a855f7'; // Purple
                            if (lowerSubject.includes('ambisi') || lowerSubject.includes('ambition')) return '#f97316'; // Orange
                            if (lowerSubject.includes('intelek') || lowerSubject.includes('intellect')) return '#06b6d4'; // Cyan
                            if (lowerSubject.includes('sosial') || lowerSubject.includes('social')) return '#22c55e'; // Green
                            return '#ffffff';
                          };
                          return (
                            <text 
                              radius={radius} 
                              stroke={stroke} 
                              x={x} 
                              y={y} 
                              className="recharts-text recharts-polar-angle-axis-tick-value" 
                              textAnchor={textAnchor} 
                              fill={getStatColorHex(payload.value)}
                              fontSize={8}
                              fontFamily="monospace"
                              fontWeight="bold"
                            >
                              <tspan x={x} dy="0.3em">{payload.value}</tspan>
                            </text>
                          );
                        }}
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 99]} tick={false} axisLine={false} />
                      <Radar
                        name="OVR"
                        dataKey="A"
                        stroke="#f97316"
                        strokeWidth={2}
                        fill="#f97316"
                        fillOpacity={0.2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="w-full grid grid-cols-3 gap-2 mt-4">
                  {radarData.map((stat, index) => {
                    const getStatColor = (subject: string) => {
                      const lowerSubject = subject.toLowerCase();
                      if (lowerSubject.includes('fisik') || lowerSubject.includes('physical')) return 'text-red-500';
                      if (lowerSubject.includes('disiplin') || lowerSubject.includes('discipline')) return 'text-blue-500';
                      if (lowerSubject.includes('mental')) return 'text-purple-500';
                      if (lowerSubject.includes('ambisi') || lowerSubject.includes('ambition')) return 'text-orange-500';
                      if (lowerSubject.includes('intelek') || lowerSubject.includes('intellect')) return 'text-cyan-500';
                      if (lowerSubject.includes('sosial') || lowerSubject.includes('social')) return 'text-green-500';
                      return 'text-primary';
                    };
                    
                    return (
                      <div 
                        key={`${stat.id}-${index}`} 
                        className="flex flex-col items-center bg-background/50 rounded-xl p-2 border border-white/5"
                      >
                        <span className="text-[9px] font-mono text-secondary uppercase tracking-wider mb-1">{stat.subject}</span>
                        <span className={`font-display font-bold ${getStatColor(stat.subject)}`}>{stat.A}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5 }}
              onClick={handleContinueFromOVR}
              className="w-full py-5 rounded-2xl font-bold text-lg bg-primary text-background hover:bg-gray-200 transition-all flex items-center justify-center space-x-2"
            >
              <span>CONTINUE</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {showPathSelection && (
          <motion.div
            key="path_selection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full px-6 pt-20 pb-10 overflow-y-auto no-scrollbar"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-display font-black mb-2 tracking-tight">{t('onboarding.title', language)}</h2>
              <p className="text-secondary text-sm">{t('onboarding.subtitle', language)}</p>
            </div>

            {recommendedPath && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 bg-accent/10 border border-accent/20 rounded-2xl p-4 flex items-center space-x-4"
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-accent text-xs uppercase tracking-widest mb-0.5">Recommended Path</h4>
                  <p className="text-sm text-white font-medium">
                    {t('onboarding.recommendation', language, { path: t(`onboarding.path.${recommendedPath}.name`, language) })}
                  </p>
                </div>
              </motion.div>
            )}

            <div className="space-y-4 flex-1">
              {[
                { id: 'PRODUCTIVE', label: 'onboarding.path.productive' },
                { id: 'STRONGER', label: 'onboarding.path.stronger' },
                { id: 'EXTROVERT', label: 'onboarding.path.extrovert' },
                { id: 'DISCIPLINE', label: 'onboarding.path.discipline' },
                { id: 'MENTAL_HEALTH', label: 'onboarding.path.mental_health' },
                { id: 'OTHER', label: 'onboarding.path.other' },
              ].map((path, index) => (
                <motion.button
                  key={path.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => handleFinalPathSelect(path.id as PathType)}
                  className={`w-full text-left p-5 rounded-2xl flex items-center justify-between transition-all border ${
                    selectedPath === path.id 
                      ? 'bg-accent/20 border-accent shadow-lg shadow-accent/10' 
                      : 'bg-surface border-white/5 hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-bold text-lg">{t(path.label, language)}</h3>
                      {recommendedPath === path.id && (
                        <span className="text-[8px] bg-accent text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Recommended</span>
                      )}
                    </div>
                    <p className="text-xs text-secondary">{t(`${path.label}.desc`, language)}</p>
                  </div>
                  <ArrowRight className={`w-5 h-5 ml-4 shrink-0 transition-colors ${selectedPath === path.id ? 'text-accent' : 'text-secondary'}`} />
                </motion.button>
              ))}
            </div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              onClick={handleEnterZone}
              disabled={!selectedPath}
              className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center space-x-2 mt-8 ${
                selectedPath 
                  ? 'bg-primary text-background hover:bg-gray-200 shadow-xl shadow-primary/20' 
                  : 'bg-surface text-secondary cursor-not-allowed'
              }`}
            >
              <span>{t('onboarding.enter_zone', language)}</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {!isAnalyzing && !showOVR && !showPathSelection && step < QUESTIONS.length && (
          <motion.div 
            key={`step${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full px-6 pt-20 pb-10 overflow-y-auto no-scrollbar"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h3 className="text-accent font-mono text-xs uppercase tracking-widest mb-2">{t(currentQuestion.title, language)}</h3>
              <h2 className="text-2xl font-display font-bold leading-tight mb-4">{t(currentQuestion.text, language)}</h2>
            </motion.div>

            <div className="space-y-3 flex-1">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => handleSelectOption(option)}
                  className="w-full text-left bg-surface hover:bg-surface-hover p-5 rounded-2xl flex items-center justify-between group transition-all border border-white/5"
                >
                  <span className="font-medium text-primary/90">{t(option.label, language)}</span>
                  <ArrowRight className="w-5 h-5 text-secondary group-hover:text-primary transition-colors shrink-0" />
                </motion.button>
              ))}

              {currentQuestion.hasOther && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + currentQuestion.options.length * 0.1 }}
                  className="space-y-3 pt-2"
                >
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t(currentQuestion.otherPlaceholder || '', language)}
                      value={otherValue}
                      onChange={(e) => setOtherValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleOtherSubmit()}
                      className="w-full bg-surface border border-white/10 rounded-2xl px-5 py-5 text-primary placeholder:text-secondary focus:outline-none focus:border-accent transition-colors"
                    />
                    {otherValue.trim() && (
                      <button 
                        onClick={handleOtherSubmit}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-accent text-white rounded-xl"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-secondary/60 italic px-2">
                    {t(currentQuestion.example || '', language)}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
