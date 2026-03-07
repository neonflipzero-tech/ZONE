import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, CheckCircle2, Info, AlertCircle, Swords, ArrowUpCircle } from 'lucide-react';
import { useAppState } from '../store';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { state, markAllNotificationsRead, markNotificationRead } = useAppState();

  if (!state) return null;

  const notifications = state.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Swords': return <Swords className="w-5 h-5 text-red-400" />;
      case 'ArrowUpCircle': return <ArrowUpCircle className="w-5 h-5 text-green-400" />;
      case 'AlertCircle': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-5 h-5 text-blue-400" />;
      default: return <Info className="w-5 h-5 text-accent" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 bg-background flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">Notifications</h2>
                <p className="text-xs text-secondary">{unreadCount} unread</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllNotificationsRead}
                  className="text-xs font-medium text-accent hover:text-accent/80 transition-colors px-3 py-1.5 rounded-full bg-accent/10"
                >
                  Mark all as read
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-2 bg-surface rounded-full border border-white/10 hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <Bell className="w-16 h-16 mb-4 text-secondary" />
                <p className="text-lg font-medium">Tidak ada notifikasi baru</p>
                <p className="text-sm text-secondary mt-1">Kamu sudah membaca semua notifikasi.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => !notif.read && markNotificationRead(notif.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
                    notif.read 
                      ? 'bg-surface/30 border-white/5 opacity-60' 
                      : 'bg-surface border-white/10 shadow-lg shadow-black/20'
                  }`}
                >
                  <div className={`mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notif.read ? 'bg-white/5' : 'bg-white/10'}`}>
                    {getIcon(notif.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-bold text-sm ${notif.read ? 'text-secondary' : 'text-primary'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-secondary whitespace-nowrap ml-2">
                        {new Date(notif.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${notif.read ? 'text-secondary/70' : 'text-secondary'}`}>
                      {notif.description}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-2" />
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
