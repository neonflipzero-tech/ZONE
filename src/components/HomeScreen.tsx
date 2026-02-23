import { motion } from 'motion/react';
import { useState } from 'react';
import { UserState, MissionType, getRankForLevel } from '../store';
import { CheckCircle2, Circle, Flame, Trophy, User, Shield } from 'lucide-react';

interface HomeScreenProps {
  state: UserState;
  onCompleteMission: (id: string) => void;
}

export default function HomeScreen({ state, onCompleteMission }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<MissionType>('REGULAR');

  const missions = state.missions || [];
  const displayedMissions = missions.filter(m => m.type === activeTab);
  const completedMissionsCount = displayedMissions.filter(m => m.completed).length;
  const totalMissions = displayedMissions.length;
  const progressPercentage = totalMissions === 0 ? 0 : (completedMissionsCount / totalMissions) * 100;

  const currentRank = getRankForLevel(state.level);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full bg-background overflow-y-auto no-scrollbar pb-24"
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-surface flex items-center justify-center relative">
            {state.profilePicture ? (
              <img src={state.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-secondary" />
            )}
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-background ${currentRank.bg}`}></div>
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight">Hi, {state.username}</h1>
            <div className="flex items-center space-x-1 mt-0.5">
              <Shield className={`w-3 h-3 ${currentRank.color}`} />
              <p className={`text-xs font-mono uppercase tracking-wider ${currentRank.color}`}>{currentRank.name} • Lvl {state.level}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-surface to-surface-hover px-3 py-1.5 rounded-full border border-white/10 shadow-sm shadow-accent/5">
          <Flame className="w-4 h-4 text-accent" />
          <span className="text-sm font-bold">{state.xp} XP</span>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Missions */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-display font-bold">Missions</h3>
            <span className="text-sm text-secondary font-mono">{completedMissionsCount}/{totalMissions}</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-surface rounded-xl p-1 mb-6 border border-white/5">
            {(['REGULAR', 'DAILY', 'WEEKLY'] as MissionType[]).map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-colors ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-accent to-rose-600 text-white shadow-md' 
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {index + 1} | {tab} MISSION
              </button>
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-surface rounded-full mb-6 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-accent to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          <div className="space-y-3">
            {displayedMissions.map((mission, index) => (
              <motion.div
                key={mission.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => !mission.completed && onCompleteMission(mission.id)}
                className={`p-4 rounded-2xl flex items-center space-x-4 border transition-all ${
                  mission.completed 
                    ? 'bg-surface/30 border-white/5 opacity-50' 
                    : 'bg-gradient-to-br from-surface to-surface-hover border-white/10 cursor-pointer hover:border-white/30 hover:shadow-lg hover:shadow-accent/5'
                }`}
              >
                {mission.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-secondary shrink-0" />
                )}
                <span className={`font-medium ${mission.completed ? 'line-through text-secondary' : 'text-primary'}`}>
                  {mission.text}
                </span>
                {!mission.completed && (
                  <span className="ml-auto text-xs font-mono text-accent">+50 XP</span>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Badges Preview */}
        {state.badges.length > 0 && (
          <section>
            <h3 className="text-xl font-display font-bold mb-4">Recent Unlocks</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {state.badges.map((badge, i) => (
                <div key={i} className="bg-gradient-to-b from-surface to-surface-hover border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center min-w-[100px] shrink-0 shadow-sm shadow-accent/5">
                  <Trophy className="w-6 h-6 text-accent mb-2" />
                  <span className="text-xs font-bold text-center text-primary">{badge}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}
