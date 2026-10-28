/**
 * Interview Arcade — Audio Service
 * Lightweight Web Audio API synthesizer for tactile arcade sounds.
 * Zero external audio file dependencies. Fully respects mute state.
 */

import { storage } from './storage.js';

class AudioService {
  constructor() {
    this.isMuted = storage.get('sound_muted', false);
    this.audioCtx = null;
    this.masterGain = null;
  }

  _initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.15, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    storage.set('sound_muted', this.isMuted);
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.15, this.audioCtx.currentTime);
    }
    return this.isMuted;
  }

  getMuteState() {
    return this.isMuted;
  }

  playTone(freq, type = 'sine', duration = 0.08, delay = 0) {
    if (this.isMuted) return;
    this._initContext();
    if (!this.audioCtx) return;

    try {
      const startTime = this.audioCtx.currentTime + delay;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      // Audio playback might be prevented before user gesture
    }
  }

  click() {
    this.playTone(480, 'sine', 0.04);
  }

  move() {
    this.playTone(320, 'triangle', 0.06);
  }

  correct() {
    this.playTone(523.25, 'triangle', 0.08, 0);       // C5
    this.playTone(659.25, 'triangle', 0.12, 0.06);    // E5
    this.playTone(783.99, 'sine', 0.18, 0.12);        // G5
  }

  wrong() {
    this.playTone(220, 'sawtooth', 0.08, 0);
    this.playTone(164.81, 'sawtooth', 0.16, 0.08);
  }

  win() {
    this.playTone(523.25, 'triangle', 0.1, 0);
    this.playTone(659.25, 'triangle', 0.1, 0.08);
    this.playTone(783.99, 'triangle', 0.1, 0.16);
    this.playTone(1046.50, 'sine', 0.25, 0.24);
  }

  cardFlip() {
    this.playTone(400, 'sine', 0.03);
  }
}

export const audio = new AudioService();
