import { UserState } from "../store";

export class NotificationService {
  private static swRegistration: ServiceWorkerRegistration | null = null;

  static async init() {
    if (typeof window === 'undefined') return;
    
    console.log('NotificationService: Initializing...');
    if ('serviceWorker' in navigator && 'Notification' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.swRegistration = registration;
        console.log('NotificationService: Service Worker registered successfully', registration.scope);
        
        // Check current permission
        console.log('NotificationService: Current permission:', Notification.permission);
      } catch (error) {
        console.error('NotificationService: Service Worker registration failed:', error);
      }
    } else {
      console.warn('NotificationService: Service Worker or Notification API not supported');
    }
  }

  static async requestPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('NotificationService: Notification API not supported in this environment');
      return 'unsupported';
    }
    
    try {
      console.log('NotificationService: Requesting permission...');
      const permission = await Notification.requestPermission();
      console.log('NotificationService: Permission result:', permission);
      return permission;
    } catch (error) {
      console.error('NotificationService: Error requesting notification permission:', error);
      return 'denied';
    }
  }

  static async sendNotification(title: string, body: string, tag: string = 'zone-notification') {
    if (typeof window === 'undefined') return;
    
    if (Notification.permission !== 'granted') {
      console.warn('NotificationService: Cannot send notification, permission is:', Notification.permission);
      return;
    }

    console.log(`NotificationService: Sending notification: "${title}" - "${body}"`);

    try {
      if (this.swRegistration) {
        console.log('NotificationService: Using Service Worker to show notification');
        await this.swRegistration.showNotification(title, {
          body,
          icon: 'https://picsum.photos/seed/zone/192/192',
          badge: 'https://picsum.photos/seed/zone/72/72',
          tag,
          vibrate: [100, 50, 100],
          requireInteraction: true
        } as any);
      } else {
        console.log('NotificationService: Service Worker not available, falling back to new Notification()');
        new Notification(title, { body, tag });
      }
    } catch (error) {
      console.error('NotificationService: Error sending notification:', error);
    }
  }

  static async testNotification(language: 'en' | 'id') {
    const title = language === 'id' ? 'Tes Notifikasi' : 'Test Notification';
    const body = language === 'id' 
      ? 'Jika kamu melihat ini, berarti notifikasi ZONE sudah berfungsi!' 
      : 'If you see this, it means ZONE notifications are working!';
    
    await this.sendNotification(title, body, 'test-notification');
  }

  static scheduleDailyReminder(state: UserState) {
    if (!state.notificationsEnabled || typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const [hours, minutes] = state.notificationTime.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();
    console.log(`Notification scheduled for ${scheduledTime.toLocaleTimeString()} (in ${Math.round(delay / 1000 / 60)} minutes)`);

    // Send message to SW to schedule
    if (this.swRegistration && this.swRegistration.active) {
      this.swRegistration.active.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        title: state.language === 'id' ? 'Waktunya Lock In!' : 'Time to Lock In!',
        body: state.language === 'id' ? 'Misi harianmu sudah siap. Jangan biarkan streak-mu putus!' : 'Your daily missions are ready. Don\'t let your streak break!',
        delay: delay,
        tag: 'daily-reminder'
      });
    } else {
      // Fallback to local timeout if SW not active yet
      setTimeout(() => {
        this.sendNotification(
          state.language === 'id' ? 'Waktunya Lock In!' : 'Time to Lock In!',
          state.language === 'id' ? 'Misi harianmu sudah siap. Jangan biarkan streak-mu putus!' : 'Your daily missions are ready. Don\'t let your streak break!',
          'daily-reminder'
        );
      }, delay);
    }
  }

  static notifyRivalLevelUp(rivalName: string, level: number, myLevel: number, language: 'en' | 'id') {
    const title = language === 'id' ? 'Rival Naik Level!' : 'Rival Level Up!';
    const body = language === 'id' 
      ? `${rivalName} baru saja naik ke Level ${level}! Kamu masih di Level ${myLevel}. Kejar dia!`
      : `${rivalName} just reached Level ${level}! You're still at Level ${myLevel}. Catch up!`;
    
    this.sendNotification(title, body, 'rival-update');
  }

  static notifyStreakAtRisk(streak: number, language: 'en' | 'id') {
    const title = language === 'id' ? 'Streak Dalam Bahaya!' : 'Streak at Risk!';
    const body = language === 'id'
      ? `Hari hampir berakhir! Selesaikan misimu sekarang untuk menjaga streak ${streak} hari kamu.`
      : `The day is almost over! Complete your mission now to save your ${streak}-day streak.`;
    
    this.sendNotification(title, body, 'streak-warning');
  }

  static notifyBadgeUnlocked(badgeName: string, language: 'en' | 'id') {
    const title = language === 'id' ? 'Lencana Baru Dibuka!' : 'New Badge Unlocked!';
    const body = language === 'id'
      ? `Selamat! Kamu baru saja mendapatkan lencana "${badgeName}".`
      : `Congratulations! You just earned the "${badgeName}" badge.`;
    
    this.sendNotification(title, body, 'badge-unlocked');
  }

  static notifyRankAchieved(rankName: string, language: 'en' | 'id') {
    const title = language === 'id' ? 'Pangkat Baru Dicapai!' : 'New Rank Achieved!';
    const body = language === 'id'
      ? `Luar biasa! Kamu sekarang adalah seorang "${rankName}".`
      : `Incredible! You are now a "${rankName}".`;
    
    this.sendNotification(title, body, 'rank-achieved');
  }

  static notifyBossDefeated(bossName: string, language: 'en' | 'id') {
    const title = language === 'id' ? 'Bos Dikalahkan!' : 'Boss Defeated!';
    const body = language === 'id'
      ? `Kamu berhasil mengalahkan ${bossName}! Keadilan telah ditegakkan.`
      : `You successfully defeated ${bossName}! Justice has been served.`;
    
    this.sendNotification(title, body, 'boss-defeated');
  }

  static notifyNewBossAppeared(bossName: string, language: 'en' | 'id') {
    const title = language === 'id' ? 'Bos Baru Muncul!' : 'New Boss Appeared!';
    const body = language === 'id'
      ? `Waspada! ${bossName} telah muncul di zona kamu. Kalahkan dia sebelum terlambat!`
      : `Alert! ${bossName} has appeared in your zone. Defeat them before it's too late!`;
    
    this.sendNotification(title, body, 'boss-appeared');
  }
}
