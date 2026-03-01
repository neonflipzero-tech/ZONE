import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserState, getRankForLevel, PathType, calculateOVR, createDefaultState } from '../store';
import { Trophy, Flame, LogOut, Camera, User, Shield, ChevronDown, ChevronUp, Star, Lock, CheckCircle2, Share2, AlertTriangle } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { t } from '../utils/translations';
import ProfileFrame from './ProfileFrame';
import { shareContent, shareElementAsImage } from '../utils/share';
import StatDetailModal from './StatDetailModal';
import ImageCropper from './ImageCropper';
import ResetProgressModal from './ResetProgressModal';
import FramesModal from './FramesModal';

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
    { id: 'physical', subject: state.language === 'id' ? 'Fisik' : 'Physical', A: stats.physical, fullMark: 99 },
    { id: 'discipline', subject: state.language === 'id' ? 'Disiplin' : 'Discipline', A: stats.discipline, fullMark: 99 },
    { id: 'mental', subject: state.language === 'id' ? 'Mental' : 'Mental', A: stats.mental, fullMark: 99 },
    { id: 'ambition', subject: state.language === 'id' ? 'Ambisi' : 'Ambition', A: stats.ambition, fullMark: 99 },
    { id: 'intellect', subject: state.language === 'id' ? 'Intelek' : 'Intellect', A: stats.intellect, fullMark: 99 },
    { id: 'social', subject: state.language === 'id' ? 'Sosial' : 'Social', A: stats.social, fullMark: 99 },
  ];

  const scrollToOvrStats = () => {
    ovrStatsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-background overflow-y-auto no-scrollbar pb-24"
    >
      <div className="px-4 pt-12 pb-6">
        <div className="flex justify-between items-center mb-6 px-2">
          <h1 className="text-2xl font-display font-black tracking-tight">{state.language === 'id' ? 'Identitas' : 'Identity'}</h1>
          <button 
            onClick={() => shareElementAsImage(
              'profile-card',
              'My ZONE Profile',
              `I'm currently Level ${state.level} (${currentRank.name}) with an OVR of ${ovr} on ZONE! Can you beat my stats?`
            )}
            className="p-2 rounded-full bg-surface border border-white/10 hover:bg-white/10 transition-colors"
          >
            <Share2 className="w-5 h-5 text-secondary" />
          </button>
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
              <div className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-mono uppercase tracking-widest text-accent/90 mb-6 backdrop-blur-sm">
                {state.equippedTitle}
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
                animate={{ width: `${(state.xp % 100)}%` }}
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
          <h3 className="text-sm font-mono uppercase tracking-widest text-secondary mb-4 px-2">{state.language === 'id' ? 'Metrik Disiplin' : 'Discipline Metrics'}</h3>
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
              <div>
                <div className="text-2xl font-display font-bold text-primary">{state.streak}</div>
                <div className="text-[10px] text-secondary font-mono uppercase tracking-wider">{state.language === 'id' ? 'Hari Beruntun' : 'Day Streak'}</div>
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
                <div className="text-[10px] text-secondary font-mono uppercase tracking-wider">{state.language === 'id' ? 'Misi Selesai' : 'Missions Done'}</div>
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
            <h3 className="text-sm font-mono uppercase tracking-widest text-secondary">{state.language === 'id' ? 'Statistik OVR' : 'OVR Stats'}</h3>
            <button 
              onClick={() => shareElementAsImage(
                'ovr-stats-card',
                'My ZONE OVR Stats',
                `Check out my OVR Stats on ZONE! My overall rating is ${ovr}. Can you beat my consistency?`
              )}
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
                <div className="flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm w-16 h-16 rounded-full border border-white/10 shadow-lg shadow-accent/20">
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
          <h3 className="text-sm font-mono uppercase tracking-widest text-secondary mb-4 px-2">{state.language === 'id' ? 'Kustomisasi' : 'Customization'}</h3>
          
          <div className="space-y-6">
            {/* Titles */}
            <div>
              <h4 className="text-xs font-bold text-primary mb-3 px-2 flex items-center"><Star className="w-3 h-3 mr-1 text-accent"/> {state.language === 'id' ? 'Gelar (Titles)' : 'Titles'}</h4>
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
              <h4 className="text-xs font-bold text-primary mb-3 px-2 flex items-center"><Shield className="w-3 h-3 mr-1 text-accent"/> {state.language === 'id' ? 'Bingkai Profil' : 'Profile Frames'}</h4>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x px-2">
                {(() => {
                  const allFrames = ['frame-default', 'frame-bronze', 'frame-silver', 'frame-gold', 'frame-platinum', 'frame-diamond', 'frame-master', 'frame-grandmaster', 'frame-challenger', 'frame-rgb', 'frame-neon', 'frame-fire', 'frame-cyberpunk', 'frame-hologram', 'frame-celestial', 'frame-void', 'frame-aurora', 'frame-radiant', 'frame-abyssal', 'frame-inferno', 'frame-ethereal', 'frame-omniscience'];
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
                            case 'frame-default': return state.language === 'id' ? 'Tersedia dari awal' : 'Available from start';
                            case 'frame-bronze': return state.language === 'id' ? 'Capai Rank Bronze' : 'Reach Bronze Rank';
                            case 'frame-silver': return state.language === 'id' ? 'Capai Rank Silver' : 'Reach Silver Rank';
                            case 'frame-gold': return state.language === 'id' ? 'Capai Rank Gold' : 'Reach Gold Rank';
                            case 'frame-platinum': return state.language === 'id' ? 'Capai Rank Platinum' : 'Reach Platinum Rank';
                            case 'frame-diamond': return state.language === 'id' ? 'Capai Rank Diamond' : 'Reach Diamond Rank';
                            case 'frame-master': return state.language === 'id' ? 'Capai Rank Master' : 'Reach Master Rank';
                            case 'frame-grandmaster': return state.language === 'id' ? 'Capai Rank Grandmaster' : 'Reach Grandmaster Rank';
                            case 'frame-challenger': return state.language === 'id' ? 'Capai Rank Challenger' : 'Reach Challenger Rank';
                            case 'frame-rgb': return state.language === 'id' ? 'Capai 7 Hari Streak' : 'Reach 7 Day Streak';
                            case 'frame-neon': return state.language === 'id' ? 'Selesaikan 50 Misi' : 'Complete 50 Missions';
                            case 'frame-fire': return state.language === 'id' ? 'Capai 30 Hari Streak' : 'Reach 30 Day Streak';
                            case 'frame-cyberpunk': return state.language === 'id' ? 'Kumpulkan 5 Lencana' : 'Earn 5 Badges';
                            case 'frame-hologram': return state.language === 'id' ? 'Selesaikan 100 Misi' : 'Complete 100 Missions';
                            case 'frame-celestial': return state.language === 'id' ? 'Capai OVR 80' : 'Reach 80 OVR';
                            case 'frame-void': return state.language === 'id' ? 'Capai Level 20' : 'Reach Level 20';
                            case 'frame-aurora': return state.language === 'id' ? 'Capai 60 Hari Streak' : 'Reach 60 Day Streak';
                            case 'frame-radiant': return state.language === 'id' ? 'Selesaikan 200 Misi' : 'Complete 200 Missions';
                            case 'frame-abyssal': return state.language === 'id' ? 'Selesaikan 666 Misi' : 'Complete 666 Missions';
                            case 'frame-inferno': return state.language === 'id' ? 'Capai 100 Hari Streak' : 'Reach 100 Day Streak';
                            case 'frame-ethereal': return state.language === 'id' ? 'Capai OVR 95' : 'Reach 95 OVR';
                            case 'frame-omniscience': return state.language === 'id' ? 'Capai OVR 100 (Maksimal)' : 'Reach 100 OVR (Max)';
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
                          {state.language === 'id' ? 'Lihat Semua' : 'Show All'}
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
          <h3 className="text-sm font-mono uppercase tracking-widest text-secondary mb-4 px-2">{state.language === 'id' ? 'Rekor Konsistensi (7 Hari)' : 'Consistency Record (7 Days)'}</h3>
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
                          {data.missions} {state.language === 'id' ? 'Misi' : 'Missions'}
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

        {/* Badges */}
        <div className="mb-8">
          <h3 className="text-sm font-mono uppercase tracking-widest text-secondary mb-4 px-2">{state.language === 'id' ? 'Lencana' : 'Badges'}</h3>
          {state.badges.length === 0 ? (
            <div className="bg-surface border border-white/5 rounded-2xl p-8 text-center text-secondary">
              <Trophy className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{state.language === 'id' ? 'Selesaikan misi untuk mendapatkan lencana.' : 'Complete missions to earn badges.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {state.badges.map((badge, i) => (
                <div key={i} className="bg-surface border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center aspect-square bg-gradient-to-b from-surface to-surface-hover">
                  <Trophy className="w-8 h-8 text-accent mb-2" />
                  <span className="text-xs font-bold leading-tight">{badge}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div>
          <h3 className="text-sm font-mono uppercase tracking-widest text-secondary mb-4 px-2">{state.language === 'id' ? 'Pengaturan' : 'Settings'}</h3>
          <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
            {/* Goal Setting */}
            <div className="p-4 border-b border-white/5">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsGoalDropdownOpen(!isGoalDropdownOpen)}
              >
                <span className="font-bold">{state.language === 'id' ? 'Tujuan' : 'Goal'}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-secondary">{state.chosenPath?.replace('_', ' ')}</span>
                  {isGoalDropdownOpen ? <ChevronUp className="w-5 h-5 text-secondary" /> : <ChevronDown className="w-5 h-5 text-secondary" />}
                </div>
              </div>
              
              <AnimatePresence>
                {isGoalDropdownOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-2">
                      {(['PRODUCTIVE', 'STRONGER', 'EXTROVERT', 'DISCIPLINE', 'MENTAL_HEALTH'] as PathType[]).map(path => (
                        <button
                          key={path}
                          onClick={() => {
                            changePath(path);
                            setIsGoalDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                            state.chosenPath === path 
                              ? 'bg-primary/10 border-primary text-primary font-bold' 
                              : 'bg-background border-white/5 text-secondary hover:border-white/20 hover:text-primary'
                          }`}
                        >
                          {path.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language Setting */}
            <div className="p-4 flex items-center justify-between border-b border-white/5">
              <span className="font-bold">{state.language === 'id' ? 'Bahasa' : 'Language'}</span>
              <div className="flex bg-background rounded-lg p-1 border border-white/10">
                <button 
                  onClick={() => updateState({ language: 'en' })}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${state.language === 'en' ? 'bg-primary text-background' : 'text-secondary hover:text-primary'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => updateState({ language: 'id' })}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${state.language === 'id' ? 'bg-primary text-background' : 'text-secondary hover:text-primary'}`}
                >
                  ID
                </button>
              </div>
            </div>

            <button 
              onClick={() => setIsResetModalOpen(true)}
              className="w-full p-4 flex items-center justify-between text-red-500 hover:bg-red-500/10 transition-colors border-b border-white/5"
            >
              <span className="font-bold">{state.language === 'id' ? 'Hapus Semua Progres' : 'Reset All Progress'}</span>
              <AlertTriangle className="w-5 h-5" />
            </button>

            <button 
              onClick={onLogout}
              className="w-full p-4 flex items-center justify-between text-accent hover:bg-white/5 transition-colors"
            >
              <span className="font-bold">{state.language === 'id' ? 'Keluar' : 'Log Out'}</span>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

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
    </motion.div>
  );
}
