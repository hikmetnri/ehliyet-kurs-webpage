class SoundService {
  constructor() {
    this._soundEnabled = localStorage.getItem('sound_enabled') !== 'false';
  }

  get soundEnabled() {
    return this._soundEnabled;
  }

  setSoundEnabled(enabled) {
    this._soundEnabled = enabled;
    localStorage.setItem('sound_enabled', String(enabled));
  }

  _play(soundPath) {
    if (!this._soundEnabled) return;
    try {
      const audio = new Audio(soundPath);
      audio.currentTime = 0;
      audio.play().catch(err => {
        console.warn('Audio play failed:', err);
      });
    } catch (err) {
      console.warn('Audio initialization failed:', err);
    }
  }

  playClick() {
    this._play('/sounds/click.mp3');
  }

  playCorrect() {
    this._play('/sounds/correct.mp3');
  }

  playWrong() {
    this._play('/sounds/wrong.mp3');
  }

  playClapping() {
    this._play('/sounds/clapping.mp3');
  }

  playFailed() {
    this._play('/sounds/failed.mp3');
  }

  playSave() {
    this._play('/sounds/save.mp3');
  }
}

export const soundService = new SoundService();
