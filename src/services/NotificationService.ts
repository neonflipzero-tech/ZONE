import { UserState } from "../store";

export class NotificationService {
  private static swRegistration: ServiceWorkerRegistration | null = null;

  static async init() {
    if (typeof window === 'undefined') return;
    
    console.log('NotificationService: Initializing...');
    try {
      if ('serviceWorker' in navigator && 'Notification' in window) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.swRegistration = registration;
        console.log('NotificationService: Service Worker registered successfully', registration.scope);
        
        // Check current permission
        console.log('NotificationService: Current permission:', Notification.permission);
      } else {
        console.warn('NotificationService: Service Worker or Notification API not supported');
      }
    } catch (error) {
      console.error('NotificationService: Service Worker registration failed:', error);
    }
  }

  static async requestPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('NotificationService: Notification API not supported in this environment');
      return 'unsupported';
    }
    
    try {
      console.log('NotificationService: Requesting permission...');
      // Some browsers might not support the promise-based requestPermission
      if (typeof Notification.requestPermission !== 'function') {
        return 'unsupported';
      }
      
      const permission = await Notification.requestPermission();
      console.log('NotificationService: Permission result:', permission);
      return permission;
    } catch (error) {
      console.error('NotificationService: Error requesting notification permission:', error);
      return 'denied';
    }
  }

  static async sendNotification(title: string, body: string, tag: string = 'zone-notification') {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    
    if (Notification.permission !== 'granted') {
      console.warn('NotificationService: Cannot send notification, permission is:', Notification.permission);
      return;
    }

    console.log(`NotificationService: Sending notification: "${title}" - "${body}"`);

    try {
      const icon = 'https://picsum.photos/seed/zone/192/192';
      
      // Ensure we have a registration and it's ready
      let registration = this.swRegistration;
      if (!registration && 'serviceWorker' in navigator) {
        registration = await navigator.serviceWorker.ready;
        this.swRegistration = registration;
      }

      if (registration && 'showNotification' in registration) {
        // Check if there's an active worker
        if (!registration.active) {
          console.warn('NotificationService: Service Worker registration found but no active worker yet. Waiting for ready...');
          registration = await navigator.serviceWorker.ready;
        }

        if (registration.active) {
          console.log('NotificationService: Using Service Worker to show notification');
          await registration.showNotification(title, {
            body,
            tag,
            icon,
            badge: icon,
            vibrate: [100, 50, 100],
            requireInteraction: true
          } as any);
          return;
        }
      }

      // Fallback to new Notification() if SW is not ready or supported
      console.log('NotificationService: Service Worker not active or showNotification not supported, falling back to new Notification()');
      try {
        // iOS doesn't support new Notification() in some versions, but let's try
        new Notification(title, { body, tag, icon });
      } catch (e) {
        console.warn('NotificationService: new Notification() failed, likely unsupported on this device:', e);
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
    const sendMessage = async () => {
      let registration = this.swRegistration;
      if (!registration && 'serviceWorker' in navigator) {
        registration = await navigator.serviceWorker.ready;
        this.swRegistration = registration;
      }

      if (registration && registration.active) {
        registration.active.postMessage({
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
    };

    sendMessage();
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

  static notifyExitImmediate(language: 'en' | 'id') {
    const variations = language === 'id' ? [
      {
        title: 'Istirahat sejenak, jangan kebablasan! 🌬️',
        body: 'Fokus lu mahal harganya. Ambil napas, tapi jangan biarkan target lu kabur.'
      },
      {
        title: 'Zone nunggu lu! 👋',
        body: 'Jangan kelamaan di luar sana kalau mau OVR naik. Balik lagi pas udah seger.'
      },
      {
        title: 'Cas energi lu cepet! 🔋',
        body: 'Dunia gak nungguin orang yang kelamaan istirahat. Recharge, lalu balik tempur.'
      },
      {
        title: 'Jangan puas dulu! ✨',
        body: 'Ini baru awal. Jangan biarkan momentum lu ilang cuma gara-gara santai berlebihan.'
      },
      {
        title: 'Pikiran butuh udara! 🧠',
        body: 'Menjauh bentar biar seger, tapi inget: misi lu belum selesai. Balik segera.'
      },
      {
        title: 'Istirahat itu alat, bukan tujuan! 🛋️',
        body: 'Gunakan waktu ini buat pulih, bukan buat jadi males. Zone tetep prioritas.'
      },
      {
        title: 'Minum, napas, lalu balik! ☕',
        body: 'Jeda ini cuma buat transisi. Jangan biarkan rasa malas mulai merayap masuk.'
      },
      {
        title: 'Misi di-pause, bukan di-stop! ⏸️',
        body: 'Lu masih punya tanggung jawab di sini. Beresin urusan luar, lalu Lock In lagi.'
      },
      {
        title: 'Beresin urusan fisik! 🧘',
        body: 'Sehat itu wajib buat grinding. Udah regangan? Sekarang balik ke mental.'
      },
      {
        title: 'Disiplin gak ada hari libur! 🌊',
        body: 'Tenang boleh, santai jangan. Konsistensi lu lagi diuji sekarang. Balik lagi!'
      }
    ] : [
      {
        title: 'Break, but don\'t drift! 🌬️',
        body: 'Your focus is expensive. Take a breath, but don\'t let your targets escape.'
      },
      {
        title: 'The Zone is waiting! 👋',
        body: 'Don\'t stay out too long if you want that OVR to climb. Come back fresh.'
      },
      {
        title: 'Recharge fast! 🔋',
        body: 'The world doesn\'t wait for slow resters. Recharge, then get back to battle.'
      },
      {
        title: 'Don\'t get comfortable! ✨',
        body: 'This is just the start. Don\'t lose your momentum by relaxing too much.'
      },
      {
        title: 'Mind needs air, not laziness! 🧠',
        body: 'Step away to refresh, but remember: your mission isn\'t over. Return soon.'
      },
      {
        title: 'Rest is a tool, not a goal! 🛋️',
        body: 'Use this time to recover, not to get lazy. The Zone remains the priority.'
      },
      {
        title: 'Drink, breathe, then return! ☕',
        body: 'This break is just a transition. Don\'t let laziness start creeping in.'
      },
      {
        title: 'Paused, not stopped! ⏸️',
        body: 'You still have responsibilities here. Finish your business, then Lock In again.'
      },
      {
        title: 'Fix your body, then your mind! 🧘',
        body: 'Health is mandatory for grinding. Stretched yet? Now get back to work.'
      },
      {
        title: 'Discipline has no days off! 🌊',
        body: 'Stay calm, but don\'t get soft. Your consistency is being tested. Get back!'
      }
    ];

    const randomVariation = variations[Math.floor(Math.random() * variations.length)];
    this.sendNotification(randomVariation.title, randomVariation.body, 'exit-immediate');
  }

  static scheduleExitDelayed(language: 'en' | 'id', hasRival: boolean = false) {
    const variations = language === 'id' ? [
      {
        title: 'Capek? Lemah! 💤',
        body: 'Inget kenapa lu mulai. Balik sekarang atau nyesel liat progres lu stuck.'
      },
      {
        title: 'Masih rebahan? 🛑',
        body: 'Rival lu udah dapet 100 XP pas lu lagi scroll medsos. Balik ke Zone sekarang!',
        requiresRival: true
      },
      {
        title: 'Mood itu buat amatir! 🤔',
        body: 'Profesional tetep jalan walau lagi males. Jangan manja, beresin misi lu!'
      },
      {
        title: 'Pecundang cari alasan! 🔥',
        body: 'Pemenang cari jalan. Lu mau jadi yang mana? Buktiin dengan balik grinding!'
      },
      {
        title: 'Masa depan lu gak bakal dateng! 🚀',
        body: 'Gak bakal ada hasil kalau lu cuma mimpi sambil tidur. Gerak sekarang!'
      },
      {
        title: 'Gak ada kata nyerah! ⚔️',
        body: 'Nyerah itu buat orang kalah. Bangun dan sikat sisa misi lu tanpa tapi!'
      },
      {
        title: 'Detik demi detik ilang! ⏰',
        body: 'Lu mau jadi sampah atau jadi legenda? Waktu gak bakal nungguin lu balik.'
      },
      {
        title: 'Mimpi lu cuma halusinasi! 🌟',
        body: 'Kalau lu kelamaan tidur, mimpi lu bakal ilang. Bangun dan wujudkan sekarang!'
      },
      {
        title: 'Dunia udah penuh orang rata-rata! 📈',
        body: 'Jangan nambahin jumlah mereka. Lu didesain buat jadi elit. Balik tempur!'
      },
      {
        title: 'Jangan manja sama males! 👣',
        body: 'Satu misi lagi buat OVR naik. Sikat rasa males lu sebelum dia ngerusak lu!'
      }
    ] : [
      {
        title: 'Tired? Weak! 💤',
        body: 'Remember why you started. Get back now or regret seeing your progress stuck.'
      },
      {
        title: 'Still lying around? 🛑',
        body: 'Your rival earned 100 XP while you were scrolling. Get back to the Zone now!',
        requiresRival: true
      },
      {
        title: 'Mood is for amateurs! 🤔',
        body: 'Professionals work even when they\'re lazy. Don\'t be soft, finish your mission!'
      },
      {
        title: 'Losers make excuses! 🔥',
        body: 'Winners find a way. Which one are you? Prove it by getting back to grinding!'
      },
      {
        title: 'Your future won\'t arrive! 🚀',
        body: 'There will be no results if you just dream while sleeping. Move now!'
      },
      {
        title: 'No such thing as quitting! ⚔️',
        body: 'Quitting is for losers. Get up and crush the rest of your missions, no excuses!'
      },
      {
        title: 'Seconds are slipping away! ⏰',
        body: 'Do you want to be trash or a legend? Time won\'t wait for you to return.'
      },
      {
        title: 'Your dreams are hallucinations! 🌟',
        body: 'If you sleep too long, your dreams will vanish. Wake up and make them real!'
      },
      {
        title: 'The world is full of average people! 📈',
        body: 'Don\'t add to their numbers. You were designed to be elite. Get back to battle!'
      },
      {
        title: 'Don\'t baby your laziness! 👣',
        body: 'One more mission for an OVR boost. Crush your laziness before it crushes you!'
      }
    ];

    const filteredVariations = variations.filter(v => !(v as any).requiresRival || hasRival);
    const randomVariation = filteredVariations[Math.floor(Math.random() * filteredVariations.length)];
    const delay = 20 * 60 * 1000; // 20 minutes

    const sendMessage = async () => {
      let registration = this.swRegistration;
      if (!registration && 'serviceWorker' in navigator) {
        registration = await navigator.serviceWorker.ready;
        this.swRegistration = registration;
      }

      if (registration && registration.active) {
        registration.active.postMessage({
          type: 'SCHEDULE_NOTIFICATION',
          title: randomVariation.title,
          body: randomVariation.body,
          delay: delay,
          tag: 'exit-delayed'
        });
      }
    };

    sendMessage();
  }

  static cancelExitDelayed() {
    const sendMessage = async () => {
      let registration = this.swRegistration;
      if (!registration && 'serviceWorker' in navigator) {
        registration = await navigator.serviceWorker.ready;
        this.swRegistration = registration;
      }

      if (registration && registration.active) {
        registration.active.postMessage({
          type: 'CANCEL_NOTIFICATION',
          tag: 'exit-delayed'
        });
      }
    };

    sendMessage();
  }

  static notifyTimerProgress(timeLeft: number, language: 'en' | 'id') {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const title = language === 'id' ? 'Misi Sedang Berjalan! ⏳' : 'Mission in Progress! ⏳';
    const body = language === 'id'
      ? `Sisa waktu: ${timeStr}. Jangan menyerah!`
      : `Time left: ${timeStr}. Keep going!`;
    
    this.sendNotification(title, body, 'timer-progress');
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
