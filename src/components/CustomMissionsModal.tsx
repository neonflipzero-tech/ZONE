import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Wand2 } from 'lucide-react';
import { MissionType, UserState } from '../store';

interface CustomMissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: UserState;
  addCustomMission: (type: MissionType, text: string) => void;
  removeCustomMission: (type: MissionType, text: string) => void;
}

export default function CustomMissionsModal({ isOpen, onClose, state, addCustomMission, removeCustomMission }: CustomMissionsModalProps) {
  const [activeTab, setActiveTab] = useState<MissionType>('REGULAR');
  const [newMissionText, setNewMissionText] = useState('');

  if (!isOpen) return null;

  const customMissions = state.customMissions || { REGULAR: [], DAILY: [], WEEKLY: [], ROUTINE: [] };
  const currentMissions = customMissions[activeTab] || [];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMissionText.trim()) {
      addCustomMission(activeTab, newMissionText.trim());
      setNewMissionText('');
    }
  };

  const getTabLabel = (type: MissionType) => {
    if (state.language === 'id') {
      switch(type) {
        case 'REGULAR': return 'Biasa';
        case 'DAILY': return 'Harian';
        case 'WEEKLY': return 'Mingguan';
        case 'ROUTINE': return 'Rutinitas';
      }
    }
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  const tabs = state.chosenPath === 'OTHER' 
    ? ['REGULAR', 'DAILY', 'WEEKLY', 'ROUTINE'] as MissionType[]
    : ['REGULAR', 'DAILY', 'WEEKLY'] as MissionType[];

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
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-display font-bold">
                {state.language === 'id' ? 'Misi Kustom' : 'Custom Missions'}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-secondary" />
            </button>
          </div>

          <div className="flex bg-background rounded-xl p-1 mb-6 border border-white/5 overflow-x-auto no-scrollbar">
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

          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newMissionText}
              onChange={(e) => setNewMissionText(e.target.value)}
              placeholder={state.language === 'id' ? 'Ketik misi baru...' : 'Type new mission...'}
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

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
            {currentMissions.length === 0 ? (
              <div className="text-center py-8 text-secondary text-sm">
                {state.language === 'id' 
                  ? 'Belum ada misi kustom di kategori ini.' 
                  : 'No custom missions in this category yet.'}
              </div>
            ) : (
              currentMissions.map((mission, idx) => (
                <div key={idx} className="flex items-center justify-between bg-background border border-white/5 p-4 rounded-xl group">
                  <span className="text-sm pr-4">{mission}</span>
                  <button 
                    onClick={() => removeCustomMission(activeTab, mission)}
                    className="p-2 rounded-lg text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/5 text-xs text-secondary text-center">
            {activeTab === 'ROUTINE' ? (
              state.language === 'id' 
                ? 'Misi rutinitas akan muncul setiap hari sesuai urutan ini.' 
                : 'Routine missions will appear every day in this exact order.'
            ) : (
              state.language === 'id' 
                ? 'Misi kustom akan muncul secara acak saat misi baru dibuat.' 
                : 'Custom missions will appear randomly when new missions are generated.'
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
