import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserState, getRankForLevel, PathType, calculateOVR, createDefaultState, BADGES, TITLES, useAppState } from '../store';
import { Trophy, Flame, LogOut, Camera, User, Shield, ChevronDown, ChevronUp, Star, Lock, CheckCircle2, Share2, AlertTriangle, Footprints, Zap, Crown, Moon, Sun, Swords, Settings, X, Heart, Compass } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { t } from '../utils/translations';
import ProfileFrame from './ProfileFrame';
import { shareContent, shareElementAsImage } from '../utils/share';
import StatDetailModal from './StatDetailModal';
import ImageCropper from './ImageCropper';
import ResetProgressModal from './ResetProgressModal';
import FramesModal from './FramesModal';
import BadgesModal from './BadgesModal';
import TitlesModal from './TitlesModal';
import SettingsScreen from './SettingsScreen';
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
}

export default function ProfileScreen({ state, onLogout, updateState, changePath }: ProfileScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ovrStatsRef = useRef<HTMLDivElement>(null);
  const [isGoalDropdownOpen, setIsGoalDropdownOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedStat, setSelectedStat] = useState<{id: string, subject: string, label?: string, A: number} | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isFramesModalOpen, setIsFramesModalOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isTitlesModalOpen, setIsTitlesModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [rivalData, setRivalData] = useState<any | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showCrushedAnimation, setShowCrushedAnimation] = useState(false);
  const { crushRival } = useAppState();

  useEffect(() => {
    const fetchRival = async () => {
      if (state.rivalId) {
        let rData = null;
        if (db) {
          try {
            const docRef = doc(db, 'users', state.rivalId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              rData = docSnap.data();
            }
          } catch (e: any) {
            if (e?.code === 'unavailable' || e?.message?.includes('offline')) {
              console.warn("Client is offline, skipping rival fetch from Firestore.");
            } else {
              console.error("Error fetching rival", e);
            }
          }
        }

        // Fallback to localStorage if not found in Firestore or offline
        if (!rData) {
          const savedLeaderboard = localStorage.getItem('lockin_global_leaderboard');
          if (savedLeaderboard) {
            try {
              const users = JSON.parse(savedLeaderboard);
              const localRival = users.find((u: any) => u.userId === state.rivalId);
              if (localRival) {
                rData = localRival;
              }
            } catch (e) {
              console.error("Error parsing local leaderboard", e);
            }
          }
        }

        if (rData) {
          setRivalData(rData);

          // Check if crushed
          const myTotalXp = state.xp + 50 * state.level * (state.level - 1);
          const rivalTotalXp = rData.totalXp || 0;
          
          if (myTotalXp > rivalTotalXp && rivalTotalXp > 0) {
            setShowCrushedAnimation(true);
            setTimeout(() => {
              crushRival();
              setShowCrushedAnimation(false);
            }, 3000);
          }
        }
      }
    };
    fetchRival();
  }, [state.rivalId, state.xp, state.level]);

  const handleResetProgress = () => {
    const defaultState = createDefaultState(state.username);
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

  const currentRank = getRankForLevel(state.level);

  // Prepare chart data
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const chartData = last7Days.map(date => ({
    date: date.substring(5).replace('-', '/'),
    missions: state.dailyStats?.[date] || 0
  }));

  const maxMissions = Math.max(...chartData.map(d => d.missions), 1); // Avoid division by zero

  const { ovr, stats } = calculateOVR(state);

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
      if (!state.titles?.includes('Supporter')) {
        updates.titles = [...(state.titles || []), 'Supporter'];
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
    const success = await shareElementAsImage(
      'profile-card',
      'My ZONE Profile',
      `I'm currently Level ${state.level} (${currentRank.name}) with an OVR of ${ovr} on ZONE! Can you beat my stats?`
    );

    if (success) {
      incrementShareCount();
    }
  };

  const handleShareOvr = async () => {
    const success = await shareElementAsImage(
      'ovr-stats-card',
      'My ZONE OVR Stats',
      `Check out my OVR Stats on ZONE! My overall rating is ${ovr}. Can you beat my consistency?`
    );

    if (success) {
      incrementShareCount();
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
        {showCrushedAnimation && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Swords className="w-32 h-32 text-red-500 mx-auto mb-6" />
              </motion.div>
              <h1 className="text-6xl font-black font-display text-red-500 tracking-tighter mb-2" style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}>
                RIVAL CRUSHED
              </h1>
              <p className="text-xl text-white font-mono">+500 XP BONUS</p>
            </div>
          </motion.div>
        )}
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
            
            {state.equippedTitle ? (
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/20"></div>
                <span className={`text-[10px] font-display font-bold uppercase tracking-[0.2em] ${TITLES.find(t => t.id === state.equippedTitle)?.specialColor || 'text-accent'}`}>
                  {state.equippedTitle}
                </span>
                <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/20"></div>
              </div>
            ) : (
              <div className="h-6 mb-6" />
            )}

            <div className="w-full flex items-center justify-between mb-3 px-2">
              <div className="flex items-center space-x-2">
                <Shield className={`w-5 h-5 ${currentRank.color}`} />
                <span className={`font-bold ${currentRank.color}`}>{currentRank.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={scrollToOvrStats}
                  className="flex items-center space-x-1 bg-white/10 px-2 py-0.5 rounded-md border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <span className="text-[10px] font-mono text-secondary">OVR</span>
                  <span className="font-display font-black text-accent">{ovr}</span>
                </button>
                <span className="font-mono text-sm font-bold text-secondary">LVL {state.level}</span>
              </div>
            </div>

            {/* XP Bar */}
            <div className="w-full h-3 bg-background/50 rounded-full overflow-hidden border border-white/5 relative">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${(state.xp / (state.level * 100)) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="w-full text-right mt-2 px-2">
              <span className="text-[10px] font-mono text-secondary">{state.xp} / {(state.level) * 100} XP</span>
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
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-display font-bold text-primary">{state.streak}</div>
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
                  {Object.values(state.dailyStats || {}).reduce((a, b) => a + b, 0)}
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

        {/* OVR Stats Radar Chart */}
        <div className="mb-8" ref={ovrStatsRef}>
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-sm font-mono uppercase tracking-widest text-secondary">{t('profile.ovr_stats', state.language)}</h3>
            <button 
              onClick={handleShareOvr}
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
                <div className="flex flex-col items-center justify-center bg-[#0a0a0a] w-16 h-16 rounded-full border border-white/10 shadow-lg shadow-accent/20">
                  <span className="text-[10px] font-mono text-secondary leading-none">OVR</span>
                  <span className="text-2xl font-display font-black text-accent leading-none mt-1">{ovr}</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={(props: any) => {
                      const { payload, x, y, textAnchor, stroke, radius } = props;
                      const getStatColorHex = (subject: string) => {
                        switch(subject) {
                          case 'Fisik':
                          case 'Physical': return '#ef4444'; // red-500
                          case 'Disiplin':
                          case 'Discipline': return '#3b82f6'; // blue-500
                          case 'Mental': return '#a855f7'; // purple-500
                          case 'Ambisi':
                          case 'Ambition': return '#eab308'; // yellow-500
                          case 'Intelek':
                          case 'Intellect': return '#06b6d4'; // cyan-500
                          case 'Sosial':
                          case 'Social': return '#22c55e'; // green-500
                          default: return '#ffffff';
                        }
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
                    stroke="#F27D26"
                    strokeWidth={2}
                    fill="#F27D26"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full grid grid-cols-3 gap-2 mt-4" data-html2canvas-ignore>
              {radarData.map((stat, i) => {
                const getStatColor = (subject: string) => {
                  switch(subject) {
                    case 'Fisik':
                    case 'Physical': return 'text-red-500';
                    case 'Disiplin':
                    case 'Discipline': return 'text-blue-500';
                    case 'Mental': return 'text-purple-500';
                    case 'Ambisi':
                    case 'Ambition': return 'text-yellow-500';
                    case 'Intelek':
                    case 'Intellect': return 'text-cyan-500';
                    case 'Sosial':
                    case 'Social': return 'text-green-500';
                    default: return 'text-primary';
                  }
                };
                
                return (
                  <button 
                    key={i} 
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

        {/* Equipment / Inventory */}
        <div className="mb-8">
          <h3 className="text-sm font-mono uppercase tracking-widest text-secondary mb-4 px-2">{t('profile.customization', state.language)}</h3>
          
          <div className="space-y-6">
            {/* Titles */}
            <div>
              <h4 className="text-xs font-bold text-primary mb-3 px-2 flex items-center"><Star className="w-3 h-3 mr-1 text-accent"/> {t('profile.titles', state.language)}</h4>
              <div className="flex flex-wrap gap-2 px-2">
                {state.titles?.map(title => {
                  const isEquipped = state.equippedTitle === title;
                  return (
                    <button
                      key={title}
                      onClick={() => updateState({ equippedTitle: title })}
                      className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                        isEquipped 
                          ? 'bg-accent text-white shadow-[0_0_15px_rgba(242,125,38,0.3)] border border-accent/50' 
                          : 'bg-surface border border-white/10 text-secondary hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frames */}
            <div>
              <h4 className="text-xs font-bold text-primary mb-3 px-2 flex items-center"><Shield className="w-3 h-3 mr-1 text-accent"/> {t('profile.profile_frames', state.language)}</h4>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x px-2">
                {(() => {
                  const allFrames = ['frame-default', 'frame-bronze', 'frame-silver', 'frame-gold', 'frame-platinum', 'frame-diamond', 'frame-master', 'frame-grandmaster', 'frame-challenger', 'frame-legend', 'frame-mythic', 'frame-rgb', 'frame-neon', 'frame-fire', 'frame-cyberpunk', 'frame-hologram', 'frame-celestial', 'frame-void', 'frame-aurora', 'frame-radiant', 'frame-abyssal', 'frame-inferno', 'frame-ethereal', 'frame-omniscience', 'frame-matrix', 'frame-viral'];
                  const isZaiki = state.username?.toLowerCase() === 'zaiki';
                  const totalMissions = Object.values(state.dailyStats || {}).reduce((a, b) => a + b, 0);
                  
                  const checkUnlocked = (frame: string) => {
                    const specialConditions: Record<string, boolean> = {
                      'frame-rgb': state.streak >= 7,
                      'frame-neon': totalMissions >= 50,
                      'frame-fire': state.streak >= 30,
                      'frame-cyberpunk': state.badges.length >= 5,
                      'frame-hologram': totalMissions >= 100,
                      'frame-celestial': ovr >= 80,
                      'frame-void': state.level >= 20,
                      'frame-aurora': state.streak >= 60,
                      'frame-radiant': totalMissions >= 200,
                      'frame-abyssal': totalMissions >= 666,
                      'frame-inferno': state.streak >= 100,
                      'frame-ethereal': ovr >= 95,
                      'frame-omniscience': ovr >= 100,
                      'frame-matrix': totalMissions >= 100,
                      'frame-viral': (state.shareCount || 0) >= 5,
                    };
                    return state.unlockedFrames?.includes(frame) || 
                      frame === 'frame-default' || 
                      isZaiki || 
                      (specialConditions[frame] ?? false);
                  };

                  const sortedFrames = [...allFrames].sort((a, b) => {
                    const aEquipped = state.equippedFrame === a || (a === 'frame-default' && !state.equippedFrame);
                    const bEquipped = state.equippedFrame === b || (b === 'frame-default' && !state.equippedFrame);
                    if (aEquipped) return -1;
                    if (bEquipped) return 1;
                    
                    const aUnlocked = checkUnlocked(a);
                    const bUnlocked = checkUnlocked(b);
                    if (aUnlocked && !bUnlocked) return -1;
                    if (!aUnlocked && bUnlocked) return 1;
                    
                    return allFrames.indexOf(a) - allFrames.indexOf(b);
                  });

                  const displayFrames = sortedFrames.slice(0, 3);

                  return (
                    <>
                      {displayFrames.map(frame => {
                        const isUnlocked = checkUnlocked(frame);
                        const isEquipped = state.equippedFrame === frame || (frame === 'frame-default' && !state.equippedFrame);
                        
                        const getFrameDescription = (f: string) => {
                          switch(f) {
                            case 'frame-default': return t('profile.frame.default', state.language);
                            case 'frame-bronze': return t('profile.frame.bronze', state.language);
                            case 'frame-silver': return t('profile.frame.silver', state.language);
                            case 'frame-gold': return t('profile.frame.gold', state.language);
                            case 'frame-platinum': return t('profile.frame.platinum', state.language);
                            case 'frame-diamond': return t('profile.frame.diamond', state.language);
                            case 'frame-master': return t('profile.frame.master', state.language);
                            case 'frame-grandmaster': return t('profile.frame.grandmaster', state.language);
                            case 'frame-challenger': return t('profile.frame.challenger', state.language);
                            case 'frame-legend': return t('profile.frame.legend', state.language);
                            case 'frame-mythic': return t('profile.frame.mythic', state.language);
                            case 'frame-rgb': return t('profile.frame.rgb', state.language);
                            case 'frame-neon': return t('profile.frame.neon', state.language);
                            case 'frame-fire': return t('profile.frame.fire', state.language);
                            case 'frame-cyberpunk': return t('profile.frame.cyberpunk', state.language);
                            case 'frame-hologram': return t('profile.frame.hologram', state.language);
                            case 'frame-celestial': return t('profile.frame.celestial', state.language);
                            case 'frame-void': return t('profile.frame.void', state.language);
                            case 'frame-aurora': return t('profile.frame.aurora', state.language);
                            case 'frame-radiant': return t('profile.frame.radiant', state.language);
                            case 'frame-abyssal': return t('profile.frame.abyssal', state.language);
                            case 'frame-inferno': return t('profile.frame.inferno', state.language);
                            case 'frame-ethereal': return t('profile.frame.ethereal', state.language);
                            case 'frame-omniscience': return t('profile.frame.omniscience', state.language);
                            case 'frame-matrix': return t('profile.frame.matrix', state.language);
                            case 'frame-viral': return t('profile.frame.viral', state.language);
                            default: return '';
                          }
                        };

                        return (
                          <button
                            key={frame}
                            onClick={() => isUnlocked && updateState({ equippedFrame: frame === 'frame-default' ? null : frame })}
                            disabled={!isUnlocked}
                            className={`relative flex-shrink-0 snap-center rounded-xl p-4 transition-all flex flex-col items-center gap-3 w-36 ${
                              isEquipped ? 'bg-accent/10 border border-accent' : 
                              isUnlocked ? 'bg-surface border border-white/5 hover:border-white/20' : 
                              'bg-surface/30 border border-white/5 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <ProfileFrame frame={frame} src={state.profilePicture} size="md" />
                            <div className="flex flex-col items-center text-center mt-2 w-full">
                              <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold mb-1.5">
                                {frame.replace('frame-', '')}
                              </span>
                              <span className="text-[9px] text-secondary/90 leading-snug">
                                {getFrameDescription(frame)}
                              </span>
                            </div>
                            {!isUnlocked && <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white drop-shadow-md" />}
                            {isEquipped && <div className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_rgba(242,125,38,1)]" />}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setIsFramesModalOpen(true)}
                        className="relative flex-shrink-0 snap-center rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-3 w-36 bg-surface border border-white/5 hover:border-white/20 hover:bg-white/5"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                          <span className="text-2xl text-secondary">+</span>
                        </div>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold mt-2">
                          {t('profile.show_all', state.language)}
                        </span>
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="mb-8">
          <h3 className="text-sm font-mono uppercase tracking-widest text-secondary mb-4 px-2">{t('profile.consistency_record', state.language)}</h3>
          <div className="bg-surface border border-white/5 rounded-2xl p-5 h-64 flex flex-col justify-end relative">
            <div className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none">
              {[1, 0.75, 0.5, 0.25, 0].map((tick, i) => (
                <div key={i} className="w-full border-b border-white/5 h-0 relative">
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
                  <div key={i} className="flex flex-col items-center w-8 group">
                    <div className="w-full h-48 flex items-end justify-center relative">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="w-2 bg-gradient-to-t from-orange-500/20 to-accent rounded-t-full relative group-hover:from-orange-500/40 group-hover:to-accent/80 transition-all"
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
        </div>

        {/* Titles */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-sm font-mono uppercase tracking-widest text-secondary">{t('profile.titles', state.language)}</h3>
            <button 
              onClick={() => setIsTitlesModalOpen(true)}
              className="text-xs font-bold text-accent hover:text-accent-hover transition-colors"
            >
              {t('profile.view_all', state.language)}
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x px-2">
            {(() => {
              const isZaiki = state.username?.toLowerCase() === 'zaiki';
              // Sort titles: unlocked first, then locked
              const sortedTitles = [...TITLES].sort((a, b) => {
                const aUnlocked = isZaiki || state.titles.includes(a.id);
                const bUnlocked = isZaiki || state.titles.includes(b.id);
                if (aUnlocked && !bUnlocked) return -1;
                if (!aUnlocked && bUnlocked) return 1;
                return 0;
              });

              // Show only top 4
              const displayTitles = sortedTitles.slice(0, 4);

              return displayTitles.map((titleDef) => {
                const isUnlocked = isZaiki || state.titles.includes(titleDef.id);
                const isEquipped = state.equippedTitle === titleDef.id;
                
                return (
                  <div 
                    key={titleDef.id} 
                    className={`shrink-0 w-32 snap-center border rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                      isUnlocked 
                        ? isEquipped
                          ? 'bg-accent/20 border-accent shadow-lg shadow-accent/20'
                          : 'bg-gradient-to-b from-surface to-surface-hover border-white/10' 
                        : 'bg-surface/30 border-white/5 opacity-50 grayscale'
                    }`}
                  >
                    <span className={`text-xs font-bold leading-tight mb-1 ${isUnlocked ? (titleDef.specialColor || 'text-primary') : 'text-secondary'}`}>
                      {titleDef.name[state.language]}
                    </span>
                    {isEquipped && (
                      <span className="text-[10px] text-accent font-mono uppercase tracking-widest mt-2">
                        {t('profile.equipped', state.language)}
                      </span>
                    )}
                  </div>
                );
              });
            })()}
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
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x px-2">
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
                
                return (
                  <div 
                    key={badgeDef.id} 
                    className={`shrink-0 w-32 snap-center border rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                      isUnlocked 
                        ? 'bg-gradient-to-b from-surface to-surface-hover border-accent/30 shadow-lg shadow-accent/5' 
                        : 'bg-surface/30 border-white/5 opacity-50 grayscale'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isUnlocked ? 'bg-accent/20' : 'bg-white/5'}`}>
                      <Icon className={`w-6 h-6 ${isUnlocked ? 'text-accent' : 'text-secondary'}`} />
                    </div>
                    <span className={`text-xs font-bold leading-tight mb-1 ${isUnlocked ? 'text-primary' : 'text-secondary'}`}>
                      {badgeDef.name[state.language]}
                    </span>
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
              <h3 className="text-sm font-mono uppercase tracking-widest text-red-500 flex items-center">
                <Swords className="w-4 h-4 mr-2" />
                {t('profile.active_rival', state.language)}
              </h3>
              <button 
                onClick={() => updateState({ rivalId: null })}
                className="text-xs text-secondary hover:text-red-500 transition-colors"
              >
                {t('profile.remove_rival', state.language)}
              </button>
            </div>
            
            <div className="bg-surface/50 border border-red-500/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
              
              {/* Status Banner */}
              {(() => {
                const rivalOvr = rivalData.ovr || 0;
                let bannerColor = '';
                let bannerText = '';
                if (rivalOvr > ovr) {
                  bannerColor = 'bg-red-500/20 text-red-500 border-red-500/30';
                  bannerText = '⚠️ RIVAL IS AHEAD — CATCH UP!';
                } else if (ovr > rivalOvr) {
                  bannerColor = 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
                  bannerText = '🔥 YOU\'RE WINNING — STAY ON TOP!';
                } else {
                  bannerColor = 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
                  bannerText = '⚡ DEAD EVEN — MAKE YOUR MOVE!';
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
                  <span className="text-[10px] text-accent font-mono mt-1">OVR {ovr}</span>
                </div>
                
                {/* VS */}
                <div className="flex flex-col items-center justify-center px-4">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                    <span className="text-xs font-black text-red-500 italic">VS</span>
                  </div>
                </div>

                {/* Rival */}
                <div className="flex flex-col items-center flex-1">
                  <ProfileFrame frame={rivalData.equippedFrame} src={rivalData.profilePicture} size="sm" />
                  <span className="text-xs font-bold mt-2 truncate max-w-[80px] text-fuchsia-500">{rivalData.username}</span>
                  <span className="text-[10px] text-fuchsia-500 font-mono mt-1">
                    OVR {rivalData.ovr || 0}
                  </span>
                </div>
              </div>

              {/* Stats Comparison */}
              <div className="space-y-4 mb-6">
                {/* Level */}
                <div className="flex flex-col">
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-accent">Lvl {state.level}</span>
                    <span className="text-secondary uppercase tracking-widest">Level</span>
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
                    <span className="text-secondary uppercase tracking-widest">Streak</span>
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
                    <span className="text-secondary uppercase tracking-widest">Total XP</span>
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
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 8 }} />
                      <Radar name="You" dataKey="A" stroke="#F27D26" fill="#F27D26" fillOpacity={0.4} />
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
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
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
                <span>VIEW RIVAL PROFILE</span>
              </button>
            </div>
          </div>
        )}
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
                  
                  {selectedUser.equippedTitle && (
                    <div className={`text-xs font-mono uppercase tracking-widest mb-4 ${TITLES.find(t => t.id === selectedUser.equippedTitle)?.specialColor || 'text-accent'}`}>
                      {selectedUser.equippedTitle}
                    </div>
                  )}

                  <div className="w-full bg-black/30 rounded-2xl p-4 mb-4 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-secondary">Rank</span>
                      <span className={`font-bold ${getRankForLevel(selectedUser.level).color}`}>
                        {getRankForLevel(selectedUser.level).name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-secondary">Level</span>
                      <span className="font-mono font-bold text-primary">{selectedUser.level}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-secondary">OVR</span>
                      <span className="font-mono font-bold text-accent">{selectedUser.ovr || calculateOVR({ ...selectedUser, dailyStats: {}, badges: [], missionsCompleted: selectedUser.missionsCompleted || 0, streak: selectedUser.streak || 0, unlockedFrames: [] } as any).ovr}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-secondary">Total XP</span>
                      <span className="font-mono font-bold text-accent">
                        {selectedUser.totalXp?.toLocaleString() || (50 * selectedUser.level * (selectedUser.level - 1) + selectedUser.xp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="bg-black/30 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-500 mb-1" />
                      <span className="text-xs text-secondary mb-1">Streak</span>
                      <span className="font-mono font-bold text-lg">{selectedUser.streak || 0}</span>
                    </div>
                    <div className="bg-black/30 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-1" />
                      <span className="text-xs text-secondary mb-1">Missions</span>
                      <span className="font-mono font-bold text-lg">{selectedUser.missionsCompleted || 0}</span>
                    </div>
                    <div className="bg-black/30 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-400 mb-1" />
                      <span className="text-xs text-secondary mb-1">Badges</span>
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
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsScreen
            state={state}
            updateState={updateState}
            changePath={changePath}
            onLogout={onLogout}
            onBack={() => setIsSettingsOpen(false)}
            setIsResetModalOpen={setIsResetModalOpen}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
