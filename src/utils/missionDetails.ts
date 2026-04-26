
export interface MissionDetail {
  description: {
    en: string;
    id: string;
  };
  tips: {
    en: string[];
    id: string[];
  };
  context?: {
    en: string;
    id: string;
  };
}

export const MISSION_DETAILS: Record<string, MissionDetail> = {
  "Read a self-help article": {
    description: {
      en: "Expand your knowledge and gain new perspectives by reading an article focused on personal growth.",
      id: "Perluas pengetahuan dan dapatkan perspektif baru dengan membaca artikel yang berfokus pada pengembangan diri."
    },
    tips: {
      en: [
        "Choose a topic that addresses a current challenge you're facing.",
        "Take brief notes on one actionable takeaway.",
        "Try to implement one idea from the article today."
      ],
      id: [
        "Pilih topik yang membahas tantangan yang sedang kamu hadapi saat ini.",
        "Catat poin penting yang bisa langsung dipraktikkan.",
        "Coba terapkan satu ide dari artikel tersebut hari ini."
      ]
    }
  },
  "Journal": {
    description: {
      en: "Externalizing your thoughts helps process emotions and track your personal evolution.",
      id: "Mengeksternalisasi pikiran membantu memproses emosi dan melacak evolusi pribadi kamu."
    },
    tips: {
      en: [
        "Don't worry about grammar or structure; just write.",
        "Focus on what you're grateful for or what you've learned.",
        "Even 3-5 sentences can make a significant difference."
      ],
      id: [
        "Jangan khawatir tentang tata bahasa atau struktur; tulis saja.",
        "Fokus pada apa yang kamu syukuri atau apa yang telah kamu pelajari.",
        "Bahkan 3-5 kalimat dapat memberikan perbedaan yang signifikan."
      ]
    }
  },
  "Social": {
    description: {
      en: "Meaningful social interaction is vital for mental well-being and building a support network.",
      id: "Interaksi sosial yang bermakna sangat penting untuk kesejahteraan mental dan membangun jaringan pendukung."
    },
    tips: {
      en: [
        "Be present and practice active listening.",
        "Ask open-ended questions to deepen the conversation.",
        "Share something genuine about your day."
      ],
      id: [
        "Hadir sepenuhnya dan latih mendengarkan secara aktif.",
        "Ajukan pertanyaan terbuka untuk memperdalam percakapan.",
        "Bagikan sesuatu yang tulus tentang hari kamu."
      ]
    }
  },
  "Organize your files": {
    description: {
      en: "A clean digital workspace reduces mental clutter and helps you find what you need faster.",
      id: "Ruang kerja digital yang bersih mengurangi beban mental dan membantu kamu menemukan apa yang dibutuhkan lebih cepat."
    },
    tips: {
      en: [
        "Start with your desktop or downloads folder.",
        "Delete files you no longer need.",
        "Group related files into clearly named folders."
      ],
      id: [
        "Mulai dari desktop atau folder unduhan kamu.",
        "Hapus file yang sudah tidak diperlukan lagi.",
        "Kelompokkan file terkait ke dalam folder dengan nama yang jelas."
      ]
    }
  },
  "Plan your week": {
    description: {
      en: "Take control of your time by mapping out your key objectives and appointments for the upcoming week.",
      id: "Kendalikan waktu kamu dengan memetakan tujuan utama dan janji temu untuk minggu depan."
    },
    tips: {
      en: [
        "Identify your top 3 non-negotiable goals.",
        "Schedule time blocks for deep work.",
        "Don't forget to include time for rest and self-care."
      ],
      id: [
        "Identifikasi 3 target utama yang tidak bisa ditawar.",
        "Jadwalkan blok waktu untuk kerja mendalam (deep work).",
        "Jangan lupa sertakan waktu untuk istirahat dan perawatan diri."
      ]
    }
  },
  "Write down 3 priorities for today": {
    description: {
      en: "Focusing on a few key tasks prevents overwhelm and ensures progress on what truly matters.",
      id: "Fokus pada beberapa tugas utama mencegah rasa kewalahan dan memastikan progres pada hal yang benar-benar penting."
    },
    tips: {
      en: [
        "Be specific about what 'done' looks like for each task.",
        "Rank them in order of importance.",
        "Start with the most challenging one first."
      ],
      id: [
        "Spesifik tentang seperti apa 'selesai' untuk setiap tugas.",
        "Urutkan berdasarkan tingkat kepentingan.",
        "Mulai dengan yang paling menantang terlebih dahulu."
      ]
    }
  },
  "Clear your email inbox": {
    description: {
      en: "Archive or delete unnecessary messages to achieve 'Inbox Zero' and reduce psychological stress.",
      id: "Arsipkan atau hapus pesan yang tidak perlu untuk mencapai 'Inbox Zero' dan mengurangi stres psikologis."
    },
    tips: {
      en: ["Unsubscribe from what you don't read.", "Use folders or tags.", "Reply to quick emails immediately."],
      id: ["Berhenti berlangganan dari apa yang tidak kamu baca.", "Gunakan folder atau tag.", "Balas email cepat segera."]
    }
  },
  "Declutter your workspace": {
    description: {
      en: "Physical order leads to mental order. A clean desk improves your focus and reduces distractions.",
      id: "Keteraturan fisik menghasilkan keteraturan mental. Meja yang bersih meningkatkan fokus dan mengurangi gangguan."
    },
    tips: {
      en: ["Remove everything that isn't essential.", "Wipe down the surface.", "Organize your essential tools."],
      id: ["Singkirkan semua yang tidak penting.", "Lap permukaannya.", "Atur peralatan penting kamu."]
    }
  },
  "Do 10 push-ups": {
    description: {
      en: "A foundational strength exercise that targets your chest, shoulders, and core.",
      id: "Latihan kekuatan dasar yang menargetkan dada, bahu, dan otot inti Anda."
    },
    tips: {
      en: ["Keep your back straight.", "Lower yourself until your chest nearly touches the floor.", "Exhale as you push up."],
      id: ["Jaga punggung tetap lurus.", "Turunkan tubuh sampai dada hampir menyentuh lantai.", "Buang napas saat push up."]
    }
  },
  "Do 10 squats": {
    description: {
      en: "Strengthen your lower body and improve functional mobility with this essential movement.",
      id: "Perkuat tubuh bagian bawah dan tingkatkan mobilitas fungsional dengan gerakan penting ini."
    },
    tips: {
      en: ["Keep your weight on your heels.", "Keep your chest up.", "Go down until your thighs are parallel to the floor."],
      id: ["Jaga beban pada tumit Anda.", "Jaga dada tetap tegak.", "Turunlah sampai paha sejajar dengan lantai."]
    }
  },
  "Stretch": {
    description: {
      en: "Improve flexibility and reduce muscle tension with a full-body static stretching routine.",
      id: "Tingkatkan fleksibilitas dan kurangi ketegangan otot dengan rutinitas peregangan statis seluruh tubuh."
    },
    tips: {
      en: ["Hold each stretch for 20-30 seconds.", "Don't bounce.", "Breathe deeply into the stretch."],
      id: ["Tahan setiap peregangan selama 20-30 detik.", "Jangan memantul.", "Tarik napas dalam-dalam saat peregangan."]
    }
  },
  "Hold a plank for 30 seconds": {
    description: {
      en: "Build isometric core strength and stability with one of the most effective core exercises.",
      id: "Bangun kekuatan inti isometrik dan stabilitas dengan salah satu latihan inti paling efektif."
    },
    tips: {
      en: ["Maintain a straight line from head to heels.", "Engage your glutes and core.", "Don't hold your breath."],
      id: ["Pertahankan garis lurus dari kepala hingga tumit.", "Kencangkan otot glute dan inti.", "Jangan menahan napas."]
    }
  },
  "Smile at a stranger": {
    description: {
      en: "A small positive gesture that can boost your mood and create a ripple effect of kindness.",
      id: "Isyarat positif kecil yang dapat meningkatkan suasana hati Anda dan menciptakan efek riak kebaikan."
    },
    tips: {
      en: ["Make brief eye contact first.", "Be genuine.", "Don't overthink it."],
      id: ["Lakukan kontak mata singkat terlebih dahulu.", "Tuluslah.", "Jangan terlalu dipikirkan."]
    }
  },
  "Ask a question": {
    description: {
      en: "Practice curiosity and social initiative by starting a small interaction through a question.",
      id: "Latih rasa ingin tahu dan inisiatif sosial dengan memulai interaksi kecil melalui pertanyaan."
    },
    tips: {
      en: ["Ask something relevant to the context.", "Listen to the answer attentively.", "Follow up if natural."],
      id: ["Tanyakan sesuatu yang relevan dengan konteks.", "Dengarkan jawabannya dengan penuh perhatian.", "Tindak lanjuti jika terasa alami."]
    }
  },
  "Give a compliment": {
    description: {
      en: "Observe the good in others and express it to build rapport and confidence.",
      id: "Amati hal baik pada orang lain dan sampaikanlah untuk membangun hubungan dan rasa percaya diri."
    },
    tips: {
      en: ["Be specific and sincere.", "Focus on effort or choice (skills, style) rather than just traits.", "Don't expect anything in return."],
      id: ["Jadilah spesifik dan tulus.", "Fokus pada upaya atau pilihan (keterampilan, gaya) daripada sekadar sifat.", "Jangan berharap balasan apa pun."]
    }
  },
  "Make your bed": {
    description: {
      en: "Gain an immediate sense of accomplishment and start your day with a small victory.",
      id: "Dapatkan rasa pencapaian seketika dan mulai hari Anda dengan kemenangan kecil."
    },
    tips: {
      en: ["Do it as soon as you get up.", "Smooth out the sheets and arrange the pillows.", "Appreciate the clean look before leaving the room."],
      id: ["Lakukan segera setelah Anda bangun.", "Rapikan seprai dan susun bantal.", "Hargai tampilan bersih sebelum meninggalkan ruangan."]
    }
  },
  "Sit with straight posture": {
    description: {
      en: "Improve your health and project confidence by maintaining proper spinal alignment.",
      id: "Tingkatkan kesehatan Anda dan tunjukkan rasa percaya diri dengan menjaga kelurusan tulang belakang yang tepat."
    },
    tips: {
      en: ["Keep your feet flat on the floor.", "Roll your shoulders back and down.", "Imagine a string pulling you up from the crown of your head."],
      id: ["Jaga kaki tetap rata di lantai.", "Putar bahu ke belakang dan ke bawah.", "Bayangkan sebuah tali menarik Anda ke atas dari puncak kepala."]
    }
  },
  "Drink water first thing": {
    description: {
      en: "Hydrate your system after sleep to boost mental clarity and energy levels.",
      id: "Hidrasi sistem Anda setelah tidur untuk meningkatkan kejelasan mental dan tingkat energi."
    },
    tips: {
      en: ["Keep water by your bed.", "Drink at least 250ml.", "Avoid cold water if possible."],
      id: ["Siapkan air di samping tempat tidur.", "Minum setidaknya 250ml.", "Hindari air dingin jika memungkinkan."]
    }
  },
  "Take 5 deep breaths": {
    description: {
      en: "A quick way to reset your nervous system and reduce immediate stress.",
      id: "Cara cepat untuk mengatur ulang sistem saraf dan mengurangi stres seketika."
    },
    tips: {
      en: ["Inhale through your nose for 4 seconds.", "Hold for 4 seconds.", "Exhale through your mouth for 4 seconds."],
      id: ["Tarik napas melalui hidung selama 4 detik.", "Tahan selama 4 detik.", "Buang napas melalui mulut selama 4 detik."]
    }
  },
  "Listen to calming music": {
    description: {
      en: "Use sound to regulate your emotions and return to a state of peace.",
      id: "Gunakan suara untuk mengatur emosi Anda dan kembali ke keadaan damai."
    },
    tips: {
      en: ["Choose music without lyrics if you need to focus.", "Try nature sounds or lo-fi beats.", "Notice how the vibration affects your body."],
      id: ["Pilih musik tanpa lirik jika Anda ingin fokus.", "Coba suara alam atau lo-fi beats.", "Perhatikan bagaimana getarannya memengaruhi tubuh Anda."]
    }
  },
  "Stretch your neck": {
    description: {
      en: "Release accumulated tension from looking at screens and improve blood flow to the brain.",
      id: "Lepaskan ketegangan yang menumpuk akibat menatap layar dan tingkatkan aliran darah ke otak."
    },
    tips: {
      en: ["Gently tilt your head from side to side.", "Don't force the movement.", "Hold for 10 seconds each side."],
      id: ["Miringkan kepala Anda secara perlahan dari sisi ke sisi.", "Jangan memaksakan gerakan.", "Tahan selama 10 detik di setiap sisi."]
    }
  },
  "Write down 1 positive thought": {
    description: {
      en: "Trains your brain to notice the good things, even on hard days.",
      id: "Melatih otak kamu untuk memperhatikan hal-hal baik, bahkan di hari-hari yang sulit."
    },
    tips: {
      en: ["It can be something small like a good cup of coffee.", "Focus on how it made you feel.", "Be as specific as possible."],
      id: ["Bisa berupa hal kecil seperti secangkir kopi yang enak.", "Fokus pada bagaimana perasaanmu.", "Jadilah sespesifik mungkin."]
    }
  },
  "30 minutes study focus": {
    description: {
      en: "Dedicate uninterrupted time to learning a new concept or reviewing material.",
      id: "Dedikasikan waktu tanpa gangguan untuk mempelajari konsep baru atau meninjau materi."
    },
    tips: {
      en: [
        "Put your phone in another room or on 'Do Not Disturb'.",
        "Use the Pomodoro technique if you find it hard to stay focused.",
        "Summarize what you learned in your own words at the end."
      ],
      id: [
        "Simpan ponsel di ruangan lain atau aktifkan mode 'Jangan Ganggu'.",
        "Gunakan teknik Pomodoro jika kamu merasa sulit untuk tetap fokus.",
        "Ringkas apa yang kamu pelajari dengan kata-kata sendiri di akhir sesi."
      ]
    }
  },
  "Wake up at your target time": {
    description: {
      en: "Conquer the first battle of the day by honoring your commitment to yourself.",
      id: "Taklukkan pertempuran pertama hari ini dengan menghormati komitmen Anda pada diri sendiri."
    },
    tips: {
      en: ["Place your alarm away from the bed.", "Don't hit the snooze button.", "Get out of bed immediately upon waking."],
      id: ["Letakkan alarm jauh dari tempat tidur.", "Jangan tekan tombol tunda.", "Segera bangun dari tempat tidur setelah bangun."]
    }
  },
  "Listen and don't interrupt": {
    description: {
      en: "Practice active listening by giving the speaker your full attention without interjecting.",
      id: "Latih mendengarkan secara aktif dengan memberikan perhatian penuh kepada pembicara tanpa menyela."
    },
    tips: {
      en: ["Wait for a natural pause before speaking.", "Nod or use verbal cues like 'I see' to show you're listening.", "Summarize what you heard to ensure understanding."],
      id: ["Tunggu jeda alami sebelum berbicara.", "Mengangguk atau gunakan isyarat verbal seperti 'Saya mengerti' untuk menunjukkan Anda sedang mendengarkan.", "Ringkas apa yang Anda dengar untuk memastikan pemahaman."]
    }
  },
  "Say 'thank you' intentionally": {
    description: {
      en: "Express gratitude with sincerity and eye contact to strengthen your social connections.",
      id: "Ungkapkan rasa terima kasih dengan tulus dan kontak mata untuk memperkuat hubungan sosial Anda."
    },
    tips: {
      en: ["State exactly what you are thankful for.", "Make eye contact while saying it.", "Notice the reaction of the other person."],
      id: ["Sebutkan dengan tepat apa yang Anda syukuri.", "Lakukan kontak mata saat mengucapkannya.", "Perhatikan reaksi orang lain."]
    }
  },
  "Identify one emotion you feel": {
    description: {
      en: "Improve emotional intelligence by labeling exactly how you are feeling in the moment.",
      id: "Tingkatkan kecerdasan emosional dengan menamai dengan tepat perasaan Anda saat ini."
    },
    tips: {
      en: ["Don't judge the emotion, just name it.", "Locate where you feel the emotion in your body.", "Allow yourself to sit with it for a moment."],
      id: ["Jangan menghakimi emosi tersebut, namai saja.", "Temukan di mana Anda merasakan emosi tersebut di tubuh Anda.", "Izinkan diri Anda untuk merasakannya sejenak."]
    }
  },
  "Take a mental health break": {
    description: {
      en: "Step away from tasks to recharge your psychological energy and prevent burnout.",
      id: "Menjauh sejenak dari tugas untuk mengisi ulang energi psikologis Anda dan mencegah kelelahan."
    },
    tips: {
      en: ["Step outside if possible for fresh air.", "Do a quick mindfulness exercise.", "Don't check your phone during the break."],
      id: ["Keluar ruangan jika memungkinkan untuk mencari udara segar.", "Lakukan latihan mindfulness cepat.", "Jangan mengecek ponsel selama istirahat."]
    }
  },
  "Brush teeth for 2 mins": {
    description: {
      en: "Maintain oral hygiene and practice patience by completing the full recommended duration.",
      id: "Jaga kebersihan mulut dan latih kesabaran dengan menyelesaikan durasi penuh yang disarankan."
    },
    tips: {
      en: ["Use a timer.", "Focus on reaching every corner of your mouth.", "Gentle circular motions are most effective."],
      id: ["Gunakan pengatur waktu.", "Fokus untuk menjangkau setiap sudut mulut Anda.", "Gerakan melingkar yang lembut adalah yang paling efektif."]
    }
  },
  "Floss": {
    description: {
      en: "Complete your dental routine to prevent long-term health issues and build consistent habits.",
      id: "Lengkapi rutinitas gigi Anda untuk mencegah masalah kesehatan jangka panjang dan membangun kebiasaan yang konsisten."
    },
    tips: {
      en: ["Use about 18 inches of floss.", "Slide the floss gently between teeth.", "Follow the curve of each tooth."],
      id: ["Gunakan sekitar 18 inci benang gigi.", "Geser benang secara perlahan di antara gigi.", "Ikuti lekukan setiap gigi."]
    }
  },
  "Do 20 jumping jacks": {
    description: {
      en: "A quick cardio burst to elevate your heart rate and wake up your body.",
      id: "Ledakan kardio cepat untuk meningkatkan detak jantung dan membangunkan tubuh Anda."
    },
    tips: {
      en: ["Land softly on the balls of your feet.", "Keep your arms straight.", "Breathe steadily throughout the movement."],
      id: ["Mendaratlah dengan lembut di telapak kaki Anda.", "Jaga lengan tetap lurus.", "Tarik napas teratur sepanjang gerakan."]
    }
  },
  "Run for 10 mins": {
    description: {
      en: "Improve cardiovascular endurance and mental stamina with a short, focused run.",
      id: "Tingkatkan daya tahan kardiovaskular dan stamina mental dengan lari pendek yang terfokus."
    },
    tips: {
      en: ["Start with a slow jog to warm up.", "Maintain a pace where you could still hold a short conversation.", "Cool down with a walk afterwards."],
      id: ["Mulailah dengan joging lambat untuk pemanasan.", "Pertahankan kecepatan di mana Anda masih bisa melakukan percakapan singkat.", "Lakukan pendinginan dengan berjalan kaki sesudahnya."]
    }
  },
  "Walk 5000 steps": {
    description: {
      en: "Engage in low-impact activity to improve circulation and clear your mind.",
      id: "Lakukan aktivitas berdampak rendah untuk meningkatkan sirkulasi dan menjernihkan pikiran Anda."
    },
    tips: {
      en: ["Take the stairs instead of the elevator.", "Go for a short walk after meals.", "Park further away to get extra steps."],
      id: ["Gunakan tangga alih-alih lift.", "Jalan-jalan sebentar setelah makan.", "Parkir lebih jauh untuk mendapatkan langkah ekstra."]
    }
  },
  "Prioritize your task list": {
    description: {
      en: "Organize your workload by importance and deadline to ensure the most critical tasks are handled first.",
      id: "Atur beban kerja Anda berdasarkan kepentingan dan tenggat waktu untuk memastikan tugas paling kritis ditangani terlebih dahulu."
    },
    tips: {
      en: ["Use the Eisenhower Matrix (Urgent vs Important).", "Identify one 'must-do' task for the day.", "Be realistic about how much you can accomplish."],
      id: ["Gunakan Matriks Eisenhower (Mendesak vs Penting).", "Identifikasi satu tugas 'wajib dilakukan' untuk hari itu.", "Bersikaplah realistis tentang seberapa banyak yang dapat Anda selesaikan."]
    }
  },
  "Set a timer for 25 mins": {
    description: {
      en: "Use the Pomodoro technique to maintain high focus for a short burst of productivity.",
      id: "Gunakan teknik Pomodoro untuk menjaga fokus tinggi dalam ledakan produktivitas yang singkat."
    },
    tips: {
      en: ["Focus on only one task during the timer.", "Ignore all notifications.", "Take a short break once the timer ends."],
      id: ["Fokus hanya pada satu tugas selama pengatur waktu.", "Abaikan semua notifikasi.", "Istirahat sejenak setelah pengatur waktu berakhir."]
    }
  },
  "Take a break after 50 mins work": {
    description: {
      en: "Scheduled recovery periods prevent mental fatigue and keep your performance consistent.",
      id: "Periode pemulihan yang dijadwalkan mencegah kelelahan mental dan menjaga kinerja Anda tetap konsisten."
    },
    tips: {
      en: ["Stand up and move around.", "Look at something far away to rest your eyes.", "Hydrate during your break."],
      id: ["Berdiri dan bergeraklah.", "Lihatlah sesuatu yang jauh untuk mengistirahatkan mata Anda.", "Minumlah air selama istirahat."]
    }
  },
  "Call a family member": {
    description: {
      en: "Nurture your closest relationships with a direct voice connection.",
      id: "Pupuk hubungan terdekat Anda dengan koneksi suara langsung."
    },
    tips: {
      en: ["Choose a time when you know they are likely free.", "Be a good listener.", "Share a positive update from your life."],
      id: ["Pilih waktu saat Anda tahu mereka kemungkinan sedang luang.", "Jadilah pendekar yang baik.", "Bagikan kabar positif dari hidup Anda."]
    }
  },
  "Drink 2L of water per day": {
    description: {
      en: "Proper hydration is essential for every bodily function, from brain power to muscle recovery.",
      id: "Hidrasi yang tepat sangat penting untuk setiap fungsi tubuh, mulai dari kekuatan otak hingga pemulihan otot."
    },
    tips: {
      en: ["Carry a reusable water bottle.", "Drink a glass before every meal.", "Track your progress with a tally."],
      id: ["Bawa botol air yang bisa digunakan kembali.", "Minum segelas sebelum makan.", "Pantau kemajuan Anda dengan catatan."]
    }
  },
  "Exercise for 30 mins each day": {
    description: {
      en: "Consistent daily movement is the foundation of physical health and mental clarity.",
      id: "Gerakan harian yang konsisten adalah dasar dari kesehatan fisik dan kejelasan mental."
    },
    tips: {
      en: ["Find an activity you enjoy.", "Schedule it like an important meeting.", "Focus on consistency over intensity at first."],
      id: ["Cari aktivitas yang Anda nikmati.", "Jadwalkan seperti pertemuan penting.", "Fokus pada konsistensi daripada intensitas pada awalnya."]
    }
  },
  "Listen to an educational podcast": {
    description: {
      en: "Turn passive time into active learning by listening to experts share their knowledge.",
      id: "Ubah waktu pasif menjadi pembelajaran aktif dengan mendengarkan para ahli berbagi pengetahuan mereka."
    },
    tips: {
      en: ["Listen during chores or commute.", "Pause to reflect on key points.", "Share one interesting fact with a friend."],
      id: ["Dengarkan saat melakukan pekerjaan rumah atau di perjalanan.", "Berhenti sejenak untuk merenungkan poin-poin utama.", "Bagikan satu fakta menarik kepada teman."]
    }
  },
  "Watch a tutorial on a new tool": {
    description: {
      en: "Stay ahead by learning how to use software or equipment that improves your workflow.",
      id: "Tetap terdepan dengan mempelajari cara menggunakan perangkat lunak atau peralatan yang meningkatkan alur kerja Anda."
    },
    tips: {
      en: ["Follow along with the video if possible.", "Try to complete one small project with the tool.", "Bookmark the video for future reference."],
      id: ["Ikuti videonya jika memungkinkan.", "Coba selesaikan satu proyek kecil dengan alat tersebut.", "Tandai video untuk referensi di masa mendatang."]
    }
  },
  "Review your monthly goals": {
    description: {
      en: "Alignment is key. Ensure your daily actions are still serving your long-term vision.",
      id: "Keselarasan adalah kunci. Pastikan tindakan harian Anda masih melayani visi jangka panjang Anda."
    },
    tips: {
      en: ["Track your progress honestly.", "Adjust goals if they are no longer relevant.", "Celebrate small wins from the past weeks."],
      id: ["Pantau kemajuan Anda dengan jujur.", "Sesuaikan tujuan jika tidak lagi relevan.", "Rayakan kemenangan kecil dari minggu-minggu sebelumnya."]
    }
  },
  "Update your to-do list": {
    description: {
      en: "A dynamic list is a useful list. Keep your tasks current to stay organized.",
      id: "Daftar yang dinamis adalah daftar yang berguna. Jaga agar tugas Anda tetap mutakhir agar tetap teratur."
    },
    tips: {
      en: ["Remove completed or irrelevant tasks.", "Breaking down large tasks into smaller steps.", "Set deadlines for the most important items."],
      id: ["Hapus tugas yang sudah selesai atau tidak relevan.", "Pecah tugas besar menjadi langkah-langkah kecil.", "Tetapkan tenggat waktu untuk item yang paling penting."]
    }
  },
  "Unsubscribe from 3 newsletters": {
    description: {
      en: "Reduce digital noise and improve focus by eliminating unnecessary information sources.",
      id: "Kurangi kebisingan digital dan tingkatkan fokus dengan menghilangkan sumber informasi yang tidak perlu."
    },
    tips: {
      en: ["Look for emails you consistently skip.", "Check your promotions tab.", "Use an unsubscribing tool if you have many."],
      id: ["Cari email yang konsisten Anda lewati.", "Periksa tab promosi Anda.", "Gunakan alat berhenti berlangganan jika Anda punya banyak."]
    }
  },
  "Plan your meals": {
    description: {
      en: "Save time and money while improving your nutrition by deciding what to eat in advance.",
      id: "Hemat waktu dan uang sambil meningkatkan nutrisi Anda dengan memutuskan apa yang akan dimakan sebelumnya."
    },
    tips: {
      en: ["Check what you already have in the kitchen.", "Choose a mix of healthy and easy-to-prep options.", "Write down a shopping list."],
      id: ["Periksa apa yang sudah Anda miliki di dapur.", "Pilih campuran opsi sehat dan mudah disiapkan.", "Tuliskan daftar belanja."]
    }
  },
  "Check your calendar": {
    description: {
      en: "A quick review of your schedule ensures you're prepared for upcoming appointments and deadlines.",
      id: "Tinjauan cepat terhadap jadwal kamu memastikan kamu siap untuk janji temu dan tenggat waktu mendatang."
    },
    tips: {
      en: ["Look at today and tomorrow.", "Identify potential conflicts.", "Update any missing events."],
      id: ["Lihat jadwal hari ini dan besok.", "Identifikasi potensi tabrakan jadwal.", "Perbarui acara yang belum tercatat."]
    }
  },
  "Unsubscribe from 1 promotional text": {
    description: {
      en: "Stop intrusive marketing by opting out of text message alerts you no longer want.",
      id: "Hentikan pemasaran yang mengganggu dengan keluar dari peringatan pesan teks yang tidak lagi kamu inginkan."
    },
    tips: {
      en: ["Reply 'STOP' or use the provided link.", "Delete the thread afterwards.", "Notice the reduction in phone pings."],
      id: ["Balas 'STOP' atau gunakan tautan yang disediakan.", "Hapus pesan tersebut setelahnya.", "Perhatikan berkurangnya gangguan di ponsel."]
    }
  },
  "Clear your browser cache": {
    description: {
      en: "Improve browser performance and protect your privacy by clearing stored temporary data.",
      id: "Tingkatkan performa browser dan lindungi privasi kamu dengan menghapus data sementara yang tersimpan."
    },
    tips: {
      en: ["Go to settings/privacy in your browser.", "Select 'Clear browsing data'.", "Choose 'Cached images and files'."],
      id: ["Buka pengaturan/privasi di browser kamu.", "Pilih 'Hapus data browsing'.", "Pilih 'Gambar dan file dalam cache'."]
    }
  },
  "Set a new wallpaper": {
    description: {
      en: "A fresh look on your devices can boost your mood and provide a sense of new beginnings.",
      id: "Tampilan baru pada perangkat kamu dapat meningkatkan mood dan memberikan rasa awal yang baru."
    },
    tips: {
      en: ["Choose an inspiring image.", "Ensure it's high resolution.", "Notice how it changes the 'vibe' of your device."],
      id: ["Pilih gambar yang inspiratif.", "Pastikan resolusinya tinggi.", "Perhatikan bagaimana hal itu mengubah 'vibe' perangkat kamu."]
    }
  },
  "Clean your keyboard": {
    description: {
      en: "Remove dust and debris from your keys to improve hygiene and typing feel.",
      id: "Hilangkan debu dan kotoran dari tombol keyboard kamu untuk meningkatkan kebersihan dan kenyamanan mengetik."
    },
    tips: {
      en: ["Use compressed air or a soft brush.", "Wipe with a slightly damp microfiber cloth.", "Turn it upside down and shake gently."],
      id: ["Gunakan udara bertekanan atau sikat lembut.", "Lap dengan kain mikrofiber yang sedikit lembap.", "Balikkan dan goyang perlahan."]
    }
  },
  "Wipe your monitor": {
    description: {
      en: "A clean screen reduces eye strain and makes your digital workspace look much better.",
      id: "Layar yang bersih mengurangi ketegangan mata dan membuat ruang kerja digital kamu terlihat jauh lebih baik."
    },
    tips: {
      en: ["Use a microfiber cloth.", "Avoid harsh chemicals.", "Wipe in gentle circular motions."],
      id: ["Gunakan kain mikrofiber.", "Hindari bahan kimia keras.", "Lap dengan gerakan melingkar yang lembut."]
    }
  },
  "Empty your physical trash bin": {
    description: {
      en: "Removing waste from your immediate environment creates a fresher, more organized space.",
      id: "Membuang sampah dilingkungan sekitar menciptakan ruang yang lebih segar dan teratur."
    },
    tips: {
      en: ["Take it all the way to the outside bin.", "Wipe the inside of the bin if needed.", "Replace the liner immediately."],
      id: ["Bawa sampah langsung ke tempat sampah luar.", "Lap bagian dalam tempat sampah jika perlu.", "Ganti plastik sampah segera."]
    }
  },
  "Sort your mail": {
    description: {
      en: "Prevent paper clutter by processing your physical mail as soon as it arrives.",
      id: "Cegah tumpukan kertas dengan memproses surat fisik kamu segera setelah tiba."
    },
    tips: {
      en: ["Recycle junk mail immediately.", "Open important envelopes.", "File or act on bills and notices."],
      id: ["Segera buang surat sampah.", "Buka amplop penting.", "Simpan atau segera tindak lanjuti tagihan dan pemberitahuan."]
    }
  },
  "Pay a bill": {
    description: {
      en: "Handling your finances promptly reduces stress and avoids late fees.",
      id: "Menangani keuangan kamu segera mengurangi stres dan menghindari biaya keterlambatan."
    },
    tips: {
      en: ["Do it online for immediate confirmation.", "Double-check the amount and due date.", "File the receipt digital or physical."],
      id: ["Lakukan secara online untuk konfirmasi instan.", "Periksa kembali jumlah dan tanggal jatuh tempo.", "Simpan tanda terima secara digital atau fisik."]
    }
  },
  "Check your bank balance": {
    description: {
      en: "Being aware of your financial status is the first step toward responsible money management.",
      id: "Sadar akan status keuangan kamu adalah langkah pertama menuju pengelolaan uang yang bertanggung jawab."
    },
    tips: {
      en: ["Use your banking app.", "Review recent transactions for errors.", "Update your budget if necessary."],
      id: ["Gunakan aplikasi perbankan kamu.", "Tinjau transaksi terbaru untuk memeriksa kesalahan.", "Perbarui anggaran kamu jika perlu."]
    }
  },
  "Write a thank you note": {
    description: {
      en: "Expressing gratitude strengthens relationships and makes both you and the recipient feel better.",
      id: "Mengungkapkan rasa terima kasih memperkuat hubungan dan membuat kamu serta penerima merasa lebih baik."
    },
    tips: {
      en: ["Be specific about what you're thankful for.", "Handwritten notes add a special touch.", "Send it promptly."],
      id: ["Spesifikkan apa yang kamu syukuri.", "Catatan tulisan tangan memberikan sentuhan istimewa.", "Kirimkan segera."]
    }
  },
  "Plan your weekend": {
    description: {
      en: "Mapping out your rest and recreation ensures you make the most of your free time.",
      id: "Memetakan waktu istirahat dan rekreasi memastikan kamu memanfaatkan waktu luang sebaik-baiknya."
    },
    tips: {
      en: ["Include both social time and solo rest.", "Pre-book any activities if needed.", "Leave some unscheduled space for spontaneity."],
      id: ["Sertakan waktu sosial dan istirahat sendiri.", "Pesan aktivitas terlebih dahulu jika perlu.", "Sisakan ruang kosong untuk hal-aktifitas spontan."]
    }
  },
  "Review your budget": {
    description: {
      en: "Gain financial awareness and control by tracking your income and expenses.",
      id: "Dapatkan kesadaran dan kontrol finansial dengan melacak pendapatan dan pengeluaran Anda."
    },
    tips: {
      en: ["Categorize your spending.", "Identify one unnecessary expense to cut.", "Plan for any upcoming major costs."],
      id: ["Kategorikan pengeluaran Anda.", "Identifikasi satu pengeluaran tidak perlu untuk dipotong.", "Rencanakan biaya besar yang akan datang."]
    }
  },
  "Update your passwords": {
    description: {
      en: "Protect your digital identity by using strong, unique passwords for your accounts.",
      id: "Lindungi identitas digital Anda dengan menggunakan kata sandi yang kuat dan unik untuk akun Anda."
    },
    tips: {
      en: ["Use a password manager.", "Enable two-factor authentication (2FA).", "Avoid using personal information in passwords."],
      id: ["Gunakan pengelola kata sandi.", "Aktifkan autentikasi dua faktor (2FA).", "Hindari menggunakan informasi pribadi dalam kata sandi."]
    }
  },
  "Back up your phone": {
    description: {
      en: "Prevent data loss by ensuring your photos, contacts, and settings are saved securely.",
      id: "Cegah kehilangan data dengan memastikan foto, kontak, dan pengaturan Anda disimpan dengan aman."
    },
    tips: {
      en: ["Use cloud storage or a computer.", "Check that you have enough storage space.", "Make it a monthly habit."],
      id: ["Gunakan penyimpanan cloud atau komputer.", "Pastikan Anda memiliki ruang penyimpanan yang cukup.", "Jadikan ini kebiasaan bulanan."]
    }
  },
  "No phone for the first hour": {
    description: {
      en: "Protect your focus and mental peace by avoiding digital inputs immediately after waking up.",
      id: "Lindungi fokus dan kedamaian mental Anda dengan menghindari input digital segera setelah bangun tidur."
    },
    tips: {
      en: ["Use a physical alarm clock.", "Leave your phone in another room overnight.", "Use the time for reading or meditation instead."],
      id: ["Gunakan jam weker fisik.", "Simpan ponsel di ruangan lain semalaman.", "Gunakan waktu tersebut untuk membaca atau meditasi."]
    }
  },
  "Spend 10 minutes learning a language": {
    description: {
      en: "Consistency is key to language acquisition. Even small daily efforts lead to big results.",
      id: "Konsistensi adalah kunci penguasaan bahasa. Bahkan upaya harian kecil membuahkan hasil besar."
    },
    tips: {
      en: ["Use an app or flashcards.", "Speak out loud to practice pronunciation.", "Focus on common phrases first."],
      id: ["Gunakan aplikasi atau flashcard.", "Bicaralah dengan keras untuk melatih pengucapan.", "Fokus pada frasa umum terlebih dahulu."]
    }
  },
  "Meal prep": {
    description: {
      en: "Prepare batches of healthy food to save time and ensure you eat well during busy days.",
      id: "Siapkan makanan sehat dalam jumlah besar untuk menghemat waktu dan memastikan Anda makan dengan baik di hari-hari sibuk."
    },
    tips: {
      en: ["Cook large portions of grains and proteins.", "Use airtight containers.", "Label them with the date."],
      id: ["Masak biji-bijian dan protein dalam porsi besar.", "Gunakan wadah kedap udara.", "Beri label dengan tanggal."]
    }
  },
  "Wash your bed sheets": {
    description: {
      en: "Improve your sleep quality and skin health by maintaining a clean sleeping environment.",
      id: "Tingkatkan kualitas tidur dan kesehatan kulit Anda dengan menjaga lingkungan tidur tetap bersih."
    },
    tips: {
      en: ["Wash them once a week.", "Use a detergent you like the smell of.", "Dry them completely before putting them back."],
      id: ["Cuci seminggu sekali.", "Gunakan deterjen yang baunya Anda sukai.", "Keringkan sepenuhnya sebelum dipasang kembali."]
    }
  },
  "Do 10 lunges per leg": {
    description: {
      en: "Target your glutes, quads, and hamstrings while improving balance and stability.",
      id: "Targetkan glute, quad, dan hamstring Anda sambil meningkatkan keseimbangan dan stabilitas."
    },
    tips: {
      en: ["Keep your chest upright.", "Take a large enough step and lower your back knee.", "Don't let your front knee go past your toes."],
      id: ["Jaga dada tetap tegak.", "Ambil langkah yang cukup besar dan turunkan lutut belakang Anda.", "Jangan biarkan lutut depan melewati jari kaki."]
    }
  },
  "Do a 1-minute wall sit": {
    description: {
      en: "Build isometric lower body strength and endurance with this challenging isolation exercise.",
      id: "Bangun kekuatan dan daya tahan tubuh bagian bawah isometrik dengan latihan isolasi yang menantang ini."
    },
    tips: {
      en: ["Press your lower back against the wall.", "Keep your knees at a 90-degree angle.", "Breathe steadily and stay calm."],
      id: ["Tekan punggung bawah Anda ke dinding.", "Jaga lutut pada sudut 90 derajat.", "Tarik napas teratur dan tetap tenang."]
    }
  },
  "Avoid sugary drinks": {
    description: {
      en: "Improve your energy levels and metabolic health by choosing water or tea over soda.",
      id: "Tingkatkan tingkat energi dan kesehatan metabolik Anda dengan memilih air atau teh daripada soda."
    },
    tips: {
      en: ["Carry a water bottle with you.", "Try sparkling water if you crave carbonation.", "Notice how your energy feels throughout the day."],
      id: ["Bawa botol air bersama Anda.", "Coba air soda jika Anda mengidam karbonasi.", "Perhatikan perasaan energi Anda sepanjang hari."]
    }
  },
  "Take the stairs": {
    description: {
      en: "Incorporate small bursts of physical activity into your routine to boost circulation.",
      id: "Masukkan aktivitas fisik singkat ke dalam rutinitas Anda untuk meningkatkan sirkulasi."
    },
    tips: {
      en: ["Consistency counts over distance.", "Maintain a steady pace.", "It's a free and easy workout."],
      id: ["Konsistensi lebih penting daripada jarak.", "Pertahankan kecepatan yang stabil.", "Ini adalah latihan gratis dan mudah."]
    }
  },
  "Go for a 5km run": {
    description: {
      en: "A classic aerobic challenge to improve your cardiovascular fitness and mental toughness.",
      id: "Tantangan aerobik klasik untuk meningkatkan kebugaran kardiovaskular dan ketangguhan mental Anda."
    },
    tips: {
      en: ["Pace yourself starting slow.", "Wear supportive running shoes.", "Listen to an inspiring playlist or podcast."],
      id: ["Atur langkah Anda mulai dari lambat.", "Kenakan sepatu lari yang suportif.", "Dengarkan playlist atau podcast yang menginspirasi."]
    }
  },
  "Host a get-together": {
    description: {
      en: "Nurture your community by bringing people together in a shared space.",
      id: "Pupuk komunitas Anda dengan menyatukan orang-orang di ruang bersama."
    },
    tips: {
      en: ["Keep it simple with snacks and music.", "Focus on making everyone feel welcome.", "Put your phone away during the event."],
      id: ["Tetap sederhana dengan camilan dan musik.", "Fokus untuk membuat semua orang merasa disambut.", "Simpan ponsel Anda selama acara."]
    }
  },
  "Volunteer for 2 hours": {
    description: {
      en: "Gain perspective and give back by dedicating your time to a cause you care about.",
      id: "Dapatkan perspektif dan beri kembali dengan mendedikasikan waktu Anda untuk tujuan yang Anda pedulikan."
    },
    tips: {
      en: ["Choose a local organization.", "Be reliable and follow their instructions.", "Reflect on how your help made a difference."],
      id: ["Pilih organisasi lokal.", "Jadilah orang yang dapat diandalkan dan ikuti instruksi mereka.", "Renungkan bagaimana bantuan Anda memberikan perbedaan."]
    }
  },
  "Take a cold shower": {
    description: {
      en: "Build mental resilience and boost your alertness through controlled exposure to cold.",
      id: "Bangun ketahanan mental dan tingkatkan kewaspadaan Anda melalui paparan dingin yang terkontrol."
    },
    tips: {
      en: ["Start with warm water and finish with 30 seconds of cold.", "Focus on slow, deep breaths.", "Gradually increase the duration over time."],
      id: ["Mulailah dengan air hangat dan selesaikan dengan 30 detik air dingin.", "Fokus pada napas dalam yang lambat.", "Tingkatkan durasi secara bertahap seiring waktu."]
    }
  },
  "No social media for 120 minutes": {
    description: {
      en: "Break the cycle of infinite scrolling and reclaim your focus for deeper activities.",
      id: "Hentikan siklus scrolling tanpa henti dan rebut kembali fokus Anda untuk aktivitas yang lebih dalam."
    },
    tips: {
      en: ["Delete the apps temporarily if needed.", "Replace the habit with something physical like reading.", "Notice the reduction in mental noise."],
      id: ["Hapus aplikasi untuk sementara jika perlu.", "Ganti kebiasaan tersebut dengan sesuatu yang fisik seperti membaca.", "Perhatikan berkurangnya kebisingan mental."]
    }
  },
  "Digital detox for 24 hours": {
    description: {
      en: "Reset your dopamine levels and reconnect with the physical world by going completely offline.",
      id: "Atur ulang kadar dopamin Anda dan terhubung kembali dengan dunia fisik dengan offline sepenuhnya."
    },
    tips: {
      en: ["Let important people know you'll be unreachable.", "Plan offline activities in advance.", "Observe your cravings without giving in."],
      id: ["Beri tahu orang-orang penting bahwa Anda tidak dapat dihubungi.", "Rencanakan aktivitas offline sebelumnya.", "Amati keinginan Anda tanpa menyerah."]
    }
  },
  "Fast for 16 hours one day": {
    description: {
      en: "Give your digestive system a break and practice self-control through intermittent fasting.",
      id: "Istirahatkan sistem pencernaan Anda dan latih pengendalian diri melalui puasa intermiten."
    },
    tips: {
      en: ["Stay hydrated with water and tea.", "Stay busy to avoid thinking about food.", "Break your fast with a nutritious meal."],
      id: ["Tetap terhidrasi dengan air dan teh.", "Tetaplah sibuk agar tidak memikirkan makanan.", "Akhiri puasa Anda dengan makanan bergizi."]
    }
  },
  "Say 3 affirmations": {
    description: {
      en: "Reprogram your subconscious mind by repeating positive statements about yourself.",
      id: "Program ulang pikiran bawah sadar Anda dengan mengulangi pernyataan positif tentang diri Anda."
    },
    tips: {
      en: ["Choose affirmations that resonate with your goals.", "Speak with conviction.", "Repeat them in front of a mirror for more impact."],
      id: ["Pilih afirmasi yang selaras dengan tujuan Anda.", "Bicaralah dengan penuh keyakinan.", "Ulangi di depan cermin untuk dampak yang lebih besar."]
    }
  },
  "Help a neighbor": {
    description: {
      en: "Strengthen your local community through small acts of service and kindness.",
      id: "Perkuat komunitas lokal Anda melalui tindakan pelayanan dan kebaikan yang kecil."
    },
    tips: {
      en: ["Look for simple ways to help, like carrying groceries.", "Be sincere and expect nothing in return.", "Introduce yourself if you haven't yet."],
      id: ["Cari cara sederhana untuk membantu, seperti membawakan belanjaan.", "Tuluslah dan jangan mengharapkan imbalan.", "Perkenalkan diri Anda jika belum."]
    }
  },
  "Watch an educational video": {
    description: {
      en: "Leverage visual learning to understand complex topics or gain new insights.",
      id: "Manfaatkan pembelajaran visual untuk memahami topik yang kompleks atau mendapatkan wawasan baru."
    },
    tips: {
      en: ["Take notes while watching.", "Focus on one specific concept.", "Try to summarize the main points afterwards."],
      id: ["Catat poin penting saat menonton.", "Fokus pada satu konsep spesifik.", "Coba ringkas poin-poin utamanya sesudahnya."]
    }
  },
  "Plan your tomorrow": {
    description: {
      en: "Ensure a productive start by mapping out your top priorities the night before.",
      id: "Pastikan awal yang produktif dengan memetakan prioritas utama Anda pada malam sebelumnya."
    },
    tips: {
      en: ["Identify 3 main tasks.", "Prepare your clothes and bag.", "Visualize a successful day ahead."],
      id: ["Identifikasi 3 tugas utama.", "Siapkan pakaian dan tas Anda.", "Visualisasikan hari yang sukses di depan."]
    }
  },
  "Write Down Worries": {
    description: {
      en: "Externalize your anxieties to gain perspective and reduce mental burden.",
      id: "Keluarkan kecemasan Anda untuk mendapatkan perspektif dan mengurangi beban mental."
    },
    tips: {
      en: ["Write without filtering.", "Identify what's within your control.", "Let go of what you cannot change."],
      id: ["Tulis tanpa menyaring.", "Identifikasi apa yang berada dalam kendali Anda.", "Lepaskan apa yang tidak bisa Anda ubah."]
    }
  },
  "Visit a park": {
    description: {
      en: "Reconnect with nature to lower stress levels and improve your overall well-being.",
      id: "Terhubung kembali dengan alam untuk menurunkan tingkat stres dan meningkatkan kesejahteraan Anda secara keseluruhan."
    },
    tips: {
      en: ["Leave your phone in your pocket.", "Observe the trees, birds, and surroundings.", "Walk at a leisurely pace."],
      id: ["Simpan ponsel Anda di saku.", "Amati pohon, burung, dan sekeliling.", "Berjalanlah dengan santai."]
    }
  },
  "Limit social media": {
    description: {
      en: "Take back your time and mental energy by consciously reducing app usage.",
      id: "Ambil kembali waktu dan energi mental Anda dengan secara sadar mengurangi penggunaan aplikasi."
    },
    tips: {
      en: ["Use app timers on your phone.", "Unfollow accounts that don't add value.", "Set specific times for checking social media."],
      id: ["Gunakan pengatur waktu aplikasi di ponsel Anda.", "Berhenti mengikuti akun yang tidak memberi nilai tambah.", "Tetapkan waktu tertentu untuk mengecek media sosial."]
    }
  },
  "Take a photo of a landscape": {
    description: {
      en: "Practice appreciation and presence by capturing the beauty of your surroundings.",
      id: "Latih apresiasi dan kehadiran dengan mengabadikan keindahan sekeliling Anda."
    },
    tips: {
      en: ["Look for interesting colors or lighting.", "Focus on the composition.", "Appreciate the view before taking the shot."],
      id: ["Cari warna atau pencahayaan yang menarik.", "Fokus pada komposisi.", "Nikmati pemandangan sebelum mengambil foto."]
    }
  },
  "Donate to a charity": {
    description: {
      en: "Contribute to a cause greater than yourself through financial or material support.",
      id: "Berkontribusi pada tujuan yang lebih besar dari diri Anda sendiri melalui dukungan finansial atau materi."
    },
    tips: {
      en: ["Research the organization to ensure it's reputable.", "Even a small amount makes a difference.", "Consider supporting a cause close to your heart."],
      id: ["Riset organisasi tersebut untuk memastikan reputasinya.", "Bahkan jumlah kecil pun membuat perbedaan.", "Pertimbangkan untuk mendukung tujuan yang dekat dengan hati Anda."]
    }
  },
  "Learn a new concept": {
    description: {
      en: "Keep your mind sharp and expand your horizons by exploring something unfamiliar.",
      id: "Jaga agar pikiran tetap tajam dan perluas wawasan Anda dengan menjelajahi sesuatu yang asing."
    },
    tips: {
      en: ["Read an article or watch a short video.", "Try to explain it in simple terms.", "Connect it to something you already know."],
      id: ["Baca artikel atau tonton video pendek.", "Coba jelaskan dalam istilah sederhana.", "Hubungkan dengan sesuatu yang sudah Anda ketahui."]
    }
  },
  "Clean for 20 minutes": {
    description: {
      en: "Deep clean a specific area of your environment to improve your focus and mood.",
      id: "Bersihkan area tertentu di lingkungan Anda secara mendalam untuk meningkatkan fokus dan suasana hati."
    },
    tips: {
      en: ["Put on some upbeat music.", "Focus on one room or task.", "Enjoy the feeling of a clean space afterwards."],
      id: ["Putar musik yang ceria.", "Fokus pada satu ruangan atau tugas.", "Nikmati perasaan ruang yang bersih sesudahnya."]
    }
  },
  "Complete all daily tasks": {
    description: {
      en: "Experience total commitment by finishing every single objective you set for the day.",
      id: "Rasakan komitmen total dengan menyelesaikan setiap tujuan yang Anda tetapkan untuk hari itu."
    },
    tips: {
      en: ["Organize your list by priority.", "Focus on one task at a time.", "Don't stop until the list is clear."],
      id: ["Atur daftar Anda berdasarkan prioritas.", "Fokus pada satu tugas dalam satu waktu.", "Jangan berhenti sampai daftarnya bersih."]
    }
  },
  "Wake up at 5 AM": {
    description: {
      en: "Master your morning. Waking up early provides quiet time for focused growth and planning.",
      id: "Kuasai pagi Anda. Bangun pagi memberikan waktu tenang untuk pertumbuhan dan perencanaan yang terfokus."
    },
    tips: {
      en: ["Go to bed earlier to ensure enough sleep.", "Don't keep your alarm near your bed.", "Have a clear reason to wake up early."],
      id: ["Tidurlah lebih awal untuk memastikan tidur yang cukup.", "Jangan simpan alarm di dekat tempat tidur.", "Miliki alasan yang jelas untuk bangun pagi."]
    }
  },
  "Zero unnecessary spending": {
    description: {
      en: "Practice financial discipline by only spending money on absolute essentials.",
      id: "Latih disiplin finansial dengan hanya menghabiskan uang untuk kebutuhan pokok yang mutlak."
    },
    tips: {
      en: ["Avoid shopping apps and browsing.", "Ask yourself if it's a 'need' or 'want'.", "Track every zero-spend day for motivation."],
      id: ["Hindari aplikasi belanja dan browsing.", "Tanyakan pada diri sendiri apakah itu 'kebutuhan' atau 'keinginan'.", "Pantau setiap hari tanpa pengeluaran untuk motivasi."]
    }
  },
  "Save 10% of income": {
    description: {
      en: "Pay yourself first. Building savings provides security and future freedom.",
      id: "Bayar diri Anda terlebih dahulu. Membangun tabungan memberikan keamanan dan kebebasan di masa depan."
    },
    tips: {
      en: ["Automate the transfer if possible.", "Treat savings like a non-negotiable bill.", "Watch your emergency fund grow over time."],
      id: ["Otomatiskan transfer jika memungkinkan.", "Anggap tabungan seperti tagihan yang tidak bisa ditawar.", "Lihat dana darurat Anda tumbuh seiring waktu."]
    }
  },
  "Spend 6 hours in nature": {
    description: {
      en: "Deep immersion in natural environments can significantly lower stress and restore mental clarity.",
      id: "Perendaman mendalam di lingkungan alami dapat secara signifikan menurunkan stres dan memulihkan kejelasan mental."
    },
    tips: {
      en: ["Find a local forest, trail, or large park.", "Disconnect from all digital devices.", "Observe the ecosystem around you."],
      id: ["Cari hutan, jalur trekking, atau taman besar lokal.", "Putuskan sambungan dari semua perangkat digital.", "Amati ekosistem di sekitar Anda."]
    }
  },
  "Read 10 pages of a book": {
    description: {
      en: "Stimulate your mind and gain knowledge through consistent reading habits.",
      id: "Stimulasi pikiran Anda dan dapatkan pengetahuan melalui kebiasaan membaca yang konsisten."
    },
    tips: {
      en: ["Choose a book you're genuinely interested in.", "Find a quiet spot without distractions.", "Reflect on what you read for 1 minute."],
      id: ["Pilih buku yang benar-benar Anda minati.", "Cari tempat yang tenang tanpa gangguan.", "Renungkan apa yang Anda baca selama 1 menit."]
    }
  },
  "No sugar for 24 hours": {
    description: {
      en: "Take a break from refined sugars to stabilize your energy and reset your palate.",
      id: "Istirahat sejenak dari gula rafinasi untuk menstabilkan energi Anda dan mengatur ulang selera Anda."
    },
    tips: {
      en: ["Check labels of processed foods.", "Focus on eating whole, natural foods.", "Drink plenty of water when you have cravings."],
      id: ["Periksa label makanan olahan.", "Fokus makan makanan utuh dan alami.", "Minum banyak air saat Anda merasa lapar gula."]
    }
  },
  "No caffeine for 24 hours": {
    description: {
      en: "Allow your nervous system to rest and evaluate your natural energy levels.",
      id: "Izinkan sistem saraf Anda beristirahat dan evaluasi tingkat energi alami Anda."
    },
    tips: {
      en: ["Switch to herbal tea or decaf.", "Get extra sleep if you feel a headache.", "Stay hydrated."],
      id: ["Ganti ke teh herbal atau decaf.", "Tidurlah lebih banyak jika Anda merasa pening.", "Tetap terhidrasi."]
    }
  },
  "Cook a healthy meal": {
    description: {
      en: "Take control of your nutrition and practice mindful preparation of your fuel.",
      id: "Kendalikan nutrisi Anda dan latih persiapan penuh perhatian untuk bahan bakar tubuh Anda."
    },
    tips: {
      en: ["Include at least two types of vegetables.", "Use healthy fats like olive oil.", "Focus on the sensory experience of cooking."],
      id: ["Sertakan setidaknya dua jenis sayuran.", "Gunakan lemak sehat seperti minyak zaitun.", "Fokus pada pengalaman sensorik saat memasak."]
    }
  },
  "Write a letter to yourself": {
    description: {
      en: "Practice self-reflection and connect with your future or past self through writing.",
      id: "Latih refleksi diri dan terhubung dengan diri Anda di masa depan atau masa lalu melalui tulisan."
    },
    tips: {
      en: ["Write about your current feelings and goals.", "Be honest and compassionate with yourself.", "Include one piece of advice for your future self."],
      id: ["Tulis tentang perasaan dan tujuan Anda saat ini.", "Jadilah jujur dan penuh kasih pada diri sendiri.", "Sertakan satu nasihat untuk diri Anda di masa depan."]
    }
  },
  "Go to the gym": {
    description: {
      en: "Commit to a dedicated environment for physical improvement and strength building.",
      id: "Berkomitmen pada lingkungan khusus untuk peningkatan fisik dan pembangunan kekuatan."
    },
    tips: {
      en: ["Have a plan before you arrive.", "Focus on proper form over heavy weights.", "Log your session to track progress."],
      id: ["Miliki rencana sebelum Anda tiba.", "Fokus pada bentuk yang benar daripada beban berat.", "Catat sesi Anda untuk memantau kemajuan."]
    }
  },
  "No screen time 1 hour before bed": {
    description: {
      en: "Improve your sleep quality by reducing blue light exposure and mental stimulation.",
      id: "Tingkatkan kualitas tidur Anda dengan mengurangi paparan cahaya biru dan stimulasi mental."
    },
    tips: {
      en: ["Read a physical book instead.", "Charge your phone in another room.", "Dim the lights in your environment."],
      id: ["Baca buku fisik sebagai gantinya.", "Isi daya ponsel Anda di ruangan lain.", "Redupkan lampu di lingkungan Anda."]
    }
  },
  "Take a 20-minute walk": {
    description: {
      en: "A simple and effective way to clear your mind and improve physical circulation.",
      id: "Cara sederhana dan efektif untuk menjernihkan pikiran dan meningkatkan sirkulasi fisik."
    },
    tips: {
      en: ["Leave your headphones off occasionally.", "Notice the small details in your environment.", "Walk at a pace that feels comfortable but active."],
      id: ["Lepaskan headphone sesekali.", "Perhatikan detail kecil di lingkungan Anda.", "Berjalanlah dengan kecepatan yang terasa nyaman namun aktif."]
    }
  },
  "Complete a brain game": {
    description: {
      en: "Challenge your cognitive functions like memory, logic, and pattern recognition.",
      id: "Tantang fungsi kognitif Anda seperti memori, logika, dan pengenalan pola."
    },
    tips: {
      en: ["Try a crossword, Sudoku, or dedicated app.", "Focus fully on the task.", "Try to beat your previous score or time."],
      id: ["Coba teka-teki silang, Sudoku, atau aplikasi khusus.", "Fokus sepenuhnya pada tugas.", "Coba pecahkan skor atau waktu Anda sebelumnya."]
    }
  },
  "Say 'No' to one request": {
    description: {
      en: "Practice setting boundaries to protect your time and energy for what truly matters.",
      id: "Latih menetapkan batasan untuk melindungi waktu dan energi Anda untuk hal yang benar-benar penting."
    },
    tips: {
      en: ["Be polite but firm.", "You don't always need to provide a long explanation.", "Notice the feeling of relief afterwards."],
      id: ["Jadilah sopan tapi tegas.", "Anda tidak selalu perlu memberikan penjelasan panjang.", "Perhatikan perasaan lega sesudahnya."]
    }
  },
  "Brainstorm ideas": {
    description: {
      en: "Unlock your creativity by generating a large quantity of ideas without self-censorship.",
      id: "Buka kreativitas Anda dengan menghasilkan banyak ide tanpa sensor diri."
    },
    tips: {
      en: ["Focus on quantity over quality at first.", "Write everything down.", "Combine or improve on existing ideas."],
      id: ["Fokus pada kuantitas daripada kualitas pada awalnya.", "Tulis semuanya.", "Gabungkan atau tingkatkan ide-ide yang sudah ada."]
    }
  },
  "Create a morning routine": {
    description: {
      en: "Design a predictable start to your day to reduce decision fatigue and build momentum.",
      id: "Rancang awal hari yang dapat diprediksi untuk mengurangi kelelahan keputusan dan membangun momentum."
    },
    tips: {
      en: ["Keep it simple: 3-4 steps max.", "Include physical, mental, and logistical prep.", "Execute the routine every single day."],
      id: ["Tetap sederhana: maks 3-4 langkah.", "Sertakan persiapan fisik, mental, dan logistik.", "Lakukan rutinitas tersebut setiap hari."]
    }
  },
  "Complete your most important task first": {
    description: {
      en: "'Eat the frog'. Handling your hardest task early prevents procrastination and stress.",
      id: "'Makan kataknya'. Menangani tugas tersulit Anda lebih awal mencegah penundaan dan stres."
    },
    tips: {
      en: ["Identify the task the night before.", "Start it before checking email or messages.", "Focus solely on this task until it's done."],
      id: ["Identifikasi tugas tersebut pada malam sebelumnya.", "Mulai sebelum mengecek email atau pesan.", "Fokus hanya pada tugas ini sampai selesai."]
    }
  },
  "Do a end-of-day review": {
    description: {
      en: "Close your day intentionally by reflecting on wins and areas for improvement.",
      id: "Tutup hari Anda dengan sengaja dengan merenungkan kemenangan dan area yang perlu ditingkatkan."
    },
    tips: {
      en: ["Ask yourself: 'What went well today?'", "'What could I have done better?'", "Prepare your priorities for tomorrow."],
      id: ["Tanyakan pada diri sendiri: 'Apa yang berjalan baik hari ini?'", "'Apa yang bisa saya lakukan lebih baik?'", "Siapkan prioritas Anda untuk besok."]
    }
  },
  "Limit social media to 30 minutes": {
    description: {
      en: "Reclaim your life from attention-hungry algorithms by setting strict usage bounds.",
      id: "Rebut kembali hidup Anda dari algoritme yang lapar perhatian dengan menetapkan batasan penggunaan yang ketat."
    },
    tips: {
      en: ["Use app timers or the 'Focus' mode.", "Delete the apps from your home screen.", "Notice how much time you save."],
      id: ["Gunakan pengatur waktu aplikasi atau mode 'Fokus'.", "Hapus aplikasi dari layar utama Anda.", "Perhatikan berapa banyak waktu yang Anda hemat."]
    }
  },
  "Wash your car": {
    description: {
      en: "Take pride in your possessions by maintaining the cleanliness and appearance of your vehicle.",
      id: "Banggalah dengan barang-barang Anda dengan menjaga kebersihan dan penampilan kendaraan Anda."
    },
    tips: {
      en: ["Clean the exterior and interior.", "Check tire pressure while you're at it.", "Enjoy the feeling of a clean ride."],
      id: ["Bersihkan eksterior dan interior.", "Periksa tekanan ban sekalian.", "Nikmati perasaan berkendara yang bersih."]
    }
  },
  "Fix something": {
    description: {
      en: "Exercise your problem-solving skills and improve your surroundings by repairing what's broken.",
      id: "Latih keterampilan pemecahan masalah Anda dan tingkatkan sekeliling Anda dengan memperbaiki apa yang rusak."
    },
    tips: {
      en: ["Start with something small like a loose screw.", "Look up a tutorial if you're unsure.", "Appreciate the restored functionality."],
      id: ["Mulai dengan sesuatu yang kecil seperti sekrup yang longgar.", "Cari tutorial jika Anda tidak yakin.", "Hargai fungsionalitas yang telah dipulihkan."]
    }
  },
  "Do all your laundry": {
    description: {
      en: "Maintain personal hygiene and organization by ensuring all your clothes are clean and ready.",
      id: "Jaga kebersihan dan pengorganisasian diri dengan memastikan semua pakaian Anda bersih dan siap."
    },
    tips: {
      en: ["Sort by color and fabric type.", "Set a timer to remember to switch loads.", "Fold and put them away immediately after drying."],
      id: ["Sortir berdasarkan warna dan jenis kain.", "Atur pengatur waktu untuk mengingat penggantian muatan.", "Lipat dan simpan segera setelah kering."]
    }
  },
  "Clean the bathroom": {
    description: {
      en: "Promote health and comfort by sanitizing one of the most essential areas of your home.",
      id: "Tingkatkan kesehatan dan kenyamanan dengan mensanitasi salah satu area terpenting di rumah Anda."
    },
    tips: {
      en: ["Use appropriate cleaning products.", "Focus on the sink, toilet, and floor.", "Keep it ventilated while cleaning."],
      id: ["Gunakan produk pembersih yang sesuai.", "Fokus pada wastafel, toilet, dan lantai.", "Jaga ventilasi saat membersihkan."]
    }
  }
};

export const getMissionDetails = (missionText: string): MissionDetail | null => {
  // Try exact match first
  if (MISSION_DETAILS[missionText]) {
    return MISSION_DETAILS[missionText];
  }

  // Try partial match or regex for common patterns
  const entries = Object.entries(MISSION_DETAILS);
  for (const [key, detail] of entries) {
    if (missionText.toLowerCase().includes(key.toLowerCase())) {
      return detail;
    }
  }

  // Default generic details based on keywords
  const lowerText = missionText.toLowerCase();
  
  if (lowerText.includes("clean") || lowerText.includes("organize") || lowerText.includes("declutter") || lowerText.includes("tidy") || lowerText.includes("wash") || lowerText.includes("wipe")) {
    return {
      description: {
        en: "Improving your environment boosts mental clarity and produces a sense of order.",
        id: "Meningkatkan lingkungan Anda meningkatkan kejelasan mental dan menghasilkan rasa keteraturan."
      },
      tips: {
        en: ["Set a timer for a short burst of activity.", "Focus on one small area at a time.", "Listen to upbeat music to stay motivated."],
        id: ["Pasang timer untuk aktivitas singkat.", "Fokus pada satu area kecil dalam satu waktu.", "Dengarkan musik yang ceria agar tetap termotivasi."]
      }
    };
  }

  if (lowerText.includes("read") || lowerText.includes("learn") || lowerText.includes("study") || lowerText.includes("tutorial") || lowerText.includes("article") || lowerText.includes("book") || lowerText.includes("baca") || lowerText.includes("belajar")) {
    return {
      description: {
        en: "Knowledge is power. Continuous learning broadens your perspective and sharpens your mind.",
        id: "Pengetahuan adalah kekuatan. Belajar terus-menerus memperluas perspektif dan mempertajam pikiran Anda."
      },
      tips: {
        en: ["Eliminate distractions before you start.", "Take notes on key concepts.", "Try to explain what you learned to someone else."],
        id: ["Hilangkan gangguan sebelum memulai.", "Catat konsep-konsep kunci.", "Coba jelaskan apa yang kamu pelajari kepada orang lain."]
      }
    };
  }

  if (lowerText.includes("exercise") || lowerText.includes("walk") || lowerText.includes("squat") || lowerText.includes("push-up") || lowerText.includes("run") || lowerText.includes("workout") || lowerText.includes("plank") || lowerText.includes("gym") || lowerText.includes("olahraga") || lowerText.includes("lari")) {
    return {
      description: {
        en: "Your body is your vehicle. Regular movement is essential for long-term health and vitality.",
        id: "Tubuh Anda adalah kendaraan Anda. Gerakan teratur sangat penting untuk kesehatan dan vitalitas jangka panjang."
      },
      tips: {
        en: ["Focus on proper form over speed.", "Stay hydrated.", "Consistency is more important than intensity."],
        id: ["Fokus pada bentuk yang benar daripada kecepatan.", "Tetap terhidrasi.", "Konsistensi lebih penting daripada intensitas."]
      }
    };
  }

  if (lowerText.includes("meditate") || lowerText.includes("breath") || lowerText.includes("calm") || lowerText.includes("silence") || lowerText.includes("reflection")) {
    return {
      description: {
        en: "Mental stillness allows your mind to recover and increases emotional resilience.",
        id: "Ketenangan mental memungkinkan pikiran Anda pulih dan meningkatkan ketahanan emosional."
      },
      tips: {
        en: ["Find a quiet space.", "Focus on the sensation of breathing.", "Don't judge your thoughts, just let them pass."],
        id: ["Cari ruang yang tenang.", "Fokus pada sensasi pernapasan.", "Jangan menghakimi pikiran Anda, biarkan mereka berlalu."]
      }
    };
  }

  if (lowerText.includes("call") || lowerText.includes("text") || lowerText.includes("talk") || lowerText.includes("meet") || lowerText.includes("friend") || lowerText.includes("social")) {
    return {
      description: {
        en: "Meaningful social interaction is essential for human connection and happiness.",
        id: "Interaksi sosial yang bermakna sangat penting untuk hubungan manusia dan kebahagiaan."
      },
      tips: {
        en: ["Be a Good Listener.", "Ask open-ended questions.", "Be present in the moment."],
        id: ["Jadilah pendengar yang baik.", "Ajukan pertanyaan terbuka.", "Hadir sepenuhnya pada saat itu."]
      }
    };
  }

  if (lowerText.includes("goal") || lowerText.includes("target") || lowerText.includes("plan") || lowerText.includes("review") || lowerText.includes("tinjau") || lowerText.includes("rencana")) {
    return {
      description: {
        en: "Strategic thinking and regular review keep you aligned with your long-term vision.",
        id: "Berpikir strategis dan peninjauan rutin membuat Anda tetap selaras dengan visi jangka panjang Anda."
      },
      tips: {
        en: ["Be honest about your progress.", "Adjust your plan if necessary.", "Focus on actionable next steps."],
        id: ["Jujur tentang kemajuan Anda.", "Sesuaikan rencana jika perlu.", "Fokus pada langkah selanjutnya yang dapat ditindaklanjuti."]
      }
    };
  }

  if (lowerText.includes("task") || lowerText.includes("todo") || lowerText.includes("priorit") || lowerText.includes("finish") || lowerText.includes("complete")) {
    return {
      description: {
        en: "Focusing on execution and completing your tasks is the most direct path to progress.",
        id: "Fokus pada eksekusi dan menyelesaikan tugas Anda adalah jalur paling langsung menuju kemajuan."
      },
      tips: {
        en: ["Do the hardest task first.", "Avoid multitasking.", "Acknowledge the satisfaction of completion."],
        id: ["Lakukan tugas tersulit terlebih dahulu.", "Hindari multitasking.", "Akui kepuasan setelah menyelesaikan tugas."]
      }
    };
  }

  return {
    description: {
      en: "A small step towards a better you. Every completed mission builds discipline and momentum.",
      id: "Langkah kecil menuju diri yang lebih baik. Setiap misi yang selesai membangun disiplin dan momentum."
    },
    tips: {
      en: ["Focus on the process, not just the result.", "Take it one step at a time.", "Acknowledge your progress."],
      id: ["Fokus pada prosesnya, bukan hanya hasilnya.", "Lakukan langkah demi langkah.", "Akui kemajuan kamu."]
    }
  };
};
