import React from 'react';
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
      bgClass = 'bg-amber-700';
      borderClass = 'p-1';
      break;
    case 'frame-silver':
      bgClass = 'bg-gray-300';
      borderClass = 'p-1';
      break;
    case 'frame-gold':
      bgClass = 'bg-yellow-400';
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
      bgClass = 'bg-yellow-300';
      borderClass = 'p-1.5';
      decorations = (
        <div className="absolute inset-0 rounded-full border-4 border-yellow-300/50 animate-ping z-0" />
      );
      break;
    case 'frame-challenger':
      bgClass = 'bg-red-500';
      borderClass = 'p-1.5';
      decorations = (
        <>
          {/* Left Ear */}
          <div className="absolute -top-2.5 -left-1 w-7 h-7 z-0 -rotate-12">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-red-500 drop-shadow-md">
              <path d="M12 2L2 22h20L12 2z" />
            </svg>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-background absolute inset-0 scale-50 origin-bottom">
              <path d="M12 2L2 22h20L12 2z" />
            </svg>
          </div>
          {/* Right Ear */}
          <div className="absolute -top-2.5 -right-1 w-7 h-7 z-0 rotate-12">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-red-500 drop-shadow-md">
              <path d="M12 2L2 22h20L12 2z" />
            </svg>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-background absolute inset-0 scale-50 origin-bottom">
              <path d="M12 2L2 22h20L12 2z" />
            </svg>
          </div>
        </>
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
        <div className="absolute inset-0 rounded-full z-0 bg-gradient-to-t from-orange-600 via-red-500 to-yellow-400 animate-pulse blur-[2px]" />
      );
      break;
    case 'frame-cyberpunk':
      bgClass = 'bg-transparent';
      borderClass = 'p-[4px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 border-4 border-dashed border-yellow-400 animate-[spin_10s_linear_infinite]" />
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
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_25px_#fef08a,inset_0_0_15px_#fef08a]">
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_45deg,#fef08a_90deg,transparent_135deg,#fef08a_180deg,transparent_225deg,#fef08a_270deg,transparent_315deg,#fef08a_360deg)] animate-[spin_8s_linear_infinite] opacity-80" />
          <div className="absolute inset-0 rounded-full border border-white" />
        </div>
      );
      break;
    case 'frame-abyssal':
      bgClass = 'bg-black';
      borderClass = 'p-[6px]';
      shapeClass = 'rounded-full';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_30px_#991b1b,inset_0_0_25px_#450a0a] bg-black">
          {/* Deep red swirling void */}
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent,#7f1d1d,#450a0a,transparent)] animate-[spin_2s_linear_infinite] opacity-80 blur-sm" />
          {/* Second counter-spinning void */}
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_180deg,transparent,#991b1b,#000000,transparent)] animate-[spin_3s_linear_infinite_reverse] opacity-60 blur-md" />
          {/* Dark pulsing overlay */}
          <div className="absolute inset-0 rounded-full bg-black/40 animate-[pulse_2s_ease-in-out_infinite]" />
          
          {/* Glitch Effects */}
          <div className="absolute inset-0 rounded-full border-[3px] border-red-600 mix-blend-screen glitch-layer-1 opacity-70" />
          <div className="absolute inset-0 rounded-full border-[3px] border-red-900 mix-blend-screen glitch-layer-2 opacity-70" />
          
          {/* Jagged / sharp inner border effect using multiple borders */}
          <div className="absolute inset-0 rounded-full border-[3px] border-red-900 shadow-[0_0_15px_#dc2626]" />
          <div className="absolute inset-1 rounded-full border border-red-500/30" />
        </div>
      );
      break;
    case 'frame-inferno':
      bgClass = 'bg-transparent';
      borderClass = 'p-[6px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_30px_#dc2626,inset_0_0_20px_#ea580c] bg-red-950">
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#7f1d1d,#b91c1c,#ea580c,#f59e0b,#7f1d1d)] animate-[spin_3s_linear_infinite] opacity-90 blur-md" />
          <div className="absolute -bottom-4 -left-4 -right-4 h-full bg-orange-500/60 rounded-[40%] animate-[spin_4s_linear_infinite] mix-blend-screen blur-[4px]" />
          <div className="absolute -bottom-6 -left-4 -right-4 h-full bg-red-500/60 rounded-[45%] animate-[spin_5s_linear_infinite_reverse] mix-blend-screen blur-[4px]" />
          <div className="absolute -bottom-2 -left-2 -right-2 h-full bg-yellow-500/50 rounded-[35%] animate-[spin_3s_linear_infinite] mix-blend-screen blur-[3px]" />
          <div className="absolute inset-0 rounded-full border-2 border-orange-500/80" />
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
      bgClass = 'bg-transparent';
      borderClass = 'p-[8px]';
      shapeClass = 'rounded-full';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-visible shadow-[0_0_40px_#fbbf24,inset_0_0_30px_#f59e0b] bg-black">
          {/* Outer rotating rings */}
          <div className="absolute -inset-4 rounded-full border border-amber-500/30 animate-[spin_15s_linear_infinite]" />
          <div className="absolute -inset-2 rounded-full border border-yellow-300/40 animate-[spin_10s_linear_infinite_reverse]" />
          
          {/* Core energy - Added rounded-full to prevent square shape */}
          <div className="absolute inset-[-20%] rounded-full bg-[conic-gradient(from_0deg,transparent,#fbbf24,#f59e0b,#d97706,transparent)] animate-[spin_4s_linear_infinite] opacity-80 blur-md mix-blend-screen" />
          
          {/* Pulsing core */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/50 via-yellow-200/50 to-orange-500/50 animate-pulse mix-blend-screen" />
          
          {/* Inner border */}
          <div className="absolute inset-0 rounded-full border-4 border-yellow-200 shadow-[0_0_20px_#fef08a]" />
          
          {/* Floating particles effect - Wrapped in overflow-hidden to prevent square shape */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-[-50%] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:20px_20px] animate-[spin_20s_linear_infinite] opacity-30" />
          </div>

          {/* White particles orbiting the profile picture */}
          <div className="absolute inset-0 rounded-full animate-[spin_8s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#fff]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#fff]" />
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_#fff]" />
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_#fff]" />
          </div>
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
