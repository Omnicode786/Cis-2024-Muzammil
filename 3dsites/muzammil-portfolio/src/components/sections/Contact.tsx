import type { FormEvent } from 'react';
import { ArrowUpRight, Github, Linkedin, Mail, Send } from 'lucide-react';

const socials = [
  { label: 'GitHub', href: 'https://github.com/Omnicode786', icon: Github },
  { label: 'LinkedIn', href: 'https://pk.linkedin.com/in/muzammil-mansoor-alam-644a763b5', icon: Linkedin },
  { label: 'Email', href: 'mailto:progamers5656@gmail.com', icon: Mail },
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
    window.location.href = `mailto:progamers5656@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-[#fff8eb] px-4 py-24 text-[#20302d] md:px-8 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(101,207,215,0.18),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(168,213,140,0.18),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.25),rgba(238,248,245,0.65))]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="reveal-up">
          <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#6f924c]">Final handshake</p>
          <h2 className="mt-6 font-display text-4xl font-black uppercase leading-none md:text-6xl">
            Let&apos;s build something that feels like it escaped 2035.
          </h2>
          <p className="mt-7 max-w-2xl text-lg font-semibold leading-8 text-[#536963]">
            Portfolio, product interface, AI layer, dashboard, security system, weird interactive thing, hardware/software idea - send it. Agar idea strange hai, aur bhi behtar.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a key={social.label} href={social.href} className="magnetic-button inline-flex items-center gap-3 rounded-full border border-system-cyan/35 bg-white/68 px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-[#3d767b] shadow-[0_14px_38px_rgba(75,95,88,0.08)] transition-colors hover:bg-system-cyan/70 hover:text-[#20302d]">
                  <Icon size={17} />
                  {social.label}
                </a>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="story-node soft-card grid gap-4 rounded-[2rem] p-5 md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-[#6c827c]">
              Name
              <input name="name" className="h-14 rounded-2xl border border-[#8fb8aa]/22 bg-white/72 px-4 font-sans text-base font-semibold text-[#20302d] outline-none transition-colors placeholder:text-[#7c8d87]/60 focus:border-system-lime" placeholder="Muzammil" />
            </label>
            <label className="grid gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-[#6c827c]">
              Email
              <input required name="email" type="email" className="h-14 rounded-2xl border border-[#8fb8aa]/22 bg-white/72 px-4 font-sans text-base font-semibold text-[#20302d] outline-none transition-colors placeholder:text-[#7c8d87]/60 focus:border-system-lime" placeholder="you@email.com" />
            </label>
          </div>

          <label className="grid gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-[#6c827c]">
            Build brief
            <textarea required name="idea" rows={7} className="resize-none rounded-2xl border border-[#8fb8aa]/22 bg-white/72 p-4 font-sans text-base font-semibold leading-7 text-[#20302d] outline-none transition-colors placeholder:text-[#7c8d87]/60 focus:border-system-lime" placeholder="Tell me what system we are building..." />
          </label>

          <button className="magnetic-button inline-flex h-14 items-center justify-center gap-3 rounded-full border border-system-lime/50 bg-system-lime/76 px-5 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#20302d]">
            Send transmission
            <Send size={18} />
          </button>
        </form>
      </div>

      <footer className="relative mx-auto mt-20 flex max-w-7xl flex-col justify-between gap-4 border-t border-[#8fb8aa]/20 pt-8 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#6c827c] md:flex-row">
        <span>Muzammil Alam // NED CSE // Jaunt Solutions</span>
        <a href="#top" className="inline-flex items-center gap-2 text-[#3d767b] transition-colors hover:text-[#6f924c]">
          Return to command center
          <ArrowUpRight size={16} />
        </a>
      </footer>
    </section>
  );
}
