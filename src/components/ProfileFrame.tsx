import React from 'react';
import { User } from 'lucide-react';

interface ProfileFrameProps {
  frame: string | null;
  src: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function ProfileFrame({ frame, src, size = 'md' }: ProfileFrameProps) {
  const sizeClass = 
    size === 'sm' ? 'w-10 h-10' : 
    size === 'md' ? 'w-16 h-16' : 
    size === 'lg' ? 'w-20 h-20' : 
    'w-28 h-28';
  
  const iconSize = 
    size === 'sm' ? 'text-[10px]' : 
    size === 'md' ? 'text-sm' : 
    size === 'lg' ? 'text-xl' : 
    'text-3xl';

  let bgClass = 'bg-surface';
  let borderClass = '';
  let decorations = null;

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
      bgClass = 'bg-red-500';
      borderClass = 'p-1.5';
      break;
    case 'frame-challenger':
      bgClass = 'bg-yellow-300';
      borderClass = 'p-1.5';
      decorations = (
        <div className="absolute inset-0 rounded-full border-4 border-yellow-300/50 animate-ping z-0" />
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
    default:
      bgClass = 'bg-surface border border-white/10';
      borderClass = 'p-0';
      break;
  }

  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 ${sizeClass}`}>
      {decorations}
      <div 
        className={`w-full h-full flex items-center justify-center rounded-full relative z-10 ${bgClass} ${borderClass}`}
      >
        <div 
          className="w-full h-full bg-surface flex items-center justify-center rounded-full relative z-10 overflow-hidden"
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
