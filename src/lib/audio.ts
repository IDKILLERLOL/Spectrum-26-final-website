/**
 * Web Audio API synth sound effects — Radiant Crisis 001 style
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

type SoundType = 'click' | 'laser' | 'zap' | 'paper';

export function playSynthSound(type: SoundType) {
  // Sounds disabled globally by user request
  return;
}
