import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Flame, Gamepad2, Maximize2, Minimize2, Pause, Play, RotateCcw, Shield, Volume2, VolumeX, Zap } from 'lucide-react';

type SpriteKey = 'player' | 'shard' | 'block' | 'seeker' | 'shield' | 'overclock' | 'nova' | 'spikeBall' | 'core';
type SoundType = 'collect' | 'hit' | 'start' | 'dash' | 'power' | 'route' | 'level' | 'nova' | 'burn' | 'bossWarning' | 'bossWin' | 'bossFail';

type Player = {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  dashTime: number;
  shield: number;
  overclock: number;
  dashCooldown: number;
  invulnerable: number;
};

type Hazard = {
  id: number;
  kind: 'block' | 'seeker' | 'gate';
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  phase: number;
  gapY?: number;
  gapSize?: number;
  width?: number;
};

type Pickup = {
  id: number;
  kind: 'shard' | 'shield' | 'overclock' | 'nova';
  x: number;
  y: number;
  radius: number;
  phase: number;
};

type FlameWave = {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  life: number;
  maxLife: number;
  phase: number;
  hitIds: Set<number>;
};

type BossChallenge = {
  active: boolean;
  phase: 'warning' | 'typing' | 'strike' | 'fail';
  level: number;
  word: string;
  typed: string;
  timer: number;
  maxTimer: number;
  strikeTimer: number;
  spawnTimer: number;
  pathPhase: number;
  resolved: boolean;
  message: string;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
};

type FloatingText = {
  x: number;
  y: number;
  vy: number;
  life: number;
  text: string;
  color: string;
};

const gameWidth = 860;
const gameHeight = 520;
const bestScoreKey = 'signal-breach-best-score';
const bossWords = ['KERNEL', 'SIGNAL', 'RISC-V', 'NED', 'JAUNT', 'SYSTEM', 'VECTOR', 'TRUST'];

function levelRequirement(level: number) {
  return Math.round(1100 + level * 420 + level ** 2 * 95);
}

const spritePaths: Record<SpriteKey, string> = {
  player: '/assets/game/packet-runner.svg',
  shard: '/assets/game/checksum-orb.svg',
  block: '/assets/game/corruption-block.svg',
  seeker: '/assets/game/seeker-sentinel.svg',
  shield: '/assets/game/shield-orb.svg',
  overclock: '/assets/game/overclock-orb.svg',
  nova: '/assets/game/flame-nova.svg',
  spikeBall: '/assets/game/spike-cannonball.svg',
  core: '/assets/game/server-core.svg',
};

const sampleLayers: Partial<Record<SoundType, { src: string; volume: number; rate?: number }[]>> = {
  collect: [{ src: '/assets/audio/game/kenney-interface/confirmation_001.ogg', volume: 0.28, rate: 1.08 }],
  dash: [{ src: '/assets/audio/game/kenney-interface/switch_002.ogg', volume: 0.24, rate: 1.22 }],
  hit: [{ src: '/assets/audio/game/kenney-interface/error_004.ogg', volume: 0.34, rate: 0.9 }],
  power: [{ src: '/assets/audio/game/kenney-interface/open_003.ogg', volume: 0.3, rate: 1.08 }],
  route: [{ src: '/assets/audio/game/kenney-interface/confirmation_003.ogg', volume: 0.34, rate: 1.04 }],
  level: [{ src: '/assets/audio/game/kenney-interface/maximize_006.ogg', volume: 0.32, rate: 1 }],
  nova: [
    { src: '/assets/audio/game/kenney-interface/maximize_007.ogg', volume: 0.34, rate: 0.9 },
    { src: '/assets/audio/game/kenney-interface/glitch_001.ogg', volume: 0.18, rate: 0.72 },
  ],
  burn: [{ src: '/assets/audio/game/kenney-interface/glitch_002.ogg', volume: 0.2, rate: 1.18 }],
  bossWarning: [{ src: '/assets/audio/game/kenney-interface/glitch_003.ogg', volume: 0.26, rate: 0.8 }],
  bossWin: [
    { src: '/assets/audio/game/kenney-interface/confirmation_002.ogg', volume: 0.36, rate: 0.88 },
    { src: '/assets/audio/game/kenney-interface/maximize_006.ogg', volume: 0.32, rate: 1.1 },
  ],
  bossFail: [{ src: '/assets/audio/game/kenney-interface/error_004.ogg', volume: 0.36, rate: 0.72 }],
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

let sharedAudioContext: AudioContext | null = null;
let sharedNoiseBuffer: AudioBuffer | null = null;
const sharedSampleBuffers = new Map<string, AudioBuffer>();

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const audioWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  const AudioContextClass = window.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioContextClass) return null;
  sharedAudioContext ??= new AudioContextClass();
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => undefined);
  }
  return sharedAudioContext;
}

function getNoiseBuffer(context: AudioContext) {
  if (sharedNoiseBuffer && sharedNoiseBuffer.sampleRate === context.sampleRate) return sharedNoiseBuffer;
  const length = context.sampleRate * 1.4;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  sharedNoiseBuffer = buffer;
  return buffer;
}

async function preloadSampleLayers() {
  const context = getAudioContext();
  if (!context) return;
  const uniqueSources = [...new Set(Object.values(sampleLayers).flat().map((layer) => layer.src))];
  await Promise.all(
    uniqueSources.map(async (src) => {
      if (sharedSampleBuffers.has(src)) return;
      try {
        const response = await fetch(src);
        const data = await response.arrayBuffer();
        const buffer = await context.decodeAudioData(data.slice(0));
        sharedSampleBuffers.set(src, buffer);
      } catch {
        // Synthesized layers still carry the effect if a downloaded sample fails.
      }
    }),
  );
}

function playSampleLayer(context: AudioContext, destination: AudioNode, src: string, start: number, volume: number, rate = 1) {
  const buffer = sharedSampleBuffers.get(src);
  if (!buffer) return;
  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  source.playbackRate.setValueAtTime(rate * random(0.96, 1.04), start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + Math.min(0.72, buffer.duration / rate));
  source.connect(gain);
  gain.connect(destination);
  source.start(start);
}

function playTone(context: AudioContext, destination: AudioNode, frequency: number, start: number, duration: number, gainAmount: number, type: OscillatorType = 'sine', endFrequency?: number) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
  }
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainAmount, start + 0.014);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playNoise(context: AudioContext, destination: AudioNode, start: number, duration: number, gainAmount: number, frequency: number, type: BiquadFilterType = 'bandpass') {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = getNoiseBuffer(context);
  filter.type = type;
  filter.frequency.setValueAtTime(frequency, start);
  filter.Q.setValueAtTime(type === 'lowpass' ? 0.7 : 8, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainAmount, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  source.start(start);
  source.stop(start + duration + 0.03);
}

function beep(type: SoundType, muted: boolean) {
  if (muted) return;
  const context = getAudioContext();
  if (!context) return;

  const now = context.currentTime;
  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();
  master.gain.setValueAtTime(0.78, now);
  master.connect(compressor);
  compressor.connect(context.destination);
  sampleLayers[type]?.forEach((layer, index) => playSampleLayer(context, master, layer.src, now + index * 0.018, layer.volume, layer.rate));

  if (type === 'collect') {
    [560, 720, 940].forEach((note, index) => playTone(context, master, note, now + index * 0.035, 0.17, 0.032, 'sine', note * 1.06));
    playNoise(context, master, now, 0.08, 0.012, 2400);
  }

  if (type === 'dash') {
    playTone(context, master, 820, now, 0.16, 0.04, 'sawtooth', 360);
    playTone(context, master, 1240, now + 0.018, 0.12, 0.02, 'square', 620);
    playNoise(context, master, now, 0.16, 0.03, 1700, 'highpass');
  }

  if (type === 'hit') {
    playTone(context, master, 170, now, 0.28, 0.055, 'triangle', 70);
    playTone(context, master, 92, now + 0.025, 0.22, 0.04, 'sawtooth', 48);
    playNoise(context, master, now, 0.22, 0.04, 360, 'lowpass');
  }

  if (type === 'start') {
    [260, 360, 460, 620].forEach((note, index) => playTone(context, master, note, now + index * 0.045, 0.18, 0.026, 'sine'));
    playNoise(context, master, now + 0.08, 0.12, 0.012, 1200);
  }

  if (type === 'power') {
    [420, 660, 880, 1320].forEach((note, index) => playTone(context, master, note, now + index * 0.028, 0.22, 0.03, index % 2 ? 'triangle' : 'sine', note * 1.08));
    playNoise(context, master, now, 0.16, 0.014, 3000);
  }

  if (type === 'route') {
    [520, 760, 1040, 1440].forEach((note, index) => playTone(context, master, note, now + index * 0.04, 0.22, 0.032, 'sine'));
    playTone(context, master, 140, now, 0.42, 0.022, 'triangle', 95);
  }

  if (type === 'level') {
    [460, 590, 760, 980, 1240].forEach((note, index) => playTone(context, master, note, now + index * 0.04, 0.2, 0.026, 'triangle', note * 1.04));
    playNoise(context, master, now + 0.04, 0.18, 0.014, 1900);
  }

  if (type === 'bossWarning') {
    playTone(context, master, 120, now, 0.7, 0.05, 'sawtooth', 82);
    playTone(context, master, 360, now + 0.08, 0.48, 0.03, 'triangle', 220);
    playNoise(context, master, now, 0.44, 0.05, 760, 'bandpass');
    playNoise(context, master, now + 0.12, 0.36, 0.035, 1800, 'highpass');
  }

  if (type === 'bossWin') {
    playTone(context, master, 86, now, 1.1, 0.07, 'sawtooth', 62);
    [300, 420, 560, 760, 1040, 1440].forEach((note, index) => playTone(context, master, note, now + index * 0.055, 0.34, 0.038, index % 2 ? 'triangle' : 'sine', note * 1.18));
    playNoise(context, master, now, 0.78, 0.075, 1100, 'lowpass');
    playNoise(context, master, now + 0.18, 0.58, 0.05, 3200, 'bandpass');
  }

  if (type === 'bossFail') {
    playTone(context, master, 180, now, 0.46, 0.058, 'triangle', 68);
    playTone(context, master, 70, now + 0.04, 0.52, 0.038, 'sawtooth', 42);
    playNoise(context, master, now, 0.36, 0.05, 420, 'lowpass');
  }

  if (type === 'nova') {
    playTone(context, master, 96, now, 0.72, 0.06, 'sawtooth', 54);
    playTone(context, master, 240, now + 0.03, 0.52, 0.04, 'triangle', 120);
    [520, 760, 1040, 1520].forEach((note, index) => playTone(context, master, note, now + 0.08 + index * 0.045, 0.26, 0.035, 'sine', note * 1.24));
    playNoise(context, master, now, 0.54, 0.07, 900, 'lowpass');
    playNoise(context, master, now + 0.08, 0.42, 0.042, 2800, 'bandpass');
  }

  if (type === 'burn') {
    playTone(context, master, 240, now, 0.16, 0.026, 'sawtooth', 120);
    playTone(context, master, 680, now + 0.02, 0.12, 0.02, 'triangle', 420);
    playNoise(context, master, now, 0.18, 0.035, 1300, 'bandpass');
  }

  window.setTimeout(() => master.disconnect(), 1100);
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-[#8fb8aa]/18 bg-white/62 p-3.5">
      <p className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#6c827c]">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-black uppercase text-[#20302d]">{value}</p>
    </div>
  );
}

export default function SignalBreach() {
  const gameShellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const keysRef = useRef(new Set<string>());
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({ x: 120, y: 260, active: false });
  const spritesRef = useRef<Partial<Record<SpriteKey, HTMLImageElement>>>({});
  const playerRef = useRef<Player>({ x: 120, y: 260, radius: 18, vx: 0, vy: 0, dashTime: 0, shield: 0, overclock: 0, dashCooldown: 0, invulnerable: 0 });
  const hazardsRef = useRef<Hazard[]>([]);
  const pickupsRef = useRef<Pickup[]>([]);
  const flameWavesRef = useRef<FlameWave[]>([]);
  const bossRef = useRef<BossChallenge | null>(null);
  const bossTriggeredLevelsRef = useRef(new Set<number>());
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextRef = useRef<FloatingText[]>([]);
  const trailRef = useRef<{ x: number; y: number; life: number }[]>([]);
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);
  const levelProgressRef = useRef(0);
  const comboRef = useRef(1);
  const routesRef = useRef(0);
  const tickRef = useRef(0);
  const idRef = useRef(0);
  const hazardTimerRef = useRef(32);
  const pickupTimerRef = useRef(24);
  const survivalTimerRef = useRef(0);
  const gateCooldownRef = useRef(0);
  const spawnFreezeRef = useRef(0);
  const postNovaGraceRef = useRef(0);
  const shakeRef = useRef(0);
  const dashQueuedRef = useRef(false);
  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const mutedRef = useRef(false);
  const lastFrameRef = useRef(0);
  const lastPointerDownRef = useRef(0);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(1);
  const [routes, setRoutes] = useState(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const syncHud = () => {
    setScore(scoreRef.current);
    setBest(bestRef.current);
    setLives(livesRef.current);
    setLevel(levelRef.current);
    setCombo(comboRef.current);
    setRoutes(routesRef.current);
  };

  const startBossChallenge = (bossLevel: number) => {
    if (bossTriggeredLevelsRef.current.has(bossLevel)) return;
    bossTriggeredLevelsRef.current.add(bossLevel);
    const word = bossWords[(Math.floor(bossLevel / 5) - 1) % bossWords.length];
    hazardsRef.current = [];
    pickupsRef.current = [];
    flameWavesRef.current = [];
    bossRef.current = {
      active: true,
      phase: 'warning',
      level: bossLevel,
      word,
      typed: '',
      timer: 132,
      maxTimer: 132,
      strikeTimer: 0,
      spawnTimer: 24,
      pathPhase: 0,
      resolved: false,
      message: 'BOSS CHECKPOINT INCOMING',
    };
    spawnFreezeRef.current = 999;
    postNovaGraceRef.current = 999;
    playerRef.current.x = 132;
    playerRef.current.y = gameHeight / 2;
    playerRef.current.vx = 0;
    playerRef.current.vy = 0;
    playerRef.current.invulnerable = 999;
    floatingTextRef.current.push({ x: gameWidth / 2, y: 92, vy: -0.2, life: 140, text: `BOSS LEVEL ${bossLevel}`, color: '#B94A36' });
    beep('bossWarning', mutedRef.current);
  };

  const addScore = (points: number, text?: string, x?: number, y?: number, options: { progress?: boolean } = {}) => {
    scoreRef.current += Math.round(points);
    if (scoreRef.current > bestRef.current) {
      bestRef.current = scoreRef.current;
      window.localStorage.setItem(bestScoreKey, String(bestRef.current));
    }

    if (options.progress !== false && !bossRef.current?.active) {
      levelProgressRef.current += Math.max(0, Math.round(points));
      const needed = levelRequirement(levelRef.current);
      if (levelProgressRef.current >= needed) {
        levelProgressRef.current = Math.max(0, levelProgressRef.current - needed);
        const nextLevel = Math.min(40, levelRef.current + 1);
        levelRef.current = nextLevel;
        if (nextLevel % 5 === 0) {
          levelProgressRef.current = 0;
        }
        hazardTimerRef.current = Math.min(hazardTimerRef.current, 20);
        beep('level', mutedRef.current);
        floatingTextRef.current.push({ x: gameWidth * 0.5, y: 92, vy: -0.55, life: 90, text: `LEVEL ${nextLevel}`, color: '#6F924C' });
        if (nextLevel > 1 && nextLevel % 5 === 0) {
          startBossChallenge(nextLevel);
        }
      }
    }

    if (text && x !== undefined && y !== undefined) {
      floatingTextRef.current.push({ x, y, vy: -0.7, life: 64, text, color: '#315D2C' });
    }
    syncHud();
  };

  const reset = () => {
    playerRef.current = { x: 118, y: 260, radius: 18, vx: 0, vy: 0, dashTime: 0, shield: 0, overclock: 0, dashCooldown: 0, invulnerable: 0 };
    hazardsRef.current = [];
    flameWavesRef.current = [];
    bossRef.current = null;
    bossTriggeredLevelsRef.current = new Set<number>();
    pickupsRef.current = [
      { id: idRef.current++, kind: 'shard', x: 330, y: 160, radius: 18, phase: 0 },
      { id: idRef.current++, kind: 'shard', x: 560, y: 350, radius: 18, phase: 2 },
      { id: idRef.current++, kind: 'overclock', x: 450, y: 250, radius: 18, phase: 4 },
      { id: idRef.current++, kind: 'nova', x: 680, y: 180, radius: 22, phase: 5 },
    ];
    particlesRef.current = [];
    floatingTextRef.current = [];
    trailRef.current = [];
    scoreRef.current = 0;
    livesRef.current = 3;
    levelRef.current = 1;
    levelProgressRef.current = 0;
    comboRef.current = 1;
    routesRef.current = 0;
    tickRef.current = 0;
    hazardTimerRef.current = 38;
    pickupTimerRef.current = 42;
    survivalTimerRef.current = 0;
    gateCooldownRef.current = 0;
    spawnFreezeRef.current = 0;
    postNovaGraceRef.current = 0;
    shakeRef.current = 0;
    dashQueuedRef.current = false;
    pausedRef.current = false;
    setPaused(false);
    syncHud();
  };

  const start = () => {
    reset();
    runningRef.current = true;
    setRunning(true);
    beep('start', mutedRef.current);
  };

  const togglePause = () => {
    if (!runningRef.current) return;
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  };

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    preloadSampleLayers().catch(() => undefined);
  }, []);

  useEffect(() => {
    const savedBest = Number(window.localStorage.getItem(bestScoreKey) || 0);
    bestRef.current = Number.isFinite(savedBest) ? savedBest : 0;
    setBest(bestRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (Object.entries(spritePaths) as [SpriteKey, string][]).forEach(([key, src]) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        if (!cancelled) spritesRef.current[key] = image;
      };
      image.src = src;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(document.fullscreenElement === gameShellRef.current);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    const shell = gameShellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
      return;
    }
    shell.requestFullscreen().catch(() => undefined);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const boss = bossRef.current;

      if (boss?.active && boss.phase === 'typing') {
        event.preventDefault();
        if (key === 'backspace') {
          boss.typed = boss.typed.slice(0, -1);
          return;
        }

        if (event.key.length === 1) {
          const nextCharacter = event.key.toUpperCase();
          if (/^[A-Z0-9-]$/.test(nextCharacter)) {
            boss.typed = `${boss.typed}${nextCharacter}`.slice(0, boss.word.length);
            if (!boss.word.startsWith(boss.typed)) {
              boss.typed = nextCharacter === boss.word[0] ? nextCharacter : '';
              beep('hit', mutedRef.current);
              shakeRef.current = Math.max(shakeRef.current, 6);
              return;
            }

            beep('collect', mutedRef.current);
            if (boss.typed === boss.word) {
              boss.phase = 'strike';
              boss.timer = 0;
              boss.maxTimer = 260;
              boss.strikeTimer = 0;
              boss.spawnTimer = 0;
              boss.pathPhase = 0;
              boss.resolved = false;
              boss.message = 'SPIKED CANNONBALL DEPLOYED';
              livesRef.current = Math.min(9, livesRef.current + 1);
              comboRef.current = Math.min(16, comboRef.current + 2);
              addScore(1400 + boss.level * 120, '+1 LIFE // BOSS CLEAR', gameWidth / 2, 94, { progress: false });
              floatingTextRef.current.push({ x: gameWidth / 2, y: 132, vy: -0.55, life: 130, text: '+1 LIFE', color: '#6F924C' });
              beep('bossWin', mutedRef.current);
              syncHud();
            }
          }
          return;
        }
      }

      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        event.preventDefault();
        keysRef.current.add(key);
      }
      if (key === ' ' || key === 'shift') {
        event.preventDefault();
        dashQueuedRef.current = true;
      }
      if (key === 'p') {
        togglePause();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const drawSprite = (key: SpriteKey, x: number, y: number, size: number, rotation = 0, alpha = 1) => {
      const image = spritesRef.current[key];
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rotation);
      if (image?.complete && image.naturalWidth > 0) {
        ctx.drawImage(image, -size / 2, -size / 2, size, size);
      } else {
        ctx.fillStyle = key === 'block' ? '#ef8a7a' : key === 'seeker' ? '#d79b5f' : key === 'shard' ? '#a8d58c' : '#65cfd7';
        ctx.beginPath();
        ctx.arc(0, 0, size / 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const addBurst = (x: number, y: number, color: string, count: number, force = 1) => {
      for (let i = 0; i < count; i += 1) {
        const angle = random(0, Math.PI * 2);
        const speed = random(1.2, 4.4) * force;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: random(2, 5),
          life: random(24, 58),
          maxLife: 58,
          color,
        });
      }
    };

    const spawnPickup = () => {
      if (pickupsRef.current.length >= 8) return;
      const player = playerRef.current;
      const roll = Math.random();
      const kind: Pickup['kind'] = levelRef.current >= 2 && roll < 0.085 ? 'nova' : player.shield <= 0 && roll < 0.2 ? 'shield' : roll < 0.36 ? 'overclock' : 'shard';
      pickupsRef.current.push({
        id: idRef.current++,
        kind,
        x: random(190, gameWidth - 190),
        y: random(62, gameHeight - 70),
        radius: kind === 'shard' ? 17 : kind === 'nova' ? 24 : 20,
        phase: random(0, Math.PI * 2),
      });
    };

    const activateNova = (x: number, y: number) => {
      flameWavesRef.current.push({
        id: idRef.current++,
        x,
        y,
        radius: 18,
        maxRadius: 420,
        speed: 13.5,
        life: 42,
        maxLife: 42,
        phase: random(0, Math.PI * 2),
        hitIds: new Set<number>(),
      });
      comboRef.current = Math.min(12, comboRef.current + 1.4);
      spawnFreezeRef.current = Math.max(spawnFreezeRef.current, 96);
      postNovaGraceRef.current = Math.max(postNovaGraceRef.current, 132);
      hazardTimerRef.current = Math.max(hazardTimerRef.current, 92);
      shakeRef.current = Math.max(shakeRef.current, 18);
      addBurst(x, y, '#EF6C42', 44, 1.65);
      addBurst(x, y, '#F7B15E', 34, 1.25);
      floatingTextRef.current.push({ x, y: y - 30, vy: -0.75, life: 78, text: 'FLAME NOVA', color: '#B94A36' });
      addScore(180, 'NOVA READY', x, y + 12);
      beep('nova', mutedRef.current);
    };

    const flameTouchesHazard = (wave: FlameWave, hazard: Hazard) => {
      const thickness = 58;
      if (hazard.kind === 'gate') {
        const gapY = hazard.gapY ?? gameHeight / 2;
        const gapSize = hazard.gapSize ?? 120;
        const topY = clamp(wave.y, 0, gapY - gapSize / 2);
        const bottomY = clamp(wave.y, gapY + gapSize / 2, gameHeight);
        const topDistance = Math.hypot(hazard.x - wave.x, topY - wave.y);
        const bottomDistance = Math.hypot(hazard.x - wave.x, bottomY - wave.y);
        const closest = Math.min(topDistance, bottomDistance);
        return closest <= wave.radius + (hazard.width ?? 44) && closest >= wave.radius - thickness;
      }

      const hitDistance = distance(wave, hazard);
      return hitDistance <= wave.radius + hazard.radius && hitDistance >= wave.radius - thickness;
    };

    const updateFlameWaves = (delta: number) => {
      flameWavesRef.current.forEach((wave) => {
        wave.radius += wave.speed * delta;
        wave.life -= delta;
        let destroyed = 0;

        hazardsRef.current.forEach((hazard) => {
          if (wave.hitIds.has(hazard.id) || !flameTouchesHazard(wave, hazard)) return;
          wave.hitIds.add(hazard.id);
          destroyed += 1;
          const killX = hazard.x;
          const killY = hazard.kind === 'gate' ? wave.y : hazard.y;
          hazard.x = -260;
          hazard.vx = 0;
          hazard.vy = 0;
          addBurst(killX, killY, '#EF6C42', 22, 1.45);
          addBurst(killX, killY, '#F7B15E', 12, 1.1);
        });

        if (destroyed > 0) {
          comboRef.current = Math.min(14, comboRef.current + destroyed * 0.55);
          addScore((190 + levelRef.current * 28) * destroyed * comboRef.current, `BURN x${destroyed}`, wave.x, wave.y - Math.min(120, wave.radius * 0.28));
          shakeRef.current = Math.max(shakeRef.current, 8 + destroyed * 2);
          beep('burn', mutedRef.current);
        }
      });

      flameWavesRef.current = flameWavesRef.current.filter((wave) => wave.radius < wave.maxRadius && wave.life > 0);
    };

    const spawnHazard = () => {
      const level = levelRef.current;
      const roll = Math.random();
      const speed = random(1.9, 2.8) + level * 0.24;
      const gatesOnScreen = hazardsRef.current.filter((hazard) => hazard.kind === 'gate' && hazard.x > -60 && hazard.x < gameWidth + 260).length;
      const gateChance = level >= 5 && gateCooldownRef.current <= 0 && gatesOnScreen === 0 ? Math.min(0.18, 0.07 + level * 0.005) : 0;

      if (roll < gateChance) {
        const gapSize = Math.max(132, 210 - Math.min(level, 22) * 2.6);
        const halfGap = gapSize / 2;
        gateCooldownRef.current = Math.max(170, 255 - Math.min(level, 18) * 3);
        hazardsRef.current.push({
          id: idRef.current++,
          kind: 'gate',
          x: gameWidth + 70,
          y: gameHeight / 2,
          radius: 28,
          vx: -Math.min(speed * 0.62, 3.9),
          vy: 0,
          phase: random(0, Math.PI * 2),
          gapY: random(halfGap + 38, gameHeight - halfGap - 38),
          gapSize,
          width: 34,
        });
        return;
      }

      if (level >= 3 && roll < Math.min(0.52, 0.22 + level * 0.018)) {
        hazardsRef.current.push({
          id: idRef.current++,
          kind: 'seeker',
          x: gameWidth + 46,
          y: random(72, gameHeight - 72),
          radius: 22,
          vx: -speed * 0.68,
          vy: random(-0.7, 0.7),
          phase: random(0, Math.PI * 2),
        });
        return;
      }

      hazardsRef.current.push({
        id: idRef.current++,
        kind: 'block',
        x: gameWidth + 44,
        y: random(58, gameHeight - 58),
        radius: random(21, 30),
        vx: -speed,
        vy: random(-0.85, 0.85),
        phase: random(0, Math.PI * 2),
      });
    };

    const spawnBossHorde = (boss: BossChallenge) => {
      const lane = (hazardsRef.current.length + Math.floor(tickRef.current)) % 7;
      const y = 70 + lane * 62 + Math.sin(tickRef.current * 0.04 + lane) * 18;
      const kind: Hazard['kind'] = lane % 3 === 0 ? 'seeker' : 'block';
      hazardsRef.current.push({
        id: idRef.current++,
        kind,
        x: gameWidth + random(28, 180),
        y: clamp(y, 58, gameHeight - 58),
        radius: kind === 'seeker' ? 22 : random(24, 34),
        vx: -random(2.6, 4.8) - boss.level * 0.08,
        vy: random(-0.9, 0.9),
        phase: random(0, Math.PI * 2),
      });
    };

    const finishBossChallenge = (cleared: boolean) => {
      const boss = bossRef.current;
      if (!boss) return;
      levelRef.current = Math.min(40, boss.level + 1);
      levelProgressRef.current = 0;
      bossRef.current = null;
      hazardsRef.current = [];
      flameWavesRef.current = [];
      spawnFreezeRef.current = 92;
      postNovaGraceRef.current = 130;
      hazardTimerRef.current = 118;
      pickupTimerRef.current = Math.min(pickupTimerRef.current, 42);
      playerRef.current.x = 118;
      playerRef.current.y = gameHeight / 2;
      playerRef.current.vx = 0;
      playerRef.current.vy = 0;
      playerRef.current.invulnerable = 90;
      floatingTextRef.current.push({
        x: gameWidth / 2,
        y: 118,
        vy: -0.45,
        life: 110,
        text: cleared ? `LEVEL ${Math.min(40, boss.level + 1)} ONLINE` : `LEVEL ${Math.min(40, boss.level + 1)} ONLINE // NO BONUS`,
        color: cleared ? '#6F924C' : '#B96658',
      });
      if (!cleared) beep('bossFail', mutedRef.current);
      syncHud();
    };

    const updateBossChallenge = (delta: number) => {
      const boss = bossRef.current;
      if (!boss?.active) return false;

      tickRef.current += delta;
      boss.timer -= delta;
      boss.spawnTimer -= delta;
      postNovaGraceRef.current = 999;
      spawnFreezeRef.current = 999;
      playerRef.current.invulnerable = 999;

      if (boss.phase === 'warning') {
        playerRef.current.x += (132 - playerRef.current.x) * 0.08 * delta;
        playerRef.current.y += (gameHeight / 2 - playerRef.current.y) * 0.08 * delta;
        if (boss.timer <= 0) {
          boss.phase = 'typing';
          boss.timer = 420;
          boss.maxTimer = 420;
          boss.spawnTimer = 0;
          boss.message = `TYPE ${boss.word}`;
          beep('bossWarning', mutedRef.current);
        }
      }

      if (boss.phase === 'typing') {
        if (boss.spawnTimer <= 0) {
          spawnBossHorde(boss);
          if (boss.level >= 10 && Math.random() < 0.45) spawnBossHorde(boss);
          boss.spawnTimer = Math.max(4, 12 - boss.level * 0.24);
        }
        if (boss.timer <= 0) {
          boss.phase = 'fail';
          boss.timer = 96;
          boss.message = 'PROTOCOL MISSED';
          shakeRef.current = Math.max(shakeRef.current, 12);
          beep('bossFail', mutedRef.current);
        }
      }

      if (boss.phase === 'strike') {
        boss.strikeTimer += delta;
        boss.pathPhase += delta * 0.24;
        const progress = clamp(boss.strikeTimer / 260, 0, 1);
        const sweepPath = [
          { x: 132, y: gameHeight / 2 },
          { x: gameWidth - 88, y: 76 },
          { x: 86, y: 74 },
          { x: gameWidth - 86, y: gameHeight - 74 },
          { x: 84, y: gameHeight - 76 },
          { x: gameWidth / 2, y: gameHeight / 2 },
          { x: gameWidth - 116, y: gameHeight / 2 },
          { x: 118, y: gameHeight / 2 },
        ];
        const segmentProgress = progress * (sweepPath.length - 1);
        const segment = Math.min(sweepPath.length - 2, Math.floor(segmentProgress));
        const local = segmentProgress - segment;
        const eased = 1 - Math.pow(1 - local, 3);
        const from = sweepPath[segment];
        const to = sweepPath[segment + 1];
        const previousX = playerRef.current.x;
        const previousY = playerRef.current.y;
        playerRef.current.x = from.x + (to.x - from.x) * eased + Math.sin(boss.pathPhase * 5) * 10;
        playerRef.current.y = from.y + (to.y - from.y) * eased + Math.cos(boss.pathPhase * 4.4) * 8;
        playerRef.current.vx = playerRef.current.x - previousX;
        playerRef.current.vy = playerRef.current.y - previousY;
        trailRef.current.unshift({ x: playerRef.current.x, y: playerRef.current.y, life: 36 });
        trailRef.current = trailRef.current.map((trail) => ({ ...trail, life: trail.life - delta * 0.55 })).filter((trail) => trail.life > 0).slice(0, 34);
        shakeRef.current = Math.max(shakeRef.current, 12 + Math.sin(progress * Math.PI) * 18);

        if (!boss.resolved) {
          boss.resolved = true;
          while (hazardsRef.current.length < 22) {
            spawnBossHorde(boss);
          }
          addBurst(playerRef.current.x, playerRef.current.y, '#FFF8DB', 36, 1.8);
          addBurst(playerRef.current.x, playerRef.current.y, '#F7B15E', 28, 1.45);
        }

        if (boss.spawnTimer <= 0 && boss.strikeTimer < 150) {
          spawnBossHorde(boss);
          spawnBossHorde(boss);
          boss.spawnTimer = 10;
        }

        let hits = 0;
        const visibleHazards = hazardsRef.current.filter((hazard) => hazard.x > -40 && hazard.x < gameWidth + 120);
        visibleHazards.forEach((hazard, index) => {
          const hitDistance = hazard.kind === 'gate' ? Math.abs(hazard.x - playerRef.current.x) : distance(playerRef.current, hazard);
          const forcedSweep = boss.strikeTimer > 20 + index * 4;
          if (hitDistance > 116 && !forcedSweep) return;
          hits += 1;
          const hitX = hazard.x;
          const hitY = hazard.kind === 'gate' ? playerRef.current.y : hazard.y;
          hazard.x = -300;
          addBurst(hitX, hitY, '#F7B15E', 24, 1.45);
          addBurst(hitX, hitY, '#EF6C42', 14, 1.2);
        });

        if (hits > 0) {
          addScore((230 + boss.level * 35) * hits, `SPIKES x${hits}`, playerRef.current.x, playerRef.current.y - 36, { progress: false });
          beep('burn', mutedRef.current);
        }
        hazardsRef.current = hazardsRef.current.filter((hazard) => hazard.x > -150);

        if (boss.strikeTimer >= 260) {
          addBurst(playerRef.current.x, playerRef.current.y, '#FFF8DB', 44, 1.8);
          addBurst(playerRef.current.x, playerRef.current.y, '#F7B15E', 42, 1.55);
          finishBossChallenge(true);
        }
      }

      if (boss.phase === 'fail') {
        if (boss.timer <= 0) {
          finishBossChallenge(false);
        }
      }

      hazardsRef.current.forEach((hazard) => {
        hazard.x += hazard.vx * delta;
        hazard.y += (hazard.vy + Math.sin((tickRef.current + hazard.phase * 30) * 0.045) * 0.36) * delta;
        if (hazard.kind !== 'gate') hazard.y = clamp(hazard.y, 44, gameHeight - 44);
      });
      hazardsRef.current = hazardsRef.current.filter((hazard) => hazard.x > -170);

      particlesRef.current = particlesRef.current
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx * delta,
          y: particle.y + particle.vy * delta,
          vx: particle.vx * 0.985,
          vy: particle.vy * 0.985,
          life: particle.life - delta,
        }))
        .filter((particle) => particle.life > 0);

      floatingTextRef.current = floatingTextRef.current
        .map((text) => ({ ...text, y: text.y + text.vy * delta, life: text.life - delta }))
        .filter((text) => text.life > 0);
      shakeRef.current = Math.max(0, shakeRef.current - delta * 0.65);
      return true;
    };

    const damagePlayer = (hazard?: Hazard) => {
      const player = playerRef.current;
      if (player.invulnerable > 0 || postNovaGraceRef.current > 0 || bossRef.current?.active) return;

      if (player.shield > 0) {
        player.shield = 0;
        player.invulnerable = 54;
        comboRef.current = Math.max(1, comboRef.current - 1);
        shakeRef.current = 8;
        addBurst(player.x, player.y, '#65CFD7', 18, 1.15);
        floatingTextRef.current.push({ x: player.x, y: player.y - 22, vy: -0.7, life: 62, text: 'SHIELD SAVED', color: '#43888C' });
        beep('power', mutedRef.current);
        if (hazard) hazard.x = -160;
        syncHud();
        return;
      }

      livesRef.current -= 1;
      comboRef.current = 1;
      player.invulnerable = 76;
      player.x = clamp(player.x - 48, 52, gameWidth - 150);
      player.vx = -7;
      shakeRef.current = 15;
      addBurst(player.x, player.y, '#EF8A7A', 22, 1.25);
      floatingTextRef.current.push({ x: player.x, y: player.y - 24, vy: -0.8, life: 64, text: '-1 LIFE', color: '#B96658' });
      beep('hit', mutedRef.current);
      if (hazard) hazard.x = -160;

      if (livesRef.current <= 0) {
        runningRef.current = false;
        setRunning(false);
        floatingTextRef.current.push({ x: gameWidth * 0.5, y: 118, vy: -0.3, life: 140, text: 'BREACH FAILED', color: '#B96658' });
      }
      syncHud();
    };

    const routePacket = () => {
      const player = playerRef.current;
      routesRef.current += 1;
      comboRef.current = Math.min(12, comboRef.current + 1);
      addScore(320 + levelRef.current * 55 + comboRef.current * 42, `ROUTE x${comboRef.current}`, gameWidth - 144, player.y);
      if (bossRef.current?.active) {
        syncHud();
        return;
      }
      player.x = 118;
      player.y = random(120, gameHeight - 120);
      player.vx = 0;
      player.vy = 0;
      player.invulnerable = 42;
      hazardTimerRef.current = Math.min(hazardTimerRef.current, 18);
      addBurst(gameWidth - 90, player.y, '#A8D58C', 34, 1.35);
      beep('route', mutedRef.current);
      syncHud();
    };

    const update = (delta: number) => {
      if (updateBossChallenge(delta)) return;
      const player = playerRef.current;
      const level = levelRef.current;
      tickRef.current += delta;
      gateCooldownRef.current = Math.max(0, gateCooldownRef.current - delta);
      spawnFreezeRef.current = Math.max(0, spawnFreezeRef.current - delta);
      postNovaGraceRef.current = Math.max(0, postNovaGraceRef.current - delta);
      hazardTimerRef.current -= delta;
      pickupTimerRef.current -= delta;
      survivalTimerRef.current += delta;
      if (spawnFreezeRef.current > 0) {
        hazardTimerRef.current = Math.max(hazardTimerRef.current, 34);
      }

      if (hazardTimerRef.current <= 0 && spawnFreezeRef.current <= 0) {
        spawnHazard();
        if (level >= 10 && Math.random() < 0.28) spawnHazard();
        if (level >= 18 && Math.random() < 0.16) spawnHazard();
        hazardTimerRef.current = Math.max(9, random(42, 74) - level * 2.65);
      }

      if (pickupTimerRef.current <= 0) {
        spawnPickup();
        pickupTimerRef.current = Math.max(38, random(76, 122) - level * 1.4);
      }

      if (survivalTimerRef.current > 34) {
        survivalTimerRef.current = 0;
        addScore(level + comboRef.current);
        if (bossRef.current?.active) return;
      }

      const left = keysRef.current.has('arrowleft') || keysRef.current.has('a');
      const right = keysRef.current.has('arrowright') || keysRef.current.has('d');
      const up = keysRef.current.has('arrowup') || keysRef.current.has('w');
      const down = keysRef.current.has('arrowdown') || keysRef.current.has('s');
      const hasKeyboardInput = left || right || up || down;
      const maxSpeed = (player.overclock > 0 ? 5.85 : 4.45) + Math.min(level, 16) * 0.035;
      let targetVx = (right ? maxSpeed : 0) - (left ? maxSpeed : 0);
      let targetVy = (down ? maxSpeed : 0) - (up ? maxSpeed : 0);

      if (!hasKeyboardInput && pointerRef.current.active) {
        const dx = pointerRef.current.x - player.x;
        const dy = pointerRef.current.y - player.y;
        targetVx = clamp(dx * 0.072, -maxSpeed, maxSpeed);
        targetVy = clamp(dy * 0.072, -maxSpeed, maxSpeed);
      }

      const targetLength = Math.hypot(targetVx, targetVy);
      if (targetLength > maxSpeed) {
        targetVx = (targetVx / targetLength) * maxSpeed;
        targetVy = (targetVy / targetLength) * maxSpeed;
      }

      if (dashQueuedRef.current && player.dashCooldown <= 0) {
        const dashDx = pointerRef.current.active ? pointerRef.current.x - player.x : targetVx || 1;
        const dashDy = pointerRef.current.active ? pointerRef.current.y - player.y : targetVy;
        const dashLength = Math.hypot(dashDx, dashDy) || 1;
        player.vx += (dashDx / dashLength) * 21;
        player.vy += (dashDy / dashLength) * 21;
        player.dashTime = 18;
        player.dashCooldown = Math.max(48, 88 - Math.min(level, 16) * 1.1);
        player.invulnerable = Math.max(player.invulnerable, 24);
        addBurst(player.x, player.y, '#65CFD7', 24, 1.15);
        beep('dash', mutedRef.current);
      }
      dashQueuedRef.current = false;

      const steering = player.dashTime > 0 ? 0.055 : 0.18;
      player.vx += (targetVx - player.vx) * steering * delta;
      player.vy += (targetVy - player.vy) * steering * delta;
      player.x = clamp(player.x + player.vx * delta, 32, gameWidth - 112);
      player.y = clamp(player.y + player.vy * delta, 34, gameHeight - 34);
      player.dashTime = Math.max(0, player.dashTime - delta);
      player.dashCooldown = Math.max(0, player.dashCooldown - delta);
      player.shield = Math.max(0, player.shield - delta);
      player.overclock = Math.max(0, player.overclock - delta);
      player.invulnerable = Math.max(player.dashTime > 0 ? 1 : 0, player.invulnerable - delta);

      trailRef.current.unshift({ x: player.x, y: player.y, life: 28 });
      trailRef.current = trailRef.current
        .map((trail) => ({ ...trail, life: trail.life - delta }))
        .filter((trail) => trail.life > 0)
        .slice(0, player.dashTime > 0 ? 30 : 18);

      hazardsRef.current.forEach((hazard) => {
        if (hazard.kind === 'seeker') {
          const dx = player.x - hazard.x;
          const dy = player.y - hazard.y;
          const length = Math.hypot(dx, dy) || 1;
          const aggression = 0.026 + Math.min(level, 22) * 0.002;
          hazard.vx += (dx / length) * aggression * delta;
          hazard.vy += (dy / length) * aggression * delta;
          const maxSeekerSpeed = 2.1 + Math.min(level, 20) * 0.085;
          const speed = Math.hypot(hazard.vx, hazard.vy);
          if (speed > maxSeekerSpeed) {
            hazard.vx = (hazard.vx / speed) * maxSeekerSpeed;
            hazard.vy = (hazard.vy / speed) * maxSeekerSpeed;
          }
        }

        hazard.x += hazard.vx * delta;
        hazard.y += (hazard.vy + Math.sin((tickRef.current + hazard.phase * 30) * 0.045) * 0.36) * delta;
        if (hazard.kind !== 'gate') {
          hazard.y = clamp(hazard.y, 44, gameHeight - 44);
        }
      });
      updateFlameWaves(delta);
      if (bossRef.current?.active) return;
      hazardsRef.current = hazardsRef.current.filter((hazard) => hazard.x > -150);

      pickupsRef.current = pickupsRef.current.filter((pickup) => {
        pickup.phase += 0.035 * delta;
        if (distance(player, pickup) < player.radius + pickup.radius) {
          if (pickup.kind === 'shard') {
            comboRef.current = Math.min(12, comboRef.current + 0.35);
            addScore(115 * comboRef.current, `+${Math.round(115 * comboRef.current)}`, pickup.x, pickup.y);
            addBurst(pickup.x, pickup.y, '#A8D58C', 16);
            beep('collect', mutedRef.current);
          }
          if (pickup.kind === 'shield') {
            player.shield = 430;
            addScore(80, 'SHIELD', pickup.x, pickup.y);
            addBurst(pickup.x, pickup.y, '#65CFD7', 18);
            beep('power', mutedRef.current);
          }
          if (pickup.kind === 'overclock') {
            player.overclock = 360;
            comboRef.current = Math.min(12, comboRef.current + 1);
            addScore(120, 'OVERCLOCK', pickup.x, pickup.y);
            addBurst(pickup.x, pickup.y, '#F3D99B', 22);
            beep('power', mutedRef.current);
          }
          if (pickup.kind === 'nova') {
            activateNova(player.x, player.y);
          }
          syncHud();
          return false;
        }
        return true;
      });
      if (bossRef.current?.active) return;

      hazardsRef.current.forEach((hazard) => {
        if (hazard.kind === 'gate') {
          const gapY = hazard.gapY ?? gameHeight / 2;
          const gapSize = hazard.gapSize ?? 120;
          const width = hazard.width ?? 42;
          const insideX = Math.abs(player.x - hazard.x) < width / 2 + player.radius;
          const inGap = player.y > gapY - gapSize / 2 + player.radius && player.y < gapY + gapSize / 2 - player.radius;
          if (insideX && !inGap) damagePlayer(hazard);
          return;
        }

        if (distance(player, hazard) < player.radius + hazard.radius * 0.76) {
          damagePlayer(hazard);
        }
      });

      if (player.x > gameWidth - 126) {
        routePacket();
      }

      particlesRef.current = particlesRef.current
        .map((particle) => ({
          ...particle,
          x: particle.x + particle.vx * delta,
          y: particle.y + particle.vy * delta,
          vx: particle.vx * 0.985,
          vy: particle.vy * 0.985,
          life: particle.life - delta,
        }))
        .filter((particle) => particle.life > 0);

      floatingTextRef.current = floatingTextRef.current
        .map((text) => ({ ...text, y: text.y + text.vy * delta, life: text.life - delta }))
        .filter((text) => text.life > 0);

      shakeRef.current = Math.max(0, shakeRef.current - delta * 0.8);
    };

    const drawGrid = () => {
      const offset = (tickRef.current * 0.55) % 42;
      ctx.strokeStyle = 'rgba(65,128,130,0.1)';
      ctx.lineWidth = 1;
      for (let x = -42 + offset; x <= gameWidth; x += 42) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 90, gameHeight);
        ctx.stroke();
      }
      for (let y = 22; y <= gameHeight; y += 42) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(gameWidth, y);
        ctx.stroke();
      }
    };

    const drawGate = (hazard: Hazard) => {
      const gapY = hazard.gapY ?? gameHeight / 2;
      const gapSize = hazard.gapSize ?? 120;
      const width = hazard.width ?? 42;
      const topHeight = gapY - gapSize / 2;
      const bottomY = gapY + gapSize / 2;
      const gradient = ctx.createLinearGradient(hazard.x - width / 2, 0, hazard.x + width / 2, 0);
      gradient.addColorStop(0, 'rgba(185,102,88,0.2)');
      gradient.addColorStop(0.5, 'rgba(239,138,122,0.84)');
      gradient.addColorStop(1, 'rgba(185,102,88,0.24)');

      ctx.save();
      ctx.fillStyle = gradient;
      ctx.strokeStyle = 'rgba(185,102,88,0.66)';
      ctx.lineWidth = 2;
      roundRect(ctx, hazard.x - width / 2, -8, width, topHeight + 8, 14);
      ctx.fill();
      ctx.stroke();
      roundRect(ctx, hazard.x - width / 2, bottomY, width, gameHeight - bottomY + 8, 14);
      ctx.fill();
      ctx.stroke();
      drawSprite('block', hazard.x, topHeight + 14, 50, Math.sin(tickRef.current * 0.04) * 0.12, 0.94);
      drawSprite('block', hazard.x, bottomY - 14, 50, -Math.sin(tickRef.current * 0.04) * 0.12, 0.94);
      ctx.restore();
    };

    const drawFlameWave = (wave: FlameWave) => {
      const progress = wave.radius / wave.maxRadius;
      const alpha = Math.max(0, wave.life / wave.maxLife);
      const spokeCount = 34;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(wave.x, wave.y);
      ctx.shadowColor = '#EF6C42';
      ctx.shadowBlur = 20;

      const glow = ctx.createRadialGradient(0, 0, Math.max(6, wave.radius * 0.15), 0, 0, wave.radius);
      glow.addColorStop(0, `rgba(255,248,219,${0.08 * alpha})`);
      glow.addColorStop(0.58, `rgba(247,177,94,${0.18 * alpha})`);
      glow.addColorStop(1, `rgba(239,108,66,${0.02 * alpha})`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, wave.radius, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < spokeCount; i += 1) {
        const angle = (Math.PI * 2 * i) / spokeCount + wave.phase + tickRef.current * 0.018;
        const wobble = Math.sin(tickRef.current * 0.075 + i * 1.7) * 12;
        const inner = Math.max(10, wave.radius - 72 + wobble * 0.3);
        const outer = wave.radius + Math.sin(tickRef.current * 0.06 + i * 2.1) * 13 + 6;
        ctx.strokeStyle = i % 3 === 0 ? `rgba(255,248,219,${0.64 * alpha})` : `rgba(239,108,66,${0.48 * alpha})`;
        ctx.lineWidth = i % 4 === 0 ? 7 : 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx.stroke();
      }

      ctx.strokeStyle = `rgba(255,248,219,${0.72 * alpha})`;
      ctx.lineWidth = 3 + Math.sin(progress * Math.PI) * 4;
      ctx.beginPath();
      ctx.arc(0, 0, wave.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(239,108,66,${0.38 * alpha})`;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(10, wave.radius - 22), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    const drawSpikedCannonball = () => {
      const player = playerRef.current;
      const spin = tickRef.current * 0.44;
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowColor = 'rgba(22,35,31,0.22)';
      ctx.shadowBlur = 10;
      for (let ring = 0; ring < 3; ring += 1) {
        ctx.strokeStyle = ring === 0 ? 'rgba(248,230,170,0.2)' : 'rgba(49,93,82,0.12)';
        ctx.lineWidth = 2 + ring * 2;
        ctx.beginPath();
        ctx.arc(0, 0, 44 + ring * 13 + Math.sin(tickRef.current * 0.18 + ring) * 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.rotate(spin);
      drawSprite('spikeBall', 0, 0, 116 + Math.sin(tickRef.current * 0.2) * 6, 0);
      ctx.restore();
    };

    const drawBossOverlay = () => {
      const boss = bossRef.current;
      if (!boss?.active) return;
      const remaining = Math.max(0, boss.timer / boss.maxTimer);
      ctx.save();
      ctx.fillStyle = 'rgba(255,250,240,0.88)';
      roundRect(ctx, 96, 38, gameWidth - 192, boss.phase === 'typing' ? 118 : 90, 28);
      ctx.fill();
      ctx.strokeStyle = boss.phase === 'strike' ? 'rgba(247,177,94,0.72)' : 'rgba(239,108,66,0.62)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#20302D';
      ctx.font = '900 24px Space Grotesk, sans-serif';
      ctx.fillText(boss.phase === 'strike' ? 'SPIKED CANNONBALL CUTSCENE' : boss.message, gameWidth / 2, 74);
      ctx.font = '800 12px Space Grotesk, monospace';
      ctx.fillStyle = 'rgba(32,48,45,0.62)';
      ctx.fillText(`boss level ${boss.level} // unavoidable horde protocol`, gameWidth / 2, 99);

      if (boss.phase === 'typing') {
        ctx.fillStyle = '#F7B15E';
        ctx.font = '900 32px Space Grotesk, sans-serif';
        ctx.fillText(boss.word, gameWidth / 2, 136);
        ctx.fillStyle = boss.word.startsWith(boss.typed) ? '#A8D58C' : '#EF8A7A';
        ctx.font = '900 22px Space Grotesk, monospace';
        ctx.fillText(boss.typed || 'TYPE THE WORD', gameWidth / 2, 170);
        ctx.fillStyle = 'rgba(255,248,219,0.22)';
        roundRect(ctx, 182, 188, gameWidth - 364, 10, 10);
        ctx.fill();
        ctx.fillStyle = '#F7B15E';
        roundRect(ctx, 182, 188, (gameWidth - 364) * remaining, 10, 10);
        ctx.fill();
      }

      if (boss.phase === 'warning') {
        ctx.fillStyle = '#F7B15E';
        ctx.font = '900 28px Space Grotesk, sans-serif';
        ctx.fillText('GET READY', gameWidth / 2, 138);
      }

      if (boss.phase === 'fail') {
        ctx.fillStyle = '#EF8A7A';
        ctx.font = '900 26px Space Grotesk, sans-serif';
        ctx.fillText('NO EXTRA LIFE THIS TIME', gameWidth / 2, 134);
      }
      ctx.textAlign = 'left';
      ctx.restore();
    };

    const drawOverlay = (title: string, subtitle: string) => {
      ctx.save();
      ctx.fillStyle = 'rgba(255,248,235,0.72)';
      ctx.fillRect(0, 0, gameWidth, gameHeight);
      ctx.fillStyle = '#20302D';
      ctx.textAlign = 'center';
      ctx.font = '900 34px Space Grotesk, sans-serif';
      ctx.fillText(title, gameWidth / 2, gameHeight / 2 - 12);
      ctx.font = '700 13px Space Grotesk, monospace';
      ctx.fillStyle = 'rgba(32,48,45,0.68)';
      ctx.fillText(subtitle, gameWidth / 2, gameHeight / 2 + 22);
      ctx.textAlign = 'left';
      ctx.restore();
    };

    const draw = (now = performance.now()) => {
      const delta = clamp((now - (lastFrameRef.current || now)) / 16.67, 0.65, 1.9);
      lastFrameRef.current = now;
      const isPlaying = runningRef.current && !pausedRef.current;
      if (isPlaying) update(delta);

      ctx.clearRect(0, 0, gameWidth, gameHeight);
      const gradient = ctx.createLinearGradient(0, 0, gameWidth, gameHeight);
      gradient.addColorStop(0, '#fff8eb');
      gradient.addColorStop(0.5, '#eef8f5');
      gradient.addColorStop(1, '#f7fff0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, gameWidth, gameHeight);
      drawGrid();

      const shake = shakeRef.current > 0 ? random(-shakeRef.current, shakeRef.current) : 0;
      ctx.save();
      ctx.translate(shake, shake * 0.45);

      const coreGradient = ctx.createLinearGradient(gameWidth - 128, 0, gameWidth, 0);
      coreGradient.addColorStop(0, 'rgba(168,213,140,0)');
      coreGradient.addColorStop(1, 'rgba(168,213,140,0.32)');
      ctx.fillStyle = coreGradient;
      ctx.fillRect(gameWidth - 140, 0, 140, gameHeight);
      drawSprite('core', gameWidth - 64, gameHeight / 2, 142, Math.sin(tickRef.current * 0.012) * 0.02);

      trailRef.current.forEach((trail, index) => {
        ctx.globalAlpha = Math.max(0, trail.life / 28) * (playerRef.current.dashTime > 0 ? 0.42 : 0.28);
        ctx.fillStyle = playerRef.current.overclock > 0 ? '#F3D99B' : '#65CFD7';
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, Math.max(3, (playerRef.current.dashTime > 0 ? 18 : 14) - index * 0.55), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      pickupsRef.current.forEach((pickup) => {
        const bob = Math.sin(pickup.phase + tickRef.current * 0.045) * 5;
        const key: SpriteKey = pickup.kind === 'shield' ? 'shield' : pickup.kind === 'overclock' ? 'overclock' : pickup.kind === 'nova' ? 'nova' : 'shard';
        drawSprite(key, pickup.x, pickup.y + bob, pickup.kind === 'shard' ? 48 : pickup.kind === 'nova' ? 62 : 54, Math.sin(pickup.phase) * 0.08);
      });

      hazardsRef.current.forEach((hazard) => {
        if (hazard.kind === 'gate') {
          drawGate(hazard);
          return;
        }
        const key: SpriteKey = hazard.kind === 'seeker' ? 'seeker' : 'block';
        drawSprite(key, hazard.x, hazard.y, hazard.radius * 2.45, Math.sin(tickRef.current * 0.035 + hazard.phase) * 0.18);
      });

      flameWavesRef.current.forEach(drawFlameWave);

      particlesRef.current.forEach((particle) => {
        ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      const player = playerRef.current;
      if (player.shield > 0) {
        ctx.strokeStyle = 'rgba(101,207,215,0.62)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 34 + Math.sin(tickRef.current * 0.12) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (bossRef.current?.active && bossRef.current.phase === 'strike') {
        drawSpikedCannonball();
      } else if (player.invulnerable <= 0 || Math.floor(tickRef.current / 5) % 2 === 0) {
        drawSprite('player', player.x, player.y, player.overclock > 0 ? 66 : 60, Math.atan2(player.vy, player.vx || 1) * 0.08);
      }

      floatingTextRef.current.forEach((text) => {
        ctx.globalAlpha = Math.min(1, text.life / 18);
        ctx.fillStyle = text.color;
        ctx.font = '900 15px Space Grotesk, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text.text, text.x, text.y);
      });
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;

      ctx.restore();

      ctx.fillStyle = 'rgba(255,255,255,0.74)';
      roundRect(ctx, 18, 18, 318, 52, 20);
      ctx.fill();
      ctx.fillStyle = '#20302D';
      ctx.font = '900 13px Space Grotesk, monospace';
      ctx.fillText(`LVL ${levelRef.current}  COMBO x${comboRef.current.toFixed(1)}  DASH ${playerRef.current.dashCooldown <= 0 ? 'READY' : 'CHARGING'}`, 36, 49);

      ctx.fillStyle = 'rgba(32,48,45,0.62)';
      ctx.font = '700 12px Space Grotesk, monospace';
      ctx.fillText('route to the core // collect orbs // dash through gaps // flame nova deletes everything it touches', 24, gameHeight - 24);

      drawBossOverlay();
      if (bossRef.current?.active && bossRef.current.phase === 'strike') {
        drawSpikedCannonball();
      }

      if (!runningRef.current) {
        drawOverlay(scoreRef.current > 0 ? 'BREACH COMPLETE?' : 'SIGNAL BREACH', scoreRef.current > 0 ? 'hit start run to chase the next best score' : 'start run // WASD or drag // Space for dash');
      } else if (pausedRef.current) {
        drawOverlay('PAUSED', 'press P or resume run');
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    reset();
    draw();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const canvasPointer = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: ((event.clientX - rect.left) / rect.width) * gameWidth,
      y: ((event.clientY - rect.top) / rect.height) * gameHeight,
      active: true,
    };
  };

  return (
    <section id="signal-breach" className="relative border-y border-[#8fb8aa]/20 bg-[#f9f3e4]/82 px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="reveal-up mb-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#6f924c]">Custom game</p>
            <h2 className="mt-5 font-display text-4xl font-black uppercase leading-none text-[#20302d] md:text-6xl">Signal Breach</h2>
          </div>
          <p className="max-w-3xl text-lg font-semibold leading-8 text-[#536963] lg:self-end">
            A 2.5D packet-running arcade game: dash through corrupted gates, stack combo, grab shields, trigger Flame Nova, and route signals before the system gets feral.
          </p>
        </div>

        <div
          ref={gameShellRef}
          className={`grid gap-4 ${fullscreen ? 'min-h-screen content-center bg-[#f9f3e4] p-4 lg:grid-cols-[1fr_340px]' : 'lg:grid-cols-[1fr_330px]'}`}
        >
          <div className="overflow-hidden rounded-[2rem] border border-[#8fb8aa]/22 bg-white/72 shadow-[0_30px_90px_rgba(75,95,88,0.16)]">
            <canvas
              ref={canvasRef}
              width={gameWidth}
              height={gameHeight}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                const now = performance.now();
                if (now - lastPointerDownRef.current < 280) dashQueuedRef.current = true;
                lastPointerDownRef.current = now;
                canvasPointer(event);
              }}
              onPointerMove={canvasPointer}
              onPointerUp={() => {
                pointerRef.current.active = false;
              }}
              className="aspect-[860/520] w-full touch-none"
              aria-label="Signal Breach canvas game"
            />
          </div>

          <aside className="soft-card grid content-between gap-4 rounded-[2rem] p-5">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <Gamepad2 className="text-[#43888c]" size={28} />
                <span className={`font-mono text-xs font-black uppercase tracking-[0.2em] ${running && !paused ? 'text-[#5f8a3f]' : 'text-[#b96658]'}`}>{running && !paused ? 'online' : paused ? 'paused' : 'standby'}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Metric label="score" value={String(score).padStart(5, '0')} />
                <Metric label="best" value={String(best).padStart(5, '0')} />
                <Metric label="level" value={String(level)} />
                <Metric label="lives" value={String(lives)} />
                <Metric label="combo" value={`x${combo.toFixed(1)}`} />
                <Metric label="routes" value={String(routes)} />
              </div>

              <div className="mt-5 grid gap-2">
                <p className="flex items-center gap-2 rounded-[1.1rem] border border-system-lime/24 bg-[#f7fff0]/70 px-3 py-2 text-xs font-bold leading-5 text-[#536963]">
                  <Zap size={15} className="text-[#6f924c]" />
                  Space / double tap = dash. Dash is tiny but sacred.
                </p>
                <p className="flex items-center gap-2 rounded-[1.1rem] border border-system-cyan/22 bg-[#f7fffb]/70 px-3 py-2 text-xs font-bold leading-5 text-[#536963]">
                  <Shield size={15} className="text-[#43888c]" />
                  Shields forgive one mistake. Overclock makes greed profitable.
                </p>
                <p className="flex items-center gap-2 rounded-[1.1rem] border border-[#ef6c42]/20 bg-[#fff4e8]/72 px-3 py-2 text-xs font-bold leading-5 text-[#536963]">
                  <Flame size={15} className="text-[#b94a36]" />
                  Flame Nova fires 360 degrees and burns every enemy it touches.
                </p>
                <p className="rounded-[1.1rem] border border-[#8d6b45]/18 bg-[#fff8eb]/76 px-3 py-2 text-xs font-bold leading-5 text-[#536963]">
                  Every 5 levels: type the boss word to trigger spiked cannonball mode and earn +1 life.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <button onClick={start} className="magnetic-button inline-flex h-12 items-center justify-center gap-3 rounded-full border border-system-lime/45 bg-system-lime/78 px-4 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#20302d]">
                <Play size={16} />
                Start run
              </button>
              <button onClick={togglePause} className="magnetic-button inline-flex h-12 items-center justify-center gap-3 rounded-full border border-system-cyan/35 bg-white/62 px-4 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#3d767b] hover:bg-system-cyan/70 hover:text-[#20302d]">
                <Pause size={16} />
                {paused ? 'Resume' : 'Pause'}
              </button>
              <button onClick={toggleFullscreen} className="magnetic-button inline-flex h-12 items-center justify-center gap-3 rounded-full border border-system-lime/35 bg-white/62 px-4 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#5f8a3f] hover:bg-system-lime/70 hover:text-[#20302d]">
                {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                {fullscreen ? 'Exit full' : 'Fullscreen'}
              </button>
              <button onClick={reset} className="magnetic-button inline-flex h-12 items-center justify-center gap-3 rounded-full border border-system-cyan/35 bg-white/62 px-4 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#3d767b] hover:bg-system-cyan/70 hover:text-[#20302d]">
                <RotateCcw size={16} />
                Restart
              </button>
              <button onClick={() => setMuted((value) => !value)} className="magnetic-button inline-flex h-12 items-center justify-center gap-3 rounded-full border border-system-cyan/35 bg-white/62 px-4 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#3d767b] hover:bg-system-cyan/70 hover:text-[#20302d]">
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                {muted ? 'Muted' : 'Sound on'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
