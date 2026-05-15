import { useEffect, useRef, useState } from 'react';
import { Music2, Volume2, VolumeX } from 'lucide-react';

const ambientTrack = '/assets/audio/royal-gardens-koto.mp3';
const targetVolume = 0.7;
const interactiveSelector = 'button, a, [role="button"], input, textarea, select, summary, label';

let interactionContext: AudioContext | null = null;
let lastClickAt = 0;
let woodNoiseBuffer: AudioBuffer | null = null;

function getInteractionContext() {
  if (typeof window === 'undefined') return null;
  const audioWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  const AudioContextClass = window.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioContextClass) return null;
  interactionContext ||= new AudioContextClass();
  return interactionContext;
}

function getWoodNoise(context: AudioContext) {
  if (woodNoiseBuffer) return woodNoiseBuffer;

  const sampleRate = context.sampleRate;
  const buffer = context.createBuffer(1, Math.floor(sampleRate * 0.16), sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < data.length; index += 1) {
    const progress = index / data.length;
    const envelope = Math.pow(1 - progress, 2.7);
    data[index] = (Math.random() * 2 - 1) * envelope;
  }

  woodNoiseBuffer = buffer;
  return buffer;
}

export function playWoodClick() {
  const context = getInteractionContext();
  if (!context) return;

  const trigger = () => {
    const now = performance.now();
    if (now - lastClickAt < 36) return;
    lastClickAt = now;

    const start = context.currentTime;
    const noise = context.createBufferSource();
    const knockFilter = context.createBiquadFilter();
    const knockGain = context.createGain();
    const body = context.createOscillator();
    const bodyFilter = context.createBiquadFilter();
    const bodyGain = context.createGain();

    noise.buffer = getWoodNoise(context);
    knockFilter.type = 'bandpass';
    knockFilter.frequency.setValueAtTime(560, start);
    knockFilter.frequency.exponentialRampToValueAtTime(260, start + 0.11);
    knockFilter.Q.setValueAtTime(2.15, start);
    knockGain.gain.setValueAtTime(0.0001, start);
    knockGain.gain.exponentialRampToValueAtTime(0.14, start + 0.006);
    knockGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.15);

    body.type = 'triangle';
    body.frequency.setValueAtTime(176, start + 0.004);
    body.frequency.exponentialRampToValueAtTime(104, start + 0.14);
    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(760, start);
    bodyFilter.Q.setValueAtTime(0.7, start);
    bodyGain.gain.setValueAtTime(0.0001, start);
    bodyGain.gain.exponentialRampToValueAtTime(0.075, start + 0.012);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);

    noise.connect(knockFilter);
    knockFilter.connect(knockGain);
    knockGain.connect(context.destination);
    body.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    bodyGain.connect(context.destination);

    noise.start(start);
    noise.stop(start + 0.17);
    body.start(start + 0.004);
    body.stop(start + 0.2);
  };

  if (context.state === 'suspended') {
    void context.resume().then(trigger).catch(() => undefined);
    return;
  }

  trigger();
}

export default function AmbientAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRef = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest(interactiveSelector)) playWoodClick();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const target = event.target as Element | null;
      if (target?.closest(interactiveSelector)) playWoodClick();
    };

    document.addEventListener('pointerdown', onPointerDown, { capture: true });
    document.addEventListener('keydown', onKeyDown, { capture: true });
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, { capture: true });
      document.removeEventListener('keydown', onKeyDown, { capture: true });
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    audio.volume = 0;
    audio.loop = true;

    const fadeTo = (volume: number) => {
      if (fadeRef.current) window.cancelAnimationFrame(fadeRef.current);
      const start = audio.volume;
      const startedAt = performance.now();
      const duration = 900;

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        audio.volume = Math.max(0, Math.min(1, start + (volume - start) * progress));
        if (progress < 1) fadeRef.current = window.requestAnimationFrame(tick);
      };

      fadeRef.current = window.requestAnimationFrame(tick);
    };

    const startMusic = async () => {
      if (!enabled) return;
      try {
        await audio.play();
        setPlaying(true);
        setUnlocked(true);
        fadeTo(targetVolume);
      } catch {
        setPlaying(false);
      }
    };

    const stopMusic = () => {
      fadeTo(0);
      window.setTimeout(() => {
        if (!enabled && audioRef.current) {
          audioRef.current.pause();
          setPlaying(false);
        }
      }, 920);
    };

    if (enabled) {
      void startMusic();
    } else {
      stopMusic();
    }

    const unlock = () => {
      if (enabled && !unlocked) void startMusic();
    };

    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      if (fadeRef.current) window.cancelAnimationFrame(fadeRef.current);
    };
  }, [enabled, unlocked]);

  return (
    <>
      <audio ref={audioRef} src={ambientTrack} preload="auto" />
      <button
        onClick={() => setEnabled((value) => !value)}
        className="magnetic-button fixed bottom-4 right-4 z-[80] inline-flex items-center gap-3 rounded-full border border-[#88aaa1]/35 bg-white/78 px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#365f58] shadow-[0_18px_50px_rgba(74,96,89,0.16)] backdrop-blur-2xl transition-colors hover:bg-system-sage"
        aria-pressed={enabled}
        aria-label={enabled ? 'Turn ambient music off' : 'Turn ambient music on'}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-system-cream text-[#6d5738]">
          <Music2 size={15} />
        </span>
        <span className="hidden sm:inline">{playing ? 'Ambient 70%' : enabled ? 'Tap to wake' : 'Music off'}</span>
        {enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
      </button>
    </>
  );
}
