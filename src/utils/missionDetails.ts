
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
  "Organize your files for 5 minutes": {
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
  "Plan your week for 15 minutes": {
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
  "Goal": {
    description: {
      en: "Setting clear goals provides a roadmap for your efforts and keeps you motivated.",
      id: "Menetapkan tujuan yang jelas memberikan peta jalan bagi upaya kamu dan membuat kamu tetap termotivasi."
    },
    tips: {
      en: [
        "Use the SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound).",
        "Break large goals into smaller, manageable steps.",
        "Visualize the successful completion of your goal."
      ],
      id: [
        "Gunakan kriteria SMART (Spesifik, Terukur, Dapat Dicapai, Relevan, Terikat Waktu).",
        "Pecah tujuan besar menjadi langkah-langkah kecil yang dapat dikelola.",
        "Visualisasikan keberhasilan penyelesaian tujuan kamu."
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
  "Drink a glass of water upon waking": {
    description: {
      en: "Rehydrate your body after a long night's sleep to kickstart your metabolism and brain function.",
      id: "Rehidrasi tubuh kamu setelah tidur malam yang panjang untuk memulai metabolisme dan fungsi otak."
    },
    tips: {
      en: [
        "Keep a glass or bottle of water by your bedside.",
        "Drink it before checking your phone.",
        "Try adding a slice of lemon for an extra boost."
      ],
      id: [
        "Siapkan segelas atau sebotol air di samping tempat tidur.",
        "Minum sebelum mengecek ponsel kamu.",
        "Coba tambahkan irisan lemon untuk kesegaran ekstra."
      ]
    }
  },
  "Meditate for 5 minutes": {
    description: {
      en: "Quiet your mind and practice presence to reduce stress and improve focus.",
      id: "Tenangkan pikiran dan latih kehadiran untuk mengurangi stres dan meningkatkan fokus."
    },
    tips: {
      en: [
        "Find a quiet spot where you won't be interrupted.",
        "Focus on the sensation of your breath entering and leaving your body.",
        "When your mind wanders, gently bring it back to your breath."
      ],
      id: [
        "Cari tempat tenang di mana kamu tidak akan terganggu.",
        "Fokus pada sensasi napas yang masuk dan keluar dari tubuh.",
        "Saat pikiran melantur, perlahan kembalikan fokus ke napas."
      ]
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
  if (missionText.toLowerCase().includes("clean") || missionText.toLowerCase().includes("organize")) {
    return {
      description: {
        en: "Tidying up your environment helps clear your mind and improve productivity.",
        id: "Merapikan lingkungan membantu menjernihkan pikiran dan meningkatkan produktivitas."
      },
      tips: {
        en: ["Set a timer for a short burst of activity.", "Focus on one small area at a time.", "Listen to upbeat music to stay motivated."],
        id: ["Pasang timer untuk aktivitas singkat.", "Fokus pada satu area kecil dalam satu waktu.", "Dengarkan musik yang ceria agar tetap termotivasi."]
      }
    };
  }

  if (missionText.toLowerCase().includes("read") || missionText.toLowerCase().includes("learn") || missionText.toLowerCase().includes("study")) {
    return {
      description: {
        en: "Continuous learning is key to personal and professional growth.",
        id: "Belajar terus-menerus adalah kunci pertumbuhan pribadi dan profesional."
      },
      tips: {
        en: ["Eliminate distractions before you start.", "Take notes on key concepts.", "Try to explain what you learned to someone else."],
        id: ["Hilangkan gangguan sebelum memulai.", "Catat konsep-konsep kunci.", "Coba jelaskan apa yang kamu pelajari kepada orang lain."]
      }
    };
  }

  if (missionText.toLowerCase().includes("exercise") || missionText.toLowerCase().includes("walk") || missionText.toLowerCase().includes("squat") || missionText.toLowerCase().includes("push-up")) {
    return {
      description: {
        en: "Physical activity boosts your energy, mood, and overall health.",
        id: "Aktivitas fisik meningkatkan energi, suasana hati, dan kesehatan secara keseluruhan."
      },
      tips: {
        en: ["Focus on proper form over speed.", "Stay hydrated.", "Consistency is more important than intensity."],
        id: ["Fokus pada bentuk yang benar daripada kecepatan.", "Tetap terhidrasi.", "Konsistensi lebih penting daripada intensitas."]
      }
    };
  }

  return null;
};
