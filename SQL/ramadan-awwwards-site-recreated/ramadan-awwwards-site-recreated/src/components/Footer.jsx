export default function Footer() {
  return (
    <footer className="footer-safe-area relative z-20 px-6 py-8 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-bg-soft)] px-6 py-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-2xl tracking-[0.25em] text-[var(--theme-text)]">RAMADAN KAREEM</p>
          <p className="mt-2 text-sm leading-7 text-[var(--theme-muted)]">
            A calmer, richer immersive experience with a detailed moon, atmospheric skies, theme modes, and an interactive waterline.
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.4em] text-[var(--theme-subtle)]">
          Designed for immersive storytelling
        </p>
      </div>
    </footer>
  );
}
