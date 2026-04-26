import { UserState, PathType } from "../store";

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

    const getRandomMessage = (path: PathType | null, language: 'en' | 'id') => {
      const messages: Record<string, { title: string, body: string }[]> = {
        MENTAL_HEALTH: [
          {
            title: language === 'id' ? 'Waktunya Self-Check! 🌱' : 'Time for a Self-Check! 🌱',
            body: language === 'id' 
              ? 'Luangkan waktu sejenak untuk kesehatan mentalmu. Beresin misi mindfulness hari ini!'
              : 'Take a moment for your mental well-being. Complete your missions today!'
          },
          {
            title: language === 'id' ? 'Tarik napas dulu... 🌬️' : 'Just breathe... 🌬️',
            body: language === 'id'
              ? 'Hari ini mungkin berat, tapi misi mindfulness lu bisa bantu tenangin pikiran.'
              : 'Today might be tough, but your mindfulness mission can help you reset.'
          },
          {
            title: language === 'id' ? 'Mental lu prioritas. 🧘' : 'Mind needs air. 🧠',
            body: language === 'id'
              ? 'Jangan paksa diri, kerjakan misi refleksi atau meditasi sekarang.'
              : 'Don\'t push too hard. Take 5 minutes for reflection in the Zone.'
          },
          {
            title: language === 'id' ? 'Apa kabar hari ini? ✨' : 'How are you today? ✨',
            body: language === 'id'
              ? 'Kadang berhenti sejenak itu progres. Cek misi mental health lu.'
              : 'Sometimes stopping is progress. Check your mental health missions now.'
          },
          {
            title: language === 'id' ? 'Lu berharga, Ki. 💎' : 'You matter, Ki. 💎',
            body: language === 'id'
              ? 'Jaga kesehatan mentalmu dengan beresin misi simpel hari ini.'
              : 'Protect your mind by finishing your simple tasks today.'
          },
          {
            title: language === 'id' ? 'Tenangkan badai di hati. 🌊' : 'Calm the storm. 🌊',
            body: language === 'id'
              ? 'Dunia bisa bising, tapi Zone tetap tenang. Balik ke misi kedamaianmu.'
              : 'The world is loud, but the Zone is calm. Return to your peace mission.'
          },
          {
            title: language === 'id' ? 'Cahaya di ujung hari. 🕯️' : 'Light at day\'s end. 🕯️',
            body: language === 'id'
              ? 'Beresin satu misi mental health buat nutup hari dengan perasaan lega.'
              : 'Finish one mental health mission to close your day with relief.'
          },
          {
            title: language === 'id' ? 'Biarkan pikiran lewat. ☁️' : 'Let thoughts pass. ☁️',
            body: language === 'id'
              ? 'Jangan dipendam. Misi refleksi nungguin buat membantu lu ngelepas beban.'
              : 'Don\'t suppress it. Your reflection mission is waiting to help release the weight.'
          },
          {
            title: language === 'id' ? 'Keberanian untuk diam. 🦁' : 'Courage in silence. 🦁',
            body: language === 'id'
              ? 'Butuh mental kuat buat berani jujur sama diri sendiri. Mulai misinya!'
              : 'It takes strong mental grit to be honest with yourself. Start the mission!'
          },
          {
            title: language === 'id' ? 'Segarkan jiwa. 🍃' : 'Refresh your soul. 🍃',
            body: language === 'id'
              ? 'Keluar dari distraksi, masuk ke mode tenang. Zone nunggu lu balik.'
              : 'Step away from distractions, enter calm mode. The Zone awaits.'
          }
        ],
        STRONGER: [
          {
            title: language === 'id' ? 'Bakar kalori, Ki! 🔥' : 'Burn those calories! 🔥',
            body: language === 'id'
              ? 'Tubuh lu butuh tantangan fisik sekarang. Jangan kasih kendor!'
              : 'Your body needs a challenge. No excuses today!'
          },
          {
            title: language === 'id' ? 'Latihan atau Nyesel. 💪' : 'Train or Regret. 💪',
            body: language === 'id'
              ? 'Rival lu mungkin lagi grinding fisik. Lu mau diem aja disalip?'
              : 'Your rival might be working out right now. Don\'t stay behind!'
          },
          {
            title: language === 'id' ? 'Rasa sakit itu sementara. ⚡' : 'Pain is temporary. ⚡',
            body: language === 'id'
              ? 'Level up fisik lu di Zone. OVR fisik nunggu naik!'
              : 'Level up your physique. Physical OVR is waiting for you!'
          },
          {
            title: language === 'id' ? 'Keringat itu emas. 💦' : 'Sweat is gold. 💦',
            body: language === 'id'
              ? 'Tukar keringat lu dengan progres nyata di Zone hari ini.'
              : 'Exchange your effort for real progress in the Zone today.'
          },
          {
            title: language === 'id' ? 'Push Your Limit! 💪' : 'Push Your Limit! 💪',
            body: language === 'id'
              ? 'Fisik lu butuh tantangan. Ayo bakar kalori dan beresin misi fisik hari ini!'
              : 'Your body needs a challenge. Burn those calories and finish your physical missions!'
          },
          {
            title: language === 'id' ? 'Besi menajamkan besi. ⚔️' : 'Iron sharpens iron. ⚔️',
            body: language === 'id'
              ? 'Lu gak bakal makin kuat kalau cuma duduk. Angkat misi fisik lu!'
              : 'You won\'t get stronger just sitting. Pick up your physical mission!'
          },
          {
            title: language === 'id' ? 'Evolusi tubuh. 🧬' : 'Body evolution. 🧬',
            body: language === 'id'
              ? 'Setiap gerakan bawa lu makin deket ke versi terbaik. Jangan skip hari ini.'
              : 'Every movement brings you closer to your best version. Don\'t skip today.'
          },
          {
            title: language === 'id' ? 'Taklukkan diri sendiri. 🏔️' : 'Conquer yourself. 🏔️',
            body: language === 'id'
              ? 'Fisik yang kuat lahir dari mental yang berani capek. Sikat misinya!'
              : 'A strong physique is born from a mind that dares to be tired. Crush it!'
          },
          {
            title: language === 'id' ? 'Mesin tubuh butuh bensin. 🚀' : 'Body machine needs fuel. 🚀',
            body: language === 'id'
              ? 'Gerak sekarang biar metabolisme dan OVR lu melonjak.'
              : 'Move now to boost your metabolism and OVR.'
          },
          {
            title: language === 'id' ? 'Jangan jadi domba. 🐺' : 'Don\'t be a sheep. 🐺',
            body: language === 'id'
              ? 'Jadilah serigala yang haus progres fisik. Balik ke Zone dan tempur!'
              : 'Be a wolf hungry for physical progress. Get back to the Zone and fight!'
          }
        ],
        PRODUCTIVE: [
          {
            title: language === 'id' ? 'Mode Produktif: ON! 🚀' : 'Productive Mode: ON! 🚀',
            body: language === 'id'
              ? 'Dunia gak nungguin orang males. Sikat misi produktifitas lu sekarang!'
              : 'The world doesn\'t wait for the lazy. Crush your productivity missions now!'
          },
          {
            title: language === 'id' ? 'Stop Scroll, Start Grind. 📱' : 'Stop Scrolling. 📱',
            body: language === 'id'
              ? 'Fokus lu dicuri medsos. Ambil balik fokus lu di Zone!'
              : 'Your focus is being stolen. Reclaim it in the Zone right now!'
          },
          {
            title: language === 'id' ? 'Sukses butuh eksekusi. 🎯' : 'Execution is everything. 🎯',
            body: language === 'id'
              ? 'Jangan cuma rencana, buktiin dengan nyelesain target hari ini.'
              : 'Don\'t just plan, prove it by finishing your targets today.'
          },
          {
            title: language === 'id' ? 'Jadilah mesin progres. ⚙️' : 'Be a progress machine. ⚙️',
            body: language === 'id'
              ? 'Efisiensi lu diuji lewat misi produktifitas hari ini. Beresin!'
              : 'Your efficiency is being tested. Complete your tasks now!'
          },
          {
            title: language === 'id' ? 'Kerja cerdas, Ki. 💡' : 'Work smart, work hard. 💡',
            body: language === 'id'
              ? 'Beresin misi produktivitas buat OVR intelektual melonjak.'
              : 'Finish your productivity missions to boost your intellect OVR.'
          },
          {
            title: language === 'id' ? 'Waktu itu berlian. 💎' : 'Time is a diamond. 💎',
            body: language === 'id'
              ? 'Lu gak bakal dapet 10 menit ini lagi. Pake buat beresin misi produktif!'
              : 'You won\'t get these 10 minutes back. Use them for your productivity mission!'
          },
          {
            title: language === 'id' ? 'Selesaikan puzzle harimu. 🧩' : 'Finish your daily puzzle. 🧩',
            body: language === 'id'
              ? 'Misi produktivitas adalah potongan puzzle kesuksesan lu. Pasang sekarang.'
              : 'Productivity missions are pieces of your success puzzle. Fit them in now.'
          },
          {
            title: language === 'id' ? 'Badai eksekusi. 🌪️' : 'Execution storm. 🌪️',
            body: language === 'id'
              ? 'Jadilah orang yang paling cepet nyelesain masalah. Mulai misinya di Zone!'
              : 'Be the one who solves problems the fastest. Start the mission in the Zone!'
          },
          {
            title: language === 'id' ? 'Bangun kerajaanmu. 🏰' : 'Build your kingdom. 🏰',
            body: language === 'id'
              ? 'Setiap misi produktif adalah batu bata buat masa depan lu. Jangan berhenti.'
              : 'Every productive mission is a brick for your future. Don\'t stop.'
          },
          {
            title: language === 'id' ? '🏹 Fokus satu titik.' : 'Focus on one point. 🏹',
            body: language === 'id'
              ? 'Hilangkan gangguan, fokus ke satu misi produktif. Lock In sekarang!'
              : 'Remove distractions, focus on one productive mission. Lock In now!'
          }
        ],
        DISCIPLINE: [
          {
            title: language === 'id' ? 'Uji Disiplin Lu! ⚔️' : 'Test Your Discipline! ⚔️',
            body: language === 'id'
              ? 'Konsistensi adalah kunci elit. Jangan biarkan streak lu putus!'
              : 'Consistency is the key to elite status. Don\'t let your streak break!'
          },
          {
            title: language === 'id' ? 'Streak lu taruhannya! 🔥' : 'Streak at risk! 🔥',
            body: language === 'id'
              ? `Udah hari ke-${state.streak} nih, masa mau angus gitu aja? Lock In!`
              : `You've reached ${state.streak} days, don't let it go to waste. Lock In!`
          },
          {
            title: language === 'id' ? 'Disiplin > Motivasi. 🛠️' : 'Discipline > Motivation. 🛠️',
            body: language === 'id'
              ? 'Gak peduli lagi males atau mood ancur, tetep sikat misi hari ini.'
              : 'Doesn\'t matter if you\'re tired or lazy. Finish the mission now.'
          },
          {
            title: language === 'id' ? 'Janji adalah hutang. 🤝' : 'A promise is a debt. 🤝',
            body: language === 'id'
              ? 'Lu janji mau berubah, Ki. Buktiin dengan beresin satu misi hari ini.'
              : 'You promised to change, Ki. Prove it with one mission today.'
          },
          {
            title: language === 'id' ? 'Gak ada libur buat elit. 🏴' : 'No days off for elite. 🏴',
            body: language === 'id'
              ? 'Orang biasa istirahat pas males, orang elit tetep jalan. Balik ke Zone!'
              : 'Average people rest when lazy, the elite keep going. Get back!'
          },
          {
            title: language === 'id' ? 'Jadi batu karang. 🗿' : 'Be a rock. 🗿',
            body: language === 'id'
              ? 'Jangan goyah sama godaan males. Disiplin adalah karakter lu sekarang.'
              : 'Don\'t sway to the temptation of laziness. Discipline is your character now.'
          },
          {
            title: language === 'id' ? 'Pilih bebanmu. ⚖️' : 'Choose your burden. ⚖️',
            body: language === 'id'
              ? 'Beban disiplin atau beban penyesalan? Balik ke Zone dan pilih disiplin.'
              : 'The weight of discipline or the weight of regret? Choose discipline.'
          },
          {
            title: language === 'id' ? 'Rantai konsistensi. ⛓️' : 'Chain of consistency. ⛓️',
            body: language === 'id'
              ? 'Jangan putus rantai streak lu. Satu misi simpel nunggu buat disikat.'
              : 'Don\'t break your streak chain. One simple mission is waiting.'
          },
          {
            title: language === 'id' ? 'Jaga posmu. 💂' : 'Guard your post. 💂',
            body: language === 'id'
              ? 'Zone adalah markas disiplin lu. Jangan biarkan area ini kosong tanpa progres.'
              : 'The Zone is your discipline base. Don\'t let this area be empty of progress.'
          },
          {
            title: language === 'id' ? 'Mentalitas Prajurit. 🎖️' : 'Warrior Mentality. 🎖️',
            body: language === 'id'
              ? 'Terus maju walau berat. Itulah definisi disiplin sejati. Selesaikan misinya!'
              : 'Keep going even when it\'s hard. That\'s true discipline. Finish it!'
          }
        ],
        SOCIAL: [
          {
            title: language === 'id' ? 'Connect via Zone! 🤝' : 'Connect via Zone! 🤝',
            body: language === 'id'
              ? 'Energi sosial lu lagi diuji. Beresin misi interaksi lu hari ini!'
              : 'Your social energy is being tested. Finish your interaction missions today!'
          },
          {
            title: language === 'id' ? 'Jangan jadi kuper, Ki. 👥' : 'Don\'t isolate yourself. 👥',
            body: language === 'id'
              ? 'Skill sosial itu kyk otot, harus dilatih. Sikat misi sosial lu!'
              : 'Social skills are like muscles, train them. Start the mission!'
          },
          {
            title: language === 'id' ? 'Komunikasi itu skill elit. 🗣️' : 'Communication is key. 🗣️',
            body: language === 'id'
              ? 'Asah kemampuan bicara lu lewat tantangan sosial hari ini.'
              : 'Sharpen your speaking skills with today\'s social challenge.'
          },
          {
            title: language === 'id' ? 'Networking Mode: ON. 🕸️' : 'Networking Mode. 🕸️',
            body: language === 'id'
              ? 'Selesaikan misi sosial buat perluas pengaruh lu di dunia nyata.'
              : 'Complete social missions to expand your influence in real life.'
          },
          {
            title: language === 'id' ? 'Jadilah magnet orang. 🧲' : 'Be a people magnet. 🧲',
            body: language === 'id'
              ? 'Karisma lu naik setiap kali misi sosial beres. Jangan skip!'
              : 'Your charisma grows every time a social mission is cleared.'
          },
          {
            title: language === 'id' ? 'Pahami panggungmu. 🎭' : 'Understand your stage. 🎭',
            body: language === 'id'
              ? 'Dunia adalah panggung sosial. Pelajari perannya lewat misi hari ini.'
              : 'The world is a social stage. Learn your role through missions today.'
          },
          {
            title: language === 'id' ? 'Pancarkan auramu. 🌟' : 'Radiate your aura. 🌟',
            body: language === 'id'
              ? 'Interaksi positif bawa energi baru. Beresin misi sosial lu sekarang.'
              : 'Positive interactions bring new energy. Finish your social mission now.'
          },
          {
            title: language === 'id' ? 'Bangun jembatan. 🏗️' : 'Build bridges. 🏗️',
            body: language === 'id'
              ? 'Jangan cuma diem di zona nyaman. Hubungkan dirimu dengan misi sosial.'
              : 'Don\'t just stay in your comfort zone. Connect through social missions.'
          },
          {
            title: language === 'id' ? 'Suaramu berharga. 📢' : 'Your voice matters. 📢',
            body: language === 'id'
              ? 'Latih kepercayaan diri lewat tantangan interaksi di Zone hari ini.'
              : 'Practice confidence through interaction challenges in the Zone today.'
          },
          {
            title: language === 'id' ? 'Juara di hati orang. 🥇' : 'Champion of hearts. 🥇',
            body: language === 'id'
              ? 'Karakter lu dinilai dari cara lu berinteraksi. Level up di misi sosial!'
              : 'Your character is judged by how you interact. Level up social missions!'
          }
        ]
      };

      const pathKey = path || 'PRODUCTIVE';
      const pathVariations = messages[pathKey] || messages['PRODUCTIVE'];
      return pathVariations[Math.floor(Math.random() * pathVariations.length)];
    };

    const { title, body } = getRandomMessage(state.chosenPath, state.language);

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
          this.sendNotification(title, body, 'daily-reminder').catch(e => console.error("Fallback notification failed:", e));
        }, delay);
      }
    };

    sendMessage().catch(err => console.error('NotificationService: Error in sendMessage:', err));
  }

  static notifyRivalLevelUp(rivalName: string, level: number, myLevel: number, language: 'en' | 'id') {
    const title = language === 'id' ? 'Rival Makin Kenceng! 🚀' : 'Rival Speeding Up! 🚀';
    const body = language === 'id' 
      ? `${rivalName} baru aja naik ke Level ${level}! Lu mau diem aja disalip? Kejar sekarang!`
      : `${rivalName} just reached Level ${level}! You gonna let them pass you? Catch up now!`;
    
    this.sendNotification(title, body, 'rival-update').catch(err => console.error('NotificationService: Error sending rival level up notification:', err));
  }

  static notifyStreakAtRisk(streak: number, language: 'en' | 'id') {
    const title = language === 'id' ? 'STREAK LU MAU ANGUS! 🔥' : 'STREAK AT RISK! 🔥';
    const body = language === 'id'
      ? `Hari hampir berakhir! Buruan beresin misi buat selamatin streak ${streak} hari lu.`
      : `The day is almost over! Finish your mission now to save your ${streak}-day streak.`;
    
    this.sendNotification(title, body, 'streak-warning').catch(err => console.error('NotificationService: Error sending streak warning notification:', err));
  }

  static notifyBadgeUnlocked(badgeName: string, language: 'en' | 'id') {
    const title = language === 'id' ? 'Lencana Baru Terbuka! 🏆' : 'New Badge Unlocked! 🏆';
    const body = language === 'id'
      ? `Gokil! Lu baru aja dapet lencana "${badgeName}". Terus berkembang!`
      : `Incredible! You just earned the "${badgeName}" badge. Keep growing!`;
    
    this.sendNotification(title, body, 'badge-unlocked').catch(err => console.error('NotificationService: Error sending badge unlocked notification:', err));
  }

  static notifyRankAchieved(rankName: string, language: 'en' | 'id') {
    const title = language === 'id' ? `Pangkat Baru: ${rankName}! ✨` : `New Rank: ${rankName}! ✨`;
    const body = language === 'id'
      ? `Gila, lu makin elit! Sekarang lu udah jadi "${rankName}".`
      : `You're becoming elite! You are now a "${rankName}".`;
    
    this.sendNotification(title, body, 'rank-achieved').catch(err => console.error('NotificationService: Error sending rank achieved notification:', err));
  }

  static notifyExitImmediate(language: 'en' | 'id', path?: PathType | null) {
    const isMentalHealth = path === 'MENTAL_HEALTH';
    
    const variations = language === 'id' ? (isMentalHealth ? [
      {
        title: 'Bernapas dulu, Ki. 🌬️',
        body: 'Ambil jeda sejenak buat tenangin pikiran. Zone nungguin lu balik pas udah sejuk.'
      },
      {
        title: 'Mental lu butuh istirahat. 🧘',
        body: 'Jauhi layar bentar, hirup udara segar. Inget misi mindfulness lu belum beres.'
      },
      {
        title: 'Lu udah kerja bagus hari ini. ✨',
        body: 'Recharge energi mental lu. Kabari gue kalau lu udah siap buat lanjut lagi.'
      }
    ] : [
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
    ]) : (isMentalHealth ? [
      {
        title: 'Breathe, Ki. 🌬️',
        body: 'Take a short break to calm your mind. The Zone waits for you to return when you\'re cool.'
      },
      {
        title: 'Your mind needs rest. 🧘',
        body: 'Step away from the screen, breathe fresh air. Remember your mindfulness mission.'
      },
      {
        title: 'You\'ve done great today. ✨',
        body: 'Recharge your mental energy. Let me know when you\'re ready to continue.'
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
    ]);

    const randomVariation = variations[Math.floor(Math.random() * variations.length)];
    this.sendNotification(randomVariation.title, randomVariation.body, 'exit-immediate').catch(err => console.error('NotificationService: Error sending exit immediate notification:', err));
  }

  static scheduleExitDelayed(language: 'en' | 'id', hasRival: boolean = false, consecutiveFailures: number = 0, path?: PathType | null) {
    const isSupportive = consecutiveFailures >= 3;

    const variations = language === 'id' ? (isSupportive ? [
      {
        title: 'Gak apa-apa buat jatuh, Ki. 👋',
        body: '3 hari ini berat ya? Jangan nyerah sama keadaan. Zone masih nunggu lu buat bangkit pelan-pelan.'
      },
      {
        title: 'Gue tau lu bisa lebih dari ini. 🔥',
        body: 'Momentum lu emang lagi turun, tapi disiplin lu gak boleh mati. Sikat 1 misi aja buat hari ini!'
      },
      {
        title: 'Nyerah bukan gaya lu, kan? ⚡',
        body: 'Balik ke Zone. Gak perlu sempurna, yang penting gerak. Lu masih punya ambisi itu!'
      },
      {
        title: 'Capek itu wajar, berhenti itu janggal. 🛋️',
        body: 'Udah cukup istirahatnya. Ayo buktiin kalau lu masih punya kontrol atas hidup lu sendiri.'
      }
    ] : [
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
    ]) : (isSupportive ? [
      {
        title: 'It\'s okay to fall. 👋',
        body: 'These 3 days been tough? Don\'t give up. The Zone is waiting for you to return slowly.'
      },
      {
        title: 'I know you\'re better than this. 🔥',
        body: 'Momentum is down, but your discipline shouldn\'t die. Just finish 1 mission today!'
      },
      {
        title: 'Quitting isn\'t your style, right? ⚡',
        body: 'Back to the Zone. Doesn\'t have to be perfect, just move. You still have that ambition!'
      },
      {
        title: 'Tired is normal, stopping is weird. 🛋️',
        body: 'Enough rest. Prove you still have control over your own life.'
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
    ]);

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

        // Schedule 1h, 2h and 12h reminders
        this.scheduleLongTermReminders(language);
      }
    };

    sendMessage().catch(err => console.error('NotificationService: Error in scheduleExitDelayed sendMessage:', err));
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
        registration.active.postMessage({
          type: 'CANCEL_NOTIFICATION',
          tag: 'exit-1h'
        });
        registration.active.postMessage({
          type: 'CANCEL_NOTIFICATION',
          tag: 'exit-2h'
        });
        registration.active.postMessage({
          type: 'CANCEL_NOTIFICATION',
          tag: 'exit-12h'
        });
      }
    };

    sendMessage().catch(err => console.error('NotificationService: Error in cancelExitDelayed sendMessage:', err));
  }

  private static scheduleLongTermReminders(language: 'en' | 'id') {
    const variations1h = language === 'id' ? [
      { title: 'Satu jam berlalu. Masih di luar? ⏳', body: 'Zona lu mulai dingin. Balik sekarang sebelum momentum lu ilang.' },
      { title: 'Rival lu gak berhenti, lu malah ilang. 🏃‍♂️', body: 'Satu jam tanpa progres itu kemunduran. Jangan biarkan mereka nyalip!' },
      { title: 'Disiplin itu konsistensi, bukan sesekali. 🌊', body: 'Udah satu jam lu ninggalin target. Balik ke jalur sekarang!' },
      { title: 'Balik ke jalur, atau lupakan target lu. 🛤️', body: 'Waktu terus jalan, tapi lu malah diem. Buktiin lu serius!' },
      { title: 'Waktu adalah aset paling berharga. 💎', body: 'Jangan buang-buang waktu lu buat hal gak berguna. Lock In lagi!' },
      { title: 'Satu jam kemunduran terdeteksi. 📉', body: 'OVR lu gak bakal naik kalau lu cuma rebahan. Gerak!' },
      { title: 'Ingat janji lu sama diri sendiri. 🤝', body: 'Lu bilang mau berubah, tapi satu jam ini lu malah santai.' },
      { title: 'Fokus lu mulai pudar. 🧠', body: 'Jangan biarkan distraksi menang. Balik ke Zone dan fokus!' },
      { title: 'Jangan biarkan hari ini sia-sia. 🚫', body: 'Satu jam ini gak bakal balik lagi. Gunakan sisa harimu dengan bijak.' },
      { title: 'Zona lu nungguin, bos! 👑', body: 'Udah cukup istirahatnya. Sekarang waktunya kerja keras lagi.' }
    ] : [
      { title: 'One hour passed. Still out? ⏳', body: 'Your zone is getting cold. Get back before you lose your momentum.' },
      { title: 'Your rival doesn\'t stop. 🏃‍♂️', body: 'One hour without progress is regression. Don\'t let them pass you!' },
      { title: 'Discipline is consistency. 🌊', body: 'You\'ve left your targets for an hour. Get back on track now!' },
      { title: 'Back on track, or forget it. 🛤️', body: 'Time keeps moving, but you\'re standing still. Prove you\'re serious!' },
      { title: 'Time is your most valuable asset. 💎', body: 'Don\'t waste your time on useless things. Lock In again!' },
      { title: 'One hour regression detected. 📉', body: 'Your OVR won\'t climb if you\'re just lying around. Move!' },
      { title: 'Remember your promise. 🤝', body: 'You said you\'d change, but you spent this hour relaxing.' },
      { title: 'Your focus is fading. 🧠', body: 'Don\'t let distractions win. Get back to the Zone and focus!' },
      { title: 'Don\'t let today be wasted. 🚫', body: 'This hour won\'t come back. Use the rest of your day wisely.' },
      { title: 'The Zone is waiting, boss! 👑', body: 'Enough rest. Now it\'s time to work hard again.' }
    ];

    const variations2h = language === 'id' ? [
      { title: 'Dua jam sudah berlalu. 🕰️', body: 'Jangan biarkan rasa malas menang. Balik ke Zone dan selesaikan misi lu.' },
      { title: 'Fokus lu mulai teralih. 🧠', body: 'Dua jam di luar Zone itu cukup lama. Saatnya kembali ke frekuensi elit.' },
      { title: 'Ingat target OVR lu! 📈', body: 'Dua jam tanpa grinding berarti dua jam tanpa progres. Balik sekarang!' },
      { title: 'Disiplin adalah kunci. 🔑', body: 'Dua jam istirahat sudah lebih dari cukup. Buktikan lu punya disiplin tinggi.' },
      { title: 'Jangan biarkan momentum hilang. 🌊', body: 'Membangun momentum itu sulit. Jangan hancurkan dengan jeda dua jam.' },
      { title: 'Zone lu merindukan fokus lu. ✨', body: 'Dua jam adalah waktu yang lama untuk menjauh. Lock In lagi!' },
      { title: 'Satu misi lagi? 🎯', body: 'Lu cuma butuh satu langkah kecil buat balik ke jalur. Dua jam sudah cukup.' },
      { title: 'Rival lu makin jauh di depan. 🏃‍♂️', body: 'Dua jam mereka grinding, lu malah di luar. Kejar sekarang!' },
      { title: 'Jangan tunda sampai besok. 🚫', body: 'Dua jam ini bisa lu pakai buat beresin misi. Balik ke Zone!' },
      { title: 'Kendalikan waktu lu. ⏳', body: 'Dua jam berlalu begitu saja. Ambil kendali dan balik Lock In!' }
    ] : [
      { title: 'Two hours have passed. 🕰️', body: 'Don\'t let laziness win. Get back to the Zone and finish your missions.' },
      { title: 'Your focus is drifting. 🧠', body: 'Two hours out of the Zone is long enough. Time to return to elite frequency.' },
      { title: 'Remember your OVR target! 📈', body: 'Two hours without grinding means two hours without progress. Return now!' },
      { title: 'Discipline is key. 🔑', body: 'Two hours of rest is more than enough. Prove you have high discipline.' },
      { title: 'Don\'t let momentum fade. 🌊', body: 'Building momentum is hard. Don\'t break it with a two-hour break.' },
      { title: 'The Zone misses your focus. ✨', body: 'Two hours is a long time to stay away. Lock In again!' },
      { title: 'One more mission? 🎯', body: 'You only need one small step to get back on track. Two hours is enough.' },
      { title: 'Your rival is further ahead. 🏃‍♂️', body: 'They spent two hours grinding while you were out. Catch up now!' },
      { title: 'Don\'t postpone until tomorrow. 🚫', body: 'You could use these two hours to finish missions. Back to the Zone!' },
      { title: 'Control your time. ⏳', body: 'Two hours just slipped by. Take control and Lock In again!' }
    ];

    const variations12h = language === 'id' ? [
      { title: 'Lu udah nyerah ya? Gampang banget. 🏳️', body: '12 jam sia-sia. Lu emang mau jadi orang rata-rata? Pikirin lagi.' },
      { title: 'Orang tua lu bangga gak liat lu gini? 🥀', body: 'Mereka berharap lu sukses, tapi lu malah buang waktu 12 jam.' },
      { title: 'Dirimu di masa depan lagi nangis. 😭', body: 'Dia kecewa liat lu yang sekarang cuma bisa males-malesan.' },
      { title: 'Potensi lu cuma jadi sampah. 🗑️', body: 'Kalau gak diasah, lu gak ada bedanya sama barang rongsokan.' },
      { title: 'Lu cuma jago di omongan. 🤐', body: 'Tindakan lu nol besar. Mana bukti kalau lu mau sukses?' },
      { title: 'Selamat, lu ngebunuh mimpi lu. ⚰️', body: '12 jam ini adalah paku terakhir di peti mati ambisi lu.' },
      { title: 'Rasa bersalah ini bakal ngejar lu. 💀', body: 'Lu tau lu salah. Balik sekarang atau hancur selamanya.' },
      { title: 'Lu emang gak pantes sukses. 🚫', body: 'Sukses itu buat orang disiplin, bukan buat orang manja kyk lu.' },
      { title: 'Zona lu udah mati. 🌑', body: 'Sama kyk semangat lu yang udah ilang ditelan rasa malas.' },
      { title: 'Lihat cermin, apa lu bangga? 🪞', body: '12 jam terbuang. Lu cuma pecundang yang takut sama kerja keras.' }
    ] : [
      { title: 'Given up already? That was easy. 🏳️', body: '12 hours wasted. Do you really want to be average? Think again.' },
      { title: 'Would your parents be proud? 🥀', body: 'They hope for your success, but you\'ve wasted 12 hours.' },
      { title: 'Your future self is crying. 😭', body: 'They\'re disappointed seeing you just being lazy right now.' },
      { title: 'Your potential is just trash. 🗑️', body: 'If not sharpened, you\'re no different from scrap metal.' },
      { title: 'You\'re only good at talking. 🤐', body: 'Your actions are zero. Where\'s the proof you want to succeed?' },
      { title: 'Congrats, you killed your dreams. ⚰️', body: 'These 12 hours are the final nail in the coffin of your ambition.' },
      { title: 'This guilt will haunt you. 💀', body: 'You know you\'re wrong. Get back now or perish forever.' },
      { title: 'You don\'t deserve success. 🚫', body: 'Success is for the disciplined, not for soft people like you.' },
      { title: 'Your zone is dead. 🌑', body: 'Just like your spirit that vanished into laziness.' },
      { title: 'Look in the mirror, proud? 🪞', body: '12 hours gone. You\'re just a loser afraid of hard work.' }
    ];

    const v1h = variations1h[Math.floor(Math.random() * variations1h.length)];
    const v2h = variations2h[Math.floor(Math.random() * variations2h.length)];
    const v12h = variations12h[Math.floor(Math.random() * variations12h.length)];

    const sendMessage = async () => {
      let registration = this.swRegistration;
      if (!registration && 'serviceWorker' in navigator) {
        registration = await navigator.serviceWorker.ready;
        this.swRegistration = registration;
      }

      if (registration && registration.active) {
        // 1 Hour
        registration.active.postMessage({
          type: 'SCHEDULE_NOTIFICATION',
          title: v1h.title,
          body: v1h.body,
          delay: 60 * 60 * 1000,
          tag: 'exit-1h'
        });

        // 2 Hours
        registration.active.postMessage({
          type: 'SCHEDULE_NOTIFICATION',
          title: v2h.title,
          body: v2h.body,
          delay: 120 * 60 * 1000,
          tag: 'exit-2h'
        });

        // 12 Hours - Check if it lands in sleep time (22:00 - 07:00)
        const now = new Date();
        const target12h = new Date(now.getTime() + 12 * 60 * 60 * 1000);
        const targetHour = target12h.getHours();
        
        // Don't show if it lands between 10 PM and 7 AM
        const isSleepTime = targetHour >= 22 || targetHour < 7;

        if (!isSleepTime) {
          registration.active.postMessage({
            type: 'SCHEDULE_NOTIFICATION',
            title: v12h.title,
            body: v12h.body,
            delay: 12 * 60 * 60 * 1000,
            tag: 'exit-12h'
          });
        } else {
          console.log('NotificationService: 12h reminder skipped because it lands in sleep time (' + targetHour + ':00)');
        }
      }
    };

    sendMessage().catch(err => console.error('NotificationService: Error in scheduleLongTermReminders sendMessage:', err));
  }

  static notifyTimerProgress(timeLeft: number, language: 'en' | 'id') {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const title = language === 'id' ? 'Misi Sedang Berjalan! ⏳' : 'Mission in Progress! ⏳';
    const body = language === 'id'
      ? `Sisa waktu: ${timeStr}. Jangan menyerah!`
      : `Time left: ${timeStr}. Keep going!`;
    
    this.sendNotification(title, body, 'timer-progress').catch(err => console.error('NotificationService: Error sending timer progress notification:', err));
  }

  static notifyBossDefeated(bossName: string, language: 'en' | 'id') {
    const title = language === 'id' ? 'BOS RATA! 💀' : 'BOSS DEFEATED! 💀';
    const body = language === 'id'
      ? `Lu berhasil bantai ${bossName}! Zona ini sekarang aman berkat lu.`
      : `You successfully crushed ${bossName}! This zone is safe thanks to you.`;
    
    this.sendNotification(title, body, 'boss-defeated').catch(err => console.error('NotificationService: Error sending boss defeated notification:', err));
  }

  static notifyNewBossAppeared(bossName: string, language: 'en' | 'id') {
    const title = language === 'id' ? 'ADA BOS BARU! ⚠️' : 'NEW BOSS APPEARED! ⚠️';
    const body = language === 'id'
      ? `Waspada! ${bossName} muncul di zona lu. Sikat dia sebelum bikin kacau!`
      : `Alert! ${bossName} appeared in your zone. Take them down before they cause chaos!`;
    
    this.sendNotification(title, body, 'boss-appeared').catch(err => console.error('NotificationService: Error sending boss appeared notification:', err));
  }
}
