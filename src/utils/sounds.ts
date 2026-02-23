export class SoundManager {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playMissionComplete() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.50, t); // C6 (higher pitch)
      osc.frequency.exponentialRampToValueAtTime(1318.51, t + 0.1); // E6
      osc.frequency.exponentialRampToValueAtTime(1567.98, t + 0.2); // G6
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.6, t + 0.05); // 3x louder (was 0.2)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.4);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  playLevelUp() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, t); // A4
      osc.frequency.setValueAtTime(554.37, t + 0.15); // C#5
      osc.frequency.setValueAtTime(659.25, t + 0.3); // E5
      osc.frequency.setValueAtTime(880, t + 0.45); // A5
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
      gain.gain.setValueAtTime(0.2, t + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.8);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  playRankUp() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      
      const playNote = (freq: number, startTime: number, duration: number) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      playNote(523.25, t, 0.2); // C5
      playNote(523.25, t + 0.2, 0.2); // C5
      playNote(523.25, t + 0.4, 0.2); // C5
      playNote(698.46, t + 0.6, 0.6); // F5
      playNote(587.33, t + 1.2, 0.2); // D5
      playNote(698.46, t + 1.4, 0.6); // F5
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }
}

export const sounds = new SoundManager();
