import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserState, RANKS, getRankForLevel } from '../store';
import { Trophy, Flame, Shield, User } from 'lucide-react';
import ProfileFrame from './ProfileFrame';

interface LeaderboardScreenProps {
  state: UserState;
}

interface LeaderboardUser {
  username: string;
  level: number;
  xp: number;
  equippedFrame: string | null;
  equippedTitle: string | null;
  profilePicture: string | null;
}

export default function LeaderboardScreen({ state }: LeaderboardScreenProps) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Netlify friendly: use localStorage for leaderboard
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
        { username: 'Zaiki', level: 100, xp: 99999, equippedFrame: 'frame-omniscience', equippedTitle: 'The Creator', profilePicture: null },
        { username: 'ProGamer', level: 42, xp: 15000, equippedFrame: 'frame-abyssal', equippedTitle: 'Grind Master', profilePicture: null },
        { username: 'Newbie', level: 5, xp: 1200, equippedFrame: 'frame-bronze', equippedTitle: 'Newbie', profilePicture: null },
      ]);
    }
    setLoading(false);
  }, []);

  // Override current user's data with local state to ensure it's always up-to-date
  const allUsers = users.map(u => {
    if (state.username && u.username === state.username) {
      return {
        ...u,
        level: state.level,
        xp: state.xp,
        equippedFrame: state.equippedFrame,
        equippedTitle: state.equippedTitle,
        profilePicture: state.profilePicture
      };
    }
    return u;
  });

  // If the current user is not in the list (e.g., just started and hasn't synced yet), add them locally
  if (state.username && !allUsers.find(u => u.username === state.username)) {
    allUsers.push({
      username: state.username,
      level: state.level,
      xp: state.xp,
      equippedFrame: state.equippedFrame,
      equippedTitle: state.equippedTitle,
      profilePicture: state.profilePicture
    });
  }

  // Sort by level DESC, then xp DESC
  allUsers.sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    return b.xp - a.xp;
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
        <h1 className="text-2xl font-display font-bold tracking-tight mb-8">Global Leaderboard</h1>

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center space-x-2 mb-12 mt-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center w-24">
            <div className="w-12 h-12 flex items-center justify-center mb-2 relative">
              <ProfileFrame frame={allUsers[1]?.equippedFrame || null} src={allUsers[1]?.profilePicture || null} size="sm" />
              <div className="absolute -bottom-1 bg-gray-300 text-black text-[10px] font-bold px-1.5 rounded-full z-20">2</div>
            </div>
            <span className="text-xs font-bold truncate w-full text-center">{allUsers[1]?.username || '-'}</span>
            <div className="h-24 w-full bg-gradient-to-t from-surface to-surface-hover rounded-t-xl mt-2 border-t-2 border-gray-300/50 flex flex-col items-center justify-end pb-2">
              <span className="text-xs font-mono text-secondary">Lvl {allUsers[1]?.level || 0}</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center w-28 z-10">
            <div className="w-16 h-16 flex items-center justify-center mb-2 relative">
              <ProfileFrame frame={allUsers[0]?.equippedFrame || null} src={allUsers[0]?.profilePicture || null} size="md" />
              <Trophy className="w-6 h-6 text-yellow-400 absolute -top-3 drop-shadow-md z-20" />
              <div className="absolute -bottom-1 bg-yellow-400 text-black text-xs font-bold px-2 rounded-full z-20">1</div>
            </div>
            <span className="text-sm font-bold truncate w-full text-center text-primary">{allUsers[0]?.username || '-'}</span>
            <div className="h-32 w-full bg-gradient-to-t from-surface to-surface-hover rounded-t-xl mt-2 border-t-4 border-yellow-400/50 flex flex-col items-center justify-end pb-2">
              <span className="text-sm font-mono font-bold text-yellow-400">Lvl {allUsers[0]?.level || 0}</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center w-24">
            <div className="w-12 h-12 flex items-center justify-center mb-2 relative">
              <ProfileFrame frame={allUsers[2]?.equippedFrame || null} src={allUsers[2]?.profilePicture || null} size="sm" />
              <div className="absolute -bottom-1 bg-amber-700 text-white text-[10px] font-bold px-1.5 rounded-full z-20">3</div>
            </div>
            <span className="text-xs font-bold truncate w-full text-center">{allUsers[2]?.username || '-'}</span>
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
                className={`p-4 rounded-2xl flex items-center space-x-4 border transition-all ${
                  isCurrentUser 
                    ? 'bg-gradient-to-r from-surface to-surface-hover border-accent/30 shadow-lg shadow-accent/5' 
                    : 'bg-surface border-white/5'
                }`}
              >
                <div className="w-6 text-center font-mono font-bold text-secondary text-sm">
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
                    <div className="text-[10px] font-mono uppercase tracking-widest text-accent/80 mt-0.5">
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
    </motion.div>
  );
}
