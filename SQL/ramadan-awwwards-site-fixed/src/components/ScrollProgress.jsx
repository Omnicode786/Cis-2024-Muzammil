import useScrollProgress from '../hooks/useScrollProgress';

export default function ScrollProgress() {
  const progress = useScrollProgress();

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-[60] h-[2px] bg-white/5">
      <div
        className="h-full origin-left bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.7)] transition-transform duration-150"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
