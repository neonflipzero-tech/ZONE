import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, LogOut, AlertTriangle, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { UserState, PathType } from '../store';
import { useState } from 'react';

interface SettingsScreenProps {
  state: UserState;
  updateState: (updates: Partial<UserState>) => void;
  changePath: (path: PathType) => void;
  onLogout: () => void;
  onBack: () => void;
  setIsResetModalOpen: (isOpen: boolean) => void;
}

export default function SettingsScreen({ 
  state, 
  updateState, 
  changePath, 
  onLogout, 
  onBack,
  setIsResetModalOpen
}: SettingsScreenProps) {
  const [isGoalDropdownOpen, setIsGoalDropdownOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="absolute inset-0 z-50 bg-background flex flex-col overflow-y-auto no-scrollbar pb-24"
    >
      <div className="flex items-center p-4 border-b border-white/5 bg-surface/50 backdrop-blur-md sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors mr-3"
        >
          <ChevronLeft className="w-6 h-6 text-primary" />
        </button>
        <h2 className="text-xl font-bold text-primary">
          {state.language === 'id' ? 'Pengaturan' : 'Settings'}
        </h2>
      </div>

      <div className="p-4 space-y-6">
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
                    {(['PRODUCTIVE', 'STRONGER', 'EXTROVERT', 'DISCIPLINE', 'MENTAL_HEALTH', 'OTHER'] as PathType[]).map(path => (
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

          {/* Public Profile Setting */}
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <div>
              <span className="font-bold block">{state.language === 'id' ? 'Profil Publik' : 'Public Profile'}</span>
              <span className="text-xs text-secondary">{state.language === 'id' ? 'Tampilkan statistik profil di leaderboard' : 'Show profile stats on leaderboard'}</span>
            </div>
            <button 
              onClick={() => updateState({ isProfilePublic: state.isProfilePublic === false ? true : false })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${state.isProfilePublic !== false ? 'bg-accent' : 'bg-white/20'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${state.isProfilePublic !== false ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Privacy Policy */}
          <button 
            onClick={() => setIsPrivacyModalOpen(true)}
            className="w-full p-4 flex items-center justify-between text-secondary hover:text-primary hover:bg-white/5 transition-colors border-b border-white/5"
          >
            <span className="font-bold">{state.language === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Terms of Service */}
          <button 
            onClick={() => setIsTermsModalOpen(true)}
            className="w-full p-4 flex items-center justify-between text-secondary hover:text-primary hover:bg-white/5 transition-colors border-b border-white/5"
          >
            <span className="font-bold">{state.language === 'id' ? 'Syarat & Ketentuan' : 'Terms of Service'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>

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

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {isPrivacyModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[60] bg-background flex flex-col"
          >
            <div className="flex items-center p-4 border-b border-white/5 bg-surface/50 backdrop-blur-md sticky top-0 z-10">
              <button
                onClick={() => setIsPrivacyModalOpen(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors mr-3"
              >
                <ChevronLeft className="w-6 h-6 text-primary" />
              </button>
              <h2 className="text-xl font-bold text-primary">
                {state.language === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}
              </h2>
            </div>
            <div className="p-6 overflow-y-auto text-secondary space-y-4 text-sm">
              <h3 className="text-lg font-bold text-primary">Privacy Policy for ZONE</h3>
              <p>Last updated: March 2026</p>
              <p>ZONE ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by ZONE.</p>
              <h4 className="font-bold text-primary mt-4">1. Information We Collect</h4>
              <p>We collect information you provide directly to us, such as your username, email address, profile picture, and in-app progress (XP, level, missions completed).</p>
              <h4 className="font-bold text-primary mt-4">2. How We Use Your Information</h4>
              <p>We use the information we collect to provide, maintain, and improve our services, to personalize your experience, and to display your progress on the global leaderboard (if you choose to make your profile public).</p>
              <h4 className="font-bold text-primary mt-4">3. Sharing of Information</h4>
              <p>We do not share your personal information with third parties except as described in this privacy policy or with your consent. Your username, level, and stats may be visible to other users on the leaderboard unless you disable the "Public Profile" setting.</p>
              <h4 className="font-bold text-primary mt-4">4. Data Security</h4>
              <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
              <h4 className="font-bold text-primary mt-4">5. Contact Us</h4>
              <p>If you have any questions about this Privacy Policy, please contact us at support@zoneapp.com.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms of Service Modal */}
      <AnimatePresence>
        {isTermsModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[60] bg-background flex flex-col"
          >
            <div className="flex items-center p-4 border-b border-white/5 bg-surface/50 backdrop-blur-md sticky top-0 z-10">
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors mr-3"
              >
                <ChevronLeft className="w-6 h-6 text-primary" />
              </button>
              <h2 className="text-xl font-bold text-primary">
                {state.language === 'id' ? 'Syarat & Ketentuan' : 'Terms of Service'}
              </h2>
            </div>
            <div className="p-6 overflow-y-auto text-secondary space-y-4 text-sm">
              <h3 className="text-lg font-bold text-primary">Terms of Service for ZONE</h3>
              <p>Last updated: March 2026</p>
              <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the ZONE application operated by us.</p>
              <h4 className="font-bold text-primary mt-4">1. Acceptance of Terms</h4>
              <p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>
              <h4 className="font-bold text-primary mt-4">2. User Accounts</h4>
              <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
              <h4 className="font-bold text-primary mt-4">3. Content</h4>
              <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.</p>
              <h4 className="font-bold text-primary mt-4">4. Prohibited Uses</h4>
              <p>You may use Service only for lawful purposes and in accordance with Terms. You agree not to use Service in any way that violates any applicable national or international law or regulation.</p>
              <h4 className="font-bold text-primary mt-4">5. Changes</h4>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
