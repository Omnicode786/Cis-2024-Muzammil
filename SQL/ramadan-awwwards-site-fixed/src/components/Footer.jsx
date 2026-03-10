export default function Footer() {
  return (
    <footer className="relative z-20 border-t border-white/10 bg-slate-950/60 px-6 py-8 backdrop-blur-xl md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-2xl tracking-[0.25em] text-slate-50">RAMADAN KAREEM</p>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            A calm, cinematic educational experience built with React, R3F, Framer Motion, TailwindCSS, and GLSL shaders.
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          Designed for immersive storytelling
        </p>
      </div>
    </footer>
  );
}
