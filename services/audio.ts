import { SoundVariant } from '../types';

let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const createOscillator = (
  ctx: AudioContext,
  type: OscillatorType,
  freq: number,
  startTime: number,
  duration: number,
  vol: number
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  
  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
  
  return { osc, gain };
};

export const playSystemSound = (variant: SoundVariant, type: 'success' | 'error') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const now = ctx.currentTime;

    switch (variant) {
      case 'retro': 
        if (type === 'success') {
          createOscillator(ctx, 'square', 987, now, 0.1, 0.1);
          createOscillator(ctx, 'square', 1318, now + 0.1, 0.2, 0.1);
        } else {
          createOscillator(ctx, 'sawtooth', 150, now, 0.3, 0.2);
          createOscillator(ctx, 'sawtooth', 110, now + 0.15, 0.3, 0.2);
        }
        break;

      case 'modern': 
        if (type === 'success') {
          createOscillator(ctx, 'sine', 800, now, 0.15, 0.1);
        } else {
          createOscillator(ctx, 'triangle', 200, now, 0.2, 0.15);
        }
        break;

      case 'scifi': 
        if (type === 'success') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.linearRampToValueAtTime(2000, now + 0.1);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.1);
        } else {
          createOscillator(ctx, 'square', 150, now, 0.1, 0.1);
          createOscillator(ctx, 'square', 150, now + 0.15, 0.1, 0.1);
        }
        break;

      case 'subtle': 
        if (type === 'success') {
          createOscillator(ctx, 'sine', 1500, now, 0.05, 0.05);
        } else {
          createOscillator(ctx, 'sine', 100, now, 0.1, 0.1);
        }
        break;

      case 'classic': 
      default:
        if (type === 'success') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
        } else {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.linearRampToValueAtTime(100, now + 0.4);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
        }
        break;
    }
  } catch (e) {
    
  }
};