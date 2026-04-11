export class SoundManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private lastSelamatTime: number = 0;
  private readonly SELAMAT_COOLDOWN = 2000; // 2 seconds cooldown to prevent overlapping success sounds

  private playAudio(path: string, volume: number = 0.7, playbackRate: number = 1.0) {
    try {
      let audio = this.audioCache.get(path);
      if (!audio) {
        audio = new Audio(path);
        this.audioCache.set(path, audio);
      }
      audio.volume = volume;
      audio.playbackRate = playbackRate;
      audio.currentTime = 0;
      audio.play().catch(e => console.warn(`Audio playback failed for ${path}:`, e));
    } catch (e) {
      console.error(`Audio playback failed for ${path}:`, e);
    }
  }

  private playSelamat(volume: number = 0.8) {
    const now = Date.now();
    if (now - this.lastSelamatTime < this.SELAMAT_COOLDOWN) return;
    this.lastSelamatTime = now;
    this.playAudio('/selamat.mp3', volume);
  }

  // Call this on first user interaction to unlock audio
  unlock() {
    // Preload common sounds
    ['/selamat.mp3', '/suaragold.mp3', '/tidak.mp3'].forEach(path => {
      if (!this.audioCache.has(path)) {
        const audio = new Audio(path);
        audio.load();
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
    this.playAudio('/tidak.mp3', 0.5, 0.8);
  }

  playPurchase() {
    this.playAudio('/suaragold.mp3', 0.6, 0.8);
    if (navigator.vibrate) {
      navigator.vibrate([20, 10, 20]);
    }
  }

  playUseItem() {
    this.playAudio('/suaragold.mp3', 0.6, 1.2);
  }

  playEquip() {
    this.playAudio('/tidak.mp3', 0.4, 1.5);
  }

  playVictory() {
    this.playSelamat(0.8);
  }

  playTick() {
    this.playAudio('/tidak.mp3', 0.3, 1.5);
  }

  playBossAction() {
    this.playAudio('/tidak.mp3', 0.6, 0.8);
  }

  playClick() {
    this.playAudio('/tidak.mp3', 0.5, 1.2); // Snappier click
  }

  click() {
    this.playClick();
  }

  playNotification() {
    this.playAudio('/suaragold.mp3', 0.7, 1.0);
  }

  playOpenModal() {
    this.playAudio('/tidak.mp3', 0.4, 1.2);
  }

  playCloseModal() {
    this.playAudio('/tidak.mp3', 0.4, 0.8);
  }

  playError() {
    this.playAudio('/tidak.mp3', 0.7, 0.5);
  }

  playSuccess() {
    this.playSelamat(0.7);
  }

  playTing() {
    this.playAudio('/tidak.mp3', 0.4, 1.5);
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
