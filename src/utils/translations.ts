export const t = (key: string, lang: 'en' | 'id', params?: Record<string, string | number>): string => {
  const translations: Record<string, Record<'en' | 'id', string>> = {
    // App.tsx
    'nav.missions': { en: 'Missions', id: 'Misi' },
    'nav.leaderboard': { en: 'Leaderboard', id: 'Peringkat' },
    'nav.journey': { en: 'Journey', id: 'Perjalanan' },
    'nav.rank': { en: 'Rank', id: 'Pangkat' },
    'nav.profile': { en: 'Profile', id: 'Profil' },
    'loading.journey': { en: 'Loading Your Journey...', id: 'Memuat Perjalanan Anda...' },

    // HomeScreen.tsx
    'home.title': { en: 'Your Missions', id: 'Misi Anda' },
    'home.subtitle': { en: 'Complete them to earn XP.', id: 'Selesaikan untuk mendapatkan XP.' },
    'home.tab.regular': { en: 'REGULAR', id: 'REGULER' },
    'home.tab.daily': { en: 'DAILY', id: 'HARIAN' },
    'home.tab.weekly': { en: 'WEEKLY', id: 'MINGGUAN' },
    'home.recent_unlocks': { en: 'Recent Unlocks', id: 'Pencapaian Baru' },
    'home.timer.keep_going': { en: 'Keep going!', id: 'Terus berjuang!' },
    'home.timer.start': { en: 'Start Timer', id: 'Mulai Timer' },
    'home.timer.stop': { en: 'Stop', id: 'Berhenti' },
    'home.mission.start_complete': { en: 'Start & Complete', id: 'Mulai & Selesaikan' },

    // JourneyScreen.tsx
    'journey.title': { en: 'Journey Map', id: 'Peta Perjalanan' },
    'journey.subtitle': { en: 'Your path to greatness.', id: 'Jalan menuju kehebatan.' },
    'journey.skip': { en: 'Skip Animation', id: 'Lewati Animasi' },
    'journey.rank_up': { en: 'RANK UP!', id: 'NAIK PANGKAT!' },
    'journey.level': { en: 'Level {level}', id: 'Level {level}' },

    // LeaderboardScreen.tsx
    'leaderboard.title': { en: 'Leaderboard', id: 'Papan Peringkat' },
    'leaderboard.subtitle': { en: 'Top performers this week.', id: 'Pemain terbaik minggu ini.' },
    'leaderboard.tab.global': { en: 'Global', id: 'Global' },
    'leaderboard.tab.friends': { en: 'Friends', id: 'Teman' },
    'leaderboard.col.rank': { en: 'Rank', id: 'Peringkat' },
    'leaderboard.col.user': { en: 'User', id: 'Pengguna' },
    'leaderboard.col.xp': { en: 'XP', id: 'XP' },

    // RankScreen.tsx
    'rank.title': { en: 'Rankings', id: 'Peringkat' },
    'rank.subtitle': { en: 'Climb the ladder.', id: 'Naiki tangga peringkat.' },
    'rank.current': { en: 'Current Rank', id: 'Pangkat Saat Ini' },
    'rank.xp_to_next': { en: 'XP to next rank', id: 'XP ke pangkat selanjutnya' },
    'rank.tiers': { en: 'Rank Tiers', id: 'Tingkat Pangkat' },
    'rank.level': { en: 'Level {level}+', id: 'Level {level}+' },

    // ProfileScreen.tsx
    'profile.title': { en: 'Profile', id: 'Profil' },
    'profile.level': { en: 'Level', id: 'Level' },
    'profile.total_xp': { en: 'Total Experience', id: 'Total Pengalaman' },
    'profile.badges': { en: 'Badges', id: 'Lencana' },
    'profile.badges.empty': { en: 'Complete missions to earn badges.', id: 'Selesaikan misi untuk mendapatkan lencana.' },
    'profile.settings': { en: 'Settings', id: 'Pengaturan' },
    'profile.goal': { en: 'Goal', id: 'Tujuan' },
    'profile.language': { en: 'Language', id: 'Bahasa' },
    'profile.logout': { en: 'Log Out', id: 'Keluar' },
    'profile.adjust_pfp': { en: 'Adjust Profile Picture', id: 'Sesuaikan Foto Profil' },
    'profile.cancel': { en: 'Cancel', id: 'Batal' },
    'profile.save': { en: 'Save', id: 'Simpan' },
    'profile.change_path': { en: 'Change Path', id: 'Ganti Tujuan' },

    // LoginScreen.tsx
    'login.title': { en: 'Enter the Zone', id: 'Masuk ke Zona' },
    'login.email': { en: 'Email', id: 'Email' },
    'login.username': { en: 'Username', id: 'Nama Pengguna' },
    'login.start': { en: 'Start Journey', id: 'Mulai Perjalanan' },

    // OnboardingScreen.tsx
    'onboarding.title': { en: 'Choose Your Path', id: 'Pilih Tujuanmu' },
    'onboarding.subtitle': { en: 'Select a path to begin your journey.', id: 'Pilih jalan untuk memulai perjalananmu.' },
    'onboarding.path.productive': { en: 'Productivity', id: 'Produktivitas' },
    'onboarding.path.stronger': { en: 'Strength', id: 'Kekuatan' },
    'onboarding.path.extrovert': { en: 'Social', id: 'Sosial' },
    'onboarding.path.discipline': { en: 'Discipline', id: 'Disiplin' },
    'onboarding.path.mental_health': { en: 'Mindfulness', id: 'Ketenangan Pikiran' },
    'onboarding.select': { en: 'Select Path', id: 'Pilih Tujuan' },

    // StreakScreen.tsx
    'streak.title': { en: 'Day Streak!', id: 'Hari Beruntun!' },
    'streak.subtitle': { en: "You're on fire! Keep it up.", id: 'Kamu luar biasa! Teruskan.' },
    'streak.continue': { en: 'Continue', id: 'Lanjutkan' },
  };

  let text = translations[key]?.[lang] || key;
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  
  return text;
};
