import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../utils/sounds';
import { useState, useEffect } from 'react';
import { ShieldAlert, Zap, Scale, Heart, Smile } from 'lucide-react';

interface IntegrityCheckModalProps {
  username: string;
  language: 'id' | 'en';
  onClose: () => void;
}

const IntegrityCheckModal = ({ username, language, onClose }: IntegrityCheckModalProps) => {
  const [step, setStep] = useState<'initial' | 'double-check' | 'lie-response' | 'truth-response'>('initial');
  const [variationIndex, setVariationIndex] = useState(0);
  const [scaryIndex, setScaryIndex] = useState(0);

  const variations = [
    {
      id: `${username}, Tuhan liat lu, tapi yang paling rugi itu masa depan lu sendiri. Beneran udah kelar?`,
      en: `${username}, God is watching you, but the one who loses the most is your own future. Is it really done?`
    },
    {
      id: `${username}, lu bisa bohong ke aplikasi ini, tapi lu gak bisa bohong ke diri lu sendiri. Jujur, tadi beneran dikerjain?`,
      en: `${username}, you can lie to this app, but you can't lie to yourself. Honestly, did you actually do it?`
    },
    {
      id: `${username}, integritas itu apa yang lu lakuin pas gak ada orang liat. Masa depan lu dibangun dari kejujuran hari ini. Yakin?`,
      en: `${username}, integrity is what you do when no one is watching. Your future is built on today's honesty. You sure?`
    },
    {
      id: `${username}, setiap kali lu bohong demi XP, lu sebenernya lagi nuker masa depan lu sama angka kosong. Beneran udah?`,
      en: `${username}, every time you lie for XP, you're actually trading your future for empty numbers. Is it really done?`
    },
    {
      id: `${username}, lu lagi nipu diri sendiri atau beneran progres? Inget, masa depan lu gak bisa di-cheat. Jujur ya?`,
      en: `${username}, are you fooling yourself or actually progressing? Remember, your future cannot be cheated. Be honest?`
    },
    {
      id: `XP itu cuma angka, tapi karakter lu itu nyata. Lu mau jadi pemenang atau cuma penipu di mata diri sendiri, ${username}?`,
      en: `XP is just a number, but your character is real. Do you want to be a winner or just a fraud in your own eyes, ${username}?`
    },
    {
      id: `Bayangin lu di masa depan liat lu yang sekarang lagi bohong. Dia bangga atau kecewa, ${username}? Beneran udah kelar?`,
      en: `Imagine your future self looking at you lying right now. Would they be proud or disappointed, ${username}? Is it really done?`
    },
    {
      id: `Satu kebohongan kecil hari ini adalah lubang besar buat disiplin lu besok. Beneran udah selesai misinya, ${username}?`,
      en: `One small lie today is a big hole in your discipline tomorrow. Is the mission really finished, ${username}?`
    }
  ];

  const scaryMessages = [
    {
      id: "Tuhan tahu isi hati lu. Kalau lu bohong sekarang, lu bukan cuma nipu aplikasi, tapi lu lagi ngerusak takdir lu sendiri. Sekali lagi, beneran jujur?",
      en: "God knows what's in your heart. If you lie now, you're not just fooling an app, you're damaging your own destiny. Once again, are you really being honest?"
    },
    {
      id: "Malaikat lagi nyatet, dan masa depan lu lagi ngeliatin. Kalau lu bohong, lu gak bakal pernah tenang sama hasil yang lu dapet. Yakin mau lanjut?",
      en: "Angels are watching, and your future self is observing. If you lie, you will never find peace with the results you get. Are you sure you want to proceed?"
    },
    {
      id: "Kebohongan adalah racun buat mental juara. Kalau lu bohong, lu selamanya bakal jadi pecundang di mata diri lu sendiri. Masih mau bilang jujur?",
      en: "Lies are poison for a winner's mentality. If you lie, you will forever be a loser in your own eyes. Do you still want to say you're being honest?"
    },
    {
      id: "Integritas itu mahal harganya. Jangan tuker harga diri lu cuma buat XP receh. Kalau lu bohong, lu lagi ngehancurin diri sendiri. Beneran jujur?",
      en: "Integrity is expensive. Don't trade your self-respect for cheap XP. If you lie, you are destroying yourself. Are you really being honest?"
    }
  ];

  useEffect(() => {
    setVariationIndex(Math.floor(Math.random() * variations.length));
    setScaryIndex(Math.floor(Math.random() * scaryMessages.length));
    sounds.playNotification();
  }, []);

  const handleInitialTruth = () => {
    setStep('double-check');
    sounds.playTing();
  };

  const handleLie = () => {
    setStep('lie-response');
    sounds.playTing();
  };

  const handleFinalTruth = () => {
    setStep('truth-response');
    sounds.playLevelUp();
  };

  const lieResponses = [
    {
      id: "Gak apa-apa, gua gak bakal marah. Tapi inget, setiap kebohongan kecil itu pelan-pelan ngerusak disiplin yang lagi lu bangun. Besok coba lebih jujur ya.",
      en: "It's okay, I won't be mad. But remember, every small lie slowly erodes the discipline you're building. Try to be more honest tomorrow."
    },
    {
      id: "Santai aja, kita semua pernah khilaf. Cuma ya itu, yang rugi bukan aplikasinya, tapi progres lu sendiri. Yuk, mulai lagi dengan lebih bener.",
      en: "Take it easy, we all have lapses. But the thing is, it's not the app that loses, it's your own progress. Let's start again properly."
    }
  ];

  const selectedLieResponse = lieResponses[Math.floor(Math.random() * lieResponses.length)];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/95 backdrop-blur-xl">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-surface border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative background element */}
          <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl transition-colors duration-500 ${step === 'double-check' ? 'bg-rose-500/20' : 'bg-purple-500/10'}`} />
          <div className={`absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl transition-colors duration-500 ${step === 'double-check' ? 'bg-rose-500/20' : 'bg-accent/10'}`} />

          <div className="relative z-10">
            {step === 'initial' && (
              <>
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-white/10">
                  <ShieldAlert className="w-8 h-8 text-secondary" />
                </div>
                
                <h2 className="text-xl font-display font-black text-white text-center mb-8 leading-relaxed tracking-tight">
                  {language === 'id' ? variations[variationIndex].id : variations[variationIndex].en}
                </h2>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={handleInitialTruth}
                    className="w-full py-4 bg-accent text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-accent/20"
                  >
                    {language === 'id' ? 'GUA JUJUR' : 'I AM HONEST'}
                  </button>
                  <button
                    onClick={handleLie}
                    className="w-full py-4 bg-white/5 text-secondary font-bold rounded-2xl hover:bg-white/10 transition-colors active:scale-95"
                  >
                    {language === 'id' ? 'GUA BOHONG' : 'I LIED'}
                  </button>
                </div>
              </>
            )}

            {step === 'double-check' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-rose-500/30">
                  <Scale className="w-8 h-8 text-rose-500 animate-pulse" />
                </div>
                
                <h2 className="text-xl font-display font-black text-rose-500 uppercase tracking-tighter mb-4 italic">
                  {language === 'id' ? 'PERINGATAN TERAKHIR' : 'FINAL WARNING'}
                </h2>

                <p className="text-lg text-zinc-200 mb-8 leading-relaxed font-medium tracking-tight">
                  {language === 'id' ? scaryMessages[scaryIndex].id : scaryMessages[scaryIndex].en}
                </p>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={handleFinalTruth}
                    className="w-full py-4 bg-rose-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-rose-700 transition-colors active:scale-95 shadow-lg shadow-rose-600/20"
                  >
                    {language === 'id' ? 'TETEP JUJUR' : 'STILL HONEST'}
                  </button>
                  <button
                    onClick={handleLie}
                    className="w-full py-4 bg-white/5 text-secondary font-bold rounded-2xl hover:bg-white/10 transition-colors active:scale-95"
                  >
                    {language === 'id' ? 'SEBENERNYA GUA BOHONG' : 'ACTUALLY I LIED'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'lie-response' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-white/10">
                  <Smile className="w-8 h-8 text-secondary" />
                </div>
                <p className="text-lg text-zinc-300 mb-8 leading-relaxed font-medium tracking-tight">
                  {language === 'id' ? selectedLieResponse.id : selectedLieResponse.en}
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-white/5 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-colors active:scale-95"
                >
                  {language === 'id' ? 'MENGERTI' : 'UNDERSTOOD'}
                </button>
              </motion.div>
            )}

            {step === 'truth-response' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-green-500/30">
                  <Zap className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-display font-black text-white mb-4 uppercase tracking-tight italic">
                  {language === 'id' ? 'GOKIL!' : 'AWESOME!'}
                </h3>
                <p className="text-lg text-zinc-300 mb-8 leading-relaxed font-medium tracking-tight">
                  {language === 'id' 
                    ? `Keren banget, ${username}. Kejujuran itu pondasi paling kuat buat jadi versi terbaik diri lu. Terusin semangatnya!`
                    : `That's great, ${username}. Honesty is the strongest foundation for becoming the best version of yourself. Keep it up!`}
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-accent text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-accent/20"
                >
                  {language === 'id' ? 'LANJUTKAN' : 'CONTINUE'}
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default IntegrityCheckModal;
