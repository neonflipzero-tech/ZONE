import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserState, RANKS, getRankForLevel, TITLES, calculateOVR, useAppState } from '../store';
import { Trophy, Flame, Shield, User, AlertCircle, X, CheckCircle2, Star, Swords } from 'lucide-react';
import ProfileFrame from './ProfileFrame';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { sounds } from '../utils/sounds';

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
}

export default function LeaderboardScreen({ state }: LeaderboardScreenProps) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingFirebase, setIsUsingFirebase] = useState(!!db);
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
  const [selectedActionUser, setSelectedActionUser] = useState<LeaderboardUser | null>(null);
  const [showToast, setShowToast] = useState(false);
  const { updateState, addNotification } = useAppState();

  useEffect(() => {
    if (db) {
      // Real-time global leaderboard using Firebase
      // Only order by totalXp to avoid needing a composite index in Firestore
      const q = query(collection(db, 'users'), orderBy('totalXp', 'desc'), limit(50));
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
          console.error("Error fetching leaderboard:", error);
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
          { userId: 'zaiki-123', username: 'Zaiki', level: 100, xp: 99999, totalXp: 999999, equippedFrame: 'frame-omniscience', equippedTitle: 'The Creator', profilePicture: 'https://picsum.photos/seed/zaiki/200/200' },
          { userId: 'progamer-123', username: 'ProGamer', level: 42, xp: 15000, totalXp: 101100, equippedFrame: 'frame-abyssal', equippedTitle: 'Grind Master', profilePicture: 'https://picsum.photos/seed/progamer/200/200' },
          { userId: 'newbie-123', username: 'Newbie', level: 5, xp: 1200, totalXp: 2200, equippedFrame: 'frame-bronze', equippedTitle: 'Newbie', profilePicture: 'https://picsum.photos/seed/newbie/200/200' },
        ]);
      }
      setLoading(false);
    }
  }, []);

  // Override current user's data with local state to ensure it's always up-to-date
  let allUsers = users.map(u => {
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
        ovr: calculateOVR(state).ovr
      };
    }
    return u;
  });

  // Deduplicate by username (in case local storage had old entries)
  const uniqueUsers = new Map<string, LeaderboardUser>();
  allUsers.forEach(u => {
    const currentTotalXp = u.totalXp || (50 * u.level * (u.level - 1) + u.xp);
    const existingUser = uniqueUsers.get(u.username);
    const existingTotalXp = existingUser ? (existingUser.totalXp || (50 * existingUser.level * (existingUser.level - 1) + existingUser.xp)) : -1;
    
    if (!existingUser || existingTotalXp < currentTotalXp) {
      uniqueUsers.set(u.username, u);
    }
  });
  allUsers = Array.from(uniqueUsers.values());

  // If the current user is not in the list (e.g., just started and hasn't synced yet), add them locally
  if (state.userId && !allUsers.find(u => u.userId === state.userId || u.username === state.username)) {
    allUsers.push({
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
      ovr: calculateOVR(state).ovr
    });
  }

  // Sort by totalXp DESC
  allUsers.sort((a, b) => {
    const aTotal = a.totalXp || (50 * a.level * (a.level - 1) + a.xp);
    const bTotal = b.totalXp || (50 * b.level * (b.level - 1) + b.xp);
    return bTotal - aTotal;
  });

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
      className="flex flex-col h-full bg-background overflow-y-auto no-scrollbar pb-24"
    >
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-display font-bold tracking-tight">Global Leaderboard</h1>
          {!isUsingFirebase && (
            <div className="flex items-center space-x-1 text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
              <AlertCircle className="w-3 h-3" />
              <span>Local Mode</span>
            </div>
          )}
        </div>

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center space-x-2 mb-12 mt-8">
          {/* 2nd Place */}
          <div 
            className="flex flex-col items-center w-24 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => allUsers[1] && setSelectedActionUser(allUsers[1])}
          >
            <div className="w-12 h-12 flex items-center justify-center mb-2 relative">
              <ProfileFrame frame={allUsers[1]?.equippedFrame || null} src={allUsers[1]?.profilePicture || null} size="sm" />
              <div className="absolute -bottom-1 bg-gray-300 text-black text-[10px] font-bold px-1.5 rounded-full z-20">2</div>
            </div>
            <span className="text-xs font-bold truncate w-full text-center">{allUsers[1]?.username || '-'}</span>
            {allUsers[1]?.equippedTitle && (
              <span className={`text-[8px] font-mono uppercase tracking-widest mt-0.5 truncate w-full text-center ${TITLES.find(t => t.id === allUsers[1]?.equippedTitle)?.specialColor || 'text-accent/80'}`}>
                {allUsers[1]?.equippedTitle}
              </span>
            )}
            <div className="h-24 w-full bg-gradient-to-t from-surface to-surface-hover rounded-t-xl mt-2 border-t-2 border-gray-300/50 flex flex-col items-center justify-end pb-2">
              <span className="text-xs font-mono text-secondary">Lvl {allUsers[1]?.level || 0}</span>
            </div>
          </div>

          {/* 1st Place */}
          <div 
            className="flex flex-col items-center w-28 z-10 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => allUsers[0] && setSelectedActionUser(allUsers[0])}
          >
            <div className="w-16 h-16 flex items-center justify-center mb-2 relative">
              <ProfileFrame frame={allUsers[0]?.equippedFrame || null} src={allUsers[0]?.profilePicture || null} size="md" />
              <Trophy className="w-6 h-6 text-yellow-400 absolute -top-3 drop-shadow-md z-20" />
              <div className="absolute -bottom-1 bg-yellow-400 text-black text-xs font-bold px-2 rounded-full z-20">1</div>
            </div>
            <span className="text-sm font-bold truncate w-full text-center text-primary">{allUsers[0]?.username || '-'}</span>
            {allUsers[0]?.equippedTitle && (
              <span className={`text-[9px] font-mono uppercase tracking-widest mt-0.5 truncate w-full text-center ${TITLES.find(t => t.id === allUsers[0]?.equippedTitle)?.specialColor || 'text-accent/80'}`}>
                {allUsers[0]?.equippedTitle}
              </span>
            )}
            <div className="h-32 w-full bg-gradient-to-t from-surface to-surface-hover rounded-t-xl mt-2 border-t-4 border-yellow-400/50 flex flex-col items-center justify-end pb-2">
              <span className="text-sm font-mono font-bold text-yellow-400">Lvl {allUsers[0]?.level || 0}</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div 
            className="flex flex-col items-center w-24 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => allUsers[2] && setSelectedActionUser(allUsers[2])}
          >
            <div className="w-12 h-12 flex items-center justify-center mb-2 relative">
              <ProfileFrame frame={allUsers[2]?.equippedFrame || null} src={allUsers[2]?.profilePicture || null} size="sm" />
              <div className="absolute -bottom-1 bg-amber-700 text-white text-[10px] font-bold px-1.5 rounded-full z-20">3</div>
            </div>
            <span className="text-xs font-bold truncate w-full text-center">{allUsers[2]?.username || '-'}</span>
            {allUsers[2]?.equippedTitle && (
              <span className={`text-[8px] font-mono uppercase tracking-widest mt-0.5 truncate w-full text-center ${TITLES.find(t => t.id === allUsers[2]?.equippedTitle)?.specialColor || 'text-accent/80'}`}>
                {allUsers[2]?.equippedTitle}
              </span>
            )}
            <div className="h-20 w-full bg-gradient-to-t from-surface to-surface-hover rounded-t-xl mt-2 border-t-2 border-amber-700/50 flex flex-col items-center justify-end pb-2">
              <span className="text-xs font-mono text-secondary">Lvl {allUsers[2]?.level || 0}</span>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {allUsers.slice(3, 30).map((user, index) => {
            const rankObj = getRankForLevel(user.level);
            const isCurrentUser = user.username === state.username;
            
            return (
              <div 
                key={user.username}
                onClick={() => setSelectedActionUser(user)}
                className={`p-4 rounded-2xl flex items-center space-x-4 border transition-all cursor-pointer hover:scale-[1.02] ${
                  isCurrentUser 
                    ? 'bg-accent/10 border-accent/50 shadow-[0_0_15px_rgba(242,125,38,0.15)]' 
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
                  <h4 className={`font-bold truncate ${isCurrentUser ? 'text-primary' : 'text-secondary'}`}>
                    {user.username} {isCurrentUser && '(You)'}
                  </h4>
                  {user.equippedTitle && (
                    <div className={`text-[10px] font-mono uppercase tracking-widest mt-0.5 ${TITLES.find(t => t.id === user.equippedTitle)?.specialColor || 'text-accent/80'}`}>
                      {user.equippedTitle}
                    </div>
                  )}
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs font-mono text-accent">Lvl {user.level}</span>
                    <span className="text-xs font-mono text-secondary">{user.xp} XP</span>
                  </div>
                </div>
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${rankObj.bg}/20`}>
                  <Shield className={`w-4 h-4 ${rankObj.color}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
              {state.userId !== selectedActionUser.userId && (
                <button
                  onClick={() => {
                    if (state.beatenRivals?.includes(selectedActionUser.userId)) {
                      addNotification({
                        title: state.language === 'id' ? 'Tidak Bisa Memilih Rival' : 'Cannot Select Rival',
                        description: state.language === 'id' ? 'Kamu sudah pernah mengalahkan orang ini. Cari lawan lain!' : 'You already beat this guy. Find another opponent!',
                        icon: 'AlertTriangle'
                      });
                      setSelectedActionUser(null);
                      return;
                    }
                    sounds.playSetRival();
                    updateState({ rivalId: selectedActionUser.userId });
                    addNotification({
                      title: 'Rival Set!',
                      description: `You are now competing against ${selectedActionUser.username}. Crush them!`,
                      icon: 'Swords'
                    });
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                    setSelectedActionUser(null);
                  }}
                  className="w-full py-4 rounded-2xl font-bold text-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center space-x-2"
                >
                  <Swords className="w-5 h-5" />
                  <span>Set as Rival</span>
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
                <span>See Profile</span>
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
                <p className="text-secondary text-sm">This user's profile is private.</p>
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
                    <span className="font-mono font-bold text-lg">{selectedUser.badgesCount || 0}</span>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center">
                    <div className="w-5 h-5 border-2 border-accent rounded-md mb-1" />
                    <span className="text-xs text-secondary mb-1">Frames</span>
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
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center space-x-2 z-50"
          >
            <Swords className="w-5 h-5" />
            <span>Rival Set!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
