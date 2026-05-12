import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Gamepad2, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

type Entity = {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
};

const gameWidth = 860;
const gameHeight = 520;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function beep(type: 'collect' | 'hit' | 'start', muted: boolean) {
  if (muted) return;
  const audioWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  const AudioContextClass = window.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.type = type === 'hit' ? 'sawtooth' : 'sine';
  oscillator.frequency.value = type === 'collect' ? 760 : type === 'start' ? 420 : 130;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(type === 'hit' ? 0.08 : 0.05, context.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.2);
}

export default function SignalBreach() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const keysRef = useRef(new Set<string>());
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({ x: 120, y: 260, active: false });
  const playerRef = useRef<Entity>({ x: 120, y: 260, radius: 13, vx: 0, vy: 0 });
  const shardsRef = useRef<Entity[]>([]);
  const firewallsRef = useRef<Entity[]>([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);
  const tickRef = useRef(0);
  const runningRef = useRef(false);
  const mutedRef = useRef(false);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [running, setRunning] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(event.key)) {
        event.preventDefault();
        keysRef.current.add(event.key.toLowerCase());
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

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(93,255,232,0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= gameWidth; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gameHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= gameHeight; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(gameWidth, y);
        ctx.stroke();
      }
    };

    const spawnShard = () => {
      shardsRef.current.push({
        x: 120 + ((tickRef.current * 97) % 680),
        y: 70 + ((tickRef.current * 53) % 380),
        radius: 8,
        vx: 0,
        vy: 0,
      });
    };

    const spawnFirewall = () => {
      const speed = 1.2 + levelRef.current * 0.32;
      firewallsRef.current.push({
        x: gameWidth + 30,
        y: 50 + ((tickRef.current * 71) % 420),
        radius: 16 + ((tickRef.current * 13) % 18),
        vx: -speed,
        vy: Math.sin(tickRef.current) * 0.7,
      });
    };

    const draw = () => {
      tickRef.current += 1;
      ctx.clearRect(0, 0, gameWidth, gameHeight);
      const gradient = ctx.createLinearGradient(0, 0, gameWidth, gameHeight);
      gradient.addColorStop(0, '#041018');
      gradient.addColorStop(0.55, '#07120d');
      gradient.addColorStop(1, '#050810');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, gameWidth, gameHeight);
      drawGrid();

      ctx.fillStyle = 'rgba(186,255,92,0.08)';
      ctx.fillRect(gameWidth - 96, 0, 96, gameHeight);
      ctx.fillStyle = '#baff5c';
      ctx.font = '700 11px Space Grotesk, monospace';
      ctx.fillText('SERVER CORE', gameWidth - 86, 28);

      const player = playerRef.current;
      if (runningRef.current) {
        if (tickRef.current % Math.max(42, 112 - levelRef.current * 9) === 0) spawnFirewall();
        if (tickRef.current % 96 === 0 && shardsRef.current.length < 7) spawnShard();

        const left = keysRef.current.has('arrowleft') || keysRef.current.has('a');
        const right = keysRef.current.has('arrowright') || keysRef.current.has('d');
        const up = keysRef.current.has('arrowup') || keysRef.current.has('w');
        const down = keysRef.current.has('arrowdown') || keysRef.current.has('s');

        player.vx = (right ? 4.4 : 0) - (left ? 4.4 : 0);
        player.vy = (down ? 4.4 : 0) - (up ? 4.4 : 0);

        if (pointerRef.current.active) {
          player.vx += (pointerRef.current.x - player.x) * 0.045;
          player.vy += (pointerRef.current.y - player.y) * 0.045;
        }

        player.x = clamp(player.x + player.vx, 22, gameWidth - 22);
        player.y = clamp(player.y + player.vy, 22, gameHeight - 22);

        firewallsRef.current.forEach((wall) => {
          wall.x += wall.vx;
          wall.y += wall.vy;
        });
        firewallsRef.current = firewallsRef.current.filter((wall) => wall.x > -60);

        shardsRef.current = shardsRef.current.filter((shard) => {
          if (distance(player, shard) < player.radius + shard.radius + 2) {
            scoreRef.current += 75;
            setScore(scoreRef.current);
            beep('collect', mutedRef.current);
            if (scoreRef.current > levelRef.current * 450) {
              levelRef.current += 1;
              setLevel(levelRef.current);
            }
            return false;
          }
          return true;
        });

        firewallsRef.current.forEach((wall) => {
          if (distance(player, wall) < player.radius + wall.radius) {
            wall.x = -100;
            livesRef.current -= 1;
            setLives(livesRef.current);
            beep('hit', mutedRef.current);
            if (livesRef.current <= 0) {
              runningRef.current = false;
              setRunning(false);
            }
          }
        });

        if (player.x > gameWidth - 105) {
          scoreRef.current += 125;
          setScore(scoreRef.current);
          player.x = 120;
          player.y = 260;
          beep('collect', mutedRef.current);
        }
      }

      shardsRef.current.forEach((shard) => {
        ctx.beginPath();
        ctx.fillStyle = '#baff5c';
        ctx.shadowColor = '#baff5c';
        ctx.shadowBlur = 18;
        ctx.arc(shard.x, shard.y, shard.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      firewallsRef.current.forEach((wall) => {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,77,109,0.78)';
        ctx.strokeStyle = '#ff4d6d';
        ctx.lineWidth = 2;
        ctx.rect(wall.x - wall.radius, wall.y - wall.radius, wall.radius * 2, wall.radius * 2);
        ctx.fill();
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.fillStyle = '#5dffe8';
      ctx.shadowColor = '#5dffe8';
      ctx.shadowBlur = 24;
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.font = '700 12px Space Grotesk, monospace';
      ctx.fillText(runningRef.current ? 'route packets to the server core // avoid corrupted memory blocks' : 'press start // route the signal // survive the breach', 24, gameHeight - 24);

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const reset = () => {
    playerRef.current = { x: 120, y: 260, radius: 13, vx: 0, vy: 0 };
    shardsRef.current = [
      { x: 320, y: 160, radius: 8, vx: 0, vy: 0 },
      { x: 560, y: 350, radius: 8, vx: 0, vy: 0 },
    ];
    firewallsRef.current = [];
    scoreRef.current = 0;
    livesRef.current = 3;
    levelRef.current = 1;
    tickRef.current = 0;
    setScore(0);
    setLives(3);
    setLevel(1);
  };

  const start = () => {
    reset();
    runningRef.current = true;
    setRunning(true);
    beep('start', mutedRef.current);
  };

  const canvasPointer = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: ((event.clientX - rect.left) / rect.width) * gameWidth,
      y: ((event.clientY - rect.top) / rect.height) * gameHeight,
      active: true,
    };
  };

  return (
    <section id="signal-breach" className="relative border-y border-cyan-300/15 bg-black/80 px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="reveal-up mb-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-lime-300">Custom game</p>
            <h2 className="mt-5 font-display text-4xl font-black uppercase leading-none text-white md:text-6xl">Signal Breach</h2>
          </div>
          <p className="max-w-3xl text-lg font-semibold leading-8 text-cyan-50/65 lg:self-end">
            Route the packet into the server core, collect green checksum shards, and avoid corrupted memory blocks. Of course a systems engineer made this.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden border border-cyan-300/20 bg-[#041018] shadow-[0_0_80px_rgba(93,255,232,0.1)]">
            <canvas
              ref={canvasRef}
              width={gameWidth}
              height={gameHeight}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
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

          <aside className="grid content-between gap-4 border border-cyan-300/20 bg-cyan-300/[0.045] p-5">
            <div>
              <div className="mb-8 flex items-center justify-between">
                <Gamepad2 className="text-cyan-200" size={28} />
                <span className={`font-mono text-xs font-black uppercase tracking-[0.2em] ${running ? 'text-lime-300' : 'text-red-300'}`}>{running ? 'online' : 'standby'}</span>
              </div>

              <div className="grid gap-3">
                <Metric label="score" value={String(score).padStart(4, '0')} />
                <Metric label="lives" value={String(lives)} />
                <Metric label="level" value={String(level)} />
              </div>

              <p className="mt-6 text-sm font-semibold leading-7 text-cyan-50/58">
                Controls: WASD, arrow keys, or drag/touch on the canvas. Difficulty increases as your score climbs.
              </p>
            </div>

            <div className="grid gap-3">
              <button onClick={start} className="inline-flex h-12 items-center justify-center gap-3 border border-lime-300/35 bg-lime-300 px-4 font-mono text-xs font-black uppercase tracking-[0.18em] text-black">
                <Play size={16} />
                Start run
              </button>
              <button onClick={reset} className="inline-flex h-12 items-center justify-center gap-3 border border-cyan-300/25 px-4 font-mono text-xs font-black uppercase tracking-[0.18em] text-cyan-100 hover:bg-cyan-300 hover:text-black">
                <RotateCcw size={16} />
                Restart
              </button>
              <button onClick={() => setMuted((value) => !value)} className="inline-flex h-12 items-center justify-center gap-3 border border-cyan-300/25 px-4 font-mono text-xs font-black uppercase tracking-[0.18em] text-cyan-100 hover:bg-cyan-300 hover:text-black">
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-cyan-300/15 bg-black/35 p-4">
      <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/38">{label}</p>
      <p className="mt-2 font-display text-3xl font-black uppercase text-white">{value}</p>
    </div>
  );
}
