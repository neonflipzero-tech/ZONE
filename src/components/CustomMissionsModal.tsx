import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Wand2, Lock } from 'lucide-react';
import { MissionType, UserState } from '../store';
import { t } from '../utils/translations';
import PremiumModal from './PremiumModal';

interface CustomMissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: UserState;
  addCustomMission: (type: MissionType, text: string) => void;
  removeCustomMission: (type: MissionType, text: string) => void;
  initialTab?: MissionType;
  isFlashSale?: boolean;
}

export default function CustomMissionsModal({ isOpen, onClose, state, addCustomMission, removeCustomMission, initialTab, isFlashSale = false }: CustomMissionsModalProps) {
  const [activeTab, setActiveTab] = React.useState<MissionType>(initialTab || 'REGULAR');
  const [newMissionText, setNewMissionText] = React.useState('');

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);

  if (!isOpen) return null;

  const customMissions = state.customMissions || { REGULAR: [], DAILY: [], WEEKLY: [], ROUTINE: [] };
  const currentMissions = customMissions[activeTab] || [];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.isPremium && currentMissions.length >= 10) {
      setShowPremiumPrompt(true);
      return;
    }
    if (newMissionText.trim()) {
      addCustomMission(activeTab, newMissionText.trim());
      setNewMissionText('');
    }
  };

  const getTabLabel = (type: MissionType) => {
    return t(`home.tab.${type.toLowerCase()}`, state.language);
  };

  const tabs = (['REGULAR', 'DAILY', 'WEEKLY', 'ROUTINE'] as MissionType[]).filter(type => type !== 'ROUTINE' || state.chosenPath === 'OTHER');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-surface border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[80vh]"
        >
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-display font-bold">
                {t('custom_missions.title', state.language)}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-secondary" />
            </button>
          </div>

          <div className="flex bg-background rounded-xl p-1 mb-6 border border-white/5 overflow-x-auto no-scrollbar shrink-0">
            {tabs.map(type => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`flex-1 min-w-[70px] py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === type 
                    ? 'bg-surface text-primary shadow-sm' 
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {getTabLabel(type)}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mb-2 shrink-0">
            <label className="text-sm font-bold text-secondary">
              {t('custom_missions.new_mission', state.language)}
            </label>
            <span className={`text-xs font-bold ${currentMissions.length >= 10 && !state.isPremium ? 'text-rose-400' : 'text-white/30'}`}>
              {currentMissions.length} {state.isPremium ? '' : '/ 10'}
            </span>
          </div>
          <form onSubmit={handleAdd} className="flex gap-2 mb-6 shrink-0">
            <input
              type="text"
              value={newMissionText}
              onChange={(e) => setNewMissionText(e.target.value)}
              placeholder={t('custom_missions.placeholder', state.language)}
              className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
            />
            <button 
              type="submit"
              disabled={!newMissionText.trim()}
              className="bg-accent text-background p-3 rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 min-h-0">
            {currentMissions.length === 0 ? (
              <div className="text-center py-8 text-secondary text-sm">
                {t('custom_missions.empty', state.language)}
              </div>
            ) : (
              currentMissions.map((mission, idx) => (
                <div key={`${mission}-${idx}`} className="flex items-center justify-between bg-background border border-white/5 p-4 rounded-xl group">
                  <span className="text-sm pr-4">{mission}</span>
                  <button 
                    onClick={() => removeCustomMission(activeTab, mission)}
                    className="p-2 rounded-lg text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/5 text-xs text-secondary text-center shrink-0">
            {activeTab === 'ROUTINE' ? (
              t('custom_missions.info.routine', state.language)
            ) : (
              t('custom_missions.info.other', state.language)
            )}
          </div>
        </motion.div>
        
        <PremiumModal 
          isOpen={showPremiumPrompt} 
          onClose={() => setShowPremiumPrompt(false)} 
          language={state.language} 
          isFlashSale={isFlashSale}
        />
      </div>
    </AnimatePresence>
  );
}
