import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, LogOut, AlertTriangle, ChevronDown, ChevronUp, ChevronRight, Bell, Clock, Crown, Trash2 } from 'lucide-react';
import { UserState, PathType, translateMissionText, scaleMissionText } from '../store';
import React, { useState, useRef } from 'react';
import { sounds } from '../utils/sounds';
import { NotificationService } from '../services/NotificationService';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { t } from '../utils/translations';

interface SettingsScreenProps {
  state: UserState;
  updateState: (updates: Partial<UserState>) => void;
  changePath: (path: PathType) => void;
  clearCustomMissions: () => void;
  onLogout: () => void;
  onBack: () => void;
  setIsResetModalOpen: (isOpen: boolean) => void;
}

export default function SettingsScreen({ 
  state, 
  updateState, 
  changePath, 
  clearCustomMissions,
  onLogout, 
  onBack,
  setIsResetModalOpen
}: SettingsScreenProps) {
  const [isGoalDropdownOpen, setIsGoalDropdownOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState(state.username);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || newUsername === state.username) return;
    
    setIsCheckingUsername(true);
    
    try {
      if (db) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', newUsername.trim()));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Check if the found user is not the current user (though username should be unique)
          const isTaken = querySnapshot.docs.some(doc => doc.id !== state.userId);
          if (isTaken) {
            setToastMessage(state.language === 'id' ? 'Username sudah digunakan!' : 'This username has been taken');
            setIsCheckingUsername(false);
            setTimeout(() => setToastMessage(null), 3000);
            return;
          }
        }
      }
      
      updateState({ username: newUsername.trim() });
      setToastMessage(t('settings.username.success', state.language));
    } catch (e) {
      console.error("Error checking username:", e);
      // Fallback: update anyway if Firestore fails
      updateState({ username: newUsername.trim() });
      setToastMessage(t('settings.username.success', state.language));
    } finally {
      setIsCheckingUsername(false);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    }
  };

  const handleTogglePublicProfile = () => {
    const newIsPublic = state.isProfilePublic === false ? true : false;
    updateState({ isProfilePublic: newIsPublic });
    
    const message = newIsPublic 
      ? t('settings.toast.public', state.language)
      : t('settings.toast.private', state.language);
      
    setToastMessage(message);
    
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggleNotifications = async () => {
    const newEnabled = !state.notificationsEnabled;
    
    if (newEnabled) {
      const permission = await NotificationService.requestPermission();
      if (permission === 'unsupported') {
        const message = state.language === 'id' 
          ? 'APK WebView tidak mendukung notifikasi sistem. Untuk Play Store, fitur ini akan menggunakan sistem native Android agar berfungsi 100%.' 
          : 'APK WebView does not support system notifications. For Play Store, this will use the native Android system to work 100%.';
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 6000);
        return;
      }
      
      if (permission !== 'granted') {
        const isIframe = typeof window !== 'undefined' && window.self !== window.top;
        const message = state.language === 'id' 
          ? (isIframe ? 'Notifikasi diblokir oleh browser (Iframe). Buka di tab baru!' : 'Izin notifikasi ditolak. Aktifkan di pengaturan browser.')
          : (isIframe ? 'Notifications blocked by browser (Iframe). Open in new tab!' : 'Notification permission denied. Enable in browser settings.');
        
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 5000);
        return;
      }
    }
    
    updateState({ notificationsEnabled: newEnabled });
    if (newEnabled) {
      NotificationService.scheduleDailyReminder({ ...state, notificationsEnabled: newEnabled });
      setToastMessage(state.language === 'id' ? 'Notifikasi diaktifkan!' : 'Notifications enabled!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleLanguageChange = (lang: 'en' | 'id') => {
    sounds.playClick();
    
    // Update all existing missions to the new language
    const updatedMissions = state.missions.map(mission => {
      // Use originalText if available, otherwise fallback to current text (for old missions)
      const original = mission.originalText || mission.text;
      const translated = translateMissionText(original, lang);
      const scaled = scaleMissionText(translated, state.level);
      
      return {
        ...mission,
        text: scaled,
        originalText: original // Ensure originalText is preserved/set
      };
    });

    // Also update missions in pathProgress for all paths
    const updatedPathProgress = { ...state.pathProgress };
    (Object.keys(updatedPathProgress) as PathType[]).forEach(path => {
      const progress = updatedPathProgress[path];
      if (progress && progress.missions) {
        updatedPathProgress[path] = {
          ...progress,
          missions: progress.missions.map(mission => {
            const original = mission.originalText || mission.text;
            const translated = translateMissionText(original, lang);
            const scaled = scaleMissionText(translated, state.level);
            return {
              ...mission,
              text: scaled,
              originalText: original
            };
          })
        };
      }
    });

    // Also update boss tasks if active
    let updatedBossState = state.bossState;
    if (updatedBossState && updatedBossState.tasks) {
      updatedBossState = {
        ...updatedBossState,
        tasks: updatedBossState.tasks.map(task => {
          const original = task.originalText || task.text;
          const translated = translateMissionText(original, lang);
          const scaled = scaleMissionText(translated, state.level);
          return {
            ...task,
            text: scaled,
            originalText: original
          };
        })
      };
    }

    updateState({ 
      language: lang,
      missions: updatedMissions,
      pathProgress: updatedPathProgress,
      bossState: updatedBossState
    });
    
    setToastMessage(lang === 'id' ? 'Bahasa diubah ke Indonesia' : 'Language changed to English');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    updateState({ notificationTime: newTime });
    if (state.notificationsEnabled) {
      NotificationService.scheduleDailyReminder({ ...state, notificationTime: newTime });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="absolute inset-0 z-50 bg-background flex flex-col overflow-y-auto no-scrollbar pb-24"
    >
      <div className="flex items-center p-4 border-b border-white/5 bg-surface/50 backdrop-blur-md sticky top-0 z-10">
        <button
          onClick={() => { onBack(); }}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors mr-3"
        >
          <ChevronLeft className="w-6 h-6 text-primary" />
        </button>
        <h2 className="text-xl font-bold text-primary">
          {t('settings.title', state.language)}
        </h2>
      </div>

      <div className="p-4 space-y-6">
        <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
          {/* Account Settings - Username */}
          <div className="p-4 border-b border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">
              {t('settings.account', state.language)}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold block mb-1">{t('settings.username', state.language)}</label>
                <span className="text-[10px] text-secondary block mb-2">{t('settings.username.desc', state.language)}</span>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <input 
                    type="text" 
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder={t('settings.username.placeholder', state.language)}
                    className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-2 text-sm text-primary focus:outline-none focus:border-accent transition-colors min-w-0"
                  />
                  <button
                    onClick={handleUpdateUsername}
                    disabled={!newUsername.trim() || newUsername === state.username || isCheckingUsername}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                      !newUsername.trim() || newUsername === state.username || isCheckingUsername
                        ? 'bg-white/5 text-secondary cursor-not-allowed'
                        : 'bg-primary text-background hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isCheckingUsername 
                      ? (state.language === 'id' ? 'Mengecek...' : 'Checking...') 
                      : t('settings.username.save', state.language)}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Goal Setting */}
          <div className="p-4 border-b border-white/5">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => { setIsGoalDropdownOpen(!isGoalDropdownOpen); }}
            >
              <span className="font-bold">{t('settings.goal', state.language)}</span>
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
                    {(['PRODUCTIVE', 'STRONGER', 'SOCIAL', 'DISCIPLINE', 'MENTAL_HEALTH', 'OTHER'] as PathType[]).map(path => (
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
            <span className="font-bold">{t('settings.language', state.language)}</span>
            <div className="flex bg-background rounded-lg p-1 border border-white/10">
              <button 
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${state.language === 'en' ? 'bg-primary text-background' : 'text-secondary hover:text-primary'}`}
              >
                EN
              </button>
              <button 
                onClick={() => handleLanguageChange('id')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${state.language === 'id' ? 'bg-primary text-background' : 'text-secondary hover:text-primary'}`}
              >
                ID
              </button>
            </div>
          </div>

          {/* Notifications Setting */}
          <div className="p-4 flex flex-col space-y-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <span className="font-bold block">{t('settings.notifications', state.language)}</span>
                  <span className="text-xs text-secondary">{t('settings.notifications.desc', state.language)}</span>
                </div>
              </div>
              <button 
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${state.notificationsEnabled ? 'bg-accent' : 'bg-white/20'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${state.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <AnimatePresence>
              {state.notificationsEnabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-secondary">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{t('settings.notification_time', state.language)}</span>
                      </div>
                      <input 
                        type="time" 
                        value={state.notificationTime}
                        onChange={handleTimeChange}
                        className="bg-background border border-white/10 rounded-lg px-3 py-1 text-sm text-primary focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                    
                    <button
                      onClick={async () => {
                        await NotificationService.testNotification(state.language);
                        setToastMessage(state.language === 'id' ? 'Mencoba mengirim notifikasi tes...' : 'Attempting to send test notification...');
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="w-full py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent font-bold text-xs hover:bg-accent/20 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Bell className="w-4 h-4" />
                      <span>{state.language === 'id' ? 'Tes Notifikasi' : 'Test Notification'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Public Profile Setting */}
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <div>
              <span className="font-bold block">{t('settings.public_profile', state.language)}</span>
              <span className="text-xs text-secondary">{t('settings.public_profile.desc', state.language)}</span>
            </div>
            <button 
              onClick={handleTogglePublicProfile}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${state.isProfilePublic !== false ? 'bg-accent' : 'bg-white/20'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${state.isProfilePublic !== false ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Elite Chart Type Setting */}
          {state.isPremium && (
            <div className="p-4 flex items-center justify-between border-b border-white/5 bg-rose-500/5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <span className="font-bold block text-rose-500">Elite Analysis Chart</span>
                  <span className="text-xs text-secondary">
                    {state.language === 'id' ? 'Pilih jenis grafik analisis mingguan' : 'Choose weekly analysis chart type'}
                  </span>
                </div>
              </div>
              <div className="flex bg-background rounded-lg p-1 border border-white/10">
                <button 
                  id="elite-chart-bar-btn"
                  onClick={() => updateState({ preferredChartType: 'bar' })}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${state.preferredChartType !== 'line' ? 'bg-rose-500 text-white' : 'text-secondary hover:text-primary'}`}
                >
                  BAR
                </button>
                <button 
                  id="elite-chart-line-btn"
                  onClick={() => updateState({ preferredChartType: 'line' })}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${state.preferredChartType === 'line' ? 'bg-rose-500 text-white' : 'text-secondary hover:text-primary'}`}
                >
                  LINE
                </button>
              </div>
            </div>
          )}

          {/* Privacy Policy */}
          <button 
            onClick={() => setIsPrivacyModalOpen(true)}
            className="w-full p-4 flex items-center justify-between text-secondary hover:text-primary hover:bg-white/5 transition-colors border-b border-white/5"
          >
            <span className="font-bold">{t('settings.privacy_policy', state.language)}</span>
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Terms of Service */}
          <button 
            onClick={() => setIsTermsModalOpen(true)}
            className="w-full p-4 flex items-center justify-between text-secondary hover:text-primary hover:bg-white/5 transition-colors border-b border-white/5"
          >
            <span className="font-bold">{t('settings.terms_of_service', state.language)}</span>
            <ChevronRight className="w-5 h-5" />
          </button>

          <button 
            onClick={() => {
              clearCustomMissions();
              setToastMessage(state.language === 'id' ? 'Misi kustom dihapus' : 'Custom missions cleared');
              setTimeout(() => setToastMessage(null), 2000);
            }}
            className="w-full p-4 flex items-center justify-between text-secondary hover:bg-white/5 transition-colors border-b border-white/5"
          >
            <span className="font-bold">{state.language === 'id' ? 'Hapus Misi Kustom' : 'Clear Custom Missions'}</span>
            <Trash2 className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="w-full p-4 flex items-center justify-between text-rose-500 hover:bg-rose-500/10 transition-colors border-b border-white/5"
          >
            <span className="font-bold">{t('settings.reset_progress', state.language)}</span>
            <AlertTriangle className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full p-4 flex items-center justify-between text-rose-600 hover:bg-rose-600/10 transition-colors border-b border-white/5"
          >
            <span className="font-bold">{t('settings.delete_account', state.language)}</span>
            <AlertTriangle className="w-5 h-5" />
          </button>

          <button 
            onClick={onLogout}
            className="w-full p-4 flex items-center justify-between text-accent hover:bg-white/5 transition-colors"
          >
            <span className="font-bold">{t('settings.logout', state.language)}</span>
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
                {t('settings.privacy_policy.title', state.language)}
              </h2>
            </div>
            <div className="p-6 overflow-y-auto text-secondary space-y-4 text-sm">
              <h3 className="text-lg font-bold text-primary">Privacy Policy for ZONE</h3>
              <p>Last updated: April 2026</p>
              <p>ZONE ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by ZONE.</p>
              
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-4">
                <p className="text-primary font-bold mb-2">Full Policy Available Online</p>
                <p className="text-xs mb-3">You can view the complete, detailed privacy policy at our website:</p>
                <a 
                  href="/privacy.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-primary text-background px-4 py-2 rounded-lg font-bold text-xs"
                >
                  OPEN FULL PRIVACY POLICY
                </a>
              </div>

              <h4 className="font-bold text-primary mt-4">1. Information We Collect</h4>
              <p>We collect information you provide directly to us, such as your name, email address, profile picture from Google login, and in-app progress (XP, level, missions completed, ZoneCoins).</p>
              
              <h4 className="font-bold text-primary mt-4">2. How We Use Your Information</h4>
              <p>We use the information to provide, maintain, and improve our services, to personalize your missions, and to display your progress on the global leaderboard.</p>
              
              <h4 className="font-bold text-primary mt-4">3. Data Security</h4>
              <p>We use Google Firebase for secure cloud storage. We take reasonable measures to protect your information from unauthorized access.</p>
              
              <h4 className="font-bold text-primary mt-4">4. Your Rights</h4>
              <p>You have the right to access, update, or delete your personal data at any time through the app settings.</p>
              
              <h4 className="font-bold text-primary mt-4">5. Contact Us</h4>
              <p>If you have any questions about this Privacy Policy, please contact us at zaikiwildan@gmail.com.</p>
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
                {t('settings.terms_of_service.title', state.language)}
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

      {/* Delete Account Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-surface border border-rose-500/20 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black tracking-tight uppercase italic text-rose-500">
                    {t('settings.delete_account', state.language)}
                  </h3>
                  <p className="text-sm text-secondary mt-2">
                    {t('settings.delete_account.desc', state.language)}
                  </p>
                </div>
                
                <div className="w-full space-y-3 pt-4">
                  <button
                    onClick={() => {
                      // In a real app, this would call a backend to delete user data
                      // For now, we'll just logout and reset local state
                      onLogout();
                      setIsDeleteModalOpen(false);
                    }}
                    className="w-full py-4 rounded-2xl bg-rose-500 text-white font-black uppercase italic tracking-wider hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
                  >
                    {t('settings.delete_account.confirm', state.language)}
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="w-full py-4 rounded-2xl bg-white/5 text-secondary font-bold hover:bg-white/10 transition-colors"
                  >
                    {state.language === 'id' ? 'Batalkan' : 'Cancel'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-surface border border-white/10 text-white px-6 py-3 rounded-full shadow-2xl z-[100] whitespace-nowrap text-sm font-bold flex items-center space-x-2"
          >
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
