import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Image as ImageIcon, Upload, X, CheckCircle2 } from 'lucide-react';
import { Post, UserState } from '../store';

interface CreatePostScreenProps {
  state: UserState;
  onPost: (post: Post) => void;
  onCancel: () => void;
}

export default function CreatePostScreen({ state, onPost, onCancel }: CreatePostScreenProps) {
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    setFileType(isVideo ? 'video' : 'image');

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!previewUrl) return;

    // Compress image if it's an image
    if (fileType === 'image') {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        const newPost: Post = {
          id: `${Date.now()}-${Math.random()}`,
          author: state.username,
          authorImage: state.profilePicture,
          type: 'image',
          url: compressedUrl,
          caption,
          likes: 0,
          createdAt: Date.now(),
        };

        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          onPost(newPost);
        }, 1500);
      };
      img.src = previewUrl;
    } else {
      // For video, we can't easily compress on client side without heavy libraries,
      // so we just pass it through (though this might hit quota limits quickly)
      const newPost: Post = {
        id: `${Date.now()}-${Math.random()}`,
        author: state.username,
        authorImage: state.profilePicture,
        type: 'video',
        url: previewUrl,
        caption,
        likes: 0,
        createdAt: Date.now(),
      };

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        onPost(newPost);
      }, 1500);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col h-full bg-background overflow-y-auto pb-24 px-6 pt-12 relative"
    >
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-surface border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3"
          >
            <CheckCircle2 className="w-5 h-5 text-accent" />
            <span className="font-bold text-sm">Post created successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-display font-bold tracking-tight">Create Post</h1>
        <button onClick={onCancel} className="p-2 rounded-full bg-surface border border-white/10 hover:bg-white/10 transition-colors">
          <X className="w-5 h-5 text-secondary" />
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        {!previewUrl ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center bg-surface/50 hover:bg-surface transition-colors cursor-pointer mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-accent" />
            </div>
            <p className="text-lg font-bold text-primary mb-2">Upload Media</p>
            <p className="text-sm text-secondary text-center max-w-[200px]">
              Select a photo or video to share with the community
            </p>
          </div>
        ) : (
          <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden bg-black mb-6 border border-white/10">
            {fileType === 'image' ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <video src={previewUrl} className="w-full h-full object-cover" controls />
            )}
            <button 
              onClick={() => {
                setPreviewUrl(null);
                setFileType(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20 hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*,video/*" 
          className="hidden" 
        />

        <div className="mb-6">
          <label className="block text-sm font-bold text-secondary mb-2 uppercase tracking-wider">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write something inspiring..."
            className="w-full bg-surface border border-white/10 rounded-2xl p-4 text-primary focus:outline-none focus:border-accent resize-none h-32"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!previewUrl}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            previewUrl 
              ? 'bg-primary text-background hover:bg-gray-200 shadow-lg shadow-primary/20' 
              : 'bg-surface text-secondary cursor-not-allowed border border-white/5'
          }`}
        >
          Share Post
        </button>
      </div>
    </motion.div>
  );
}
