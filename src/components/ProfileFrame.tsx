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
      borderClass = 'p-[4px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_20px_#ef4444,inset_0_0_15px_#ef4444] bg-red-950">
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent,#ef4444,#dc2626,transparent)] animate-[spin_2s_linear_infinite] opacity-90 blur-sm" />
          <div className="absolute inset-0 rounded-full border-2 border-red-400 border-dashed animate-[spin_4s_linear_infinite_reverse]" />
          <div className="absolute inset-0 rounded-full border border-red-300/50" />
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
      borderClass = 'p-[8px]';
      shapeClass = 'rounded-full';
      decorations = (
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          {/* Outer glowing aura */}
          <div className="absolute inset-[-30%] rounded-full bg-fuchsia-600/40 blur-xl animate-pulse" />
          
          {/* Rotating crystalline squares (Spikes) */}
          <div className="absolute inset-[-10%] border-[3px] border-fuchsia-500/70 rounded-xl animate-[spin_10s_linear_infinite] shadow-[0_0_15px_#d946ef]" />
          <div className="absolute inset-[-10%] border-[3px] border-fuchsia-400/70 rounded-xl animate-[spin_10s_linear_infinite_reverse] shadow-[0_0_15px_#d946ef]" />
          
          {/* Main circular border with energy sweep */}
          <div className="absolute inset-0 rounded-full border-[3px] border-fuchsia-600 shadow-[0_0_20px_#d946ef,inset_0_0_15px_#d946ef] overflow-hidden bg-fuchsia-950/80">
            <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_60%,#f0abfc_100%)] animate-[spin_2s_linear_infinite]" />
            <div className="absolute inset-0 rounded-full border-2 border-fuchsia-300/50" />
          </div>
          
          {/* Inner dashed ring */}
          <div className="absolute inset-[3px] rounded-full border-[2.5px] border-white/90 border-dashed animate-[spin_8s_linear_infinite_reverse]" />
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
        <div className="absolute inset-0 rounded-full z-0 bg-gradient-to-t from-orange-600 via-accent to-yellow-400 animate-pulse blur-[2px]" />
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
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_30px_#e11d48,inset_0_0_20px_#be123c] bg-rose-950">
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#9f1239,#e11d48,#fb7185,#fda4af,#9f1239)] animate-[spin_3s_linear_infinite] opacity-90 blur-md" />
          <div className="absolute -bottom-4 -left-4 -right-4 h-full bg-rose-500/60 rounded-[40%] animate-[spin_4s_linear_infinite] mix-blend-screen blur-[4px]" />
          <div className="absolute -bottom-6 -left-4 -right-4 h-full bg-pink-500/60 rounded-[45%] animate-[spin_5s_linear_infinite_reverse] mix-blend-screen blur-[4px]" />
          <div className="absolute -bottom-2 -left-2 -right-2 h-full bg-rose-300/50 rounded-[35%] animate-[spin_3s_linear_infinite] mix-blend-screen blur-[3px]" />
          <div className="absolute inset-0 rounded-full border-2 border-rose-500/80" />
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
        <div className="absolute inset-0 rounded-full z-0 overflow-visible shadow-[0_0_40px_#fb7185,inset_0_0_30px_#e11d48] bg-black">
          {/* Outer rotating rings */}
          <div className="absolute -inset-4 rounded-full border border-rose-500/30 animate-[spin_15s_linear_infinite]" />
          <div className="absolute -inset-2 rounded-full border border-rose-300/40 animate-[spin_10s_linear_infinite_reverse]" />
          
          {/* Core energy - Added rounded-full to prevent square shape */}
          <div className="absolute inset-[-20%] rounded-full bg-[conic-gradient(from_0deg,transparent,#fb7185,#e11d48,#9f1239,transparent)] animate-[spin_4s_linear_infinite] opacity-80 blur-md mix-blend-screen" />
          
          {/* Pulsing core */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500/50 via-rose-200/50 to-pink-500/50 animate-pulse mix-blend-screen" />
          
          {/* Inner border */}
          <div className="absolute inset-0 rounded-full border-4 border-rose-200 shadow-[0_0_20px_#fecdd3]" />
          
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
    case 'frame-matrix':
      bgClass = 'bg-black';
      borderClass = 'p-[6px]';
      shapeClass = 'rounded-full';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_20px_#22c55e,inset_0_0_15px_#16a34a] bg-black border border-green-500/50">
          {/* Matrix rain effect with numbers */}
          <div className="absolute inset-[-50%] opacity-80 animate-[spin_15s_linear_infinite]">
            <div className="absolute inset-0 flex flex-wrap content-start overflow-hidden text-[10px] font-mono font-bold text-green-500 leading-none break-all select-none" style={{ textShadow: '0 0 8px #22c55e' }}>
              {Array.from({ length: 400 }).map((_, i) => (
                <span key={i} className="animate-[pulse_1s_ease-in-out_infinite]" style={{ animationDelay: `${Math.random() * 2}s`, opacity: Math.random() > 0.3 ? 1 : 0.2 }}>
                  {Math.random() > 0.5 ? '1' : '0'}
                </span>
              ))}
            </div>
          </div>
          {/* Glitchy border */}
          <div className="absolute inset-0 rounded-full border-[3px] border-green-400 mix-blend-screen animate-[pulse_0.5s_ease-in-out_infinite]" />
          <div className="absolute inset-0 rounded-full border-2 border-green-300/50 shadow-[0_0_15px_#4ade80]" />
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
      borderClass = 'p-[5px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-visible shadow-[0_0_30px_#fbbf24,inset_0_0_20px_#7e22ce] bg-purple-900">
          {/* Majestic rotating aura */}
          <div className="absolute inset-[-20%] bg-[conic-gradient(from_0deg,transparent,#fbbf24,transparent,#7e22ce,transparent)] animate-[spin_6s_linear_infinite] opacity-60 blur-md" />
          
          {/* Pulsing inner glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/40 to-yellow-400/40 animate-pulse" />
          
          {/* Main golden border */}
          <div className="absolute inset-0 rounded-full border-[3px] border-yellow-400 shadow-[0_0_15px_#fbbf24]" />
          
          {/* Crown Spikes */}
          <div className="absolute inset-0 animate-[spin_12s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rotate-45 shadow-[0_0_10px_#fbbf24] border border-yellow-200" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1 text-[8px] animate-bounce">👑</div>
          </div>
          
          {/* Secondary rotating ring */}
          <div className="absolute inset-1 rounded-full border border-yellow-200/30 border-dashed animate-[spin_8s_linear_infinite_reverse]" />
        </div>
      );
      break;
    case 'frame-dragon':
      bgClass = 'bg-transparent';
      borderClass = 'p-[6px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_35px_#ef4444,inset_0_0_20px_#991b1b] bg-red-950">
          {/* Intense swirling fire */}
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#ef4444,#991b1b,#f97316,#ef4444)] animate-[spin_2s_linear_infinite] opacity-90 blur-md" />
          
          {/* Flickering fire overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-red-600/40 via-orange-500/20 to-transparent animate-pulse" />
          
          {/* Thick dragon-scale border */}
          <div className="absolute inset-0 rounded-full border-[4px] border-red-600 shadow-[0_0_20px_#ef4444]" />
          
          {/* Animated fire emojis */}
          <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs drop-shadow-[0_0_8px_#ef4444] animate-pulse">🔥</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-xs drop-shadow-[0_0_8px_#ef4444] animate-pulse">🔥</div>
          </div>
          
          {/* Inner glowing ring */}
          <div className="absolute inset-1 rounded-full border-2 border-orange-400/50 border-dotted animate-[spin_10s_linear_infinite_reverse]" />
          
          {/* Smoke/Heat distortion effect */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,transparent_30%,#000_100%)]" />
        </div>
      );
      break;
    case 'frame-elite':
      bgClass = 'bg-transparent';
      borderClass = 'p-[4px]';
      decorations = (
        <div className="absolute inset-0 rounded-full z-0 overflow-hidden shadow-[0_0_25px_rgba(255,0,0,1),inset_0_0_15px_rgba(255,215,0,0.8)]">
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#FF0000,#FF0000,#FFD700,#FF0000,#FF0000)] animate-[spin_3s_linear_infinite] opacity-95 blur-sm" />
          <div className="absolute inset-0 rounded-full border-2 border-white/60" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF0000] rounded-full animate-ping shadow-[0_0_10px_#FF0000]" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#FFD700] rounded-full animate-ping shadow-[0_0_10px_#FFD700]" style={{ animationDelay: '0.5s' }} />
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
