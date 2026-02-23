import { motion } from 'motion/react';
import { Post } from '../store';
import { Heart, MessageCircle, Share2, User } from 'lucide-react';
import { useState } from 'react';

interface FeedScreenProps {
  posts: Post[];
  onLike: (id: string) => void;
}

export default function FeedScreen({ posts, onLike }: FeedScreenProps) {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const handleLike = (id: string) => {
    if (!likedPosts.has(id)) {
      onLike(id);
      setLikedPosts(new Set([...likedPosts, id]));
    }
  };

  return (
    <div className="flex flex-col h-full bg-black overflow-y-auto snap-y snap-mandatory no-scrollbar pb-16">
      {posts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-secondary">
          No posts yet. Be the first to post!
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="relative w-full h-[calc(100vh-4rem)] snap-start snap-always shrink-0 bg-black flex items-center justify-center overflow-hidden">
            {/* Background blur for images that don't fit */}
            {post.type === 'image' && (
              <div 
                className="absolute inset-0 opacity-30 blur-2xl scale-110"
                style={{ backgroundImage: `url(${post.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
            )}
            
            {post.type === 'image' ? (
              <img src={post.url} alt="Post" className="relative z-10 max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
            ) : (
              <video src={post.url} className="relative z-10 max-w-full max-h-full object-contain" autoPlay loop controls playsInline />
            )}

            {/* Overlay UI */}
            <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 z-30 flex items-end justify-between pointer-events-auto pb-24">
              <div className="flex-1 pr-12">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-surface flex items-center justify-center">
                    {post.authorImage ? (
                      <img src={post.authorImage} alt="Author" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-secondary" />
                    )}
                  </div>
                  <span className="font-bold text-white drop-shadow-md">{post.author}</span>
                </div>
                <p className="text-white text-sm drop-shadow-md line-clamp-3">{post.caption}</p>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <button 
                  onClick={() => handleLike(post.id)}
                  className="flex flex-col items-center group"
                >
                  <div className={`p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 transition-colors ${likedPosts.has(post.id) ? 'bg-rose-500/20 border-rose-500/50' : 'group-hover:bg-white/10'}`}>
                    <Heart className={`w-7 h-7 ${likedPosts.has(post.id) ? 'text-rose-500 fill-rose-500' : 'text-white'}`} />
                  </div>
                  <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{post.likes}</span>
                </button>
                
                <button className="flex flex-col items-center group">
                  <div className="p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 group-hover:bg-white/10 transition-colors">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-white text-xs font-bold mt-1 drop-shadow-md">0</span>
                </button>

                <button className="flex flex-col items-center group">
                  <div className="p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 group-hover:bg-white/10 transition-colors">
                    <Share2 className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-white text-xs font-bold mt-1 drop-shadow-md">Share</span>
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
