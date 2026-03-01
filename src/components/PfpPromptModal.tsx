import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X } from 'lucide-react';
import ImageCropper from './ImageCropper';

interface PfpPromptModalProps {
  language: 'en' | 'id';
  onComplete: (croppedImageBase64: string | null) => void;
}

export default function PfpPromptModal({ language, onComplete }: PfpPromptModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setPreviewImage(null);
    onComplete(croppedImage);
  };

  const cancelCrop = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-background/90 backdrop-blur-md flex flex-col items-center justify-center px-6"
      >
        <div className="bg-surface border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center max-w-sm w-full shadow-2xl shadow-accent/20">
          <div className="w-24 h-24 bg-background border-2 border-accent rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(242,125,38,0.3)]">
            <Camera className="w-10 h-10 text-accent" />
          </div>
          
          <h2 className="text-2xl font-display font-black mb-2">
            {language === 'id' ? 'Pasang Foto Profil' : 'Set Profile Picture'}
          </h2>
          <p className="text-secondary text-sm mb-8">
            {language === 'id' 
              ? 'Biar makin keren di Leaderboard, yuk pasang foto profil lu sekarang!' 
              : 'Stand out on the Leaderboard by setting up your profile picture now!'}
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-xl bg-accent text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(242,125,38,0.3)] hover:bg-accent/90 transition-colors"
            >
              <Camera className="w-5 h-5" />
              {language === 'id' ? 'Pilih Foto' : 'Choose Photo'}
            </button>
            <button 
              onClick={() => onComplete(null)}
              className="w-full py-3 rounded-xl bg-white/5 text-secondary font-bold hover:bg-white/10 hover:text-white transition-colors"
            >
              {language === 'id' ? 'Nanti Aja' : 'Skip for Now'}
            </button>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {previewImage && (
          <ImageCropper 
            imageSrc={previewImage} 
            onCropComplete={handleCropComplete} 
            onCancel={cancelCrop} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
