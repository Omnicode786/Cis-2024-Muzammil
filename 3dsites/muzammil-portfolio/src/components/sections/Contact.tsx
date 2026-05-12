import type { FormEvent } from 'react';
import { ArrowUpRight, Github, Linkedin, Mail, Send } from 'lucide-react';

const links = [
  { label: 'GitHub', href: 'https://github.com/', icon: Github },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: Linkedin },
  { label: 'Email', href: 'mailto:muzammil.alam@example.com', icon: Mail },
];

export default function Contact() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '');
    const email = String(form.get('email') || '');
    const idea = String(form.get('idea') || '');
    const subject = encodeURIComponent(`Portfolio inquiry from ${name || 'a visitor'}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${idea}`);
    window.location.href = `mailto:muzammil.alam@example.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="relative overflow-hidden border-t border-black bg-portfolio-ink px-5 py-24 text-white md:px-8 md:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-white/22" />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-portfolio-cyan">Contact</p>
          <h2 className="mt-6 font-display text-5xl font-black uppercase leading-none md:text-7xl">
            Bring the strange idea. I will make it usable.
          </h2>
          <p className="mt-8 max-w-2xl text-xl font-semibold leading-relaxed text-white/68">
            Portfolio sites, 3D landing pages, product dashboards, AI interfaces, and weird little tools that need a real sense of direction.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="inline-flex items-center gap-3 border border-white/28 px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:border-white hover:bg-white hover:text-black"
                >
                  <Icon size={17} />
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 border border-white/22 bg-white/[0.06] p-5 backdrop-blur-md md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-white/60">
              Name
              <input
                name="name"
                className="h-14 border border-white/22 bg-black/20 px-4 font-sans text-base font-semibold text-white outline-none transition-colors placeholder:text-white/28 focus:border-portfolio-signal"
                placeholder="Muzammil"
              />
            </label>
            <label className="grid gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-white/60">
              Email
              <input
                required
                name="email"
                type="email"
                className="h-14 border border-white/22 bg-black/20 px-4 font-sans text-base font-semibold text-white outline-none transition-colors placeholder:text-white/28 focus:border-portfolio-signal"
                placeholder="you@email.com"
              />
            </label>
          </div>

          <label className="grid gap-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-white/60">
            Project
            <textarea
              required
              name="idea"
              rows={7}
              className="resize-none border border-white/22 bg-black/20 p-4 font-sans text-base font-semibold leading-7 text-white outline-none transition-colors placeholder:text-white/28 focus:border-portfolio-signal"
              placeholder="Tell me what you want to build..."
            />
          </label>

          <button className="inline-flex h-14 items-center justify-center gap-3 border border-black bg-portfolio-signal px-5 font-mono text-xs font-black uppercase tracking-[0.18em] text-black shadow-[6px_6px_0_#fff] transition-transform duration-200 hover:-translate-y-1">
            Send inquiry
            <Send size={18} />
          </button>
        </form>
      </div>

      <footer className="mx-auto mt-20 flex max-w-7xl flex-col justify-between gap-4 border-t border-white/16 pt-8 font-mono text-xs font-black uppercase tracking-[0.18em] text-white/42 md:flex-row">
        <span>2026 Muzammil Alam</span>
        <a href="#top" className="inline-flex items-center gap-2 text-white transition-colors hover:text-portfolio-signal">
          Back to top
          <ArrowUpRight size={16} />
        </a>
      </footer>
    </section>
  );
}
