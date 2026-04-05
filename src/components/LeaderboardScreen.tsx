import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserState, RANKS, getRankForLevel, TITLES, calculateOVR, useAppState, getIntegrityRating } from '../store';
import { Trophy, Flame, Shield, User, AlertCircle, X, CheckCircle2, Star, Swords, Zap, Crown } from 'lucide-react';
import ProfileFrame from './ProfileFrame';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { sounds } from '../utils/sounds';

import { t } from '../utils/translations';

interface LeaderboardScreenProps {
  state: UserState;
}

interface LeaderboardUser {
  userId?: string;
  username: string;
  level: number;
  xp: number;
  totalXp?: number;
  equippedFrame: string | null;
  equippedTitle: string | null;
  profilePicture: string | null;
  streak?: number;
  badgesCount?: number;
  framesCount?: number;
  missionsCompleted?: number;
  isProfilePublic?: boolean;
  ovr?: number;
  integrityScore?: number;
  isPremium?: boolean;
}

function getRankIcon(rankName: string, className: string) {
  if (rankName === 'Mythic') return <Crown className={className} />;
  return <Trophy className={className} />;
}

const LeaderboardScreen = ({ state }: LeaderboardScreenProps) => {
  if (!state) return null;
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingFirebase, setIsUsingFirebase] = useState(!!db);
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
  const [selectedActionUser, setSelectedActionUser] = useState<LeaderboardUser | null>(null);
  const [rivalError, setRivalError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const { updateState, addNotification, activeUserEmail } = useAppState();

  useEffect(() => {
    if (selectedActionUser) {
      setRivalError(null);
    }
  }, [selectedActionUser]);

  useEffect(() => {
    if (db) {
      // Real-time global leaderboard using Firebase
      // Only order by totalXp to avoid needing a composite index in Firestore
      // Filter by isProfilePublic to match security rules
      const q = query(
        collection(db, 'users'), 
        where('isProfilePublic', '==', true),
        orderBy('totalXp', 'desc'), 
        limit(50)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedUsers: LeaderboardUser[] = [];
        snapshot.forEach((doc) => {
          fetchedUsers.push({ userId: doc.id, ...doc.data() } as LeaderboardUser);
        });
        setUsers(fetchedUsers);
        setLoading(false);
      }, (error: any) => {
        if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
          console.warn("Client is offline, skipping leaderboard fetch.");
        } else {
          handleFirestoreError(error, OperationType.LIST, 'users');
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Fallback to localStorage for local dev without Firebase
      const savedLeaderboard = localStorage.getItem('lockin_global_leaderboard');
      if (savedLeaderboard) {
        try {
          setUsers(JSON.parse(savedLeaderboard));
        } catch (e) {
          console.error(e);
        }
      } else {
        // Mock data if empty
        setUsers([
          { userId: 'zaiki-123', username: 'Zaiki', level: 50, xp: 4999, totalXp: 999999, equippedFrame: 'frame-omniscience', equippedTitle: 'The Creator', profilePicture: 'https://picsum.photos/seed/zaiki/200/200' },
          { userId: 'progamer-123', username: 'ProGamer', level: 42, xp: 15000, totalXp: 101100, equippedFrame: 'frame-abyssal', equippedTitle: 'Grind Master', profilePicture: 'https://picsum.photos/seed/progamer/200/200' },
          { userId: 'newbie-123', username: 'Newbie', level: 5, xp: 1200, totalXp: 2200, equippedFrame: 'frame-bronze', equippedTitle: 'Newbie', profilePicture: 'https://picsum.photos/seed/newbie/200/200' },
        ]);
      }
      setLoading(false);
    }
  }, []);

  const allUsers = useMemo(() => {
    // Override current user's data with local state to ensure it's always up-to-date
    let processedUsers = users.map(u => {
      if ((state.userId && u.userId === state.userId) || (u.username === state.username)) {
        return {
          ...u,
          userId: state.userId || u.userId, // Ensure userId is updated if it was missing
          username: state.username,
          level: state.level,
          xp: state.xp,
          totalXp: 50 * state.level * (state.level - 1) + state.xp,
          equippedFrame: state.equippedFrame,
          equippedTitle: state.equippedTitle,
          profilePicture: state.profilePicture,
          streak: state.streak || 0,
          badgesCount: state.badges?.length || 0,
          framesCount: state.unlockedFrames?.length || 0,
          missionsCompleted: state.missionsCompleted || 0,
          isProfilePublic: state.isProfilePublic !== false,
          ovr: calculateOVR(state, activeUserEmail).ovr,
          integrityScore: state.integrityScore ?? 90
        };
      }
      return u;
    });

    // Deduplicate by username (in case local storage had old entries)
    const uniqueUsers = new Map<string, LeaderboardUser>();
    processedUsers.forEach(u => {
      const currentTotalXp = u.totalXp || (50 * u.level * (u.level - 1) + u.xp);
      const existingUser = uniqueUsers.get(u.username);
      const existingTotalXp = existingUser ? (existingUser.totalXp || (50 * existingUser.level * (existingUser.level - 1) + existingUser.xp)) : -1;
      
      if (!existingUser || existingTotalXp < currentTotalXp) {
        uniqueUsers.set(u.username, u);
      }
    });
    let finalUsers = Array.from(uniqueUsers.values());

    // If the current user is not in the list (e.g., just started and hasn't synced yet), add them locally
    if (state.userId && !finalUsers.find(u => u.userId === state.userId || u.username === state.username)) {
      finalUsers.push({
        userId: state.userId,
        username: state.username,
        level: state.level,
        xp: state.xp,
        totalXp: 50 * state.level * (state.level - 1) + state.xp,
        equippedFrame: state.equippedFrame,
        equippedTitle: state.equippedTitle,
        profilePicture: state.profilePicture,
        streak: state.streak || 0,
        badgesCount: state.badges?.length || 0,
        framesCount: state.unlockedFrames?.length || 0,
        missionsCompleted: state.missionsCompleted || 0,
        isProfilePublic: state.isProfilePublic !== false,
        ovr: calculateOVR(state, activeUserEmail).ovr,
        integrityScore: state.integrityScore ?? 90
      });
    }

    // Sort by totalXp DESC
    finalUsers.sort((a, b) => {
      const aTotal = a.totalXp || (50 * a.level * (a.level - 1) + a.xp);
      const bTotal = b.totalXp || (50 * b.level * (b.level - 1) + b.xp);
      return bTotal - aTotal;
    });

    return finalUsers;
  }, [users, state]);

  const currentUserRank = useMemo(() => 
    allUsers.findIndex(u => u.userId === state.userId || u.username === state.username) + 1
  , [allUsers, state.userId, state.username]);

  const isCurrentUserInTop5 = currentUserRank <= 5;
  const top50Users = useMemo(() => allUsers.slice(0, 50), [allUsers]);
  const currentUserData = useMemo(() => allUsers[currentUserRank - 1], [allUsers, currentUserRank]);

  const [showSticky, setShowSticky] = useState(false);
  const userRowRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCurrentUserInTop5 || !currentUserData) {
      setShowSticky(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // If user row is NOT intersecting (not visible), show sticky
        setShowSticky(!entry.isIntersecting);
      },
      { 
        root: scrollContainerRef.current,
        threshold: 0.1 
      }
    );

    if (userRowRef.current) {
      observer.observe(userRowRef.current);
    }

    return () => observer.disconnect();
  }, [isCurrentUserInTop5, currentUserData, top50Users]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-background relative"
    >
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto no-scrollbar pb-48">
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-display font-bold tracking-tight">{t('leaderboard.title', state.language)}</h1>
            {!isUsingFirebase && (
              <div className="flex items-center space-x-1 text-xs text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full border border-rose-500/20">
                <AlertCircle className="w-3 h-3" />
                <span>{t('leaderboard.local_mode', state.language)}</span>
              </div>
            )}
          </div>

          {/* Top 3 Podium */}
          <div className="flex items-end justify-center space-x-2 mb-12 mt-8">
            {/* 2nd Place */}
            <div 
              className="flex flex-col items-center w-24 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => { if (top50Users[1]) setSelectedActionUser(top50Users[1]); }}
            >
              <div className="w-12 h-12 flex items-center justify-center mb-2 relative">
                <ProfileFrame frame={top50Users[1]?.equippedFrame || null} src={top50Users[1]?.profilePicture || null} size="sm" />
                <div className="absolute -bottom-1 bg-gray-300 text-black text-[10px] font-bold px-1.5 rounded-full z-20">2</div>
                {state.rivalId === top50Users[1]?.userId && (
                  <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] font-bold px-1 rounded-sm z-30 border border-white/20 shadow-lg">RIVAL</div>
                )}
              </div>
              <div className="flex items-center justify-center space-x-1 w-full px-1">
                <span className="text-xs font-bold truncate">{top50Users[1]?.username || '-'}</span>
              </div>
              {top50Users[1]?.equippedTitle && (() => {
                const titleDef = TITLES.find(t => t.id === top50Users[1]?.equippedTitle);
                return (
                  <div className={`text-[8px] font-mono uppercase tracking-widest mt-0.5 inline-block text-center px-1 ${titleDef?.specialColor || 'text-accent/80'}`}>
                    {titleDef?.name[state.language] || top50Users[1]?.equippedTitle}
                  </div>
                );
              })()}
              <div className="h-24 w-full bg-gradient-to-t from-surface to-surface-hover rounded-t-xl mt-2 border-t-2 border-slate-300/50 flex flex-col items-center justify-between py-2">
                {top50Users[1] && (
                  <div 
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black border border-white/10 shrink-0 ${getIntegrityRating(top50Users[1].integrityScore ?? 90).glow}`}
                    style={{ color: getIntegrityRating(top50Users[1].integrityScore ?? 90).color, backgroundColor: `${getIntegrityRating(top50Users[1].integrityScore ?? 90).color}20` }}
                  >
                    {getIntegrityRating(top50Users[1].integrityScore ?? 90).letter}
                  </div>
                )}
                <span className="text-xs font-mono text-secondary">{t('leaderboard.lvl', state.language).replace('{level}', (top50Users[1]?.level || 0).toString())}</span>
              </div>
            </div>

            {/* 1st Place */}
            <div 
              className="flex flex-col items-center w-28 z-10 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => { if (top50Users[0]) setSelectedActionUser(top50Users[0]); }}
            >
              <div className="w-16 h-16 flex items-center justify-center mb-2 relative">
                <ProfileFrame frame={top50Users[0]?.equippedFrame || null} src={top50Users[0]?.profilePicture || null} size="md" />
                <Trophy className="w-6 h-6 text-yellow-400 absolute -top-3 drop-shadow-md z-20" />
                <div className="absolute -bottom-1 bg-yellow-400 text-black text-xs font-bold px-2 rounded-full z-20">1</div>
                {state.rivalId === top50Users[0]?.userId && (
                  <div className="absolute top-0 -right-2 bg-rose-500 text-white text-[8px] font-bold px-1 rounded-sm z-30 border border-white/20 shadow-lg">RIVAL</div>
                )}
              </div>
              <div className="flex items-center justify-center space-x-1 w-full px-1">
                <span className="text-sm font-bold truncate text-primary">{top50Users[0]?.username || '-'}</span>
              </div>
              {top50Users[0]?.equippedTitle && (() => {
                const titleDef = TITLES.find(t => t.id === top50Users[0]?.equippedTitle);
                return (
                  <div className={`text-[9px] font-mono uppercase tracking-widest mt-0.5 inline-block text-center px-1 ${titleDef?.specialColor || 'text-accent/80'}`}>
                    {titleDef?.name[state.language] || top50Users[0]?.equippedTitle}
                  </div>
                );
              })()}
              <div className="h-32 w-full bg-gradient-to-t from-surface to-surface-hover rounded-t-xl mt-2 border-t-4 border-yellow-400/50 flex flex-col items-center justify-between py-3">
                {top50Users[0] && (
                  <div 
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black border border-white/10 shrink-0 ${getIntegrityRating(top50Users[0].integrityScore ?? 90).glow}`}
                    style={{ color: getIntegrityRating(top50Users[0].integrityScore ?? 90).color, backgroundColor: `${getIntegrityRating(top50Users[0].integrityScore ?? 90).color}20` }}
                  >
                    {getIntegrityRating(top50Users[0].integrityScore ?? 90).letter}
                  </div>
                )}
                <span className="text-sm font-mono font-bold text-yellow-400">{t('leaderboard.lvl', state.language).replace('{level}', (top50Users[0]?.level || 0).toString())}</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div 
              className="flex flex-col items-center w-24 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => { if (top50Users[2]) setSelectedActionUser(top50Users[2]); }}
            >
              <div className="w-12 h-12 flex items-center justify-center mb-2 relative">
                <ProfileFrame frame={top50Users[2]?.equippedFrame || null} src={top50Users[2]?.profilePicture || null} size="sm" />
                <div className="absolute -bottom-1 bg-amber-700 text-white text-[10px] font-bold px-1.5 rounded-full z-20">3</div>
                {state.rivalId === top50Users[2]?.userId && (
                  <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] font-bold px-1 rounded-sm z-30 border border-white/20 shadow-lg">RIVAL</div>
                )}
              </div>
              <div className="flex items-center justify-center space-x-1 w-full px-1">
                <span className="text-xs font-bold truncate">{top50Users[2]?.username || '-'}</span>
              </div>
              {top50Users[2]?.equippedTitle && (() => {
                const titleDef = TITLES.find(t => t.id === top50Users[2]?.equippedTitle);
                return (
                  <div className={`text-[8px] font-mono uppercase tracking-widest mt-0.5 inline-block text-center px-1 ${titleDef?.specialColor || 'text-accent/80'}`}>
                    {titleDef?.name[state.language] || top50Users[2]?.equippedTitle}
                  </div>
                );
              })()}
              <div className="h-20 w-full bg-gradient-to-t from-surface to-surface-hover rounded-t-xl mt-2 border-t-2 border-amber-700/50 flex flex-col items-center justify-between py-2">
                {top50Users[2] && (
                  <div 
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black border border-white/10 shrink-0 ${getIntegrityRating(top50Users[2].integrityScore ?? 90).glow}`}
                    style={{ color: getIntegrityRating(top50Users[2].integrityScore ?? 90).color, backgroundColor: `${getIntegrityRating(top50Users[2].integrityScore ?? 90).color}20` }}
                  >
                    {getIntegrityRating(top50Users[2].integrityScore ?? 90).letter}
                  </div>
                )}
                <span className="text-xs font-mono text-secondary">{t('leaderboard.lvl', state.language).replace('{level}', (top50Users[2]?.level || 0).toString())}</span>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {top50Users.slice(3).map((user, index) => {
              const rankObj = getRankForLevel(user.level);
              const isCurrentUser = user.username === state.username;
              
              return (
                <div 
                  key={`${user.userId || user.username}-${index}`}
                  ref={isCurrentUser ? userRowRef : null}
                  onClick={() => setSelectedActionUser(user)}
                  className={`p-4 rounded-2xl flex items-center space-x-4 border transition-all cursor-pointer hover:scale-[1.02] ${
                    isCurrentUser 
                      ? 'bg-accent/10 border-accent/50 shadow-[0_0_15px_var(--color-accent)]' 
                      : 'bg-surface border-white/5 hover:bg-surface-hover'
                  }`}
                >
                  <div className={`w-6 text-center font-mono font-bold text-sm ${isCurrentUser ? 'text-accent' : 'text-secondary'}`}>
                    {index + 4}
                  </div>
                  
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <ProfileFrame frame={user.equippedFrame} src={user.profilePicture || null} size="sm" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-bold truncate ${isCurrentUser ? 'text-primary' : 'text-secondary'}`}>
                            {user.username} {isCurrentUser && '(You)'}
                          </h4>
                          {state.rivalId === user.userId && (
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-500 text-[8px] font-bold uppercase tracking-wider border border-rose-500/30 shrink-0">
                              Rival
                            </span>
                          )}
                        </div>
                        
                        {/* OVR & Integrity Display - Moved Below Username */}
                        <div className="flex items-center space-x-3 mt-1 shrink-0">
                          <div className="flex items-center space-x-1">
                            <span className="text-[8px] font-black text-white/40 uppercase">OVR</span>
                            <span className="text-xs font-black text-primary">{user.ovr || calculateOVR(user as any, isCurrentUser ? activeUserEmail : null).ovr}</span>
                          </div>
                          {(() => {
                            const rating = getIntegrityRating(user.integrityScore ?? 90);
                            return (
                              <div 
                                className={`w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black border border-white/10 ${rating.glow}`}
                                style={{ color: rating.color, backgroundColor: `${rating.color}20` }}
                              >
                                {rating.letter}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    {user.equippedTitle && (() => {
                      const titleDef = TITLES.find(t => t.id === user.equippedTitle);
                      return (
                        <div className={`text-[10px] font-mono uppercase tracking-widest mt-0.5 inline-block ${titleDef?.specialColor || 'text-accent/80'}`}>
                          {titleDef?.name[state.language] || user.equippedTitle}
                        </div>
                      );
                    })()}
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs font-mono text-accent">{t('leaderboard.lvl', state.language).replace('{level}', user.level.toString())}</span>
                      <span className="text-xs font-mono text-secondary">{user.xp} {t('leaderboard.pts', state.language)}</span>
                    </div>
                  </div>
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${rankObj.bg}/20`}>
                    {getRankIcon(rankObj.name, `w-4 h-4 ${rankObj.color}`)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Row for Current User if not in Top 5 and not visible in list */}
      {showSticky && currentUserData && (
        <div className="absolute bottom-[72px] left-0 right-0 px-6 pb-2 pt-2 bg-gradient-to-t from-background via-background to-transparent z-40">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => setSelectedActionUser(currentUserData)}
            className="p-4 rounded-2xl flex items-center space-x-4 border bg-accent/10 border-accent/50 shadow-[0_0_20px_rgba(244,63,94,0.2)] cursor-pointer backdrop-blur-sm"
          >
            <div className="w-6 text-center font-mono font-bold text-sm text-accent">
              {currentUserRank}
            </div>
            
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <ProfileFrame frame={currentUserData.equippedFrame} src={currentUserData.profilePicture || null} size="sm" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold truncate text-primary">
                      {currentUserData.username} (You)
                    </h4>
                  </div>
                  
                  {/* OVR & Integrity Display - Moved Below Username */}
                  <div className="flex items-center space-x-3 mt-1 shrink-0">
                    <div className="flex items-center space-x-1">
                      <span className="text-[8px] font-black text-white/40 uppercase">OVR</span>
                      <span className="text-xs font-black text-primary">{currentUserData.ovr || calculateOVR(currentUserData as any, activeUserEmail).ovr}</span>
                    </div>
                    {(() => {
                      const rating = getIntegrityRating(currentUserData.integrityScore ?? 90);
                      return (
                        <div 
                          className={`w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black border border-white/10 ${rating.glow}`}
                          style={{ color: rating.color, backgroundColor: `${rating.color}20` }}
                        >
                          {rating.letter}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
              {currentUserData.equippedTitle && (() => {
                const titleDef = TITLES.find(t => t.id === currentUserData.equippedTitle);
                return (
                  <div className={`text-[10px] font-mono uppercase tracking-widest mt-0.5 inline-block ${titleDef?.specialColor || 'text-accent/80'}`}>
                    {titleDef?.name[state.language] || currentUserData.equippedTitle}
                  </div>
                );
              })()}
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-xs font-mono text-accent">{t('leaderboard.lvl', state.language).replace('{level}', currentUserData.level.toString())}</span>
                <span className="text-xs font-mono text-secondary">{currentUserData.xp} {t('leaderboard.pts', state.language)}</span>
              </div>
            </div>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getRankForLevel(currentUserData.level).bg}/20`}>
              {getRankIcon(getRankForLevel(currentUserData.level).name, `w-4 h-4 ${getRankForLevel(currentUserData.level).color}`)}
            </div>
          </motion.div>
        </div>
      )}

      {/* Action Modal */}
      {selectedActionUser && !selectedUser && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm pb-24">
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="bg-surface border border-white/10 rounded-3xl p-6 w-full max-w-sm relative shadow-2xl"
          >
            <button 
              onClick={() => setSelectedActionUser(null)}
              className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center mb-6">
              <ProfileFrame frame={selectedActionUser.equippedFrame} src={selectedActionUser.profilePicture || null} size="md" />
              <h3 className="text-xl font-bold mt-3">{selectedActionUser.username}</h3>
              <p className="text-sm text-secondary">Level {selectedActionUser.level}</p>
            </div>

            <div className="space-y-3">
              {rivalError && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center space-x-2 mb-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{rivalError}</span>
                </motion.div>
              )}

              {state.userId !== selectedActionUser.userId && (
                <button
                  onClick={() => {
                    if (state.rivalId === selectedActionUser.userId) {
                      setRivalError(state.language === 'id' ? 'Kamu sudah bersaing dengan mereka!' : 'You are already rival with them!');
                      return;
                    }

                    if (state.beatenRivals?.includes(selectedActionUser.userId) && selectedActionUser.level <= state.level) {
                      setRivalError(state.language === 'id' ? 'Kamu sudah mengalahkan rival ini! Cari lawan yang lebih kuat.' : 'You already defeated this rival! Find a stronger opponent.');
                      return;
                    }
                    
                    updateState({ rivalId: selectedActionUser.userId });
                    addNotification({
                      title: JSON.stringify({ key: 'leaderboard.rival_set' }),
                      description: JSON.stringify({ key: 'leaderboard.rival_set_desc', args: { username: selectedActionUser.username } }),
                      icon: 'Swords'
                    });
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                    setSelectedActionUser(null);
                  }}
                  className="w-full py-4 rounded-2xl font-bold text-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-colors flex items-center justify-center space-x-2"
                >
                  <Swords className="w-5 h-5" />
                  <span>{t('leaderboard.set_rival', state.language)}</span>
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedUser(selectedActionUser);
                  setSelectedActionUser(null);
                }}
                className="w-full py-4 rounded-2xl font-bold text-lg bg-surface-hover text-primary border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center space-x-2"
              >
                <User className="w-5 h-5" />
                <span>{t('leaderboard.see_profile', state.language)}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Public Profile Modal */}
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
                <p className="text-secondary text-sm">{t('leaderboard.private_profile', state.language)}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <ProfileFrame frame={selectedUser.equippedFrame} src={selectedUser.profilePicture || null} size="lg" />
                  <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center border-4 border-surface ${getRankForLevel(selectedUser.level).bg} z-50`}>
                    {getRankIcon(getRankForLevel(selectedUser.level).name, "w-5 h-5 text-white")}
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
                      {getRankForLevel(selectedUser.level).name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-secondary">{t('leaderboard.level', state.language)}</span>
                    <span className="font-mono font-bold text-primary">{selectedUser.level}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-secondary">OVR</span>
                    <span className="font-mono font-bold text-[#F43F5E]">{selectedUser.ovr || calculateOVR({ ...selectedUser, dailyStats: {}, badges: [], missionsCompleted: selectedUser.missionsCompleted || 0, streak: selectedUser.streak || 0, unlockedFrames: [] } as any, activeUserEmail).ovr}</span>
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
                    <Flame className="w-5 h-5 text-accent mb-1" />
                    <span className="text-xs text-secondary mb-1">{t('leaderboard.streak', state.language)}</span>
                    <span className="font-mono font-bold text-lg">{selectedUser.streak || 0}</span>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-1" />
                    <span className="text-xs text-secondary mb-1">{t('leaderboard.missions', state.language)}</span>
                    <span className="font-mono font-bold text-lg">{selectedUser.missionsCompleted || 0}</span>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center">
                    <Star className="w-5 h-5 text-rose-400 mb-1" />
                    <span className="text-xs text-secondary mb-1">{t('leaderboard.badges', state.language)}</span>
                    <span className="font-mono font-bold text-lg">{selectedUser.badgesCount || 0}</span>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center">
                    <div className="w-5 h-5 border-2 border-accent rounded-md mb-1" />
                    <span className="text-xs text-secondary mb-1">{t('leaderboard.frames', state.language)}</span>
                    <span className="font-mono font-bold text-lg">{selectedUser.framesCount || 1}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center space-x-2 z-50"
          >
            <Swords className="w-5 h-5" />
            <span>{t('leaderboard.rival_set', state.language)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default React.memo(LeaderboardScreen);
