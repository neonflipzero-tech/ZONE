export class SoundManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private lastSelamatTime: number = 0;
  private isUnlocked: boolean = false;
  private readonly SELAMAT_COOLDOWN = 2000; // 2 seconds cooldown to prevent overlapping success sounds

  private playAudio(path: string, volume: number = 0.7, playbackRate: number = 1.0) {
    // If not unlocked and we try to play, it might fail. 
    // We'll try anyway but catch silently if it's a permission issue.
    try {
      // Use relative paths for APK compatibility
      const relativePath = path.startsWith('/') ? path.substring(1) : path;
      let audio = this.audioCache.get(relativePath);
      
      if (!audio) {
        audio = new Audio(relativePath);
        this.audioCache.set(relativePath, audio);
      }

      // Re-initialize if it's in a bad state or to ensure it plays on mobile
      audio.volume = volume;
      audio.playbackRate = playbackRate;
      audio.currentTime = 0;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          // Only log if it's not a standard "user didn't interact" error
          if (e.name !== 'NotAllowedError') {
            console.warn(`Audio playback failed for ${relativePath}:`, e);
            
            // If it failed for other reasons, try to re-create it once
            const retryAudio = new Audio(relativePath);
            retryAudio.volume = volume;
            retryAudio.playbackRate = playbackRate;
            retryAudio.play().catch(err => {
              if (err.name !== 'NotAllowedError') {
                console.error("Retry failed:", err);
              }
            });
            this.audioCache.set(relativePath, retryAudio);
          }
        });
      }
    } catch (e) {
      console.error(`Audio playback failed for ${path}:`, e);
    }
  }

  private playSelamat(volume: number = 0.8) {
    const now = Date.now();
    if (now - this.lastSelamatTime < this.SELAMAT_COOLDOWN) return;
    this.lastSelamatTime = now;
    this.playAudio('selamat.mp3', volume);
  }

  // Call this on first user interaction to unlock audio
  unlock() {
    if (this.isUnlocked) return;
    this.isUnlocked = true;
    console.log("SoundManager: Unlocking audio...");
    // Preload common sounds
    ['selamat.mp3', 'suaragold.mp3', 'tidak.mp3'].forEach(path => {
      if (!this.audioCache.has(path)) {
        console.log(`SoundManager: Preloading ${path}`);
        const audio = new Audio(path);
        audio.load();
        // Play and immediately pause to unlock the audio context on mobile/APK
        audio.volume = 0;
        audio.play().then(() => {
          console.log(`SoundManager: Successfully unlocked ${path}`);
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 1;
        }).catch(err => {
          console.warn(`SoundManager: Failed to unlock ${path}`, err);
        });
        this.audioCache.set(path, audio);
      }
    });
  }

  playMissionComplete() {
    this.playSelamat(0.8);
  }

  playLevelUp() {
    this.playSelamat(0.8);
  }

  playRankUp() {
    this.playSelamat(0.9);
  }

  playSetRival() {
    this.playAudio('tidak.mp3', 0.5, 0.8);
  }

  playPurchase() {
    this.playAudio('suaragold.mp3', 0.6, 0.8);
    if (navigator.vibrate) {
      navigator.vibrate([20, 10, 20]);
    }
  }

  playUseItem() {
    // Premium satisfying sound for using items
    // Combination of a high-pitched success ting and a snappy click
    this.playAudio('suaragold.mp3', 0.7, 1.5);
    setTimeout(() => this.playAudio('tidak.mp3', 0.5, 2.0), 50);
    
    if (navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }
  }

  playEquip() {
    // Sharp high-pitched click for equipping
    this.playAudio('tidak.mp3', 0.5, 1.8);
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  playVictory() {
    this.playSelamat(0.8);
  }

  playTick() {
    this.playAudio('tidak.mp3', 0.3, 1.5);
  }

  playBossAction() {
    this.playAudio('tidak.mp3', 0.6, 0.8);
  }

  playClick() {
    this.playAudio('tidak.mp3', 0.5, 1.2); // Snappier click
  }

  click() {
    this.playClick();
  }

  playNotification() {
    this.playAudio('suaragold.mp3', 0.7, 1.0);
  }

  playOpenModal() {
    this.playAudio('tidak.mp3', 0.4, 1.2);
  }

  playCloseModal() {
    this.playAudio('tidak.mp3', 0.4, 0.8);
  }

  playError() {
    this.playAudio('tidak.mp3', 0.7, 0.5);
  }

  playOverheat() {
    // Glitchy, alarming warning sound (distinct from store/gold)
    const play = (p: number, v: number, d: number) => {
      setTimeout(() => this.playAudio('tidak.mp3', v, p), d);
    };
    play(0.4, 0.8, 0);
    play(0.3, 0.7, 80);
    play(0.4, 0.8, 160);
    play(0.2, 0.9, 240);
    
    if (navigator.vibrate) {
      navigator.vibrate([150, 100, 150, 100, 300]);
    }
  }

  playSuccess() {
    this.playSelamat(0.7);
  }

  playTing() {
    this.playAudio('tidak.mp3', 0.4, 1.5);
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  playDopamine() {
    this.playSelamat(0.8);
    if (navigator.vibrate) {
      navigator.vibrate([20, 10, 20]);
    }
  }
}

export const sounds = new SoundManager();
