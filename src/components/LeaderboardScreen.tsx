import { motion } from 'motion/react';
import { UserState, RANKS } from '../store';
import { Trophy, Flame, Shield, User } from 'lucide-react';

interface LeaderboardScreenProps {
  state: UserState;
}

export default function LeaderboardScreen({ state }: LeaderboardScreenProps) {
  // Mock leaderboard data
  const mockUsers = [
    { name: 'Alex', xp: 4500, streak: 12, rank: 'Diamond', pfp: 'https://i.pravatar.cc/150?u=alex' },
    { name: 'Sarah', xp: 3200, streak: 8, rank: 'Platinum', pfp: 'https://i.pravatar.cc/150?u=sarah' },
    { name: 'Mike', xp: 2800, streak: 5, rank: 'Gold', pfp: 'https://i.pravatar.cc/150?u=mike' },
    { name: 'Emma', xp: 1500, streak: 3, rank: 'Silver', pfp: 'https://i.pravatar.cc/150?u=emma' },
    { name: 'John', xp: 800, streak: 1, rank: 'Bronze', pfp: 'https://i.pravatar.cc/150?u=john' },
  ];

  // Insert current user and sort
  const allUsers = [...mockUsers, {
    name: state.username + ' (You)',
    xp: state.xp + (state.level - 1) * 100, // Approximate total XP
    streak: state.streak || 0,
    rank: state.highestRankAchieved,
    pfp: state.profilePicture,
    isCurrentUser: true
  }].sort((a, b) => b.xp - a.xp);

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
            <div className="w-12 h-12 rounded-full bg-surface border-2 border-gray-300 flex items-center justify-center mb-2 shadow-lg shadow-gray-300/20 overflow-hidden relative">
              {allUsers[1]?.pfp ? (
                <img src={allUsers[1].pfp} alt={allUsers[1].name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-gray-300" />
              )}
              <div className="absolute -bottom-1 bg-gray-300 text-black text-[10px] font-bold px-1.5 rounded-full">2</div>
            </div>
            <span className="text-xs font-bold truncate w-full text-center">{allUsers[1]?.name}</span>
            <div className="h-24 w-full bg-gradient-to-t from-surface to-surface-hover rounded-t-xl mt-2 border-t-2 border-gray-300/50 flex flex-col items-center justify-end pb-2">
              <span className="text-xs font-mono text-secondary">{allUsers[1]?.xp}</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center w-28 z-10">
            <div className="w-16 h-16 rounded-full bg-surface border-4 border-yellow-400 flex items-center justify-center mb-2 shadow-xl shadow-yellow-400/30 relative overflow-hidden">
              {allUsers[0]?.pfp ? (
                <img src={allUsers[0].pfp} alt={allUsers[0].name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-yellow-400" />
              )}
              <Trophy className="w-6 h-6 text-yellow-400 absolute -top-3 drop-shadow-md" />
              <div className="absolute -bottom-1 bg-yellow-400 text-black text-xs font-bold px-2 rounded-full">1</div>
            </div>
            <span className="text-sm font-bold truncate w-full text-center text-primary">{allUsers[0]?.name}</span>
            <div className="h-32 w-full bg-gradient-to-t from-surface to-surface-hover rounded-t-xl mt-2 border-t-4 border-yellow-400/50 flex flex-col items-center justify-end pb-2">
              <span className="text-sm font-mono font-bold text-yellow-400">{allUsers[0]?.xp}</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center w-24">
            <div className="w-12 h-12 rounded-full bg-surface border-2 border-amber-700 flex items-center justify-center mb-2 shadow-lg shadow-amber-700/20 overflow-hidden relative">
              {allUsers[2]?.pfp ? (
                <img src={allUsers[2].pfp} alt={allUsers[2].name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-amber-700" />
              )}
              <div className="absolute -bottom-1 bg-amber-700 text-white text-[10px] font-bold px-1.5 rounded-full">3</div>
            </div>
            <span className="text-xs font-bold truncate w-full text-center">{allUsers[2]?.name}</span>
            <div className="h-20 w-full bg-gradient-to-t from-surface to-surface-hover rounded-t-xl mt-2 border-t-2 border-amber-700/50 flex flex-col items-center justify-end pb-2">
              <span className="text-xs font-mono text-secondary">{allUsers[2]?.xp}</span>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {allUsers.slice(3).map((user, index) => {
            const rankObj = RANKS.find(r => r.name === user.rank) || RANKS[0];
            
            return (
              <div 
                key={user.name}
                className={`p-4 rounded-2xl flex items-center space-x-4 border transition-all ${
                  user.isCurrentUser 
                    ? 'bg-gradient-to-r from-surface to-surface-hover border-accent/30 shadow-lg shadow-accent/5' 
                    : 'bg-surface border-white/5'
                }`}
              >
                <div className="w-6 text-center font-mono font-bold text-secondary text-sm">
                  {index + 4}
                </div>
                
                <div className="w-10 h-10 rounded-full overflow-hidden bg-surface border border-white/10 flex items-center justify-center shrink-0">
                  {user.pfp ? (
                    <img src={user.pfp} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-secondary" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold truncate ${user.isCurrentUser ? 'text-primary' : 'text-secondary'}`}>
                    {user.name}
                  </h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs font-mono text-accent">{user.xp} XP</span>
                    <div className="flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span className="text-[10px] font-bold text-orange-500">{user.streak}</span>
                    </div>
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
