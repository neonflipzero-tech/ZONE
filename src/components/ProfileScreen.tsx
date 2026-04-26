import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserState, getRankForLevel, PathType, calculateOVR, createDefaultState, BADGES, TITLES, useAppState, getTodayISO, getIntegrityRating } from '../store';
import { Trophy, Flame, LogOut, Camera, User, Shield, ChevronDown, ChevronUp, Star, Lock, CheckCircle2, Share2, AlertTriangle, Footprints, Zap, Crown, Moon, Sun, Swords, Settings, X, Heart, Compass, Package, Store, ChevronRight, HelpCircle, Target } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { t } from '../utils/translations';
import { sounds } from '../utils/sounds';
import ProfileFrame from './ProfileFrame';
import { shareContent, shareElementAsImage } from '../utils/share';
import StatDetailModal from './StatDetailModal';
import ImageCropper from './ImageCropper';
import ResetProgressModal from './ResetProgressModal';
import FramesModal from './FramesModal';
import BadgesModal from './BadgesModal';
import TitlesModal from './TitlesModal';
import InventoryModal from './InventoryModal';
import SettingsScreen from './SettingsScreen';
import ZoneStoreModal from './ZoneStoreModal';
import PremiumModal from './PremiumModal';
import IntegrityExplanationModal from './IntegrityExplanationModal';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const BADGE_ICONS: Record<string, any> = {
  Footprints, CheckCircle2, Flame, Zap, Crown, Moon, Sun, Swords, Shield, Star, Trophy, Heart, Compass
};

interface ProfileScreenProps {
  state: UserState;
  onLogout: () => void;
  updateState: (updates: Partial<UserState>) => void;
  changePath: (path: PathType) => void;
  clearCustomMissions: () => void;
  rivalData: any | null;
  isFlashSale?: boolean;
}

function getRankIcon(rankName: any, className: string) {
  const name = typeof rankName === 'string' ? rankName : rankName?.en || '';
  if (name === 'Mythic') return <Crown className={className} />;
  return <Trophy className={className} />;
}

const ProfileScreen = ({ state, onLogout, updateState, changePath, clearCustomMissions, rivalData, isFlashSale = false }: ProfileScreenProps) => {
  if (!state) return null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ovrStatsRef = useRef<HTMLDivElement>(null);
  const [isGoalDropdownOpen, setIsGoalDropdownOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedStat, setSelectedStat] = useState<{id: string, subject: string, label?: string, A: number} | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isFramesModalOpen, setIsFramesModalOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isTitlesModalOpen, setIsTitlesModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isZoneStoreModalOpen, setIsZoneStoreModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConsistencyHelpOpen, setIsConsistencyHelpOpen] = useState(false);
  const [isIntegrityHelpOpen, setIsIntegrityHelpOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const activeUserEmail = useAppState(s => s.activeUserEmail);
  const crushRival = useAppState(s => s.crushRival);

  const handleResetProgress = () => {
    const defaultState = createDefaultState(state.username, activeUserEmail || undefined, state.userId);
    updateState({
      ...defaultState,
      isLoggedIn: true,
      onboardingCompleted: true, // Keep them onboarded
      chosenPath: state.chosenPath, // Keep their chosen path
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    updateState({ profilePicture: croppedImage, hasPromptedPfp: true });
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const cancelImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentRank = useMemo(() => getRankForLevel(state.level), [state.level]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    return last7Days.map(date => ({
      date: date.substring(5).replace('-', '/'),
      missions: state.dailyStats?.[date] || 0
    }));
  }, [state.dailyStats]);

  const maxMissions = useMemo(() => Math.max(...chartData.map(d => d.missions), 1), [chartData]);

  const { ovr, stats } = useMemo(() => calculateOVR(state, activeUserEmail), [state, activeUserEmail]);

  const todayISO = getTodayISO();
  const todayCategoryStats = state.dailyCategoryStats?.[todayISO] || {};
  
  const allCategories = [
    { id: 'STRONGER', name: t('profile.stat.physical.name', state.language), color: '#ff0000', shadow: '0 0 15px rgba(255, 0, 0, 0.5)' },
    { id: 'MENTAL_HEALTH', name: t('profile.stat.mental.name', state.language), color: '#0066ff', shadow: '0 0 15px rgba(0, 102, 255, 0.5)' },
    { id: 'PRODUCTIVE', name: t('profile.stat.productivity.name', state.language), color: '#00ff00', shadow: '0 0 15px rgba(0, 255, 0, 0.5)' },
    { id: 'SOCIAL', name: t('profile.stat.social.name', state.language), color: '#ffff00', shadow: '0 0 15px rgba(255, 255, 0, 0.5)' },
    { id: 'DISCIPLINE', name: t('profile.stat.discipline.name', state.language), color: '#ff00ff', shadow: '0 0 15px rgba(255, 0, 255, 0.5)' },
  ];

  const focusData = allCategories.map(cat => ({
    name: cat.name,
    value: todayCategoryStats[cat.id] || 0,
    color: cat.color,
    shadow: cat.shadow
  })).filter(d => d.value > 0);

  const totalTodayMissions = focusData.reduce((a, b) => a + b.value, 0);

  const radarData = [
    { id: 'physical', subject: t('profile.stat.physical', state.language), A: stats.physical, fullMark: 99 },
    { id: 'discipline', subject: t('profile.stat.discipline', state.language), A: stats.discipline, fullMark: 99 },
    { id: 'mental', subject: t('profile.stat.mental', state.language), A: stats.mental, fullMark: 99 },
    { id: 'ambition', subject: t('profile.stat.ambition', state.language), A: stats.ambition, fullMark: 99 },
    { id: 'intellect', subject: t('profile.stat.intellect', state.language), A: stats.intellect, fullMark: 99 },
    { id: 'social', subject: t('profile.stat.social', state.language), A: stats.social, fullMark: 99 },
  ];

  const scrollToOvrStats = () => {
    ovrStatsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const incrementShareCount = () => {
    const newShareCount = (state.shareCount || 0) + 1;
    const updates: Partial<UserState> = { shareCount: newShareCount };
    
    let newUnlockedItemsQueue = state.unlockedItemsQueue ? [...state.unlockedItemsQueue] : [];
    
    if (newShareCount >= 5) {
      if (!state.unlockedTitles?.includes('Supporter')) {
        const newTitles = [...(state.unlockedTitles || []), 'Supporter'];
        updates.unlockedTitles = newTitles;
        updates.titles = newTitles;
        newUnlockedItemsQueue.push({ type: 'title', id: 'Supporter' });
      }
      if (!state.unlockedFrames?.includes('frame-viral')) {
        updates.unlockedFrames = [...(state.unlockedFrames || []), 'frame-viral'];
        newUnlockedItemsQueue.push({ type: 'frame', id: 'frame-viral' });
      }
    }
    
    if (newUnlockedItemsQueue.length > 0) {
      updates.unlockedItemsQueue = newUnlockedItemsQueue;
    }
    
    updateState(updates);
  };

  const handleShare = async () => {
    try {
      const rankNameLocal = typeof currentRank.name === 'string' ? currentRank.name : currentRank.name[state.language];
      const success = await shareElementAsImage(
        'profile-card',
        'My ZONE Profile',
        `I'm currently Level ${state.level} (${rankNameLocal}) with an OVR of ${ovr} on ZONE! Can you beat my stats?`
      );

      if (success) {
        incrementShareCount();
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  const handleShareOvr = async () => {
    try {
      const success = await shareElementAsImage(
        'ovr-stats-card',
        'My ZONE OVR Stats',
        `Check out my OVR Stats on ZONE! My overall rating is ${ovr}. Can you beat my consistency?`
      );

      if (success) {
        incrementShareCount();
      }
    } catch (error) {
      console.error('Error sharing OVR stats:', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-background overflow-y-auto no-scrollbar pb-24"
    >
      <AnimatePresence>
      </AnimatePresence>

      <div className="px-4 pt-12 pb-6">
        <div className="flex justify-between items-center mb-6 px-2">
          <h1 className="text-2xl font-display font-black tracking-tight">{t('profile.identity', state.language)}</h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleShare}
              className="p-2 rounded-full bg-surface border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Share2 className="w-5 h-5 text-secondary" />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full bg-surface border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Settings className="w-5 h-5 text-secondary" />
            </button>
          </div>
        </div>
        
        {/* Player Card Header */}

        <div id="profile-card" className="relative mb-8 rounded-3xl overflow-hidden border border-white/10 bg-surface shadow-2xl">
          {/* Background Glow based on rank */}
          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-accent to-transparent" />
          
          <div className="relative p-6 flex flex-col items-center">
            <div className="relative group cursor-pointer mb-4" onClick={() => fileInputRef.current?.click()}>
              <ProfileFrame frame={state.equippedFrame} src={state.profilePicture} size="xl" />
              <div className="absolute bottom-0 right-0 bg-accent text-white p-2 rounded-full shadow-lg border-2 border-background z-10 transition-transform group-hover:scale-110">
                <Camera className="w-4 h-4" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            
            <h2 className="text-3xl font-black font-display tracking-tight mb-1">{state.username}</h2>
            
            {state.equippedTitle ? (() => {
              const titleDef = TITLES.find(t => t.id === state.equippedTitle);
              return (
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/20"></div>
                  <div className={`text-[10px] font-display font-bold uppercase tracking-[0.2em] inline-block ${titleDef?.specialColor || 'text-accent'}`}>
                    {titleDef?.name[state.language] || state.equippedTitle}
                  </div>
                  <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/20"></div>
                </div>
              );
            })() : (
              <div className="h-6 mb-6" />
            )}

            <div className="w-full flex items-center justify-between mb-3 px-2">
              <div className="flex items-center space-x-2">
                {getRankIcon(currentRank.name, `w-5 h-5 ${currentRank.color}`)}
                <span className={`font-bold ${currentRank.color}`}>{typeof currentRank.name === 'string' ? currentRank.name : currentRank.name[state.language]}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-end leading-none">
                  <span className="text-[10px] font-mono text-secondary mb-0.5 tracking-tighter">OVR</span>
                  <span className="font-display font-black text-[#F43F5E] text-xl">{ovr}</span>
                </div>
                <span className="font-mono text-sm font-bold text-secondary">LVL {state.level}</span>
              </div>
            </div>

            {/* XP Bar */}
            <div className="w-full h-3 bg-background/50 rounded-full overflow-hidden border border-white/5 relative">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-rose-500"
                initial={{ width: 0 }}
                animate={{ width: `${state.level >= 50 ? 100 : (state.xp / (state.level * 100)) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="w-full text-right mt-2 px-2">
              <span className="text-[10px] font-mono text-secondary">
                {state.level >= 50 ? 'MAX LEVEL' : `${state.xp} / ${(state.level) * 100} XP`}
              </span>
            </div>
          </div>
        </div>

        {/* Combat Stats / Attributes */}
        <div className="mb-8">
          <h3 className="text-sm font-mono uppercase tracking-widest text-secondary mb-4 px-2">{t('profile.discipline_metrics', state.language)}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface/50 border border-white/5 rounded-2xl p-4 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-primary">
                  {50 * state.level * (state.level - 1) + state.xp}
                </div>
                <div className="text-[10px] text-secondary font-mono uppercase tracking-wider">{t('profile.total_xp', state.language)}</div>
              </div>
            </div>
            <div className="bg-surface/50 border border-white/5 rounded-2xl p-4 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-display font-bold text-orange-500">{state.streak}</div>
                  {(state.streakFreezes || 0) > 0 && (
                    <div className="flex items-center space-x-1 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20" title="Streak Freezes Available">
                      <Shield className="w-3 h-3 text-blue-400" />
                      <span className="text-xs font-bold text-blue-400">{state.streakFreezes}</span>
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-secondary font-mono uppercase tracking-wider">{t('profile.day_streak', state.language)}</div>
              </div>
            </div>
            <div className="bg-surface/50 border border-white/5 rounded-2xl p-4 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-primary">
                  {state.missionsCompleted || 0}
                </div>
                <div className="text-[10px] text-secondary font-mono uppercase tracking-wider">{t('profile.missions_done', state.language)}</div>
              </div>
            </div>
            <div className="bg-surface/50 border border-white/5 rounded-2xl p-4 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-primary">{state.badges.length}</div>
                <div className="text-[10px] text-secondary font-mono uppercase tracking-wider">{t('profile.badges', state.language)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* OVR Stats Analysis */}
        <div className="mb-8" ref={ovrStatsRef}>
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-sm font-mono uppercase tracking-widest text-secondary">{t('profile.ovr_stats', state.language)}</h3>
            <button 
              onClick={handleShareOvr}
              data-html2canvas-ignore
              className="p-1.5 rounded-full bg-surface border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Share2 className="w-4 h-4 text-secondary" />
            </button>
          </div>

          <div id="ovr-stats-card" className="bg-surface/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center">
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
            
            <div className="w-full grid grid-cols-3 gap-2 mt-4" data-html2canvas-ignore>
              {radarData.map((stat, index) => {
                const getStatColor = (subject: string) => {
                  const s = subject.toLowerCase();
                  if (s.includes('fisik') || s.includes('physical')) return 'text-red-500';
                  if (s.includes('disiplin') || s.includes('discipline')) return 'text-blue-500';
                  if (s.includes('mental')) return 'text-purple-500';
                  if (s.includes('ambisi') || s.includes('ambition')) return 'text-orange-500';
                  if (s.includes('intelek') || s.includes('intellect')) return 'text-cyan-500';
                  if (s.includes('sosial') || s.includes('social')) return 'text-green-500';
                  return 'text-primary';
                };
                
                return (
                  <button 
                    key={`${stat.id}-${index}`} 
                    onClick={() => setSelectedStat(stat)}
                    className="flex flex-col items-center bg-background/50 rounded-xl p-2 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span className="text-[9px] font-mono text-secondary uppercase tracking-wider mb-1">{stat.subject}</span>
                    <span className={`font-display font-bold ${getStatColor(stat.subject)}`}>{stat.A}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Focus Distribution */}
        <div className="mb-8 px-2" id="focus-distribution-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-secondary">
              {t('profile.focus_distribution', state.language)}
            </h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-400/20">
                <Crown className="w-3 h-3 text-rose-400" />
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Elite</span>
              </div>
              {state.isPremium && totalTodayMissions > 0 && (
                <button 
                  onClick={() => {
                    shareElementAsImage('focus-distribution-card', t('profile.focus_distribution', state.language), 'Check out my daily focus on Zone!')
                      .catch(err => console.error('Error sharing focus distribution:', err));
                  }}
                  data-html2canvas-ignore
                  className="p-1.5 rounded-full bg-surface border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-secondary" />
                </button>
              )}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-surface/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden"
          >
            {!state.isPremium ? (
              <div className="flex flex-col items-center justify-center py-12 text-center relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-rose-400/10 flex items-center justify-center mb-6 border border-rose-400/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                  <Lock className="w-8 h-8 text-rose-400" />
                </div>
                <h4 className="text-xl font-black text-primary mb-2 tracking-tight uppercase italic">
                  {t('profile.elite_feature', state.language)}
                </h4>
                <p className="text-sm text-secondary mb-8 max-w-[240px] leading-relaxed">
                  {t('profile.unlock_analysis', state.language)}
                </p>
                <button 
                  onClick={() => setIsPremiumModalOpen(true)}
                  className="bg-gradient-to-r from-rose-400 to-rose-600 text-white font-black px-8 py-3 rounded-xl text-sm uppercase tracking-wider shadow-lg hover:scale-105 transition-transform active:scale-95"
                >
                  {t('profile.join_elite', state.language)}
                </button>
                
                {/* Blurred background preview */}
                <div className="absolute inset-0 -z-10 opacity-5 blur-xl scale-110 pointer-events-none">
                  <div className="w-full h-full bg-gradient-to-br from-rose-400 via-rose-500 to-rose-700 rounded-full" />
                </div>
              </div>
            ) : totalTodayMissions === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-sm text-secondary italic mb-6">
                  {t('profile.complete_today', state.language)}
                </p>
                
                {/* Show empty legend even when 0 missions */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 w-full max-w-md">
                  {allCategories.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2 opacity-30">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cat.color }} />
                      <span className="text-[10px] font-mono text-secondary uppercase tracking-tighter">{cat.name} (0%)</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative w-56 h-56 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={focusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={1500}
                      >
                        {focusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            style={{ filter: `drop-shadow(${entry.shadow})` }}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-display font-black text-white leading-none">{totalTodayMissions}</span>
                    <span className="text-[10px] font-mono text-secondary uppercase tracking-tighter mt-1">
                      {t('profile.missions_count', state.language)}
                    </span>
                    <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest mt-0.5">
                      {t('profile.today_focus', state.language)}
                    </span>
                  </div>
                </div>

                {/* Legend Directly Below Donut */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 w-full mt-2">
                  {allCategories.map((cat) => {
                    const value = todayCategoryStats[cat.id] || 0;
                    const percentage = totalTodayMissions > 0 ? Math.round((value / totalTodayMissions) * 100) : 0;
                    const isActive = value > 0;
                    
                    return (
                      <div key={cat.id} className={`flex items-center space-x-2 transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`}>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ 
                            backgroundColor: cat.color,
                            boxShadow: isActive ? cat.shadow : 'none'
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white/90 leading-none">{cat.name}</span>
                          <span className="text-[9px] font-mono text-secondary mt-1">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Equipment / Inventory */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-sm font-mono uppercase tracking-widest text-secondary">{t('profile.customization', state.language)}</h3>
          </div>
          <button
            onClick={() => setIsInventoryModalOpen(true)}
            className="w-full bg-surface border border-white/5 hover:border-white/20 hover:bg-white/5 rounded-2xl p-4 flex items-center justify-between transition-all group mb-4"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mr-4 group-hover:bg-accent/20 transition-colors">
                <Package className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-primary">{t('profile.inventory', state.language)}</h4>
                <p className="text-xs text-secondary mt-0.5">{t('profile.inventory_desc', state.language)}</p>
              </div>
            </div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-surface border-2 border-background flex items-center justify-center z-10">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div className="w-8 h-8 rounded-full bg-surface border-2 border-background flex items-center justify-center">
                <Star className="w-4 h-4 text-primary" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setIsZoneStoreModalOpen(true)}
            className="w-full bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/20 hover:border-accent/40 rounded-2xl p-4 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-primary">{t('profile.zone_store', state.language)}</h4>
                <p className="text-xs text-secondary mt-0.5">{t('profile.zone_store_desc', state.language)}</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-accent" />
            </div>
          </button>
        </div>

        {/* Weekly Chart */}
        <div className="mb-8" id="weekly-chart-card">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-sm font-mono uppercase tracking-widest text-secondary">{t('profile.consistency_record', state.language)}</h3>
            <div className="flex items-center space-x-2" data-html2canvas-ignore>
              <button 
                onClick={() => setIsConsistencyHelpOpen(true)}
                className="p-1.5 rounded-full bg-surface border border-white/10 hover:bg-white/10 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-secondary" />
              </button>
              <button 
                onClick={() => {
                  shareElementAsImage('weekly-chart-card', t('profile.consistency_record', state.language), 'My Weekly Consistency in Zone')
                    .catch(err => console.error('Error sharing weekly chart:', err));
                }}
                className="p-1.5 rounded-full bg-surface border border-white/10 hover:bg-white/10 transition-colors"
              >
                <Share2 className="w-4 h-4 text-secondary" />
              </button>
            </div>
          </div>
          
          <div id="weekly-chart-card" className="bg-surface border border-white/5 rounded-2xl p-5 h-64 flex flex-col justify-end relative">
            {state.preferredChartType === 'line' ? (
              <div id="elite-line-chart" className="w-full h-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#8E9299', fontSize: 10, fontFamily: 'monospace' }} 
                    />
                    <YAxis 
                      hide={true} 
                      domain={[0, maxMissions + 1]} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151619', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#F43F5E', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="missions" 
                      stroke="#F43F5E" 
                      strokeWidth={3} 
                      dot={{ fill: '#F43F5E', strokeWidth: 2, r: 4, stroke: '#151619' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div id="weekly-bar-chart" className="w-full h-full flex flex-col justify-end relative">
                <div className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none">
                  {[1, 0.75, 0.5, 0.25, 0].map((tick) => (
                    <div key={`tick-${tick}`} className="w-full border-b border-white/5 h-0 relative">
                      <span className="absolute -left-2 -top-2 text-[10px] text-secondary -translate-x-full">
                        {Math.round(maxMissions * tick)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="w-full h-full flex items-end justify-between relative z-10 pl-4">
                  {chartData.map((data, i) => {
                    const height = `${(data.missions / maxMissions) * 100}%`;
                    return (
                      <div key={`chart-bar-${data.date}-${i}`} className="flex flex-col items-center w-8 group">
                        <div className="w-full h-48 flex items-end justify-center relative">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="w-2 bg-gradient-to-t from-rose-500/20 to-accent rounded-t-full relative group-hover:from-rose-500/40 group-hover:to-accent/80 transition-all"
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-white/10 px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {data.missions} {t('profile.missions', state.language)}
                            </div>
                          </motion.div>
                        </div>
                        <div className="text-[10px] text-secondary mt-2 font-mono">{data.date}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-sm font-mono uppercase tracking-widest text-secondary">{t('profile.badges', state.language)}</h3>
            <button 
              onClick={() => setIsBadgesModalOpen(true)}
              className="text-xs font-bold text-accent hover:text-accent-hover transition-colors"
            >
              {t('profile.view_all', state.language)}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 px-2">
            {(() => {
              // Sort badges: unlocked first, then locked
              const sortedBadges = [...BADGES].sort((a, b) => {
                const aUnlocked = state.badges.includes(a.id);
                const bUnlocked = state.badges.includes(b.id);
                if (aUnlocked && !bUnlocked) return -1;
                if (!aUnlocked && bUnlocked) return 1;
                return 0;
              });

              // Show only top 4
              const displayBadges = sortedBadges.slice(0, 4);

              return displayBadges.map((badgeDef) => {
                const isUnlocked = state.badges.includes(badgeDef.id);
                const Icon = BADGE_ICONS[badgeDef.icon] || Trophy;
                const isElite = badgeDef.id === 'ELITE_ZONE';
                
                return (
                  <div 
                    key={badgeDef.id} 
                    className={`border rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                      isUnlocked 
                        ? isElite
                          ? 'bg-gradient-to-b from-amber-400/20 to-amber-600/20 border-amber-400/50 shadow-lg shadow-amber-400/20'
                          : 'bg-gradient-to-b from-surface to-surface-hover border-accent/30 shadow-lg shadow-accent/5' 
                        : 'bg-surface/30 border-white/5 opacity-50 grayscale'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                      isUnlocked 
                        ? isElite ? 'bg-amber-400/20' : 'bg-accent/20' 
                        : 'bg-white/5'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isUnlocked 
                          ? isElite ? 'text-amber-400' : 'text-accent' 
                          : 'text-secondary'
                      }`} />
                    </div>
                    <span className={`text-xs font-bold leading-tight mb-1 ${
                      isUnlocked 
                        ? isElite ? 'text-amber-400' : 'text-primary' 
                        : 'text-secondary'
                    }`}>
                      {badgeDef.name[state.language]}
                    </span>
                    {isUnlocked && (
                      <span className="text-[9px] text-secondary leading-tight opacity-80">
                        {badgeDef.desc[state.language]}
                      </span>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Your Rival Section */}
        {state.rivalId && rivalData && (
          <div className="mt-8 mb-8">
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-sm font-mono uppercase tracking-widest text-rose-500 flex items-center">
                <Swords className="w-4 h-4 mr-2" />
                {t('profile.active_rival', state.language)}
              </h3>
              <button 
                onClick={() => updateState({ rivalId: null })}
                className="text-xs text-secondary hover:text-rose-500 transition-colors"
              >
                {t('profile.remove_rival', state.language)}
              </button>
            </div>
            
            <div className="bg-surface/50 border border-rose-500/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
              
              {/* Status Banner */}
              {(() => {
                const rivalOvr = rivalData.ovr || 0;
                const rivalLevel = rivalData.level || 1;
                let bannerColor = '';
                let bannerText = '';
                
                if (state.level > rivalLevel) {
                  bannerColor = 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
                  bannerText = state.language === 'id' ? '🔥 KAMU UNGGUL — TETAP DI ATAS!' : '🔥 YOU\'RE WINNING — STAY ON TOP!';
                } else if (rivalLevel - state.level <= 2 && rivalLevel > state.level) {
                  bannerColor = 'bg-amber-500/20 text-amber-500 border-amber-500/30';
                  bannerText = state.language === 'id' ? '🎯 HAMPIR TERKEJAR — JANGAN BERHENTI!' : '🎯 CLOSING IN — DON\'T STOP NOW!';
                } else if (state.level < rivalLevel) {
                  bannerColor = 'bg-rose-500/20 text-rose-500 border-rose-500/30';
                  bannerText = state.language === 'id' ? '⚠️ RIVAL DI DEPAN — KEJAR!' : '⚠️ RIVAL IS AHEAD — CATCH UP!';
                } else {
                  // Levels are equal, compare OVR
                  if (ovr > rivalOvr) {
                    bannerColor = 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
                    bannerText = state.language === 'id' ? '🔥 KAMU UNGGUL — TETAP DI ATAS!' : '🔥 YOU\'RE WINNING — STAY ON TOP!';
                  } else if (ovr < rivalOvr) {
                    bannerColor = 'bg-rose-500/20 text-rose-500 border-rose-500/30';
                    bannerText = state.language === 'id' ? '⚠️ RIVAL DI DEPAN — KEJAR!' : '⚠️ RIVAL IS AHEAD — CATCH UP!';
                  } else {
                    bannerColor = 'bg-rose-500/20 text-rose-500 border-rose-500/30';
                    bannerText = state.language === 'id' ? '⚡ SEIMBANG — AYOK GAS!' : '⚡ DEAD EVEN — MAKE YOUR MOVE!';
                  }
                }
                return (
                  <div className={`w-full py-2 px-4 rounded-xl border mb-6 flex items-center justify-center text-xs font-bold tracking-wider ${bannerColor}`}>
                    {bannerText}
                  </div>
                );
              })()}

              <div className="flex items-center justify-between mb-6">
                {/* You */}
                <div className="flex flex-col items-center flex-1">
                  <ProfileFrame frame={state.equippedFrame} src={state.profilePicture} size="sm" />
                  <span className="text-xs font-bold mt-2 truncate max-w-[80px] text-accent">{state.username}</span>
                  <span className="text-[10px] text-[#F43F5E] font-mono mt-1">OVR {ovr}</span>
                </div>
                
                {/* VS */}
                <div className="flex flex-col items-center justify-center px-4">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                    <span className="text-xs font-black text-rose-500 italic">VS</span>
                  </div>
                </div>

                {/* Rival */}
                <div className="flex flex-col items-center flex-1">
                  <ProfileFrame frame={rivalData.equippedFrame} src={rivalData.profilePicture} size="sm" />
                  <span className="text-xs font-bold mt-2 truncate max-w-[80px] text-fuchsia-500">{rivalData.username}</span>
                  <span className="text-[10px] text-fuchsia-500 font-mono mt-1">
                    OVR {rivalData?.ovr || (rivalData ? calculateOVR(rivalData, null).ovr : 44)}
                  </span>
                </div>
              </div>

              {/* Stats Comparison */}
              <div className="space-y-4 mb-6">
                {/* Level */}
                <div className="flex flex-col">
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-accent">Lvl {state.level}</span>
                    <span className="text-secondary uppercase tracking-widest">{t('profile.level', state.language)}</span>
                    <span className="text-fuchsia-500">Lvl {rivalData.level}</span>
                  </div>
                  <div className="flex w-full h-2 bg-background rounded-full overflow-hidden">
                    <div className="flex-1 flex justify-end border-r border-background/50">
                      <div className="h-full bg-accent" style={{ width: `${(state.level / Math.max(1, Math.max(state.level, rivalData.level))) * 100}%` }} />
                    </div>
                    <div className="flex-1 flex justify-start border-l border-background/50">
                      <div className="h-full bg-fuchsia-500" style={{ width: `${(rivalData.level / Math.max(1, Math.max(state.level, rivalData.level))) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* Streak */}
                <div className="flex flex-col">
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-accent">{state.streak} <Flame className="w-3 h-3 inline" /></span>
                    <span className="text-secondary uppercase tracking-widest">{t('profile.streak', state.language)}</span>
                    <span className="text-fuchsia-500">{rivalData.streak || 0} <Flame className="w-3 h-3 inline" /></span>
                  </div>
                  <div className="flex w-full h-2 bg-background rounded-full overflow-hidden">
                    <div className="flex-1 flex justify-end border-r border-background/50">
                      <div className="h-full bg-accent" style={{ width: `${(state.streak / Math.max(1, Math.max(state.streak, rivalData.streak || 0))) * 100}%` }} />
                    </div>
                    <div className="flex-1 flex justify-start border-l border-background/50">
                      <div className="h-full bg-fuchsia-500" style={{ width: `${((rivalData.streak || 0) / Math.max(1, Math.max(state.streak, rivalData.streak || 0))) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* Total XP */}
                <div className="flex flex-col">
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-accent">{(state.xp + 50 * state.level * (state.level - 1)).toLocaleString()} XP</span>
                    <span className="text-secondary uppercase tracking-widest">{t('profile.total_xp', state.language)}</span>
                    <span className="text-fuchsia-500">{(rivalData.totalXp || 0).toLocaleString()} XP</span>
                  </div>
                  <div className="flex w-full h-2 bg-background rounded-full overflow-hidden">
                    <div className="flex-1 flex justify-end border-r border-background/50">
                      <div className="h-full bg-accent" style={{ width: `${((state.xp + 50 * state.level * (state.level - 1)) / Math.max(1, Math.max((state.xp + 50 * state.level * (state.level - 1)), (rivalData.totalXp || 0)))) * 100}%` }} />
                    </div>
                    <div className="flex-1 flex justify-start border-l border-background/50">
                      <div className="h-full bg-fuchsia-500" style={{ width: `${((rivalData.totalXp || 0) / Math.max(1, Math.max((state.xp + 50 * state.level * (state.level - 1)), (rivalData.totalXp || 0)))) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Radar Chart Comparison */}
              <div className="flex mt-6 h-40 w-full relative space-x-2">
                <div className="flex-1 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid gridType="polygon" stroke="rgba(255, 191, 0, 0.3)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 8 }} />
                      <Radar name="You" dataKey="A" stroke="#F43F5E" fill="#F43F5E" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData.map(d => {
                      const rivalOvrData = rivalData.stats || { physical: 0, discipline: 0, mental: 0, ambition: 0, intellect: 0, social: 0 };
                      return {
                        ...d,
                        B: rivalOvrData[d.id as keyof typeof rivalOvrData] || 0
                      };
                    })}>
                      <PolarGrid gridType="polygon" stroke="rgba(255, 191, 0, 0.3)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 8 }} />
                      <Radar name="Rival" dataKey="B" stroke="#D946EF" fill="#D946EF" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(rivalData)}
                className="mt-6 w-full py-3 rounded-xl font-bold text-sm bg-surface-hover text-primary border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>{t('profile.view_rival', state.language)}</span>
              </button>
            </div>
          </div>
        )}

        {/* Neural AI Advisor */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-accent/5 border border-accent/20 rounded-2xl p-4 mt-8 flex items-start space-x-3 mb-4"
        >
          <Zap className="w-5 h-5 text-accent shrink-0 mt-0.5 animate-pulse" />
          <div>
            <div className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">{t('profile.neural_advisor', state.language)}</div>
            <p className="text-xs text-secondary leading-relaxed font-medium italic">
              "{(function() {
                const integrity = state.integrityScore || 90;
                if (integrity < 40) return state.language === 'id' ? 'Jalur saraf rusak. Konsistensi gagal. Reset disarankan sebelum kehancuran total.' : 'Neural pathways corrupted. Consistency is failing. Reset recommended before total collapse.';
                if (state.streak > 30) return state.language === 'id' ? 'Resonansi saraf tercapai. Anda adalah anomali biologis dalam fokus. Teruslah mengunci (lock in).' : 'Neural resonance achieved. You are a biological anomaly in focus. Keep locking in.';
                if (state.level > 20) return state.language === 'id' ? 'Beban kognitif tingkat tinggi terdeteksi. Mesin produktivitas Anda bekerja maksimal.' : 'High-tier cognitive load detected. Your productivity engine is firing on all cylinders.';
                return state.language === 'id' ? 'Memantau aktivitas saraf. Fokus memadai, tetapi potensi optimasi masih tinggi.' : 'Monitoring neural activity. Focus is adequate, but potential for optimization is high.';
              })()}"
            </p>
          </div>
        </motion.div>
      </div>

      {/* Public Profile Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-white/10 rounded-3xl p-6 w-full max-w-sm relative shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar"
            >
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {selectedUser.isProfilePublic === false ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <User className="w-10 h-10 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{selectedUser.username}</h3>
                  <p className="text-secondary text-sm">{t('profile.private_profile', state.language)}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <ProfileFrame frame={selectedUser.equippedFrame} src={selectedUser.profilePicture || null} size="lg" />
                    <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface ${getRankForLevel(selectedUser.level).bg} z-50`}>
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-1">{selectedUser.username}</h3>
                  
                  {selectedUser.equippedTitle && (() => {
                    const titleDef = TITLES.find(t => t.id === selectedUser.equippedTitle);
                    return (
                      <div className={`text-xs font-mono uppercase tracking-widest mb-4 inline-block ${titleDef?.specialColor || 'text-accent'}`}>
                        {titleDef?.name[state.language] || selectedUser.equippedTitle}
                      </div>
                    );
                  })()}

                  <div className="w-full bg-black/30 rounded-2xl p-4 mb-4 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-secondary">{t('leaderboard.rank', state.language)}</span>
                      <span className={`font-bold ${getRankForLevel(selectedUser.level).color}`}>
                        {getRankForLevel(selectedUser.level).name[state.language]}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-secondary">{t('leaderboard.level', state.language)}</span>
                      <span className="font-mono font-bold text-primary">{selectedUser.level}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-secondary">{t('profile.stat.integrity', state.language)}</span>
                      <button 
                        onClick={() => setIsIntegrityHelpOpen(true)}
                        className={`font-mono font-black text-lg px-2 rounded-lg ${getIntegrityRating(selectedUser.integrityScore || 100, state.language).glow}`}
                        style={{ color: getIntegrityRating(selectedUser.integrityScore || 100, state.language).color }}
                      >
                        {getIntegrityRating(selectedUser.integrityScore || 100, state.language).letter}
                      </button>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-secondary">OVR</span>
                      <span className="font-mono font-bold text-[#F43F5E]">{selectedUser?.ovr || (selectedUser ? calculateOVR({ ...selectedUser, dailyStats: {}, badges: [], missionsCompleted: selectedUser.missionsCompleted || 0, streak: selectedUser.streak || 0, unlockedFrames: [] } as any).ovr : 44)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-secondary">{t('leaderboard.total_xp', state.language)}</span>
                      <span className="font-mono font-bold text-accent">
                        {selectedUser.totalXp?.toLocaleString() || (50 * selectedUser.level * (selectedUser.level - 1) + selectedUser.xp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="bg-black/30 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-500 mb-1" />
                      <span className="text-xs text-secondary mb-1">{t('leaderboard.streak', state.language)}</span>
                      <span className="font-mono font-bold text-lg text-orange-500">{selectedUser.streak || 0}</span>
                    </div>
                    <div className="bg-black/30 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-1" />
                      <span className="text-xs text-secondary mb-1">{t('leaderboard.missions', state.language)}</span>
                      <span className="font-mono font-bold text-lg">{selectedUser.missionsCompleted || 0}</span>
                    </div>
                    <div className="bg-black/30 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center">
                      <Star className="w-5 h-5 text-rose-400 mb-1" />
                      <span className="text-xs text-secondary mb-1">{t('profile.badges', state.language)}</span>
                      <span className="font-mono font-bold text-lg">{selectedUser.badgesCount ?? selectedUser.badges?.length ?? 0}</span>
                    </div>
                    <div className="bg-black/30 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center">
                      <div className="w-5 h-5 border-2 border-accent rounded-md mb-1" />
                      <span className="text-xs text-secondary mb-1">{t('profile.frames', state.language)}</span>
                      <span className="font-mono font-bold text-lg">{selectedUser.framesCount ?? selectedUser.unlockedFrames?.length ?? 1}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Picture Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <ImageCropper 
            imageSrc={previewImage} 
            onCropComplete={handleCropComplete} 
            onCancel={cancelImage} 
          />
        )}
      </AnimatePresence>

      <StatDetailModal 
        isOpen={!!selectedStat} 
        onClose={() => setSelectedStat(null)} 
        stat={selectedStat} 
        language={state.language} 
      />

      <ResetProgressModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetProgress}
        language={state.language}
      />

      <FramesModal
        isOpen={isFramesModalOpen}
        onClose={() => setIsFramesModalOpen(false)}
        state={state}
        updateState={updateState}
        ovr={ovr}
        onGoToInventory={() => {
          setIsFramesModalOpen(false);
          setIsInventoryModalOpen(true);
        }}
      />

      <AnimatePresence>
        {isBadgesModalOpen && (
          <BadgesModal
            badges={state.badges}
            language={state.language}
            onClose={() => setIsBadgesModalOpen(false)}
            badgeIcons={BADGE_ICONS}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTitlesModalOpen && (
          <TitlesModal
            state={state}
            onClose={() => setIsTitlesModalOpen(false)}
            updateState={updateState}
            onGoToInventory={() => {
              setIsTitlesModalOpen(false);
              setIsInventoryModalOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
      />

      <ZoneStoreModal
        isOpen={isZoneStoreModalOpen}
        onClose={() => setIsZoneStoreModalOpen(false)}
        state={state}
        ovr={ovr}
        updateState={updateState}
      />

      <IntegrityExplanationModal 
        isOpen={isIntegrityHelpOpen} 
        onClose={() => setIsIntegrityHelpOpen(false)} 
        language={state.language} 
      />

      <AnimatePresence>
        {isConsistencyHelpOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConsistencyHelpOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-surface border border-white/10 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-display font-black tracking-tight uppercase italic">{t('profile.consistency_record', state.language)}</h3>
                  <p className="text-[10px] text-secondary font-mono uppercase tracking-widest">{t('profile.guide_info', state.language)}</p>
                </div>
                <button onClick={() => setIsConsistencyHelpOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-secondary" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-accent uppercase tracking-wider">{t('profile.weekly_chart', state.language)}</h4>
                  <p className="text-sm text-secondary leading-relaxed">
                    {t('profile.weekly_chart_desc', state.language)}
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-accent uppercase tracking-wider">{t('profile.goal', state.language)}</h4>
                  <p className="text-sm text-secondary leading-relaxed">
                    {t('profile.weekly_chart_goal_desc', state.language)}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[10px] text-secondary italic text-center">
                    "{t('profile.consistency_quote', state.language)}"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPremiumModalOpen && (
          <PremiumModal 
            isOpen={isPremiumModalOpen} 
            onClose={() => setIsPremiumModalOpen(false)} 
            language={state.language} 
            isFlashSale={isFlashSale}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsScreen
            state={state}
            updateState={updateState}
            changePath={changePath}
            clearCustomMissions={clearCustomMissions}
            onLogout={onLogout}
            onBack={() => setIsSettingsOpen(false)}
            setIsResetModalOpen={setIsResetModalOpen}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default React.memo(ProfileScreen);
