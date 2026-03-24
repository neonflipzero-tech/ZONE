import React from 'react';
import { motion } from 'motion/react';
import { User } from 'lucide-react';

interface ProfileFrameProps {
  frame: string | null;
  src: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function ProfileFrame({ frame, src, size = 'md' }: ProfileFrameProps) {
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
      bgClass = 'bg-purple-500';
      borderClass = 'p-1.5';
      decorations = (
        <div className="absolute inset-0 rounded-full border-4 border-purple-400/50 animate-pulse scale-110 z-0" />
      );
      break;
    case 'frame-grandmaster':
      bgClass = 'bg-yellow-400';
      borderClass = 'p-1.5';
      decorations = (
        <div className="absolute inset-0 rounded-full border-4 border-yellow-300/50 animate-ping z-0" />
      );
      break;
    case 'frame-challenger':
      bgClass = 'bg-rose-500';
      borderClass = 'p-[4px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_20px_#f43f5e,inset_0_0_15px_#f43f5e] bg-rose-950">
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent,#f43f5e,#e11d48,transparent)] animate-[spin_2s_linear_infinite] opacity-90 blur-sm" />
          <div className="absolute inset-0 rounded-full border-2 border-rose-400 border-dashed animate-[spin_4s_linear_infinite_reverse]" />
          <div className="absolute inset-0 rounded-full border border-rose-300/50" />
        </div>
      );
      break;
    case 'frame-legend':
      bgClass = 'bg-emerald-400';
      borderClass = 'p-1.5';
      decorations = (
        <div className="absolute inset-0 rounded-full border-4 border-emerald-400/50 animate-pulse scale-110 z-0 shadow-[0_0_15px_#34d399]" />
      );
      break;
    case 'frame-mythic':
      bgClass = 'bg-background';
      borderClass = 'p-[6px]';
      shapeClass = 'rounded-full';
      decorations = (
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          {/* Outer glowing aura */}
          <div className="absolute inset-[-20%] rounded-full bg-fuchsia-600/30 blur-lg animate-pulse" />
          
          {/* Main circular border with energy sweep */}
          <div className="absolute inset-0 rounded-full border-[2px] border-fuchsia-600 shadow-[0_0_15px_#d946ef] overflow-hidden bg-fuchsia-950/80">
            <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_60%,#f0abfc_100%)] animate-[spin_3s_linear_infinite]" />
          </div>
          
          {/* Inner ring */}
          <div className="absolute inset-[2px] rounded-full border border-white/40 border-dashed animate-[spin_10s_linear_infinite_reverse]" />
        </div>
      );
      break;
    case 'frame-rgb':
      bgClass = 'bg-transparent';
      borderClass = 'p-[2px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden">
          <div className="absolute inset-[-50%] bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)] animate-[spin_2s_linear_infinite]" />
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
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] animate-[spin_3s_linear_infinite] opacity-50" />
          <div className="absolute inset-0 rounded-full border-2 border-violet-500" />
        </div>
      );
      break;
    case 'frame-void':
      bgClass = 'bg-transparent';
      borderClass = 'p-[5px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_25px_#000000,inset_0_0_25px_#4c1d95] bg-black/80">
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#000,#4c1d95,#000)] animate-[spin_4s_linear_infinite] opacity-90 blur-sm" />
          <div className="absolute inset-0 rounded-full border-4 border-black/80" />
        </div>
      );
      break;
    case 'frame-aurora':
      bgClass = 'bg-transparent';
      borderClass = 'p-[5px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_20px_#10b981,inset_0_0_20px_#3b82f6]">
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#10b981,#3b82f6,#8b5cf6,#10b981)] animate-[spin_5s_linear_infinite] opacity-90 blur-md" />
          <div className="absolute inset-0 rounded-full border-4 border-teal-400/50" />
        </div>
      );
      break;
    case 'frame-radiant':
      bgClass = 'bg-transparent';
      borderClass = 'p-[4px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_25px_#fbbf24,inset_0_0_15px_#fbbf24]">
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_45deg,#fbbf24_90deg,transparent_135deg,#fbbf24_180deg,transparent_225deg,#fbbf24_270deg,transparent_315deg,#fbbf24_360deg)] animate-[spin_8s_linear_infinite] opacity-80" />
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
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent,#991b1b,#450a0a,transparent)] animate-[spin_3s_linear_infinite] opacity-80 blur-sm" />
          
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
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#9a3412,#ea580c,#f97316,#9a3412)] animate-[spin_4s_linear_infinite] opacity-90 blur-sm" />
          <div className="absolute inset-0 rounded-full border-2 border-orange-500/60" />
        </div>
      );
      break;
    case 'frame-ethereal':
      bgClass = 'bg-transparent';
      borderClass = 'p-[4px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 shadow-[0_0_30px_#fdf4ff,inset_0_0_20px_#f0abfc] bg-fuchsia-50/50">
          <div className="absolute inset-[-20%] bg-[conic-gradient(from_0deg,transparent,#f0abfc,transparent,#c084fc,transparent)] animate-[spin_10s_linear_infinite] opacity-80 blur-md" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-fuchsia-300/40 to-cyan-300/40 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-[3px] border-white/80 shadow-[0_0_15px_#fff]" />
        </div>
      );
      break;
    case 'frame-omniscience':
      bgClass = 'bg-black';
      borderClass = 'p-[6px]';
      shapeClass = 'rounded-full';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-visible shadow-[0_0_25px_#fbbf24] bg-black">
          {/* Core energy */}
          <div className="absolute inset-[-20%] rounded-full bg-[conic-gradient(from_0deg,transparent,#fbbf24,#d97706,transparent)] animate-[spin_5s_linear_infinite] opacity-80 blur-sm mix-blend-screen" />
          
          {/* Pulsing core */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/40 via-amber-200/40 to-yellow-500/40 animate-pulse mix-blend-screen" />
          
          {/* Inner border */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-200 shadow-[0_0_10px_#fef3c7]" />
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
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#ec4899,#8b5cf6,#3b82f6,#ec4899)] animate-[spin_4s_linear_infinite] opacity-90 blur-md" />
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
          <div className="absolute inset-[-10%] bg-[conic-gradient(from_0deg,transparent,#fbbf24,transparent,#7e22ce,transparent)] animate-[spin_10s_linear_infinite] opacity-60 blur-sm" />
          
          {/* Main golden border */}
          <div className="absolute inset-0 rounded-full border-[2px] border-amber-400 shadow-[0_0_10px_#fbbf24]" />
          
          {/* Crown Spike */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1 text-[10px] animate-bounce">👑</div>
        </div>
      );
      break;
    case 'frame-dragon':
      bgClass = 'bg-transparent';
      borderClass = 'p-[5px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_25px_#dc2626] bg-red-950">
          {/* Swirling fire */}
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#dc2626,#991b1b,#dc2626)] animate-[spin_4s_linear_infinite] opacity-90 blur-sm" />
          
          {/* Thick border */}
          <div className="absolute inset-0 rounded-full border-[3px] border-red-600 shadow-[0_0_15px_#dc2626]" />
          
          {/* Fire emoji */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] animate-pulse">🔥</div>
        </div>
      );
      break;
    case 'frame-elite':
      bgClass = 'bg-transparent';
      borderClass = 'p-[4px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_25px_rgba(245,158,11,1),inset_0_0_15px_rgba(245,158,11,0.8)]">
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#f59e0b,#f59e0b,#fcd34d,#f59e0b,#f59e0b)] animate-[spin_3s_linear_infinite] opacity-95 blur-sm" />
          <div className="absolute inset-0 rounded-full border-2 border-white/60" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f59e0b] rounded-full animate-ping shadow-[0_0_10px_#f59e0b]" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#fcd34d] rounded-full animate-ping shadow-[0_0_10px_#fcd34d]" style={{ animationDelay: '0.5s' }} />
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
        className={`w-full h-full flex items-center justify-center ${shapeClass} relative z-10 ${bgClass} ${borderClass}`}
      >
        <div 
          className={`w-full h-full bg-surface flex items-center justify-center ${shapeClass} relative z-10 overflow-hidden`}
        >
          {src ? (
            <img src={src} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-1/2 h-1/2 text-secondary" />
          )}
        </div>
      </div>
    </div>
  );
}
