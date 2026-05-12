import type { FormEvent } from 'react';
import { ArrowUpRight, Github, Linkedin, Mail, Send } from 'lucide-react';

const socials = [
  { label: 'GitHub', href: 'https://github.com/Omnicode786', icon: Github },
  { label: 'LinkedIn', href: 'https://pk.linkedin.com/in/muzammil-mansoor-alam-644a763b5', icon: Linkedin },
  { label: 'Email', href: 'mailto:muzammil.alam@example.com', icon: Mail },
];

export default function Contact() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '');
    const email = String(form.get('email') || '');
    const idea = String(form.get('idea') || '');
    const subject = encodeURIComponent(`Systems build inquiry from ${name || 'a visitor'}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${idea}`);
    window.location.href = `mailto:muzammil.alam@example.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-[#030609] px-4 py-24 text-white md:px-8 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(93,255,232,0.12),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(186,255,92,0.1),transparent_26%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="reveal-up">
          <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-lime-300">Final handshake</p>
          <h2 className="mt-6 font-display text-4xl font-black uppercase leading-none md:text-6xl">
            Let&apos;s build something that feels like it escaped 2035.
          </h2>
          <p className="mt-7 max-w-2xl text-lg font-semibold leading-8 text-cyan-50/65">
            Portfolio, product interface, AI layer, dashboard, security system, weird interactive thing, hardware/software idea — send it. Agar idea strange hai, aur bhi behtar.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a key={social.label} href={social.href} className="inline-flex items-center gap-3 border border-cyan-300/25 px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-cyan-100 transition-colors hover:bg-cyan-300 hover:text-black">
                  <Icon size={17} />
                  {social.label}
                </a>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="story-node grid gap-4 border border-cyan-300/20 bg-cyan-300/[0.045] p-5 backdrop-blur-xl md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-cyan-100/55">
              Name
              <input name="name" className="h-14 border border-cyan-300/20 bg-black/30 px-4 font-sans text-base font-semibold text-white outline-none transition-colors placeholder:text-cyan-100/30 focus:border-lime-300" placeholder="Muzammil" />
            </label>
            <label className="grid gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-cyan-100/55">
              Email
              <input required name="email" type="email" className="h-14 border border-cyan-300/20 bg-black/30 px-4 font-sans text-base font-semibold text-white outline-none transition-colors placeholder:text-cyan-100/30 focus:border-lime-300" placeholder="you@email.com" />
            </label>
          </div>

          <label className="grid gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-cyan-100/55">
            Build brief
            <textarea required name="idea" rows={7} className="resize-none border border-cyan-300/20 bg-black/30 p-4 font-sans text-base font-semibold leading-7 text-white outline-none transition-colors placeholder:text-cyan-100/30 focus:border-lime-300" placeholder="Tell me what system we are building..." />
          </label>

          <button className="magnetic-button inline-flex h-14 items-center justify-center gap-3 border border-lime-300/40 bg-lime-300 px-5 font-mono text-xs font-black uppercase tracking-[0.18em] text-black">
            Send transmission
            <Send size={18} />
          </button>
        </form>
      </div>

      <footer className="relative mx-auto mt-20 flex max-w-7xl flex-col justify-between gap-4 border-t border-cyan-300/15 pt-8 font-mono text-xs font-black uppercase tracking-[0.18em] text-cyan-100/38 md:flex-row">
        <span>Muzammil Alam // NED CSE // Jaunt Solutions</span>
        <a href="#top" className="inline-flex items-center gap-2 text-cyan-100 transition-colors hover:text-lime-300">
          Return to command center
          <ArrowUpRight size={16} />
        </a>
      </footer>
    </section>
  );
}
