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
      const randomId = Math.floor(Math.random() * 1000);
      const icon = `https://i.pravatar.cc/300?u=${randomId}`;
      
      if (this.swRegistration) {
        console.log('NotificationService: Using Service Worker to show notification');
        await this.swRegistration.showNotification(title, {
          body,
          tag,
          icon,
          badge: icon,
          vibrate: [100, 50, 100],
          requireInteraction: true
        } as any);
      } else {
        console.log('NotificationService: Service Worker not available, falling back to new Notification()');
        new Notification(title, { body, tag, icon });
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

    // Don't schedule if already completed today
    const hasCompletedToday = state.lastActiveDate === new Date().toDateString();
    if (hasCompletedToday) return;

    const [hours, minutes] = state.notificationTime.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();
    console.log(`Notification scheduled for ${scheduledTime.toLocaleTimeString()} (in ${Math.round(delay / 1000 / 60)} minutes)`);

    const title = state.language === 'id' ? 'Waktunya Lock In! 🧠' : 'Time to Lock In! 🧠';
    const body = state.language === 'id' 
      ? 'Zona lu udah nungguin. Jangan kasih kendor, beresin misi hari ini!' 
      : 'Your zone is waiting. Don\'t slack off, finish your missions today!';

    // Send message to SW to schedule
    if (this.swRegistration && this.swRegistration.active) {
      this.swRegistration.active.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        title,
        body,
        delay: delay,
        tag: 'daily-reminder'
      });
    } else {
      // Fallback to local timeout if SW not active yet
      setTimeout(() => {
        this.sendNotification(title, body, 'daily-reminder');
      }, delay);
    }
  }

  static notifyRivalLevelUp(rivalName: string, level: number, myLevel: number, language: 'en' | 'id') {
    const title = language === 'id' ? 'Rival Makin Kenceng! 🚀' : 'Rival Speeding Up! 🚀';
    const body = language === 'id' 
      ? `${rivalName} baru aja naik ke Level ${level}! Lu mau diem aja disalip? Kejar sekarang!`
      : `${rivalName} just reached Level ${level}! You gonna let them pass you? Catch up now!`;
    
    this.sendNotification(title, body, 'rival-update');
  }

  static notifyStreakAtRisk(streak: number, language: 'en' | 'id') {
    const title = language === 'id' ? 'STREAK LU MAU ANGUS! 🔥' : 'STREAK AT RISK! 🔥';
    const body = language === 'id'
      ? `Hari hampir berakhir! Buruan beresin misi buat selamatin streak ${streak} hari lu.`
      : `The day is almost over! Finish your mission now to save your ${streak}-day streak.`;
    
    this.sendNotification(title, body, 'streak-warning');
  }

  static notifyBadgeUnlocked(badgeName: string, language: 'en' | 'id') {
    const title = language === 'id' ? 'Lencana Baru Unlocked! 🏆' : 'New Badge Unlocked! 🏆';
    const body = language === 'id'
      ? `Gokil! Lu baru aja dapet lencana "${badgeName}". Terus berkembang!`
      : `Incredible! You just earned the "${badgeName}" badge. Keep growing!`;
    
    this.sendNotification(title, body, 'badge-unlocked');
  }

  static notifyRankAchieved(rankName: string, language: 'en' | 'id') {
    const title = language === 'id' ? `Pangkat Baru: ${rankName}! ✨` : `New Rank: ${rankName}! ✨`;
    const body = language === 'id'
      ? `Gila, lu makin elit! Sekarang lu udah jadi "${rankName}".`
      : `You're becoming elite! You are now a "${rankName}".`;
    
    this.sendNotification(title, body, 'rank-achieved');
  }

  static notifyBossDefeated(bossName: string, language: 'en' | 'id') {
    const title = language === 'id' ? 'BOS RATA! 💀' : 'BOSS DEFEATED! 💀';
    const body = language === 'id'
      ? `Lu berhasil bantai ${bossName}! Zona ini sekarang aman berkat lu.`
      : `You successfully crushed ${bossName}! This zone is safe thanks to you.`;
    
    this.sendNotification(title, body, 'boss-defeated');
  }

  static notifyNewBossAppeared(bossName: string, language: 'en' | 'id') {
    const title = language === 'id' ? 'ADA BOS BARU! ⚠️' : 'NEW BOSS APPEARED! ⚠️';
    const body = language === 'id'
      ? `Waspada! ${bossName} muncul di zona lu. Sikat dia sebelum bikin kacau!`
      : `Alert! ${bossName} appeared in your zone. Take them down before they cause chaos!`;
    
    this.sendNotification(title, body, 'boss-appeared');
  }
}
