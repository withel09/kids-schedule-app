"use client";

// Simple Web Audio API Synthesizer to avoid external file dependencies
export const playSound = (type: string = 'chime') => {
    if (typeof window === 'undefined') return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    const playTone = (freq: number, type: OscillatorType, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
    };

    switch (type) {
        case 'chime': // Ding-Dong
            playTone(880, 'sine', 0, 1.5); // A5
            playTone(698, 'sine', 0.2, 1.5); // F5
            break;
        case 'bell': // School Bell-ish (Complex)
            playTone(660, 'triangle', 0, 0.5);
            playTone(660, 'triangle', 0.1, 0.5);
            playTone(660, 'triangle', 0.2, 0.5);
            setTimeout(() => {
                playTone(523, 'triangle', 0, 1.0);
            }, 600);
            break;
        case 'bird': // Chirp
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(1800, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);

            setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(1200, ctx.currentTime);
                osc2.frequency.linearRampToValueAtTime(1800, ctx.currentTime + 0.1);
                gain2.gain.setValueAtTime(0.1, ctx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start();
                osc2.stop(ctx.currentTime + 0.3);
            }, 150);
            break;
        case 'cartoon': // Boing
            const osc3 = ctx.createOscillator();
            const gain3 = ctx.createGain();
            osc3.type = 'sine';
            osc3.frequency.setValueAtTime(200, ctx.currentTime);
            osc3.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
            gain3.gain.setValueAtTime(0.1, ctx.currentTime);
            gain3.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
            osc3.connect(gain3);
            gain3.connect(ctx.destination);
            osc3.start();
            osc3.stop(ctx.currentTime + 0.3);
            break;
        default:
            playTone(440, 'sine', 0, 0.5);
    }
};
