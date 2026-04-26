import React, { memo } from 'react';
import { motion } from 'motion/react';
import { User } from 'lucide-react';

interface ProfileFrameProps {
  frame: string | null;
  src: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

function ProfileFrame({ frame, src, size = 'md' }: ProfileFrameProps) {
  const sizeClass = 
    size === 'sm' ? 'w-10 h-10' : 
    size === 'md' ? 'w-16 h-16' : 
    size === 'lg' ? 'w-20 h-20' : 
    size === 'xl' ? 'w-28 h-28' :
    'w-40 h-40';
  
  const iconSize = 
    size === 'sm' ? 'text-[10px]' : 
    size === 'md' ? 'text-sm' : 
    size === 'lg' ? 'text-xl' : 
    size === 'xl' ? 'text-3xl' :
    'text-5xl';

  let bgClass = 'bg-surface';
  let borderClass = '';
  let decorations = null;
  let shapeClass = 'rounded-full';

  switch (frame) {
    case 'frame-bronze':
      bgClass = 'bg-orange-700';
      borderClass = 'p-1';
      break;
    case 'frame-silver':
      bgClass = 'bg-gray-300';
      borderClass = 'p-1';
      break;
    case 'frame-gold':
      bgClass = 'bg-amber-400';
      borderClass = 'p-1';
      break;
    case 'frame-platinum':
      bgClass = 'bg-cyan-400';
      borderClass = 'p-1';
      break;
    case 'frame-diamond':
      bgClass = 'bg-blue-500';
      borderClass = 'p-1.5';
      break;
    case 'frame-master':
      bgClass = 'bg-purple-600';
      borderClass = 'p-1.5';
      break;
    case 'frame-grandmaster':
      bgClass = 'bg-yellow-500';
      borderClass = 'p-[4px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 shadow-[0_0_20px_rgba(234,179,8,0.6)] bg-amber-900">
          <div className="absolute inset-[-20%] rounded-full bg-[conic-gradient(from_0deg,transparent,#facc15,transparent,#fbbf24,transparent)] animate-[spin_3s_linear_infinite] opacity-40 will-change-transform" />
          <div className="absolute inset-0 rounded-full border-2 border-yellow-300 shadow-[inset_0_0_10px_rgba(253,224,71,0.4)]" />
        </div>
      );
      break;
    case 'frame-challenger':
      bgClass = 'bg-rose-600';
      borderClass = 'p-1.5';
      break;
    case 'frame-legend':
      bgClass = 'bg-emerald-500';
      borderClass = 'p-1.5';
      break;
    case 'frame-mythic':
      bgClass = 'bg-black';
      borderClass = 'p-[5px]';
      shapeClass = 'rounded-full';
      decorations = (
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          {/* Blackhole Accretion Disk - More intense */}
          <div className="absolute inset-[-40%] rounded-full bg-[conic-gradient(from_0deg,transparent,#7c3aed,#c084fc,#7c3aed,transparent)] animate-[spin_1.5s_linear_infinite] blur-md opacity-90 will-change-transform" />
          
          {/* Event Horizon Glow */}
          <div className="absolute inset-[-20%] rounded-full bg-violet-600/50 blur-2xl animate-pulse will-change-[opacity,transform]" />
          
          {/* Swirling energy */}
          <div className="absolute inset-0 rounded-full overflow-hidden bg-black">
            <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#000,#4c1d95,#7c3aed,#c084fc,#000)] animate-[spin_2s_linear_infinite] opacity-95 will-change-transform" />
            
            {/* Distorted inner ring */}
            <motion.div 
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4], rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[1px] rounded-full border-2 border-violet-300/40 border-dashed will-change-transform"
            />
          </div>
          
          {/* Dark center shadow */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_30px_rgba(0,0,0,1)] z-10" />
        </div>
      );
      break;
    case 'frame-rgb':
      bgClass = 'bg-transparent';
      borderClass = 'p-[2px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden">
          <div className="absolute inset-[-50%] rounded-full bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)] animate-[spin_2s_linear_infinite] will-change-transform" />
        </div>
      );
      break;
    case 'frame-neon':
      bgClass = 'bg-transparent';
      borderClass = 'p-[3px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 shadow-[0_0_15px_#f20089,inset_0_0_15px_#f20089] border border-[#f20089]" />
      );
      break;
    case 'frame-fire':
      bgClass = 'bg-transparent';
      borderClass = 'p-[3px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 bg-gradient-to-t from-rose-600 via-accent to-rose-400 animate-pulse blur-[2px]" />
      );
      break;
    case 'frame-cyberpunk':
      bgClass = 'bg-transparent';
      borderClass = 'p-[4px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 border-4 border-dashed border-accent animate-[spin_10s_linear_infinite]" />
      );
      break;
    case 'frame-hologram':
      bgClass = 'bg-transparent';
      borderClass = 'p-[2px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 bg-cyan-400/30 blur-md animate-pulse" />
      );
      break;
    case 'frame-celestial':
      bgClass = 'bg-transparent';
      borderClass = 'p-[3px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_20px_#8b5cf6,inset_0_0_15px_#8b5cf6]">
          <div className="absolute inset-[-50%] rounded-full bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] animate-[spin_3s_linear_infinite] opacity-50" />
          <div className="absolute inset-0 rounded-full border-2 border-violet-500" />
        </div>
      );
      break;
    case 'frame-void':
      bgClass = 'bg-transparent';
      borderClass = 'p-[5px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_25px_#000000,inset_0_0_25px_#4c1d95] bg-black/80">
          <div className="absolute inset-[-50%] rounded-full bg-[conic-gradient(from_0deg,#000,#4c1d95,#000)] animate-[spin_4s_linear_infinite] opacity-90 blur-sm" />
          <div className="absolute inset-0 rounded-full border-4 border-black/80" />
        </div>
      );
      break;
    case 'frame-aurora':
      bgClass = 'bg-transparent';
      borderClass = 'p-[5px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_20px_#10b981,inset_0_0_20px_#3b82f6]">
          <div className="absolute inset-[-50%] rounded-full bg-[conic-gradient(from_0deg,#10b981,#3b82f6,#8b5cf6,#10b981)] animate-[spin_5s_linear_infinite] opacity-90 blur-md" />
          <div className="absolute inset-0 rounded-full border-4 border-teal-400/50" />
        </div>
      );
      break;
    case 'frame-radiant':
      bgClass = 'bg-transparent';
      borderClass = 'p-[4px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_25px_#fbbf24,inset_0_0_15px_#fbbf24]">
          <div className="absolute inset-[-50%] rounded-full bg-[conic-gradient(from_0deg,transparent_0_45deg,#fbbf24_90deg,transparent_135deg,#fbbf24_180deg,transparent_225deg,#fbbf24_270deg,transparent_315deg,#fbbf24_360deg)] animate-[spin_8s_linear_infinite] opacity-80" />
          <div className="absolute inset-0 rounded-full border border-white" />
        </div>
      );
      break;
    case 'frame-abyssal':
      bgClass = 'bg-black';
      borderClass = 'p-[5px]';
      shapeClass = 'rounded-full';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_20px_#991b1b] bg-black">
          {/* Deep red swirling void */}
          <div className="absolute inset-[-50%] rounded-full bg-[conic-gradient(from_0deg,transparent,#991b1b,#450a0a,transparent)] animate-[spin_3s_linear_infinite] opacity-80 blur-sm" />
          
          {/* Dark pulsing overlay */}
          <div className="absolute inset-0 rounded-full bg-black/40 animate-[pulse_3s_ease-in-out_infinite]" />
          
          {/* Inner border */}
          <div className="absolute inset-0 rounded-full border-[2px] border-red-900 shadow-[0_0_10px_#dc2626]" />
        </div>
      );
      break;
    case 'frame-inferno':
      bgClass = 'bg-transparent';
      borderClass = 'p-[5px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_20px_#ea580c] bg-orange-950">
          <div className="absolute inset-[-50%] rounded-full bg-[conic-gradient(from_0deg,#9a3412,#ea580c,#f97316,#9a3412)] animate-[spin_4s_linear_infinite] opacity-90 blur-sm" />
          <div className="absolute inset-0 rounded-full border-2 border-orange-500/60" />
        </div>
      );
      break;
    case 'frame-ethereal':
      bgClass = 'bg-transparent';
      borderClass = 'p-[4px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 shadow-[0_0_30px_#fdf4ff,inset_0_0_20px_#f0abfc] bg-fuchsia-50/50">
          <div className="absolute inset-[-20%] rounded-full bg-[conic-gradient(from_0deg,transparent,#f0abfc,transparent,#c084fc,transparent)] animate-[spin_10s_linear_infinite] opacity-80 blur-md" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-fuchsia-300/40 to-cyan-300/40 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-[3px] border-white/80 shadow-[0_0_15px_#fff]" />
        </div>
      );
      break;
    case 'frame-omniscience':
      bgClass = 'bg-black';
      borderClass = 'p-[3px]';
      shapeClass = 'rounded-full';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-visible">
          {/* Outer Ring 1 - Tighter */}
          <div className="absolute inset-[-8%] rounded-full border border-amber-500/40">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-300 rounded-full" />
            </motion.div>
          </div>
          
          {/* Outer Ring 2 - Tighter */}
          <div className="absolute inset-[-16%] rounded-full border border-amber-600/30">
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            </motion.div>
          </div>

          {/* Core Border */}
          <div className="absolute inset-0 rounded-full bg-black border border-amber-400/60" />
        </div>
      );
      break;
    case 'frame-matrix':
      bgClass = 'bg-black';
      borderClass = 'p-[4px]';
      shapeClass = 'rounded-full';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_15px_#22c55e] bg-black border border-green-500/30">
          {/* Matrix rain effect simplified */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-0 flex flex-wrap content-start overflow-hidden text-[8px] font-mono font-bold text-green-500 leading-none break-all select-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <span key={i} className="animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: `${Math.random() * 2}s` }}>
                  {Math.random() > 0.5 ? '1' : '0'}
                </span>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 rounded-full border border-green-400/50" />
        </div>
      );
      break;
    case 'frame-viral':
      bgClass = 'bg-transparent';
      borderClass = 'p-[4px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_20px_#ec4899,inset_0_0_15px_#8b5cf6]">
          <div className="absolute inset-[-50%] rounded-full bg-[conic-gradient(from_0deg,#ec4899,#8b5cf6,#3b82f6,#ec4899)] animate-[spin_4s_linear_infinite] opacity-90 blur-md" />
          <div className="absolute inset-0 rounded-full border-2 border-white/50" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-ping" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        </div>
      );
      break;
    case 'frame-royal':
      bgClass = 'bg-transparent';
      borderClass = 'p-[4px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-visible shadow-[0_0_20px_#fbbf24] bg-purple-900">
          {/* Majestic rotating aura */}
          <div className="absolute inset-[-10%] rounded-full bg-[conic-gradient(from_0deg,transparent,#fbbf24,transparent,#7e22ce,transparent)] animate-[spin_10s_linear_infinite] opacity-60 blur-sm" />
          
          {/* Main golden border */}
          <div className="absolute inset-0 rounded-full border-[2px] border-amber-400 shadow-[0_0_10px_#fbbf24]" />
          
          {/* Crown Spike */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1 text-[10px] animate-bounce">👑</div>
        </div>
      );
      break;
    case 'frame-glitch':
      bgClass = 'bg-transparent';
      borderClass = 'p-[4px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden bg-black">
          {/* Glitch Layers with Dark Green added */}
          <motion.div 
            animate={{ 
              x: [-3, 3, -2, 4, -3],
              opacity: [0.4, 0.7, 0.3, 0.8, 0.4]
            }}
            transition={{ duration: 0.25, repeat: Infinity, repeatType: "mirror" }}
            className="absolute inset-0 border-[4px] border-cyan-500 rounded-full opacity-40"
          />
          <motion.div 
            animate={{ 
              x: [3, -3, 4, -2, 3],
              opacity: [0.4, 0.7, 0.3, 0.8, 0.4]
            }}
            transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror", delay: 0.05 }}
            className="absolute inset-0 border-[4px] border-magenta-500 rounded-full opacity-40"
            style={{ borderColor: '#ff00ff' }}
          />
          <motion.div 
            animate={{ 
              y: [-2, 2, -1, 3, -2],
              opacity: [0.3, 0.6, 0.2, 0.7, 0.3]
            }}
            transition={{ duration: 0.3, repeat: Infinity, repeatType: "mirror", delay: 0.1 }}
            className="absolute inset-0 border-[4px] border-emerald-700 rounded-full opacity-40"
          />
          
          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%),linear-gradient(90deg,rgba(255,0,0,0.08),rgba(0,255,0,0.04),rgba(0,0,255,0.08))] bg-[length:100%_3px,4px_100%]" />
          
          {/* Digital Noise Blocks - Including Green ones */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                opacity: [0, 1, 0],
                x: [-25, 25],
                y: [-25, 25],
                scaleX: [1, 3, 1]
              }}
              transition={{ 
                duration: 0.15, 
                repeat: Infinity, 
                repeatDelay: Math.random() * 1.5,
                delay: i * 0.3
              }}
              className={`absolute w-5 h-1 blur-[1px] ${i % 3 === 0 ? 'bg-cyan-400' : i % 3 === 1 ? 'bg-fuchsia-500' : 'bg-emerald-500'}`}
              style={{ 
                top: `${15 + i * 15}%`, 
                left: `${15 + i * 12}%` 
              }}
            />
          ))}

          {/* Main Border */}
          <div className="absolute inset-0 rounded-full border-[2px] border-white/90 shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
          
          {/* Static Noise Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        </div>
      );
      break;
    case 'frame-elite':
      bgClass = 'bg-gradient-to-br from-orange-600 via-red-500 to-amber-400';
      borderClass = 'p-[4px]';
      decorations = (
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          {/* Rotating Squares behind - Solid & Thicker */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute w-[110%] h-[110%] border-[4px] border-orange-600 rounded-lg shadow-[0_0_15px_rgba(234,88,12,0.5)]"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute w-[120%] h-[120%] border-[3px] border-red-500 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          />
          
          {/* Inner Glow */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_15px_rgba(220,38,38,0.7)]" />
        </div>
      );
      break;
    default:
      bgClass = 'bg-surface border border-white/10';
      borderClass = 'p-0';
      break;
  }

  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 ${sizeClass}`}>
      {decorations}
      <div 
        className={`w-full h-full flex items-center justify-center ${shapeClass} relative z-10 ${bgClass} ${borderClass} will-change-transform`}
      >
        <div 
          className={`w-full h-full bg-surface flex items-center justify-center ${shapeClass} relative z-10 overflow-hidden`}
        >
          {src ? (
            <img src={src} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="w-1/2 h-1/2 text-secondary" />
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ProfileFrame);
