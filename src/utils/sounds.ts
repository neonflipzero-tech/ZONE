export class SoundManager {
  private ctx: AudioContext | null = null;

  private init() {
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(e => console.warn("AudioContext resume failed", e));
      }
    } catch (e) {
      console.error("AudioContext initialization failed", e);
    }
  }

  // Call this on first user interaction to unlock audio
  unlock() {
    this.init();
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
      osc.frequency.setValueAtTime(1046.50, t); // C6
      osc.frequency.exponentialRampToValueAtTime(1318.51, t + 0.1); // E6
      osc.frequency.exponentialRampToValueAtTime(1567.98, t + 0.2); // G6
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(1.0, t + 0.05); // Max volume
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
      gain.gain.linearRampToValueAtTime(1.0, t + 0.05); // Max volume
      gain.gain.setValueAtTime(1.0, t + 0.45);
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
        gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05); // 5x (was 0.1)
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

  playSetRival() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t); // A3
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.3); // A2
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(1.0, t + 0.05); // Max volume
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.4);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  playPurchase() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t); // A5
      osc.frequency.setValueAtTime(1108.73, t + 0.1); // C#6
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(1.5, t + 0.05); // Extra loud
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.3);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  playUseItem() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t); // A4
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.3); // A5
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(1.0, t + 0.1); // Max volume
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.4);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  playVictory() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      
      const playNote = (freq: number, startTime: number, duration: number) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(1.0, startTime + 0.05); // Max volume
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // Triumphant arpeggio
      playNote(523.25, t, 0.15);       // C5
      playNote(659.25, t + 0.15, 0.15); // E5
      playNote(783.99, t + 0.3, 0.15);  // G5
      playNote(1046.50, t + 0.45, 0.6); // C6 (held)
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  playTick() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      
      // High frequency "click" part
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(2000, t);
      osc1.frequency.exponentialRampToValueAtTime(1000, t + 0.01);
      gain1.gain.setValueAtTime(2.5, t); // Super loud
      gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.01);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      
      // Lower frequency "thump" part
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(400, t);
      osc2.frequency.exponentialRampToValueAtTime(100, t + 0.02);
      gain2.gain.setValueAtTime(1.25, t); // Super loud
      gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.02);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      
      osc1.start(t);
      osc1.stop(t + 0.01);
      osc2.start(t);
      osc2.stop(t + 0.02);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  playBossAction() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      
      // High frequency "click" part
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1200, t);
      osc1.frequency.exponentialRampToValueAtTime(600, t + 0.05);
      gain1.gain.setValueAtTime(1.5, t); // Very loud
      gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      
      // Lower frequency "thump" part
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(300, t);
      osc2.frequency.exponentialRampToValueAtTime(100, t + 0.1);
      gain2.gain.setValueAtTime(1.0, t); // Loud
      gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      
      osc1.start(t);
      osc1.stop(t + 0.05);
      osc2.start(t);
      osc2.stop(t + 0.1);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);
      
      gain.gain.setValueAtTime(0.25, t); // 5x (was 0.05)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  click() {
    this.playClick();
  }

  playNotification() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, t + 0.1); // E6
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(1.0, t + 0.05); // Max volume
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.3);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  playOpenModal() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.2);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.8, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.3);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  playCloseModal() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.2);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.8, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.3);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  playError() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.setValueAtTime(100, t + 0.1);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.8, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.4);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }

  playSuccess() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.setValueAtTime(800, t + 0.1);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.8, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.3);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  }
}

export const sounds = new SoundManager();
