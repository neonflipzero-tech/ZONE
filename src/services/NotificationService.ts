import { UserState } from "../store";

export class NotificationService {
  private static swRegistration: ServiceWorkerRegistration | null = null;

  static async init() {
    if (typeof window === 'undefined') return;
    
    if ('serviceWorker' in navigator && 'Notification' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.swRegistration = registration;
        console.log('Service Worker registered');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  static async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  static async sendNotification(title: string, body: string, tag: string = 'zone-notification') {
    if (typeof window === 'undefined' || Notification.permission !== 'granted') return;

    try {
      if (this.swRegistration) {
        await this.swRegistration.showNotification(title, {
          body,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag
        });
      } else {
        new Notification(title, { body, tag });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
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
