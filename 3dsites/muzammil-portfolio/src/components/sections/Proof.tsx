import { Activity, Code2, HeartHandshake, Lightbulb } from 'lucide-react';

const logs = [
  'I am not trying to become a normal developer. Normal is fine. It is just not the goal.',
  'I want to build things that feel like systems, not isolated screens.',
  'The dream is simple: understand the machine deeply, then make the interface feel like magic.',
];

export default function Proof() {
  return (
    <section className="relative border-y border-cyan-300/15 bg-[#071017] px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-12">
        <div className="reveal-up border border-cyan-300/20 bg-cyan-300/[0.045] p-6 lg:col-span-5">
          <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-lime-300">Manifesto log</p>
          <h2 className="mt-6 font-display text-4xl font-black uppercase leading-none text-white md:text-6xl">
            Slightly chaotic genius energy, but make it useful.
          </h2>
          <p className="mt-7 text-lg font-semibold leading-8 text-cyan-50/64">
            I care about the future, but I also care about the boring details that make future things actually work.
          </p>
        </div>

        <div className="story-panel grid gap-4 lg:col-span-7">
          {logs.map((log, index) => (
            <article key={log} className="story-node border border-cyan-300/18 bg-black/40 p-5">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono text-xs font-black uppercase tracking-[0.22em] text-cyan-100/40">log 0{index + 1}</span>
                {[Activity, Code2, Lightbulb][index] ? (() => {
                  const Icon = [Activity, Code2, Lightbulb][index];
                  return <Icon size={22} className="text-cyan-200" />;
                })() : null}
              </div>
              <p className="text-xl font-semibold leading-9 text-cyan-50/78">{log}</p>
            </article>
          ))}

          <div className="story-node grid gap-4 border border-lime-300/20 bg-lime-300/10 p-5 sm:grid-cols-[auto_1fr]">
            <div className="grid h-14 w-14 place-items-center border border-lime-300/35 text-lime-200">
              <HeartHandshake size={25} />
            </div>
            <div>
              <h3 className="font-display text-3xl font-black uppercase text-white">Builder with founder energy</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-cyan-50/64">
                I like products, systems, interfaces, and business problems. Engineering becomes more interesting when it has a real world to collide with.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
