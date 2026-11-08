/**
 * Procedural Web Audio Sound & Music Synthesizer
 * Zero external audio assets (100% procedurally synthesized, zero 404 risk).
 * Provides gentle, warm, relaxing sounds tailored for low-stress decompression.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundVolume: number = 0.7;
  private musicVolume: number = 0.5;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private isBgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private bgmTheme: string = 'spring';
  private noiseNode: AudioNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundVolume(vol: number) {
    this.soundVolume = Math.max(0, Math.min(1, vol));
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopBGM();
    } else {
      this.startBGM(this.bgmTheme);
    }
  }

  public playSwap() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.08);

    gain.gain.setValueAtTime(this.soundVolume * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playInvalid() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.linearRampToValueAtTime(120, t + 0.12);

    gain.gain.setValueAtTime(this.soundVolume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Ascending joyful pentatonic notes for match combos
   */
  public playMatch(combo: number = 1) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    // Pentatonic scale frequencies starting around C5
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98];
    const index = Math.min(combo - 1, pentatonic.length - 1);
    const freq = pentatonic[index];

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.9, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.04);

    gain.gain.setValueAtTime(this.soundVolume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    // Add a harmonic chime overtone for warmth
    const overtone = this.ctx.createOscillator();
    const overGain = this.ctx.createGain();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2, t);
    overGain.gain.setValueAtTime(this.soundVolume * 0.12, t);
    overGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    overtone.connect(overGain);
    overGain.connect(this.ctx.destination);

    osc.start(t);
    overtone.start(t);
    osc.stop(t + 0.28);
    overtone.stop(t + 0.2);
  }

  public playSpecialCreate() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [659.25, 880.0, 1046.5, 1318.51];
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + i * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(this.soundVolume * 0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.22);
    });
  }

  public playLineExplode() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.35);

    // Filter to soften the harshness of sawtooth
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);

    gain.gain.setValueAtTime(this.soundVolume * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.38);
  }

  public playBomb() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Deep warm bass thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.3);

    gain.gain.setValueAtTime(this.soundVolume * 0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  public playRainbow() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Shimmering celestial arpeggio
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + idx * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(this.soundVolume * 0.22, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  }

  public playIceBreak() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.12);

    gain.gain.setValueAtTime(this.soundVolume * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  public playHoneyBreak() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.18);

    gain.gain.setValueAtTime(this.soundVolume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playVictory() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Major chord fanfare: C - E - G - C5
    const fanfare = [
      { f: 523.25, time: 0 },
      { f: 659.25, time: 0.12 },
      { f: 783.99, time: 0.24 },
      { f: 1046.5, time: 0.36 },
      { f: 1318.51, time: 0.52 },
    ];

    fanfare.forEach(({ f, time }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + time;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, noteTime);

      gain.gain.setValueAtTime(this.soundVolume * 0.3, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.6);
    });
  }

  public playUnlockSecret() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 830.61, 880, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(this.soundVolume * 0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.7);
    });
  }

  /**
   * Procedural Ambient BGM Loop
   * Soft, continuous, meditative piano / chime pads and subtle pink noise breeze
   */
  public startBGM(theme: string = 'spring') {
    this.bgmTheme = theme;
    if (!this.musicEnabled) return;
    this.initContext();
    if (!this.ctx || this.isBgmPlaying) return;

    this.isBgmPlaying = true;
    this.scheduleNextBgmChord();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private scheduleNextBgmChord() {
    if (!this.isBgmPlaying || !this.musicEnabled || !this.ctx) return;

    // Pick chords based on theme (C major, F major, Am, G for spring; softer ethereal chords for starlight/ice)
    let chordFreqs = [261.63, 329.63, 392.0, 523.25]; // C maj
    if (this.bgmTheme === 'ice' || this.bgmTheme === 'starlight') {
      chordFreqs = [220.0, 261.63, 329.63, 440.0]; // Am
    } else if (this.bgmTheme === 'honey' || this.bgmTheme === 'sakura') {
      chordFreqs = [349.23, 440.0, 523.25, 659.25]; // F maj7
    } else if (this.bgmTheme === 'cloud' || this.bgmTheme === 'rainbow') {
      chordFreqs = [392.0, 493.88, 587.33, 783.99]; // G maj
    }

    const t = this.ctx.currentTime;
    const dur = 4.2; // slow, relaxing breathing chord duration

    chordFreqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      // Low pass to keep it velvety and cozy
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);

      const vol = this.musicVolume * 0.04;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 1.2);
      gain.gain.linearRampToValueAtTime(0.0001, t + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + dur);
    });

    // Schedule next chord
    this.bgmTimer = window.setTimeout(() => {
      this.scheduleNextBgmChord();
    }, 3800);
  }
}

export const sound = new SoundEngine();
