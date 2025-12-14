// Simple synth for sound effects using Web Audio API

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

export const playTick = () => {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    // Randomize pitch slightly for realism (wood block soundish)
    osc.frequency.value = 600 + Math.random() * 50; 
    
    // Short envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  } catch (e) {
    // Ignore audio errors (e.g. user didn't interact yet)
  }
};

export const playWin = () => {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.value = 0.3;

    // C Major Arpeggio: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50]; 
    const start = ctx.currentTime;
    
    notes.forEach((note, i) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.connect(noteGain);
        noteGain.connect(masterGain);
        
        osc.type = 'sine';
        osc.frequency.value = note;
        
        const time = start + i * 0.12;
        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(1, time + 0.05);
        noteGain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
        
        osc.start(time);
        osc.stop(time + 1);
    });
  } catch (e) {}
};
